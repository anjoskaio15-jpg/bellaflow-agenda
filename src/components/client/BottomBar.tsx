import { Button } from "@/components/ui/button";

interface BottomBarProps {
  backDisabled?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  onBack?: () => void;
  onNext: () => void;
}

export function BottomBar({ backDisabled, nextLabel = "Continuar", nextDisabled, loading, onBack, onNext }: BottomBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 p-3 safe-bottom backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
      <div className="mx-auto flex max-w-3xl gap-2">
        {onBack ? (
          <Button type="button" variant="outline" className="flex-1" disabled={backDisabled || loading} onClick={onBack}>
            Voltar
          </Button>
        ) : null}
        <Button type="button" className="flex-1" disabled={nextDisabled || loading} onClick={onNext}>
          {loading ? "Salvando..." : nextLabel}
        </Button>
      </div>
    </div>
  );
}
