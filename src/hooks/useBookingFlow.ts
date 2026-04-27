import { useMemo, useState } from "react";
import type { BeautyService } from "@/types/service";

export function useBookingFlow(services: BeautyService[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedServices = useMemo(() => services.filter((service) => selectedIds.includes(service.id)), [services, selectedIds]);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration_minutes, 0);
  const totalPrice = selectedServices.reduce((sum, service) => sum + Number(service.price), 0);

  return { selectedIds, setSelectedIds, selectedServices, totalDuration, totalPrice };
}
