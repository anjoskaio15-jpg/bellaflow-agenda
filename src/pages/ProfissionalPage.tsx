import { useEffect, useMemo, useState } from "react";
import { BellRing, CalendarX, Copy, MessageCircle, Plus, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ServiceManagement } from "@/components/professional/ServiceManagement";
import { cancelBooking, getBookingsByDate, getUpcomingBookings } from "@/services/bookingService";
import { getAuthenticatedBusinessBySlug } from "@/services/businessService";
import { addExtraSlot, getDaySchedule, getSchedules, removeSlot, toggleBlockedDate, toggleWorkingDay, updateScheduleHours } from "@/services/scheduleService";
import { getServicesByBusiness } from "@/services/serviceService";
import type { Booking } from "@/types/booking";
import type { Business } from "@/types/business";
import type { Schedule } from "@/types/schedule";
import type { BeautyService } from "@/types/service";
import { todayIso } from "@/utils/dates";
import { buildWhatsappUrl, messageTemplates } from "@/utils/whatsapp";

const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export function ProfissionalPage() {
  const { slug = "" } = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<BeautyService[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [extraTime, setExtraTime] = useState("18:00");
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const todayBookings = useMemo(() => bookings.filter((booking) => booking.booking_date === todayIso()), [bookings]);
  const revenue = useMemo(() => bookings.reduce((sum, booking) => sum + Number(booking.total_price), 0), [bookings]);

  const reload = async () => {
    const access = await getAuthenticatedBusinessBySlug(slug);
    if (!access) {
      setBusiness(null);
      setAccessDenied(true);
      return;
    }
    const loadedBusiness = access.business;

    const [loadedServices, upcoming, loadedSchedules, selectedBookings] = await Promise.all([
      getServicesByBusiness(loadedBusiness.id),
      getUpcomingBookings(loadedBusiness.id),
      getSchedules(loadedBusiness.id),
      getBookingsByDate(loadedBusiness.id, selectedDate),
    ]);
    setBusiness(loadedBusiness);
    setAccessDenied(false);
    setServices(loadedServices);
    setBookings(upcoming);
    setSchedules(loadedSchedules);
    setDayBookings(selectedBookings);
  };

  useEffect(() => {
    setLoading(true);
    reload()
      .catch(() => toast.error("Nao foi possivel carregar o painel."))
      .finally(() => setLoading(false));
  }, [selectedDate, slug]);

  const cancel = async (bookingId: string) => {
    await cancelBooking(bookingId);
    toast.success("Agendamento cancelado.");
    await reload();
  };

  const copyMessage = async (message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Mensagem copiada.");
    } catch {
      toast.error("Nao foi possivel copiar a mensagem.");
    }
  };

  const toggleBlock = async () => {
    if (!business) return;
    const day = await getDaySchedule(business.id, selectedDate);
    await toggleBlockedDate(business.id, selectedDate, !day.blocked);
    toast.success(day.blocked ? "Data liberada." : "Data bloqueada.");
    await reload();
  };

  if (loading) return <main className="grid min-h-screen place-items-center p-6 text-muted-foreground">Carregando painel...</main>;
  if (accessDenied) return <main className="grid min-h-screen place-items-center p-6 text-center">Você não tem acesso a esta agenda</main>;
  if (!business) return <main className="grid min-h-screen place-items-center p-6">Empresa nao encontrada.</main>;

  return (
    <main className="min-h-screen p-4">
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <p className="text-xs font-bold uppercase text-primary">Painel profissional</p>
          <h1 className="text-3xl font-bold">{business.name}</h1>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Hoje</p><strong className="text-2xl">{todayBookings.length}</strong></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Proximos</p><strong className="text-2xl">{bookings.length}</strong></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Receita prevista</p><strong className="text-2xl">R$ {revenue.toLocaleString("pt-BR")}</strong></CardContent></Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Agenda do dia</CardTitle>
              <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input type="time" value={extraTime} onChange={(event) => setExtraTime(event.target.value)} />
                <Button onClick={async () => { await addExtraSlot(business.id, selectedDate, extraTime); toast.success("Horario extra adicionado."); await reload(); }}>
                  <Plus className="h-4 w-4" /> Horario
                </Button>
              </div>
              <Button variant="outline" className="w-full" onClick={toggleBlock}>
                <CalendarX className="h-4 w-4" /> Bloquear ou liberar data
              </Button>
              {dayBookings.map((booking) => {
                const serviceNames = services.filter((service) => booking.service_ids.includes(service.id)).map((service) => service.name).join(", ") || "Servico removido";
                return (
                  <Card key={booking.id} className="p-3 shadow-none">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <strong>{booking.start_time.slice(0, 5)} - {booking.client_name}</strong>
                        <p className="text-sm text-muted-foreground">{serviceNames}</p>
                        <p className="text-xs text-muted-foreground">{booking.status}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button asChild size="icon" variant="outline">
                          <a href={buildWhatsappUrl(booking.client_whatsapp, messageTemplates.confirmation(booking.client_name, serviceNames, booking.booking_date, booking.start_time.slice(0, 5)))} target="_blank" rel="noreferrer">
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          title="Copiar confirmacao"
                          onClick={() => copyMessage(messageTemplates.confirmation(booking.client_name, serviceNames, booking.booking_date, booking.start_time.slice(0, 5)))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          title="Copiar lembrete"
                          onClick={() => copyMessage(messageTemplates.reminder(booking.client_name, serviceNames, booking.booking_date, booking.start_time.slice(0, 5)))}
                        >
                          <BellRing className="h-4 w-4" />
                        </Button>
                        <ConfirmDialog title="Cancelar agendamento?" description="Essa acao muda o status para cancelado." onConfirm={() => cancel(booking.id)}>
                          <Button size="icon" variant="danger"><Trash2 className="h-4 w-4" /></Button>
                        </ConfirmDialog>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {!dayBookings.length ? <p className="text-sm text-muted-foreground">Nenhum agendamento nesta data.</p> : null}
            </CardContent>
          </Card>

          <ServiceManagement businessId={business.id} onServicesChanged={setServices} />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Dias e horarios</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="grid grid-cols-[56px_1fr] gap-2 rounded-md border p-3">
                  <Button variant={schedule.is_working_day ? "default" : "outline"} onClick={async () => { await toggleWorkingDay(schedule, !schedule.is_working_day); await reload(); }}>
                    {weekdays[schedule.weekday]}
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    <Input type="time" value={schedule.start_time.slice(0, 5)} onChange={async (e) => { await updateScheduleHours(schedule, { start_time: e.target.value, end_time: schedule.end_time, slot_interval_minutes: schedule.slot_interval_minutes }); await reload(); }} />
                    <Input type="time" value={schedule.end_time.slice(0, 5)} onChange={async (e) => { await updateScheduleHours(schedule, { start_time: schedule.start_time, end_time: e.target.value, slot_interval_minutes: schedule.slot_interval_minutes }); await reload(); }} />
                    <Input type="number" min={15} step={15} value={schedule.slot_interval_minutes} onChange={async (e) => { await updateScheduleHours(schedule, { start_time: schedule.start_time, end_time: schedule.end_time, slot_interval_minutes: Number(e.target.value) }); await reload(); }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Modelos de WhatsApp</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Template title="Confirmacao" text={messageTemplates.confirmation("Cliente", "Servico", todayIso(), "10:00")} />
              <Template title="Lembrete" text={messageTemplates.reminder("Cliente", "Servico", todayIso(), "10:00")} />
              <Template title="Recuperacao" text={messageTemplates.recovery("Cliente")} />
              <Template title="Horario vago" text={messageTemplates.promotion(todayIso(), "15:00")} />
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await removeSlot(business.id, selectedDate, extraTime);
                    toast.success("Horario removido.");
                    await reload();
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Nao foi possivel remover o horario.");
                  }
                }}
              >
                Remover horario selecionado
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function Template({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border p-3">
      <strong>{title}</strong>
      <p className="mt-1 text-muted-foreground">{text}</p>
    </div>
  );
}
