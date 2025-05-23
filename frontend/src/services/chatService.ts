import type { AppAgentConfig, Message, ApiKeys } from '../App'; // Types from App.tsx, Import ApiKeys type
import { AIType } from '../proto/agent_static.js'; // Import AIType enum

// Actual API call to Gemini
export async function callGeminiApi(
  apiKey: string,
  model: string, // e.g., "gemini-1.5-pro-latest"
  systemPrompt: string | null | undefined,
  messages: { role: string; parts: { text: string }[] }[] // Adjusted to match Gemini API structure directly
): Promise<string> {
  const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Construct the request body
  const requestBody: { contents: any[]; systemInstruction?: any; generationConfig?: any } = {
    contents: messages,
  };

  if (systemPrompt) {
    requestBody.systemInstruction = {
      parts: [{ text: systemPrompt }],
    };
  }

  // Optional: Add generationConfig if needed (e.g., temperature, topK, topP, maxOutputTokens)
  // requestBody.generationConfig = {
  //   temperature: 0.7,
  //   topK: 40,
  //   topP: 0.95,
  //   maxOutputTokens: 1024,
  // };

  console.log("Calling Gemini API with endpoint:", API_ENDPOINT);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: { message: "Failed to parse error response." } }));
      console.error("Gemini API Error Response:", errorBody);
      throw new Error(
        `Gemini API request failed with status ${response.status}: ${errorBody.error?.message || response.statusText}`
      );
    }

    const responseData = await response.json();
    console.log("Gemini API Success Response");

    // Extract the text from the response
    // Accessing candidates[0].content.parts[0].text
    // Ensure to handle cases where the path might not exist (e.g., no candidates, no content, no parts)
    const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text === 'string') {
      return text;
    } else {
      console.error("Could not extract text from Gemini response:", responseData);
      throw new Error("Invalid response structure from Gemini API.");
    }

  } catch (error) {
    console.error("Error during Gemini API call:", error);
    if (error instanceof Error) {
      return `(Error: ${error.message})`; // Return the error message for display
    }
    return "(Error: An unknown error occurred during API call)";
  }
}

// Placeholder for other API calls (OpenAI, Claude, etc.)
// async function callOpenAiApi(...) { ... }

