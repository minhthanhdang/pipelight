"use client";

interface NodeCardProps {
  borderColor: string;
  size?: "default" | "large";
  children: React.ReactNode;
}

export default function NodeCard({
  borderColor,
  size = "default",
  children,
}: NodeCardProps) {
  return (
    <div
      className={`rounded-xl border-2 bg-white shadow-md text-center ${borderColor} ${
        size === "large" ? "px-8 py-6 shadow-lg min-w-[200px]" : "px-6 py-4 min-w-[180px]"
      }`}
    >
      {children}
    </div>
  );
}
