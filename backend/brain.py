from utils.websearch import search_web
from utils.storage import save_knowledge, load_knowledge
import re
import json

class YuyaBrain:
    def __init__(self):
        self.knowledge_base = load_knowledge()

    def process_message(self, message, user_id):
        # Check if we have a cached response
        cached_response = self._check_knowledge_base(message)
        if cached_response:
            return cached_response

        # Search the web if we don't have a cached response
        search_results = search_web(message)
        if search_results:
            response = self._format_response(search_results)
            # Save the new knowledge
            self._update_knowledge_base(message, response)
            return response

        return "Je ne peux pas trouver d'information pertinente pour votre demande."

    def _check_knowledge_base(self, message):
        # Simple keyword matching for now
        keywords = self._extract_keywords(message.lower())
        
        for entry in self.knowledge_base:
            if any(keyword in entry['question'].lower() for keyword in keywords):
                return entry['answer']
        return None

    def _update_knowledge_base(self, question, answer):
        self.knowledge_base.append({
            'question': question,
            'answer': answer
        })
        save_knowledge(self.knowledge_base)

    def _format_response(self, raw_response):
        # Clean and format the response
        formatted = re.sub(r'\s+', ' ', raw_response).strip()
        
        # Highlight keywords
        keywords = self._extract_keywords(formatted)
        for keyword in keywords:
            formatted = formatted.replace(
                keyword,
                f'<keyword>{keyword}</keyword>'
            )
        
        return formatted

    def _extract_keywords(self, text):
        # Simple keyword extraction
        words = text.split()
        # Filter common words and keep significant ones
        keywords = [word for word in words if len(word) > 3]
        return list(set(keywords))  # Remove duplicates