
function buildServiceStatusSummary(records) {
  const lastRecord = records[records.length - 1];
  const summary = { online: [], degraded: [], offline: [] };

  for (const [service, status] of Object.entries(lastRecord.service_status)) {
    if (summary[status]) summary[status].push(service);
  }

  return summary;
}

export async function formatterNode(state) {
  const lastRecord = state.records[state.records.length - 1];

  const report = {
    timestamp: lastRecord.timestamp,
    insights: state.insights,
    anomalies: state.anomalies,
    recommendations: state.recommendations,
    service_status_summary: buildServiceStatusSummary(state.records),
  };

  return { report };
}
