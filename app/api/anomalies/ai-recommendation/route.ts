import { NextRequest, NextResponse } from "next/server";

interface AiRecommendationRequest {
  timestamp: string;
  machineId?: string;
  machineName?: string;
  severity: string;
  percentDelta: number;
  riskScore: number;
  confidence: number;
  rootCause?: string;
}

interface AiRecommendationResponse {
  recommendation: string;
  generatedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AiRecommendationRequest;

    const { timestamp, machineName, severity, percentDelta, riskScore, confidence, rootCause } = body;

    // Validate required fields
    if (!timestamp) {
      return NextResponse.json({ error: "Missing timestamp" }, { status: 400 });
    }

    // Generate contextual AI recommendation based on severity and risk assessment
    let recommendation = "";

    if (severity === "Critical") {
      if (riskScore >= 80) {
        recommendation = `IMMEDIATE ACTION REQUIRED: Risk score ${riskScore}% (confidence: ${confidence}%) indicates critical system failure risk. ${machineName ? `Isolate ${machineName} from production` : "Take system offline"} immediately. Perform emergency diagnostics and failure root-cause analysis. Escalate to Senior Engineering team for intervention within 15 minutes.`;
      } else if (riskScore >= 70) {
        recommendation = `URGENT: High-risk critical anomaly detected (risk: ${riskScore}%, confidence: ${confidence}%). Schedule emergency maintenance window within 1-2 hours. Prepare replacement parts/equipment. Document all changes and run diagnostic suite. Alert production team to prepare contingency plans.`;
      } else {
        recommendation = `CRITICAL ALERT: Severe anomaly in ${machineName || "system"}. Risk score: ${riskScore}%. Assign senior technician for immediate investigation. Run full diagnostics within 30 minutes. Implement temporary mitigation if safe to do so.`;
      }
    } else if (severity === "Warning") {
      if (riskScore >= 60) {
        recommendation = `HIGH PRIORITY: Warning-level anomaly with ${riskScore}% risk score. Schedule maintenance within next 4-8 hours. Increase monitoring frequency to 15-minute intervals. Prepare team for potential escalation to critical. Document environmental factors and parameter changes.`;
      } else if (riskScore >= 40) {
        recommendation = `SCHEDULED ATTENTION: Anomaly detected with moderate risk (${riskScore}%). Schedule diagnostic inspection within 24 hours. Increase monitoring frequency to 1-hour intervals. Review system logs for configuration/software changes. Perform trend analysis over past 7 days.`;
      } else {
        recommendation = `ROUTINE CHECK: Minor anomaly indicates need for standard maintenance review. Schedule inspection within this week. Continue normal monitoring. Document pattern for predictive model refinement.`;
      }
    } else {
      recommendation = `INFO: Routine operational anomaly detected with low risk score (${riskScore}%). Continue standard monitoring protocols. No urgent action required. Add to maintenance backlog for next scheduled service window. Monitor for pattern emergence over next 48 hours.`;
    }

    const response: AiRecommendationResponse = {
      recommendation: recommendation.trim(),
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error generating AI recommendation:", error);
    return NextResponse.json(
      { error: "Failed to generate AI recommendation" },
      { status: 500 }
    );
  }
}
