import { type Node, type Edge } from "@xyflow/react";

export const nodes: Node[] = [
  {
    id: "bigquery",
    type: "bigquery",
    position: { x: 400, y: 300 },
    data: { label: "BigQuery" },
  },
  {
    id: "postgres",
    type: "postgres",
    position: { x: 100, y: 80 },
    data: { label: "Cloud SQL (Postgres)", connectorId: "postgres" },
  },
  {
    id: "sheets",
    type: "sheets",
    position: { x: 700, y: 80 },
    data: { label: "Google Sheets", connectorId: "sheets" },
  },
  {
    id: "gcs",
    type: "gcs",
    position: { x: 400, y: 550 },
    data: { label: "GCS Bucket", connectorId: "gcs" },
  },
];

export const edges: Edge[] = [
  {
    id: "postgres-bq",
    source: "postgres",
    target: "bigquery",
    targetHandle: "left",
    type: "shimmer",
  },
  {
    id: "sheets-bq",
    source: "sheets",
    target: "bigquery",
    targetHandle: "top",
    type: "shimmer",
  },
  {
    id: "gcs-bq",
    source: "gcs",
    target: "bigquery",
    targetHandle: "bottom",
    type: "shimmer",
  },
];
