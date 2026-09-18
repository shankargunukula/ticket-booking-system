# agents/orchestrator.py
import json
from openai import OpenAI
from config import OLLAMA_BASE_URL, LLM_MODEL_NAME
from agents.tools import search_movie_by_vibe, check_theater_showtimes

# Instantiates an OpenAI connection directed cleanly to Ollama's runtime layer port
client = OpenAI(base_url=OLLAMA_BASE_URL, api_key="ollama")

AVAILABLE_TOOLS = {
    "search_movie_by_vibe": search_movie_by_vibe,
    "check_theater_showtimes": check_theater_showtimes
}

def run_agent_loop(user_input: str) -> str:
    """Executes the agent execution loop with local Ollama tool orchestration support."""

    tools_schema = [
        {
            "type": "function",
            "function": {
                "name": "search_movie_by_vibe",
                "description": "Finds a movie based on mood, plots, themes or cozy descriptions.",
                "parameters": {
                    "type": "object",
                    "properties": {"semantic_query": {"type": "string"}},
                    "required": ["semantic_query"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "check_theater_showtimes",
                "description": "Finds times and theater schedules using an exact movie title keyword.",
                "parameters": {
                    "type": "object",
                    "properties": {"movie_title": {"type": "string"}},
                    "required": ["movie_title"],
                },
            },
        }
    ]

    messages = [
        {
            "role": "system",
            "content": "You are a concise movie theater assistant. Answer questions directly in 1 or 2 short sentences using the tools. Do not elaborate or make up facts."
        },
        {"role": "user", "content": user_input}
    ]

    # Evaluate whether a local database function call should execute
    response = client.chat.completions.create(
        model=LLM_MODEL_NAME,
        messages=messages,
        tools=tools_schema,
        tool_choice="auto"
    )

    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls

    if tool_calls:
        messages.append(response_message)

        for tool_call in tool_calls:
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)
            tool_function = AVAILABLE_TOOLS[function_name]

            # Execute tool queries directly against the local Chroma runtime context
            tool_result = tool_function.invoke(function_args)

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "name": function_name,
                "content": tool_result
            })

        # Synthesize the final localized text output response block
        final_response = client.chat.completions.create(model=LLM_MODEL_NAME, messages=messages)
        return final_response.choices[0].message.content

    return response_message.content
