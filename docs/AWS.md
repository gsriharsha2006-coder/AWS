# Where AWS is used in Venture Connect

Venture Connect talks to AWS through the platform's AWS connector gateway. AWS
credentials live only in the server environment (`AWS_API_KEY` plus
`LOVABLE_API_KEY`); they are never sent to the browser and never committed.

| Feature | AWS service | Call |
| --- | --- | --- |
| AI infrastructure panel (founder dashboard / VC Readiness) | Amazon Bedrock control plane | `GET /bedrock/foundation-models` — lists the models the account may use, region `ap-south-2` |
| Idea Workspace AI review | Amazon Bedrock Runtime | `POST /bedrock-runtime/model/{profile}/converse` via `runStructuredAI` |
| VC Readiness report | Amazon Bedrock Runtime | same, `effort: medium` |
| Opportunity quality gate | Amazon Bedrock Runtime | same, `effort: low` |

## Provider abstraction

All AI features call `runStructuredAI` in `src/lib/ai-provider.server.ts`. It
supports two providers:

- `bedrock` — Amazon Bedrock Converse API, model profile
  `apac.anthropic.claude-sonnet-4-20250514-v1:0`.
- `lovable` — Lovable AI Gateway (`openai/gpt-6-astra`), the default.

Switch with the server environment variable `VC_AI_PROVIDER=bedrock`. If a
Bedrock call fails, the request automatically falls back to the Lovable gateway,
so founders never see a broken analysis.

## Current status

The Bedrock **control plane** is reachable and verified from this project (model
listing returns live data for the connected AWS account). Bedrock **runtime
inference** is currently refused by the connector gateway with
`400 Operation not allowed`, so the default provider stays `lovable`. No code
change is needed once that path opens — set `VC_AI_PROVIDER=bedrock`.

## IAM

The connected IAM user only needs:

- `bedrock:ListFoundationModels`, `bedrock:ListInferenceProfiles`
- `bedrock:InvokeModel`, `bedrock:InvokeModelWithResponseStream`

scoped with an `aws:RequestedRegion` condition on `ap-south-2`.
