import React from 'react';
import type { AppAgentConfig } from '../App'; // TYPE-ONLY IMPORT
import { AIType } from '../../src/proto/agent_static.js'; // Path to compiled proto
import { TextInput, Textarea, Select, PasswordInput, Button, Paper, Stack, Title, Group, Tooltip } from '@mantine/core';

// Remove the old placeholder AgentConfig interface if it's still here
// interface AgentConfig { ... }

interface AgentConfigFormProps {
  agent: AppAgentConfig;
  onUpdate: (updatedAgent: AppAgentConfig) => void;
  onRemove: (agentId: string) => void;
}

const defaultGeminiApiKeyFromEnv = import.meta.env.VITE_DEFAULT_GEMINI_API_KEY as string || "";
// Default seed content defined in App.tsx, but we can have a fallback placeholder text too
const defaultSeedContentPlaceholder = "This is some default seed content. You can edit or remove this.";

// Prepare AI Type options for Mantine Select
const aiTypeOptions = Object.keys(AIType)
  .filter(key => isNaN(Number(key))) // Filter out numeric keys
  .map(key => ({ value: String((AIType as any)[key]), label: key }));

const AgentConfigForm: React.FC<AgentConfigFormProps> = ({ agent, onUpdate, onRemove }) => {
  const handleSimpleChange = (name: keyof AppAgentConfig, value: any) => {
    onUpdate({ ...agent, [name]: value });
  };

  // Determine placeholder for API key
  const apiKeyPlaceholder = agent.aiType === AIType.GEMINI && defaultGeminiApiKeyFromEnv
    ? `Using default (******${defaultGeminiApiKeyFromEnv.slice(-4)})`
    : "Enter API Key if needed";

  return (
    <Paper shadow="xs" p="sm" mt="sm" withBorder>
      <Stack gap={0}>
        <Group justify="space-between">
          <Title order={5}>{agent.name || 'Unnamed Agent'}</Title>
          <Button
            variant="subtle"
            color="red"
            size="xs"
            onClick={() => onRemove(agent.id)}
            aria-label="Remove Agent"
          >
            Remove
          </Button>
        </Group>

        <TextInput
          label="Name"
          name="name"
          value={agent.name || ''}
          onChange={(e) => handleSimpleChange('name', e.currentTarget.value)}
          size="sm"
        />

        <Textarea
          label="System Prompt"
          name="systemPrompt"
          value={agent.systemPrompt || ''}
          onChange={(e) => handleSimpleChange('systemPrompt', e.currentTarget.value)}
          autosize
          minRows={2}
          maxRows={5}
          size="sm"
        />

        <Textarea
          label="Seed Content"
          name="seedContent"
          value={agent.seedContent || ''}
          onChange={(e) => handleSimpleChange('seedContent', e.currentTarget.value)}
          autosize
          minRows={2}
          maxRows={5}
          size="sm"
        />

        <Group grow>
          <TextInput
            label="Model"
            name="model"
            value={agent.model || ''}
            onChange={(e) => handleSimpleChange('model', e.currentTarget.value)}
            size="sm"
          />

          <Select
            label="AI Type"
            name="aiType"
            value={agent.aiType !== undefined && agent.aiType !== null ? String(agent.aiType) : null}
            onChange={(value) => handleSimpleChange('aiType', value ? parseInt(value, 10) : undefined)}
            data={aiTypeOptions}
            placeholder="-- Select --"
            clearable
            size="sm"
          />
        </Group>

        <PasswordInput
          label="API Key (Optional)"
          name="apiKey"
          value={agent.apiKey || ''}
          onChange={(e) => handleSimpleChange('apiKey', e.currentTarget.value)}
          placeholder={apiKeyPlaceholder}
          size="sm"
        />
      </Stack>
    </Paper>
  );
};

export default AgentConfigForm;