import { test } from "node:test";
import assert from "node:assert/strict";
import { computeInsights, detectAnomalies } from "../src/nodes/analyse.js";

const baseRecord = {
  timestamp: "2023-10-01T12:00:00Z",
  cpu_usage: 50,
  memory_usage: 50,
  latency_ms: 100,
  disk_usage: 50,
  network_in_kbps: 1000,
  network_out_kbps: 1000,
  io_wait: 1,
  thread_count: 100,
  active_connections: 10,
  error_rate: 0.01,
  uptime_seconds: 3600,
  temperature_celsius: 50,
  power_consumption_watts: 200,
  service_status: { database: "online", api_gateway: "online", cache: "online" },
};

test("computeInsights calcule moyenne, max et uptime", () => {
  const records = [
    { ...baseRecord, latency_ms: 100, cpu_usage: 60, uptime_seconds: 3600 },
    { ...baseRecord, latency_ms: 200, cpu_usage: 80, uptime_seconds: 7200 },
  ];

  const insights = computeInsights(records);

  assert.equal(insights.average_latency_ms, 150);
  assert.equal(insights.max_cpu_usage, 80);
  assert.equal(insights.uptime_seconds, 7200);
});

test("detectAnomalies ignore les valeurs sous le seuil medium", () => {
  const records = [{ ...baseRecord, cpu_usage: 50 }];
  assert.deepEqual(detectAnomalies(records), []);
});

test("detectAnomalies remonte la pire occurrence avec la bonne sévérité", () => {
  const records = [
    { ...baseRecord, timestamp: "t1", cpu_usage: 80 },
    { ...baseRecord, timestamp: "t2", cpu_usage: 95 },
  ];

  const anomalies = detectAnomalies(records);
  const cpuAnomaly = anomalies.find((a) => a.metric === "cpu_usage");

  assert.ok(cpuAnomaly);
  assert.equal(cpuAnomaly.severity, "high");
  assert.equal(cpuAnomaly.value, 95);
  assert.equal(cpuAnomaly.threshold, 90);
});
