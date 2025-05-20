import React from 'react';
import type { Circle, AppAgentConfig, ApiKeys } from '../App'; // Assuming App.tsx exports these
import { Drawer, Title, Button, Group, Accordion, TextInput, Paper, Textarea } from '@mantine/core';
import AgentConfigForm from './AgentConfigForm';

interface CirclesConfigDrawerProps {
  opened: boolean;
  onClose: () => void;
  circles: Circle[];
  apiKeys: ApiKeys;
  judgeAgentConfig: AppAgentConfig;
  onUpdateJudgeConfig: (config: AppAgentConfig) => void;
  onAddCircle: () => void;
  onRemoveCircle: (circleId: string) => void;
  onUpdateCircleName: (circleId: string, newName: string) => void;
  onAddAgentToCircle: (circleId: string) => void;
  onRemoveAgentFromCircle: (circleId: string, agentId: string) => void;
  onUpdateAgentInCircle: (circleId: string, updatedAgent: AppAgentConfig) => void;
}

const CirclesConfigDrawer: React.FC<CirclesConfigDrawerProps> = ({
  opened,
  onClose,
  circles,
  apiKeys,
  judgeAgentConfig,
  onUpdateJudgeConfig,
  onAddCircle,
  onRemoveCircle,
  onUpdateCircleName,
  onAddAgentToCircle,
  onRemoveAgentFromCircle,
  onUpdateAgentInCircle,
}) => {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<Title order={3}>Configure Circles & Agents</Title>}
      position="left"
      size="xl" // Or md, lg, or a percentage like '50%'
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      padding="md"
    >
      <Button onClick={onAddCircle} size="sm" variant="light" mb="md" fullWidth>
        + Add New Circle
      </Button>

      <Accordion chevronPosition="left" variant="contained" defaultValue={circles[0]?.id}>
        {circles.map((circle) => (
          <Accordion.Item value={circle.id} key={circle.id} className="circle-accordion-item">
            <Accordion.Control>
              <Group justify="space-between" style={{ width: '100%' }}>
                <TextInput
                  value={circle.name}
                  onChange={(e) => onUpdateCircleName(circle.id, e.currentTarget.value)}
                  variant="unstyled"
                  size="sm"
                  styles={{ input: { fontWeight: 500, fontSize: 'var(--mantine-font-size-md)' } }}
                  onClick={(e) => e.stopPropagation()} // Prevent accordion toggle on name edit
                />
                <Button onClick={(e) => { e.stopPropagation(); onRemoveCircle(circle.id); }} size="xs" variant="subtle" color="red">
                  Remove Circle
                </Button>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Button onClick={() => onAddAgentToCircle(circle.id)} size="xs" variant="outline" mt="xs" mb="sm" fullWidth>
                + Add Agent to {circle.name}
              </Button>
              <div className="agent-list-inner">
                {circle.agents.map((agent) => (
                  <AgentConfigForm
                    key={agent.id}
                    agent={agent}
                    onUpdate={(updatedAgent) => onUpdateAgentInCircle(circle.id, updatedAgent)}
                    onRemove={() => onRemoveAgentFromCircle(circle.id, agent.id)}
                    apiKeys={apiKeys} // Pass apiKeys down
                  />
                ))}
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      {/* Judge Agent Configuration */}
      <Paper p="sm" withBorder mt="lg" className="judge-config-item-drawer">
        <Title order={4} mb="xs">Judge Agent</Title>
        <Textarea
          label="Judge System Prompt"
          value={judgeAgentConfig.systemPrompt || ''}
          onChange={(e) => onUpdateJudgeConfig({ ...judgeAgentConfig, systemPrompt: e.currentTarget.value })}
          autosize minRows={3} maxRows={6} size="sm"
        />
        {/* TODO: Add Model and AI Type select for Judge if needed */}
      </Paper>
    </Drawer>
  );
};

export default CirclesConfigDrawer; 