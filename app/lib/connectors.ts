export type ConnectorId =
  | "strategy_ripened"
  | "prospect_rashness"
  | "longevity_fete"
  | "molten_cleanliness"
  | "pea_easel"
  | "throng_quinine";

export type SchemaChangeHandling =
  | "ALLOW_ALL"
  | "ALLOW_COLUMNS"
  | "BLOCK_ALL";

export interface ConnectorState {
  id: ConnectorId;
  paused: boolean;
  sync_frequency: number;
  schema_change_handling: SchemaChangeHandling;
  setup_state: string;
  sync_state: string;
  succeeded_at?: string;
  failed_at?: string;
  service: string;
}

export type BreakAction = "rotate_password" | "allow_schema" | "block_schema";

export interface ConnectorMapping {
  nodeId: string;
  connectorIds: ConnectorId[];
  label: string;
  type: "postgres" | "sheets" | "gcs";
}

export const CONNECTOR_MAP: Record<string, ConnectorMapping> = {
  postgres: {
    nodeId: "postgres",
    connectorIds: ["strategy_ripened"],
    label: "Cloud SQL (Postgres)",
    type: "postgres",
  },
  sheets: {
    nodeId: "sheets",
    connectorIds: [
      "prospect_rashness",
      "longevity_fete",
      "molten_cleanliness",
      "pea_easel",
    ],
    label: "Google Sheets",
    type: "sheets",
  },
  gcs: {
    nodeId: "gcs",
    connectorIds: ["throng_quinine"],
    label: "GCS Bucket",
    type: "gcs",
  },
};

export function getBreakActions(
  type: ConnectorMapping["type"]
): { action: BreakAction; label: string; color: string }[] {
  const schemaActions: { action: BreakAction; label: string; color: string }[] =
    [
      { action: "allow_schema", label: "Allow All Schema Changes", color: "yellow" },
      { action: "block_schema", label: "Block All Schema Changes", color: "orange" },
    ];

  if (type === "postgres") {
    return [
      { action: "rotate_password", label: "Rotate DB Password", color: "red" },
      ...schemaActions,
    ];
  }
  return schemaActions;
}
