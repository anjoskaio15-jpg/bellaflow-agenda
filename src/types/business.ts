export type BusinessRole = "owner" | "professional" | "agency" | "dev";
export type BusinessPlan = "starter" | "pro" | "agency";

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  whatsapp: string;
  email: string | null;
  address: string | null;
  plan: BusinessPlan;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  foreground_color: string;
  card_color: string;
  border_color: string;
  muted_color: string;
  success_color: string;
  danger_color: string;
  booking_text: string | null;
  confirmation_text: string | null;
  powered_by_enabled: boolean;
  is_active: boolean;
}

export interface BusinessUser {
  id: string;
  business_id: string;
  user_id: string;
  role: BusinessRole;
}

export interface BusinessConfigInput {
  name?: string;
  slug?: string;
  description?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  plan?: BusinessPlan;
  primary_color?: string;
  secondary_color?: string;
  background_color?: string;
  foreground_color?: string;
  card_color?: string;
  border_color?: string;
  muted_color?: string;
  success_color?: string;
  danger_color?: string;
  booking_text?: string;
  confirmation_text?: string;
  powered_by_enabled?: boolean;
}
