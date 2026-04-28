import { CalendarHeart, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { BookingForm } from "@/components/client/BookingForm";
import { BottomBar } from "@/components/client/BottomBar";
import { CalendarPicker } from "@/components/client/CalendarPicker";
import { Confirmation } from "@/components/client/Confirmation";
import { SalonHeader } from "@/components/client/SalonHeader";
import { ServiceList } from "@/components/client/ServiceList";
import { StepIndicator } from "@/components/client/StepIndicator";
import { TimeSlots } from "@/components/client/TimeSlots";
import { WhatsAppFAB } from "@/components/client/WhatsAppFAB";
import { Card } from "@/components/ui/card";
import { applyTheme } from "@/lib/theme";
import { createBooking } from "@/services/bookingService";
import { getBusinessBySlug } from "@/services/businessService";
import { getAvailableSlots } from "@/services/scheduleService";
import { getServices } from "@/services/serviceService";
import type { Business } from "@/types/business";
import type { BeautyService } from "@/types/service";
import { addDaysIso, addMinutesToTime, formatLongDate } from "@/utils/dates";
import { onlyDigits } from "@/utils/masks";
import { validateBookingBasics } from "@/utils/validation";

export function ClientePage() {
  const { slug = "" } = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<BeautyService[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [date, setDate] = useState(addDaysIso(1));
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [step, setStep] = useState(1);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const selectedServices = useMemo(() => services.filter((service) => selectedIds.includes(service.id)), [services, selectedIds]);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration_minutes, 0);
  const totalPrice = selectedServices.reduce((sum, service) => sum + Number(service.price), 0);
  const totalLabel = selectedServices.length
    ? `R$ ${totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
    : "Escolha um servico";
  const summaryLabel = selectedServices.length
    ? `${selectedServices.length} servico${selectedServices.length > 1 ? "s" : ""} - ${totalDuration} min`
    : "Agendamento Taina Melo Beauty";

  useEffect(() => {
    async function load() {
      setLoading(true);
      const loadedBusiness = await getBusinessBySlug(slug);
      if (!loadedBusiness) {
        setBusiness(null);
        setServices([]);
        return;
      }
      setBusiness(loadedBusiness);
      applyTheme(loadedBusiness);

      const loadedServices = await getServices(loadedBusiness.id);
      setServices(loadedServices);
    }

    load()
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error("Erro ao carregar ClientePage:", {
            slug,
            error,
          });
        }
        toast.error("Nao conseguimos carregar a agenda agora. Tente novamente em instantes.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!business || !totalDuration) {
      setSlots([]);
      return;
    }

    setSlotLoading(true);
    getAvailableSlots(business.id, date, totalDuration)
      .then(setSlots)
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error("Erro ao carregar horarios disponiveis:", {
            businessId: business.id,
            date,
            totalDuration,
            error,
          });
        }
        toast.error("Nao conseguimos buscar os horarios dessa data. Escolha outra data ou tente novamente.");
      })
      .finally(() => setSlotLoading(false));
  }, [business, date, totalDuration]);

  const toggleService = (service: BeautyService) => {
    setTime("");
    setSelectedIds((current) => {
      if (current.includes(service.id)) return current.filter((id) => id !== service.id);
      if (current.length >= 3) {
        toast.warning("Voce pode escolher no maximo 3 servicos.");
        return current;
      }
      return [...current, service.id];
    });
  };

  const next = async () => {
    if (step === 1 && selectedIds.length === 0) return toast.warning("Escolha pelo menos um servico para continuar.");
    if (step === 3 && !time) return toast.warning("Escolha um horario disponivel.");
    if (step === 4) {
      const error = validateBookingBasics(name, whatsapp, selectedIds.length);
      if (error) return toast.warning(error);
      if (!business) return;

      setSaving(true);
      try {
        await createBooking({
          business_id: business.id,
          client_name: name.trim(),
          client_whatsapp: onlyDigits(whatsapp),
          booking_date: date,
          start_time: time,
          service_ids: selectedIds,
          total_duration_minutes: totalDuration,
          total_price: totalPrice,
        });
        setConfirmed(true);
        setStep(5);
        toast.success("Agendamento criado com sucesso.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Nao foi possivel criar o agendamento.");
      } finally {
        setSaving(false);
      }
      return;
    }
    setStep((current) => Math.min(current + 1, 5));
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div className="rounded-lg border bg-card p-6 shadow-soft">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <h1 className="mt-4 text-xl font-bold">Preparando sua experiencia</h1>
          <p className="mt-2 text-sm text-muted-foreground">Carregando a agenda da Taina Melo Beauty.</p>
        </div>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div className="max-w-sm rounded-lg border bg-card p-6 shadow-soft">
          <CalendarHeart className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-xl font-bold">Agenda indisponivel</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Nao encontramos essa pagina de agendamento. Confira o link ou fale com a profissional pelo Instagram.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-36 md:pb-8">
      <div className="mx-auto max-w-3xl space-y-5 p-4">
        <SalonHeader business={business} />
        <StepIndicator step={step} />

        <Card className="p-4 shadow-soft">
          {step === 1 ? (
            <section className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">Taina Melo Beauty</p>
                <h2 className="mt-1 text-2xl font-bold">Agende seu horario na Taina Melo Beauty</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Desde 2020, elevando autoestima em Natal/RN. Escolha seu servico, selecione o melhor horario e confirme pelo WhatsApp.
                </p>
              </div>
              <ServiceList services={services} selectedIds={selectedIds} onToggle={toggleService} />
            </section>
          ) : null}

          {step === 2 ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Escolha a data</h2>
                <p className="text-sm text-muted-foreground">Mostramos os proximos dias disponiveis para atendimento.</p>
              </div>
              <CalendarPicker value={date} onChange={(value) => { setDate(value); setTime(""); }} />
            </section>
          ) : null}

          {step === 3 ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Escolha o horario</h2>
                <p className="text-sm text-muted-foreground">{formatLongDate(date)} - termino previsto as {time ? addMinutesToTime(time, totalDuration) : "--:--"}</p>
              </div>
              <TimeSlots slots={slots} selected={time} loading={slotLoading} onSelect={setTime} />
            </section>
          ) : null}

          {step === 4 ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Seus dados</h2>
                <p className="text-sm text-muted-foreground">Usaremos esses dados apenas para identificar e confirmar seu horario.</p>
              </div>
              <BookingForm name={name} whatsapp={whatsapp} onNameChange={setName} onWhatsappChange={setWhatsapp} />
              <div className="rounded-md bg-secondary/50 p-3 text-sm">
                {selectedServices.map((service) => service.name).join(", ")} - {formatLongDate(date)} as {time}
              </div>
            </section>
          ) : null}

          {step === 5 && confirmed ? <Confirmation business={business} name={name} services={selectedServices} date={date} time={time} /> : null}
        </Card>

        {business.powered_by_enabled ? <p className="text-center text-xs text-muted-foreground">Powered by BellaFlow Agenda</p> : null}
      </div>

      {step < 5 ? (
        <BottomBar
          onBack={step > 1 ? () => setStep((current) => current - 1) : undefined}
          onNext={next}
          nextLabel={step === 4 ? "Criar agendamento" : "Continuar agendamento"}
          loading={saving}
          summary={summaryLabel}
          total={totalLabel}
        />
      ) : null}
      <WhatsAppFAB phone={business.whatsapp} businessName={business.name} />
    </main>
  );
}
