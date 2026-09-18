# --- Build Stage ---
FROM python:3.11-slim AS builder

# Install uv cleanly from its official image ecosystem
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY requirements.txt .

# OPTIMIZATION: Use a BuildKit cache mount instead of --no-cache to persist packages locally
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install \
    --target /app/pkgs \
    -r requirements.txt

# --- Production Stage ---
FROM python:3.11-slim AS runner

WORKDIR /workspace

# SECURITY: Run production application as a non-root system user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy packages and code from builder stage
COPY --from=builder /app/pkgs /workspace/pkgs
COPY ./app ./app

# Fix system storage permissions for our non-root user
RUN chown -R appuser:appgroup /workspace

# Add custom package directory to runtime lookup paths
ENV PYTHONPATH=/workspace/pkgs
ENV PYTHONUNBUFFERED=1

USER appuser

EXPOSE 8001

# Execute production server without live-reload flags
# Execute using the python module flag (-m) instead of the naked command
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]