// New function to generate system prompts
export async function generateSystemPromptForAgent(
  agentName: string,
  apiKey?: string // Optional API key, uses Gemini by default
): Promise<string> {
  if (!agentName.trim()) {
    throw new Error("Agent name cannot be empty to generate a prompt.");
  }

  const effectiveApiKey = apiKey || import.meta.env.VITE_DEFAULT_GEMINI_API_KEY as string;
  if (!effectiveApiKey) {
    throw new Error("Gemini API Key not configured for prompt generation.");
  }

  const modelForPromptGeneration = "gemini-1.5-flash-latest"; // Use a fast, free-tier model
  const metaPrompt =
    `Based on the agent role name "${agentName}", generate a concise and effective system prompt for that agent. 
The system prompt should instruct the agent on its persona and primary task. 
Focus on a helpful and direct tone. 
Output ONLY the system prompt itself, without any preamble, explanation, or quotation marks.`;

  const messages = [{ role: 'user', parts: [{ text: metaPrompt }] }];

  try {
    // Using callGeminiApi, assuming systemPrompt for meta-prompter is null
    const generatedPrompt = await callGeminiApi(effectiveApiKey, modelForPromptGeneration, null, messages);
    return generatedPrompt.trim(); // Trim any leading/trailing whitespace
  } catch (error) {
    console.error("Error in generateSystemPromptForAgent:", error);
    throw new Error(`Failed to generate system prompt: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function agentTelephone(
  agents: AppAgentConfig[],
  initialPrompt: string,
  rounds: number = 2, // Default to 2 rounds, will be overridden by value from App.tsx
  onMessageUpdate: (message: Message) => void, // Callback to stream messages to UI
  onChainComplete: (finalMessage: string) => void, // Callback for when the chain finishes
  onAgentStartThinking: (agentId: string) => void, // Add new callback param
  onAgentEndThinking: () => void,                // Add new callback param
  apiKeys: ApiKeys, // Add apiKeys parameter
  sharedContext: string, // Add sharedContext parameter
  onProgressUpdate: (messagesSent: number, totalMessages: number) => void // New callback
): Promise<void> {
  if (agents.length < 1) { // Changed from < 2 to allow single agent interaction if desired
    console.warn("Need at least 1 agent for a telephone chain.");
    onChainComplete("Error: Not enough agents.");
    return;
  }

  const totalMessagesToExpect = agents.length * rounds;
  let messagesSentThisRun = 0;
  // Call initial progress update
  onProgressUpdate(messagesSentThisRun, totalMessagesToExpect);

  let previousRoundContext = initialPrompt;
  console.log(`--- STARTING TELEPHONE CHAIN ---`);
  console.log(`Initial message: ${previousRoundContext}\n`);

  // Add initial user prompt to UI immediately
  onMessageUpdate({
    id: `msg-initial-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    agentName: "User (Initial Prompt)",
    role: 'user',
    content: initialPrompt,
    timestamp: new Date(),
  });

  for (let roundNum = 0; roundNum < rounds; roundNum++) {
    console.log(`\n--- ROUND ${roundNum + 1} ---`);
    onMessageUpdate({
      id: `msg-round-info-${roundNum}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      agentName: "System",
      role: 'system',
      content: `--- Starting Round ${roundNum + 1} ---`,
      timestamp: new Date(),
      roundNum: roundNum + 1,
    });

    let currentRoundMessagesForContext: string[] = [];

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const turnSpecificMessageHistory: { role: string; content: string }[] = [];

      // Prepend sharedContext to the very first prompt
      if (i === 0 && roundNum === 0 && sharedContext.trim() !== "") {
        turnSpecificMessageHistory.push({
          role: 'user', // Or 'system' depending on how the API best handles it
          content: `IMPORTANT SHARED CONTEXT:\n${sharedContext}\n\n---\n\nTASK STARTS NOW:`
        });
      }

      // Add seed content if available, as a system message or initial user message part
      if (agent.seedContent) {
        // Option 1: As a system message (if API supports multiple system messages or prefers it this way)
        // turnSpecificMessageHistory.push({ role: 'system', content: `Seed Context:\n${agent.seedContent}` });

        // Option 2: Prepend to the user prompt (simpler for some APIs)
        // This might be better if systemPrompt is already used via systemInstruction in Gemini
        // For now, let's assume seed content is part of the initial context the user provides to the agent.
        // This will be handled when constructing promptForAgent if we decide to make it part of the chain, 
        // or we can add it as a specific user message before the main promptForAgent.
        // Let's try adding it as an initial user message for this agent before the main prompt.
        turnSpecificMessageHistory.push({
          role: 'user',
          content: `Consider the following seed content:\n${agent.seedContent}\n\nNow, regarding the main task:`
        });
      }

      // Determine the prompt for the current agent
      let promptForAgent: string;
      if (i === 0 && roundNum === 0) {
        // First agent in the very first round gets the initial prompt directly
        promptForAgent = previousRoundContext;
      } else if (i === 0 && roundNum > 0) {
        // First agent in subsequent rounds gets the context from the previous round
        promptForAgent = previousRoundContext;
      } else {
        // Subsequent agents in any round get the accumulated messages from the current round as context
        promptForAgent = currentRoundMessagesForContext.join("\n\n---\n\n");
      }

      // The user's message for this turn is the promptForAgent
      turnSpecificMessageHistory.push({ role: 'user', content: promptForAgent });

      console.log(`${agent.name} (Model: ${agent.model}, Type: ${agent.aiType ? AIType[agent.aiType] : 'N/A'}) receives prompt content:`, promptForAgent);
      onMessageUpdate({
        id: `msg-agent-receives-${agent.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        agentName: `${agent.name}`,
        role: 'system',
        subRole: 'thinking-prompt',
        content: `Received prompt...`,
        timestamp: new Date(),
        roundNum: roundNum + 1,
      });

      let reply = "(Error: API call not implemented for this AI type)";
      onAgentStartThinking(agent.id); // Call start thinking BEFORE try/catch
      try {
        if (agent.aiType === AIType.GEMINI) {
          // Lookup key from the passed map
          const apiKeyToUse = apiKeys[AIType.GEMINI];
          if (!apiKeyToUse) {
            reply = "(Error: Gemini API Key not configured in settings)";
            console.error("Gemini API Key missing for agent:", agent.name, "- check settings.");
          } else if (!agent.model) {
            reply = "(Error: Gemini Model not specified for this agent)";
            console.error("Gemini Model missing for agent:", agent.name);
          } else {
            // Format messages for Gemini API (contents format)
            // Note: The Gemini API expects the 'contents' array to be the conversation history.
            // For multi-turn conversation, you need to pass the history correctly.
            // The current `turnSpecificMessageHistory` only has the latest user prompt.
            // For a true conversational agent, you'd accumulate history across turns for that agent.
            // However, in this telephone game, each agent gets a fresh context based on the previous agent's output.
            // So, sending just the current prompt (as user) and system prompt (if any via systemInstruction) is appropriate for THIS turn.

            const geminiApiContents = turnSpecificMessageHistory.map(m => ({
              role: m.role, // Role is already 'user' or potentially 'system' from seedContent
              parts: [{ text: m.content }]
            }));

            reply = await callGeminiApi(
              apiKeyToUse,
              agent.model,
              agent.systemPrompt,
              geminiApiContents
            );
          }
        } else if (agent.aiType === AIType.OPENAI) { // Example for OpenAI
          const apiKeyToUse = apiKeys[AIType.OPENAI];
          if (!apiKeyToUse) {
            reply = "(Error: OpenAI API Key not configured in settings)";
            console.error("OpenAI API Key missing - check settings.");
          } else {
            // reply = await callOpenAiApi(...);
            reply = "(OpenAI API call not implemented yet)";
          }
        } else {
          reply = `(API call for ${AIType[agent.aiType || -1]} not implemented yet.)`;
          console.warn(`API call for ${AIType[agent.aiType || -1]} not implemented yet.`);
        }
      } catch (error) {
        console.error(`Error calling API for agent ${agent.name}:`, error);
        reply = `(Error: API call failed for ${agent.name})`;
      } finally {
        onAgentEndThinking(); // Call end thinking AFTER try/catch/finally
      }

      currentRoundMessagesForContext.push(reply); // Add assistant's reply to current round context

      console.log(`${agent.name} sending reply`);
      onMessageUpdate({
        id: `msg-agent-sends-${agent.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        agentName: agent.name || "Unnamed Agent",
        agentId: agent.id,
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
        roundNum: roundNum + 1,
        model: agent.model,
        aiType: agent.aiType,
      });

      // AFTER successfully getting a reply and BEFORE onMessageUpdate for the reply:
      messagesSentThisRun++;
      onProgressUpdate(messagesSentThisRun, totalMessagesToExpect);
    }
    previousRoundContext = currentRoundMessagesForContext.join("\n\n---\n\n");
    console.log(`End of round ${roundNum + 1}. Context for next round (or final output): ${previousRoundContext.substring(0, 100)}...\n`);
  }

  console.log("--- TELEPHONE CHAIN COMPLETE ---");
  onMessageUpdate({
    id: `msg-chain-complete-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    agentName: "System",
    role: 'system',
    content: `--- Chain Complete. Final context: ${previousRoundContext.substring(0, 200)}... ---`,
    timestamp: new Date(),
  });
  onChainComplete(previousRoundContext);

  // Ensure final progress update if not already at 100%
  onProgressUpdate(totalMessagesToExpect, totalMessagesToExpect);
} 