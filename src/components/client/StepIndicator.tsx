const labels = ["Servicos", "Data", "Horario", "Dados", "Confirmar"];

export function StepIndicator({ step }: { step: number }) {
  return (
    <div className="grid grid-cols-5 gap-1" aria-label="Etapas do agendamento">
      {labels.map((label, index) => {
        const current = index + 1;
        return (
          <div key={label} className="space-y-1">
            <div className={`h-1.5 rounded-full ${current <= step ? "bg-primary" : "bg-border"}`} />
            <span className="block truncate text-center text-[10px] font-semibold text-muted-foreground">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
