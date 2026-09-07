import fs from "fs";
import { OutputReportSchema } from "./outputFormat.js";
import { runPipeline } from "./traitment.js";

async function main() {

  const output = "data/output.json"
  const rapport = "data/rapport.json"

  const report = await runPipeline(rapport);

  // Validation finale : garantit que le JSON produit est bien conforme
  // au schéma de sortie attendu avant de l'écrire sur disque.
  const validated = OutputReportSchema.parse(report);

  fs.writeFile(output, JSON.stringify(validated, null, 2), (err) => {
    if (err)  { 
      console.error(err);
    } else {
      console.log(`Rapport généré avec succès : ${output}`);
    }
  })
}

main()
