import os
from google.protobuf import text_format
from openai import OpenAI
import agent_pb2  # Generated Python module from /workspaces/the-circle/proto/agent.proto

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def load_seed(filepath="seed.txt"):
    with open(filepath, "r") as f:
        return f.read()

class ChatAgent:
    def __init__(self, name, system_prompt, seed_file, model, ai_type):
        self.name = name
        seed_content = load_seed(seed_file)
        # Append AI type info into system_prompt (if needed)
        self.system_prompt = f"{system_prompt}\n\nSeed file:\n{seed_content}\nAI Type: {ai_type}"
        self.model = model
        self.ai_type = ai_type
        self.messages = [{"role": "system", "content": self.system_prompt}]

    def send_message(self, message):
        self.messages.append({"role": "user", "content": message})
        if self.ai_type == "GEMINI":
            # Query Gemini service
            response = gemini_client.chat(message=self.messages)  # pseudo-code
            reply = response.content
        elif self.ai_type == "CLAUDE":
            # Query Claude service
            response = claude_client.chat(message=self.messages)  # pseudo-code
            reply = response.content
        elif self.ai_type == "DEEPSEEK":
            # Query Deepseek service
            response = deepseek_client.chat(message=self.messages)  # pseudo-code
            reply = response.content
        else:
            response = client.chat.completions.create(
                model=self.model,
                messages=self.messages
            )
            reply = response.choices[0].message.content
        self.messages.append({"role": "assistant", "content": reply})
        return reply

def agent_exchange(agent1, agent2, initial_message, turns=3):
    print(f"{agent1.name}: {initial_message}")
    last_reply = agent1.send_message(initial_message)
    for _ in range(turns):
        print(f"{agent2.name}: {last_reply.strip()}")
        last_reply = agent2.send_message(last_reply)

def agent_telephone(agents, initial_message, rounds=3):
    if len(agents) < 2:
        print("Need at least 2 agents for a telephone chain.")
        return
    
    previous_round_context = initial_message
    print(f"\n--- STARTING TELEPHONE CHAIN ---")
    print(f"Initial message: {previous_round_context}\n")
    
    for round_num in range(rounds):
        print(f"\n--- ROUND {round_num + 1} ---\n")
        current_round_messages = []
        for idx, agent in enumerate(agents):
            prompt = previous_round_context if idx == 0 else "\n".join(current_round_messages)
            print(f"{agent.name} receives: {prompt}")
            reply = agent.send_message(prompt)
            print(f"{agent.name} sends: {reply}\n")
            current_round_messages.append(reply)
        previous_round_context = "\n".join(current_round_messages)
        print(f"End of round {round_num + 1}. Message will cycle back to {agents[0].name}.\n")
    print("--- TELEPHONE CHAIN COMPLETE ---\n")
    return previous_round_context

def main(textproto_path="textproto/agents.textproto"):
    # Parse the AgentsDefinition from the textproto file
    agents_definition = agent_pb2.AgentsDefinition()
    with open(textproto_path, "r") as f:
        text_format.Parse(f.read(), agents_definition)

    # Create ChatAgent instances from AgentConfig entries
    agents_map = {}
    for cfg in agents_definition.agents:
        name = cfg.name if cfg.HasField("name") else "Unnamed"
        system_prompt = cfg.system_prompt if cfg.HasField("system_prompt") else "You are a helpful assistant."
        seed_file = cfg.seed_file if cfg.HasField("seed_file") else "seed.txt"
        model = cfg.model if cfg.HasField("model") else "gpt-3.5-turbo"
        ai_type = agent_pb2.AIType.Name(cfg.ai_type) if cfg.HasField("ai_type") else "OPENAI"

        agents_map[name] = ChatAgent(
            name=name,
            system_prompt=system_prompt,
            seed_file=seed_file,
            model=model,
            ai_type=ai_type
        )

    # Get all agent names from the map
    agent_names = list(agents_map.keys())
    
    # Check if we have enough agents to run the telephone pattern
    if len(agent_names) >= 2:
        # Create a list of all agents in order
        agents = [agents_map[name] for name in agent_names]
        
        # Start the telephone chain with an initial message
        initial_message = "Let's look at the seed data and prompts you've been given.  Tell the others to do the same.  Thanks!"
        
        # Run the telephone chain for 3 rounds
        final_message = agent_telephone(agents, initial_message, rounds=3)
        
        print(f"Final message after telephone chain: {final_message}")
    else:
        print("Not enough agents defined in the textproto to run a telephone chain. Need at least 2.")

if __name__ == "__main__":
    main()