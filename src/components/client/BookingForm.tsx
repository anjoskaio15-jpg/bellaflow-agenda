import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskWhatsapp } from "@/utils/masks";

interface BookingFormProps {
  name: string;
  whatsapp: string;
  onNameChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
}

export function BookingForm({ name, whatsapp, onNameChange, onWhatsappChange }: BookingFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="client-name">Nome</Label>
        <Input id="client-name" value={name} onChange={(event) => onNameChange(event.target.value)} autoComplete="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client-whatsapp">WhatsApp</Label>
        <Input
          id="client-whatsapp"
          value={whatsapp}
          onChange={(event) => onWhatsappChange(maskWhatsapp(event.target.value))}
          inputMode="tel"
          autoComplete="tel"
          placeholder="(85) 99999-9999"
        />
      </div>
    </div>
  );
}
