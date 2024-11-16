# storage.py
import json
import os

KNOWLEDGE_FILE = 'knowledge_base.json'
CONVERSATIONS_DIR = 'conversations'

def save_knowledge(knowledge_base):
    with open(KNOWLEDGE_FILE, 'w', encoding='utf-8') as f:
        json.dump(knowledge_base, f, ensure_ascii=False, indent=2)

def load_knowledge():
    if os.path.exists(KNOWLEDGE_FILE):
        with open(KNOWLEDGE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_conversation(user_id, conversation):
    os.makedirs(CONVERSATIONS_DIR, exist_ok=True)
    file_path = os.path.join(CONVERSATIONS_DIR, f"{user_id}.json")
    
    conversations = []
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            conversations = json.load(f)
    
    conversations.append(conversation)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(conversations, f, ensure_ascii=False, indent=2)

def load_conversations(user_id):
    file_path = os.path.join(CONVERSATIONS_DIR, f"{user_id}.json")
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []