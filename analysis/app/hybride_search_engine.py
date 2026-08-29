import chromadb
from chromadb.utils import embedding_functions
from rank_bm25 import BM25Okapi
from kiwipiepy import Kiwi
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent
CHROMA_DATA_PATH = BASE / "extract" / "chroma_db_data"
KIWI_BASE = BASE.parent / "datas" / "user_dict.txt"

kiwi = Kiwi()
if KIWI_BASE.exists():
    kiwi.load_user_dictionary(str(KIWI_BASE))

ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="BAAI/bge-m3"
)

chroma_client = chromadb.PersistentClient(path=CHROMA_DATA_PATH)
collection = chroma_client.get_collection(
    name="recycling_db",
    embedding_function=ef
)

def tokenize_korean(text: str) -> list[str]:
    clean_text = re.sub(r'\[.*?\]|\(.*?\)|【.*?】', '', str(text)).strip()
    clean_text = re.sub(r'\d+(?:\.\d+)?\s*(?:ml|l|g|kg|ml|L|G|KG|개|입|개입)?', '', clean_text, flags=re.IGNORECASE)

    tokenz = kiwi.space(clean_text)
    clean_text_korean = re.sub(r'[^가-힣\s]', ' ', tokenz)
    space_tokens = [w for w in clean_text_korean.split() if len(w) > 0]

    return space_tokens if space_tokens else clean_text.split()


def get_all_chroma_data(batch_size: int = 5000):
    total_count = collection.count()
    db_ids = []
    documents = []
    metadatas = []

    for offset in range(0, total_count, batch_size):
        batch_data = collection.get(
            limit=batch_size,
            offset=offset,
            include=["documents", "metadatas"]
        )
        db_ids.extend(batch_data["ids"])
        documents.extend(batch_data["documents"])
        metadatas.extend(batch_data["metadatas"])

    return db_ids, documents, metadatas


db_ids, documents, metadatas = get_all_chroma_data()
tokenized_corpus = [tokenize_korean(doc) for doc in documents]
bm25 = BM25Okapi(tokenized_corpus)

def hybrid_search_rrf(query: str, rrf_k: int = 60):
    query_tokens = tokenize_korean(query)
    bm25_scores = bm25.get_scores(query_tokens)
    bm25_top_indices = bm25_scores.argsort()[::-1][:20]

    chroma_res = collection.query(
        query_texts=[query],
        n_results=20
    )
    vector_top_ids = chroma_res["ids"][0]

    rrf_scores = {}

    for rank, idx in enumerate(bm25_top_indices, start=1):
        doc_id = db_ids[idx]
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (rrf_k + rank))

    for rank, doc_id in enumerate(vector_top_ids, start=1):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (rrf_k + rank))

    best_id, best_rrf_score = max(rrf_scores.items(), key=lambda x: x[1])
    best_doc_idx = db_ids.index(best_id)

    return {
        "matched_id": best_id,
        "product_name": documents[best_doc_idx],
        "metadata": metadatas[best_doc_idx],
        "rrf_score": best_rrf_score
    }

def rating_hybrid_score(query: str, top_k: int=3, rrf_k: int=60):
    query_tokens = tokenize_korean(query)
    bm25_scores = bm25.get_scores(query_tokens)
    bm25_top_indices = bm25_scores.argsort()[::-1][:20]

    chroma_res = collection.query(
        query_texts=[query],
        n_results=20
    )
    vector_top_ids = chroma_res["ids"][0]

    rrf_scores = {}

    for rank, idx in enumerate(bm25_top_indices, start=1):
        doc_id = db_ids[idx]
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (rrf_k + rank))

    vector_top_add = 1.5
    for rank, doc_id in enumerate(vector_top_ids, start=1):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (vector_top_add * (1.0 / (rrf_k + rank)))

    sorted_ids = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)[:top_k]

    results = []
    for doc_id, score in sorted_ids:
        doc_idx = db_ids.index(doc_id)
        results.append({
            "matched_id": doc_id,
            "product_name": documents[doc_idx],
            "metadata": metadatas[doc_idx],
            "rrf_score": score
        })

    return results