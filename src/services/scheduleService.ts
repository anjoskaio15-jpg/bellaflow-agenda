import { supabase } from "@/lib/supabase";
import type { Booking } from "@/types/booking";
import type { DaySchedule, Schedule, ScheduleOverride } from "@/types/schedule";
import { isPastDateTime, makeSlots, timeToMinutes, weekdayFromIso } from "@/utils/dates";
import { getBookingsByDate } from "./bookingService";

export async function getSchedules(businessId: string) {
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("business_id", businessId)
    .order("weekday")
    .returns<Schedule[]>();

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Erro Supabase em getSchedules:", { businessId, error });
    }
    throw error;
  }

  return data ?? [];
}

export async function getDaySchedule(businessId: string, date: string): Promise<DaySchedule> {
  const weekday = weekdayFromIso(date);

  const [{ data: schedule, error: scheduleError }, { data: blocked }, { data: overrides }] = await Promise.all([
    supabase.from("schedules").select("*").eq("business_id", businessId).eq("weekday", weekday).maybeSingle<Schedule>(),
    supabase.from("blocked_dates").select("*").eq("business_id", businessId).eq("blocked_date", date).maybeSingle(),
    supabase.from("schedule_overrides").select("*").eq("business_id", businessId).eq("override_date", date).returns<ScheduleOverride[]>(),
  ]);

  if (scheduleError) {
    if (import.meta.env.DEV) {
      console.error("Erro Supabase em getDaySchedule:", {
        businessId,
        date,
        weekday,
        error: scheduleError,
      });
    }
    throw scheduleError;
  }

  const baseSlots = schedule?.is_working_day ? makeSlots(schedule.start_time, schedule.end_time, schedule.slot_interval_minutes) : [];
  const removed = new Set((overrides ?? []).filter((item) => item.type === "removed").map((item) => item.slot_time.slice(0, 5)));
  const extra = (overrides ?? []).filter((item) => item.type === "extra").map((item) => item.slot_time.slice(0, 5));
  const slots = [...new Set([...baseSlots, ...extra])]
    .filter((slot) => !removed.has(slot))
    .sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

  return {
    schedule: schedule ?? null,
    blocked: Boolean(blocked),
    overrides: overrides ?? [],
    slots,
  };
}

const overlaps = (slot: string, duration: number, bookings: Booking[]) => {
  const slotStart = timeToMinutes(slot);
  const slotEnd = slotStart + duration;
  return bookings.some((booking) => {
    const start = timeToMinutes(booking.start_time);
    const end = timeToMinutes(booking.end_time);
    return slotStart < end && slotEnd > start;
  });
};

export async function getAvailableSlots(businessId: string, date: string, durationMinutes: number) {
  const [daySchedule, bookings] = await Promise.all([getDaySchedule(businessId, date), getBookingsByDate(businessId, date)]);
  if (!daySchedule.schedule?.is_working_day || daySchedule.blocked) return [];

  return daySchedule.slots.filter((slot) => {
    const end = timeToMinutes(slot) + durationMinutes;
    const scheduleEnd = timeToMinutes(daySchedule.schedule?.end_time ?? "00:00");
    return end <= scheduleEnd && !overlaps(slot, durationMinutes, bookings) && !isPastDateTime(date, slot);
  });
}

export async function toggleWorkingDay(schedule: Schedule, isWorkingDay: boolean) {
  const { data, error } = await supabase
    .from("schedules")
    .update({ is_working_day: isWorkingDay })
    .eq("id", schedule.id)
    .select("*")
    .single<Schedule>();

  if (error) throw error;
  return data;
}

export async function updateScheduleHours(schedule: Schedule, input: Pick<Schedule, "start_time" | "end_time" | "slot_interval_minutes">) {
  const { data, error } = await supabase.from("schedules").update(input).eq("id", schedule.id).select("*").single<Schedule>();
  if (error) throw error;
  return data;
}

export async function toggleBlockedDate(businessId: string, date: string, blocked: boolean) {
  if (blocked) {
    const { error } = await supabase.from("blocked_dates").insert({ business_id: businessId, blocked_date: date });
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("blocked_dates").delete().eq("business_id", businessId).eq("blocked_date", date);
  if (error) throw error;
}

export async function addExtraSlot(businessId: string, date: string, time: string) {
  const { data, error } = await supabase
    .from("schedule_overrides")
    .upsert({ business_id: businessId, override_date: date, slot_time: time, type: "extra" })
    .select("*")
    .single<ScheduleOverride>();

  if (error) throw error;
  return data;
}

export async function removeSlot(businessId: string, date: string, time: string) {
  const bookings = await getBookingsByDate(businessId, date);
  if (bookings.some((booking) => booking.start_time.slice(0, 5) === time.slice(0, 5))) {
    throw new Error("Nao e possivel remover um horario com agendamento.");
  }

  const { data, error } = await supabase
    .from("schedule_overrides")
    .upsert({ business_id: businessId, override_date: date, slot_time: time, type: "removed" })
    .select("*")
    .single<ScheduleOverride>();

  if (error) throw error;
  return data;
}
