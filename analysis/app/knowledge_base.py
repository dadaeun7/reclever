import json
import os
from typing import List, Dict

KNOWLEDGE_BASE: List[Dict] = []

def load_knowledge_base():
    global KNOWLEDGE_BASE
    json_path = os.path.join(os.path.dirname(__file__), '../ai_review_recycling_db.json')

    with open(json_path, 'r', encoding='utf-8') as f:
        db_data = json.load(f)

        for item in db_data:
            KNOWLEDGE_BASE.append({
                "id": item["id"],
                "category_name": item["category_name"],
                "standard_nouns" : set(item["standard_nouns"]),
                "standard_volumes": set(item["standard_volumes"]),
                "material": item["material"],
                "description": item["how_to_dispose"]
            })

load_knowledge_base()