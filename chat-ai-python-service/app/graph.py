from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition # <-- ADD THESE
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings
from app.tools import  search_movie_showtimes, fetch_movie_ticket_status

class State(TypedDict):
    messages: Annotated[list, add_messages]

llm = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash", # Fixed stable version
    google_api_key=settings.GOOGLE_API_KEY
)

# 1. Register all tools together
all_tools = [search_movie_showtimes, fetch_movie_ticket_status]
llm_with_tools = llm.bind_tools(all_tools)

def assistant(state: State):
    return {"messages": [llm_with_tools.invoke(state["messages"])]}

# 2. Build workflow with Tool Routing capabilities
workflow = StateGraph(State)

workflow.add_node("assistant", assistant)
workflow.add_node("tools", ToolNode(all_tools)) # <-- ADD TOOL EXECUTION NODE

workflow.add_edge(START, "assistant")

# 3. Use conditional routing to check if the LLM requested a tool call or an answer
workflow.add_conditional_edges(
    "assistant",
    tools_condition, # Routes to "tools" if tool called, otherwise routes to END
)
workflow.add_edge("tools", "assistant") # Go back to assistant after running tools

graph = workflow.compile()
