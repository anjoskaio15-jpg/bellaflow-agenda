import { supabase } from "@/lib/supabase";
import type { BeautyService, ServiceFormInput, ServiceInput } from "@/types/service";

export async function getServices(businessId: string) {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .returns<BeautyService[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getServicesByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .returns<BeautyService[]>();

  if (error) throw error;
  return data ?? [];
}

export async function createService(businessId: string, input: ServiceFormInput) {
  const { data, error } = await supabase
    .from("services")
    .insert({
      business_id: businessId,
      name: input.name.trim(),
      description: input.description.trim() || null,
      duration_minutes: input.duration_minutes,
      price: input.price,
      is_active: input.is_active,
    })
    .select("*")
    .single<BeautyService>();

  if (error) throw error;
  return data;
}

export async function updateService(businessId: string, serviceId: string, input: ServiceFormInput) {
  const { data, error } = await supabase
    .from("services")
    .update({
      name: input.name.trim(),
      description: input.description.trim() || null,
      duration_minutes: input.duration_minutes,
      price: input.price,
      is_active: input.is_active,
    })
    .eq("business_id", businessId)
    .eq("id", serviceId)
    .is("deleted_at", null)
    .select("*")
    .single<BeautyService>();

  if (error) throw error;
  return data;
}

export async function toggleServiceActive(businessId: string, serviceId: string, isActive: boolean) {
  const { data, error } = await supabase
    .from("services")
    .update({ is_active: isActive })
    .eq("business_id", businessId)
    .eq("id", serviceId)
    .is("deleted_at", null)
    .select("*")
    .single<BeautyService>();

  if (error) throw error;
  return data;
}

export async function deleteService(businessId: string, serviceId: string) {
  const { error } = await supabase
    .from("services")
    .update({ is_active: false, deleted_at: new Date().toISOString() })
    .eq("business_id", businessId)
    .eq("id", serviceId)
    .is("deleted_at", null);

  if (error) throw error;
}

export async function upsertService(input: ServiceInput & { id?: string }) {
  if (input.id) {
    return updateService(input.business_id, input.id, {
      name: input.name,
      description: input.description ?? "",
      duration_minutes: input.duration_minutes,
      price: input.price,
      is_active: input.is_active ?? true,
    });
  }

  return createService(input.business_id, {
    name: input.name,
    description: input.description ?? "",
    duration_minutes: input.duration_minutes,
    price: input.price,
    is_active: input.is_active ?? true,
  });
}
