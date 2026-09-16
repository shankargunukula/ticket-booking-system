import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from app.graph import graph

app = FastAPI(title="Chat AI Python Service")

# --- Python WebSocket Interceptor ---
class WebSocketInterceptor:
    """
    Intercepts and logs/modifies WebSocket traffic for this microservice.
    Does not affect the Java or Node.js microservices in the monorepo.
    """
    @staticmethod
    async def before_receive(raw_data: str) -> dict:
        payload = json.loads(raw_data)
        print(f"[Interceptor - Inbound] Received payload: {payload}")
        return payload

    @staticmethod
    async def before_send(node_name: str, content: str) -> dict:
        outgoing_data = {
            "node": node_name,
            "content": content,
            "origin_service": "chat-ai-python-service"
        }
        print(f"[Interceptor - Outbound] Streaming node: {node_name}")
        return outgoing_data


@app.get("/")
async def root():
    return {"status": "healthy", "service": "chat-ai-python-service"}


@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # 1. Intercept incoming raw text data
            raw_data = await websocket.receive_text()
            payload = await WebSocketInterceptor.before_receive(raw_data)

            user_message = payload.get("message", "")

            # Temporary holders to prevent duplicate outbound socket streams
            tool_content_captured = None
            assistant_content_captured = None

            # Stream steps internally from LangGraph execution
            async for event in graph.astream({"messages": [("user", user_message)]}):
                for node, output in event.items():
                    if "messages" in output:
                        last_msg = output["messages"][-1]

                        # Extract and format the content string safely
                        content_str = ""
                        if isinstance(last_msg.content, list):
                            for part in last_msg.content:
                                if isinstance(part, dict) and "text" in part:
                                    content_str += part["text"]
                                elif isinstance(part, str):
                                    content_str += part
                        elif isinstance(last_msg.content, str):
                            content_str = last_msg.content

                        # Capture explicit Tool node returns (ToolMessage)
                        if hasattr(last_msg, "type") and last_msg.type == "tool":
                            tool_content_captured = content_str

                        # Capture standard assistant textual responses
                        elif content_str.strip():
                            assistant_content_captured = content_str

            # 2. Unified Delivery Logic: Send only ONE frame per interaction cycle
            if tool_content_captured:
                # Prioritise rendering the UI widget component card
                processed_payload = await WebSocketInterceptor.before_send(
                    node_name="tools",
                    content=tool_content_captured
                )
                await websocket.send_json(processed_payload)
            elif assistant_content_captured:
                # Fall back to plain conversational chat bubbles if no tools ran
                processed_payload = await WebSocketInterceptor.before_send(
                    node_name="assistant",
                    content=assistant_content_captured
                )
                await websocket.send_json(processed_payload)

    except WebSocketDisconnect:
        print("Client disconnected from Python service.")
