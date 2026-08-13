"use client";
import Image from "next/image";

export default function CstLoading({
  imageName,
  description,
  customMinH = "85vh",
}: {
  readonly imageName: string;
  readonly description: string;
  readonly customMinH?: string;
}) {
  return (
    <div
      className={`flex min-h-[${customMinH}] flex-col items-center justify-center px-4`}
    >
      <div className="flex flex-col items-center space-y-8 text-center">
        {imageName !== "" && (
          <div className="relative h-62 w-32 animate-[float_2.5s_infinite_ease-in-out]">
            <Image
              src={`/${imageName}.png`}
              alt=""
              fill
              className="object-contain"
              priority
            />
          </div>
        )}

        {/* 2. 텍스트 및 진행 바 (Progress) 영역 */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
            {description}
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            잠시만 기다려주세요...
          </p>
        </div>

        {/* 4. 도트 애니메이션 */}
        <div className="flex items-center space-x-1.5">
          <div className="h-2 w-2 rounded-full bg-[var(--primary)] opacity-40 animate-[bounce_1s_infinite_100ms]" />
          <div className="h-2 w-2 rounded-full bg-[var(--primary)] opacity-70 animate-[bounce_1s_infinite_300ms]" />
          <div className="h-2 w-2 rounded-full bg-[var(--primary)] animate-[bounce_1s_infinite_500ms]" />
        </div>
        <style jsx global>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-12px); /* 위로 12px 만큼 부드럽게 이동 */
            }
          }
        `}</style>
      </div>
    </div>
  );
}
