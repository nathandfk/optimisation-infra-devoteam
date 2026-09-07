
const RULES = {
  cpu_usage: {
    action: "scale_out_compute",
    target: "compute_cluster",
    parameters: { suggested_additional_instances: 2, autoscaling: true },
    benefit_estimate: "Réduction estimée de 25 à 35% de la charge CPU moyenne par nœud",
  },
  memory_usage: {
    action: "increase_memory_allocation",
    target: "application_servers",
    parameters: { suggested_ram_increase_gb: 4, enable_memory_profiling: true },
    benefit_estimate: "Réduction du risque d'OOM et amélioration de la stabilité des services",
  },
  latency_ms: {
    action: "enable_caching_and_load_balancing",
    target: "api_gateway",
    parameters: { cache_ttl_seconds: 300, add_load_balancer_node: true },
    benefit_estimate: "Réduction estimée de 30 à 50% de la latence moyenne perçue par les utilisateurs",
  },
  disk_usage: {
    action: "extend_storage_or_cleanup",
    target: "storage_volume",
    parameters: { suggested_extra_storage_gb: 100, enable_log_rotation: true },
    benefit_estimate: "Élimination du risque de saturation disque à court terme",
  },
  error_rate: {
    action: "investigate_error_logs",
    target: "application_backend",
    parameters: { enable_detailed_tracing: true, rollback_last_deployment_if_needed: true },
    benefit_estimate: "Réduction du taux d'erreur et amélioration de la fiabilité perçue",
  },
  temperature_celsius: {
    action: "improve_cooling",
    target: "datacenter_rack",
    parameters: { check_airflow: true, schedule_hardware_maintenance: true },
    benefit_estimate: "Réduction du risque de throttling matériel et de panne prématurée",
  },
  io_wait: {
    action: "optimize_disk_io",
    target: "storage_subsystem",
    parameters: { migrate_to_ssd_or_nvme: true, review_io_intensive_jobs: true },
    benefit_estimate: "Réduction des temps d'attente disque et amélioration du débit global",
  },
};

function fromAnomalies(anomalies) {
  return anomalies
    .filter((a) => RULES[a.metric])
    .map((a) => {
      const rule = RULES[a.metric];
      return {
        id: `rec_${a.metric}`,
        action: rule.action,
        target: rule.target,
        parameters: rule.parameters,
        benefit_estimate: rule.benefit_estimate,
      };
    });
}


function fromServiceIncidents(records) {
  const incidentCounts = {};

  for (const record of records) {
    for (const [service, status] of Object.entries(record.service_status)) {
      if (status === "degraded" || status === "offline") {
        incidentCounts[service] ??= { degraded: 0, offline: 0 };
        incidentCounts[service][status] += 1;
      }
    }
  }

  return Object.entries(incidentCounts).map(([service, counts]) => {
    const severityWord = counts.offline > 0 ? "offline" : "dégradé";
    const total = counts.degraded + counts.offline;
    return {
      id: `rec_service_${service}`,
      action: "add_health_checks_and_failover",
      target: service,
      parameters: {
        degraded_occurrences: counts.degraded,
        offline_occurrences: counts.offline,
        enable_circuit_breaker: true,
      },
      benefit_estimate:
        `Réduction du risque d'indisponibilité du service '${service}' ` +
        `(observé ${severityWord} à ${total} reprise(s) sur la période analysée)`,
    };
  });
}

export function generateRecommendations(anomalies, records) {
  return [...fromAnomalies(anomalies), ...fromServiceIncidents(records)];
}


async function enrichWithLlm(recommendations) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return recommendations;

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    for (const rec of recommendations) {
      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content:
              "Reformule cette estimation de bénéfice en une phrase concise et " +
              `professionnelle pour un rapport IT : ${rec.benefit_estimate}`,
          },
        ],
      });
      const text = message.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("")
        .trim();
      if (text) rec.benefit_estimate = text;
    }
  } catch (err) {
  }

  return recommendations;
}

export async function recommendationNode(state) {
  const recommendations = generateRecommendations(state.anomalies, state.records);
  return { recommendations: await enrichWithLlm(recommendations) };
}
