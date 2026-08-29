"use client";

import {
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  SquareCheck,
} from "lucide-react";
import { CATEGORIES } from "./DaySelect";
import { Tooltip } from "./share/ToolTip";
import { RecycleInfo } from "./store/useRecycleInfo";
import { formatDateToYYYYMMDD } from "./Utils";
import { useState } from "react";
import { styles } from "./css/DaySelectStyle";

export default function RecycleInfoList({
  filteredByDateList,
  activeCategory,
  expandedId,
  setExpandedId,
  recommandRecycle,
  recommandInfo,
  isLoadingRecommand,
  isRecommandOpen,
  setIsRecommandOpen,
  updateRecycleInfo,
}: Readonly<{
  filteredByDateList: RecycleInfo[];
  activeCategory: string;
  expandedId: number;
  setExpandedId: React.Dispatch<React.SetStateAction<number>>;
  recommandRecycle: (productName: string) => Promise<void>;
  recommandInfo: RecycleInfo[];
  isLoadingRecommand: boolean;
  isRecommandOpen: boolean;
  setIsRecommandOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updateRecycleInfo: (
    recycleId: number,
    material: string[],
    description: string,
  ) => Promise<void>;
}>) {
  const [activeRecommandId, setActiveRecommandId] = useState<number | null>(
    null,
  );

  const normalize = (str: string) => str.replace(/\s+/g, "").toLowerCase();

  return (
    <>
      {filteredByDateList.length > 0 ? (
        filteredByDateList.map((item, i) => {
          const selectedCategoryObj = CATEGORIES.find(
            (c) => c.id === activeCategory,
          );

          // 3. '전체(all)' 선택 시 모든 항목 노출
          let hasMatchingMaterial = true;

          if (activeCategory !== "all" && selectedCategoryObj) {
            const categoryKeywords =
              selectedCategoryObj.keywords.map(normalize);

            // item.materilas 배열 중 하나라도 카테고리 키워드와 매칭되는지 확인
            hasMatchingMaterial =
              item.materilas?.some((mat) => {
                const normalizedMat = normalize(mat);
                return categoryKeywords.some(
                  (keyword) =>
                    normalizedMat.includes(keyword) ||
                    keyword.includes(normalizedMat),
                );
              }) ?? false;
          }

          // 매칭되지 않는 항목은 렌더링 제외
          if (!hasMatchingMaterial) return null;

          const recommandShow = isRecommandOpen && activeRecommandId === i;
          const isOpen = expandedId === i;
          const displayDate = formatDateToYYYYMMDD(item.orderDate);

          return (
            <div key={item.id} style={styles.logCard}>
              {/* 1. 상단 메타 영역 */}
              <div style={styles.cardMetaLine}>
                <span style={styles.metaSource}>
                  {item.directInput ? "직접 등록" : "메일 연동"}
                </span>
                <span style={styles.metaDate}>{displayDate}</span>
              </div>

              <div style={styles.accordionItemWrapper}>
                {/* 2. 타이틀 & 액션 버튼 행 */}
                <div style={styles.cardClickTitleRow}>
                  <div style={styles.productTitleText}>
                    {item.productName.replace(/(.+?)\s*\1+/g, "$1").trim()}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* AI 추천 버튼 (21st.dev 스타일의 AI 액션 버튼) */}
                    <Tooltip
                      style={{ padding: "2px 4px" }}
                      content="AI 추천 배출법 불러오기"
                    >
                      <button
                        type="button"
                        className={`relative inline-flex items-center justify-center rounded-sm text-xs font-medium transition-all duration-200 ${
                          isLoadingRecommand && isRecommandOpen
                            ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                            : "hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 active:scale-95"
                        }`}
                        style={{ padding: "4px" }}
                        onClick={() => {
                          if (activeRecommandId === i && isRecommandOpen) {
                            setIsRecommandOpen(false);
                            setActiveRecommandId(null);
                          } else {
                            setActiveRecommandId(i);
                            setIsRecommandOpen(true);
                            recommandRecycle(item.productName);
                          }
                        }}
                      >
                        <Bot
                          size={16}
                          className={`mr-1 transition-transform ${
                            isLoadingRecommand && isRecommandOpen
                              ? "animate-pulse text-indigo-500"
                              : ""
                          }`}
                        />
                      </button>
                    </Tooltip>

                    {/* 상세 배출 방법 토글 버튼 */}
                    <Tooltip
                      content="기존 상세 배출 방법"
                      style={{ padding: "2px 4px" }}
                    >
                      <button
                        type="button"
                        className="text-slate-500 hover:bg-slate-100 rounded-sm transition-all"
                        style={{ padding: "4px" }}
                        onClick={() => {
                          setExpandedId(isOpen ? -1 : i);
                        }}
                      >
                        {isOpen ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                    </Tooltip>
                  </div>
                </div>

                {/* 3. 기존 표준 배출 정보 영역 */}
                {isOpen && (
                  <div style={styles.expandedGuideBox}>
                    <div
                      style={styles.badgeLine}
                      className="flex flex-wrap gap-1"
                    >
                      {item.materilas?.map((material, matIdx) => (
                        <span
                          key={`material-${material}-${matIdx}`}
                          style={{
                            padding: "5px 8px",
                            color: "#636363",
                            borderColor: "#acacac",
                          }}
                          className="text-[13px] bg-gray-100 border-gray-200 rounded-lg font-medium text-slate-700"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                    <p
                      style={styles.guideParagraph}
                      className="text-sm text-slate-600 leading-relaxed"
                    >
                      {item.description}
                    </p>
                  </div>
                )}

                {/* 4. AI 추천 배출법 영역 (NEW & ENHANCED) */}
                {recommandShow && (
                  <div
                    className="border-t border-dashed border-indigo-200/80"
                    style={{ marginTop: "8px" }}
                  >
                    {/* AI Section Header */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div
                        className="inline-flex items-center gap-1 rounded-full text-indigo-700 text-[13px] font-semibold"
                        style={{ padding: "5px 0px" }}
                      >
                        <Sparkles
                          size={13}
                          className="text-indigo-500 animate-spin-slow"
                        />
                        <span>AI 재추천 내용</span>
                      </div>
                      {isLoadingRecommand && (
                        <span className="text-[11px] text-indigo-500 animate-pulse font-medium">
                          AI가 최적의 분류법을 분석하는 중...
                        </span>
                      )}
                    </div>

                    {/* 4-A. Loading State Animation (Skiper UI 스타일 Shimmer) */}
                    {isLoadingRecommand ? (
                      <div className="flex flex-col gap-1 rounded-xl bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-white animate-pulse">
                        <div className="flex gap-1.5">
                          <div className="h-7 bg-indigo-100/60 rounded-md w-12"></div>
                          <div className="h-7 bg-indigo-100/60 rounded-md w-16"></div>
                        </div>
                        <div className="h-7 bg-indigo-100/50 rounded w-full"></div>
                      </div>
                    ) : (
                      /* 4-B. AI Recommended List (Loaded State with Smooth Transition) */
                      recommandInfo.length > 0 && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          {recommandInfo.map((recItem, idx) => (
                            <div
                              key={`recommand-${recItem.orderDate}`}
                              className="relative rounded-xl bg-gradient-to-br from-indigo-50/50 via-purple-50/20 to-white border border-indigo-100/80 shadow-xs hover:shadow-sm transition-all duration-200 group"
                              style={{ padding: "5px", marginBottom: "5px" }}
                            >
                              {/* 추천 순번 Badge */}
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className="inline-flex items-center gap-1 text-[12px] font-bold text-indigo-600 tracking-wider"
                                  style={{
                                    padding: "2px 4px",
                                    margin: "3px 0px 6px 0px",
                                  }}
                                >
                                  <CheckCircle2
                                    size={12}
                                    className="text-indigo-500"
                                  />
                                  추천 {idx + 1}
                                </span>

                                <Tooltip
                                  content="이 추천으로 업데이트"
                                  style={{ padding: "2px 4px" }}
                                >
                                  <button
                                    type="button"
                                    className="hover:bg-gray-100 rounded-sm transition-all"
                                    style={{ padding: "4px" }}
                                    onClick={() => {
                                      updateRecycleInfo(
                                        item.id,
                                        recItem.materilas,
                                        recItem.description,
                                      );
                                      setIsRecommandOpen(false);
                                      setExpandedId(isOpen ? -1 : i);
                                    }}
                                  >
                                    <span>
                                      <SquareCheck
                                        size={18}
                                        className="text-gray-500 animate-spin-slow"
                                      />
                                    </span>
                                  </button>
                                </Tooltip>
                              </div>

                              {/* AI 추출 소재 Badge */}
                              <div
                                className="flex flex-wrap gap-1 mb-2"
                                style={{ padding: "0px 4px" }}
                              >
                                {recItem.materilas?.map((m, matIdx) => (
                                  <span
                                    key={`material-${m}-${matIdx}`}
                                    style={{ padding: "2px 5.5px 1px 5.5px" }}
                                    className="text-[13px] font-medium text-slate-600 border border-indigo-100 rounded-md"
                                  >
                                    {m}
                                  </span>
                                ))}
                              </div>

                              {/* 가이드 설명 */}
                              <p
                                className="text-[13.5px] text-slate-700 leading-relaxed font-normal"
                                style={{ padding: "6px 6px 8px 6px" }}
                              >
                                {recItem.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div style={styles.emptyNotification}>
          선택하신 날짜에 완제품 수집 내역이 없습니다.
        </div>
      )}
    </>
  );
}
