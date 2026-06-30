"use client";

export type DateOption = "yesterday" | "today" | "tomorrow";

type Props = {
  selected: DateOption;
  onChange: (date: DateOption) => void;
};

const options: { value: DateOption; label: string }[] = [
  { value: "yesterday", label: "Ontem" },
  { value: "today", label: "Hoje" },
  { value: "tomorrow", label: "Amanhã" },
];

export default function DateSelector({ selected, onChange }: Props) {
  return (
    <div role="tablist" className="flex gap-2 flex-nowrap shrink-0">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          onClick={() => onChange(option.value)}
          className={`text-[12px] tracking-[0.08em] uppercase font-bold rounded-full px-5 py-2 border-[1.5px] whitespace-nowrap transition-colors cursor-pointer ${
            selected === option.value
              ? "bg-primary text-white border-primary"
              : "bg-white text-base-content/50 border-base-300 hover:border-base-content/30 hover:text-base-content/70"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
