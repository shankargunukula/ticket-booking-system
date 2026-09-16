# agents/orchestrator.py
from openai import OpenAI
from config import OPENAI_API_KEY, LLM_MODEL_NAME
from agents.tools import search_movie_by_vibe, check_theater_showtimes

client = OpenAI(api_key=OPENAI_API_KEY)
AVAILABLE_TOOLS = {
    "search_movie_by_vibe": search_movie_by_vibe,
    "check_theater_showtimes": check_theater_showtimes
}

def run_agent_loop(user_input: str) -> str:
    """Executes the agent execution loop with Function Calling integration support."""
    # Define tool structures for the LLM schema interface
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
        {"role": "system", "content": "You are a movie theater assistant agent. Use semantic searches for moods and direct tools for clear scheduling inquiries."},
        {"role": "user", "content": user_input}
    ]

    # First Call to look for Tool Execution Requirements
    response = client.chat.completions.create(
        model=LLM_MODEL_NAME, messages=messages, tools=tools_schema, tool_choice="auto"
    )

    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls

    if tool_calls:
        messages.append(response_message)

        # Execute the called tool locally
        for tool_call in tool_calls:
            function_name = tool_call.function.name
            function_args = eval(tool_call.function.arguments)
            tool_function = AVAILABLE_TOOLS[function_name]

            # Execute actual internal python function block wrapper
            tool_result = tool_function.invoke(function_args)

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "name": function_name,
                "content": tool_result
            })

        # Final answer formulation with injected data context blocks
        final_response = client.chat.completions.create(model=LLM_MODEL_NAME, messages=messages)
        return final_response.choices[0].message.content

    return response_message.content
