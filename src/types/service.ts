export interface BeautyService {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  deleted_at: string | null;
}

export interface ServiceInput {
  business_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  is_active?: boolean;
}

export interface ServiceFormInput {
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}
