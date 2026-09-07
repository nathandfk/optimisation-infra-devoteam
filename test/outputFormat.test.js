import { test } from "node:test";
import assert from "node:assert/strict";
import { OutputReportSchema } from "../src/outputFormat.js";

const validReport = {
  timestamp: "2023-10-01T12:00:00Z",
  insights: {
    average_latency_ms: 150,
    max_cpu_usage: 90,
    max_memory_usage: 80,
    error_rate: 0.02,
    uptime_seconds: 3600,
  },
  anomalies: [
    {
      metric: "cpu_usage",
      value: 90,
      threshold: 90,
      severity: "high",
      description: "pic anormal",
    },
  ],
  recommendations: [
    {
      id: "rec_cpu_usage",
      action: "scale_out_compute",
      target: "compute_cluster",
      parameters: { autoscaling: true },
      benefit_estimate: "réduction de charge",
    },
  ],
  service_status_summary: { online: ["database"], degraded: [], offline: [] },
};

test("OutputReportSchema accepte un rapport conforme", () => {
  assert.doesNotThrow(() => OutputReportSchema.parse(validReport));
});

test("OutputReportSchema rejette une sévérité invalide", () => {
  const invalid = {
    ...validReport,
    anomalies: [{ ...validReport.anomalies[0], severity: "critical" }],
  };

  assert.throws(() => OutputReportSchema.parse(invalid));
});
