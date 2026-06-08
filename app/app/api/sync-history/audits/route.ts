import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import type { AuditChartResponse } from "@/lib/dashboard-types";

function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

function formatWeekLabel(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatMonthLabel(key: string): string {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleDateString(undefined, { month: "short" });
}

export const GET = withAuth(async (session, req: Request) => {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") === "month" ? "month" : "week";

  const now = new Date();
  const since =
    period === "month"
      ? new Date(now.getFullYear(), now.getMonth() - 5, 1)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8 * 7);

  const events = await prisma.syncEvent.findMany({
    where: { userId: session.user.id, startedAt: { gte: since } },
    select: { status: true, startedAt: true },
    orderBy: { startedAt: "asc" },
  });

  const map = new Map<string, { successes: number; total: number }>();

  for (const e of events) {
    const key =
      period === "month"
        ? `${e.startedAt.getFullYear()}-${String(e.startedAt.getMonth() + 1).padStart(2, "0")}`
        : getWeekStart(e.startedAt);
    const entry = map.get(key) ?? { successes: 0, total: 0 };
    entry.total++;
    if (e.status === "success") entry.successes++;
    map.set(key, entry);
  }

  const buckets = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { successes, total }]) => ({
      label: period === "month" ? formatMonthLabel(key) : formatWeekLabel(key),
      rate: total > 0 ? Math.round((successes / total) * 100) : 0,
      total,
    }));

  const result: AuditChartResponse = { buckets };
  return Response.json(result);
});
