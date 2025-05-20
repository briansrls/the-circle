import React from 'react';
import type { AppAgentConfig, Circle } from '../App'; // Need this for agent names and circles
import { AIType } from '../../src/proto/agent_static.js'; // Import AIType for labels
import { Text } from '@mantine/core'; // Import Mantine Text
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown

// Placeholder type - will be replaced or augmented
interface Message {
  id: string;
  agentName: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  roundNum?: number;
  subRole?: 'thinking-prompt'; // Ensure interface matches App.tsx
  agentId?: string; // Ensure interface matches App.tsx
  model?: string | null; // Ensure interface matches App.tsx
  aiType?: AIType | null; // Ensure interface matches App.tsx
  circleId?: string; // Add circleId if not already present and typed
}

interface ChatDisplayProps {
  messages: Message[];
  thinkingAgentId: string | null; // Add prop for thinking agent ID
  agents: AppAgentConfig[]; // Add prop for agent list to get names
  circles?: Circle[]; // Ensure this is optional if App.tsx might not pass it (e.g. for Judge tab)
}

// Define a list of pastel color pairs for agent bubbles
const agentColorPairs = [
  { background: '#d1f0d1', text: '#1b2e1b' }, // Default Assistant Green
  { background: '#e1d1f0', text: '#2c1b2e' }, // Pastel Purple
  { background: '#f0e1d1', text: '#413316' }, // Pastel Orange/Brown
  { background: '#d1eaf0', text: '#1b2a2e' }, // Pastel Cyan
  { background: '#f0d1dc', text: '#2e1b24' }, // Pastel Pink
  // Add more pairs if you expect more agents
];

// Prepare AI Type options for labels (copied from AgentConfigForm, could be refactored)
const aiTypeOptions = [
  { value: '0', label: 'OPENAI' },
  { value: '1', label: 'GEMINI' },
  { value: '2', label: 'CLAUDE' },
];

const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages, thinkingAgentId, agents, circles }) => {
  const agentIndexMap = new Map(agents.map((agent, index) => [agent.id, index]));
  const circleNameMap = new Map(circles?.map(circle => [circle.id, circle.name]));

  if (!messages || messages.length === 0 && !thinkingAgentId) {
    return <p>No messages yet. Start a chat!</p>;
  }

  return (
    <div className="chat-display">
      {messages.map((msg) => {
        const isJudgeOutputMessage = msg.circleId === "judge-output";
        const isJudgeAgentMessage = msg.agentId === "judge-agent"; // Alternative check if circleId isn't always judge-output for judge

        const bubbleClasses = [
          'message-bubble',
          `message-${msg.role}`,
          msg.subRole ? `message-${msg.subRole}` : '',
          (isJudgeOutputMessage || isJudgeAgentMessage) && msg.role === 'assistant' ? 'message-judge-assistant' : '',
          (isJudgeOutputMessage || isJudgeAgentMessage) && msg.role === 'system' ? 'message-judge-system' : '',
        ].filter(Boolean).join(' ');

        let bubbleStyle = {};
        if (msg.role === 'assistant' && msg.agentId && !(isJudgeOutputMessage || isJudgeAgentMessage)) {
          const agentIndex = agentIndexMap.get(msg.agentId);
          if (agentIndex !== undefined) {
            const colorPair = agentColorPairs[agentIndex % agentColorPairs.length];
            bubbleStyle = {
              backgroundColor: colorPair.background,
              color: colorPair.text,
            };
          }
        }

        const aiTypeLabel = msg.aiType !== undefined && msg.aiType !== null
          ? aiTypeOptions.find(opt => opt.value === String(msg.aiType))?.label || `Type ${msg.aiType}`
          : null;

        const circleName = !(isJudgeOutputMessage || isJudgeAgentMessage) && msg.circleId ? circleNameMap.get(msg.circleId) : null;
        const displayAgentName = circleName ? `${circleName} - ${msg.agentName}` : msg.agentName;

        return (
          <div key={msg.id} className={bubbleClasses} style={bubbleStyle}>
            <strong>
              {displayAgentName}
              {msg.roundNum && !(isJudgeOutputMessage || isJudgeAgentMessage) && <span style={{ fontWeight: 'normal', marginLeft: '8px' }}>(R{msg.roundNum})</span>}
            </strong>
            {(msg.role === 'assistant') && (msg.model || aiTypeLabel) && (
              <Text size="xs" c="dimmed" mt={-4} mb={4} className="message-meta">
                {aiTypeLabel ? `${aiTypeLabel}` : ''}{msg.model && aiTypeLabel ? ' / ' : ''}{msg.model ? `${msg.model}` : ''}
              </Text>
            )}
            {msg.role === 'assistant' ? (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            ) : (
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
            )}
            <small>{msg.timestamp.toLocaleTimeString()}</small>
          </div>
        );
      })}

      {thinkingAgentId && (() => {
        const agentInfo = agents.find(a => a.id === thinkingAgentId);
        const isJudgeThinking = thinkingAgentId === "judge-agent"; // Hardcoded ID for the judge

        let thinkingStyle = {};
        let thinkingBubbleClasses = ['message-bubble', 'message-assistant', 'message-thinking'];

        if (isJudgeThinking) {
          thinkingBubbleClasses.push('message-judge-assistant');
        } else if (agentInfo) {
          const agentIndex = agentIndexMap.get(thinkingAgentId);
          if (agentIndex !== undefined) {
            const colorPair = agentColorPairs[agentIndex % agentColorPairs.length];
            thinkingStyle = { backgroundColor: colorPair.background, color: colorPair.text };
          }
        }

        const displayThinkingAgentName = isJudgeThinking
          ? (agentInfo?.name || 'Judge')
          : (agents.find(a => a.id === thinkingAgentId)?.name || `Agent...`);

        // Add circle prefix for non-judge thinking agent
        let finalThinkingName = displayThinkingAgentName;
        if (!isJudgeThinking && circles && agentInfo) {
          const parentCircle = circles.find(c => c.agents.some(a => a.id === thinkingAgentId));
          if (parentCircle) finalThinkingName = `${parentCircle.name} - ${agentInfo.name}`;
        }

        const thinkingAiTypeLabel = agentInfo?.aiType !== undefined && agentInfo?.aiType !== null
          ? aiTypeOptions.find(opt => opt.value === String(agentInfo.aiType))?.label || `Type ${agentInfo.aiType}`
          : null;

        return (
          <div key="thinking-indicator" className={thinkingBubbleClasses.join(' ')} style={thinkingStyle}>
            <strong>{finalThinkingName}</strong>
            {agentInfo?.model && thinkingAiTypeLabel && (
              <Text size="xs" c="dimmed" mt={-4} mb={4} className="message-meta">
                {thinkingAiTypeLabel ? `${thinkingAiTypeLabel}` : ''}{agentInfo?.model && thinkingAiTypeLabel ? ' / ' : ''}{agentInfo?.model ? `${agentInfo.model}` : ''}
              </Text>
            )}
            <div className="thinking-dots"><span></span><span></span><span></span></div>
          </div>
        );
      })()}
    </div>
  );
};

export default ChatDisplay;
