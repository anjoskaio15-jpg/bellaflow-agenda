export type BusinessRole = "owner" | "professional" | "agency" | "dev";
export type BusinessPlan = "starter" | "pro" | "agency";

export interface Business {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  whatsapp: string;
  email: string | null;
  address: string | null;
  city: string | null;
  instagram: string | null;
  plan: BusinessPlan;
  headline: string | null;
  bio: string | null;
  highlight_1_title: string | null;
  highlight_1_subtitle: string | null;
  highlight_2_title: string | null;
  highlight_2_subtitle: string | null;
  highlight_3_title: string | null;
  highlight_3_subtitle: string | null;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string | null;
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
  subtitle?: string;
  description?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  instagram?: string;
  plan?: BusinessPlan;
  headline?: string;
  bio?: string;
  highlight_1_title?: string;
  highlight_1_subtitle?: string;
  highlight_2_title?: string;
  highlight_2_subtitle?: string;
  highlight_3_title?: string;
  highlight_3_subtitle?: string;
  primary_color?: string;
  secondary_color?: string;
  background_color?: string;
  text_color?: string;
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
