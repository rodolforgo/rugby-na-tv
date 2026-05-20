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
    <div role="tablist" className="tabs tabs-box w-fit">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          className={`tab ${selected === option.value ? "tab-active" : ""}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
