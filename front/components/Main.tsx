"use client";

import React, { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type ScenarioStep =
  | "READY"
  | "EMAIL_FETCH"
  | "RECYCLE_MATCH"
  | "CALENDAR_INSERT";

export default function Main() {
  const [step, setStep] = useState<ScenarioStep>("READY");
  const router = useRouter();

  const { isLoggedIn } = useAuth();
  // 인터랙티브 모션 시나리오 타임라인 루프 제어
  useEffect(() => {
    const runScenario = () => {
      setStep("READY");

      // 1.5초 후: Gmail에서 메일 가져오는 애니메이션 시작
      setTimeout(() => {
        setStep("EMAIL_FETCH");
      }, 1500);

      // 4초 후: 가져온 메일에서 재활용품 재질 추출/매칭 시작
      setTimeout(() => {
        setStep("RECYCLE_MATCH");
      }, 4000);

      // 6.5초 후: 달력에 데이터가 쏙 들어가며 완료 및 가이드 노출
      setTimeout(() => {
        setStep("CALENDAR_INSERT");
      }, 6500);
    };

    runScenario();
    const timer = setInterval(runScenario, 11000); // 11초마다 시나리오 무한 반복

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={styles.appContainer}>
      {/* 인터랙티브 모션 그래픽 전용 keyframes 내장 스타일 코트 */}
      <style>{`
        /* 1단계: 이메일이 위에서 아래로 내려오는 모션 */
        @keyframes emailDown {
          0% { transform: translateY(-20px); opacity: 0; }
          50% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
        /* 2단계: 재질 텍스트가 매칭되며 팝업되는 모션 */
        @keyframes matchPopup {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        /* 3단계: 달력 날짜 카드가 강조되며 라임색 바가 생기는 모션 */
        @keyframes limeBarSpread {
          0% { width: 0; }
          100% { width: 22px; }
        }
        
        .motion-email { animation: emailDown 1.2s infinite ease-in-out; }
        .motion-match { animation: matchPopup 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .motion-lime-bar { animation: limeBarSpread 0.5s ease-out forwards; }
        
        .scroll-hide::-webkit-scrollbar { display: none; }
        .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* 영수증 카드가 팝업되었다가 아래로 날아가며 작아지는 모션 */
        @keyframes receiptDrop {
          0% { transform: translateY(-10px) scale(0.9); opacity: 0; }
          30% { transform: translateY(0) scale(1); opacity: 1; }
          70% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(60px) scale(0.2); opacity: 0; }
        }

        /* 캘린더 내부 9일 셀이 카드를 받아들이며 반짝(Slight Pulse)이는 효과 */
        @keyframes targetCellPulse {
          0% { transform: scale(1); background-color: transparent; }
          50% { transform: scale(1.1); background-color: rgba(180, 230, 0, 0.2); }
          100% { transform: scale(1); background-color: #1A1A1A; }
        }

        .animate-receipt-drop { animation: receiptDrop 1.8s cubic-bezier(0.25, 1, 0.5, 1) infinite; }
        .animate-cell-pulse { animation: targetCellPulse 0.6s ease-out forwards; }
      `}</style>

      <div style={styles.dashboardScrollArea} className="scroll-hide">
        {/* 인트로 메인 카피 */}
        <div style={styles.heroHeaderSection}>
          <p style={styles.limeAccentTagText}>
            수집 가능한 커머스 ✨ 쿠팡 · B마트 · 컬리
          </p>
          <h1 style={styles.heroMainTitleText}>
            재활용 기록을
            <br />
            저장하고 관리합니다.
          </h1>
        </div>

        {/* 🎬 대화형 가이드 모션 그래픽 시나리오 메인 디스플레이 */}
        <div style={styles.motionDisplayPanel}>
          {step === "READY" && (
            <div style={styles.motionStepWrapper}>
              <span style={{ ...styles.stepIndicator, fontSize: "16px" }}>
                {" "}
                . . .{" "}
              </span>
            </div>
          )}

          {step === "EMAIL_FETCH" && (
            <div style={styles.motionStepWrapper}>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <span style={{ ...styles.stepIndicator, color: "#B4E600" }}>
                  1단계: 영수증 메일 수집
                </span>
              </div>
              <div
                style={{
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <div className="motion-email">
                  <Mail size={24} color="#FFFFFF" />
                </div>
              </div>
              <p style={styles.motionSubDesc}>메일 수집중입니다...</p>
            </div>
          )}

          {step === "RECYCLE_MATCH" && (
            <div style={styles.motionStepWrapper}>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <span style={{ ...styles.stepIndicator, color: "#B4E600" }}>
                  2단계: 재질 분류 및 분석
                </span>
              </div>
              <div style={styles.matchFlexContainer}>
                <div className="motion-match" style={styles.matchBadgeItem}>
                  {" "}
                  플라스틱
                </div>
                <div
                  className="motion-match"
                  style={{ ...styles.matchBadgeItem, animationDelay: "0.8s" }}
                >
                  비닐
                </div>
              </div>
            </div>
          )}
          {step === "CALENDAR_INSERT" && (
            <div style={styles.motionStepWrapper}>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <span style={{ ...styles.stepIndicator, color: "#B4E600" }}>
                  3단계: 분석 데이터 저장
                </span>
              </div>
              <div
                style={{
                  height: "50px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* 캘린더로 쏙 떨어지는 가상 영수증 칩 */}
                <div
                  className="animate-receipt-drop"
                  style={styles.floatingReceiptChip}
                >
                  🧾 분석 영수증 데이터 적재
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 캘린더 위젯 카드 (3단계 도달 시 테두리 하이라이트 및 스케일 업) */}
        <div
          style={{
            ...styles.calendarWidgetCard,
            border:
              step === "CALENDAR_INSERT"
                ? "2px solid #B4E600"
                : "2px solid transparent",
            transform: step === "CALENDAR_INSERT" ? "scale(1.01)" : "scale(1)",
            transition: "all 0.3s ease-in-out",
          }}
        >
          <div style={styles.calendarCardMetaHeaderLine}>
            <span style={styles.calendarCardMonthLabel}>26년 3월</span>
            <span style={styles.calendarCardSummaryStats}>
              {step === "CALENDAR_INSERT"
                ? "총 13 · point 13"
                : "총 11 · point 11"}
            </span>
          </div>

          <div style={styles.calendarGridWeekDaysHeader}>
            {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div style={styles.calendarGridDaysContainer}>
            {Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;

              // 시나리오 완료 단계에서는 3월 9일에 불이 들어오고 언더 인디케이터 바가 애니메이션과 함께 드로우됩니다.
              const isSelected =
                step === "CALENDAR_INSERT" ? dayNum === 9 : dayNum === 12;
              const hasStaticIndicator = dayNum === 1;
              const hasDynamicIndicator =
                dayNum === 9 && step === "CALENDAR_INSERT";

              return (
                <div
                  key={dayNum}
                  style={{
                    ...styles.calendarDayCellBox,
                    backgroundColor: isSelected ? "#1A1A1A" : "transparent",
                    color: isSelected ? "#FFFFFF" : "#1D1D1F",
                  }}
                >
                  <span style={{ fontWeight: isSelected ? "700" : "500" }}>
                    {dayNum}
                  </span>
                  {hasStaticIndicator && (
                    <div style={styles.calendarDayLimeIndicatorBar} />
                  )}
                  {hasDynamicIndicator && (
                    <div
                      className="motion-lime-bar"
                      style={styles.calendarDayLimeIndicatorBar}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 하단 세부 분리배출 방법 노출 보드 */}
        <div style={styles.dayDetailLogSection}>
          <h3 style={styles.dayDetailSectionTitle}>
            {step === "CALENDAR_INSERT"
              ? "3월 9일 분리배출 상세 안내"
              : "일자별 분리배출 세부내용"}
          </h3>

          {step === "CALENDAR_INSERT" ? (
            <div style={styles.detailTextItemsListGroup}>
              <div style={styles.detailDataRowItem}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span style={styles.detailDataLabelName}>
                    플라스틱 <strong style={{ color: "#B4E600" }}>+1</strong>
                  </span>
                  <span style={styles.guideDetailText}>
                    내용물을 완전히 비우고 물로 깨끗이 씻은 후 배출합니다.
                  </span>
                </div>
              </div>
              <div style={styles.detailDataRowItem}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span style={styles.detailDataLabelName}>
                    비닐 <strong style={{ color: "#B4E600" }}>+1</strong>
                  </span>
                  <span style={styles.guideDetailText}>
                    유통과정상 복합 비닐 재질이므로 이물질 제거 후 비닐류
                    수거함에 배출합니다.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p style={styles.emptyDetailDataLogText}>
              상단 영수증 시뮬레이션 연동이 완료되면 이곳에 분리배출 핵심
              가이드라인이 매칭되어 출력됩니다.
            </p>
          )}
        </div>

        {/* 액션 버튼 */}
        <div style={styles.bottomFixedActionButtonWrapper}>
          <button
            style={styles.limeActionButtonSubmit}
            onClick={() => router.push(isLoggedIn ? "/settings" : "/login")}
          >
            <span style={styles.limeActionButtonText}>
              Gmail 영수증 불러오기 ↗
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    width: "100%",
    maxWidth: "412px",
    height: "100vh",
    backgroundColor: "#1A1A1A",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    margin: "0 auto",
    boxSizing: "border-box",
    color: "#FFFFFF",
  },
  appHeaderBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    backgroundColor: "#1A1A1A",
    borderBottom: "1px solid #2C2C2E",
  },
  headerActionIconBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#2C2C2E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFF",
    fontSize: "15px",
  },
  dashboardScrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "0 24px 120px 24px",
    display: "flex",
    flexDirection: "column",
  },
  heroHeaderSection: { margin: "24px 0 16px 0" },
  limeAccentTagText: {
    fontSize: "13.5px",
    fontWeight: "700",
    color: "#B4E600",
    marginBottom: "8px",
  },
  heroMainTitleText: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: "1.4",
    letterSpacing: "-0.3px",
  },

  // 시나리오 패널 모션 레이아웃
  motionDisplayPanel: {
    backgroundColor: "#2C2C2E",
    borderRadius: "18px",
    padding: "20px 16px",
    marginBottom: "24px",
    minHeight: "120px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxSizing: "border-box",
  },
  motionStepWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    textAlign: "center",
    alignItems: "center",
  },
  stepIndicator: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#8E8E93",
    padding: "2px 8px",
    borderRadius: "6px",
  },
  motionSubDesc: {
    fontSize: "14px",
    color: "#8E8E93",
    margin: 0,
    lineHeight: "1.4",
    maxWidth: "280px",
  },
  matchFlexContainer: { display: "flex", gap: "6px", margin: "4px 0" },
  matchBadgeItem: {
    backgroundColor: "#1A1A1A",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#fff",
  },

  calendarWidgetCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "24px",
    padding: "20px 16px",
    boxSizing: "border-box",
    color: "#1A1A1A",
    height: "40%",
  },
  calendarCardMetaHeaderLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  calendarCardMonthLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#86868B",
  },
  calendarCardSummaryStats: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#86868B",
  },
  calendarGridWeekDaysHeader: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "600",
    color: "#AEA9A9",
    marginBottom: "8px",
  },
  calendarGridDaysContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "6px",
  },
  calendarDayCellBox: {
    position: "relative",
    aspectRatio: "1",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
  },
  calendarDayLimeIndicatorBar: {
    position: "absolute",
    bottom: "4px",
    left: "25%",
    right: "25%",
    height: "3px",
    backgroundColor: "#B4E600",
    borderRadius: "1.5px",
  },

  dayDetailLogSection: {
    marginTop: "24px",
    borderTop: "1px solid #2C2C2E",
    paddingTop: "20px",
    marginBottom: "20px",
  },
  dayDetailSectionTitle: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#8E8E93",
    marginBottom: "16px",
  },
  detailTextItemsListGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  detailDataRowItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 0",
  },
  detailDataLabelName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#FFFFFF",
  },
  guideDetailText: {
    fontSize: "13px",
    color: "#8E8E93",
    lineHeight: "1.5",
    marginTop: "4px",
  },
  emptyDetailDataLogText: {
    fontSize: "13px",
    color: "#636366",
    lineHeight: "1.5",
    margin: 0,
  },

  bottomFixedActionButtonWrapper: {
    position: "fixed",
    bottom: "24px",
    left: "24px",
    right: "24px",
    zIndex: 50,
    width: "calc(100% - 48px)",
    maxWidth: "300px",
    margin: "0 auto",
  },
  limeActionButtonSubmit: {
    border: "none",
    backgroundColor: "#B4E600",
    borderRadius: "24px",
    width: "100%",
    padding: "16px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    cursor: "pointer",
  },
  limeActionButtonText: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1A1A1A",
  },
  floatingReceiptChip: {
    backgroundColor: "#FFFFFF",
    color: "#1A1A1A",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
};
