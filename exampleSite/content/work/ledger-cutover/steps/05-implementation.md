---
title: "A shadow ledger, then a cohort-by-cohort cutover"
n: 5
params:
  kind: implementation
gist: "Six weeks read-only, then eight working days, one cohort at a time."
when: "Weeks 5–11"
decisions:
  - decision: "Shadow first"
    because: "Six weeks of read-only comparison before any write proved the ledger on real traffic."
  - decision: "Cohorts of one eighth of accounts"
    because: "A bad cohort touches 12.5% of accounts, and can be moved back the same day."
  - decision: "Idempotency key on every posting"
    because: "Added after cohort 3, see TD-001."
---

The matching loop was the slow part, so it was rewritten as a single set-based query before the
shadow run started.

{{< ba-code before="snippets/match-before.sql" after="snippets/match-after.sql" lang="sql"
            before_label="Before: nested loop in app code" after_label="After: set-based match"
            hl_before="4-9" hl_after="2-6"
            caption="The same match, written as a loop and as one query." >}}

{{< ba-image before="shots/dashboard-before.png" before_alt="Spreadsheet export with 212 unmatched lines highlighted."
             after="shots/dashboard-after.png" after_alt="Dashboard with 3 unmatched lines."
             caption="October close, same data, two systems: 212 lines to check by hand became 3." >}}

{{< aside label="Trapdoor" >}}
Cohort 3 posted 212 lines twice for nine minutes. The report is [TD-001](/trapdoor/cohort-posted-twice/).
{{< /aside >}}
