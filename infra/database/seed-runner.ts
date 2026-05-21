import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

const env = dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });
dotenvExpand.expand(env);
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}.local`, override: true });

const target = process.argv[2];

const runners: Record<string, string> = {
  features: "seedFeatures",
  games: "seedGames",
};

if (!runners[target]) {
  console.error(`Seed desconhecido: "${target}". Use: features | games`);
  process.exit(1);
}

(async () => {
  const { default: seed } = await import("@/infra/database/seed");

  const run = seed[runners[target] as keyof typeof seed] as () => Promise<void>;

  run()
    .then(() => {
      console.log("Seed executado com sucesso.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erro ao executar seed:", error);
      process.exit(1);
    });
})();
