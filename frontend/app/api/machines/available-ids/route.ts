import { NextRequest, NextResponse } from "next/server";
import { getAvailableMachineIds } from "@/app/api/machines/_store";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  const ids = getAvailableMachineIds(query).map((id) => ({ id, available: true }));
  return NextResponse.json(ids);
}
