import React from 'react';
import type { AppAgentConfig } from '../App'; // Need this for agent names

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
}

interface ChatDisplayProps {
  messages: Message[];
  thinkingAgentId: string | null; // Add prop for thinking agent ID
  agents: AppAgentConfig[]; // Add prop for agent list to get names
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

const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages, thinkingAgentId, agents }) => {
  const thinkingAgent = agents.find(agent => agent.id === thinkingAgentId);

  // Create a map for quick agent index lookup
  const agentIndexMap = new Map(agents.map((agent, index) => [agent.id, index]));

  if (!messages || messages.length === 0) {
    return <p>No messages yet. Start a chat!</p>;
  }

  return (
    <div className="chat-display">
      {messages.map((msg) => {
        // Determine specific class based on role and subRole
        const bubbleClasses = [
          'message-bubble',
          `message-${msg.role}`,
          msg.subRole ? `message-${msg.subRole}` : '' // e.g., message-thinking-prompt
        ].filter(Boolean).join(' '); // Filter out empty strings and join

        let bubbleStyle = {};
        if (msg.role === 'assistant' && msg.agentId) {
          const agentIndex = agentIndexMap.get(msg.agentId);
          if (agentIndex !== undefined) {
            const colorPair = agentColorPairs[agentIndex % agentColorPairs.length];
            bubbleStyle = {
              backgroundColor: colorPair.background,
              color: colorPair.text,
            };
          }
        }

        return (
          <div key={msg.id} className={bubbleClasses} style={bubbleStyle}>
            <strong>
              {msg.agentName}
              {msg.roundNum && <span style={{ fontWeight: 'normal', marginLeft: '8px' }}>(R{msg.roundNum})</span>}
            </strong>
            <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
            <small>{msg.timestamp.toLocaleTimeString()}</small>
          </div>
        );
      })}

      {/* Render thinking indicator - Use the same color logic */}
      {thinkingAgentId && (() => {
        const agentIndex = agentIndexMap.get(thinkingAgentId);
        let thinkingStyle = {};
        if (agentIndex !== undefined) {
          const colorPair = agentColorPairs[agentIndex % agentColorPairs.length];
          thinkingStyle = {
            backgroundColor: colorPair.background,
            color: colorPair.text,
          };
        }
        return (
          <div key="thinking-indicator" className="message-bubble message-assistant message-thinking" style={thinkingStyle}>
            <strong>
              {thinkingAgent?.name || `Agent ${thinkingAgentId.substring(6, 10)}...`}
            </strong>
            <div className="thinking-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        );
      })()}

      {/* Display initial message if chat hasn't started and no one is thinking */}
      {messages.length === 0 && !thinkingAgentId && (
        <p>No messages yet. Start a chat!</p>
      )}
    </div>
  );
};

export default ChatDisplay;
