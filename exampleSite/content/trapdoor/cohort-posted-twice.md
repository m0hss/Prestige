---
title: "The cohort that posted twice"
date: 2025-10-03
case: "ledger-cutover"
ref: "TD-001"
severity: "minor"
what: "Cohort 3 posted 212 ledger lines twice for nine minutes during the cutover."
cause: "A consumer replayed an offset after a partition rebalance, and the posting call was not idempotent."
cost: "Three hours of cleanup and reconciliation. No money moved: payments were still gated by the batch."
changed: "Every posting carries an idempotency key. Each cohort starts with a replay drill on a copy."
lessons: ["idempotency", "dry-runs"]
---

Cohort 3 was the first cohort with live card-settlement accounts. At 10:42 the reconciliation view
showed 212 lines posted twice. The partition holding those accounts had rebalanced; the consumer
resumed from the last committed offset, and the posting call, which I had assumed was idempotent
because the partner's was, was not. Reconciliation caught it nine minutes later. No money moved,
because payments were still gated by the batch, but three hours went on cleanup and on proving that
to Finance.

What changed: every posting now carries an idempotency key (account, source event id), and each
cohort starts with a replay drill on a copy of its own data. The assumption in step 2 of the
walkthrough, "partner API is idempotent", is still marked ASSUMED, now with a link here.

*This failure, like the rest of the demo site, is fictional.*
