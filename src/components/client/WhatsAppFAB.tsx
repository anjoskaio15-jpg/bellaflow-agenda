import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsappUrl } from "@/utils/whatsapp";

export function WhatsAppFAB({ phone, businessName }: { phone: string; businessName: string }) {
  return (
    <Button asChild size="icon" className="fixed bottom-24 right-4 z-30 rounded-full shadow-soft md:bottom-6">
      <a href={buildWhatsappUrl(phone, `Oi! Tenho uma duvida sobre a agenda da ${businessName}.`)} aria-label="Falar no WhatsApp">
        <MessageCircle className="h-5 w-5" />
      </a>
    </Button>
  );
}
