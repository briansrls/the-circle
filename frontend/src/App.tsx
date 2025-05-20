import { useState, useCallback } from 'react';
// Use AgentConfig as suggested by the linter hint
import { AgentConfig, AIType } from '../src/proto/agent_static.js';
import './App.css'; // We can keep this for now for basic styling
import { agentTelephone, callGeminiApi } from './services/chatService'; // Import the service and callGeminiApi
import { MantineProvider, Paper, Group, TextInput, NumberInput, Button, Title, ActionIcon, AppShell, Textarea, FileInput, Loader, Text, Tabs } from '@mantine/core'; // Import Mantine components including Title, ActionIcon, AppShell, FileInput, Loader, Text, Tabs
import { useDisclosure } from '@mantine/hooks'; // Hook for modal open/close
import { extractTextFromFile } from './utils/fileUtils'; // Import the utility

import AgentConfigForm from './components/AgentConfigForm';
import ChatDisplay from './components/ChatDisplay';
import SettingsModal from './components/SettingsModal'; // Uncomment import
import ProgressDisplay from './components/ProgressDisplay'; // Import ProgressDisplay

// Define AppAgentConfig as a plain interface with all necessary fields
// It should match the structure of AgentConfig data fields + our own fields.
export interface AppAgentConfig {
  id: string;
  name?: string | null;
  systemPrompt?: string | null; // Protobuf fields are optional
  seedContent?: string | null;    // Changed from seedFile to seedContent
  model?: string | null;
  aiType?: AIType | null;       // Use the AIType enum
}

// Message no longer needs circleId if messages are nested in Circle
export interface Message {
  id: string;
  agentName: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  roundNum?: number;
  subRole?: 'thinking-prompt';
  agentId?: string;
  model?: string | null;
  aiType?: AIType | null;
  // circleId?: string; // REMOVE if messages are per-circle
}

// Circle now holds its own messages
export interface Circle {
  id: string;
  name: string;
  agents: AppAgentConfig[];
  messages: Message[]; // Messages for this circle
  finalOutput?: string | null;
  isRunning?: boolean;
  error?: string | null;
  messagesSentInCurrentRun?: number; // For progress tracking
  totalMessagesInCurrentRun?: number; // For progress tracking
}

// Type for global API keys state
export type ApiKeys = { [key in AIType]?: string };

const NEW_DEFAULT_GEMINI_MODEL = "gemini-2.5-pro-preview-03-25";

// Function to create a new default agent - now takes circleName
const createDefaultAgent = (agentNumber: number, circleName: string): AppAgentConfig => ({
  id: `agent-${Date.now()}-${circleName.replace(/\s+/g, '-')}-${agentNumber}`,
  name: `Agent ${agentNumber} (in ${circleName})`, // Include circle name in agent name
  systemPrompt: "You are a helpful assistant.",
  model: NEW_DEFAULT_GEMINI_MODEL,
  aiType: AIType.GEMINI,
  seedContent: null,
});

// Initial state: one circle with two agents
const initialCircleName = "Circle 1";
const initialCircles: Circle[] = [
  {
    id: `circle-${Date.now()}`,
    name: initialCircleName,
    agents: [createDefaultAgent(1, initialCircleName), createDefaultAgent(2, initialCircleName)],
    messages: [],
    messagesSentInCurrentRun: 0,
    totalMessagesInCurrentRun: 0,
  }
];

// Judge Agent Configuration (can be made more dynamic later)
const defaultJudgeConfig: AppAgentConfig = {
  id: "judge-agent",
  name: "Judge",
  systemPrompt: "You are a judge. Review the following submissions from different thought circles and select the best one, or synthesize them into a single, superior response. Clearly state your reasoning and the final chosen/synthesized output.",
  model: NEW_DEFAULT_GEMINI_MODEL,
  aiType: AIType.GEMINI,
};

