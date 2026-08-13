import { BACK_BASE } from "@/app/constants/Default";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("reclever_access_token")?.value;

  const response = await fetch(BACK_BASE + "/stream/job-status", {
    headers: {
      Cookie: accessToken || "",
      Accept: "text/event-stream",
    },
  });

  if (!response.body) {
    return new NextResponse("No response Body", { status: 500 });
  }

  return new NextResponse(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
