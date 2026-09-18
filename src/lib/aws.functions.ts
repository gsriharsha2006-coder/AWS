import { createServerFn } from "@tanstack/react-start";

/**
 * Reports which AI provider the analysis features run on, and performs a live
 * Amazon Bedrock read (ListFoundationModels) so the dashboard can show real AWS
 * status rather than a claim.
 */
export const getAiInfrastructure = createServerFn({ method: "GET" }).handler(async () => {
  const { listBedrockModels, selectedProvider, BEDROCK_REGION, BEDROCK_MODEL_ID } = await import(
    "./ai-provider.server"
  );
  const bedrock = await listBedrockModels();
  return {
    provider: selectedProvider(),
    region: BEDROCK_REGION,
    modelId: BEDROCK_MODEL_ID,
    bedrockReachable: bedrock.reachable,
    bedrockModels: bedrock.models,
  };
});
