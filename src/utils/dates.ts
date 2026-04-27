import { addDays, format, isBefore, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const todayIso = () => format(new Date(), "yyyy-MM-dd");

export const addDaysIso = (days: number) => format(addDays(new Date(), days), "yyyy-MM-dd");

export const formatLongDate = (date: string) =>
  format(parseISO(`${date}T12:00:00`), "dd 'de' MMMM, EEEE", { locale: ptBR });

export const formatShortDate = (date: string) =>
  format(parseISO(`${date}T12:00:00`), "dd/MM", { locale: ptBR });

export const weekdayFromIso = (date: string) => parseISO(`${date}T12:00:00`).getDay();

export const timeToMinutes = (time: string) => {
  const [hour, minute] = time.slice(0, 5).split(":").map(Number);
  return hour * 60 + minute;
};

export const minutesToTime = (minutes: number) => {
  const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
  const minute = String(minutes % 60).padStart(2, "0");
  return `${hour}:${minute}`;
};

export const addMinutesToTime = (time: string, minutes: number) => minutesToTime(timeToMinutes(time) + minutes);

export const makeSlots = (start: string, end: string, interval: number) => {
  const slots: string[] = [];
  let current = timeToMinutes(start);
  const limit = timeToMinutes(end);
  while (current < limit) {
    slots.push(minutesToTime(current));
    current += interval;
  }
  return slots;
};

export const isPastDateTime = (date: string, time: string) => {
  const target = parseISO(`${date}T${time.slice(0, 5)}:00`);
  return isBefore(target, new Date());
};
