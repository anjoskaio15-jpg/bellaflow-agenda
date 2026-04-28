import { FormEvent, useEffect, useState } from "react";
import type React from "react";
import { Eye, FileText, Palette, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { applyTheme } from "@/lib/theme";
import { updateBusinessConfig } from "@/services/businessService";
import type { Business, BusinessConfigInput } from "@/types/business";

type Tab = "info" | "texts" | "theme" | "preview";

const colorFields = [
  ["primary_color", "Cor primaria"],
  ["secondary_color", "Cor secundaria"],
  ["background_color", "Cor de fundo"],
  ["text_color", "Cor do texto"],
  ["card_color", "Cor dos cards"],
] as const;

interface BusinessCustomizationProps {
  business: Business;
  onBusinessUpdated: (business: Business) => void;
}

export function BusinessCustomization({ business, onBusinessUpdated }: BusinessCustomizationProps) {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [form, setForm] = useState<BusinessConfigInput>(() => normalizeBusiness(business));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(normalizeBusiness(business));
  }, [business]);

  useEffect(() => {
    applyTheme(form);
  }, [form]);

  const set = <K extends keyof BusinessConfigInput>(key: K, value: BusinessConfigInput[K]) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "text_color") next.foreground_color = String(value || "#2A1D1F");
      return next;
    });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await updateBusinessConfig(business.id, {
        ...form,
        foreground_color: form.text_color || form.foreground_color,
      });
      onBusinessUpdated(saved);
      toast.success("Minha Pagina foi atualizada.");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Erro ao salvar personalizacao do negocio:", { businessId: business.id, form, error });
      }
      toast.error("Nao foi possivel salvar as alteracoes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minha Página</CardTitle>
        <p className="text-sm text-muted-foreground">Personalize os textos e a identidade visual da sua pagina publica.</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <TabButton active={activeTab === "info"} icon={<Store className="h-4 w-4" />} onClick={() => setActiveTab("info")}>Informações</TabButton>
            <TabButton active={activeTab === "texts"} icon={<FileText className="h-4 w-4" />} onClick={() => setActiveTab("texts")}>Textos</TabButton>
            <TabButton active={activeTab === "theme"} icon={<Palette className="h-4 w-4" />} onClick={() => setActiveTab("theme")}>Aparência</TabButton>
            <TabButton active={activeTab === "preview"} icon={<Eye className="h-4 w-4" />} onClick={() => setActiveTab("preview")}>Preview</TabButton>
          </div>

          {activeTab === "info" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Nome do negócio"><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label="Subtítulo"><Input value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} /></Field>
              <Field label="Cidade"><Input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} /></Field>
              <Field label="Endereço"><Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} /></Field>
              <Field label="WhatsApp"><Input value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
              <Field label="Instagram"><Input value={form.instagram ?? ""} onChange={(e) => set("instagram", e.target.value)} placeholder="@seuperfil" /></Field>
            </div>
          ) : null}

          {activeTab === "texts" ? (
            <div className="grid gap-3">
              <Field label="Headline"><Input value={form.headline ?? ""} onChange={(e) => set("headline", e.target.value)} /></Field>
              <Field label="Bio"><Textarea value={form.bio ?? ""} onChange={(e) => set("bio", e.target.value)} /></Field>
              <Field label="Texto de agendamento"><Textarea value={form.booking_text ?? ""} onChange={(e) => set("booking_text", e.target.value)} /></Field>
              <Field label="Texto de confirmação"><Textarea value={form.confirmation_text ?? ""} onChange={(e) => set("confirmation_text", e.target.value)} /></Field>
            </div>
          ) : null}

          {activeTab === "theme" ? (
            <div className="grid gap-3 md:grid-cols-2">
              {colorFields.map(([key, label]) => (
                <Field key={key} label={label}>
                  <div className="flex gap-2">
                    <Input type="color" className="w-16 p-1" value={(form[key] as string) || "#ffffff"} onChange={(e) => set(key, e.target.value)} />
                    <Input value={(form[key] as string) || ""} onChange={(e) => set(key, e.target.value)} />
                  </div>
                </Field>
              ))}
            </div>
          ) : null}

          {activeTab === "preview" ? (
            <div className="rounded-lg border p-4" style={{ background: form.background_color, color: form.text_color || form.foreground_color }}>
              <div className="rounded-lg border p-4 shadow-sm" style={{ background: form.card_color, borderColor: form.secondary_color }}>
                <p className="text-xs font-bold uppercase" style={{ color: form.primary_color }}>{form.city || "Sua cidade"}</p>
                <h3 className="mt-2 text-2xl font-bold">{form.name || "Nome do negócio"}</h3>
                <p className="mt-1 font-medium">{form.subtitle || "Subtitulo da pagina"}</p>
                <p className="mt-3 text-sm opacity-75">{form.bio || form.description || "Bio da pagina publica."}</p>
                <button type="button" className="mt-4 h-11 rounded-md px-4 text-sm font-semibold text-white" style={{ background: form.primary_color }}>
                  Continuar agendamento
                </button>
              </div>
            </div>
          ) : null}

          <Button className="h-12 w-full text-base" disabled={saving}>
            {saving ? "Salvando..." : "Salvar Minha Página"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function normalizeBusiness(business: Business): BusinessConfigInput {
  return {
    name: business.name,
    subtitle: business.subtitle ?? "",
    description: business.description ?? "",
    address: business.address ?? "",
    city: business.city ?? "",
    whatsapp: business.whatsapp,
    instagram: business.instagram ?? "",
    headline: business.headline ?? "",
    bio: business.bio ?? "",
    booking_text: business.booking_text ?? "",
    confirmation_text: business.confirmation_text ?? "",
    primary_color: business.primary_color || "#C98F9B",
    secondary_color: business.secondary_color || "#F3DDE2",
    background_color: business.background_color || "#FFF8F8",
    text_color: business.text_color || business.foreground_color || "#2A1D1F",
    foreground_color: business.text_color || business.foreground_color || "#2A1D1F",
    card_color: business.card_color || "#FFFFFF",
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function TabButton({ active, icon, children, onClick }: { active: boolean; icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <Button type="button" variant={active ? "default" : "outline"} className="justify-start" onClick={onClick}>
      {icon} {children}
    </Button>
  );
}
