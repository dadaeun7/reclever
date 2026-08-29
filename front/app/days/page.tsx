import DaySelect from "@/components/DaySelect";
import { headers } from "next/headers";
import { RecycleInfo } from "@/components/store/useRecycleInfo";
import { BACK_BASE } from "../constants/Default";

export default function DaysPage() {
  const getRecycleInfo = async (
    startDate: string,
    endDate: string,
  ): Promise<RecycleInfo[]> => {
    "use server";
    try {
      const result = await fetch(
        BACK_BASE + `/get/recycle?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: (await headers()).get("cookie") || "",
          },
        },
      );

      if (!result.ok) throw new Error("recycle info fetch error");

      const data = result.json();
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  return <DaySelect getRecycleInfo={getRecycleInfo} />;
}
