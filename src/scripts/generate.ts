import { generateTypeSchema } from "./generateTypeSchema";

async function main() {
  await generateTypeSchema(
    "./src/store/exampleApi.ts",
    `./src/store/generated/exampleApi.ts`,
  );
}

main();
