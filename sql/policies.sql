CREATE POLICY "Users can access own account only"
ON users
FOR ALL
USING (id = auth.uid());

CREATE POLICY "Users can access own coffee only"
ON coffee
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Only owner can modify or read coffee brands"
ON coffee_brands
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Only owner can modify or read coffee beans"
ON coffee_beans
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Access only own coffee bean mappings"
ON coffee_bean_inclusions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM coffee
    WHERE id = coffee_bean_inclusions.coffee_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Only owner can modify or read grind sizes"
ON grind_sizes
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Only owner can modify or read drinking records"
ON drinking_records
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Access only own grind size mappings"
ON drinking_grind_sizes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM drinking_records
    WHERE id = drinking_grind_sizes.record_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Only owner can modify or read reviews"
ON reviews
FOR ALL
USING (user_id = auth.uid());
