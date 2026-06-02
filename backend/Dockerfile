FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ChromaDB hardcodes Path.home()/.cache/chroma as its model download path.
# By setting HOME=/app at build time, it downloads to /app/.cache/chroma
# which becomes a real Docker image layer — no runtime downloads ever.
RUN HOME=/app python -c "from chromadb.utils.embedding_functions import DefaultEmbeddingFunction; ef = DefaultEmbeddingFunction(); ef(['test'])"

COPY . .

RUN mkdir -p /app/data
# data/ is mounted from ./backend/data via docker-compose volume

# At runtime, keep HOME=/app so ChromaDB finds its cached model
ENV HOME=/app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
