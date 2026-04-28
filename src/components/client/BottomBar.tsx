import { Button } from "@/components/ui/button";

interface BottomBarProps {
  backDisabled?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  summary?: string;
  total?: string;
  onBack?: () => void;
  onNext: () => void;
}

export function BottomBar({ backDisabled, nextLabel = "Continuar", nextDisabled, loading, summary, total, onBack, onNext }: BottomBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 p-3 safe-bottom shadow-[0_-14px_34px_rgba(42,29,31,0.08)] backdrop-blur md:static md:rounded-lg md:border md:bg-card md:p-3">
      <div className="mx-auto max-w-3xl space-y-3">
        {(summary || total) ? (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-muted-foreground">{summary}</span>
            <strong className="shrink-0 text-primary">{total}</strong>
          </div>
        ) : null}
        <div className="flex gap-2">
        {onBack ? (
          <Button type="button" variant="outline" className="h-12 flex-1" disabled={backDisabled || loading} onClick={onBack}>
            Voltar
          </Button>
        ) : null}
        <Button type="button" className="h-12 flex-1 text-base" disabled={nextDisabled || loading} onClick={onNext}>
          {loading ? "Salvando..." : nextLabel}
        </Button>
        </div>
      </div>
    </div>
  );
}
