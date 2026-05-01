import { NextRequest, NextResponse } from "next/server";

interface RootCauseRequest {
  timestamp: string;
  machineId?: string;
  machineName?: string;
  severity: string;
  percentDelta: number;
  beforeAnomalies: number;
  afterAnomalies: number;
  avgValueContext: number;
  delta: number;
}

interface RootCauseResponse {
  rootCause: string;
  generatedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RootCauseRequest;

    const { timestamp, machineName, severity, percentDelta, beforeAnomalies, afterAnomalies, delta, avgValueContext } = body;

    // Validate required fields
    if (!timestamp) {
      return NextResponse.json({ error: "Missing timestamp" }, { status: 400 });
    }

    // Generate contextual root cause based on anomaly characteristics
    let rootCause = "";

    if (severity === "Critical") {
      if (Math.abs(percentDelta) > 50) {
        rootCause = `Critical deviation detected in ${machineName || "system"} at ${new Date(timestamp).toLocaleTimeString()}: Value deviated ${Math.abs(percentDelta).toFixed(1)}% from baseline, exceeding critical thresholds.`;
      } else if (beforeAnomalies > 0 || afterAnomalies > 0) {
        rootCause = `Critical clustering pattern identified: Multiple anomalies before (${beforeAnomalies}) and after (${afterAnomalies}) the event suggest systemic malfunction or cascading failure.`;
      } else {
        rootCause = `Critical anomaly in ${machineName || "system"}: Unexpected severe deviation (${delta > 0 ? "spike" : "drop"}) detected. Immediate inspection of hardware/configuration recommended.`;
      }
    } else if (severity === "Warning") {
      if (avgValueContext > 60) {
        rootCause = `Elevated operational state detected in ${machineName || "system"}: Operating at above-normal levels (avg: ${avgValueContext.toFixed(1)}). May indicate stress on system resources or configuration drift.`;
      } else if (Math.abs(percentDelta) > 25) {
        rootCause = `Moderate deviation from predicted pattern: ${delta > 0 ? "Increased" : "Decreased"} output by ${Math.abs(percentDelta).toFixed(1)}%. Check for partial failures or parameter changes.`;
      } else {
        rootCause = `Behavioral anomaly in ${machineName || "system"}: Performance pattern deviates from expected trend. Recommend diagnostic check for gradual degradation.`;
      }
    } else {
      if (beforeAnomalies > 0) {
        rootCause = `Minor anomaly detected following previous irregularities (${beforeAnomalies} earlier events). May indicate incomplete recovery or recurring issue pattern.`;
      } else {
        rootCause = `Routine operational variance detected. Value fluctuation within acceptable margins but deviating from learning model prediction. No immediate action required; continue monitoring.`;
      }
    }

    const response: RootCauseResponse = {
      rootCause: rootCause.trim(),
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error generating root cause:", error);
    return NextResponse.json(
      { error: "Failed to generate root cause" },
      { status: 500 }
    );
  }
}
