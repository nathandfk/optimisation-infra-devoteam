import fs from "fs"
import { LogRecordSchema } from "../outputFormat.js";

export async function loadRecords(path) {
  const raw = fs.readFileSync(path, "utf-8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error("Le fichier de log doit contenir une liste d'objets JSON.");
  }

  const records = [];
  data.forEach((entry, index) => {
    const result = LogRecordSchema.safeParse(entry);
    if (result.success) {
      records.push(result.data);
    } else {
      console.log("error")
    }
  });

  if (records.length === 0) {
    throw new Error("Aucun enregistrement valide trouvé dans le fichier de log.");
  }

  return records;
}

export async function ingestionNode(state) {
  const records = await loadRecords(state.inputPath);
  return { records };
}
