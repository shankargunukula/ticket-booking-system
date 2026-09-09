import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse  # Fixed typo: changed HTMLMock to HTMLResponse
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
        # Example Interception: Log incoming message details
        print(f"[Interceptor - Inbound] Received payload: {payload}")
        return payload

    @staticmethod
    async def before_send(node_name: str, content: str) -> dict:
        # Example Interception: Inject microservice tracking metadata before sending to client
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

            # Track if a tool node executed during this interaction loop
            tool_was_called = False

            # Stream steps from the LangGraph execution
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

                        # Case A: Handle explicit Tool node returns (ToolMessage)
                        if hasattr(last_msg, "type") and last_msg.type == "tool":
                            tool_was_called = True
                            processed_payload = await WebSocketInterceptor.before_send(
                                node_name="tools",
                                content=content_str
                            )
                            # CRITICAL: Keep this send call scoped inside this condition block
                            await websocket.send_json(processed_payload)

                        # Case B: Handle final conversational responses
                        elif content_str.strip():
                            # ONLY process and send assistant text if no tool UI card was sent
                            if not tool_was_called:
                                processed_payload = await WebSocketInterceptor.before_send(
                                    node_name="assistant",
                                    content=content_str
                                )
                                # CRITICAL: Keep this send call scoped inside this condition block
                                await websocket.send_json(processed_payload)

    except WebSocketDisconnect:
        print("Client disconnected from Python service.")

