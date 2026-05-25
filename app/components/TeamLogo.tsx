type Props = {
  logo: string | null;
  name: string;
  size?: "sm" | "md";
};

export default function TeamLogo({ logo, name, size = "md" }: Props) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClass = size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm";

  if (logo) {
    return <img src={logo} alt={name} referrerPolicy="no-referrer" className={`${sizeClass} object-contain`} />;
  }

  return (
    <div className={`${sizeClass} rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0`}>
      {initials}
    </div>
  );
}
