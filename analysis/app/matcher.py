# app/matcher.py
import re
from typing import List

def request_noun_extraction_from_db(text: str) -> List[str]:
    # 특수문자 제거 후 공백 단위로 1차 분리
    cleaned_text = re.sub(r'[^가-힣a-zA-Z0-9\s]', ' ', text)
    words = cleaned_text.split()

    # 실무 규칙: 2글자 이상이며, 순수 한글로만 이루어진 단어를 명사로 가정한 정제 루틴
    nouns = [word for word in words if len(word) >= 2 and re.match(r'^[가-힣]+$', word)]
    return nouns


def _count_matched_nouns(db_noun: str, input_nouns: list) -> int:
    """단일 DB 상품명 내에 포함된 입력 명사의 개수를 반환하는 헬퍼 함수"""
    db_noun_lower = db_noun.lower()
    return sum(1 for noun in input_nouns if noun.lower() in db_noun_lower)


def calculate_containment_score(
    input_nouns: list,
    input_volumes: list,
    item: dict
) -> float:
    if not input_nouns:
        return 0.0

    db_nouns = item.get("standard_nouns", [])
    db_volumes = item.get("standard_volumes", [])

    # 1. 헬퍼 함수 및 max를 활용해 중첩 loop 제거 (복잡도 감소)
    max_matched_count = max(
        (_count_matched_nouns(db_noun, input_nouns) for db_noun in db_nouns),
        default=0
    )
    noun_score = max_matched_count / len(input_nouns)

    volume_bonus = 0.0
    if noun_score > 0 and input_volumes:
        db_volumes_clean = {v.lower().strip() for v in db_volumes if v and v != "없음"}
        if any(vol.lower().strip() in db_volumes_clean for vol in input_volumes):
            volume_bonus = 0.15

    total_score = noun_score + volume_bonus

    return round(min(total_score, 1.0), 4)