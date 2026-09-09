from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GOOGLE_API_KEY: str = ""
    OPENAI_API_KEY: str | None = None  # Make OpenAI optional now
    APP_ENV: str = "development"
    PROJECT_NAME: str = "chat-ai-python-service"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
