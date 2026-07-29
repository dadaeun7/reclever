"use client";

import logoImg from "@/public/logo.png";
import logoWhiteImg from "@/public/logo-white.png";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, PackageSearch } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCallback, useState } from "react";

interface JobProps {
  status: string;
  timeStamp: string;
}

export default function Header() {
  const pathname = usePathname();
  const hideFooterPaths = ["/", "/login"];
  const mainPaths = ["/calendar", "/days", "/settings"];
  const { isLoggedIn } = useAuth();

  const [onShow, setOnShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobList, setJobList] = useState<JobProps[]>([]);

  const jobListUp = useCallback(async () => {
    if (onShow) {
      setOnShow(false);
      return;
    }

    setLoading(true);

    try {
      const result = await fetch(`/history`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!result.ok) throw new Error("Failed to fetch");

      const data: JobProps[] = await result.json();
      setJobList(data);
      setOnShow(true);
    } catch (error) {
      console.error("Error fetch job history: ", error);
    } finally {
      setLoading(false);
    }
  }, [onShow]);

  return (
    <header
      className="flex justify-between items-center"
      style={{
        padding: `${hideFooterPaths.includes(pathname) ? "18px 24px" : "18px 16px"}`,
        backgroundColor: `${hideFooterPaths.includes(pathname) ? "#1A1A1A" : "transparent"}`,
      }}
    >
      <Link href="/">
        <Image
          width={hideFooterPaths.includes(pathname) ? 25 : 35}
          src={hideFooterPaths.includes(pathname) ? logoWhiteImg : logoImg}
          alt="로고"
        />
      </Link>
      {isLoggedIn && (
        <Link href="/days">
          <PackageSearch
            color="white"
            className="transition-transform duration-200 ease-in-out hover:-translate-y-1 cursor-pointer"
          />
        </Link>
      )}
      {mainPaths.includes(pathname) && (
        <div className="relative">
          {/* 종 아이콘 영역 */}
          <button
            type="button"
            onClick={jobListUp}
            className="bg-gray-100 text-gray-700 rounded-full hover:bg-black hover:text-gray-200 transition-colors focus:outline-none"
            style={{ padding: "6px" }}
          >
            <Bell size={20} className="p-5 cursor-pointer" />
          </button>

          {/* 알림 드롭다운 팝업 */}
          {onShow && (
            <div className="absolute right-0 mt-2 w-80 z-50 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
              {/* 드롭다운 헤더 */}
              <div
                className="border-b border-gray-100 bg-gray-50/50 flex items-center justify-between"
                style={{ padding: "10px" }}
              >
                <span className="text-sm font-semibold text-gray-800">
                  알림 목록
                </span>
                {jobList.length > 0 && (
                  <span className="text-[12px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {jobList.length}개
                  </span>
                )}
              </div>

              {/* 알림 리스트 */}
              <ul
                className="max-h-80 overflow-y-auto divide-y divide-gray-100"
                style={{ padding: "5px 2px" }}
              >
                {jobList.length > 0 ? (
                  jobList.map((job, index) => (
                    <li
                      key={index}
                      className="p-5 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col gap-1"
                    >
                      <div
                        className="flex items-center justify-between gap-3"
                        style={{ padding: "5px" }}
                      >
                        {/* 작업 상태 뱃지 */}
                        <span className="text-[12px] font-medium px-2 py-0.5">
                          {job.status}
                        </span>
                        {/* 시간 정보 */}
                        <span className="text-[11px] text-gray-400">
                          {new Intl.DateTimeFormat("ko-KR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          }).format(new Date(job.timeStamp))}
                        </span>
                      </div>
                    </li>
                  ))
                ) : (
                  /* 데이터 없음 */
                  <li className="py-8 text-center text-sm text-gray-400">
                    새로운 알림이 없습니다.
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
