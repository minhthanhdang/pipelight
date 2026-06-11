import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (session, req: Request) => {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const connectorId = searchParams.get("connectorId");

  if (!connectorId) {
    return Response.json({ error: "connectorId is required" }, { status: 400 });
  }

  const hasDateRange = start && end;
  const gte = hasDateRange ? new Date(start) : null;
  const lte = hasDateRange ? new Date(end) : null;

  let rows: { total_success: number; warning: number; critical: number }[];

  if (hasDateRange) {
    rows = await prisma.$queryRaw`
      SELECT
        COUNT(*)::int AS total_success,
        COUNT(*) FILTER (WHERE la.judgement = 'warning')::int AS warning,
        COUNT(*) FILTER (WHERE la.judgement = 'failure')::int AS critical
      FROM sync_events e
      LEFT JOIN LATERAL (
        SELECT judgement FROM sync_audits a
        WHERE a.sync_event_id = e.id
        ORDER BY a.created_at DESC LIMIT 1
      ) la ON true
      WHERE e.user_id = ${session.user.id}
        AND e.connector_id = ${connectorId}
        AND e.status = 'success'
        AND e.started_at >= ${gte}
        AND e.started_at <= ${lte}
    `;
  } else {
    rows = await prisma.$queryRaw`
      SELECT
        COUNT(*)::int AS total_success,
        COUNT(*) FILTER (WHERE la.judgement = 'warning')::int AS warning,
        COUNT(*) FILTER (WHERE la.judgement = 'failure')::int AS critical
      FROM sync_events e
      LEFT JOIN LATERAL (
        SELECT judgement FROM sync_audits a
        WHERE a.sync_event_id = e.id
        ORDER BY a.created_at DESC LIMIT 1
      ) la ON true
      WHERE e.user_id = ${session.user.id}
        AND e.connector_id = ${connectorId}
        AND e.status = 'success'
    `;
  }

  const row = rows[0];

  return Response.json({
    falsePositives: {
      totalSuccess: Number(row?.total_success ?? 0),
      warning: Number(row?.warning ?? 0),
      critical: Number(row?.critical ?? 0),
    },
  });
});
