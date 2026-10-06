-- Called once per open invoice from the Go matcher
SELECT id, amount, reference
FROM payments
WHERE account_id = $1
  AND status = 'open'
  AND amount = $2
  AND reference = $3
  AND posted_at >= $4
ORDER BY posted_at
LIMIT 1;
