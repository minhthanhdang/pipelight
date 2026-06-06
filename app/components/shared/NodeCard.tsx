"use client";

interface NodeCardProps {
  glowClass?: string;
  selected?: boolean;
  size?: "default" | "large";
  children: React.ReactNode;
}

export default function NodeCard({
  glowClass,
  selected = false,
  size = "default",
  children,
}: NodeCardProps) {
  return (
    <div
      className={`rounded-xl bg-node-card shadow-md text-center transition-shadow ${glowClass ?? ""} ${
        selected ? "ring-2 ring-blue-400/60" : ""
      } ${size === "large" ? "p-5 shadow-lg" : "p-4"}`}
    >
      {children}
    </div>
  );
}
