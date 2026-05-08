import { generateTypeSchema } from './scripts/generateTypeSchema';

export async function generate(apiFilePath: string, outputFilePath: string): Promise<void> {
  return generateTypeSchema(apiFilePath, outputFilePath);
}