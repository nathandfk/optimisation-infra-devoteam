import { ingestionNode } from "./nodes/ingestion.js";
import { analysisNode } from "./nodes/analyse.js";
import { recommendationNode } from "./nodes/recommendation.js";
import { formatterNode } from "./nodes/formatter.js";

export async function runPipeline(inputPath) {
  // On charge et valide les enregistrements du fichier de log
  const { records } = await ingestionNode({ inputPath });

  // On récupère puis on analyse
  const analysis = await analysisNode(records);

  // On génère les recommandations à partir des anomalies et des incidents de service
  const { recommendations } = await recommendationNode({
    records,
    insights: analysis.insights,
    anomalies: analysis.anomalies,
  });

  // On assemble le rapport final au format attendu
  const { report } = await formatterNode({
    records,
    insights: analysis.insights,
    anomalies: analysis.anomalies,
    recommendations,
  });

  return report;
}