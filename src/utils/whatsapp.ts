import type { BeautyService } from "@/types/service";
import { formatLongDate } from "./dates";
import { normalizeBrazilWhatsapp } from "./masks";

export const buildClientConfirmationMessage = (name: string, services: BeautyService[], date: string, time: string) => {
  const serviceNames = services.map((service) => service.name).join(", ");
  return `Oi, meu nome e ${name}. Quero confirmar meu horario para ${serviceNames} no dia ${formatLongDate(date)} as ${time}.`;
};

export const buildWhatsappUrl = (phone: string, message: string) =>
  `https://wa.me/${normalizeBrazilWhatsapp(phone)}?text=${encodeURIComponent(message)}`;

export const messageTemplates = {
  confirmation: (name: string, service: string, date: string, time: string) =>
    `Oi, ${name}! Seu horario de ${service} esta pre-agendado para ${formatLongDate(date)} as ${time}. Podemos confirmar?`,
  reminder: (name: string, service: string, date: string, time: string) =>
    `Oi, ${name}! Passando para lembrar do seu atendimento de ${service} em ${formatLongDate(date)} as ${time}.`,
  recovery: (name: string) =>
    `Oi, ${name}! Senti sua falta por aqui. Tenho alguns horarios especiais essa semana se quiser cuidar de voce.`,
  promotion: (date: string, time: string) =>
    `Horario disponivel: ${formatLongDate(date)} as ${time}. Quer reservar esse momento para voce?`,
};
