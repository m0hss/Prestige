---
title: "Same title, different step"
n: 2
params:
  kind: note
gist: "A step that shares its title with the next one, and repeats headings inside itself."
when: "Placeholder"
---

Inside a step, a `##` heading renders as an h3 and a `###` as an h4. Anchors are prefixed with
`step-2-h-`, then numbered by Hugo where a heading repeats within this file.

## Notes

First "Notes" in this step: id `step-2-h-notes`.

## Notes

Second: `step-2-h-notes-1`.

### Detail

Under the second "Notes".

## Notes

Third: `step-2-h-notes-2`.

### Detail

Under the third "Notes", the same sub-heading text again.

## Notes 1

A heading whose text is the id Hugo already gave the second "Notes". It must not reuse it.

## NOTES

The same text in capitals gives the same slug.

## `Retry`

## Retry

Inline code and plain text slug alike.

## ???

## ???

A heading with no letters in it, twice.

## Bleed in a step

`#bleed` applies to the Performance layer only. Here it falls back to a plain figure at text width.

![Raster strip, bleed requested inside a step](shots/bleed-wide.png#bleed "Falls back to the normal figure width in Backstage.")

![Raster strip, wide inside a step](shots/bleed-wide.png#wide "Wide still works in Backstage.")

## A table in a step

| Ref | Service | Region | Owner | Tier | Window | p50 | p95 | p99 | Error rate | Cost per month |
|-----|---------|--------|-------|------|--------|----:|----:|----:|-----------:|---------------:|
| S-001 | ledger-api | eu-west | payments | 1 | 24/7 | 12 | 48 | 130 | 0.01% | 1,200.00 |
| S-002 | batch-runner | eu-west | finance | 2 | 02:00–03:00 | 900 | 2,400 | 5,100 | 0.40% | 310.00 |

## A code fence in a step

```bash
echo "stress-fixture: a long line inside a step, past the right edge of any screen: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
```
