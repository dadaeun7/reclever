import {
  FloatingPortal,
  offset,
  useFloating,
  useHover,
  useInteractions,
  flip,
  shift,
} from "@floating-ui/react";
import { useState } from "react";

interface TooltipProps {
  children: React.ReactNode; // 툴팁 트리거 (예: 버튼)
  content: React.ReactNode; // 툴팁 본문 내용
  placement?: "top" | "right" | "bottom" | "left"; // 나타날 위치
  className?: string; // 추가
  style?: React.CSSProperties; // 추가
}

export function Tooltip({
  children,
  content,
  placement = "top",
  className = "",
  style = {},
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  // floating-ui를 사용하여 위치 계산 및 인터랙션 처리 (추천 가이드라인)
  const { x, y, refs, strategy, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: placement,
    // 오프셋 8px 적용
    middleware: [offset(8), flip(), shift({ padding: 10 })],
  });

  const hover = useHover(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  // 가이드라인을 반영한 일관된 스타일 클래스 정의
  const tooltipStyle = `
    z-50
    px-2.5 py-1.5           /* Padding */
    bg-[#1A1A1A]/90         /* Background (Dark, 투명도 90%) */
    text-white              /* Text Color */
    text-[11px] font-medium /* Font (Small, Medium weight) */
    rounded-md              /* Corners (6px~8px) */
    shadow-lg               /* Subtle elevation */
    pointer-events-none     /* 인터랙션 방지 */
    transition-opacity duration-200 /* Fade-in 200ms */
    ${isOpen ? "opacity-100" : "opacity-0"}
  `;

  return (
    <>
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className="inline-block"
      >
        {children}
      </div>
      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: "max-content",
              ...style,
            }}
            {...getFloatingProps()}
            className={`${tooltipStyle} ${className}`}
          >
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
