---
title: "The nightly batch was the single source of truth"
n: 1
params:
  kind: problem
gist: "Invoices posted once a night; every failure waited until morning."
when: "Week 1"
statement: "A batch job posted every freight invoice once a night, against a database the vendor owned. When it failed, nobody knew until morning. When it retried, it paid twice."
evidence:
  - label: "Duplicate payments per quarter"
    value: "11"
  - label: "Month-end reconciliation"
    value: "3 h 10 min"
  - label: "Posting delay"
    value: "up to 24 h"
---

The batch had been extended for nine years by three teams. Nobody owned it end to end, and the only
monitoring was a morning email that said "OK" even on the nights it had retried.
