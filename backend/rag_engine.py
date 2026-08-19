import math
import re
from typing import List, Dict, Any, Tuple, Optional
from backend.database import db

class RAGEngine:
    def __init__(self):
        self.stop_words = {
            "a", "an", "the", "in", "on", "at", "to", "for", "with", "by", "about",
            "against", "between", "into", "through", "during", "before", "after",
            "above", "below", "from", "up", "down", "is", "are", "was", "were",
            "be", "been", "being", "have", "has", "had", "do", "does", "did", "and",
            "or", "but", "if", "because", "as", "until", "while", "of", "it", "its",
            "what", "which", "who", "whom", "this", "that", "these", "those", "am"
        }

    def tokenize(self, text: str) -> List[str]:
        text = text.lower()
        words = re.findall(r'\b[a-z0-9_₹%-]+\b', text)
        return [w for w in words if w not in self.stop_words and len(w) > 1]

    def sanitize_untrusted_text(self, text: str) -> str:
        """
        Security Defense against Prompt Injection:
        Neutralizes typical prompt injection sequences within document contents so
        untrusted document text cannot hijack LLM execution instructions.
        """
        dangerous_patterns = [
            r"(?i)ignore\s+(all\s+)?(previous|prior)\s+instructions",
            r"(?i)disregard\s+(all\s+)?(system|safety)\s+prompts",
            r"(?i)you\s+are\s+now\s+in\s+developer\s+mode",
            r"(?i)override\s+system\s+role",
            r"(?i)act\s+as\s+an\s+unrestricted\s+ai"
        ]
        sanitized = text
        for pattern in dangerous_patterns:
            sanitized = re.sub(pattern, "[FILTERED_INJECTION_ATTEMPT]", sanitized)
        return sanitized

    def chunk_text(self, document_name: str, raw_text: str, chunk_size: int = 120, overlap: int = 20) -> List[Dict[str, Any]]:
        clean_text = self.sanitize_untrusted_text(raw_text)
        paragraphs = [p.strip() for p in clean_text.split('\n') if p.strip()]
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

    def search_knowledge_base(self, query: str, top_k: int = 4, user_role: str = "ADMIN") -> List[Dict[str, Any]]:
        query_tokens = set(self.tokenize(query))
        if not query_tokens:
            return []

        all_chunks = []
        for doc in db.documents:
            # Document-level RBAC enforcement
            access_roles = doc.get("access_roles", ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER", "SALES_EXECUTIVE", "SUPPORT_AGENT", "VIEWER"])
            if user_role not in access_roles and "SUPER_ADMIN" not in user_role and "ADMIN" not in user_role:
                continue

            doc_chunks = doc.get("chunks", [])
            for chunk in doc_chunks:
                all_chunks.append({
                    "document_id": doc["id"],
                    "document_name": doc["name"],
                    "category": doc.get("category", "General Policy"),
                    "text": chunk["text"],
                    "page_number": chunk.get("page_number", 1),
                    "chunk_id": chunk.get("chunk_id", "chk-1")
                })

        if not all_chunks:
            return []

        scored_chunks: List[Tuple[float, Dict[str, Any]]] = []
        raw_query_lower = query.lower()

        # Semantic keywords mapping
        synonyms_map = {
            "discount": ["discount", "discounting", "pricing", "margin", "prepayment", "commercials", "tiers"],
            "maximum": ["maximum", "max", "threshold", "authority", "matrix", "limit"],
            "policy": ["policy", "guidelines", "protocol", "standards", "compliance"],
            "security": ["security", "soc 2", "iso 27001", "encryption", "dpdpa", "localization", "audit"],
            "sla": ["sla", "uptime", "response", "resolution", "availability", "99.9%"],
            "gst": ["gst", "invoicing", "cgst", "sgst", "igst", "tax", "gstin"],
            "onboarding": ["onboarding", "migration", "timeline", "phases", "training", "setup"]
        }

        expanded_query_tokens = set(query_tokens)
        for q_tok in list(query_tokens):
            for key, syns in synonyms_map.items():
                if key in q_tok or q_tok in key:
                    expanded_query_tokens.update(syns)

        for chunk in all_chunks:
            chunk_tokens = self.tokenize(chunk["text"])
            if not chunk_tokens:
                continue

            # Calculate token overlap against expanded query
            overlap_count = sum(1 for token in expanded_query_tokens if token in chunk_tokens)
            
            # Substring matching bonuses
            chunk_text_lower = chunk["text"].lower()
            bonus = 0.0
            
            # Phrase matching bonus when query contains relevant key phrases
            if ("discount" in raw_query_lower or "pricing" in raw_query_lower) and ("discount" in chunk_text_lower or "pricing" in chunk_text_lower):
                bonus += 0.40
            if ("sla" in raw_query_lower or "uptime" in raw_query_lower) and ("sla" in chunk_text_lower or "uptime" in chunk_text_lower):
                bonus += 0.40
            if ("security" in raw_query_lower or "compliance" in raw_query_lower) and ("security" in chunk_text_lower or "compliance" in chunk_text_lower):
                bonus += 0.40

            for q_word in query_tokens:
                if q_word in chunk_text_lower:
                    bonus += 0.15

            if overlap_count > 0 and bonus > 0:
                # TF-IDF Cosine proxy score
                base_score = (overlap_count / (len(expanded_query_tokens) + 1.0)) * 0.70 + bonus
                final_score = min(round(base_score, 2), 0.98)
                if final_score >= 0.30:
                    scored_chunks.append((final_score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, chunk in scored_chunks[:top_k]:
            results.append({
                "score": score,
                "document_name": chunk["document_name"],
                "document_id": chunk["document_id"],
                "category": chunk["category"],
                "text": chunk["text"],
                "page_number": chunk["page_number"],
                "chunk_id": chunk["chunk_id"]
            })

        return results

rag_engine = RAGEngine()
