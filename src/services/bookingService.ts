import { supabase } from "@/lib/supabase";
import type { Booking, BookingInput } from "@/types/booking";
import { addMinutesToTime, todayIso } from "@/utils/dates";

export async function getBookingsByDate(businessId: string, date: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("business_id", businessId)
    .eq("booking_date", date)
    .neq("status", "cancelled")
    .order("start_time")
    .returns<Booking[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getUpcomingBookings(businessId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("business_id", businessId)
    .gte("booking_date", todayIso())
    .neq("status", "cancelled")
    .order("booking_date")
    .order("start_time")
    .returns<Booking[]>();

  if (error) throw error;
  return data ?? [];
}

export async function createBooking(input: BookingInput) {
  const booking = {
    ...input,
    end_time: addMinutesToTime(input.start_time, input.total_duration_minutes),
    status: "pending",
  };

  const { data, error } = await supabase.from("bookings").insert(booking).select("*").single<Booking>();
  if (error) throw error;
  return data;
}

export async function cancelBooking(bookingId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .select("*")
    .single<Booking>();

  if (error) throw error;
  return data;
}
