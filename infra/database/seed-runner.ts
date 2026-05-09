import seed from "@/infra/database/seed";

seed
  .seedFeatures()
  .then(() => {
    console.log("Seed executado com sucesso.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exit(1);
  });
