interface PillOption {
  value: string;
  label: string;
}

interface PillSelectProps {
  label: string;
  options: PillOption[];
  value: string;
  onChange: (value: string) => void;
  cols?: 2 | 3 | 4 | 5;
}

const colsClass: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

export const PillSelect = ({
  label,
  options,
  value,
  onChange,
  cols,
}: PillSelectProps) => {
  const gridCols = cols
    ? colsClass[cols]
    : options.length <= 3
      ? colsClass[options.length as 2 | 3]
      : options.length === 4
        ? "grid-cols-2"
        : "grid-cols-3";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className={`grid ${gridCols} gap-2`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer border text-center
              ${
                value === option.value
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border bg-background/60 text-muted hover:text-foreground hover:border-muted hover:bg-background/80"
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
