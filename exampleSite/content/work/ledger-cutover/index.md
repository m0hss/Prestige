---
title: "Ledger Cutover"
summary: "Month-end reconciliation fell from 3 h 10 min to 14 min, with no downtime in the close window."
brief: "A nightly batch was the only source of truth for freight invoices, and it paid twice 11 times a quarter."
date: 2025-11-14
weight: 10
headliner: true
role: "Lead backend engineer"
client: "Meridian Freight"
disciplines: ["backend"]
stack: ["Go", "PostgreSQL", "Kafka"]
cover:
  image: "cover.jpg"
  alt: "Reconciliation dashboard for October 2025 with 14,208 matched invoice lines and 3 unmatched."
  focus: "TopLeft"
barcode:
  duration: "14 weeks"
  team: 4
  outcome:
    value: "−93"
    unit: "%"
    label: "reconciliation time"
result:
  headline: "Month-end close went from three hours to fourteen minutes, and nobody was paid twice."
  metrics:
    - value: "14"
      unit: "min"
      label: "Month-end reconciliation"
      context: "Was 3 h 10 min. Measured over three closes."
    - value: "0"
      label: "Duplicate payments per quarter"
      context: "Was 11 in the quarter before cutover."
    - value: "2.4"
      unit: "s"
      label: "Posting delay, p95"
      context: "Was up to 24 h under the nightly batch."
  outcome: |
    Finance now closes the month on the afternoon of the last working day. The nightly batch is
    switched off, and the payments team no longer keeps a manual duplicate checklist.

    The cutover ran account cohort by cohort across eight working days. At no point was the
    ledger unavailable during a close window.
links:
  - label: "Engineering write-up (PDF)"
    url: "https://example.org/writeups/ledger-cutover.pdf"
    kind: "writeup"
backstage:
  teaser: "The turning point was a shadow ledger that ran beside the batch for six weeks before it was allowed to disagree out loud."
---

## The brief

Meridian's freight invoices were posted by one nightly batch against a vendor-owned database. When
the batch failed, nobody knew until morning. When it retried, it paid twice. Finance closed each
month by exporting everything to a spreadsheet and matching lines by hand for three hours.

The ask was a ledger that posts invoices as they arrive, reconciles continuously, and can be switched
on without a single minute of downtime in the close window.

![Reconciliation dashboard, October 2025](shots/dashboard-after.png#wide "Month-end reconciliation dashboard after cutover. Matched lines on the left, exceptions on the right.")

## What shipped

A double-entry ledger service that receives invoice events, posts them per account in order, and
reconciles incrementally instead of once a month. {{< stepref n="5" text="How the cutover ran" >}}.

The old batch ran beside the new ledger for six weeks as a shadow, and every posting was compared
before the ledger was allowed to write. Accounts then moved across in eight cohorts.

![Batch path and shadow-ledger path side by side, with the cohort boundary](shots/shadow-ledger.svg "The shadow ledger read the same events as the batch and reported every disagreement.")

*Tomás Reyes, Meridian Freight and every figure on this page are fictional; they demonstrate the theme.*
