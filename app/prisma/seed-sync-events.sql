-- Seed script: backfill sync_events + sync_audits for demo
-- Target range: May 1-23, 2026 (before earliest existing event 2026-05-24 14:10:01)
-- User: cmq3nswvu000055q8a7vaeulz (t1@gmail.com)

BEGIN;

-- ============================================================
-- SYNC EVENTS
-- ============================================================

-- === strategy_ripened (google_cloud_postgresql) ===
-- connector_id: cmq5ab60a000a3zq8igpi81sq

INSERT INTO sync_events (id, connector_id, fivetran_id, status, audit_status, started_at, completed_at, rows_synced, sync_type, error_message, user_id, created_at) VALUES
('seed_pg_001', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'success', 'done', '2026-05-01 08:00:00', '2026-05-01 08:03:12', 245000, 'historical', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 08:00:00'),
('seed_pg_002', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'success', 'done', '2026-05-02 09:15:00', '2026-05-02 09:16:45', 12300, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-02 09:15:00'),
('seed_pg_003', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'failure', 'done', '2026-05-03 10:00:00', '2026-05-03 10:00:32', NULL, 'incremental', 'Connection refused: could not connect to server at "patient-records-pg": Connection timed out', 'cmq3nswvu000055q8a7vaeulz', '2026-05-03 10:00:00'),
('seed_pg_004', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'success', 'done', '2026-05-04 08:30:00', '2026-05-04 08:32:18', 8700, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-04 08:30:00'),
('seed_pg_005', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'success', 'done', '2026-05-06 08:00:00', '2026-05-06 08:01:55', 5400, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-06 08:00:00'),
('seed_pg_006', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'success', 'done', '2026-05-08 09:00:00', '2026-05-08 09:02:10', 15200, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-08 09:00:00'),
('seed_pg_007', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'failure', 'done', '2026-05-10 08:15:00', '2026-05-10 08:15:28', NULL, 'incremental', 'FATAL: password authentication failed for user "fivetran_user"', 'cmq3nswvu000055q8a7vaeulz', '2026-05-10 08:15:00'),
('seed_pg_008', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'failure', 'done', '2026-05-10 14:00:00', '2026-05-10 14:00:35', NULL, 'incremental', 'FATAL: password authentication failed for user "fivetran_user"', 'cmq3nswvu000055q8a7vaeulz', '2026-05-10 14:00:00'),
('seed_pg_009', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'success', 'done', '2026-05-11 10:00:00', '2026-05-11 10:02:40', 22100, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-11 10:00:00'),
('seed_pg_010', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'success', 'done', '2026-05-13 08:00:00', '2026-05-13 08:01:30', 3200, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-13 08:00:00'),
('seed_pg_011', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'success', 'done', '2026-05-15 09:30:00', '2026-05-15 09:33:15', 41000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-15 09:30:00'),
('seed_pg_012', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'success', 'done', '2026-05-17 08:00:00', '2026-05-17 08:01:22', 6800, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-17 08:00:00'),
('seed_pg_013', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'success', 'done', '2026-05-19 08:45:00', '2026-05-19 08:47:50', 18900, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-19 08:45:00'),
('seed_pg_014', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'success', 'none', '2026-05-21 09:00:00', '2026-05-21 09:02:05', 9100, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-21 09:00:00'),
('seed_pg_015', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'success', 'done', '2026-05-23 08:00:00', '2026-05-23 08:04:20', 52000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-23 08:00:00');

-- === pea_easel (google_sheets) ===
-- connector_id: cmq5ab5z000043zq86r18v8xf

INSERT INTO sync_events (id, connector_id, fivetran_id, status, audit_status, started_at, completed_at, rows_synced, sync_type, error_message, user_id, created_at) VALUES
('seed_gs1_001', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'success', 'done', '2026-05-01 10:00:00', '2026-05-01 10:01:05', 1200, 'historical', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 10:00:00'),
('seed_gs1_002', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'success', 'done', '2026-05-02 10:00:00', '2026-05-02 10:00:45', 850, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-02 10:00:00'),
('seed_gs1_003', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'success', 'done', '2026-05-04 10:15:00', '2026-05-04 10:15:38', 920, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-04 10:15:00'),
('seed_gs1_004', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'failure', 'done', '2026-05-06 10:00:00', '2026-05-06 10:00:18', NULL, 'incremental', 'Google Sheets API error: Sheet "Q4 Medications" not found in spreadsheet', 'cmq3nswvu000055q8a7vaeulz', '2026-05-06 10:00:00'),
('seed_gs1_005', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'success', 'done', '2026-05-07 10:00:00', '2026-05-07 10:00:52', 1100, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-07 10:00:00'),
('seed_gs1_006', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'success', 'done', '2026-05-09 10:30:00', '2026-05-09 10:31:10', 2300, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-09 10:30:00'),
('seed_gs1_007', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'success', 'done', '2026-05-11 10:00:00', '2026-05-11 10:00:40', 780, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-11 10:00:00'),
('seed_gs1_008', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'success', 'none', '2026-05-13 10:00:00', '2026-05-13 10:00:55', 1050, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-13 10:00:00'),
('seed_gs1_009', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'success', 'done', '2026-05-15 10:15:00', '2026-05-15 10:15:42', 990, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-15 10:15:00'),
('seed_gs1_010', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'success', 'done', '2026-05-17 10:00:00', '2026-05-17 10:01:15', 1400, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-17 10:00:00'),
('seed_gs1_011', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'success', 'done', '2026-05-19 10:00:00', '2026-05-19 10:00:48', 870, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-19 10:00:00'),
('seed_gs1_012', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'success', 'done', '2026-05-21 10:30:00', '2026-05-21 10:31:05', 1600, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-21 10:30:00'),
('seed_gs1_013', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'success', 'done', '2026-05-23 10:00:00', '2026-05-23 10:00:50', 1250, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-23 10:00:00');

-- === prospect_rashness (google_sheets) ===
-- connector_id: cmq5ab5z200063zq852s5x4a5

INSERT INTO sync_events (id, connector_id, fivetran_id, status, audit_status, started_at, completed_at, rows_synced, sync_type, error_message, user_id, created_at) VALUES
('seed_gs2_001', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'success', 'done', '2026-05-01 11:00:00', '2026-05-01 11:01:20', 3400, 'historical', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 11:00:00'),
('seed_gs2_002', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'success', 'done', '2026-05-03 11:00:00', '2026-05-03 11:00:38', 1200, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-03 11:00:00'),
('seed_gs2_003', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'success', 'done', '2026-05-05 11:15:00', '2026-05-05 11:15:55', 980, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-05 11:15:00'),
('seed_gs2_004', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'failure', 'done', '2026-05-07 11:00:00', '2026-05-07 11:00:12', NULL, 'incremental', 'Permission denied: service account lacks viewer access to spreadsheet', 'cmq3nswvu000055q8a7vaeulz', '2026-05-07 11:00:00'),
('seed_gs2_005', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'success', 'done', '2026-05-09 11:00:00', '2026-05-09 11:01:10', 1500, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-09 11:00:00'),
('seed_gs2_006', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'success', 'done', '2026-05-11 11:30:00', '2026-05-11 11:31:02', 2100, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-11 11:30:00'),
('seed_gs2_007', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'success', 'done', '2026-05-13 11:00:00', '2026-05-13 11:00:42', 890, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-13 11:00:00'),
('seed_gs2_008', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'success', 'done', '2026-05-15 11:00:00', '2026-05-15 11:01:15', 1750, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-15 11:00:00'),
('seed_gs2_009', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'success', 'done', '2026-05-17 11:15:00', '2026-05-17 11:15:50', 1100, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-17 11:15:00'),
('seed_gs2_010', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'success', 'done', '2026-05-19 11:00:00', '2026-05-19 11:00:55', 1350, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-19 11:00:00'),
('seed_gs2_011', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'success', 'done', '2026-05-21 11:00:00', '2026-05-21 11:01:08', 1600, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-21 11:00:00'),
('seed_gs2_012', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'success', 'none', '2026-05-23 11:00:00', '2026-05-23 11:00:40', 920, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-23 11:00:00');

-- === longevity_fete (google_sheets) ===
-- connector_id: cmq5ab5yz00023zq8lz1xsyb9

INSERT INTO sync_events (id, connector_id, fivetran_id, status, audit_status, started_at, completed_at, rows_synced, sync_type, error_message, user_id, created_at) VALUES
('seed_gs3_001', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'success', 'done', '2026-05-01 12:00:00', '2026-05-01 12:01:30', 2800, 'historical', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 12:00:00'),
('seed_gs3_002', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'success', 'done', '2026-05-03 12:00:00', '2026-05-03 12:00:48', 1100, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-03 12:00:00'),
('seed_gs3_003', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'success', 'done', '2026-05-05 12:30:00', '2026-05-05 12:30:42', 750, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-05 12:30:00'),
('seed_gs3_004', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'success', 'done', '2026-05-07 12:00:00', '2026-05-07 12:00:55', 1300, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-07 12:00:00'),
('seed_gs3_005', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'success', 'done', '2026-05-09 12:00:00', '2026-05-09 12:01:10', 1800, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-09 12:00:00'),
('seed_gs3_006', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'failure', 'done', '2026-05-11 12:15:00', '2026-05-11 12:15:08', NULL, 'incremental', 'Google Sheets API error: empty sheet "Q2 Medications" contains no data rows', 'cmq3nswvu000055q8a7vaeulz', '2026-05-11 12:15:00'),
('seed_gs3_007', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'success', 'done', '2026-05-13 12:00:00', '2026-05-13 12:00:45', 950, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-13 12:00:00'),
('seed_gs3_008', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'success', 'done', '2026-05-15 12:00:00', '2026-05-15 12:01:20', 2100, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-15 12:00:00'),
('seed_gs3_009', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'success', 'done', '2026-05-17 12:30:00', '2026-05-17 12:31:05', 1400, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-17 12:30:00'),
('seed_gs3_010', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'success', 'done', '2026-05-19 12:00:00', '2026-05-19 12:00:50', 1050, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-19 12:00:00'),
('seed_gs3_011', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'success', 'done', '2026-05-21 12:00:00', '2026-05-21 12:01:15', 1700, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-21 12:00:00'),
('seed_gs3_012', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'success', 'done', '2026-05-23 12:00:00', '2026-05-23 12:00:38', 880, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-23 12:00:00');

-- === molten_cleanliness (google_sheets) ===
-- connector_id: cmq5ab5yn00003zq81x49ygn1

INSERT INTO sync_events (id, connector_id, fivetran_id, status, audit_status, started_at, completed_at, rows_synced, sync_type, error_message, user_id, created_at) VALUES
('seed_gs4_001', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'success', 'done', '2026-05-01 13:00:00', '2026-05-01 13:01:45', 3100, 'historical', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 13:00:00'),
('seed_gs4_002', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'success', 'done', '2026-05-03 13:00:00', '2026-05-03 13:00:52', 1050, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-03 13:00:00'),
('seed_gs4_003', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'success', 'done', '2026-05-05 13:15:00', '2026-05-05 13:15:40', 880, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-05 13:15:00'),
('seed_gs4_004', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'success', 'done', '2026-05-07 13:00:00', '2026-05-07 13:01:05', 1400, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-07 13:00:00'),
('seed_gs4_005', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'success', 'done', '2026-05-09 13:00:00', '2026-05-09 13:00:48', 960, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-09 13:00:00'),
('seed_gs4_006', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'success', 'done', '2026-05-11 13:30:00', '2026-05-11 13:31:15', 2200, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-11 13:30:00'),
('seed_gs4_007', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'failure', 'done', '2026-05-13 13:00:00', '2026-05-13 13:00:15', NULL, 'incremental', 'Column type mismatch: expected INTEGER for "dosage_mg" but found TEXT in row 145', 'cmq3nswvu000055q8a7vaeulz', '2026-05-13 13:00:00'),
('seed_gs4_008', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'success', 'done', '2026-05-15 13:00:00', '2026-05-15 13:00:55', 1150, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-15 13:00:00'),
('seed_gs4_009', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'success', 'done', '2026-05-17 13:15:00', '2026-05-17 13:15:48', 1300, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-17 13:15:00'),
('seed_gs4_010', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'success', 'done', '2026-05-19 13:00:00', '2026-05-19 13:00:42', 790, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-19 13:00:00'),
('seed_gs4_011', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'success', 'none', '2026-05-21 13:00:00', '2026-05-21 13:01:10', 1500, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-21 13:00:00'),
('seed_gs4_012', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'success', 'done', '2026-05-23 13:00:00', '2026-05-23 13:00:35', 1050, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-23 13:00:00');

-- === stubborn_dividers (gcs) ===
-- connector_id: cmq81gml400058tq8320n7jai

INSERT INTO sync_events (id, connector_id, fivetran_id, status, audit_status, started_at, completed_at, rows_synced, sync_type, error_message, user_id, created_at) VALUES
('seed_gcs_001', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'success', 'done', '2026-05-01 14:00:00', '2026-05-01 14:04:30', 185000, 'historical', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 14:00:00'),
('seed_gcs_002', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'success', 'done', '2026-05-03 14:00:00', '2026-05-03 14:02:15', 42000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-03 14:00:00'),
('seed_gcs_003', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'failure', 'done', '2026-05-05 14:00:00', '2026-05-05 14:00:22', NULL, 'incremental', 'GCS error: bucket "fivetran-496601-lab-results" access denied - service account missing storage.objects.list permission', 'cmq3nswvu000055q8a7vaeulz', '2026-05-05 14:00:00'),
('seed_gcs_004', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'success', 'done', '2026-05-07 14:15:00', '2026-05-07 14:16:50', 38000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-07 14:15:00'),
('seed_gcs_005', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'success', 'done', '2026-05-09 14:00:00', '2026-05-09 14:02:05', 51000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-09 14:00:00'),
('seed_gcs_006', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'success', 'done', '2026-05-11 14:00:00', '2026-05-11 14:01:40', 29000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-11 14:00:00'),
('seed_gcs_007', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'success', 'done', '2026-05-13 14:30:00', '2026-05-13 14:32:10', 67000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-13 14:30:00'),
('seed_gcs_008', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'success', 'done', '2026-05-15 14:00:00', '2026-05-15 14:01:55', 44000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-15 14:00:00'),
('seed_gcs_009', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'failure', 'done', '2026-05-17 14:00:00', '2026-05-17 14:00:18', NULL, 'incremental', 'File not found: expected file "lab_results_2026_05_17.csv" not present in bucket path /incoming/', 'cmq3nswvu000055q8a7vaeulz', '2026-05-17 14:00:00'),
('seed_gcs_010', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'success', 'done', '2026-05-19 14:00:00', '2026-05-19 14:02:30', 55000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-19 14:00:00'),
('seed_gcs_011', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'success', 'done', '2026-05-21 14:15:00', '2026-05-21 14:16:45', 36000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-21 14:15:00'),
('seed_gcs_012', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'success', 'done', '2026-05-23 14:00:00', '2026-05-23 14:03:10', 72000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-23 14:00:00');

-- === heading_sailor (fivetran_log) ===
-- connector_id: cmq81gmkr00008tq8sk0zjje7

INSERT INTO sync_events (id, connector_id, fivetran_id, status, audit_status, started_at, completed_at, rows_synced, sync_type, error_message, user_id, created_at) VALUES
('seed_fl_001', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'success', 'done', '2026-05-01 06:00:00', '2026-05-01 06:01:10', 8500, 'historical', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 06:00:00'),
('seed_fl_002', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'success', 'done', '2026-05-02 06:00:00', '2026-05-02 06:00:45', 3200, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-02 06:00:00'),
('seed_fl_003', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'success', 'done', '2026-05-04 06:00:00', '2026-05-04 06:00:38', 2800, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-04 06:00:00'),
('seed_fl_004', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'success', 'done', '2026-05-06 06:15:00', '2026-05-06 06:15:52', 4100, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-06 06:15:00'),
('seed_fl_005', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'success', 'done', '2026-05-08 06:00:00', '2026-05-08 06:00:40', 2500, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-08 06:00:00'),
('seed_fl_006', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'failure', 'done', '2026-05-10 06:00:00', '2026-05-10 06:00:15', NULL, 'incremental', 'Internal error: log ingestion pipeline temporarily unavailable', 'cmq3nswvu000055q8a7vaeulz', '2026-05-10 06:00:00'),
('seed_fl_007', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'success', 'done', '2026-05-12 06:00:00', '2026-05-12 06:01:05', 5600, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-12 06:00:00'),
('seed_fl_008', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'success', 'done', '2026-05-14 06:00:00', '2026-05-14 06:00:48', 3100, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-14 06:00:00'),
('seed_fl_009', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'success', 'none', '2026-05-16 06:30:00', '2026-05-16 06:31:10', 4800, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-16 06:30:00'),
('seed_fl_010', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'success', 'done', '2026-05-18 06:00:00', '2026-05-18 06:00:55', 3400, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-18 06:00:00'),
('seed_fl_011', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'success', 'done', '2026-05-20 06:00:00', '2026-05-20 06:00:42', 2900, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-20 06:00:00'),
('seed_fl_012', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'success', 'done', '2026-05-22 06:15:00', '2026-05-22 06:16:00', 3700, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-22 06:15:00');

-- === carried_leaven (stripe_test) ===
-- connector_id: cmq81gmsy00078tq8n5mtza78

INSERT INTO sync_events (id, connector_id, fivetran_id, status, audit_status, started_at, completed_at, rows_synced, sync_type, error_message, user_id, created_at) VALUES
('seed_st_001', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'success', 'done', '2026-05-01 15:00:00', '2026-05-01 15:03:20', 125000, 'historical', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 15:00:00'),
('seed_st_002', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'success', 'done', '2026-05-03 15:00:00', '2026-05-03 15:01:45', 18000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-03 15:00:00'),
('seed_st_003', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'failure', 'done', '2026-05-05 15:00:00', '2026-05-05 15:00:08', NULL, 'incremental', 'Stripe API error 429: rate limit exceeded, retry after 60s', 'cmq3nswvu000055q8a7vaeulz', '2026-05-05 15:00:00'),
('seed_st_004', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'success', 'done', '2026-05-07 15:15:00', '2026-05-07 15:17:00', 22000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-07 15:15:00'),
('seed_st_005', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'success', 'done', '2026-05-09 15:00:00', '2026-05-09 15:01:30', 15000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-09 15:00:00'),
('seed_st_006', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'success', 'done', '2026-05-11 15:00:00', '2026-05-11 15:02:10', 31000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-11 15:00:00'),
('seed_st_007', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'failure', 'done', '2026-05-13 15:00:00', '2026-05-13 15:00:12', NULL, 'incremental', 'Authentication failed: API key "sk_test_...4xR2" has been revoked', 'cmq3nswvu000055q8a7vaeulz', '2026-05-13 15:00:00'),
('seed_st_008', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'success', 'done', '2026-05-15 15:30:00', '2026-05-15 15:32:00', 27000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-15 15:30:00'),
('seed_st_009', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'success', 'done', '2026-05-17 15:00:00', '2026-05-17 15:01:45', 19000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-17 15:00:00'),
('seed_st_010', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'success', 'done', '2026-05-19 15:00:00', '2026-05-19 15:02:20', 34000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-19 15:00:00'),
('seed_st_011', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'success', 'done', '2026-05-21 15:00:00', '2026-05-21 15:01:55', 21000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-21 15:00:00'),
('seed_st_012', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'success', 'none', '2026-05-23 15:00:00', '2026-05-23 15:01:30', 16000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-23 15:00:00');

-- === averaging_summer (hubspot) ===
-- connector_id: cmq81gn0000088tq84jm559yl

INSERT INTO sync_events (id, connector_id, fivetran_id, status, audit_status, started_at, completed_at, rows_synced, sync_type, error_message, user_id, created_at) VALUES
('seed_hs_001', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'success', 'done', '2026-05-01 16:00:00', '2026-05-01 16:04:50', 320000, 'historical', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 16:00:00'),
('seed_hs_002', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'success', 'done', '2026-05-02 16:00:00', '2026-05-02 16:02:15', 45000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-02 16:00:00'),
('seed_hs_003', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'success', 'done', '2026-05-04 16:00:00', '2026-05-04 16:01:40', 28000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-04 16:00:00'),
('seed_hs_004', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'failure', 'done', '2026-05-06 16:15:00', '2026-05-06 16:15:10', NULL, 'incremental', 'HubSpot API error 401: OAuth token expired, re-authentication required', 'cmq3nswvu000055q8a7vaeulz', '2026-05-06 16:15:00'),
('seed_hs_005', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'failure', 'done', '2026-05-07 08:00:00', '2026-05-07 08:00:08', NULL, 'incremental', 'HubSpot API error 401: OAuth token expired, re-authentication required', 'cmq3nswvu000055q8a7vaeulz', '2026-05-07 08:00:00'),
('seed_hs_006', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'success', 'done', '2026-05-08 16:00:00', '2026-05-08 16:02:30', 52000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-08 16:00:00'),
('seed_hs_007', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'success', 'done', '2026-05-10 16:00:00', '2026-05-10 16:01:55', 31000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-10 16:00:00'),
('seed_hs_008', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'success', 'done', '2026-05-12 16:30:00', '2026-05-12 16:33:00', 78000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-12 16:30:00'),
('seed_hs_009', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'success', 'done', '2026-05-14 16:00:00', '2026-05-14 16:01:45', 25000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-14 16:00:00'),
('seed_hs_010', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'success', 'done', '2026-05-16 16:00:00', '2026-05-16 16:02:20', 41000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-16 16:00:00'),
('seed_hs_011', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'success', 'done', '2026-05-18 16:15:00', '2026-05-18 16:17:30', 63000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-18 16:15:00'),
('seed_hs_012', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'success', 'done', '2026-05-20 16:00:00', '2026-05-20 16:01:50', 29000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-20 16:00:00'),
('seed_hs_013', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'success', 'done', '2026-05-22 16:00:00', '2026-05-22 16:02:40', 47000, 'incremental', NULL, 'cmq3nswvu000055q8a7vaeulz', '2026-05-22 16:00:00');


-- ============================================================
-- SYNC AUDITS
-- ============================================================

-- === strategy_ripened (postgres) audits ===

-- seed_pg_001: clean (historical sync)
INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_pg_001', 'seed_pg_001', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'clean', 'Initial historical sync completed successfully', 'Full historical sync of patient_records database completed. All 245,000 rows extracted and loaded. Schema validated against source — all columns present and types match.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 08:03:20');

-- seed_pg_002: clean
INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_pg_002', 'seed_pg_002', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'clean', 'Incremental sync successful, schema stable', 'Synced 12,300 new/modified rows from patient_records. No schema changes detected. Row counts consistent with expected daily volume.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-02 09:16:50');

-- seed_pg_003: failure (connection timeout)
INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_pg_003', 'seed_pg_003', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'failure', 'Connection to Cloud SQL instance timed out', 'The Fivetran connector could not establish a TCP connection to the Cloud SQL Postgres instance. This may indicate a network configuration change, firewall rule update, or the instance being temporarily unavailable.', '[{"action":"Check Cloud SQL instance status in GCP console","toolName":"none","params":{}},{"action":"Verify Fivetran IP addresses are allowlisted in Cloud SQL","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-03 10:00:40');

-- seed_pg_004: clean
INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_pg_004', 'seed_pg_004', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'clean', 'Sync recovered, data consistent', 'Incremental sync resumed after prior connection timeout. 8,700 rows synced including backlog from missed sync window. No data gaps detected.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-04 08:32:25');

-- seed_pg_005: clean
INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_pg_005', 'seed_pg_005', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'clean', 'Sync successful, schema stable', 'Normal incremental sync. 5,400 rows synced. All columns present, no type changes detected.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-06 08:02:00');

-- seed_pg_006: warning (NULL spike)
INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_pg_006', 'seed_pg_006', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'warning', 'NULL spike detected in diagnoses.primary_diagnosis column', 'Sync completed but 34% of new rows in the diagnoses table have NULL values in the primary_diagnosis column, up from a baseline of 2%. This may indicate a schema change at the source or an application-level data quality issue.', '[{"action":"Query source database to check if column was renamed or deprecated","toolName":"none","params":{}},{"action":"Review recent DDL changes on patient-records-pg","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-08 09:02:18');

-- seed_pg_007: failure (auth)
INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_pg_007', 'seed_pg_007', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'failure', 'Password authentication failed for fivetran_user', 'The Postgres password for the Fivetran service account was changed or rotated without updating the connector configuration. Fivetran will retry with exponential backoff but will continue failing until credentials are updated.', '[{"action":"Update connector credentials with new password","toolName":"fivetran_write","params":{"action":"update_connector","connector_id":"strategy_ripened"}},{"action":"Trigger a manual sync after credential update","toolName":"fivetran_write","params":{"action":"sync_connector","connector_id":"strategy_ripened"}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-10 08:15:35');

-- seed_pg_008: failure (auth retry)
INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_pg_008', 'seed_pg_008', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'failure', 'Password authentication still failing — credentials not yet updated', 'Second consecutive auth failure. The connector credentials have not been updated since the initial failure 6 hours ago. Data pipeline is stalled.', '[{"action":"Update connector credentials immediately","toolName":"fivetran_write","params":{"action":"update_connector","connector_id":"strategy_ripened"}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-10 14:00:42');

-- seed_pg_009: warning (schema drift)
INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_pg_009', 'seed_pg_009', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'warning', 'Column rename detected: primary_diagnosis → dx_primary', 'Sync succeeded but the column diagnoses.primary_diagnosis appears to have been renamed to dx_primary at the source. With BLOCK_ALL schema change handling, the new column is excluded from sync. Downstream queries referencing primary_diagnosis will return NULLs for new records.', '[{"action":"Update schema configuration to include dx_primary column","toolName":"fivetran_write","params":{"action":"modify_schema","connector_id":"strategy_ripened"}},{"action":"Consider updating downstream queries to reference new column name","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-11 10:02:48');

-- seed_pg_010: clean
INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_pg_010', 'seed_pg_010', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'clean', 'Sync successful, no new schema changes', 'Incremental sync of 3,200 rows. Note: dx_primary column still excluded due to BLOCK_ALL policy. No additional schema drift detected.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-13 08:01:38');

-- seed_pg_011: clean
INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_pg_011', 'seed_pg_011', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'clean', 'Sync successful, data volumes normal', 'Synced 41,000 rows — higher volume likely due to a batch insert at the source. All data validated.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-15 09:33:22');

-- seed_pg_012: clean
INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_pg_012', 'seed_pg_012', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'clean', 'Sync successful, schema stable', 'Normal incremental sync. 6,800 rows. No anomalies.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-17 08:01:28');

-- seed_pg_013: clean
INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_pg_013', 'seed_pg_013', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'clean', 'Sync successful', 'Incremental sync of 18,900 rows completed without issues.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-19 08:47:58');

-- seed_pg_014: no audit (audit_status = none)

-- seed_pg_015: clean
INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_pg_015', 'seed_pg_015', 'cmq5ab60a000a3zq8igpi81sq', 'strategy_ripened', 'clean', 'Sync successful, large batch processed', 'Synced 52,000 rows in 4m20s. Performance within expected range for this volume.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-23 08:04:28');


-- === pea_easel (sheets Q4) audits ===

INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_gs1_001', 'seed_gs1_001', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'clean', 'Historical sync of Q4 medications sheet completed', 'All 1,200 rows from the Q4 Medications spreadsheet loaded. Column types validated against expected schema.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 10:01:12'),
('seed_aud_gs1_002', 'seed_gs1_002', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'clean', 'Sync successful', 'Incremental sync completed. 850 rows synced. Data consistent.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-02 10:00:52'),
('seed_aud_gs1_003', 'seed_gs1_003', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'clean', 'Sync successful', 'Incremental sync of 920 rows. No changes to sheet structure.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-04 10:15:45'),
('seed_aud_gs1_004', 'seed_gs1_004', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'failure', 'Sheet renamed or deleted in Google Sheets', 'The target sheet "Q4 Medications" was not found in the spreadsheet. This typically happens when a sheet tab is renamed. The connector cannot sync until the sheet name is corrected in the source or the connector is reconfigured.', '[{"action":"Check if the sheet was renamed in Google Sheets","toolName":"none","params":{}},{"action":"Update connector schema config with correct sheet name","toolName":"fivetran_write","params":{"action":"modify_schema","connector_id":"pea_easel"}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-06 10:00:25'),
('seed_aud_gs1_005', 'seed_gs1_005', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'clean', 'Sync recovered after sheet name corrected', 'Sheet reference resolved. 1,100 rows synced including backlog. Data integrity verified.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-07 10:01:00'),
('seed_aud_gs1_006', 'seed_gs1_006', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'clean', 'Sync successful', 'Normal sync of 2,300 rows. Higher volume likely from a batch update to the spreadsheet.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-09 10:31:18'),
('seed_aud_gs1_007', 'seed_gs1_007', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'warning', 'Column type mismatch detected in "unit_price"', 'Sync completed but the unit_price column contains text values ("N/A", "TBD") in 12 rows that were expected to be numeric. These values were loaded as-is but may cause downstream aggregation failures.', '[{"action":"Review source spreadsheet for data entry errors in unit_price column","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-11 10:00:48');

-- seed_gs1_008: no audit (audit_status = none)

INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_gs1_009', 'seed_gs1_009', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'clean', 'Sync successful', 'Incremental sync of 990 rows. No anomalies.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-15 10:15:50'),
('seed_aud_gs1_010', 'seed_gs1_010', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'clean', 'Sync successful', 'Synced 1,400 rows. Data consistent with expected volume.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-17 10:01:22'),
('seed_aud_gs1_011', 'seed_gs1_011', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'clean', 'Sync successful', 'Normal incremental sync. 870 rows processed.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-19 10:00:55'),
('seed_aud_gs1_012', 'seed_gs1_012', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'clean', 'Sync successful', 'Synced 1,600 rows. Schema stable.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-21 10:31:12'),
('seed_aud_gs1_013', 'seed_gs1_013', 'cmq5ab5z000043zq86r18v8xf', 'pea_easel', 'clean', 'Sync successful', 'Incremental sync of 1,250 rows. No issues detected.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-23 10:00:58');


-- === prospect_rashness (sheets Q1) audits ===

INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_gs2_001', 'seed_gs2_001', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'clean', 'Historical sync completed', 'Full sync of Q1 medications sheet. 3,400 rows loaded successfully.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 11:01:28'),
('seed_aud_gs2_002', 'seed_gs2_002', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'clean', 'Sync successful', 'Incremental sync of 1,200 rows. Data consistent.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-03 11:00:45'),
('seed_aud_gs2_003', 'seed_gs2_003', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'clean', 'Sync successful', 'Synced 980 rows. No schema changes.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-05 11:16:02'),
('seed_aud_gs2_004', 'seed_gs2_004', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'failure', 'Service account lacks viewer access to spreadsheet', 'Permission was revoked or the spreadsheet was moved to a different Google Drive folder. The Fivetran service account needs re-authorization.', '[{"action":"Re-share the spreadsheet with the Fivetran service account","toolName":"none","params":{}},{"action":"Verify sharing settings in Google Drive","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-07 11:00:20'),
('seed_aud_gs2_005', 'seed_gs2_005', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'clean', 'Sync recovered after permission fix', 'Access restored. 1,500 rows synced including backlog. No data loss detected.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-09 11:01:18'),
('seed_aud_gs2_006', 'seed_gs2_006', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'clean', 'Sync successful', 'Synced 2,100 rows. Normal operation.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-11 11:31:10'),
('seed_aud_gs2_007', 'seed_gs2_007', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'warning', 'Empty rows detected in source sheet', 'Sync completed but 45 empty rows were detected in the middle of the spreadsheet, suggesting deleted data. These rows were synced as NULLs which may affect row counts in downstream reports.', '[{"action":"Review source spreadsheet for accidental row deletions","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-13 11:00:50'),
('seed_aud_gs2_008', 'seed_gs2_008', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'clean', 'Sync successful', 'Synced 1,750 rows. Data validated.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-15 11:01:22'),
('seed_aud_gs2_009', 'seed_gs2_009', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'clean', 'Sync successful', 'Normal sync of 1,100 rows.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-17 11:15:58'),
('seed_aud_gs2_010', 'seed_gs2_010', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'clean', 'Sync successful', 'Synced 1,350 rows. No issues.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-19 11:01:02'),
('seed_aud_gs2_011', 'seed_gs2_011', 'cmq5ab5z200063zq852s5x4a5', 'prospect_rashness', 'clean', 'Sync successful', 'Incremental sync of 1,600 rows. Schema stable.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-21 11:01:15');

-- seed_gs2_012: no audit (audit_status = none)


-- === longevity_fete (sheets Q2) audits ===

INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_gs3_001', 'seed_gs3_001', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'clean', 'Historical sync completed', 'Full sync of Q2 medications sheet. 2,800 rows loaded. Schema validated.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 12:01:38'),
('seed_aud_gs3_002', 'seed_gs3_002', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'clean', 'Sync successful', 'Synced 1,100 rows. Normal operation.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-03 12:00:55'),
('seed_aud_gs3_003', 'seed_gs3_003', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'clean', 'Sync successful', 'Incremental sync of 750 rows. No anomalies.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-05 12:30:50'),
('seed_aud_gs3_004', 'seed_gs3_004', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'clean', 'Sync successful', 'Synced 1,300 rows. Schema stable.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-07 12:01:02'),
('seed_aud_gs3_005', 'seed_gs3_005', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'warning', 'Duplicate medication entries detected', 'Sync completed but 23 rows appear to be exact duplicates based on medication_name + date + patient_id. This may indicate a copy-paste error in the source spreadsheet and could inflate aggregated metrics.', '[{"action":"Review Q2 sheet for duplicate entries","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-09 12:01:18'),
('seed_aud_gs3_006', 'seed_gs3_006', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'failure', 'Sheet contains no data rows', 'The Q2 Medications sheet header row is present but all data rows are empty. This may indicate the sheet was accidentally cleared or data was moved to a different tab.', '[{"action":"Check if Q2 data was moved to another sheet tab","toolName":"none","params":{}},{"action":"Verify with pharmacy ops team that Q2 sheet is current","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-11 12:15:15'),
('seed_aud_gs3_007', 'seed_gs3_007', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'clean', 'Sync recovered, data restored', 'Sheet data restored. 950 rows synced. Data appears consistent with pre-incident state.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-13 12:00:52'),
('seed_aud_gs3_008', 'seed_gs3_008', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'clean', 'Sync successful', 'Synced 2,100 rows. Normal volume.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-15 12:01:28'),
('seed_aud_gs3_009', 'seed_gs3_009', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'clean', 'Sync successful', 'Incremental sync of 1,400 rows. No issues.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-17 12:31:12'),
('seed_aud_gs3_010', 'seed_gs3_010', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'clean', 'Sync successful', 'Synced 1,050 rows. Data validated.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-19 12:00:58'),
('seed_aud_gs3_011', 'seed_gs3_011', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'clean', 'Sync successful', 'Normal sync of 1,700 rows.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-21 12:01:22'),
('seed_aud_gs3_012', 'seed_gs3_012', 'cmq5ab5yz00023zq8lz1xsyb9', 'longevity_fete', 'clean', 'Sync successful', 'Synced 880 rows. End of period, lower volume expected.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-23 12:00:45');


-- === molten_cleanliness (sheets Q3) audits ===

INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_gs4_001', 'seed_gs4_001', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'clean', 'Historical sync completed', 'Full sync of Q3 medications sheet. 3,100 rows loaded successfully.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 13:01:52'),
('seed_aud_gs4_002', 'seed_gs4_002', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'clean', 'Sync successful', 'Incremental sync of 1,050 rows. No issues.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-03 13:01:00'),
('seed_aud_gs4_003', 'seed_gs4_003', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'clean', 'Sync successful', 'Synced 880 rows. Schema stable.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-05 13:15:48'),
('seed_aud_gs4_004', 'seed_gs4_004', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'clean', 'Sync successful', 'Normal incremental sync. 1,400 rows processed.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-07 13:01:12'),
('seed_aud_gs4_005', 'seed_gs4_005', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'warning', 'New column "notes" appeared in sheet', 'Sync completed but a new column "notes" was detected that is not in the existing schema. With current settings, this column data is being captured but may not be expected by downstream consumers.', '[{"action":"Verify if notes column was intentionally added","toolName":"none","params":{}},{"action":"Update downstream queries if needed","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-09 13:00:55'),
('seed_aud_gs4_006', 'seed_gs4_006', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'clean', 'Sync successful', 'Synced 2,200 rows. Higher volume from batch updates.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-11 13:31:22'),
('seed_aud_gs4_007', 'seed_gs4_007', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'failure', 'Column type mismatch caused sync failure', 'The dosage_mg column contains text values ("N/A") that cannot be cast to the expected INTEGER type. 7 rows failed validation. The connector aborted the sync to prevent partial loads.', '[{"action":"Clean up text values in dosage_mg column in source sheet","toolName":"none","params":{}},{"action":"Consider changing column type to TEXT in schema config","toolName":"fivetran_write","params":{"action":"modify_schema","connector_id":"molten_cleanliness"}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-13 13:00:22'),
('seed_aud_gs4_008', 'seed_gs4_008', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'clean', 'Sync recovered after data cleanup', 'Source data cleaned. 1,150 rows synced. Type validation passed.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-15 13:01:02'),
('seed_aud_gs4_009', 'seed_gs4_009', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'clean', 'Sync successful', 'Synced 1,300 rows. No issues.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-17 13:15:55'),
('seed_aud_gs4_010', 'seed_gs4_010', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'clean', 'Sync successful', 'Normal sync of 790 rows.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-19 13:00:50');

-- seed_gs4_011: no audit (audit_status = none)

INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_gs4_012', 'seed_gs4_012', 'cmq5ab5yn00003zq81x49ygn1', 'molten_cleanliness', 'clean', 'Sync successful', 'Synced 1,050 rows. Normal operation.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-23 13:00:42');


-- === stubborn_dividers (GCS) audits ===

INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_gcs_001', 'seed_gcs_001', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'clean', 'Historical sync of lab results completed', 'Full historical load from GCS bucket. 185,000 rows from lab_results CSV files processed. All files parsed successfully.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 14:04:38'),
('seed_aud_gcs_002', 'seed_gcs_002', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'clean', 'Sync successful', 'Processed 42,000 new rows from incoming lab result files. No parsing errors.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-03 14:02:22'),
('seed_aud_gcs_003', 'seed_gcs_003', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'failure', 'GCS bucket access denied', 'The Fivetran service account lost storage.objects.list permission on the bucket. This typically happens when IAM policies are updated. The connector cannot list or read files until access is restored.', '[{"action":"Re-grant storage.objectViewer role to Fivetran service account on bucket fivetran-496601-lab-results","toolName":"none","params":{}},{"action":"Check recent IAM policy changes in GCP console","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-05 14:00:30'),
('seed_aud_gcs_004', 'seed_gcs_004', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'clean', 'Sync recovered after IAM fix', 'Access restored. 38,000 rows synced including backlog from missed sync. No data loss.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-07 14:16:58'),
('seed_aud_gcs_005', 'seed_gcs_005', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'clean', 'Sync successful', 'Processed 51,000 rows from 3 new CSV files. All parsed correctly.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-09 14:02:12'),
('seed_aud_gcs_006', 'seed_gcs_006', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'warning', 'Unexpected NULL columns in new file format', 'Sync completed but the latest file lab_results_2026_05_11.csv has 3 new NULL columns (ref_range_low, ref_range_high, methodology) not present in previous files. This suggests a format change from the lab vendor that may need schema attention.', '[{"action":"Contact lab vendor to confirm file format change","toolName":"none","params":{}},{"action":"Update schema expectations for new columns","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-11 14:01:48'),
('seed_aud_gcs_007', 'seed_gcs_007', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'clean', 'Sync successful', 'Processed 67,000 rows. Larger batch from lab vendor catch-up delivery.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-13 14:32:18'),
('seed_aud_gcs_008', 'seed_gcs_008', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'clean', 'Sync successful', 'Normal sync of 44,000 rows. Files processed without errors.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-15 14:02:02'),
('seed_aud_gcs_009', 'seed_gcs_009', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'failure', 'Expected file not present in bucket', 'The daily lab results file for 2026-05-17 was not uploaded to the /incoming/ path. The lab vendor may have missed their upload window or changed the file naming convention.', '[{"action":"Contact lab vendor about missing file delivery","toolName":"none","params":{}},{"action":"Check if file was uploaded to a different path","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-17 14:00:25'),
('seed_aud_gcs_010', 'seed_gcs_010', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'clean', 'Sync successful, includes late delivery', 'Processed 55,000 rows including the late May 17 file. No data gaps remain.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-19 14:02:38'),
('seed_aud_gcs_011', 'seed_gcs_011', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'clean', 'Sync successful', 'Synced 36,000 rows. Normal operation.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-21 14:16:52'),
('seed_aud_gcs_012', 'seed_gcs_012', 'cmq81gml400058tq8320n7jai', 'stubborn_dividers', 'clean', 'Sync successful', 'Processed 72,000 rows — end-of-week batch from lab vendor.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-23 14:03:18');


-- === heading_sailor (fivetran_log) audits ===

INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_fl_001', 'seed_fl_001', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'clean', 'Historical sync of Fivetran logs completed', 'Full load of Fivetran operational logs. 8,500 log entries processed covering account activity.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 06:01:18'),
('seed_aud_fl_002', 'seed_fl_002', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'clean', 'Sync successful', 'Synced 3,200 log entries. Normal volume.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-02 06:00:52'),
('seed_aud_fl_003', 'seed_fl_003', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'clean', 'Sync successful', 'Synced 2,800 entries. No anomalies.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-04 06:00:45'),
('seed_aud_fl_004', 'seed_fl_004', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'warning', 'Log volume spike detected', 'Sync completed but log volume increased 3x over baseline (4,100 vs avg 2,800). The spike correlates with multiple connector failures across the account. While the log sync itself is healthy, the elevated volume signals operational issues elsewhere.', '[{"action":"Review connector health dashboard for failing connectors","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-06 06:16:00'),
('seed_aud_fl_005', 'seed_fl_005', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'clean', 'Sync successful', 'Synced 2,500 entries. Volume returning to baseline.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-08 06:00:48'),
('seed_aud_fl_006', 'seed_fl_006', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'failure', 'Internal log ingestion pipeline error', 'Fivetran''s internal log pipeline experienced a transient failure. This is a Fivetran-side issue and typically self-resolves within a few hours. No action required from the user.', '[{"action":"Monitor next sync — should auto-recover","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-10 06:00:22'),
('seed_aud_fl_007', 'seed_fl_007', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'clean', 'Sync recovered', 'Pipeline recovered. 5,600 entries synced including backlog from missed window.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-12 06:01:12'),
('seed_aud_fl_008', 'seed_fl_008', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'clean', 'Sync successful', 'Synced 3,100 entries. Normal operation.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-14 06:00:55');

-- seed_fl_009: no audit (audit_status = none)

INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_fl_010', 'seed_fl_010', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'clean', 'Sync successful', 'Synced 3,400 entries.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-18 06:01:02'),
('seed_aud_fl_011', 'seed_fl_011', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'clean', 'Sync successful', 'Synced 2,900 entries. Normal volume.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-20 06:00:50'),
('seed_aud_fl_012', 'seed_fl_012', 'cmq81gmkr00008tq8sk0zjje7', 'heading_sailor', 'clean', 'Sync successful', 'Synced 3,700 entries. Slightly elevated, likely from recent connector config changes.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-22 06:16:08');


-- === carried_leaven (stripe_test) audits ===

INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_st_001', 'seed_st_001', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'clean', 'Historical sync of Stripe test data completed', 'Full historical load from Stripe test environment. 125,000 records across charges, customers, invoices, and subscriptions tables.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 15:03:28'),
('seed_aud_st_002', 'seed_st_002', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'clean', 'Sync successful', 'Synced 18,000 records. Normal incremental volume.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-03 15:01:52'),
('seed_aud_st_003', 'seed_st_003', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'failure', 'Stripe API rate limit exceeded', 'The Stripe test API returned a 429 rate limit error. This happens when too many API calls are made in a short window. Fivetran will automatically retry with backoff.', '[{"action":"No immediate action needed — Fivetran will auto-retry","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-05 15:00:15'),
('seed_aud_st_004', 'seed_st_004', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'clean', 'Sync recovered after rate limit backoff', 'Rate limit cleared. 22,000 records synced including backlog. No data loss.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-07 15:17:08'),
('seed_aud_st_005', 'seed_st_005', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'warning', 'Webhook backlog detected', 'Sync completed but Stripe reported 340 pending webhooks in the backlog. This means some events may arrive out of order. Data will eventually be consistent but real-time reports may show temporary discrepancies.', '[{"action":"Monitor webhook backlog — should clear within 1-2 hours","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-09 15:01:38'),
('seed_aud_st_006', 'seed_st_006', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'clean', 'Sync successful', 'Synced 31,000 records. Webhook backlog cleared.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-11 15:02:18'),
('seed_aud_st_007', 'seed_st_007', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'failure', 'Stripe API key revoked', 'The test API key has been revoked or rotated. A new key must be configured in the Fivetran connector settings before syncs can resume.', '[{"action":"Generate new Stripe test API key and update connector","toolName":"fivetran_write","params":{"action":"update_connector","connector_id":"carried_leaven"}},{"action":"Verify key permissions include read access to all required resources","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-13 15:00:20'),
('seed_aud_st_008', 'seed_st_008', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'clean', 'Sync recovered with new API key', 'New API key configured. 27,000 records synced including backlog. All tables validated.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-15 15:32:08'),
('seed_aud_st_009', 'seed_st_009', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'clean', 'Sync successful', 'Synced 19,000 records. Normal operation.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-17 15:01:52'),
('seed_aud_st_010', 'seed_st_010', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'clean', 'Sync successful', 'Synced 34,000 records. Higher volume from subscription renewals.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-19 15:02:28'),
('seed_aud_st_011', 'seed_st_011', 'cmq81gmsy00078tq8n5mtza78', 'carried_leaven', 'clean', 'Sync successful', 'Normal sync of 21,000 records.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-21 15:02:02');

-- seed_st_012: no audit (audit_status = none)


-- === averaging_summer (hubspot) audits ===

INSERT INTO sync_audits (id, sync_event_id, connector_id, fivetran_id, judgement, direct_cause, analysis, suggestions, user_id, created_at) VALUES
('seed_aud_hs_001', 'seed_hs_001', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'clean', 'Historical sync of HubSpot data completed', 'Full historical load from HubSpot. 320,000 records across contacts, companies, deals, and engagement tables. All API endpoints responded within limits.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-01 16:04:58'),
('seed_aud_hs_002', 'seed_hs_002', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'clean', 'Sync successful', 'Synced 45,000 records. Normal incremental volume.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-02 16:02:22'),
('seed_aud_hs_003', 'seed_hs_003', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'clean', 'Sync successful', 'Synced 28,000 records. Data consistent.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-04 16:01:48'),
('seed_aud_hs_004', 'seed_hs_004', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'failure', 'HubSpot OAuth token expired', 'The OAuth refresh token has expired. HubSpot tokens expire after extended inactivity or when the authorizing user changes their password. Re-authentication is required through the Fivetran connect card.', '[{"action":"Re-authenticate HubSpot connector via Fivetran connect card","toolName":"fivetran_write","params":{"action":"create_connect_card","connector_id":"averaging_summer"}},{"action":"Consider enabling token auto-refresh in HubSpot app settings","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-06 16:15:18'),
('seed_aud_hs_005', 'seed_hs_005', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'failure', 'OAuth token still expired — not yet re-authenticated', 'Second consecutive auth failure. The connector has not been re-authenticated since the token expiry 16 hours ago. Data pipeline is stalled.', '[{"action":"Re-authenticate immediately via connect card","toolName":"fivetran_write","params":{"action":"create_connect_card","connector_id":"averaging_summer"}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-07 08:00:15'),
('seed_aud_hs_006', 'seed_hs_006', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'clean', 'Sync recovered after re-authentication', 'OAuth token refreshed. 52,000 records synced including 2-day backlog. No data loss detected.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-08 16:02:38'),
('seed_aud_hs_007', 'seed_hs_007', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'clean', 'Sync successful', 'Synced 31,000 records. Normal volume.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-10 16:02:02'),
('seed_aud_hs_008', 'seed_hs_008', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'warning', 'Contact merge activity detected', 'Sync completed but 156 contact records were merged in HubSpot since last sync. Merged contacts may appear as deletions in the contacts table and as updates in the merged_contacts table. Downstream deduplication logic should be reviewed.', '[{"action":"Verify downstream contact deduplication handles merges correctly","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-12 16:33:08'),
('seed_aud_hs_009', 'seed_hs_009', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'clean', 'Sync successful', 'Synced 25,000 records. Merge activity stabilized.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-14 16:01:52'),
('seed_aud_hs_010', 'seed_hs_010', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'clean', 'Sync successful', 'Normal sync of 41,000 records.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-16 16:02:28'),
('seed_aud_hs_011', 'seed_hs_011', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'warning', 'Field mapping drift: custom property renamed', 'Sync completed but the custom property "lead_source_detail" was renamed to "lead_source_v2" in HubSpot. The old field now returns NULL for new records while the new field contains data. This silent rename may break reports that reference the old field name.', '[{"action":"Update field mappings in downstream queries to use lead_source_v2","toolName":"none","params":{}},{"action":"Consider adding a view or alias for backwards compatibility","toolName":"none","params":{}}]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-18 16:17:38'),
('seed_aud_hs_012', 'seed_hs_012', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'clean', 'Sync successful', 'Synced 29,000 records. Field mapping drift noted in previous audit still present but not worsening.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-20 16:01:58'),
('seed_aud_hs_013', 'seed_hs_013', 'cmq81gn0000088tq84jm559yl', 'averaging_summer', 'clean', 'Sync successful', 'Normal sync of 47,000 records. All tables healthy.', '[]', 'cmq3nswvu000055q8a7vaeulz', '2026-05-22 16:02:48');

COMMIT;
