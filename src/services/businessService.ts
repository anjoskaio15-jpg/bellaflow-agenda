import { supabase } from "@/lib/supabase";
import type { Business, BusinessConfigInput, BusinessRole, BusinessUser } from "@/types/business";

export async function getBusinessBySlug(slug: string) {
  const normalizedSlug = slug.trim();

  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", normalizedSlug)
    .maybeSingle<Business>();

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Erro ao buscar business por slug:", {
        slug: normalizedSlug,
        error,
      });
    }
    throw error;
  }

  if (!data) return null;
  if (!data.is_active) return null;

  return data;
}

export async function getMyBusinessUser() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("business_users")
    .select("*")
    .eq("user_id", userData.user.id)
    .limit(1)
    .maybeSingle<BusinessUser>();

  if (error) throw error;
  return data;
}

export async function getBusinessUserForBusiness(businessId: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("business_users")
    .select("*")
    .eq("business_id", businessId)
    .eq("user_id", userData.user.id)
    .maybeSingle<BusinessUser>();

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Erro ao validar acesso do usuario ao business:", {
        businessId,
        userId: userData.user.id,
        error,
      });
    }
    throw error;
  }

  return data;
}

export async function getAuthenticatedBusinessBySlug(slug: string) {
  const normalizedSlug = slug.trim();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("business_users")
    .select("*, business:businesses(*)")
    .eq("user_id", userData.user.id)
    .returns<Array<BusinessUser & { business: Business | null }>>();

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Erro ao buscar agendas vinculadas ao usuario:", {
        slug: normalizedSlug,
        userId: userData.user.id,
        error,
      });
    }
    throw error;
  }

  const match = (data ?? []).find((item) => item.business?.slug === normalizedSlug && item.business.is_active);
  if (!match?.business) return null;

  return {
    business: match.business,
    membership: {
      id: match.id,
      business_id: match.business_id,
      user_id: match.user_id,
      role: match.role,
    } satisfies BusinessUser,
  };
}

export async function getMyBusiness() {
  const membership = await getMyBusinessUser();
  if (!membership) return null;

  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", membership.business_id)
    .single<Business>();

  if (error) throw error;
  return { business: data, membership };
}

export async function getMyRole() {
  const membership = await getMyBusinessUser();
  return membership?.role ?? null;
}

export function canAccessDev(role?: BusinessRole | null) {
  return role === "owner" || role === "agency" || role === "dev";
}

export async function createBusiness(input: BusinessConfigInput) {
  const { data, error } = await supabase.from("businesses").insert(input).select("*").single<Business>();
  if (error) throw error;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  if (userData.user) {
    const { error: membershipError } = await supabase.from("business_users").insert({
      business_id: data.id,
      user_id: userData.user.id,
      role: "owner",
    });
    if (membershipError) throw membershipError;
  }

  return data;
}

export async function updateBusinessConfig(businessId: string, input: BusinessConfigInput) {
  const { data, error } = await supabase
    .from("businesses")
    .update(input)
    .eq("id", businessId)
    .select("*")
    .single<Business>();

  if (error) throw error;
  return data;
}
