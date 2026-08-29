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
import RecycleInfoList from "./RecycleInfoList";
import { styles } from "./css/DaySelectStyle";
import { userInfo } from "./store/userInfo";

export const CATEGORIES = [
  { id: "all", label: "전체", icon: "/all.png", keywords: ["all", "전체"] },
  {
    id: "paper",
    label: "종이",
    icon: "/paper.png",
    keywords: ["paper", "종이", "종이팩"],
  },
  { id: "can", label: "캔", icon: "/can.png", keywords: ["can", "캔", "고철"] },
  {
    id: "glass",
    label: "유리",
    icon: "/glass.png",
    keywords: ["glass", "유리", "유리병"],
  },
  {
    id: "large",
    label: "폐기물",
    icon: "/etc.png",
    keywords: ["large", "etc", "폐기물", "대형"],
  },
  {
    id: "plastic",
    label: "플라스틱",
    icon: "/plastic.png",
    keywords: [
      "plastic",
      "플라스틱",
      "pet",
      "페트",
      "페트병",
      "투명페트",
      "투명 페트",
    ], // 👈 페트류 키워드 추가
  },
  {
    id: "general",
    label: "일반",
    icon: "/normal.png",
    keywords: ["general", "normal", "일반", "종량제"],
  },
  {
    id: "vinyl",
    label: "비닐",
    icon: "/vinyl.png",
    keywords: ["vinyl", "비닐"],
  },
  {
    id: "styrofoam",
    label: "스티로폼",
    icon: "/styrofoam.png",
    keywords: ["styrofoam", "스티로폼"],
  },
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

  const { email } = userInfo();
  const [isLoadingRecommand, setIsLoadingRecommand] = useState<boolean>(false);

  const [recommandInfo, setRecommandInfo] = useState<RecycleInfo[]>([]);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [isRecommandOpen, setIsRecommandOpen] = useState<boolean>(false);

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

    setIsRecommandOpen(false);
    fetchWeeklyData();
  }, [weeklyDays]);

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

  const popupHandler = (
    message: string,
    success: "success" | "error" | "info",
  ) => {
    setAlertConfig({
      isOpen: true,
      message: message,
      type: success,
      onClose: () => setAlertConfig((props) => ({ ...props, isOpen: false })),
    });
  };
  const handleDirectSubmit = async (e: React.SubmitEvent) => {
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

      popupHandler("상품이 성공적으로 등록되었습니다.", "success");

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
      popupHandler("등록 중 오류가 발생했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const recommandRecycle = async (productName: string) => {
    try {
      setIsLoadingRecommand(true);
      const result = await fetch(`/get/recommand?productName=${productName}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!result.ok) throw new Error("추천 서비스 불러오기 실패");

      const data = await result.json();
      setRecommandInfo(data as RecycleInfo[]);
    } catch (error) {
      console.log("AI 재 추천 서비스 중 에러 발생: ", error);
      popupHandler("추천 내용을 불러오던 중 오류가 발생했습니다.", "error");
    } finally {
      setIsLoadingRecommand(false);
    }
  };

  const updateRecycleInfo = async (
    recycleId: number,
    material: string[],
    description: string,
  ) => {
    try {
      popupHandler("업데이트 중 ...", "info");
      const submit = await fetch(`/update/recycle?id=${recycleId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          material: material,
          description: description,
        }),
      });

      if (!submit.ok) throw new Error("재활용 정보 업데이트 중 에러");

      popupHandler("업데이트 완료 되었습니다!", "success");
      setRecycleList((prev) =>
        prev.map((item) => {
          if (item.id === recycleId) {
            return {
              ...item,
              materilas: material,
              description: description,
            };
          }
          return item;
        }),
      );
    } catch (error) {
      console.error("재활용품 업데이트 중 에러 발생: ", error);
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
                  <span style={styles.emailAddressText}>{email}</span>
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
                  placeholder="상품명을 입력해주세요."
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
          <RecycleInfoList
            filteredByDateList={filteredByDateList}
            activeCategory={activeCategory}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            recommandRecycle={recommandRecycle}
            recommandInfo={recommandInfo}
            isLoadingRecommand={isLoadingRecommand}
            isRecommandOpen={isRecommandOpen}
            setIsRecommandOpen={setIsRecommandOpen}
            updateRecycleInfo={updateRecycleInfo}
          />
        </div>
      </div>
    </div>
  );
}
