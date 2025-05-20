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
  if (!isOverallChatRunning && !circles.some(c => c.finalOutput || c.error)) {
    return null; // Don't show anything if chat hasn't started or nothing to report
  }

  const getCircleStatusInfo = (circle: Circle) => {
    if (circle.error) return { label: 'Error', color: 'red', value: 100, indeterminate: false };
    if (circle.finalOutput) return { label: 'Completed', color: 'green', value: 100, indeterminate: false };
    if (circle.isRunning) {
      const progressValue = circle.totalMessagesInCurrentRun && circle.totalMessagesInCurrentRun > 0
        ? ((circle.messagesSentInCurrentRun || 0) / circle.totalMessagesInCurrentRun) * 100
        : 0; // Or treat as indeterminate if total is 0
      return {
        label: `Running... (${Math.round(progressValue)}%)`,
        color: 'blue',
        value: progressValue,
        indeterminate: circle.totalMessagesInCurrentRun === 0 // Indeterminate if total not set
      };
    }
    return { label: 'Pending', color: 'gray', value: 0, indeterminate: false };
  };

  const allCirclesDone = circles.every(c => c.finalOutput || c.error);
  let judgeStatus = { label: 'Waiting for Circles', color: 'gray' };
  if (allCirclesDone && isOverallChatRunning) { // isOverallChatRunning implies judge might be next or running
    if (activeThinkingAgentId === judgeConfig.id) {
      judgeStatus = { label: 'Judging...', color: 'grape' };
    } else if (circles.some(c => c.finalOutput) && !activeThinkingAgentId) { // Judge has completed or not started yet but circles are done
      // This logic is a bit tricky: if overall is still running but judge not thinking, it implies judge completed or errored
      // For simplicity, if circles are done and something is still "running" but not judge, it's a bit ambiguous
      // Let's assume judge has completed if circles are done and no one specific is thinking and chat is not overall running.
      // If chat IS overall running, but judge not thinking and circles done, it means judge has finished.
      // This needs refinement based on how `isOverallChatRunning` is truly set after judge.
      const judgeHasMessages = true; // This would come from checking `judgeMessages` in App.tsx if passed here
      // For now, let's assume if circles are done and chat is NOT overall running, judge is done.
      if (!isOverallChatRunning && circles.filter(c => !c.error).length > 0) {
        judgeStatus = { label: 'Judged', color: 'teal' };
      } else if (isOverallChatRunning && !activeThinkingAgentId) { // Judge might have finished its call
        judgeStatus = { label: 'Judged', color: 'teal' };
      }
    }
  }
  if (!isOverallChatRunning && circles.every(c => c.finalOutput || c.error) && circles.filter(c => !c.error).length > 0) {
    judgeStatus = { label: 'Judged', color: 'teal' };
  }


  return (
    <Box mb="md" p="xs" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--mantine-radius-md)' }}>
      <Text size="sm" fw={500} mb="xs">Process Overview:</Text>
      <Group gap="xs" wrap="nowrap" style={{ overflowX: 'auto' }}>
        {circles.map(circle => {
          const statusInfo = getCircleStatusInfo(circle);
          return (
            <Box key={circle.id} style={{ textAlign: 'center', minWidth: '120px' }}>
              <Text size="xs" c="dimmed">{circle.name}</Text>
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