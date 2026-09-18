import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const WORKSPACE_KEYS = [
  "problem",
  "targetUsers",
  "solution",
  "market",
  "competition",
  "businessModel",
  "validation",
  "traction",
  "roadmap",
  "team",
  "funds",
  "growth",
] as const;

const ideaInput = z.object({
  name: z.string(),
  category: z.string(),
  stage: z.string(),
  oneLiner: z.string(),
  fields: z.record(z.string(), z.string()),
});

const GUARDRAILS =
  "You are an analyst inside Venture Connect, a platform that helps student founders structure and test startup ideas. " +
  "You must never invent traction, customers, revenue, validation or investor interest. " +
  "Never claim guaranteed funding, guaranteed valuation or investor approval. " +
  "Treat every number the founder supplies as self-reported unless they describe independent evidence. " +
  "Be direct about weaknesses. Your job is to challenge thinking, not to flatter.";

const stringArray = { type: "array", items: { type: "string" } };

export const analyzeIdea = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ideaInput.parse(input))
  .handler(async ({ data }) => {
    const { runStructuredAI } = await import("./ai-provider.server");
    const { raw } = await runStructuredAI({
      instructions: GUARDRAILS,
      effort: "low",
      schemaName: "idea_analysis",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["summary", "reviews", "weakAssumptions", "questions", "validationActions"],
        properties: {
          summary: { type: "string" },
          reviews: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["field", "status", "note"],
              properties: {
                field: { type: "string", enum: [...WORKSPACE_KEYS] },
                status: {
                  type: "string",
                  enum: ["complete", "needs_evidence", "needs_revision", "missing"],
                },
                note: { type: "string" },
              },
            },
          },
          weakAssumptions: stringArray,
          questions: stringArray,
          validationActions: stringArray,
        },
      },
      prompt:
                `Review this student startup idea section by section and return json.\n\n` +
                `Name: ${data.name}\nCategory: ${data.category}\nStage: ${data.stage}\n` +
                `One-liner: ${data.oneLiner}\n\n` +
                WORKSPACE_KEYS.map((k) => `${k}: ${data.fields[k] || "(empty)"}`).join("\n") +
                `\n\nReturn one review entry for every section listed above, a short plain summary, ` +
                `3-5 weak assumptions, 3-5 sharp questions the founder cannot yet answer, and ` +
                `3-5 concrete validation actions they can run in two weeks.`,
    });

    const parsed = JSON.parse(raw) as {
      summary: string;
      reviews: { field: string; status: string; note: string }[];
      weakAssumptions: string[];
      questions: string[];
      validationActions: string[];
    };
    return { ...parsed, generatedAt: new Date().toISOString() };
  });

const readinessInput = z.object({
  entityName: z.string(),
  targetCapital: z.string(),
  category: z.string(),
  stage: z.string(),
  pitch: z.string(),
  moats: z.string(),
  market: z.string(),
  validation: z.string(),
  traction: z.string(),
});

export const generateReadiness = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => readinessInput.parse(input))
  .handler(async ({ data }) => {
    const { runStructuredAI } = await import("./ai-provider.server");
    const { raw } = await runStructuredAI({
      instructions:
        GUARDRAILS +
        " Produce an assessment report, not a chat reply. Scores are AI assessments on a 0-100 scale, not precise measurements.",
      effort: "medium",
      schemaName: "readiness_report",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["scores", "swot", "observations", "moatNote", "priorities"],
        properties: {
          scores: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["key", "label", "score", "explanation"],
              properties: {
                key: {
                  type: "string",
                  enum: ["investor", "moat", "execution", "market", "defensibility", "scalability"],
                },
                label: { type: "string" },
                score: { type: "number" },
                explanation: { type: "string" },
              },
            },
          },
          swot: {
            type: "object",
            additionalProperties: false,
            required: ["strengths", "weaknesses", "opportunities", "threats"],
            properties: {
              strengths: stringArray,
              weaknesses: stringArray,
              opportunities: stringArray,
              threats: stringArray,
            },
          },
          observations: stringArray,
          moatNote: { type: "string" },
          priorities: stringArray,
        },
      },
      prompt:
                `Assess venture readiness and return json.\n\n` +
                `Entity: ${data.entityName}\nTarget capital: ${data.targetCapital}\n` +
                `Category: ${data.category}\nStage: ${data.stage}\n\n` +
                `Pitch: ${data.pitch}\n\nMoats / technology: ${data.moats}\n\n` +
                `Market: ${data.market}\n\nValidation: ${data.validation}\n\nTraction: ${data.traction}\n\n` +
                `Return all six scores (investor readiness, moat, execution, market/TAM, defensibility, scalability) ` +
                `each with a two-sentence explanation, a SWOT with 2-4 items per quadrant, 5-6 meaningful observations, ` +
                `a valuation/moat note describing what strengthens or weakens defensibility today, and exactly 3 ` +
                `prioritised next actions written as concrete tasks.`,
    });

    const parsed = JSON.parse(raw) as {
      scores: { key: string; label: string; score: number; explanation: string }[];
      swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
      observations: string[];
      moatNote: string;
      priorities: string[];
    };
    return {
      ...parsed,
      entityName: data.entityName,
      targetCapital: data.targetCapital,
      category: data.category,
      stage: data.stage,
      generatedAt: new Date().toISOString(),
    };
  });

const qualityInput = z.object({
  title: z.string(),
  organization: z.string(),
  type: z.string(),
  description: z.string(),
  eligibility: z.string(),
  deadline: z.string(),
  benefits: z.string(),
  applicationInfo: z.string(),
  verification: z.string(),
});

export const checkOpportunityQuality = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => qualityInput.parse(input))
  .handler(async ({ data }) => {
    const { runStructuredAI } = await import("./ai-provider.server");
    const { raw } = await runStructuredAI({
      instructions:
        GUARDRAILS +
        " You are running a publication quality gate for an opportunity listing. Be strict about vague eligibility, placeholder text, missing application instructions and unclear deadlines.",
      effort: "low",
      schemaName: "quality_gate",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["status", "summary", "issues"],
        properties: {
          status: {
            type: "string",
            enum: ["READY TO SUBMIT", "NEEDS REVISION", "INCOMPLETE", "ELIGIBILITY MISMATCH", "MANUAL REVIEW"],
          },
          summary: { type: "string" },
          issues: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["problem", "whyItMatters", "suggestedFix", "severity"],
              properties: {
                problem: { type: "string" },
                whyItMatters: { type: "string" },
                suggestedFix: { type: "string" },
                severity: { type: "string", enum: ["blocker", "warning", "note"] },
              },
            },
          },
        },
      },
      prompt:
                `Run the quality gate on this opportunity listing and return json.\n\n` +
                `Title: ${data.title}\nOrganization: ${data.organization}\nType: ${data.type}\n` +
                `Description: ${data.description}\nEligibility: ${data.eligibility}\n` +
                `Deadline: ${data.deadline}\nBenefits: ${data.benefits}\n` +
                `Application: ${data.applicationInfo}\nVerification: ${data.verification}`,
    });

    return JSON.parse(raw) as {
      status: string;
      summary: string;
      issues: { problem: string; whyItMatters: string; suggestedFix: string; severity: string }[];
    };
  });
