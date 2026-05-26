import Image from "next/image";

type Props = {
  name: string;
  logo?: string | null;
  size?: "sm" | "md";
};

export default function TeamLogo({ name, logo, size = "md" }: Props) {
  const sizeNum = size === "sm" ? 28 : 40;
  const sizeClass = size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm";

  if (logo) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden shrink-0 bg-white`}>
        <Image src={logo} alt={name} width={sizeNum} height={sizeNum} className="object-contain w-full h-full" />
      </div>
    );
  }

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`${sizeClass} rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0`}>
      {initials}
    </div>
  );
}
