import { test } from "node:test";
import assert from "node:assert/strict";
import { generateRecommendations } from "../src/nodes/recommendation.js";

test("generateRecommendations traduit une anomalie en action concrète", () => {
  const anomalies = [
    { metric: "cpu_usage", value: 95, threshold: 90, severity: "high", description: "" },
  ];

  const recommendations = generateRecommendations(anomalies, []);

  assert.equal(recommendations.length, 1);
  assert.equal(recommendations[0].id, "rec_cpu_usage");
  assert.equal(recommendations[0].action, "scale_out_compute");
});

test("generateRecommendations ajoute une recommandation par service en incident", () => {
  const records = [
    { service_status: { database: "online", api_gateway: "degraded", cache: "online" } },
    { service_status: { database: "offline", api_gateway: "online", cache: "online" } },
  ];

  const recommendations = generateRecommendations([], records);
  const ids = recommendations.map((r) => r.id);

  assert.ok(ids.includes("rec_service_api_gateway"));
  assert.ok(ids.includes("rec_service_database"));
});
