import re
import json
import uvicorn
from pathlib import Path
from typing import List, Tuple, Dict, Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer, util

# 기존 matcher 내 함수 임포트 (기존 경로 유지)
from app.matcher import calculate_containment_score, request_noun_extraction_from_db

current_file_path = Path(__file__).resolve()
BASE_PATH = current_file_path.parent.parent

json_file_path = BASE_PATH / "datas" / "ai_review_recycling_db.json"


if json_file_path.exists():
    with open(json_file_path, "r", encoding="utf-8") as f:
        KNOWLEDGE_BASE = json.load(f)
    print(f"Loaded KNOWLEDGE_BASE from {json_file_path}")
else:
    KNOWLEDGE_BASE = []
    print(f"[Warning] {json_file_path} 파일이 존재하지 않아 빈 리스트로 기동합니다.")

# ----------------------------------------------------
# 2. 전역 객체 선언 및 lifespan(모델 1회 로드) 설정
# ----------------------------------------------------
embedding_model = None
noun_embeddings = None
noun_to_item_map = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    서버 시작 시 단 1번만 임베딩 모델 및 카테고리 벡터를 메모리에 로드합니다.
    """
    global embedding_model

    print("Loading SentenceTransformer Model...")
    embedding_model = SentenceTransformer('snunlp/KR-SBERT-V40K-klueNLI-augSTS')

    refresh_category_embeddings()
    
    print(f"Model loaded. Total {len(noun_to_item_map)} nouns embedded successfully.")

    yield  # 서버 동작 구간

app = FastAPI(
    title="Recycling Matching & Learning Integrated Service",
    lifespan=lifespan
)

def refresh_category_embeddings():
    """새로운 카테고리가 추가되거나 변경되었을 때 임베딩 벡터를 갱신하는 함수"""
    global noun_embeddings, noun_to_item_map

    all_nouns = []
    noun_to_item_map = []

    for item in KNOWLEDGE_BASE:
        for noun in item.get("standard_nouns",[]):
            if noun:
                all_nouns.append(noun)
                noun_to_item_map.append(item)

    if all_nouns and embedding_model:
        noun_embeddings = embedding_model.encode(all_nouns, convert_to_tensor=True)
        print("[Embedding Sync] Category embeddings updated successfully.")

# ----------------------------------------------------
# 3. Pydantic 스키마 정의
# ----------------------------------------------------
class MatchResultResponse(BaseModel):
    matched_category: str
    materials: List[str]
    description: str
    matching_score: float

class KBUpdateResult(BaseModel):
    action: str = Field(description="이 상품에 대한 처리 동작: 'UPDATE_EXISTING' 또는 'CREATE_NEW'")
    target_category_id: Optional[int] = Field(None, description="UPDATE_EXISTING일 경우 대상 카테고리 ID")
    category_name: str = Field(description="카테고리명")
    new_nouns_to_add: List[str] = Field(description="추가할 한글 명사 리스트")
    new_volumes_to_add: List[str] = Field(description="추가할 용량 규격 리스트")
    material: List[str] = Field(description="재질 정보")
    how_to_dispose: str = Field(description="분리배출 가이드 설명 문장")

class MatchRequest(BaseModel):
    product_name: str

# ----------------------------------------------------
# 4. 핵심 매칭 및 LLM 내부 로직
# ----------------------------------------------------
async def match_product_semantic(product_name: str) -> Tuple[Dict, float]:
    if len(KNOWLEDGE_BASE) == 0:
        raise HTTPException(status_code=500, detail="지식 베이스가 비어 있어 임베딩 매칭을 수행할 수 없습니다.")
    
    if embedding_model is None:
        raise HTTPException(status_code=500, detail="임베딩 모델이 초기화되지 않았습니다.")

    def _compute_similarity():
        query_embedding = embedding_model.encode(product_name, convert_to_tensor=True)
        cos_scores = util.cos_sim(query_embedding, noun_embeddings)[0]
        
        best_idx = cos_scores.argmax().item()
        highest_score = cos_scores[best_idx].item()

        matched_item = noun_to_item_map[best_idx]
        
        return matched_item, round(highest_score, 4)

    return await run_in_threadpool(_compute_similarity)
# ----------------------------------------------------
# 5. API 엔드포인트
# ----------------------------------------------------
@app.post("/api/v1/match-product", response_model=MatchResultResponse)
async def match_product_spec(req: MatchRequest):
    product_name = req.product_name

    # --- [개선] 1. 수량/용량/색상 등 노이즈 문자열 1차 정제 ---
    clean_name = re.sub(r'\d+\s*(?:g|kg|l|ml|개입|세트|%|개)', '', product_name, flags=re.IGNORECASE)
    clean_name = re.sub(r'[,\[\]\(\)\-_]', ' ', clean_name).strip()

    # --- 2. 정제된 이름 기반으로 용량 및 명사 추출 ---
    input_volumes_list = re.findall(r'\d+\s*(?:g|kg|l|ml|개입)', product_name, re.IGNORECASE)
    
    extracted_nouns = request_noun_extraction_from_db(clean_name)
    input_nouns_list = list(extracted_nouns)
    
    best_match_keyword = None
    highest_score_keyword = -1.0
    MATCH_THRESHOLD = 0.25  # Containment 스코어 기준치 (입력 단어 중 최소 25% 이상 일치)
    
    for item in KNOWLEDGE_BASE:
        # calculate_containment_score 내부에서 (교집합 / 입력단어수) 로직 수행
        score = calculate_containment_score(input_nouns_list, input_volumes_list, item)
        
        if score > highest_score_keyword:
            highest_score_keyword = score
            best_match_keyword = item

    category_name = best_match_keyword.get("category_name", '알 수 없는 카테고리')

    if 'category_name' not in best_match_keyword:
        print(f"[Warning] 'category_name' 키가 없는 항목 발견: {best_match_keyword}")

    # 키워드 매칭 점수가 안정적(0.25 이상)이면 즉시 해당 매칭 결과 반환
    if best_match_keyword and highest_score_keyword >= MATCH_THRESHOLD:
        print(f"[Keyword Hit] Score: {round(highest_score_keyword, 4)} - Category: {category_name}")
        return MatchResultResponse(
            matched_category=category_name,
            materials=best_match_keyword["material"],
            description=best_match_keyword["how_to_dispose"],
            matching_score=round(highest_score_keyword, 4)
        )
        
    # --- 3단계 (Fallback): 키워드 매칭 실패 시 임베딩(시맨틱) 매칭 ---
    print(f"[Keyword Fail] Score: {round(highest_score_keyword, 4)}. Falling back to Semantic Matching...")
    
    best_match_semantic, highest_score_semantic = await match_product_semantic(product_name)
    SEMANTIC_THRESHOLD = 0.35  # 의미론적 유사도 최소 기준치
    
    if highest_score_semantic >= SEMANTIC_THRESHOLD:
        print(f"[Semantic Hit] Score: {highest_score_semantic} - Category: {best_match_semantic['category_name']}")
        return MatchResultResponse(
            matched_category=best_match_semantic["category_name"],
            materials=best_match_semantic["material"],
            description=best_match_semantic["how_to_dispose"],
            matching_score=highest_score_semantic
        )
    
    # 모두 실패하면 최종 444 에러 발생
    raise HTTPException(status_code=444, detail="미분류 품목")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)