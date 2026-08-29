"use client";

import React from "react";
import { Mail } from "lucide-react";
import { BACK_BASE } from "@/app/constants/Default";

export default function Login() {
  return (
    <div style={styles.appContainer}>
      <div style={styles.loginContentWrapper}>
        {/* 안내 텍스트 블록 */}
        <div style={styles.loginTextGroup}>
          <h1 style={styles.loginMainTitle}>환경앱 시작하기</h1>
          <p style={styles.loginSubParagraph}>
            Gmail 계정으로만 가입할 수 있어요.
            <br />
            쇼핑 영수증 메일을 읽어 재활용 기록을
            <br />
            자동으로 쌓아드릴게요.
          </p>
        </div>

        {/* 캡슐 스타일 구글 로그인 액션 버튼 */}
        <button
          style={styles.gmailSubmitBtn}
          onClick={() => {
            window.location.href = BACK_BASE + "/oauth2/authorization/google";
          }}
        >
          <Mail size={18} color="#1A1A1A" />
          <span style={styles.gmailSubmitBtnText}>Gmail 계정으로 시작하기</span>
        </button>

        {/* 최하단 도메인 제약 마이크로 카피 */}
        <span style={styles.loginFooterMicroCopy}>
          gmail.com 도메인 계정만 가입이 가능해요
        </span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // 모바일 컨테이너 표준 규격화
  appContainer: {
    width: "100%",
    height: "90vh",
    backgroundColor: "#1A1A1A",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    margin: "0 auto",
    boxSizing: "border-box",
    color: "#FFFFFF",
  },

  // 로그인 레이아웃 특화 명세
  loginContentWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "0 8px",
  },
  logoCircleContainer: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#2C2C2E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "40px",
  },
  logoIcon: { fontSize: "24px" },
  loginTextGroup: { marginBottom: "48px" },
  loginMainTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: "12px",
    letterSpacing: "-0.3px",
  },
  loginSubParagraph: {
    fontSize: "14px",
    fontWeight: "400",
    color: "#8E8E93",
    lineHeight: "1.6",
  },
  gmailSubmitBtn: {
    border: "none",
    backgroundColor: "#FFFFFF",
    borderRadius: "28px",
    padding: "16px 28px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    maxWidth: "280px",
    justifyContent: "center",
    cursor: "pointer",
    marginBottom: "24px",
    transition: "background-color 0.2s",
  },
  gmailSubmitBtnText: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: "-0.2px",
  },
  loginFooterMicroCopy: {
    fontSize: "12px",
    color: "#636366",
    letterSpacing: "-0.1px",
  },
};
