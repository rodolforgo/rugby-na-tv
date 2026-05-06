import { db } from "@/infra/database";
import { featuresSchema } from "@/infra/database/schema/features";

const knownFeatures = ["read:activation_token"];

async function seedFeatures() {
  for (const name of knownFeatures) {
    await db.insert(featuresSchema).values({ name }).onConflictDoNothing();
  }
}

const seed = { seedFeatures };

export default seed;
