import { supabase } from "@/lib/supabase";
import type { Business, BusinessConfigInput, BusinessRole, BusinessUser } from "@/types/business";

export async function getBusinessBySlug(slug: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single<Business>();

  if (error) throw error;
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
