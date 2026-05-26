from fastembed import TextEmbedding
from typing import List

model = TextEmbedding("BAAI/bge-small-en-v1.5")

def embed_texts(texts: List[str]) -> List[List[float]]:
    """Generates embeddings for a list of texts."""
    embeddings_generator = model.embed(texts)
    return [embedding.tolist() for embedding in embeddings_generator]

def embed_one(text: str) -> List[float]:
    """Generates an embedding for a single text."""
    return embed_texts([text])[0]
