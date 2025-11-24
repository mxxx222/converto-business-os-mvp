# Production Dockerfile for DocFlow Backend
FROM python:3.11-slim AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from project root
COPY requirements.txt /app/requirements.txt

# Install Python dependencies with better error handling
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r /app/requirements.txt && \
    python -c "import fastapi, uvicorn; print('✅ Dependencies installed successfully')"

# Copy shared_core (needed by backend)
COPY shared_core /app/shared_core

# Copy backend code
COPY backend /app/backend

# Copy test script
COPY test_entry.py /app/test_entry.py

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD curl -f http://localhost:8080/health || exit 1

# Keep working directory at /app for PYTHONPATH
WORKDIR /app

# Start production server with backend.main:app entry point
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]