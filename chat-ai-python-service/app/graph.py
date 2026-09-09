from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings
from app.tools import calculate_lengths

class State(TypedDict):
    messages: Annotated[list, add_messages]

# CHANGED: Swapped "gemini-1.5-flash" out for "gemini-2.5-flash"
llm = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash",
    google_api_key=settings.GOOGLE_API_KEY
)

llm_with_tools = llm.bind_tools([calculate_lengths])

def assistant(state: State):
    return {"messages": [llm_with_tools.invoke(state["messages"])]}

# Build workflow
workflow = StateGraph(State)
workflow.add_node("assistant", assistant)
workflow.add_edge(START, "assistant")
workflow.add_edge("assistant", END)

graph = workflow.compile()
