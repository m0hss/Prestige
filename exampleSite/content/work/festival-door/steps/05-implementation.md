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

The published view showed each person only what they needed to act on:

| Who | Sees | Can change |
| :-- | :-- | :-: |
| Allocator | Every slot, every supplier | Yes |
| Supplier | Their own slot and gate time | No |
| Gate volunteer | Trucks due in the next 30 minutes | No |
| Road marshal | Trucks waiting in the holding field | No |

A small script in the slot base stopped the allocator from booking more trucks into one slot than
there are docks:

```js {title="Slot check, run before the view is published"}
const DOCKS = 3; // site plan
const slots = await base.getTable("Slots").selectRecordsAsync();

for (const slot of slots.records) {
  const trucks = slot.getCellValue("Trucks") ?? [];
  if (trucks.length > DOCKS) {
    output.text(`${slot.name}: ${trucks.length} trucks for ${DOCKS} docks`);
  }
}
```

{{< ba-image before="shots/site-before.png" before_alt="Site plan with 14 trucks queued on the road outside the gate."
             after="shots/site-after.png" after_alt="Site plan with trucks waiting in the holding field and 2 on the road."
             caption="Load-in at 07:10, the same plan in two years." >}}

{{< ba-metric label="Gate scan per truck" before="95" after="20" unit="s" before_text="1 min 35 s" after_text="20 s" note="Median over all trucks on load-in day." >}}
