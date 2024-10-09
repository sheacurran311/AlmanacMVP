-- Function to apply earning rules and update customer points
CREATE OR REPLACE FUNCTION apply_earning_rule(
  p_customer_id UUID,
  p_event_type TEXT,
  p_event_name TEXT,
  p_event_data JSONB,
  p_tenant_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_points_earned INTEGER := 0;
  v_rule RECORD;
BEGIN
  -- Find matching earning rule
  SELECT * INTO v_rule
  FROM earning_rules
  WHERE tenant_id = p_tenant_id
    AND event_type = p_event_type
    AND event_name = p_event_name
    AND active = true
  LIMIT 1;

  -- If a matching rule is found, apply it
  IF FOUND THEN
    v_points_earned := v_rule.points_amount;

    -- Update customer points
    UPDATE customers
    SET points = points + v_points_earned
    WHERE id = p_customer_id AND tenant_id = p_tenant_id;

    -- Log the points transaction
    INSERT INTO points_transactions (
      customer_id,
      points,
      transaction_type,
      description,
      tenant_id
    ) VALUES (
      p_customer_id,
      v_points_earned,
      'EARN',
      format('Points earned from %s event', p_event_name),
      p_tenant_id
    );

    -- Check and update customer level
    PERFORM update_customer_level(p_customer_id, p_tenant_id);
  END IF;

  RETURN v_points_earned;
END;
$$ LANGUAGE plpgsql;

-- Function to update customer level based on total points
CREATE OR REPLACE FUNCTION update_customer_level(
  p_customer_id UUID,
  p_tenant_id UUID
) RETURNS VOID AS $$
DECLARE
  v_customer_points INTEGER;
  v_new_level_id UUID;
BEGIN
  -- Get customer's current points
  SELECT points INTO v_customer_points
  FROM customers
  WHERE id = p_customer_id AND tenant_id = p_tenant_id;

  -- Find the highest level that the customer qualifies for
  SELECT id INTO v_new_level_id
  FROM levels
  WHERE tenant_id = p_tenant_id
    AND required_points <= v_customer_points
  ORDER BY required_points DESC
  LIMIT 1;

  -- Update customer's level if a new level is found
  IF v_new_level_id IS NOT NULL THEN
    UPDATE customers
    SET level_id = v_new_level_id
    WHERE id = p_customer_id AND tenant_id = p_tenant_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to process reward redemption
CREATE OR REPLACE FUNCTION redeem_reward(
  p_customer_id UUID,
  p_reward_id UUID,
  p_tenant_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_reward_cost INTEGER;
  v_customer_points INTEGER;
BEGIN
  -- Get reward cost and customer points
  SELECT points_cost INTO v_reward_cost
  FROM rewards
  WHERE id = p_reward_id AND tenant_id = p_tenant_id;

  SELECT points INTO v_customer_points
  FROM customers
  WHERE id = p_customer_id AND tenant_id = p_tenant_id;

  -- Check if customer has enough points
  IF v_customer_points >= v_reward_cost THEN
    -- Deduct points from customer
    UPDATE customers
    SET points = points - v_reward_cost
    WHERE id = p_customer_id AND tenant_id = p_tenant_id;

    -- Log the redemption transaction
    INSERT INTO reward_redemptions (
      customer_id,
      reward_id,
      points_spent,
      tenant_id
    ) VALUES (
      p_customer_id,
      p_reward_id,
      v_reward_cost,
      p_tenant_id
    );

    -- Log the points transaction
    INSERT INTO points_transactions (
      customer_id,
      points,
      transaction_type,
      description,
      tenant_id
    ) VALUES (
      p_customer_id,
      -v_reward_cost,
      'REDEEM',
      format('Points redeemed for reward ID %s', p_reward_id),
      p_tenant_id
    );

    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;