"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const guidList = [
  ["네이버 → gmail에 연동하기", "/settings/naver"],
  ["다음 → gmail에 연동하기", "/settings/daum"],
  ["컬리 수신 이메일 변경하기", "/settings/kerly"],
  ["배달의 민족 수신 이메일 변경하기", "/settings/baemin"],
  ["쿠팡 수신 이메일 변경하기", "/settings/coupang"],
];

export default function SettingsPage() {
  return (
    <div style={styles.appContainer}>
      {/* 스크롤 가능한 메인 콘텐츠 영역 */}
      <div style={styles.scrollContent} className="scroll-hide">
        {/* 자주 묻는 질문 (FAQ) 가이드 보드 섹션 */}
        <div style={styles.faqContainerCard}>
          <div style={styles.faqHeaderLine}>
            <div style={styles.faqBadge}>자주 묻는 질문</div>
            {/* 이메일 일러스트 아이콘 데코레이션 */}
            <span style={styles.faqDecorIcon}>✉️</span>
          </div>

          <h2 style={styles.faqQuestionText}>
            다른 이메일로 연동할 수 없나요?
          </h2>

          <div style={styles.faqAnswerParagraph}>
            <p style={styles.pText}>
              아쉽게도 네이버나 다음은 내부 정책으로 메일을 수집할 수 없어요.
            </p>
            <p style={styles.pText}>
              다만 gmail의 계정 및 가져오기 기능으로 네이버와 다음 메일을
              가져오거나,
            </p>
            <p style={styles.pText}>
              각 쇼핑몰별 수신 이메일을 변경하는 방법도 있으니 아래 내용을
              참고해주세요.
            </p>
          </div>
          <div style={styles.guideLinkList}>
            {/* 가이드 네비게이션 링크 목록 */}
            {guidList.map((prop, index) => (
              <div key={index} style={styles.guideLinkList}>
                {/* prop[1]에는 주소('/naver' 등), prop[0]에는 타이틀이 들어있습니다. */}
                <Link href={prop[1]}>
                  <div style={styles.linkListItem}>
                    <span>{prop[0]}</span>
                    <ChevronRight size={16} color="#86868B" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// OS 표준 컴플라이언스(8px 그리드 시스템)를 만족하는 디자인 가이드 명세
const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    width: "100%",
    padding: "24px 0",
    height: "90vh",
    backgroundColor: "#F5F5F7",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    margin: "0 auto",
    boxSizing: "border-box",
  },

  // 헤더 바 스타일
  headerBlock: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    backgroundColor: "transparent",
  },
  logoCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#2C2C2E",
    color: "#FFFFFF",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "700",
    fontSize: "16px",
  },
  bellIconBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },

  // 내부 스크롤뷰
  scrollContent: {
    flex: 1,
    overflowY: "auto",
    padding: "0 16px 100px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  // 프로필 메인 블록
  userProfileSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    margin: "4px 0 6px 0",
  },
  userNameText: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1D1D1F",
    marginBottom: "8px",
    letterSpacing: "-0.3px",
  },
  pointBadge: {
    backgroundColor: "#FFFFFF",
    padding: "6px 16px",
    borderRadius: "20px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
    marginBottom: "12px",
  },
  pointBadgeText: { fontSize: "15px", fontWeight: "700", color: "#1D1D1F" },
  subDescriptionText: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#86868B",
    letterSpacing: "-0.1px",
  },

  // 단일 링크 카드형 행 (영수증 등록)
  menuCardRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: "14px",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
    transition: "background-color 0.2s",
  },
  menuCardTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1D1D1F",
    letterSpacing: "-0.2px",
  },
  iconCircleAction: {
    width: "32px",
    height: "32px",
    borderRadius: "30%",
    backgroundColor: "#1D1D1F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconUnAction: {
    width: "32px",
    height: "32px",
    borderRadius: "30%",
    backgroundColor: "#b4b4b4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  // 하단 FAQ 카드 보드 컨테이너
  faqContainerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "16px 16px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
  },
  faqHeaderLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  faqBadge: {
    backgroundColor: "#3A3A3C",
    borderRadius: "12px",
    padding: "4px 10px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  faqDecorIcon: { fontSize: "24px", opacity: 0.85 },
  faqQuestionText: {
    fontSize: "16.5px",
    paddingLeft: "2px",
    fontWeight: "700",
    color: "#1D1D1F",
    marginBottom: "20px",
    letterSpacing: "-0.3px",
  },
  faqAnswerParagraph: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px",
  },
  pText: {
    fontSize: "14px",
    color: "#48484A",
    lineHeight: "1.55",
    margin: 0,
    wordBreak: "keep-all",
  },

  // 가이드 내부 세로 링크 구조화 목록
  guideLinkList: { display: "flex", flexDirection: "column", gap: "8px" },
  linkListItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 12px",
    borderRadius: "10px",
    border: "1px solid #E5E5EA",
    fontSize: "14px",
    fontWeight: "600",
    color: "#3A3A3C",
    cursor: "pointer",
    backgroundColor: "#FFFFFF",
    transition: "background-color 0.15s",
  },
};
