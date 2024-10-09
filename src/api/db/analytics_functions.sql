-- Function to get customer statistics
CREATE OR REPLACE FUNCTION get_customer_stats(p_tenant_id UUID)
RETURNS TABLE (
  total_customers INTEGER,
  active_customers INTEGER,
  new_customers_last_30_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_customers,
    COUNT(*) FILTER (WHERE last_activity_date >= NOW() - INTERVAL '30 days') AS active_customers,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS new_customers_last_30_days
  FROM customers
  WHERE tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get points statistics
CREATE OR REPLACE FUNCTION get_points_stats(p_tenant_id UUID)
RETURNS TABLE (
  total_points_issued BIGINT,
  total_points_redeemed BIGINT,
  average_points_per_customer NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(points) FILTER (WHERE transaction_type = 'EARN'), 0) AS total_points_issued,
    COALESCE(SUM(ABS(points)) FILTER (WHERE transaction_type = 'REDEEM'), 0) AS total_points_redeemed,
    COALESCE(AVG(customer_points.total_points), 0) AS average_points_per_customer
  FROM points_transactions
  CROSS JOIN (
    SELECT AVG(points) AS total_points
    FROM customers
    WHERE tenant_id = p_tenant_id
  ) AS customer_points
  WHERE tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get reward statistics
CREATE OR REPLACE FUNCTION get_reward_stats(p_tenant_id UUID)
RETURNS TABLE (
  total_rewards INTEGER,
  total_redemptions INTEGER,
  most_popular_reward TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_rewards,
    COALESCE(SUM(redemptions), 0) AS total_redemptions,
    (
      SELECT name
      FROM rewards r
      LEFT JOIN reward_redemptions rr ON r.id = rr.reward_id
      WHERE r.tenant_id = p_tenant_id
      GROUP BY r.id
      ORDER BY COUNT(rr.id) DESC
      LIMIT 1
    ) AS most_popular_reward
  FROM rewards r
  LEFT JOIN (
    SELECT reward_id, COUNT(*) AS redemptions
    FROM reward_redemptions
    WHERE tenant_id = p_tenant_id
    GROUP BY reward_id
  ) rr ON r.id = rr.reward_id
  WHERE r.tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get campaign statistics
CREATE OR REPLACE FUNCTION get_campaign_stats(p_tenant_id UUID)
RETURNS TABLE (
  total_campaigns INTEGER,
  active_campaigns INTEGER,
  total_participants INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_campaigns,
    COUNT(*) FILTER (WHERE active = true AND NOW() BETWEEN start_date AND end_date) AS active_campaigns,
    COALESCE(SUM(participants), 0) AS total_participants
  FROM campaigns c
  LEFT JOIN (
    SELECT campaign_id, COUNT(*) AS participants
    FROM customer_campaigns
    WHERE tenant_id = p_tenant_id
    GROUP BY campaign_id
  ) cc ON c.id = cc.campaign_id
  WHERE c.tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get transaction statistics
CREATE OR REPLACE FUNCTION get_transaction_stats(p_tenant_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
  total_transactions INTEGER,
  total_amount NUMERIC,
  average_transaction_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_transactions,
    COALESCE(SUM(amount), 0) AS total_amount,
    COALESCE(AVG(amount), 0) AS average_transaction_value
  FROM transactions
  WHERE tenant_id = p_tenant_id
    AND created_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get customer lifetime value
CREATE OR REPLACE FUNCTION get_customer_lifetime_value(p_tenant_id UUID, p_customer_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_total_spend NUMERIC;
  v_total_points NUMERIC;
  v_points_value NUMERIC;
  v_lifetime_value NUMERIC;
BEGIN
  -- Get total spend
  SELECT COALESCE(SUM(amount), 0) INTO v_total_spend
  FROM transactions
  WHERE tenant_id = p_tenant_id AND customer_id = p_customer_id;

  -- Get total points
  SELECT points INTO v_total_points
  FROM customers
  WHERE tenant_id = p_tenant_id AND id = p_customer_id;

  -- Calculate points value (assuming 100 points = $1)
  v_points_value := v_total_points / 100;

  -- Calculate lifetime value
  v_lifetime_value := v_total_spend + v_points_value;

  RETURN v_lifetime_value;
END;
$$ LANGUAGE plpgsql;