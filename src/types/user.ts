import type { BusinessRole } from "./business";

export interface AuthProfile {
  id: string;
  email?: string;
  businessId?: string;
  role?: BusinessRole;
}
