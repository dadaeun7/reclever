"use client";

import { useEffect, useRef, useState } from "react";
import CstLoading from "./CustomLoading";

export default function Main() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    let splineApp: any = null;
    let isMounted = true;

    // ES Module 방식 동적 import로 @splinetool/runtime 직접 로드
    const loadSpline = async () => {
      try {
        const { Application } = await import(
          // @ts-ignore
          /* webpackIgnore: true */ "https://unpkg.com/@splinetool/runtime@1.9.80/build/runtime.js"
        );

        if (!isMounted || !canvasRef.current) return;

        splineApp = new Application(canvasRef.current);

        await splineApp.load(
          "https://prod.spline.design/ZRJmFwV0l2SKyXqk/scene.splinecode",
        );

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Spline ES Module 로드 실패:", err);
      }
    };

    loadSpline();

    return () => {
      isMounted = false;
      if (splineApp && typeof splineApp.dispose === "function") {
        splineApp.dispose();
      }
    };
  }, []);

  return (
    <div className="w-[360px] h-[1360px] relative mx-auto overflow-hidden bg-[#F5F5F5]">
      {isLoading && (
        /* z-3 -> z-10 수정으로 canvas 위로 올림 */
        <div className="absolute inset-0 z-10 flex items-start justify-center">
          <div className="flex items-center space-x-1.5 translate-y-48 gap-3">
            <div
              className="h-2 w-2 rounded-full bg-[var(--primary)] bg-indigo-600 opacity-40 animate-bounce"
              style={{ animationDelay: "100ms" }}
            />
            <div
              className="h-2 w-2 rounded-full bg-[var(--primary)] bg-indigo-600 opacity-70 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
            <div
              className="h-2 w-2 rounded-full bg-[var(--primary)] bg-indigo-600 animate-bounce"
              style={{ animationDelay: "500ms" }}
            />
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
