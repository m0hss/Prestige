---
title: "Three ways the numbers could be wrong"
n: 3
params:
  kind: hypotheses
gist: "Duplicates, slow matching, ordering: two confirmed, one refuted."
when: "Weeks 2–4"
hypotheses:
  - id: "H1"
    claim: "Duplicate payments come from batch retries, not from bad source data."
    test: "Replay 90 days of batch logs against a copy and count payments with identical invoice and amount."
    verdict: "confirmed"
    evidence: "11 of 11 duplicates followed a retry of the 02:00 job."
  - id: "H2"
    claim: "Reconciliation is slow because of full-table scans."
    test: "EXPLAIN ANALYZE on the matching query against production-sized data."
    verdict: "refuted"
    evidence: "Index scans throughout. 81% of the runtime was the quadratic matching loop."
  - id: "H3"
    claim: "Per-account ordering is enough; global ordering is not needed."
    test: "Shadow-run for two weeks and diff every posting against the batch result."
    verdict: "confirmed"
    evidence: "Zero ordering differences across 1.2 M postings. Cross-account transfers excluded, see step 4."
---

H2 was the guess I was most sure of, and the one that cost the most to disprove. The query plan was
clean; the time was going into a nested loop in application code.

{{< aside label="Cost of being wrong" >}}
Two days spent adding an index that the planner already had. Since then, plan first.
{{< /aside >}}

The matching loop and its replacement are compared in {{< stepref n="5" >}}.
