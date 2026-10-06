-- One pass per account cohort
INSERT INTO matches (invoice_id, payment_id)
SELECT DISTINCT ON (i.id) i.id, p.id
FROM invoices i
JOIN payments p USING (account_id, amount, reference)
WHERE i.cohort = $1 AND p.status = 'open'
ORDER BY i.id, p.posted_at;
