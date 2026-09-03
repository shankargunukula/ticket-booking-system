# Chat AI Python Service

FastAPI service utilizing LangGraph for structured agent state-machines with WebSocket streaming.

## Local Setup

1. **Clone and Create Virtual Environment:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   APP_ENV=development
   ```

4. **Run Application:**
   ```bash
   uvicorn app.main:app --reload
   ```

## Docker Deployment

Build and run optimized multi-stage container image:
```bash
docker build -t chat-ai-python-service .
docker run -p 8000:8000 --env-file .env chat-ai-python-service
```