function App() {
  const [circles, setCircles] = useState<Circle[]>(initialCircles);
  const [judgeAgentConfig, setJudgeAgentConfig] = useState<AppAgentConfig>(defaultJudgeConfig);
  const [judgeMessages, setJudgeMessages] = useState<Message[]>([]); // Separate messages for the Judge
  const [activeTab, setActiveTab] = useState<string | null>(initialCircles[0]?.id || "judge-output"); // Initialize activeTab
  const [initialPrompt, setInitialPrompt] = useState<string>("Agent 1, begin...");
  const [numberOfRounds, setNumberOfRounds] = useState<number>(2);
  const [isChatRunning, setIsChatRunning] = useState<boolean>(false);
  const [thinkingAgentId, setThinkingAgentId] = useState<string | null>(null);
  const [sharedContext, setSharedContext] = useState<string>("");
  const [sharedContextFileName, setSharedContextFileName] = useState<string | null>(null);
  const [isParsingSharedFile, setIsParsingSharedFile] = useState<boolean>(false);
  const [sharedFileParseError, setSharedFileParseError] = useState<string | null>(null);

  // State for settings modal and API Keys
  const [settingsModalOpened, { open: openSettingsModal, close: closeSettingsModal }] = useDisclosure(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    // Initialize from .env variables
    const initialKeys: ApiKeys = {};
    // Correctly read the default Gemini key env variable
    const geminiKey = import.meta.env.VITE_DEFAULT_GEMINI_API_KEY as string;
    // Suggest using VITE_OPENAI_API_KEY for OpenAI if added to .env
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY as string;

    if (geminiKey) initialKeys[AIType.GEMINI] = geminiKey;
    if (openaiKey) initialKeys[AIType.OPENAI] = openaiKey;
    // Add others here if needed
    return initialKeys;
  });

  // Handler to update API keys from modal
  const handleApiKeysChange = (newKeys: ApiKeys) => {
    setApiKeys(newKeys);
  };

  // --- Circle and Agent Management Handlers ---
  const handleAddCircle = () => {
    const newCircleNumber = circles.length + 1;
    const newCircleName = `Circle ${newCircleNumber}`;
    const newCircleId = `circle-${Date.now()}`;
    const newCircle = {
      id: newCircleId,
      name: newCircleName,
      agents: [createDefaultAgent(1, newCircleName)],
      messages: [],
      messagesSentInCurrentRun: 0,
      totalMessagesInCurrentRun: 0,
    };
    setCircles(prev => [...prev, newCircle]);
    // If no tab is active or only judge tab exists and it's active, switch to the new circle
    if (!activeTab || (activeTab === "judge-output" && circles.length === 0)) {
      setActiveTab(newCircleId);
    }
  };

  const handleRemoveCircle = (circleId: string) => {
    setCircles(prev => prev.filter(c => c.id !== circleId));
  };

  const handleUpdateCircleName = (circleId: string, newName: string) => {
    setCircles(prev => prev.map(c => c.id === circleId ? { ...c, name: newName } : c));
  };

  const handleAddAgentToCircle = (circleId: string) => {
    setCircles(prev => prev.map(c => {
      if (c.id === circleId) {
        // Use the circle's current name for the new agent
        return { ...c, agents: [...c.agents, createDefaultAgent(c.agents.length + 1, c.name)] };
      }
      return c;
    }));
  };

  const handleRemoveAgentFromCircle = (circleId: string, agentId: string) => {
    setCircles(prev => prev.map(c => {
      if (c.id === circleId) {
        return { ...c, agents: c.agents.filter(a => a.id !== agentId) };
      }
      return c;
    }));
  };

  const handleUpdateAgentInCircle = (circleId: string, updatedAgent: AppAgentConfig) => {
    setCircles(prev => prev.map(c => {
      if (c.id === circleId) {
        return { ...c, agents: c.agents.map(a => a.id === updatedAgent.id ? updatedAgent : a) };
      }
      return c;
    }));
  };

  const handleSharedContextFileChange = async (file: File | null) => {
    setSharedContext("");
    setSharedContextFileName(null);
    setSharedFileParseError(null);

    if (file) {
      setSharedContextFileName(file.name);
      setIsParsingSharedFile(true);
      try {
        const textContent = await extractTextFromFile(file);
        setSharedContext(textContent);
      } catch (error: any) {
        console.error("Error reading shared context file:", error);
        setSharedFileParseError(`Error: ${error?.message || 'Failed to parse file'}`);
        // setSharedContextFileName(`Error: ${file.name}`); // Keep original name, error is shown in FileInput
      } finally {
        setIsParsingSharedFile(false);
      }
    } else {
      setIsParsingSharedFile(false); // Also reset if file is cleared
    }
  };

  // Callback to update messages for a specific circle or the judge
  const onMessageUpdateCallback = useCallback((newMessage: Message, targetId: string /* circleId or 'judge' */) => {
    if (targetId === 'judge-output') {
      setJudgeMessages(prev => [...prev, newMessage]);
    } else {
      setCircles(prevCircles =>
        prevCircles.map(circle =>
          circle.id === targetId ? { ...circle, messages: [...circle.messages, newMessage] } : circle
        )
      );
    }
  }, []); // useCallback to stabilize this function

  const handleStartChat = async () => {
    if (circles.some(c => c.agents.length === 0) || initialPrompt.trim() === "") return;
    setIsChatRunning(true);
    setThinkingAgentId(null);
    setJudgeMessages([]); // Clear previous judge messages
    setCircles(prev => prev.map(c => ({
      ...c,
      messages: [],
      finalOutput: null,
      error: null,
      isRunning: true,
      messagesSentInCurrentRun: 0,
      totalMessagesInCurrentRun: c.agents.length * numberOfRounds
    })));
    // Ensure activeTab is set to the first circle if no tab is selected before starting
    if (!activeTab && circles.length > 0) {
      setActiveTab(circles[0].id);
    }

    console.log("Starting multi-circle chat...");

    const circlePromises = circles.map(circle =>
      agentTelephone(
        circle.agents,
        initialPrompt,
        numberOfRounds,
        (message) => onMessageUpdateCallback(message, circle.id),
        (finalOutput) => {
          console.log(`Circle ${circle.name} finished.`);
          setCircles(prev => prev.map(c => c.id === circle.id ? { ...c, finalOutput, isRunning: false } : c));
        },
        (agentId) => setThinkingAgentId(agentId),
        () => setThinkingAgentId(null),
        apiKeys,
        sharedContext,
        (messagesSent, totalMessages) => {
          setCircles(prevCircles =>
            prevCircles.map(c =>
              c.id === circle.id
                ? { ...c, messagesSentInCurrentRun: messagesSent, totalMessagesInCurrentRun: totalMessages }
                : c
            )
          );
        }
      ).catch(error => {
        console.error(`Error in circle ${circle.name}:`, error);
        setCircles(prev => prev.map(c => c.id === circle.id ? { ...c, error: String(error), isRunning: false } : c));
        onMessageUpdateCallback({
          id: `error-circle-${circle.id}-${Date.now()}`,
          agentName: `Circle ${circle.name} Error`,
          role: 'system',
          content: `Error: ${error instanceof Error ? error.message : String(error)}`,
          timestamp: new Date(),
        }, circle.id);
        return null;
      })
    );

    const circleResults = await Promise.all(circlePromises);
    console.log("All circles completed processing.");

    // --- Judge Step --- 
    if (circleResults.every(r => r !== null)) {
      const submissions = circles
        .filter(c => c.finalOutput)
        .map(c => `Submission from ${c.name}:\n${c.finalOutput}\n\n`);

      if (submissions.length > 0) {
        onMessageUpdateCallback({
          id: `judge-start-${Date.now()}`,
          agentName: judgeAgentConfig.name || "Judge",
          role: 'system',
          content: "Evaluating submissions...",
          timestamp: new Date(),
          // No circleId for judge-specific system messages, or use "judge-output"
        }, "judge-output");
        setThinkingAgentId(judgeAgentConfig.id);

        // UNCOMMENT Judge API Call Block
        const judgeMessages = [
          { role: 'user', content: `Here are the submissions from different thought circles:\n\n${submissions.join('---\n')}` }
        ];
        const judgeApiContents = judgeMessages.map(m => ({ role: m.role, parts: [{ text: m.content }] }));
        const judgeAiType = judgeAgentConfig.aiType === undefined || judgeAgentConfig.aiType === null ? AIType.GEMINI : judgeAgentConfig.aiType; // Ensure valid AIType for key lookup
        const judgeApiKey = apiKeys[judgeAiType];

        if (judgeApiKey && judgeAgentConfig.model && judgeAgentConfig.systemPrompt) { // Ensure all required fields are present
          try {
            const finalJudgment = await callGeminiApi(
              judgeApiKey,
              judgeAgentConfig.model, // Already string | null, ensure it's not null here
              judgeAgentConfig.systemPrompt, // Already string | null, ensure it's not null here
              judgeApiContents
            );
            onMessageUpdateCallback({
              id: `judge-final-${Date.now()}`,
              agentName: judgeAgentConfig.name || "Judge",
              role: 'assistant',
              content: finalJudgment,
              timestamp: new Date(),
            }, "judge-output");
          } catch (judgeError) {
            console.error("Judge agent error:", judgeError);
            onMessageUpdateCallback({
              id: `judge-error-${Date.now()}`,
              agentName: judgeAgentConfig.name || "Judge",
              role: 'system',
              content: `Judge error: ${judgeError instanceof Error ? judgeError.message : String(judgeError)}`,
              timestamp: new Date(),
            }, "judge-output");
          }
        } else {
          console.error("Judge agent API key, model, or system prompt not configured.");
          onMessageUpdateCallback({
            id: `judge-config-error-${Date.now()}`,
            agentName: judgeAgentConfig.name || "Judge",
            role: 'system',
            content: "Judge agent not fully configured (missing API key, model, or system prompt).",
            timestamp: new Date(),
          }, "judge-output");
        }
        setThinkingAgentId(null);
      }
    }
    setIsChatRunning(false);
  };

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Title order={3}>The Circle</Title> {/* Simplified Title */}
          <Button variant="default" size="sm" onClick={openSettingsModal}>
            Settings
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        {/* Progress Display */}
        <ProgressDisplay
          circles={circles}
          judgeConfig={judgeAgentConfig}
          isOverallChatRunning={isChatRunning}
          activeThinkingAgentId={thinkingAgentId}
        />

        <div className="main-content-area"> {/* Wrapper for config and chat */}
          <section className="config-section agent-circles-config">
            <Group justify="space-between" mb="sm">
              <Title order={3}>Circles</Title>
              <Button onClick={handleAddCircle} disabled={isChatRunning} size="xs" variant="light">
                Add Circle
              </Button>
            </Group>
            <div className="circle-list"> {/* Scrollable container for circles */}
              {circles.map(circle => (
                <Paper key={circle.id} p="xs" withBorder mb="sm" className="circle-config-item">
                  <Group justify="space-between">
                    <TextInput
                      value={circle.name}
                      onChange={(e) => handleUpdateCircleName(circle.id, e.currentTarget.value)}
                      variant="unstyled"
                      size="sm"
                      styles={{ input: { fontWeight: 500, fontSize: 'var(--mantine-font-size-md)' } }}
                    />
                    <Button onClick={() => handleRemoveCircle(circle.id)} size="xs" variant="subtle" color="red">Remove Circle</Button>
                  </Group>
                  <Button onClick={() => handleAddAgentToCircle(circle.id)} size="xs" variant="outline" mt="xs" mb="xs" fullWidth>
                    + Add Agent to {circle.name}
                  </Button>
                  <div className="agent-list-inner">
                    {circle.agents.map(agent => (
                      <AgentConfigForm
                        key={agent.id}
                        agent={agent}
                        onUpdate={(updatedAgent) => handleUpdateAgentInCircle(circle.id, updatedAgent)}
                        onRemove={() => handleRemoveAgentFromCircle(circle.id, agent.id)}
                      />
                    ))}
                  </div>
                </Paper>
              ))}
            </div>
            {/* Judge Agent Configuration - simplified for now */}
            <Paper p="xs" withBorder mt="lg" className="judge-config-item">
              <Title order={4} mb="xs">Judge Agent</Title>
              <Textarea
                label="Judge System Prompt"
                value={judgeAgentConfig.systemPrompt || ''}
                onChange={(e) => setJudgeAgentConfig(prev => ({ ...prev, systemPrompt: e.currentTarget.value }))}
                autosize minRows={2} maxRows={4} size="sm"
              />
              {/* Can add model/type select for judge later */}
            </Paper>
          </section>

          <section className="chat-display-section">
            <Title order={3} mb="sm">Chat Flow</Title>

            <Paper shadow="xs" p="sm" withBorder mb="md" className="shared-context-bar">
              <FileInput
                label="Shared Context / Base Document (Optional, .txt, .pdf, .docx)"
                placeholder={sharedContextFileName || "Upload shared file..."}
                onChange={handleSharedContextFileChange}
                accept=".txt,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" // Update accept
                clearable
                size="sm"
                rightSection={isParsingSharedFile ? <Loader size="xs" /> : null}
                error={sharedFileParseError}
                disabled={isParsingSharedFile || isChatRunning}
              />
              {sharedContext && !isParsingSharedFile && !sharedFileParseError && (
                <Text size="xs" c="dimmed" mt={4}>
                  Loaded {sharedContext.length} chars from: {sharedContextFileName}
                </Text>
              )}
            </Paper>

            <Paper shadow="xs" p="xs" withBorder mb="sm" className="top-controls-bar">
              <Group align="baseline" gap="xs">
                <TextInput
                  id="initialPrompt"
                  value={initialPrompt}
                  onChange={(e) => setInitialPrompt(e.currentTarget.value)}
                  placeholder="Enter initial prompt for the chain..."
                  style={{ flexGrow: 1 }}
                  disabled={isChatRunning}
                  size="sm"
                />
                <NumberInput
                  id="numberOfRounds"
                  value={numberOfRounds}
                  onChange={(value) => setNumberOfRounds(Math.max(1, Number(value) || 1))}
                  min={1}
                  style={{ width: '80px' }}
                  placeholder="Rounds"
                  disabled={isChatRunning}
                  size="sm"
                  aria-label="Number of Rounds"
                />
                <Button
                  onClick={handleStartChat}
                  disabled={circles.length === 0 || initialPrompt.trim() === "" || isChatRunning}
                  className={isChatRunning ? 'button-loading' : ''}
                  size="sm"
                >
                  {isChatRunning ? 'Chatting' : 'Start Chat Chain'}
                </Button>
              </Group>
            </Paper>

            <Tabs value={activeTab} onChange={setActiveTab} variant="pills" className="circle-tabs">
              <Tabs.List>
                {circles.map(circle => (
                  <Tabs.Tab key={circle.id} value={circle.id} disabled={isChatRunning && !circle.isRunning && !circle.finalOutput && !circle.error}>
                    {circle.name}{circle.isRunning ? " (Running...)" : (circle.error ? " (Error)" : (circle.finalOutput ? " (Done)" : ""))}
                  </Tabs.Tab>
                ))}
                <Tabs.Tab value="judge-output" key="judge-output-tab" disabled={isChatRunning && !circles.every(c => !c.isRunning)}>
                  Judge Output
                </Tabs.Tab>
              </Tabs.List>

              {circles.map(circle => (
                <Tabs.Panel key={circle.id} value={circle.id} pt="xs">
                  <ChatDisplay
                    messages={circle.messages}
                    thinkingAgentId={thinkingAgentId} // This still global, may need adjustment if per-circle thinking UI desired
                    agents={circle.agents} // Pass only agents for this circle
                  // circles prop might not be needed by ChatDisplay anymore if it shows one circle
                  />
                </Tabs.Panel>
              ))}
              <Tabs.Panel value="judge-output" key="judge-output-panel" pt="xs">
                <ChatDisplay
                  messages={judgeMessages}
                  thinkingAgentId={thinkingAgentId === judgeAgentConfig.id ? judgeAgentConfig.id : null}
                  agents={[judgeAgentConfig]}
                />
              </Tabs.Panel>
            </Tabs>
          </section>
        </div>

        <SettingsModal
          opened={settingsModalOpened}
          onClose={closeSettingsModal}
          apiKeys={apiKeys}
          onSave={handleApiKeysChange}
        />
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
