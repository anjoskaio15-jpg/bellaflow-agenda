import { useEffect, useState } from "react";
import { getBusinessBySlug } from "@/services/businessService";
import type { Business } from "@/types/business";

export function useBusiness(slug?: string) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getBusinessBySlug(slug)
      .then(setBusiness)
      .catch((err: Error) => setError(err))
      .finally(() => setLoading(false));
  }, [slug]);

  return { business, loading, error };
}
