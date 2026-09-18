import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAiInfrastructure } from "@/lib/aws.functions";

/**
 * Shows the founder exactly what ran their analysis: which provider, which
 * model, and whether the connected AWS account's Amazon Bedrock catalogue is
 * reachable right now. No claim is shown unless the live check supports it.
 */
export function AiInfrastructureNote() {
  const fetchInfra = useServerFn(getAiInfrastructure);
  const { data } = useQuery({
    queryKey: ["ai-infrastructure"],
    queryFn: () => fetchInfra(),
    staleTime: 5 * 60 * 1000,
  });

  if (!data) return null;

  const ranOnBedrock = data.provider === "bedrock" && data.bedrockRuntimeOk;

  return (
    <div className="mt-5 rounded-lg border border-border bg-surface-2 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
      <p className="label-caps mb-1 text-foreground">What ran this analysis</p>
      <p>
        {ranOnBedrock
          ? `Amazon Bedrock (${data.region}), model ${data.modelId}.`
          : "Lovable AI (OpenAI GPT-6 Astra) through a secure server-side request."}{" "}
        {data.bedrockReachable
          ? `The linked AWS account is connected — ${data.bedrockModels} Amazon Bedrock models are listed in ${data.region}.`
          : "The linked AWS account is not reachable from this app right now."}{" "}
        {data.bedrockRuntimeOk
          ? "Bedrock model inference is available and used first for this analysis."
          : "Bedrock model inference is not available to this app right now, so the analysis ran on the fallback provider."}
      </p>
      <p className="mt-1">
        Your workspace text is sent server-side only; AWS credentials never reach your browser.
      </p>
    </div>
  );
}
