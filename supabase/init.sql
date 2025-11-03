-- Modular Business OS Core v1.0
-- Supabase/PostgreSQL initialization schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ===== CORE TABLES =====

-- Teams (organizations)
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    tier VARCHAR(50) DEFAULT 'starter', -- starter, pro, scale
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    trial_ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Members (RBAC)
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'viewer', -- viewer, editor, admin, owner
    permissions JSONB DEFAULT '{}',
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    joined_at TIMESTAMP,
    CONSTRAINT team_user_unique UNIQUE (team_id, user_id)
);

-- Module Registry (single source of truth)
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- in cents
    limits JSONB DEFAULT '{}',
    component_path VARCHAR(255),
    permissions JSONB DEFAULT '[]',
    marketplace_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Module Activations
CREATE TABLE IF NOT EXISTS team_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    stripe_usage_record_id VARCHAR(255),
    CONSTRAINT team_module_unique UNIQUE (team_id, module_id)
);

-- Event Bus Log (audit trail)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    user_id UUID,
    team_id UUID,
    module_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing Records
CREATE TABLE IF NOT EXISTS billing_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    stripe_invoice_id VARCHAR(255),
    amount INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'usd',
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    status VARCHAR(50), -- succeeded, failed, pending
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics (module usage tracking)
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id),
    metric_name VARCHAR(100),
    metric_value NUMERIC,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log (immutable)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Receipts (OCR + VAT processing)
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    vendor VARCHAR(255),
    total_amount DECIMAL(10, 2),
    vat_amount DECIMAL(10, 2),
    net_amount DECIMAL(10, 2),
    category VARCHAR(100),
    date DATE,
    image_url TEXT,
    ocr_confidence DECIMAL(5, 2),
    ocr_raw_data JSONB,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processed, error
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== INDEXES =====

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_modules_team_id ON team_modules(team_id);
CREATE INDEX IF NOT EXISTS idx_events_team_id ON events(team_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_team_module ON analytics(team_id, module_id);
CREATE INDEX IF NOT EXISTS idx_audit_team_id ON audit_log(team_id);
CREATE INDEX IF NOT EXISTS idx_receipts_team_id ON receipts(team_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at);
CREATE INDEX IF NOT EXISTS idx_receipts_category ON receipts(category);

-- ===== TRIGGERS =====

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== SAMPLE DATA =====

-- Default modules
INSERT INTO modules (module_id, name, description, price, limits, permissions) VALUES
    ('ai-sales-assistant', 'AI Sales Assistant', 'Automated lead qualification and follow-up', 3900, '{"responses": 1000}'::jsonb, '["sales.write"]'::jsonb),
    ('crm-sync', 'CRM Integration', 'Sync with HubSpot and Salesforce', 4900, '{"syncs": 100}'::jsonb, '["crm.read", "crm.write"]'::jsonb),
    ('advanced-analytics', 'Advanced Analytics', 'Custom dashboards and reports', 5900, '{}'::jsonb, '["analytics.read"]'::jsonb),
    ('white-label', 'White Label', 'Custom branding and SSO', 9900, '{}'::jsonb, '["branding.write"]'::jsonb)
ON CONFLICT (module_id) DO NOTHING;

-- ===== RLS (Row Level Security) =====

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES =====

-- Modules: Public read (marketplace)
CREATE POLICY "Public read" ON modules FOR SELECT USING (true);

-- Teams: Only team members can read
CREATE POLICY "Team members can read team data" ON teams FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = teams.id
        AND team_members.user_id = auth.uid()::uuid
    )
);

-- Team members: Can read own team memberships
CREATE POLICY "Users can read own memberships" ON team_members FOR SELECT USING (
    user_id = auth.uid()::uuid
);

-- Team members: Admins can insert/update members
CREATE POLICY "Admins can manage members" ON team_members FOR ALL USING (
    EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()::uuid
        AND tm.role IN ('admin', 'owner')
    )
);

-- Team modules: Team members can read
CREATE POLICY "Team members can read modules" ON team_modules FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = team_modules.team_id
        AND team_members.user_id = auth.uid()::uuid
    )
);

-- Receipts: Users can read receipts from their teams
CREATE POLICY "Users can read team receipts" ON receipts FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = receipts.team_id
        AND team_members.user_id = auth.uid()::uuid
    )
);

-- Receipts: Users can insert receipts to their teams
CREATE POLICY "Users can create receipts" ON receipts FOR INSERT WITH CHECK (
    user_id = auth.uid()::uuid
    AND EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = receipts.team_id
        AND team_members.user_id = auth.uid()::uuid
        AND team_members.role IN ('viewer', 'editor', 'admin', 'owner')
    )
);

-- Receipts: Editors+ can update receipts
CREATE POLICY "Editors can update receipts" ON receipts FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = receipts.team_id
        AND team_members.user_id = auth.uid()::uuid
        AND team_members.role IN ('editor', 'admin', 'owner')
    )
);

-- Receipts: Admins can delete receipts
CREATE POLICY "Admins can delete receipts" ON receipts FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = receipts.team_id
        AND team_members.user_id = auth.uid()::uuid
        AND team_members.role IN ('admin', 'owner')
    )
);

-- Events: Team members can read events
CREATE POLICY "Team members can read events" ON events FOR SELECT USING (
    team_id IS NULL OR EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = events.team_id
        AND team_members.user_id = auth.uid()::uuid
    )
);

-- Billing records: Only team owners/admins can read
CREATE POLICY "Team admins can read billing" ON billing_records FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = billing_records.team_id
        AND team_members.user_id = auth.uid()::uuid
        AND team_members.role IN ('admin', 'owner')
    )
);

-- Analytics: Team members can read
CREATE POLICY "Team members can read analytics" ON analytics FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = analytics.team_id
        AND team_members.user_id = auth.uid()::uuid
    )
);
