import { onlyDigits } from "./masks";

export const validateBookingBasics = (name: string, whatsapp: string, serviceCount: number) => {
  if (serviceCount < 1) return "Escolha pelo menos um servico.";
  if (serviceCount > 3) return "Voce pode escolher no maximo 3 servicos.";
  if (name.trim().length < 2) return "Informe um nome com pelo menos 2 letras.";
  if (onlyDigits(whatsapp).length < 10) return "Informe um WhatsApp valido com DDD.";
  return null;
};
