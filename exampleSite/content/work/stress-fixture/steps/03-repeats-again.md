---
title: "Same title, different step"
n: 3
params:
  kind: note
gist: "The same title as the previous step, then the same headings again."
when: "Placeholder"
---

# Top-level heading inside a step

A `#` renders as an h3 here, as it does in a body: the step's own header is the h2.

## Notes

Same text as in step 2 and in the preface: id `step-3-h-notes`.

## Notes

`step-3-h-notes-1`.

### Detail

`step-3-h-detail`, with no clash against step 2's.

## Bleed in a step

![Raster strip, bleed requested inside a step](shots/bleed-wide.png#bleed "Falls back to the normal figure width in Backstage.")

## A code fence in a step

```
plain fence with no language, inside a step
<b>not bold</b>
```

## A table in a step

| Left | Right |
|:-----|------:|
| 1 | 2 |
