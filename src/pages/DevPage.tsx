import { FormEvent, useEffect, useState } from "react";
import type React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { applyTheme } from "@/lib/theme";
import { createBusiness, getMyBusiness, updateBusinessConfig } from "@/services/businessService";
import type { Business, BusinessConfigInput, BusinessPlan } from "@/types/business";

const defaultForm: BusinessConfigInput = {
  name: "",
  slug: "",
  description: "",
  whatsapp: "",
  email: "",
  address: "",
  plan: "starter",
  primary_color: "#C98F9B",
  secondary_color: "#F4DDE2",
  background_color: "#FFF8F8",
  foreground_color: "#2F2528",
  card_color: "#FFFFFF",
  border_color: "#E8D4D8",
  muted_color: "#8D747A",
  success_color: "#4CAF50",
  danger_color: "#D9534F",
  booking_text: "Escolha seu servico e reserve seu horario em poucos passos.",
  confirmation_text: "Seu pedido de horario foi criado. Confirme pelo WhatsApp para garantir seu atendimento.",
  powered_by_enabled: true,
};

export function DevPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [form, setForm] = useState<BusinessConfigInput>(defaultForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBusiness()
      .then((mine) => {
        if (mine?.business) {
          setBusiness(mine.business);
          setForm(mine.business);
          applyTheme(mine.business);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    applyTheme(form);
  }, [form]);

  const set = <K extends keyof BusinessConfigInput>(key: K, value: BusinessConfigInput[K]) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const saved = business ? await updateBusinessConfig(business.id, form) : await createBusiness(form);
    setBusiness(saved);
    setForm(saved);
    toast.success("Configuracao salva.");
  };

  if (loading) return <main className="grid min-h-screen place-items-center p-6 text-muted-foreground">Carregando configurador...</main>;

  return (
    <main className="min-h-screen p-4">
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_.8fr]">
        <form className="space-y-5" onSubmit={submit}>
          <header>
            <p className="text-xs font-bold uppercase text-primary">Dev / Agencia</p>
            <h1 className="text-3xl font-bold">Configurar negocio</h1>
          </header>

          <Card>
            <CardHeader><CardTitle>Dados principais</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              <Field label="Nome"><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} required /></Field>
              <Field label="Slug"><Input value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} required /></Field>
              <Field label="WhatsApp"><Input value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} required /></Field>
              <Field label="E-mail"><Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} /></Field>
              <Field label="Endereco"><Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} /></Field>
              <Field label="Descricao"><Textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
              <Field label="Plano">
                <select className="h-11 rounded-md border bg-card px-3" value={form.plan} onChange={(e) => set("plan", e.target.value as BusinessPlan)}>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="agency">Agency</option>
                </select>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Tema e textos</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                {(["primary_color", "secondary_color", "background_color", "foreground_color", "card_color", "border_color", "muted_color", "success_color", "danger_color"] as const).map((key) => (
                  <Field key={key} label={key.replace("_color", "").replace("_", " ")}>
                    <Input type="color" value={form[key] ?? "#ffffff"} onChange={(e) => set(key, e.target.value)} />
                  </Field>
                ))}
              </div>
              <Field label="Texto de agendamento"><Textarea value={form.booking_text ?? ""} onChange={(e) => set("booking_text", e.target.value)} /></Field>
              <Field label="Texto de confirmacao"><Textarea value={form.confirmation_text ?? ""} onChange={(e) => set("confirmation_text", e.target.value)} /></Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={Boolean(form.powered_by_enabled)} onChange={(e) => set("powered_by_enabled", e.target.checked)} />
                Exibir powered by
              </label>
              <Button>Salvar configuracao</Button>
            </CardContent>
          </Card>
        </form>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <Card className="overflow-hidden">
            <div className="bg-primary p-6 text-primary-foreground">
              <p className="text-sm opacity-80">Preview ao vivo</p>
              <h2 className="mt-2 text-3xl font-bold">{form.name || "Nome do studio"}</h2>
              <p className="mt-2 text-sm opacity-90">{form.description || "Descricao do negocio"}</p>
            </div>
            <CardContent className="space-y-3 p-4">
              <div className="rounded-md bg-secondary p-3 text-sm">{form.booking_text}</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border p-3">Design</div>
                <div className="rounded-md border p-3">Manicure</div>
              </div>
              <Button className="w-full">Agendar agora</Button>
              {form.powered_by_enabled ? <p className="text-center text-xs text-muted-foreground">Powered by BellaFlow Agenda</p> : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
