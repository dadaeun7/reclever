"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Package,
  Send,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { RecycleInfo } from "./store/useRecycleInfo";
import { formatDateToYYYYMMDD, getLatestDateObj } from "./Utils";
import CustomLoading from "./CustomLoading";
import CustomAlert from "./CustomAlert";

const CATEGORIES = [
  { id: "all", label: "전체", icon: "/all.png" },
  { id: "paper", label: "종이", icon: "/paper.png" },
  { id: "can", label: "캔", icon: "/can.png" },
  { id: "glass", label: "유리", icon: "/glass.png" },
  { id: "large", label: "폐기물", icon: "/etc.png" },
  { id: "plastic", label: "플라스틱", icon: "/plastic.png" },
  { id: "general", label: "일반", icon: "/normal.png" },
  { id: "vinyl", label: "비닐", icon: "/vinyl.png" },
  { id: "styrofoam", label: "스티로폼", icon: "/styrofoam.png" },
];

export default function DynamicWeeklyDashboard({
  getRecycleInfo,
}: Readonly<{
  getRecycleInfo: (
    startDate: string,
    endDate: string,
  ) => Promise<RecycleInfo[]>;
}>) {
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");
  const [expandedId, setExpandedId] = useState<number>(-1);
  const [weeklyDays, setWeeklyDays] = useState<
    { dateStr: string; dayNum: number; dayLabel: string }[]
  >([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [recycleList, setRecycleList] = useState<RecycleInfo[]>([]);
  const [jobState, setJobState] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    message: "정상적으로 처리되었습니다.",
    type: "success" as "success" | "error" | "info",
    onClose: () => {
      setAlertConfig((props) => ({ ...props, isOpen: false }));
    },
  });

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // 1. baseDate 변경 시 주간 달력 7일(일~토) 생성 및 기본 선택 날짜 지정
  useEffect(() => {
    const daysArray = [];
    const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

    const currentDayOfWeek = baseDate.getDay();
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - currentDayOfWeek);

    for (let i = 0; i < 7; i++) {
      const target = new Date(startOfWeek);
      target.setDate(startOfWeek.getDate() + i);

      daysArray.push({
        dateStr: formatDateToYYYYMMDD(target),
        dayNum: target.getDate(),
        dayLabel: dayLabels[target.getDay()],
      });
    }
    setWeeklyDays(daysArray);
  }, [baseDate]);

  // 2. weeklyDays(주간 날짜 배열)가 결정될 때마다 해당 주의 시작일~종료일로 백엔드 데이터 요청
  useEffect(() => {
    if (weeklyDays.length === 0) return;

    const fetchWeeklyData = async () => {
      const startDate = weeklyDays[0].dateStr; // 일요일
      const endDate = weeklyDays[weeklyDays.length - 1].dateStr; // 토요일

      const data = await getRecycleInfo(startDate, endDate);
      const safeData = data || [];
      setRecycleList(safeData);

      if (safeData.length > 0) {
        const latestDateObj = getLatestDateObj(safeData);
        setSelectedDateStr(formatDateToYYYYMMDD(latestDateObj));
      } else {
        setSelectedDateStr(weeklyDays[0].dateStr);
      }
    };

    fetchWeeklyData();
  }, [weeklyDays, getRecycleInfo]);

  const shiftWeek = (direction: "prev" | "next") => {
    const offset = direction === "prev" ? -7 : 7;
    const newBase = new Date(baseDate);
    newBase.setDate(baseDate.getDate() + offset);
    setBaseDate(newBase);

    // 주 이동 시 새로운 주의 일요일 날짜를 카드 선택 상태로 전환
    const startOfNewWeek = new Date(newBase);
    startOfNewWeek.setDate(newBase.getDate() - newBase.getDay());
    setSelectedDateStr(formatDateToYYYYMMDD(startOfNewWeek));
  };

  const scrollCategories = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      const offset = direction === "left" ? -160 : 160;
      categoryScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const getMonthHeaderLabel = () => {
    return `${baseDate.getFullYear()}년 ${baseDate.getMonth() + 1}월`;
  };

  // 선택된 날짜(selectedDateStr)에 해당하는 데이터만 필터링
  const filteredByDateList = recycleList.filter((item) => {
    if (!selectedDateStr) return true;
    const itemFormattedDate = formatDateToYYYYMMDD(item.orderDate);
    return itemFormattedDate === selectedDateStr;
  });

  const uploadEmail = async () => {
    setIsLoading(true);

    try {
      const result = await fetch("/get/gmail", {
        method: "POST",
        credentials: "include",
      });

      if (!result.ok) throw new Error("get gmail error ...");

      setAlertConfig((props) => ({
        ...props,
        isOpen: true,
      }));

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  // 상품명 직접 입력칸
  const [isDirectFormOpen, setIsDirectFormOpen] = useState(false);
  const [directProductName, setDirectProductName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directProductName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/submit/product?productName=${directProductName}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) throw new Error("직접 등록 실패");

      setAlertConfig({
        isOpen: true,
        message: "상품이 성공적으로 등록되었습니다.",
        type: "success",
        onClose: () => setAlertConfig((props) => ({ ...props, isOpen: false })),
      });

      setDirectProductName("");
      setIsDirectFormOpen(false);

      // 데이터 새로고침
      if (weeklyDays.length > 0) {
        const data = await getRecycleInfo(
          weeklyDays[0].dateStr,
          weeklyDays[weeklyDays.length - 1].dateStr,
        );
        setRecycleList(data || []);
      }
    } catch (error) {
      console.error(error);
      setAlertConfig({
        isOpen: true,
        message: "등록 중 오류가 발생했습니다.",
        type: "error",
        onClose: () => setAlertConfig((props) => ({ ...props, isOpen: false })),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      <style>{`
        .slider-container .netflix-arrow,
        .category-container .netflix-arrow {
          opacity: 0;
          pointer-events: none;
        }
        .slider-container:hover .netflix-arrow,
        .category-container:hover .netflix-arrow {
          opacity: 1;
          pointer-events: auto;
        }

        .netflix-arrow {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 40px;
          background: rgba(255, 255, 255, 0.6);
          border: none;
          color: #111;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: all 0.2s ease;
        }
        .netflix-arrow:hover {
          background: rgba(0, 0, 0, 0.08);
          color: #000;
        }
        .netflix-arrow.left { left: 0; border-radius: 0 8px 8px 0; }
        .netflix-arrow.right { right: 0; border-radius: 8px 0 0 8px; }
        
        .scroll-hide::-webkit-scrollbar { display: none; }
        .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <CustomAlert
        isOpen={alertConfig.isOpen}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={alertConfig.onClose}
      />

      {/* 연동 영역 Wrapper (구글 메일 + 직접 입력) */}
      <div style={styles.syncCardGroup}>
        {/* 구글 메일 연동 카드 */}
        <div style={styles.emailSyncCard}>
          {isLoading ? (
            <div className="flex justify-center">
              <span className="ml-[-5px] text-[20px] animate-[float_2s_infinite_ease-in-out]">
                📤
              </span>
              <CustomLoading imageName="" description="메일 처리중입니다" />
            </div>
          ) : (
            <>
              <div style={styles.emailInfoLine}>
                <div className="flex ml-3 items-center">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
                    alt="Gmail"
                    style={styles.gmailIcon}
                  />
                  <span style={styles.emailAddressText}>
                    dadaeun7@gmail.com
                  </span>
                </div>
                <button
                  style={
                    jobState === "STARTED"
                      ? styles.syncUnFetchBtn
                      : styles.syncFetchBtn
                  }
                  onClick={uploadEmail}
                >
                  {jobState === "STARTED" && (
                    <span style={styles.menuCardTitle}>작업중..</span>
                  )}
                  <Download size={14} color="#FFFFFF" />
                </button>
              </div>

              <div style={styles.syncMetaBlock}>
                <span style={styles.syncLabel}>
                  당일 기준 2주일 단위로 불러옵니다.
                </span>
              </div>
            </>
          )}
        </div>

        {/* 상품명 직접 입력 토글 카드 */}
        <div style={styles.directInputCard}>
          <div
            style={styles.directInputHeader}
            onClick={() => setIsDirectFormOpen(!isDirectFormOpen)}
          >
            <div style={styles.directHeaderLeft}>
              <Package size={16} color="#3b3b3b" />
              <span style={styles.directHeaderTitle}>상품 직접 등록하기</span>
            </div>
            <span style={styles.toggleArrow}>
              {isDirectFormOpen ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </span>
          </div>

          {isDirectFormOpen && (
            <form onSubmit={handleDirectSubmit} style={styles.directForm}>
              <div style={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="상품명을 입력해주세요 (예: 삼다수 500ml)"
                  value={directProductName}
                  onChange={(e) => setDirectProductName(e.target.value)}
                  style={styles.directInput}
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  style={{
                    ...styles.directSubmitBtn,
                  }}
                  disabled={!directProductName.trim() || isSubmitting}
                >
                  <Send size={14} color="#FFFFFF" />
                </button>
              </div>
              <span style={styles.directFormSubText}>
                선택된 날짜({selectedDateStr})로 상품이 바로 등록됩니다.
              </span>
            </form>
          )}
        </div>
      </div>

      {/* 상단 월 선택 타이틀 */}
      <div style={styles.weekBlock}>
        <span style={styles.calendarMonthTitle}>{getMonthHeaderLabel()}</span>
      </div>

      {/* 날짜 카드 영역 (주간 슬라이더) */}
      <div style={styles.weeklySliderWrapper} className="slider-container">
        <button
          onClick={() => shiftWeek("prev")}
          className="netflix-arrow left"
        >
          <ChevronLeft size={24} />
        </button>

        <div style={styles.weeklyDaysLine}>
          {weeklyDays.map((day) => {
            const isSelected = selectedDateStr === day.dateStr;
            return (
              <div
                key={day.dateStr}
                onClick={() => setSelectedDateStr(day.dateStr)}
                style={{
                  ...styles.dayCard,
                  backgroundColor: isSelected ? "#111111" : "#F5F5F7",
                }}
              >
                <span
                  style={{
                    ...styles.cardDayLabel,
                    color: isSelected ? "rgba(255,255,255,0.7)" : "#86868B",
                  }}
                >
                  {day.dayLabel}
                </span>
                <span
                  style={{
                    ...styles.cardDayNum,
                    color: isSelected ? "#FFFFFF" : "#1D1D1F",
                  }}
                >
                  {day.dayNum}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => shiftWeek("next")}
          className="netflix-arrow right"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* 세부내역 및 재질별 카테고리 스크롤 */}
      <div style={styles.detailSection}>
        <div style={styles.categoryWrapper} className="category-container">
          <button
            onClick={() => scrollCategories("left")}
            className="netflix-arrow left"
            style={{ height: "80%" }}
          >
            <ChevronLeft size={19} />
          </button>

          <div
            ref={categoryScrollRef}
            style={styles.materialScrollContainer}
            className="scroll-hide"
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={isActive ? styles.iconTabActive : styles.iconTab}
                >
                  <img style={styles.iconImg} src={cat.icon} alt={cat.label} />
                  <span
                    style={{
                      ...styles.iconTxt,
                      color: isActive ? "#1D1D1F" : "#86868B",
                    }}
                  >
                    {cat.label}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => scrollCategories("right")}
            className="netflix-arrow right"
            style={{ height: "80%" }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* 수집 이력 리스트 */}
        <div style={styles.cardContainer}>
          {filteredByDateList.length > 0 ? (
            filteredByDateList.map((item, i) => {
              const targetCategoryLabel =
                CATEGORIES.find((c) => c.id === activeCategory)?.label || "";

              const hasMatchingMaterial =
                activeCategory === "all" ||
                item.materilas?.some((mat) =>
                  mat.includes(targetCategoryLabel),
                );

              if (!hasMatchingMaterial) return null;

              const isOpen = expandedId === i;
              const displayDate = formatDateToYYYYMMDD(item.orderDate);

              return (
                <div key={i} style={styles.logCard}>
                  <div style={styles.cardMetaLine}>
                    <span style={styles.metaSource}>
                      {item.directInput ? "직접 등록" : "메일 연동"}
                    </span>
                    <span style={styles.metaDate}>{displayDate}</span>
                  </div>

                  <div style={styles.accordionItemWrapper}>
                    <div
                      style={styles.cardClickTitleRow}
                      onClick={() => setExpandedId(isOpen ? -1 : i)}
                    >
                      <div style={styles.productTitleText}>
                        {item.productName.replace(/(.+?)\s*\1+/g, "$1").trim()}
                      </div>
                      <span style={styles.toggleArrow}>
                        {isOpen ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </span>
                    </div>

                    {isOpen && (
                      <div style={styles.expandedGuideBox}>
                        <div style={styles.badgeLine}>
                          {item.materilas?.map((material, matIdx) => (
                            <span key={matIdx} style={styles.matBadge}>
                              {material}
                            </span>
                          ))}
                        </div>
                        <p style={styles.guideParagraph}>{item.description}</p>
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
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    width: "100%",
    height: "90vh",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    overflow: "visible",
    position: "relative",
    margin: "0 auto",
    paddingBottom: "100px",
    boxSizing: "border-box",
  },
  syncCardGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  emailSyncCard: {
    backgroundColor: "#F5F5F7",
    borderRadius: "14px",
    marginInline: "16px",
    padding: "13px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
  },
  emailInfoLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    borderBottom: "1px solid #ececec",
    paddingBottom: "5px",
  },
  gmailIcon: { width: "18px", height: "18px", objectFit: "contain" },
  emailAddressText: {
    marginLeft: "10px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#3A3A3C",
  },
  syncMetaBlock: { display: "flex", flexDirection: "column", gap: "2px" },
  syncLabel: { fontSize: "12.8px", fontWeight: "500", color: "#86868B" },
  syncDate: { fontSize: "15px", fontWeight: "600", color: "#1D1D1F" },
  syncFetchBtn: {
    border: "none",
    backgroundColor: "#2C2C2E",
    borderRadius: "7px",
    padding: "6px 11px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
  },
  syncUnFetchBtn: {
    border: "none",
    backgroundColor: "#838383",
    borderRadius: "7px",
    padding: "6px 11px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  syncFetchText: { fontSize: "12px", fontWeight: "600", color: "#FFFFFF" },
  menuCardTitle: { fontSize: "12px", color: "#FFFFFF" },

  /* 직접 입력 카드 전용 스타일 */
  directInputCard: {
    backgroundColor: "#F5F5F7",
    borderRadius: "14px",
    marginInline: "16px",
    padding: "13px 20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
    transition: "all 0.2s ease",
  },
  directInputHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  directHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  directHeaderTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#3A3A3C",
  },
  directForm: {
    marginTop: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  inputWrapper: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    width: "100%",
    boxSizing: "border-box",
  },
  directInput: {
    flex: 1,
    minWidth: 0,
    boxSizing: "border-box",
    border: "1px solid #E5E5EA",
    borderRadius: "8px",
    padding: "7px 12px",
    fontSize: "13px",
    outline: "none",
    backgroundColor: "#FFFFFF",
    color: "#1D1D1F",
  },
  directSubmitBtn: {
    flexShrink: 0,
    height: "30px",
    width: "36px",
    border: "none",
    backgroundColor: "#2C2C2E",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
  directFormSubText: {
    fontSize: "12px",
    color: "#86868B",
    marginLeft: "2px",
  },

  weekBlock: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "24px 0 12px 0",
    padding: "0 16px",
  },
  calendarMonthTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1D1D1F",
    letterSpacing: "-0.3px",
  },
  weeklySliderWrapper: {
    position: "relative",
    width: "100%",
    padding: "0 16px",
    boxSizing: "border-box",
    marginBottom: "24px",
  },
  weeklyDaysLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    width: "100%",
  },
  dayCard: {
    flex: 1,
    padding: "9px 0",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
    minWidth: 0,
  },
  cardDayLabel: {
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "6px",
    letterSpacing: "-0.1px",
  },
  cardDayNum: { fontSize: "16px", fontWeight: "700" },
  detailSection: {
    flex: 1,
    padding: "0 16px 24px 16px",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  categoryWrapper: {
    position: "relative",
    width: "100%",
    borderTop: "1px solid #E5E5EA",
    boxSizing: "border-box",
  },
  materialScrollContainer: {
    display: "flex",
    gap: "16px",
    overflowX: "auto",
    backgroundColor: "#FFFFFF",
    padding: "16px 0",
    width: "100%",
    boxSizing: "border-box",
    WebkitOverflowScrolling: "touch",
  },
  iconTabActive: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    borderBottom: "2px solid #1D1D1F",
    paddingBottom: "8px",
    minWidth: "60px",
    flexShrink: 0,
  },
  iconTab: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    paddingBottom: "8px",
    minWidth: "60px",
    flexShrink: 0,
  },
  iconImg: {
    width: "24px",
    height: "24px",
    objectFit: "contain",
    marginBottom: "6px",
  },
  iconTxt: { fontSize: "12px", fontWeight: "600", letterSpacing: "-0.2px" },
  cardContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    boxSizing: "border-box",
    paddingTop: "8px",
  },
  logCard: {
    width: "100%",
    boxSizing: "border-box",
    marginBottom: "16px",
    backgroundColor: "rgb(253, 253, 253)",
    padding: "13px 15px 0px 15px",
    borderRadius: "15px",
    border: "1px solid #dfdfdf",
  },
  cardMetaLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #dfdfdf",
    paddingBottom: "5px",
    marginBottom: "2px",
    width: "100%",
    boxSizing: "border-box",
  },
  metaSource: { fontWeight: "600", fontSize: "12.5px", color: "#313133" },
  metaDate: { fontSize: "13px", color: "#86868B" },
  accordionItemWrapper: {
    padding: "11px 0 18px 0",
    width: "100%",
    boxSizing: "border-box",
  },
  cardClickTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    width: "100%",
    boxSizing: "border-box",
    gap: "16px",
  },
  productTitleText: {
    fontWeight: "500",
    fontSize: "14.5px",
    color: "#181818",
    lineHeight: "1.45",
    flex: 1,
    wordBreak: "break-all",
    letterSpacing: "-0.2px",
  },
  toggleArrow: { display: "flex", alignItems: "center", color: "#86868B" },
  expandedGuideBox: { marginTop: "12px", width: "100%" },
  badgeLine: { display: "flex", gap: "6px", marginBottom: "12px" },
  matBadge: {
    fontSize: "12px",
    border: "1px solid #ececf1",
    borderRadius: "8px",
    padding: "3px 10px",
    color: "#48484A",
    backgroundColor: "#F5F5F7",
    fontWeight: "600",
    letterSpacing: "-0.1px",
  },
  guideParagraph: {
    fontSize: "14px",
    color: "#3A3A3C",
    lineHeight: "1.6",
    backgroundColor: "#F5F5F7",
    padding: "14px",
    borderRadius: "12px",
    margin: 0,
    width: "100%",
    boxSizing: "border-box",
    wordBreak: "keep-all",
    letterSpacing: "-0.1px",
  },
  emptyNotification: {
    textAlign: "center",
    color: "#86868B",
    fontSize: "14px",
    paddingTop: "40px",
    fontWeight: "500",
  },
};
