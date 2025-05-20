import React from 'react';
import { Group, Badge, Text, Box, Progress } from '@mantine/core';
import type { Circle, AppAgentConfig } from '../App'; // Assuming App.tsx exports these

interface ProgressDisplayProps {
  circles: Circle[];
  judgeConfig: AppAgentConfig;
  isOverallChatRunning: boolean; // Is the whole multi-circle + judge process active
  // We might need more granular state for when the judge specifically is running
  // For now, let's infer judge status based on circles completion and overall status
  activeThinkingAgentId: string | null; // To know if judge is the one thinking
}

const ProgressDisplay: React.FC<ProgressDisplayProps> = ({
  circles,
  judgeConfig,
  isOverallChatRunning,
  activeThinkingAgentId
}) => {
  const getCircleStatusInfo = (circle: Circle) => {
    const agentCount = circle.agents.length;
    const agentText = `${agentCount} agent${agentCount !== 1 ? 's' : ''}`;

    if (circle.error) return { label: `Error (${agentText})`, color: 'red', value: 100, indeterminate: false };
    if (circle.finalOutput) return { label: `Completed (${agentText})`, color: 'green', value: 100, indeterminate: false };
    if (circle.isRunning) {
      const progressValue = circle.totalMessagesInCurrentRun && circle.totalMessagesInCurrentRun > 0
        ? ((circle.messagesSentInCurrentRun || 0) / circle.totalMessagesInCurrentRun) * 100
        : 0;
      return {
        label: `Running... (${Math.round(progressValue)}%) - ${agentText}`,
        color: 'blue',
        value: progressValue,
        indeterminate: circle.totalMessagesInCurrentRun === 0
      };
    }
    // Default/Pending state
    return { label: `Pending (${agentText})`, color: 'gray', value: 0, indeterminate: false };
  };

  const allCirclesDone = circles.every(c => c.finalOutput || c.error);
  let judgeStatus = { label: 'Waiting for Circles', color: 'gray' };

  if (activeThinkingAgentId === judgeConfig.id) {
    judgeStatus = { label: 'Judging...', color: 'grape' };
  } else if (allCirclesDone && circles.filter(c => !c.error).length > 0) {
    // If all circles are done (completed or errored) and at least one succeeded, 
    // and judge is not currently thinking, assume judge is done or waiting to be triggered by overall process.
    // The `isOverallChatRunning` will determine if it shows "Judged" or still "Waiting".
    if (!isOverallChatRunning) { // If chat is fully stopped, judge is considered done if circles were successful
      judgeStatus = { label: 'Judged', color: 'teal' };
    } else { // Chat is still running, but judge not active, and circles done implies judge is next or just finished its step
      // This could also mean judge errored and error wasn't caught by its own state. 
      // A more robust way would be a specific judgeIsDone state.
      // For now, if circles are done and judge not thinking, assume it has completed its step.
      judgeStatus = { label: 'Ready/Judged', color: 'teal' };
    }
  }
  // If isOverallChatRunning is false, and circles are done, explicitly mark judge as Judged
  if (!isOverallChatRunning && allCirclesDone && circles.filter(c => !c.error).length > 0) {
    judgeStatus = { label: 'Judged', color: 'teal' };
  }


  return (
    <Box mb="md" p="xs" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--mantine-radius-md)' }}>
      <Text size="sm" fw={500} mb="xs">Process Overview:</Text>
      <Group gap="xs" wrap="nowrap" style={{ overflowX: 'auto' }}>
        {circles.map(circle => {
          const statusInfo = getCircleStatusInfo(circle);
          return (
            <Box key={circle.id} style={{ textAlign: 'center', minWidth: '150px' }}>
              <Text size="xs" c="dimmed" truncate>{circle.name}</Text>
              <Progress
                value={statusInfo.value}
                color={statusInfo.color}
                animated={statusInfo.label.includes('Running') || statusInfo.indeterminate}
                striped={statusInfo.label.includes('Running') || statusInfo.indeterminate}
                size="sm"
                mt={2}
                mb={2}
              />
              <Badge color={statusInfo.color} variant="light" size="xs" fullWidth={false}>
                {statusInfo.label}
              </Badge>
            </Box>
          );
        })}
        {circles.length > 0 && (
          <Text mx="xs" c="dimmed">→</Text>
        )}
        <Badge color={judgeStatus.color} variant="light" size="lg">
          {judgeConfig.name || 'Judge'}: {judgeStatus.label}
        </Badge>
      </Group>
    </Box>
  );
};

export default ProgressDisplay; 