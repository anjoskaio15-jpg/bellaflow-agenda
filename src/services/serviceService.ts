import { supabase } from "@/lib/supabase";
import type { BeautyService, ServiceFormInput, ServiceInput } from "@/types/service";

export async function getServices(businessId: string) {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("name", { ascending: true })
    .returns<BeautyService[]>();

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Erro Supabase em getServices:", {
        businessId,
        query: "services select active by business_id order by name",
        error,
      });
    }
    throw error;
  }

  return data ?? [];
}

export async function getServicesByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", businessId)
    .order("name", { ascending: true })
    .returns<BeautyService[]>();

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Erro Supabase em getServicesByBusiness:", {
        businessId,
        query: "services select by business_id order by name",
        error,
      });
    }
    throw error;
  }

  return (data ?? []).filter((service) => !service.deleted_at);
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

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Erro Supabase em createService:", { businessId, input, error });
    }
    throw error;
  }

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

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Erro Supabase em updateService:", { businessId, serviceId, input, error });
    }
    throw error;
  }

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

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Erro Supabase em toggleServiceActive:", { businessId, serviceId, isActive, error });
    }
    throw error;
  }

  return data;
}

export async function deleteService(businessId: string, serviceId: string) {
  const { error } = await supabase
    .from("services")
    .update({ is_active: false, deleted_at: new Date().toISOString() })
    .eq("business_id", businessId)
    .eq("id", serviceId)
    .is("deleted_at", null);

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Erro Supabase em deleteService:", { businessId, serviceId, error });
    }
    throw error;
  }
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
