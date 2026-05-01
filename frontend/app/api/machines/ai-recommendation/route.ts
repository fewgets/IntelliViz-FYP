import { NextRequest, NextResponse } from "next/server";

interface RecommendationRequest {
  machineId: string;
  machineName: string;
  failureProbability: number;
  estTimeToFailureDays: number;
  efficiencyForecast: number;
  statuses: Array<"critical" | "warning" | "info">;
}

interface RecommendationResponse {
  recommendation: string;
  generatedAt: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RecommendationRequest;

  if (!body?.machineId || !body?.machineName) {
    return NextResponse.json({ message: "Machine context is required." }, { status: 400 });
  }

  const hasCritical = body.statuses.includes("critical");
  const hasWarning = body.statuses.includes("warning");

  let recommendation: string;

  if (hasCritical) {
    recommendation = [
      `${body.machineName} has entered a critical risk window (${body.failureProbability}%).`,
      "Immediately reduce line load by 20% and perform bearing and vibration diagnostics.",
      `Plan emergency maintenance within ${Math.max(1, Math.min(8, body.estTimeToFailureDays))} hours and keep thermal trend under active monitoring.`,
    ].join(" ");
  } else if (hasWarning) {
    recommendation = [
      `${body.machineName} is showing warning-level drift with elevated failure probability (${body.failureProbability}%).`,
      "Schedule focused inspection on vibration and pressure channels in the next shift.",
      `Adjust operating profile to protect efficiency (${body.efficiencyForecast >= 0 ? "+" : ""}${body.efficiencyForecast}%) and re-evaluate after maintenance execution.`,
    ].join(" ");
  } else {
    recommendation = [
      `${body.machineName} is currently stable with low short-term failure risk (${body.failureProbability}%).`,
      "Continue preventive maintenance cadence and keep anomaly thresholds unchanged.",
      `Re-run AI diagnostics before the projected maintenance window (${body.estTimeToFailureDays} days).`,
    ].join(" ");
  }

  const payload: RecommendationResponse = {
    recommendation,
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(payload, { status: 200 });
}
