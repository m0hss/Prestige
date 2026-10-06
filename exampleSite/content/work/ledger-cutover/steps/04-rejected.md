---
title: "Three things I did not build"
n: 4
params:
  kind: rejected
gist: "A big-bang rewrite, log-based replication, two-phase commit."
when: "Week 4"
options:
  - name: "Big-bang rewrite"
    why: "No rollback inside the close window: one bad night would have stopped month-end."
    revisit: "high"
  - name: "Log-based CDC from the legacy database"
    why: "The vendor contract forbids reading the transaction log."
    revisit: "high"
  - name: "Two-phase commit across ledger and payments"
    why: "It couples the availability of two systems that fail at different times."
    revisit: "medium"
---

Cross-account transfers stayed on the batch until the last cohort, which is why H3 excluded them.
