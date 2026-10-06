---
title: "Four limits that were not negotiable"
n: 2
params:
  kind: constraints
gist: "Zero downtime, no schema changes, four people, one assumption."
when: "Week 1"
constraints:
  - name: "Zero downtime in the close window"
    limit: "0 min unavailable, last 3 working days"
    type: "hard"
    source: "Finance"
  - name: "No schema changes on the vendor-owned database"
    limit: "Read-only access"
    type: "hard"
    source: "Vendor contract"
  - name: "Team size and language"
    limit: "Four engineers, Go only"
    type: "soft"
    source: "Team"
  - name: "Partner payments API is idempotent on reference"
    limit: "Retries are safe"
    type: "assumed"
    source: "Partner docs, unverified"
---

The fourth line is still marked ASSUMED. It turned out to be wrong for our own posting call, which
is filed as [TD-001](/trapdoor/cohort-posted-twice/).
