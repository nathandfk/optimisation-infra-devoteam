# Optimisation de l'Infrastructure Technique

Pipeline qui lit un fichier de log JSON d'infrastructure, détecte les
anomalies et génère un rapport de recommandations au format attendu.

## Architecture

ingestion → analyse → recommandation → formatter

- `src/nodes/ingestion.js` : lit le fichier de log et valide chaque
  entrée avec Zod. Les lignes invalides sont ignorées plutôt que de
  faire planter le pipeline.
- `src/nodes/analyse.js` : calcule les insights agrégés (latence
  moyenne, pics CPU/mémoire...) et détecte les anomalies par seuils
  metier (medium/high), définis dans `THRESHOLDS`.
- `src/nodes/recommendation.js` : transforme chaque anomalie et
  incident de service en action concrète via un moteur de règles.
  Étape optionnelle d'enrichissement par LLM (Claude) si
  `ANTHROPIC_API_KEY` est défini dans l'environnement.
- `src/nodes/formatter.js` : assemble le rapport final.

`src/traitment.js` enchaîne ces quatre étapes. Pas de framework
d'orchestration (LangGraph...) : le flux est strictement linéaire,
donc de simples fonctions `async` suffisent. Je n'ai pas eu besoin d'utiliser des outils comme langgraph, LangChain dans mon exemple pour résoudre les problématiques, mais oui j'aurai pu.

`src/main.js` valide le
rapport final avec `OutputReportSchema` (Zod) avant de l'écrire sur
disque, pour garantir sa conformité.

## Notes techniques

L'enrichissement LLM des recommandations passe par un import
dynamique (`@anthropic-ai/sdk`) : ce n'est pas une dépendance du
projet, il n'est chargé que si une clé API est présente. Sans clé, le
pipeline tourne normalement avec les recommandations générées par le
moteur de règles.

La clé doit être ajouté dans le fichier .env et devrait porter ce nom ANTHROPIC_API_KEY

## Installation

```bash
npm install
```

## Utilisation

```bash
npm start
```

Les chemins d'entrée/sortie des fichiers (`data/rapport.json`, `data/output.json`)
sont définis dans `src/main.js`.

## Tests

```bash
npm test
```
# optimisation-infra-devoteam
