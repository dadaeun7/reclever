"use client";

import React from "react";
import { LayoutGrid, Home, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function FixedBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const hideFooterPaths = ["/", "/login"];
  if (hideFooterPaths.includes(pathname)) {
    return null; // 숨김 처리: DOM 트리에서 완벽히 걷어냄
  }

  // 각 탭의 활성화 여부를 판단하는 헬퍼 함수
  const isActive = (path: string) => pathname === path;

  return (
    <div style={styles.navWrapper}>
      <div style={styles.navContainer}>
        {/* 메뉴/대시보드 탭 */}
        <button
          onClick={() => router.push("/calendar")}
          style={{
            ...styles.iconBtn,
            backgroundColor: isActive("/calendar") ? "#333333" : "transparent",
          }}
        >
          <LayoutGrid
            size={22}
            color={isActive("/calendar") ? "#ffffff" : "#333333"}
          />
        </button>

        {/* 홈 탭 */}
        <button
          onClick={() => router.push("/days")}
          style={{
            ...styles.iconBtn,
            backgroundColor: isActive("/days") ? "#333333" : "transparent",
          }}
        >
          <Home size={22} color={isActive("/days") ? "#ffffff" : "#333333"} />
        </button>

        {/* 설정/달력 관리 탭 */}
        <button
          onClick={() => router.push("/settings")}
          style={{
            ...styles.iconBtn,
            backgroundColor: isActive("/settings") ? "#333333" : "transparent",
          }}
        >
          <Settings
            size={22}
            color={isActive("/settings") ? "#ffffff" : "#333333"}
          />
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // 화면 하단 중앙 고정을 위한 외부 래퍼 구조
  navWrapper: {
    position: "fixed",
    bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    zIndex: 100,
    pointerEvents: "none",
  },
  // 이미지 내부 회색 소프트 라운드 캡슐 바 스타일
  navContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9bc",
    padding: "8px 16px",
    borderRadius: "40px",
    gap: "80px",
    pointerEvents: "auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
  },
  // 둥근 아이콘 토글 서클 스타일
  iconBtn: {
    border: "none",
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};
