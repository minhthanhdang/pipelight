import { type Node, type Edge } from "@xyflow/react";

export const nodes: Node[] = [
  {
    id: "bigquery",
    type: "bigquery",
    position: { x: 300, y: 220 },
    data: { label: "BigQuery" },
  },
  {
    id: "postgres",
    type: "postgres",
    position: { x: 100, y: 100 },
    data: { label: "Cloud SQL (Postgres)", connectorId: "postgres" },
  },
  {
    id: "sheets",
    type: "sheets",
    position: { x: 500, y: 60 },
    data: { label: "Google Sheets", connectorId: "sheets" },
  },
  {
    id: "gcs",
    type: "gcs",
    position: { x: 300, y: 400 },
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
