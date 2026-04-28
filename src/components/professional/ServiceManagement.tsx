import { FormEvent, useEffect, useState } from "react";
import { Edit3, Plus, Power, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createService,
  deleteService,
  getServicesByBusiness,
  toggleServiceActive,
  updateService,
} from "@/services/serviceService";
import type { BeautyService, ServiceFormInput } from "@/types/service";
import { cn } from "@/lib/utils";

const emptyForm: ServiceFormInput = {
  name: "",
  description: "",
  duration_minutes: 60,
  price: 0,
  is_active: true,
};

interface ServiceManagementProps {
  businessId: string;
  onServicesChanged?: (services: BeautyService[]) => void;
}

export function ServiceManagement({ businessId, onServicesChanged }: ServiceManagementProps) {
  const [services, setServices] = useState<BeautyService[]>([]);
  const [form, setForm] = useState<ServiceFormInput>(emptyForm);
  const [editingService, setEditingService] = useState<BeautyService | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await getServicesByBusiness(businessId);
      setServices(loaded);
      onServicesChanged?.(loaded);
    } catch {
      setError("Nao foi possivel carregar seus servicos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [businessId]);

  const openNewForm = () => {
    setEditingService(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (service: BeautyService) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description ?? "",
      duration_minutes: service.duration_minutes,
      price: Number(service.price),
      is_active: service.is_active,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingService(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const validate = () => {
    if (!form.name.trim()) return "Informe o nome do servico.";
    if (!form.duration_minutes || form.duration_minutes <= 0) return "A duracao deve ser maior que zero.";
    if (form.price < 0) return "O preco nao pode ser negativo.";
    return null;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      toast.warning(validationError);
      return;
    }

    setSaving(true);
    try {
      if (editingService) {
        await updateService(businessId, editingService.id, form);
        toast.success("Servico atualizado com sucesso.");
      } else {
        await createService(businessId, form);
        toast.success("Novo servico criado com sucesso.");
      }
      closeForm();
      await loadServices();
    } catch {
      toast.error("Nao foi possivel salvar o servico.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (service: BeautyService) => {
    try {
      await toggleServiceActive(businessId, service.id, !service.is_active);
      toast.success(service.is_active ? "Servico desativado." : "Servico ativado.");
      await loadServices();
    } catch {
      toast.error("Nao foi possivel alterar o status do servico.");
    }
  };

  const remove = async (service: BeautyService) => {
    try {
      await deleteService(businessId, service.id);
      toast.success("Servico removido.");
      await loadServices();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Erro ao remover servico na UI:", {
          businessId,
          serviceId: service.id,
          service,
          error,
        });
      }
      toast.error("Nao foi possivel remover o servico.");
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Meus servicos</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Adicione, edite precos, duracao e disponibilidade dos atendimentos.</p>
          </div>
          <Button type="button" onClick={openNewForm}>
            <Plus className="h-4 w-4" /> Novo servico
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {showForm ? (
          <form className="space-y-4 rounded-lg border bg-secondary/20 p-4" onSubmit={submit}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">{editingService ? "Editar servico" : "Novo servico"}</h3>
              <Button type="button" size="icon" variant="ghost" onClick={closeForm} aria-label="Fechar formulario">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-name">Nome do servico</Label>
              <Input
                id="service-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Ex: Design de sobrancelhas"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-description">Descricao</Label>
              <Textarea
                id="service-description"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Explique rapidamente o que esta incluso."
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="service-duration">Duracao em minutos</Label>
                <Input
                  id="service-duration"
                  type="number"
                  min={1}
                  value={form.duration_minutes}
                  onChange={(event) => setForm((current) => ({ ...current, duration_minutes: Number(event.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-price">Preco</Label>
                <Input
                  id="service-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))}
                  required
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-md border bg-card p-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
              />
              Mostrar este servico na pagina da cliente
            </label>

            <Button className="h-12 w-full text-base" disabled={saving}>
              {saving ? "Salvando..." : editingService ? "Salvar alteracoes" : "Criar servico"}
            </Button>
          </form>
        ) : null}

        {loading ? <p className="rounded-md border bg-card p-4 text-sm text-muted-foreground">Carregando servicos...</p> : null}

        {error ? (
          <div className="space-y-3 rounded-md border bg-card p-4">
            <p className="text-sm text-danger">{error}</p>
            <Button type="button" variant="outline" onClick={loadServices}>
              Tentar novamente
            </Button>
          </div>
        ) : null}

        {!loading && !error && services.length === 0 ? (
          <div className="rounded-lg border bg-card p-5 text-center">
            <h3 className="font-semibold">Nenhum servico cadastrado</h3>
            <p className="mt-2 text-sm text-muted-foreground">Crie seu primeiro servico para liberar agendamentos na pagina da cliente.</p>
            <Button type="button" className="mt-4 w-full sm:w-auto" onClick={openNewForm}>
              <Plus className="h-4 w-4" /> Novo servico
            </Button>
          </div>
        ) : null}

        {!loading && !error && services.length > 0 ? (
          <div className="space-y-3">
            {services.map((service) => (
              <article key={service.id} className={cn("rounded-lg border bg-card p-4", !service.is_active && "opacity-70")}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{service.name}</h3>
                        <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", service.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                          {service.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      {service.description ? <p className="mt-1 text-sm text-muted-foreground">{service.description}</p> : null}
                    </div>
                    <strong className="text-right">R$ {Number(service.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                  </div>

                  <p className="text-sm text-muted-foreground">{service.duration_minutes} minutos</p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Button type="button" variant="outline" onClick={() => openEditForm(service)}>
                      <Edit3 className="h-4 w-4" /> Editar
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => toggleActive(service)}>
                      <Power className="h-4 w-4" /> {service.is_active ? "Desativar" : "Ativar"}
                    </Button>
                    <ConfirmDialog
                      title="Remover servico?"
                      description="O servico sera ocultado da gestao e da pagina publica. Agendamentos antigos continuam preservados."
                      onConfirm={() => remove(service)}
                    >
                      <Button type="button" variant="danger">
                        <Trash2 className="h-4 w-4" /> Remover
                      </Button>
                    </ConfirmDialog>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
