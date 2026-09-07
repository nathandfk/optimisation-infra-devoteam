// Sanitize schemas with zod
// La structure avec les différents types "string, number,..."

/**
 * Format de sortie attendu
 * { "timestamp": "string (ISO 8601)", "insights": { "average_latency_ms": "number", "max_cpu_usage": "number", "max_memory_usage": "number", "error_rate": "number", "uptime_seconds": "number" }, "anomalies": [ { "metric": "string", "value": "number", "threshold": "number", "severity": "string (low|medium|high)", "description": "string" } ], "recommendations": [ { "id": "string", "action": "string", "target": "string", "parameters": "object", "benefit_estimate": "string" } ], "service_status_summary": { "online": ["string"], "degraded": ["string"], "offline": ["string"] } }
 */

import { z } from "zod";

export const ServiceStatusSchema = z.object({
  database: z.string(),
  api_gateway: z.string(),
  cache: z.string(),
});

export const LogRecordSchema = z.object({
  timestamp: z.string(),
  cpu_usage: z.number(),
  memory_usage: z.number(),
  latency_ms: z.number(),
  disk_usage: z.number(),
  network_in_kbps: z.number(),
  network_out_kbps: z.number(),
  io_wait: z.number(),
  thread_count: z.number(),
  active_connections: z.number(),
  error_rate: z.number(),
  uptime_seconds: z.number(),
  temperature_celsius: z.number(),
  power_consumption_watts: z.number(),
  service_status: ServiceStatusSchema,
});

export const AnomalySchema = z.object({
  metric: z.string(),
  value: z.number(),
  threshold: z.number(),
  severity: z.enum(["low", "medium", "high"]),
  description: z.string(),
});

export const RecommendationSchema = z.object({
  id: z.string(),
  action: z.string(),
  target: z.string(),
  parameters: z.record(z.string(), z.unknown()),
  benefit_estimate: z.string(),
});

export const InsightsSchema = z.object({
  average_latency_ms: z.number(),
  max_cpu_usage: z.number(),
  max_memory_usage: z.number(),
  error_rate: z.number(),
  uptime_seconds: z.number(),
});

export const ServiceStatusSummarySchema = z.object({
  online: z.array(z.string()),
  degraded: z.array(z.string()),
  offline: z.array(z.string()),
});

export const OutputReportSchema = z.object({
  timestamp: z.string(),
  insights: InsightsSchema,
  anomalies: z.array(AnomalySchema),
  recommendations: z.array(RecommendationSchema),
  service_status_summary: ServiceStatusSummarySchema,
});
