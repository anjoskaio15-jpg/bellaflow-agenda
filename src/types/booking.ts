export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: string;
  business_id: string;
  client_name: string;
  client_whatsapp: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  service_ids: string[];
  total_duration_minutes: number;
  total_price: number;
  created_at: string;
}

export interface BookingInput {
  business_id: string;
  client_name: string;
  client_whatsapp: string;
  booking_date: string;
  start_time: string;
  service_ids: string[];
  total_duration_minutes: number;
  total_price: number;
}
