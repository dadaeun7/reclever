"use client";

import React, {
  useState,
  useRef,
  useEffect,
  UIEvent,
  MouseEvent,
  useMemo,
} from "react";
import { RecycleInfo } from "./store/useRecycleInfo";
import { formatDateToYYYYMMDD, getLatestDate } from "./Utils";

interface MonthData {
  year: number;
  month: number;
  days: number;
  startVacant: number;
}

interface DailySummary {
  totalCount: number;
  categories: {
    plastic: number;
    glass: number;
    styrofoam: number;
    can: number;
    largeWaste: number;
    generalWaste: number;
    vinyl: number;
    paper: number;
  };
}

export default function InfiniteScrollCalendar({
  getRecycleInfo,
}: Readonly<{
  getRecycleInfo: (
    startDate: string,
    endDate: string,
  ) => Promise<RecycleInfo[]>;
}>) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const todayStr = formatDateToYYYYMMDD(today);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [monthList, setMonthList] = useState<MonthData[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(true);
  const [recycleList, setRecycleList] = useState<RecycleInfo[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 2. recycleList에서 날짜별 존재하는 항목 수집 (초록색 인디케이터 표시용)
  const availableDateSet = useMemo(() => {
    const set = new Set<string>();
    recycleList.forEach((item) => {
      const formattedDate = formatDateToYYYYMMDD(item.orderDate);
      if (formattedDate) set.add(formattedDate);
    });
    return set;
  }, [recycleList]);

  // 3. 선택된 날짜(selectedDate)에 해당하는 재질별 개수 동적 집계
  const currentSummary: DailySummary = useMemo(() => {
    const summary: DailySummary = {
      totalCount: 0,
      categories: {
        plastic: 0,
        glass: 0,
        styrofoam: 0,
        can: 0,
        largeWaste: 0,
        generalWaste: 0,
        vinyl: 0,
        paper: 0,
      },
    };

    // 선택된 날짜의 데이터 필터링
    const targetItems = recycleList.filter(
      (item) => formatDateToYYYYMMDD(item.orderDate) === selectedDate,
    );

    targetItems.forEach((item) => {
      // item.materilas 배열 순회하며 재질 매핑
      const materials = item.materilas || [];
      materials.forEach((mat) => {
        if (mat.includes("플라스틱")) summary.categories.plastic += 1;
        else if (mat.includes("유리")) summary.categories.glass += 1;
        else if (mat.includes("스티로폼")) summary.categories.styrofoam += 1;
        else if (mat.includes("캔")) summary.categories.can += 1;
        else if (mat.includes("폐기물")) summary.categories.largeWaste += 1;
        else if (mat.includes("일반")) summary.categories.generalWaste += 1;
        else if (mat.includes("비닐")) summary.categories.vinyl += 1;
        else if (mat.includes("종이")) summary.categories.paper += 1;
      });
    });

    summary.totalCount = targetItems.length; // 수집된 아이템 개수

    return summary;
  }, [recycleList, selectedDate]);

  const generateMonthData = (year: number, month: number): MonthData => {
    const days = new Date(year, month, 0).getDate();
    const startVacant = new Date(year, month - 1, 1).getDay();
    return { year, month, days, startVacant };
  };

  useEffect(() => {
    const initialMonths: MonthData[] = [];
    for (let i = -3; i <= 3; i++) {
      const targetDate = new Date(currentYear, currentMonth - 1 + i, 1);
      initialMonths.push(
        generateMonthData(targetDate.getFullYear(), targetDate.getMonth() + 1),
      );
    }
    setMonthList(initialMonths);

    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight / 3;
      }
    }, 50);
  }, [currentYear, currentMonth]);

  // 2. monthList 범위가 바뀔 때마다(초기 생성 & 스크롤 추가) 백엔드에 -3~+3 (또는 확장된 전체) 기간 조회
  useEffect(() => {
    if (monthList.length === 0) return;

    const fetchRangeData = async () => {
      // 화면에 존재하는 첫 번째 달의 1일
      const firstMonth = monthList[0];
      const startDate = `${firstMonth.year}-${String(firstMonth.month).padStart(2, "0")}-01`;

      // 화면에 존재하는 마지막 달의 마지막 날
      const lastMonth = monthList[monthList.length - 1];
      const lastDayNum = new Date(lastMonth.year, lastMonth.month, 0).getDate();
      const endDate = `${lastMonth.year}-${String(lastMonth.month).padStart(2, "0")}-${String(lastDayNum).padStart(2, "0")}`;

      const data = await getRecycleInfo(startDate, endDate);
      setRecycleList(data || []);

      if (data.length > 0) {
        const latestDateStr = getLatestDate(data);
        setSelectedDate(latestDateStr);
      }
    };

    fetchRangeData();
  }, [monthList, getRecycleInfo]);

  // 3. 무한 스크롤 이벤트 (위/아래 스크롤 시 monthList에 새 달이 추가되면 위 useEffect가 자동 발동함)
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = container;

    // 아래로 스크롤 (다음 달 추가)
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      const lastMonth = monthList[monthList.length - 1];
      const nextDate = new Date(lastMonth.year, lastMonth.month, 1);
      const newMonth = generateMonthData(
        nextDate.getFullYear(),
        nextDate.getMonth() + 1,
      );
      setMonthList((prev) => [...prev, newMonth]); // monthList 변경 -> useEffect 자동 실행 -> 백엔드 재조회
    }

    // 위로 스크롤 (이전 달 추가)
    if (scrollTop <= 100) {
      const firstMonth = monthList[0];
      const prevDate = new Date(firstMonth.year, firstMonth.month - 2, 1);
      const newMonth = generateMonthData(
        prevDate.getFullYear(),
        prevDate.getMonth() + 1,
      );

      const previousHeight = scrollHeight;
      setMonthList((prev) => [newMonth, ...prev]); // monthList 변경 -> useEffect 자동 실행 -> 백엔드 재조회

      setTimeout(() => {
        if (scrollContainerRef.current) {
          const newHeight = scrollContainerRef.current.scrollHeight;
          scrollContainerRef.current.scrollTop =
            scrollTop + (newHeight - previousHeight);
        }
      }, 0);
    }
  };

  const handleOutsideClick = () => {
    setIsDetailOpen(false);
  };

  const handleDayCellClick = (
    e: MouseEvent<HTMLDivElement>,
    dateStr: string,
  ) => {
    e.stopPropagation();
    setSelectedDate(dateStr);
    setIsDetailOpen(true);
  };

  return (
    <div style={styles.container} onClick={handleOutsideClick}>
      <style>{`
        @keyframes sheetSlideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: sheetSlideUp 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>

      {/* 요일 고정 헤더 */}
      <div style={styles.weekHeader} onClick={(e) => e.stopPropagation()}>
        {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
          <span key={w} style={styles.weekText}>
            {w}
          </span>
        ))}
      </div>

      {/* 무한 스크롤 달력 영역 */}
      <div
        style={styles.calendarScrollArea}
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {monthList.map((m) => (
          <div key={`${m.year}-${m.month}`} style={styles.monthSection}>
            <h2
              style={styles.monthTitle}
              onClick={(e) => e.stopPropagation()}
            >{`${String(m.year).substring(2)}년 ${m.month}월`}</h2>
            <div style={styles.gridDays}>
              {Array.from({ length: m.startVacant }).map((_, i) => (
                <div key={`vacant-${i}`} />
              ))}
              {Array.from({ length: m.days }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${m.year}-${String(m.month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const isSelected = selectedDate === dateStr;

                // 해당 날짜에 데이터 존재 유무 동적 확인
                const hasData = availableDateSet.has(dateStr);

                return (
                  <div
                    key={dateStr}
                    onClick={(e) => handleDayCellClick(e, dateStr)}
                    style={{
                      ...styles.dayCell,
                      backgroundColor: isSelected ? "#333333" : "#F4F5F2",
                    }}
                  >
                    <span
                      style={{
                        ...styles.dayNumber,
                        color: isSelected ? "#ffffff" : "#333333",
                      }}
                    >
                      {dayNum}
                    </span>
                    {hasData && !isSelected && (
                      <div style={styles.greenIndicator} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 하단 상세 시트 영역 */}
      {isDetailOpen && (
        <div
          style={styles.detailBottomSheet}
          className="animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.summaryHeader}>
            <div style={styles.summaryTitleBlock}>
              <span style={styles.summaryTotalText}>
                총{" "}
                <strong style={styles.strongNum}>
                  {currentSummary.totalCount}
                </strong>
              </span>
            </div>
          </div>

          <div style={styles.categoryGrid}>
            <div style={styles.gridColumn}>
              <div style={styles.gridItem}>
                <span>플라스틱</span>
                <strong>{currentSummary.categories.plastic}</strong>
              </div>
              <div style={styles.gridItem}>
                <span>스티로폼</span>
                <strong>{currentSummary.categories.styrofoam}</strong>
              </div>
              <div style={styles.gridItem}>
                <span>대형 폐기물</span>
                <strong>{currentSummary.categories.largeWaste}</strong>
              </div>
              <div style={styles.gridItem}>
                <span>비닐</span>
                <strong>{currentSummary.categories.vinyl}</strong>
              </div>
            </div>
            <div style={styles.gridColumn}>
              <div style={styles.gridItem}>
                <span>유리</span>
                <strong>{currentSummary.categories.glass}</strong>
              </div>
              <div style={styles.gridItem}>
                <span>캔</span>
                <strong>{currentSummary.categories.can}</strong>
              </div>
              <div style={styles.gridItem}>
                <span>일반 쓰레기</span>
                <strong>{currentSummary.categories.generalWaste}</strong>
              </div>
              <div style={styles.gridItem}>
                <span>종이</span>
                <strong>{currentSummary.categories.paper}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    maxWidth: "412px",
    height: "90vh",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  weekHeader: {
    display: "flex",
    justifyContent: "space-around",
    padding: "12px 0",
    borderBottom: "1px solid #eee",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  weekText: {
    fontSize: "14px",
    color: "#666",
    width: "40px",
    textAlign: "center",
    fontWeight: "500",
  },
  calendarScrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "0 16px 20px 16px",
    scrollBehavior: "auto",
  },
  monthSection: { marginBottom: "24px" },
  monthTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#222",
    margin: "32px 0",
    paddingLeft: "4px",
    blockSize: "inline-size",
    inlineSize: "fit-content",
  },
  gridDays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "6px",
  },
  dayCell: {
    background: "#F4F5F2",
    position: "relative",
    height: "48px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.1s ease",
  },
  dayNumber: { fontSize: "14px", fontWeight: "500" },
  greenIndicator: {
    position: "absolute",
    bottom: "6px",
    width: "22px",
    height: "8px",
    backgroundColor: "#B4E600",
    borderRadius: "4px",
  },

  detailBottomSheet: {
    borderTop: "1px solid #EAEAEA",
    backgroundColor: "#ffffff",
    padding: "24px 20px 100px 20px",
    width: "100%",
    boxSizing: "border-box",
    zIndex: 50,
  },
  summaryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  summaryTitleBlock: {
    display: "flex",
    gap: "16px",
    fontSize: "16px",
    color: "#333",
  },
  strongNum: { fontWeight: "700", marginLeft: "4px" },
  menuIconBtn: {
    border: "1px solid #CCCCCC",
    background: "#fff",
    borderRadius: "6px",
    padding: "5px 6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  categoryGrid: { display: "flex", gap: "24px", width: "100%" },
  gridColumn: { flex: 1, display: "flex", flexDirection: "column" },
  gridItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #F0F0F0",
    fontSize: "14px",
    color: "#444",
    fontWeight: "500",
  },
};
