---
title: "What the close looks like now"
n: 6
params:
  kind: result
gist: "Reconciliation 190 → 14 min; duplicate payments 11 → 0."
when: "Weeks 12–14, then three closes"
verdict: "The shadow ledger earned the cutover; the matching rewrite earned the speed."
caveat: "Three closes is a small sample, and December's year-end peak is not in it."
metrics:
  - label: "Month-end reconciliation"
    before: 190
    after: 14
    unit: "min"
    before_text: "3 h 10 min"
    after_text: "14 min"
    better: "lower"
  - label: "Duplicate payments per quarter"
    before: 11
    after: 0
    better: "lower"
  - label: "Posting delay, p95"
    before: 86400
    after: 2.4
    unit: "s"
    before_text: "24 h"
    after_text: "2.4 s"
    better: "lower"
---

Measured from the ledger's own audit table, not from a dashboard I built for the purpose:
close-to-close timestamps for August, September and October 2025.
