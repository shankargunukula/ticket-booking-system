import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLMock
from app.graph import graph

app = FastAPI(title="Chat AI Python Service")

@app.get("/")
async def root():
    return {"status": "healthy", "service": "chat-ai-python-service"}

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            user_message = payload.get("message", "")

            # Stream steps from the LangGraph execution
            async for event in graph.astream({"messages": [("user", user_message)]}):
                for node, output in event.items():
                    if "messages" in output:
                        last_msg = output["messages"][-1]
                        await websocket.send_json({
                            "node": node,
                            "content": last_msg.content
                        })
    except WebSocketDisconnect:
        print("Client disconnected.")
