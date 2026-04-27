export interface Schedule {
  id: string;
  business_id: string;
  weekday: number;
  is_working_day: boolean;
  start_time: string;
  end_time: string;
  slot_interval_minutes: number;
}

export interface BlockedDate {
  id: string;
  business_id: string;
  blocked_date: string;
  reason: string | null;
}

export interface ScheduleOverride {
  id: string;
  business_id: string;
  override_date: string;
  slot_time: string;
  type: "extra" | "removed";
}

export interface DaySchedule {
  schedule: Schedule | null;
  blocked: boolean;
  overrides: ScheduleOverride[];
  slots: string[];
}
