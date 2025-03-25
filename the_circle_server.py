import os
import hashlib
import markdown
from flask import Flask, request, Response
from google.protobuf import text_format
from openai import OpenAI
import agent_pb2
import asyncio

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# idk it just doesn't seem to work for some reason :/
#deepseek_client = OpenAI(api_key=os.getenv("DEEPSEEK_API_KEY"), base_url="https://api.deepseek.com")
gemini_client = OpenAI(api_key=os.getenv("GEMINI_API_KEY"), base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
claude_client = OpenAI(api_key=os.getenv("CLAUDE_API_KEY"), base_url="https://api.anthropic.com/v1/")

def load_seed(filepath="seed.txt"):
    with open(filepath, "r") as f:
        return f.read()

def get_color(agent_name):
    """
    Generate a light (pastel) color from the agent_name.
    """
    hex_digest = hashlib.md5(agent_name.encode("utf-8")).hexdigest()
    r = int(hex_digest[0:2], 16)
    g = int(hex_digest[2:4], 16)
    b = int(hex_digest[4:6], 16)
    pastel_factor = 0.7
    r = int(r + (255 - r) * pastel_factor)
    g = int(g + (255 - g) * pastel_factor)
    b = int(b + (255 - b) * pastel_factor)
    return f"#{r:02x}{g:02x}{b:02x}"

class ChatAgent:
    def __init__(self, name, system_prompt, seed_file, model, ai_type="OPENAI"):
        self.name = name
        seed_content = load_seed(seed_file)
        self.messages = [{"role": "user", "content": f"{system_prompt}\n\nSeed file:\n{seed_content}\nAI Type: {ai_type}"}]
        self.model = model
        self.ai_type = ai_type

    async def send_message(self, message):
        import time
        import os
        start_time = time.time()
        self.messages.append({"role": "user", "content": message})
        if os.getenv("DEBUG_MODE"):
            print(f"[DEBUG] {self.name} starting API call with messages:", self.messages)
        def call_api_sync():
            if self.ai_type == "GEMINI":
                response = gemini_client.chat.completions.create(
                    model=self.model,
                    messages=self.messages,
                    timeout=20,
                    stream=False
                )
                return response.choices[0].message.content
            elif self.ai_type == "CLAUDE":
                response = claude_client.chat.completions.create(
                    model=self.model,
                    messages=self.messages,
                    timeout=20,
                    stream=False
                )
                return response.choices[0].message.content
            else:
                response = openai_client.chat.completions.create(
                    model=self.model,
                    messages=self.messages,
                    timeout=20,
                    stream=False
                )
                return response.choices[0].message.content
        try:
            reply = await asyncio.wait_for(asyncio.to_thread(call_api_sync), timeout=20)
        except asyncio.TimeoutError:
            print(f"[WARNING] {self.name} API call timed out.")
            reply = "Request timed out"
        elapsed = time.time() - start_time
        if elapsed > 20:
            print(f"[WARNING] {self.name} request took {elapsed:.2f} seconds (exceeding deadline).")
        self.messages.append({"role": "assistant", "content": reply})
        # NEW: compute token count, cost, and store response time
        self.last_token_count = len(reply.split())
        self.last_cost = round(self.last_token_count * 0.0001, 5)
        self.last_response_time = round(elapsed, 2)
        if os.getenv("DEBUG_MODE"):
            print(f"[DEBUG] {self.name} reply: {reply} | Response time: {self.last_response_time}s")
        return reply

async def stream_conversation(agents, initial_message, rounds=1):
    """
    Generator that yields HTML chunks as conversation events occur.
    A spinner is shown until completion.
    """
    # Updated header with additional "Response Time" column
    yield """
    <html>
    <head>
      <!-- Import font -->
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600" rel="stylesheet" />
      <style>
        body { font-family: 'Open Sans', sans-serif; color: #333; background: #fafafa; max-width: 800px; margin: 0 auto; padding: 16px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
        th { background: #f5f5f5; }
        .back-link { display: inline-block; margin-top: 12px; text-decoration: none; color: #337ab7; }
        .back-link:hover { text-decoration: underline; }
        /* Loader CSS */
        #loader { border: 8px solid #f3f3f3; border-top: 8px solid #337ab7; border-radius: 50%; width: 40px; height: 40px; 
                 animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
    <h1>Telephone Conversation</h1>
    <table id="conv-table">
      <tr>
        <th style="width:15%;">Agent</th>
        <th style="width:15%;">Source</th>
        <th style="width:15%;">Model</th>
        <th>Message</th>
        <th style="width:10%;">Tokens</th>
        <th style="width:10%;">Cost ($)</th>
        <th style="width:10%;">Round</th>
        <th style="width:10%;">Response Time</th>
      </tr>
    """
    yield """<div id="loader"></div>"""

    # Updated yield_row helper to include response_time parameter.
    def yield_row(agent_name, source, model, msg, tokens="", cost="", round_label="", response_time=""):
        rendered_msg = markdown.markdown(msg)
        color = get_color(agent_name) if agent_name != "User" else "#ffffff"
        return f"""
          <tr style="background-color:{color};">
            <td><strong>{agent_name}</strong></td>
            <td>{source}</td>
            <td>{model}</td>
            <td>{rendered_msg}</td>
            <td>{tokens}</td>
            <td>{cost}</td>
            <td>{round_label}</td>
            <td>{response_time}</td>
          </tr>
        """

    # Yield the initial User message row (no token info for User; round blank)
    yield yield_row("User", "User", "N/A", initial_message, round_label="")

    # Remove spinner with script.
    yield """<script>document.getElementById('loader').style.display='none';</script>"""

    # First agent reply; label as "Round 0"
    response = await agents[0].send_message(initial_message)
    yield yield_row(agents[0].name, agents[0].ai_type, agents[0].model, response,
                    tokens=agents[0].last_token_count, cost=agents[0].last_cost,
                    round_label="Round 0", response_time=agents[0].last_response_time)
    
    # Process subsequent rounds
    for round_number in range(1, rounds+1):
        # For each round iterate over agents 1..n
        for i in range(1, len(agents)):
            # Yield placeholder row for the upcoming service.
            yield yield_row(agents[i].name, agents[i].ai_type, agents[i].model,
                            "Pending... Service is starting...", 
                            round_label=f"Round {round_number}", response_time="--")
            if os.getenv("DEBUG_MODE"):
                print(f"[DEBUG] {agents[i].name} in Round {round_number} about to call send_message")
            # Send the message and measure response.
            response = await agents[i].send_message(response)
            # Yield actual response row with response time.
            yield yield_row(agents[i].name, agents[i].ai_type, agents[i].model, response,
                            tokens=agents[i].last_token_count, cost=agents[i].last_cost,
                            round_label=f"Round {round_number}", response_time=agents[i].last_response_time)
    
    # Yield footer with a back link.
    yield """
    </table>
    <a href="/" class="back-link">Go back</a>
    </body>
    </html>
    """

async def agent_telephone(agents, initial_message, rounds=3):
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
            reply = await agent.send_message(prompt)
            print(f"{agent.name} sends: {reply}\n")
            current_round_messages.append(reply)
        previous_round_context = "\n".join(current_round_messages)
        print(f"End of round {round_num + 1}. Message will cycle back to {agents[0].name}.\n")
    print("--- TELEPHONE CHAIN COMPLETE ---\n")
    return previous_round_context

app = Flask(__name__)

# NEW: Update the SSE stream helper to format events and add heartbeat if needed.
def sse_stream_conversation_wrapper(agents, message, rounds):
    async_gen = stream_conversation(agents, message, rounds=rounds)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        while True:
            try:
                chunk = loop.run_until_complete(async_gen.__anext__())
            except StopAsyncIteration:
                break
            # Prepend "data: " and append two newlines for proper SSE formatting.
            event = f"data: {chunk}\n\n".encode('utf-8')
            yield event
            # Optionally yield a heartbeat comment to force flush
            yield b": heartbeat\n\n"
    finally:
        loop.close()

# NEW: Update the SSE endpoint to add cache headers.
@app.route("/stream", methods=["GET"])
def stream():
    rounds = int(request.args.get("rounds", 1))
    message = request.args.get("message", "Hello everyone!")
    agents_definition = agent_pb2.AgentsDefinition()
    with open("textproto/agents.textproto", "r") as f:
        text_format.Parse(f.read(), agents_definition)
    agents_map = {}
    for cfg in agents_definition.agents:
        name = cfg.name if cfg.HasField("name") else "Unnamed"
        system_prompt = (cfg.system_prompt if cfg.HasField("system_prompt")
                         else "You are a helpful assistant.")
        seed_file = cfg.seed_file if cfg.HasField("seed_file") else "seed.txt"
        model = cfg.model if cfg.HasField("model") else "gpt-3.5-turbo"
        ai_type = (agent_pb2.AIType.Name(cfg.ai_type)
                   if cfg.HasField("ai_type") else "OPENAI")
        agents_map[name] = ChatAgent(name, system_prompt, seed_file, model, ai_type)
    agents = [agents_map[name] for name in sorted(agents_map.keys())]
    resp = Response(sse_stream_conversation_wrapper(agents, message, rounds=rounds),
                    mimetype='text/event-stream')
    resp.headers["Cache-Control"] = "no-cache"
    resp.direct_passthrough = True
    return resp

# Update index route to include JavaScript that starts the SSE stream.
@app.route("/", methods=["GET"])
def index():
    return '''
    <h1>Agent Telephone</h1>
    <form id="runForm" style="max-width: 600px; margin: auto;">
      <label for="rounds">Number of rounds:</label>
      <input type="number" id="rounds" name="rounds" value="1" min="1" style="width:80px;"/>
      <br><br>
      <label for="message">Initial message:</label><br>
      <textarea id="message" name="message" rows="3" cols="60" style="width:100%;">Hello everyone!</textarea>
      <br><br>
      <input type="submit" value="Run Telephone" style="padding:6px 12px;"/>
    </form>
    <div id="results" style="max-width: 800px; margin: auto; padding-top: 20px;"></div>
    <script>
      document.getElementById("runForm").addEventListener("submit", function(event) {
          event.preventDefault();
          var rounds = document.getElementById("rounds").value;
          var message = document.getElementById("message").value;
          var evtSource = new EventSource("/stream?rounds=" + rounds + "&message=" + encodeURIComponent(message));
          evtSource.onmessage = function(e) {
              document.getElementById("results").innerHTML += e.data;
          };
          evtSource.onerror = function(e) {
              console.error("EventSource error:", e);
          };
      });
    </script>
    '''

# [New helper function to wrap async generator into a sync iterator]
def sync_stream_conversation_wrapper(agents, message, rounds):
    async_gen = stream_conversation(agents, message, rounds=rounds)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        while True:
            chunk = loop.run_until_complete(async_gen.__anext__())
            yield chunk.encode('utf-8')  # encode to bytes
    except StopAsyncIteration:
        pass
    finally:
        loop.close()

# Replace the async /run route with a synchronous one:
@app.route("/run", methods=["POST"])
def run():
    # Parse textproto to build agents.
    agents_definition = agent_pb2.AgentsDefinition()
    textproto_path = "textproto/agents.textproto"
    with open(textproto_path, "r") as f:
        text_format.Parse(f.read(), agents_definition)
    
    agents_map = {}
    for cfg in agents_definition.agents:
        name = cfg.name if cfg.HasField("name") else "Unnamed"
        system_prompt = cfg.system_prompt if cfg.HasField("system_prompt") else "You are a helpful assistant."
        seed_file = cfg.seed_file if cfg.HasField("seed_file") else "seed.txt"
        model = cfg.model if cfg.HasField("model") else "gpt-3.5-turbo"
        ai_type = agent_pb2.AIType.Name(cfg.ai_type) if cfg.HasField("ai_type") else "OPENAI"
        agents_map[name] = ChatAgent(name, system_prompt, seed_file, model, ai_type)
    
    agent_names = list(agents_map.keys())
    if len(agent_names) < 2:
        return "Not enough agents (need at least two).", 400
    agents = [agents_map[name] for name in agent_names]
    rounds = int(request.form.get("rounds", 1))
    message = request.form.get("message", "Hello everyone!")
    
    # Use the synchronous wrapper for the streaming response.
    resp = Response(
        sync_stream_conversation_wrapper(agents, message, rounds=rounds),
        mimetype='text/html'
    )
    resp.direct_passthrough = True  # <-- Ensures chunks are flushed immediately
    return resp

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)