import { useState } from 'react';
// Use AgentConfig as suggested by the linter hint
import { AgentConfig, AIType } from '../src/proto/agent_static.js';
import './App.css'; // We can keep this for now for basic styling
import { agentTelephone } from './services/chatService'; // Import the service
import { MantineProvider, Paper, Group, TextInput, NumberInput, Button, Title, ActionIcon, AppShell } from '@mantine/core'; // Import Mantine components including Title, ActionIcon, AppShell
import { useDisclosure } from '@mantine/hooks'; // Hook for modal open/close

import AgentConfigForm from './components/AgentConfigForm';
import ChatDisplay from './components/ChatDisplay';
import SettingsModal from './components/SettingsModal'; // Uncomment import

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

export interface Message {
  id: string;
  agentName: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  roundNum?: number; // Add round number
  subRole?: 'thinking-prompt'; // Add sub-role for specific system messages
  agentId?: string; // Add agentId
  model?: string | null; // Add model
  aiType?: AIType | null; // Add aiType
}

// Type for global API keys state
export type ApiKeys = { [key in AIType]?: string };

const initialAgents: AppAgentConfig[] = [
  {
    id: `agent-${Date.now()}-1`,
    name: "Creative Writer",
    systemPrompt: "You are a creative writer, skilled in crafting engaging narratives and evocative descriptions. Focus on originality and flair.",
    model: "gemini-1.5-pro-latest",
    aiType: AIType.GEMINI,
    seedContent: null,
  },
  {
    id: `agent-${Date.now()}-2`,
    name: "Analytical Reviewer",
    systemPrompt: "You are an analytical reviewer, tasked with critically evaluating content for clarity, coherence, and logical consistency. Be precise and constructive.",
    model: "gemini-1.5-pro-latest",
    aiType: AIType.GEMINI,
    seedContent: null,
  }
];

function App() {
  const [agents, setAgents] = useState<AppAgentConfig[]>(initialAgents);
  const [messages, setMessages] = useState<Message[]>([]);
  const [initialPrompt, setInitialPrompt] = useState<string>("Agent 1, please begin by writing a short paragraph based on your seed content and system prompt. Agent 2, prepare to review.");
  const [numberOfRounds, setNumberOfRounds] = useState<number>(2);
  const [isChatRunning, setIsChatRunning] = useState<boolean>(false);
  const [thinkingAgentId, setThinkingAgentId] = useState<string | null>(null); // State for thinking agent

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

  const handleAddAgent = () => {
    const newAgent: AppAgentConfig = {
      id: `agent-${Date.now()}-${agents.length + 1}`,
      name: `Agent ${agents.length + 1}`,
      systemPrompt: "You are a helpful assistant.",
      model: "gemini-1.5-pro-latest",
      aiType: AIType.GEMINI,
      seedContent: null,
    };
    setAgents(prevAgents => [...prevAgents, newAgent]);
  };

  const handleUpdateAgent = (updatedAgent: AppAgentConfig) => {
    setAgents(prevAgents =>
      prevAgents.map(agent => agent.id === updatedAgent.id ? updatedAgent : agent)
    );
  };

  const handleRemoveAgent = (agentId: string) => {
    setAgents(prevAgents => prevAgents.filter(agent => agent.id !== agentId));
  };

  const handleStartChat = async () => {
    if (initialPrompt.trim() === "" || agents.length === 0) return;

    setIsChatRunning(true);
    setThinkingAgentId(null); // Reset thinking indicator
    setMessages([]);

    console.log("Starting chat chain with prompt:", initialPrompt, "for", numberOfRounds, "rounds");

    // Callbacks for chatService
    const onMessageUpdateCallback = (newMessage: Message) => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
    };
    const onAgentStartThinkingCallback = (agentId: string) => {
      setThinkingAgentId(agentId);
    };
    const onAgentEndThinkingCallback = () => { // No agentId needed, just clear it
      setThinkingAgentId(null);
    };
    const onChainCompleteCallback = (finalMessage: string) => {
      console.log("Chain finished. Final message context:", finalMessage);
      setIsChatRunning(false);
      setThinkingAgentId(null); // Ensure cleared on completion
      setMessages(prevMessages => [...prevMessages, {
        id: `msg-final-context-${Date.now()}`,
        agentName: "System (Final Context)",
        role: 'system',
        content: finalMessage,
        timestamp: new Date(),
      }]);
    };

    try {
      await agentTelephone(
        agents,
        initialPrompt,
        numberOfRounds,
        onMessageUpdateCallback,
        onChainCompleteCallback,
        onAgentStartThinkingCallback, // Pass new callbacks
        onAgentEndThinkingCallback,
        apiKeys // Pass the map
      );
    } catch (error) {
      console.error("Error during agentTelephone execution:", error);
      setMessages(prevMessages => [...prevMessages, {
        id: `msg-error-${Date.now()}`,
        agentName: "System Error",
        role: 'system',
        content: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date(),
      }]);
      setIsChatRunning(false);
      setThinkingAgentId(null); // Ensure cleared on error
    }
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
        <div className="main-content-area"> {/* Wrapper for config and chat */}
          <section className="config-section">
            <Group justify="space-between" mb="sm">
              <Title order={3}>Agents</Title>
              <Button onClick={handleAddAgent} disabled={isChatRunning} size="xs" variant="light">
                Add Agent
              </Button>
            </Group>
            <div className="agent-list"> {/* Scrollable container for agents */}
              {agents.map(agent => (
                <AgentConfigForm
                  key={agent.id}
                  agent={agent}
                  onUpdate={handleUpdateAgent}
                  onRemove={handleRemoveAgent}
                />
              ))}
            </div>
          </section>

          <section className="chat-display-section">
            <Title order={3} mb="sm">Chat Flow</Title>

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
                  disabled={agents.length === 0 || initialPrompt.trim() === "" || isChatRunning}
                  className={isChatRunning ? 'button-loading' : ''}
                  size="sm"
                >
                  {isChatRunning ? 'Chatting' : 'Start Chat Chain'}
                </Button>
              </Group>
            </Paper>

            <ChatDisplay messages={messages} thinkingAgentId={thinkingAgentId} agents={agents} />
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
