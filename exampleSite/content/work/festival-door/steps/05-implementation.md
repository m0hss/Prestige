---
title: "Slots, a holding field and one scanner"
n: 5
params:
  kind: implementation
gist: "One allocator, a call-forward field, scan at the gate."
when: "Weeks 8–24"
decisions:
  - decision: "One allocator writes slots"
    because: "Everyone else reads a published view, so two people never give out the same slot."
  - decision: "Trucks wait in the holding field"
    because: "A field off the road takes the queue out of the permit's count."
  - decision: "Scan at the gate, not at the dock"
    because: "The scan was the slow step, and one scanner at the gate replaces three paper lists."
---

{{< ba-image before="shots/site-before.png" before_alt="Site plan with 14 trucks queued on the road outside the gate."
             after="shots/site-after.png" after_alt="Site plan with trucks waiting in the holding field and 2 on the road."
             caption="Load-in at 07:10, the same plan in two years." >}}

{{< ba-metric label="Gate scan per truck" before="95" after="20" unit="s" before_text="1 min 35 s" after_text="20 s" note="Median over all trucks on load-in day." >}}
