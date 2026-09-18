import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Identity = {
  userId: string;
  email: string;
  fullName: string;
  role: "founder" | "partner" | null;
  onboarded: boolean;
  organization: {
    name: string;
    contactPerson: string;
    orgType: string;
    website: string | null;
    location: string | null;
    description: string | null;
    focusAreas: string[];
    verification: string;
    onboarded: boolean;
  } | null;
};

/** Server-verified identity. The bearer token is validated before anything is read. */
export const getIdentity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Identity> => {
    const { supabase, userId } = context;

    const [{ data: profile }, { data: roleRow }, { data: org }] = await Promise.all([
      supabase.from("profiles").select("full_name, email, onboarded").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
      supabase
        .from("organizations")
        .select("name, contact_person, org_type, website, location, description, focus_areas, verification, onboarded")
        .eq("owner_id", userId)
        .maybeSingle(),
    ]);

    return {
      userId,
      email: profile?.email ?? "",
      fullName: profile?.full_name ?? "",
      role: (roleRow?.role as "founder" | "partner" | undefined) ?? null,
      onboarded: profile?.onboarded ?? false,
      organization: org
        ? {
            name: org.name,
            contactPerson: org.contact_person,
            orgType: org.org_type,
            website: org.website,
            location: org.location,
            description: org.description,
            focusAreas: org.focus_areas ?? [],
            verification: org.verification,
            onboarded: org.onboarded,
          }
        : null,
    };
  });

/**
 * Sets the account type once (used after Google sign-in, where the provider
 * cannot carry it). An account that already has a type keeps it — no silent
 * conversion between founder and partner.
 */
export const claimRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { role: "founder" | "partner" }) =>
    z.object({ role: z.enum(["founder", "partner"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: role, error } = await context.supabase.rpc("claim_role", { _role: data.role });
    if (error) throw new Error("Your account type could not be set. Please try signing in again.");
    return { role: role as "founder" | "partner" };
  });

export const saveFounderOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { fullName: string; phone?: string }) =>
    z.object({ fullName: z.string().max(120), phone: z.string().max(40).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ full_name: data.fullName, phone: data.phone ?? null, onboarded: true })
      .eq("id", context.userId);
    if (error) throw new Error("Your profile could not be saved. Please try again.");
    return { ok: true };
  });

export const savePartnerOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      organization: string;
      contactPerson: string;
      orgType: string;
      website?: string;
      location?: string;
      description?: string;
      focusAreas: string[];
    }) =>
      z
        .object({
          organization: z.string().max(160),
          contactPerson: z.string().max(120),
          orgType: z.string().max(60),
          website: z.string().max(200).optional(),
          location: z.string().max(120).optional(),
          description: z.string().max(2000).optional(),
          focusAreas: z.array(z.string().max(60)).max(20),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("organizations").upsert(
      {
        owner_id: context.userId,
        name: data.organization,
        contact_person: data.contactPerson,
        org_type: data.orgType,
        website: data.website ?? null,
        location: data.location ?? null,
        description: data.description ?? null,
        focus_areas: data.focusAreas,
        onboarded: true,
      },
      { onConflict: "owner_id" },
    );
    if (error) throw new Error("Your organization details could not be saved. Please try again.");

    await context.supabase.from("profiles").update({ onboarded: true }).eq("id", context.userId);
    return { ok: true };
  });
