-- Steamer PostgreSQL Row-Level Security (RLS) Hardening Script
-- Applies to Neon / Supabase PostgreSQL instances

-- 1. Enable RLS on all sensitive tenant tables
ALTER TABLE IF EXISTS "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "PaymentSubmission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "SetupWindow" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Grant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Ticket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "TicketMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Violation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Strike" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Device" ENABLE ROW LEVEL SECURITY;

-- 2. Performance Indexes on Foreign Keys (Crucial for RLS subquery performance)
CREATE INDEX IF NOT EXISTS idx_order_userid ON "Order"("userId");
CREATE INDEX IF NOT EXISTS idx_setupwindow_userid ON "SetupWindow"("userId");
CREATE INDEX IF NOT EXISTS idx_ticket_userid ON "Ticket"("userId");
CREATE INDEX IF NOT EXISTS idx_grant_userid ON "Grant"("userId");
CREATE INDEX IF NOT EXISTS idx_strike_userid ON "Strike"("userId");
CREATE INDEX IF NOT EXISTS idx_device_userid ON "Device"("userId");

-- 3. Session Context Helper Functions
CREATE OR REPLACE FUNCTION get_current_user_id() 
RETURNS TEXT AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_user_id', true), '');
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION is_admin_session() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(current_setting('app.is_admin', true) = 'true', false);
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. Policies on Order Table
DROP POLICY IF EXISTS "tenant_order_select" ON "Order";
CREATE POLICY "tenant_order_select" ON "Order"
FOR SELECT USING (
  "userId" = get_current_user_id() OR is_admin_session()
);

DROP POLICY IF EXISTS "tenant_order_insert" ON "Order";
CREATE POLICY "tenant_order_insert" ON "Order"
FOR INSERT WITH CHECK (
  "userId" = get_current_user_id() OR is_admin_session()
);

-- 5. Policies on SetupWindow Table (Guards 45-min access tokens)
DROP POLICY IF EXISTS "tenant_setup_window_select" ON "SetupWindow";
CREATE POLICY "tenant_setup_window_select" ON "SetupWindow"
FOR SELECT USING (
  "userId" = get_current_user_id() OR is_admin_session()
);

DROP POLICY IF EXISTS "tenant_setup_window_update" ON "SetupWindow";
CREATE POLICY "tenant_setup_window_update" ON "SetupWindow"
FOR UPDATE USING (
  ("userId" = get_current_user_id() AND status = 'ACTIVE') OR is_admin_session()
);

-- 6. Policies on PaymentSubmission Table (Guards UTR and payment proof)
DROP POLICY IF EXISTS "tenant_payment_submission_select" ON "PaymentSubmission";
CREATE POLICY "tenant_payment_submission_select" ON "PaymentSubmission"
FOR SELECT USING (
  is_admin_session() OR EXISTS (
    SELECT 1 FROM "Order" 
    WHERE "Order"."orderId" = "PaymentSubmission"."orderId" 
      AND "Order"."userId" = get_current_user_id()
  )
);

-- 7. Policies on Support Tickets & Messages
DROP POLICY IF EXISTS "tenant_ticket_all" ON "Ticket";
CREATE POLICY "tenant_ticket_all" ON "Ticket"
FOR ALL USING (
  "userId" = get_current_user_id() OR is_admin_session()
);

DROP POLICY IF EXISTS "tenant_ticket_message_select" ON "TicketMessage";
CREATE POLICY "tenant_ticket_message_select" ON "TicketMessage"
FOR SELECT USING (
  is_admin_session() OR EXISTS (
    SELECT 1 FROM "Ticket" 
    WHERE "Ticket".id = "TicketMessage"."ticketId" 
      AND "Ticket"."userId" = get_current_user_id()
  )
);

-- 8. Policies on Audit Logs, Violations, Strikes
DROP POLICY IF EXISTS "admin_audit_logs_all" ON "AuditLog";
CREATE POLICY "admin_audit_logs_all" ON "AuditLog"
FOR ALL USING (is_admin_session());

DROP POLICY IF EXISTS "admin_violations_all" ON "Violation";
CREATE POLICY "admin_violations_all" ON "Violation"
FOR ALL USING (is_admin_session());

DROP POLICY IF EXISTS "tenant_strike_select" ON "Strike";
CREATE POLICY "tenant_strike_select" ON "Strike"
FOR SELECT USING (
  "userId" = get_current_user_id() OR is_admin_session()
);

