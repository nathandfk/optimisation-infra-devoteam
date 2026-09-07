const THRESHOLDS = [
  { metric: "cpu_usage", medium: 75, high: 90, unit: "%", label: "Utilisation CPU" },
  { metric: "memory_usage", medium: 75, high: 85, unit: "%", label: "Utilisation mémoire" },
  { metric: "latency_ms", medium: 200, high: 300, unit: "ms", label: "Latence" },
  { metric: "disk_usage", medium: 75, high: 90, unit: "%", label: "Utilisation disque" },
  { metric: "error_rate", medium: 0.05, high: 0.1, unit: "", label: "Taux d'erreur" },
  { metric: "temperature_celsius", medium: 70, high: 80, unit: "°C", label: "Température" },
  { metric: "io_wait", medium: 5, high: 10, unit: "%", label: "Attente I/O" },
];

function severityFor(rule, value) {
  if (value >= rule.high) return "high";
  if (value >= rule.medium) return "medium";
  return null;
}

export function computeInsights(records) {
  const n = records.length;
  const sum = (key) => records.reduce((acc, r) => acc + r[key], 0);
  const max = (key) => records.reduce((acc, r) => Math.max(acc, r[key]), -Infinity);

  return {
    average_latency_ms: Math.round((sum("latency_ms") / n) * 100) / 100,
    max_cpu_usage: max("cpu_usage"),
    max_memory_usage: max("memory_usage"),
    error_rate: Math.round((sum("error_rate") / n) * 10000) / 10000,
    uptime_seconds: max("uptime_seconds"),
  };
}

export function detectAnomalies(records) {
  const anomalies = [];

  for (const rule of THRESHOLDS) {
    let worstValue = null;
    let worstSeverity = null;
    let worstTimestamp = null;
    let occurrences = 0;

    for (const record of records) {
      const value = record[rule.metric];
      const severity = severityFor(rule, value);
      if (severity === null) continue;

      occurrences += 1;
      if (worstValue === null || value > worstValue) {
        worstValue = value;
        worstSeverity = severity;
        worstTimestamp = record.timestamp;
      }
    }

    if (worstValue === null) continue;

    const thresholdCrossed = worstSeverity === "high" ? rule.high : rule.medium;
    const description =
      `${rule.label} : pic anormal à ${worstValue}${rule.unit} le ${worstTimestamp}, ` +
      `dépassant le seuil ${worstSeverity} de ${thresholdCrossed}${rule.unit} ` +
      `(${occurrences} mesure(s) concernée(s) sur ${records.length}).`;

    anomalies.push({
      metric: rule.metric,
      value: worstValue,
      threshold: thresholdCrossed,
      severity: worstSeverity,
      description,
    });
  }

  return anomalies;
}

export async function analysisNode(records) {
  return {
    insights: computeInsights(records),
    anomalies: detectAnomalies(records),
  };
}