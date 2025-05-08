import React, { useState, useEffect } from 'react';
import { Modal, Stack, PasswordInput, Button, Title } from '@mantine/core';
import { AIType } from '../proto/agent_static.js';
import type { ApiKeys } from '../App'; // Import the type

interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
  apiKeys: ApiKeys;
  onSave: (newKeys: ApiKeys) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ opened, onClose, apiKeys, onSave }) => {
  const [localKeys, setLocalKeys] = useState<ApiKeys>({});

  // Sync local state when modal opens or external apiKeys change
  useEffect(() => {
    if (opened) {
      setLocalKeys(apiKeys);
    }
  }, [opened, apiKeys]);

  const handleChange = (aiType: AIType, value: string) => {
    setLocalKeys(currentKeys => ({ ...currentKeys, [aiType]: value }));
  };

  const handleSave = () => {
    onSave(localKeys);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="API Key Settings" centered>
      <Stack>
        <PasswordInput
          label="Gemini API Key"
          value={localKeys[AIType.GEMINI] || ''}
          onChange={(event) => handleChange(AIType.GEMINI, event.currentTarget.value)}
          placeholder="Enter Gemini API Key..."
        />
        <PasswordInput
          label="OpenAI API Key"
          value={localKeys[AIType.OPENAI] || ''}
          onChange={(event) => handleChange(AIType.OPENAI, event.currentTarget.value)}
          placeholder="Enter OpenAI API Key..."
        />
        {/* Add inputs for other AI types (e.g., Claude) here */}
        {/* 
        <PasswordInput
          label="Claude API Key"
          value={localKeys[AIType.CLAUDE] || ''}
          onChange={(event) => handleChange(AIType.CLAUDE, event.currentTarget.value)}
          placeholder="Enter Claude API Key..."
        /> 
        */}

        <Button onClick={handleSave} mt="md">Save Settings</Button>
      </Stack>
    </Modal>
  );
};

export default SettingsModal; 