---
title: "Stress Fixture"
draft: true
summary: "A layout stress test, not a case study: full-bleed images, wide tables, awkward code fences and repeated headings."
brief: "Every layout edge the theme has met so far, in one bundle, so a regression shows up on one page."
date: 2025-01-01
weight: 999
role: "Theme maintainer"
client: "Prestige test suite"
disciplines: ["backend"]
stack: ["Hugo"]
cover:
  image: "cover.jpg"
  alt: "Test pattern: a grid with a dark diagonal band and a red square in each corner and at the centre."
barcode:
  ref: "PRS-0000-000"
  duration: "n/a"
  team: "n/a"
  outcome:
    value: "0"
    unit: "%"
    label: "placeholder value"
result:
  headline: "Nothing here was measured; the numbers are placeholders."
  metrics:
    - value: "0"
      label: "Real measurements"
      context: "Every figure in this bundle is a placeholder."
  outcome: |
    This bundle exists to be looked at, not read. It is a draft, so it builds only with `-D`
    (`hugo server -D`) and never reaches the deployed demo.

    What to check is listed under each heading.
backstage:
  teaser: "Two steps share a title and most of their headings, so every anchor has to stay unique."
---

# Top-level heading in the body

A `#` heading in a body renders as an h2. Nothing on this page should scroll sideways at any width,
apart from the tables and code blocks, which scroll inside their own frame.

## Bleed

Each figure below should reach both viewport edges, with the red squares at the very edge of the
image and nothing cropped. The page must gain no horizontal scrollbar at 320, 768 or 1920 px.

![Raster strip, 2400 px wide](shots/bleed-wide.png#bleed "Bleed, raster: five markers, four at the corners and one in the centre.")

Text between two bleeds must keep its measure and not pick up the bleed's negative margin.

![Vector strip, 2400 by 400](shots/bleed-wide.svg#bleed "Bleed, SVG: sized from the root element's width and height.")

![Raster strip again, back to back with the previous bleed, no text between](shots/bleed-wide.png#bleed)

The figure above has no caption. The next one is a caption long enough to wrap onto several lines on a
narrow screen, which is how a caption pushes a full-width figure wider than the viewport if the width
is wrong: lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.

![Raster strip with a long caption](shots/bleed-wide.png#bleed "A long caption: lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.")

A `#wide` figure is wider than the text and narrower than a bleed:

![Raster strip, wide](shots/bleed-wide.png#wide "Wide, not bleed: stops at the container.")

An inline image inside a sentence, ![inline bleed marker](shots/bleed-wide.svg#bleed "Inline caption") then the sentence continues.

- A list item holding a bleed image: it sits inside the list's indent, so it must still not overflow.

  ![Bleed inside a list item](shots/bleed-wide.png#bleed "Bleed inside a list item.")

> A blockquote holding a bleed image, with the same constraint.
>
> ![Bleed inside a blockquote](shots/bleed-wide.png#bleed "Bleed inside a blockquote.")

## Tables

A narrow table, aligned columns, and a header-only table:

| Left | Centre | Right |
|:-----|:------:|------:|
| a    | b      | 1     |
| long text that wraps when the column is narrow | `code` | 1,234,567.89 |
| | empty cells either side | |

| Only | a | header |
|------|---|--------|

A table too wide for any screen: it must scroll inside its frame, with a visible focus ring, and the
page itself must not scroll.

| Ref | Service | Region | Owner | Tier | Window | p50 | p95 | p99 | Error rate | Cost per month | Last drill | Notes |
|-----|---------|--------|-------|------|--------|----:|----:|----:|-----------:|---------------:|------------|-------|
| S-001 | ledger-api | eu-west | payments | 1 | 24/7 | 12 | 48 | 130 | 0.01% | 1,200.00 | 2025-01-01 | placeholder |
| S-002 | batch-runner | eu-west | finance | 2 | 02:00–03:00 | 900 | 2,400 | 5,100 | 0.40% | 310.00 | 2025-01-02 | placeholder |
| S-003 | exporter | eu-central | finance | 3 | Mon–Fri | 40 | 95 | 210 | 0.02% | 75.50 | never | placeholder |

Unbreakable strings, escaped pipes, links and inline formatting inside cells:

| Case | Content |
|------|---------|
| Long URL | https://example.org/a/very/long/path/that/never/breaks/because/it/has/no/spaces/in/it/at/all/and/keeps/going/for/a/while?with=query&and=more&and=more |
| Escaped pipe | `a \| b` and a literal \| bar |
| Link | [A link inside a cell](https://example.org/) and [one inside the site](/work/) |
| Formatting | **bold**, *italic*, `code`, ~~struck~~ |
| Hash token | 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08 |

A single-column table:

| Items |
|-------|
| one |
| two |

A tall table (18 rows) to check row rhythm and that the header is not sticky over content:

| # | Step | State |
|--:|------|-------|
| 1 | Prepare | done |
| 2 | Freeze | done |
| 3 | Snapshot | done |
| 4 | Drain | done |
| 5 | Copy | done |
| 6 | Verify | done |
| 7 | Switch | done |
| 8 | Watch | done |
| 9 | Compare | done |
| 10 | Reconcile | done |
| 11 | Hold | done |
| 12 | Release | done |
| 13 | Cleanup | done |
| 14 | Archive | done |
| 15 | Review | done |
| 16 | Report | done |
| 17 | Revisit | done |
| 18 | Retire | done |

## Code fences

Plain fence with no language: it must show the "plain text" label and escape its content.

```
<script>window.stressFixture = "must be shown as text, not run";</script>
a & b < c > d
```

Fence with a language, a title and highlighted lines:

```sql {title="match.sql" hl_lines=[2,"4-5"]}
SELECT i.id
FROM invoices i
JOIN postings p ON p.invoice_id = i.id
WHERE p.posted_at >= date_trunc('month', now())
  AND p.state = 'posted';
```

One very long line, which must scroll inside its frame and not widen the page:

```bash
echo "stress-fixture: this line is deliberately far longer than any screen, so the scroll frame has to take the overflow instead of the page: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" | wc -c
```

A language Chroma does not know, and a fence with a language but no content:

```not-a-language
still renders, as plain text
```

```go
```

Tabs, a tilde fence and a four-backtick fence that contains a three-backtick fence:

~~~yaml
key:
	tabbed: "this line starts with a tab"
list:
  - one
  - two
~~~

````markdown
```go
fmt.Println("a fence inside a fence")
```
````

A fence of 60 lines, taller than a phone screen:

```text
line 01
line 02
line 03
line 04
line 05
line 06
line 07
line 08
line 09
line 10
line 11
line 12
line 13
line 14
line 15
line 16
line 17
line 18
line 19
line 20
line 21
line 22
line 23
line 24
line 25
line 26
line 27
line 28
line 29
line 30
line 31
line 32
line 33
line 34
line 35
line 36
line 37
line 38
line 39
line 40
line 41
line 42
line 43
line 44
line 45
line 46
line 47
line 48
line 49
line 50
line 51
line 52
line 53
line 54
line 55
line 56
line 57
line 58
line 59
line 60
```

A fence inside a list item, and one in a blockquote:

1. Step one, with a fence:

   ```bash
   hugo server -D --source exampleSite
   ```

2. Step two.

> ```json
> { "quoted": true }
> ```

## Notes

The next two headings repeat this one, and so does a third in the section after them. Hugo numbers
repeats (`notes`, `notes-1`, `notes-2`), so no two ids on the page may match.

## Notes

### Detail

## Notes

### Detail

*Prestige and every figure on this page are fictional; this bundle only exercises the theme.*
