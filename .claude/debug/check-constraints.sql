-- stripe_customersテーブルの制約を確認
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'stripe_customers'
ORDER BY tc.constraint_type, tc.constraint_name;

-- user_subscriptionsテーブルの制約を確認
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'user_subscriptions'
ORDER BY tc.constraint_type, tc.constraint_name;
