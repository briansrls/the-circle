import React, { useState } from 'react';
import type { AppAgentConfig } from '../App'; // TYPE-ONLY IMPORT
import { AIType } from '../../src/proto/agent_static.js'; // Path to compiled proto
import { TextInput, Textarea, Select, Button, Paper, Stack, Title, Group, FileInput, Text, Loader } from '@mantine/core';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import mammoth from 'mammoth';

// Type for PDF item (based on pdf.js structure)
// interface PdfTextItem { ... }

// Set workerSrc to the path relative to the public directory
GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

// Remove the old placeholder AgentConfig interface if it's still here
// interface AgentConfig { ... }

interface AgentConfigFormProps {
  agent: AppAgentConfig;
  onUpdate: (updatedAgent: AppAgentConfig) => void;
  onRemove: (agentId: string) => void;
}

// TEMPORARILY HARDCODE aiTypeOptions for debugging
const aiTypeOptions = [
  { value: '0', label: 'OPENAI' },
  { value: '1', label: 'GEMINI' },
  { value: '2', label: 'CLAUDE' },
];
/* Original calculation commented out:
const aiTypeOptions = Object.keys(AIType)
  .filter(key => isNaN(Number(key)))
  .map(key => ({ value: String((AIType as any)[key]), label: key }));
*/

// Define specific models for Gemini - temporarily remove grouping
const geminiModelOptions = [
  { value: 'gemini-1.5-pro-latest', label: '1.5 Pro (Paid)' },
  { value: 'gemini-1.5-flash-latest', label: '1.5 Flash (Free Tier)' },
  { value: 'gemini-2.5-pro-exp-03-25', label: '2.5 Pro (Experimental)' },
];

const AgentConfigForm: React.FC<AgentConfigFormProps> = ({ agent, onUpdate, onRemove }) => {
  // Local state to display the name of the uploaded file
  const [seedFileName, setSeedFileName] = useState<string | null>(null);
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleSimpleChange = (name: keyof AppAgentConfig, value: any) => {
    onUpdate({ ...agent, [name]: value });
  };

  const handleSeedFileChange = async (file: File | null) => {
    setSeedFileName(null);
    onUpdate({ ...agent, seedContent: null }); // Clear previous content
    setParseError(null);

    if (file) {
      setSeedFileName(file.name);
      setIsParsingFile(true);
      let fileContent: string | null = null;

      try {
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          fileContent = await file.text();
        } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await getDocument({ data: arrayBuffer }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            text += textContent.items
              .filter(item => 'str' in item && typeof (item as any).str === 'string')
              .map(item => (item as any).str)
              .join(' ') + '\n';
          }
          fileContent = text;
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
          fileContent = result.value;
        } else {
          throw new Error('Unsupported file type. Please use .txt, .pdf, or .docx');
        }
        onUpdate({ ...agent, seedContent: fileContent });
      } catch (error: any) { // Catch specific errors if needed
        console.error("Error reading or parsing file:", error);
        setParseError(`Error: ${error?.message || 'Failed to parse file'}`);
        onUpdate({ ...agent, seedContent: null }); // Clear content on error
        setSeedFileName(`Error: ${file.name}`);
      } finally {
        setIsParsingFile(false);
      }
    } else {
      // Handle file removal
      setSeedFileName(null);
      onUpdate({ ...agent, seedContent: null });
      setIsParsingFile(false);
      setParseError(null);
    }
  };

  // ... apiKeyPlaceholder definition ...
  const defaultGeminiApiKeyFromEnv = import.meta.env.VITE_DEFAULT_GEMINI_API_KEY as string || "";
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

        <FileInput
          label="Seed Content File (.txt, .pdf, .docx)"
          name="seedContentFile"
          placeholder={seedFileName || "Upload file..."}
          onChange={handleSeedFileChange}
          accept=".txt,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          clearable
          size="sm"
          rightSection={isParsingFile ? <Loader size="xs" /> : null}
          error={parseError} // Display parsing errors
          disabled={isParsingFile} // Disable while parsing
        />
        {agent.seedContent && !isParsingFile && !parseError && (
          <Text size="xs" c="dimmed" truncate="end">
            Loaded {agent.seedContent.length} chars from: {seedFileName}
          </Text>
        )}

        <Group grow>
          <div style={{ display: agent.aiType === AIType.GEMINI ? 'block' : 'none' }}>
            <Select
              label="Model"
              name="model-select"
              value={agent.model || null}
              onChange={(value) => handleSimpleChange('model', value)}
              data={geminiModelOptions || []}
              placeholder="Select Gemini model..."
              clearable
              size="sm"
            />
          </div>
          <div style={{ display: agent.aiType !== AIType.GEMINI ? 'block' : 'none' }}>
            <TextInput
              label="Model"
              name="model-text"
              value={agent.model || ''}
              onChange={(e) => handleSimpleChange('model', e.currentTarget.value)}
              placeholder="Enter model name (e.g., gpt-4)"
              size="sm"
            />
          </div>
          <Select
            label="AI Type"
            name="aiType"
            value={agent.aiType !== undefined && agent.aiType !== null ? String(agent.aiType) : null}
            onChange={(value) => {
              const newType = value ? parseInt(value, 10) : undefined;
              let modelToSet = agent.model;
              if (newType === AIType.GEMINI && !geminiModelOptions.some(opt => opt.value === modelToSet)) {
                modelToSet = geminiModelOptions[0].value;
              }
              onUpdate({ ...agent, aiType: newType, model: modelToSet });
            }}
            data={aiTypeOptions || []}
            placeholder="-- Select --"
            clearable
            size="sm"
          />
        </Group>
      </Stack>
    </Paper>
  );
};

export default AgentConfigForm;