"use client";

import { useEffect } from "react";

export interface CustomAlertProps {
  isOpen: boolean;
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function CustomAlert({
  isOpen,
  message,
  type = "info",
  onClose,
}: Readonly<CustomAlertProps>) {
  useEffect(() => {
    if (!isOpen) return;
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 타입별 상태 색상 정의
  const typeStyles = {
    success: "border-green-500 text-green-600 bg-green-50/90 backdrop-blur-md",
    error: "border-red-500 text-red-600 bg-red-50/90 backdrop-blur-md",
    info: "border-[var(--muted)] text-gray-700 bg-white/90 backdrop-blur-md shadow-lg",
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
      <div
        className={`flex items-center gap-3 rounded border min-w-[300px] max-w-md shadow-md transition-all ${typeStyles[type]}`}
        style={{ padding: "8px 15px" }}
      >
        {/* 아이콘 영역 */}
        <span className="text-lg font-bold">
          {type === "success" && "✓"}
          {type === "error" && "!"}
          {type === "info" && "ℹ"}
        </span>

        {/* 메시지 영역 */}
        <p className="text-sm font-medium flex-1 break-keep">{message}</p>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="text-[13px] text-gray-400 hover:text-gray-600 ml-2 p-0.5 rounded-md hover:font-black transition-colors"
          aria-label="Close alert"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
