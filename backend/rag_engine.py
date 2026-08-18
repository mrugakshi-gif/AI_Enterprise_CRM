import math
import re
from typing import List, Dict, Any, Tuple
from backend.database import db

class RAGEngine:
    def __init__(self):
        pass

    def tokenize(self, text: str) -> List[str]:
        text = text.lower()
        words = re.findall(r'\b[a-z0-9_₹%-]+\b', text)
        stop_words = {
            "a", "an", "the", "in", "on", "at", "to", "for", "with", "by", "about",
            "against", "between", "into", "through", "during", "before", "after",
            "above", "below", "from", "up", "down", "is", "are", "was", "were",
            "be", "been", "being", "have", "has", "had", "do", "does", "did", "and",
            "or", "but", "if", "because", "as", "until", "while", "of", "it", "its"
        }
        return [w for w in words if w not in stop_words and len(w) > 1]

    def chunk_text(self, document_name: str, raw_text: str, chunk_size: int = 120, overlap: int = 20) -> List[Dict[str, Any]]:
        # Split into logical sentences/paragraphs
        paragraphs = [p.strip() for p in raw_text.split('\n') if p.strip()]
        chunks = []
        current_chunk_words = []
        current_page = 1

        for p in paragraphs:
            words = p.split()
            if len(current_chunk_words) + len(words) > chunk_size and current_chunk_words:
                chunk_str = " ".join(current_chunk_words)
                chunks.append({
                    "chunk_id": f"chk-{len(chunks)+1}",
                    "document_name": document_name,
                    "text": chunk_str,
                    "page_number": current_page,
                    "token_count": len(current_chunk_words)
                })
                # Keep overlap
                current_chunk_words = current_chunk_words[-overlap:] if len(current_chunk_words) > overlap else []
                current_page += 1
            current_chunk_words.extend(words)

        if current_chunk_words:
            chunks.append({
                "chunk_id": f"chk-{len(chunks)+1}",
                "document_name": document_name,
                "text": " ".join(current_chunk_words),
                "page_number": current_page,
                "token_count": len(current_chunk_words)
            })

        return chunks

    def search_knowledge_base(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_tokens = set(self.tokenize(query))
        if not query_tokens:
            return []

        all_chunks = []
        for doc in db.documents:
            doc_chunks = doc.get("chunks", [])
            for chunk in doc_chunks:
                all_chunks.append({
                    "document_id": doc["id"],
                    "document_name": doc["name"],
                    "category": doc.get("category", "General"),
                    "text": chunk["text"],
                    "page_number": chunk.get("page_number", 1),
                    "chunk_id": chunk.get("chunk_id", "chk-1")
                })

        if not all_chunks:
            return []

        scored_chunks: List[Tuple[float, Dict[str, Any]]] = []

        for chunk in all_chunks:
            chunk_tokens = self.tokenize(chunk["text"])
            if not chunk_tokens:
                continue

            # Calculate Term frequency & overlap
            overlap_count = sum(1 for token in query_tokens if token in chunk_tokens)
            
            # Substring match boosts
            raw_query_lower = query.lower()
            chunk_text_lower = chunk["text"].lower()
            bonus = 0.0
            if raw_query_lower in chunk_text_lower:
                bonus += 0.5

            # Keyword matching bonus
            for token in query_tokens:
                if token in chunk_text_lower:
                    bonus += 0.15

            if overlap_count > 0 or bonus > 0:
                score = (overlap_count / (len(query_tokens) + 0.1)) * 0.7 + bonus
                score = min(score, 0.98)
                scored_chunks.append((score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, chunk in scored_chunks[:top_k]:
            results.append({
                "score": round(score, 2),
                "document_name": chunk["document_name"],
                "document_id": chunk["document_id"],
                "category": chunk["category"],
                "text": chunk["text"],
                "page_number": chunk["page_number"],
                "chunk_id": chunk["chunk_id"]
            })

        return results

rag_engine = RAGEngine()
