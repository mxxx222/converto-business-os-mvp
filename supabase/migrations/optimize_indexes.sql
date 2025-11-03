-- Database optimization: Indexes for common queries
-- This migration improves query performance for frequently accessed tables

-- Receipts indexes
CREATE INDEX IF NOT EXISTS idx_receipts_team_id ON receipts(team_id);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_team_status ON receipts(team_id, status);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);

-- Insights indexes (if insights table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'insights') THEN
        CREATE INDEX IF NOT EXISTS idx_insights_team_id ON insights(team_id);
        CREATE INDEX IF NOT EXISTS idx_insights_created_at ON insights(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_insights_type ON insights(type);
    END IF;
END $$;

-- Team members indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);

-- Analyze tables for query optimization
ANALYZE receipts;
ANALYZE team_members;

-- Enable query statistics extension (if available)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
