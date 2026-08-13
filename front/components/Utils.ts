import { RecycleInfo } from "./store/useRecycleInfo";

export const formatDateToYYYYMMDD = (
  dateInput: string | Date | undefined,
): string => {
  if (!dateInput) return "";
  if (typeof dateInput === "string") {
    // T 분할 또는 단순 공백 분할 처리
    return dateInput.split("T")[0].split(" ")[0];
  }
  const yyyy = dateInput.getFullYear();
  const mm = String(dateInput.getMonth() + 1).padStart(2, "0");
  const dd = String(dateInput.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const getLatestDate = (list: RecycleInfo[]): string => {
  if (!list || list.length === 0) return formatDateToYYYYMMDD(new Date());

  const latest = list.reduce((max, item) => {
    const currentFormatted = formatDateToYYYYMMDD(item.orderDate);
    return currentFormatted > max ? currentFormatted : max;
  }, "");

  return latest || formatDateToYYYYMMDD(new Date());
};

export const getLatestDateObj = (list: RecycleInfo[]): Date => {
  if (!list || list.length === 0) return new Date();

  let latestStr = formatDateToYYYYMMDD(list[0].orderDate);

  // 2. 전체 리스트를 순회하며 가장 큰(최신) YYYY-MM-DD 문자열을 찾음
  for (let i = 1; i < list.length; i++) {
    const currentStr = formatDateToYYYYMMDD(list[i].orderDate);
    if (currentStr > latestStr) {
      latestStr = currentStr;
    }
  }

  return latestStr ? new Date(`${latestStr}T00:00:00`) : new Date();
};
