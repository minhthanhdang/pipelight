import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (session, req: Request) => {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const connectorId = searchParams.get("connectorId");

  const hasDateRange = start && end;
  const gte = hasDateRange ? new Date(start) : null;
  const lte = hasDateRange ? new Date(end) : null;

  let latestAudits: { judgement: string; cnt: number }[];

  if (connectorId && hasDateRange) {
    latestAudits = await prisma.$queryRaw`
      SELECT a.judgement, COUNT(*)::int AS cnt
      FROM sync_audits a
      INNER JOIN (
        SELECT sync_event_id, MAX(created_at) AS max_created
        FROM sync_audits
        WHERE user_id = ${session.user.id}
          AND connector_id = ${connectorId}
          AND created_at >= ${gte}
          AND created_at <= ${lte}
        GROUP BY sync_event_id
      ) latest ON a.sync_event_id = latest.sync_event_id AND a.created_at = latest.max_created
      WHERE a.user_id = ${session.user.id}
      GROUP BY a.judgement
    `;
  } else if (connectorId) {
    latestAudits = await prisma.$queryRaw`
      SELECT a.judgement, COUNT(*)::int AS cnt
      FROM sync_audits a
      INNER JOIN (
        SELECT sync_event_id, MAX(created_at) AS max_created
        FROM sync_audits
        WHERE user_id = ${session.user.id}
          AND connector_id = ${connectorId}
        GROUP BY sync_event_id
      ) latest ON a.sync_event_id = latest.sync_event_id AND a.created_at = latest.max_created
      WHERE a.user_id = ${session.user.id}
      GROUP BY a.judgement
    `;
  } else if (hasDateRange) {
    latestAudits = await prisma.$queryRaw`
      SELECT a.judgement, COUNT(*)::int AS cnt
      FROM sync_audits a
      INNER JOIN (
        SELECT sync_event_id, MAX(created_at) AS max_created
        FROM sync_audits
        WHERE user_id = ${session.user.id}
          AND created_at >= ${gte}
          AND created_at <= ${lte}
        GROUP BY sync_event_id
      ) latest ON a.sync_event_id = latest.sync_event_id AND a.created_at = latest.max_created
      WHERE a.user_id = ${session.user.id}
      GROUP BY a.judgement
    `;
  } else {
    latestAudits = await prisma.$queryRaw`
      SELECT a.judgement, COUNT(*)::int AS cnt
      FROM sync_audits a
      INNER JOIN (
        SELECT sync_event_id, MAX(created_at) AS max_created
        FROM sync_audits
        WHERE user_id = ${session.user.id}
        GROUP BY sync_event_id
      ) latest ON a.sync_event_id = latest.sync_event_id AND a.created_at = latest.max_created
      WHERE a.user_id = ${session.user.id}
      GROUP BY a.judgement
    `;
  }

  let clean = 0;
  let warning = 0;
  let critical = 0;

  for (const g of latestAudits) {
    const count = Number(g.cnt);
    if (g.judgement === "clean") clean = count;
    else if (g.judgement === "warning") warning = count;
    else if (g.judgement === "failure") critical = count;
  }

  return Response.json({
    distribution: { clean, warning, critical, total: clean + warning + critical },
  });
});
