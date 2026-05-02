import { NextRequest, NextResponse } from "next/server";
import { assignMachineId } from "@/app/api/machines/_store";
import type { AddMachinePayload } from "@/types/machine";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as AddMachinePayload;

  if (!body?.machine_id || !body?.name || !body?.type || !body?.location) {
    return NextResponse.json({ message: "Missing required machine fields." }, { status: 400 });
  }

  const result = assignMachineId(body.machine_id);

  if (!result.ok && result.reason === "duplicate") {
    return NextResponse.json({ message: "Machine ID already assigned." }, { status: 409 });
  }

  if (!result.ok && result.reason === "invalid") {
    return NextResponse.json({ message: "Invalid machine ID." }, { status: 400 });
  }

  return NextResponse.json({ message: "Machine added successfully", machine: body }, { status: 201 });
}
