# Prestige: Hugo theme design specification

> **Version 1.0 · 2026-10-05.** Target: Hugo **extended ≥ 0.146.0**, the release that introduced the new template system (`layouts/home.html`, `layouts/_partials/`, `layouts/_shortcodes/`, `layouts/_markup/`). Template names and the mechanics this document relies on were checked against gohugo.io and **built and run on Hugo v0.167.0 extended** (released 2026-09-28, the current release on the date of writing): page-resource steps, `.File.Dir` bundle lookup, `render-image` hooks inside step resources, `css.Build` with `@import`, `@layer`, nesting, `@container` and `light-dark()`, `js.Build` as IIFE, and WebP processing.
> Every value in this document is final. Where the brief was silent, the choice is recorded in section 15.

---

## 1. Positioning

Prestige is a Hugo theme for case-study portfolios, built for backend engineers, product designers, consultants and event or logistics producers who need to show how they reason, not which tools they have touched. Every case study is authored in two layers: **Performance**, the polished result, and **Backstage**, a structured, numbered account of the problem, constraints, hypotheses, rejected options, implementation and measured result, with before/after comparisons. Both layers are real content in one page bundle, pre-rendered in reading order, and a site-wide curtain toggle chooses which one a visitor sees. Failures get their own section, the **Trapdoor**, with a reference number, a cost and a changed behaviour. The homepage is a split stage: finished results sit in front of the curtain, and raising it reveals the process beside each project. Prestige replaces the patterns that dominate the Hugo Themes catalogue today: the résumé-as-one-page-sections layout of Toha, Adritian, Hugo Profile, Developer Portfolio and CareerCanvas (it has no skills lists, no timeline, no single-page scroll of sections); the dark "developer control panel" (its dark scheme is a viewing preference, never an identity); the centred identity splash (the homepage opens on a left-aligned statement and the work itself); the agency hero with service cards (there are no services and no cards of equal rank); portrait-plus-credentials (the portrait is optional and 96 px); and the equal-weight project grid (a headliner outranks the supporting acts). It fills the gap the audit named, the "case-study debugger": problem → constraints → hypotheses → implementation → measured result.

---

## 2. Design principles

**P1. Show the work, then the working.**
- *Do:* give every headline number on the Performance layer a matching measured-result step in Backstage, and link to it with `{{< stepref >}}` or the result block's "How this was measured" link.
- *Don't:* print a result metric whose method cannot be found two clicks away.

**P2. Both layers are authored, never faked.**
- *Do:* write Backstage as schema-validated steps (`steps/NN-*.md`) that exist in the HTML on first load.
- *Don't:* reveal depth with hover, scroll-triggered or tooltip effects. If content is only reachable by a mouse gesture, it does not ship.

**P3. The theatre lives in structure and type, and every piece has a job.**
- *Do:* use the split stage (separates result from process), the valance (holds the one global control), the drape (shows the state of the toggle), slab type (the finished voice) and monospace labels (the working voice).
- *Don't:* add velvet textures, spotlights, confetti, parallax, mascots, or ornament that carries neither data nor state. If removing it loses no information, remove it.

**P4. Failure is a page, not a footnote.**
- *Do:* give each failure its own URL, `TD-nnn` reference, cost, cause and the behaviour that changed afterwards.
- *Don't:* collapse failure into a "lessons learned" bullet inside a success story.

**P5. Content first, enhancement second.**
- *Do:* render Performance, Backstage and Trapdoor as plain HTML in that order. JavaScript only hides the inactive layer, remembers the choice and manages step expansion.
- *Don't:* put any content in JavaScript, require JavaScript to reach any content, or hide content with a technique that JavaScript is needed to undo.

**P6. Unequal on purpose.**
- *Do:* let one case study be the headliner, let row heights follow content, and let a portfolio of two look designed (section 9.7).
- *Don't:* lay out projects as identical cards in a grid, pad with placeholder tiles, or show counters, logo walls or skill meters.

---

## 3. Content model

### 3.1 Vocabulary

| Term | Meaning | Where it shows up |
|---|---|---|
| **Performance** | The polished result layer of a case study. | `index.md`, the "front of curtain" column, Performance mode |
| **Backstage** | The structured, stepped process layer. | `backstage.md` + `steps/*.md`, the "behind the curtain" column, Backstage mode |
| **Trapdoor** | A filed failure report. | `content/trapdoor/*.md`, `/trapdoor/` |
| **Stage** | The homepage split layout. | `layouts/home.html` |
| **Curtain** | The state of the site-wide toggle: lowered = Performance, raised = Backstage. | Toggle, drape |
| **Valance** | The sticky 48 px curtain-red bar that holds the toggle on every page. | `_partials/site/valance.html` |
| **Drape** | The red panel that covers the Backstage column on the desktop homepage. | `.drape` |
| **Pelmet** | The always-visible red header band of the Backstage column (the drape hangs from it). | `.stage__pelmet` |
| **Programme** | A compact list of case studies (one barcode row each). | `/work/`, taxonomy terms |
| **Headliner** | The one case study given a larger row. | `headliner: true` |
| **Ref** | A project reference, `PRS-2025-003`, or failure reference, `TD-002`. | Barcode strip, failure entry |

### 3.2 Site content tree

```
content/
├── _index.md                       # Homepage text (headline, lede)
├── about.md                        # type: about
├── work/
│   ├── _index.md                   # Programme page text
│   └── <slug>/                     # one leaf bundle per case study (3.3)
└── trapdoor/
    ├── _index.md                   # Trapdoor intro text
    └── <slug>.md                   # one regular page per failure (3.7)
```

Failures are standalone pages, not bundle resources, because a failure needs its own URL, can exist without a case study (a cancelled project), and is listed, tagged and linked independently. A failure points at a case study with `case: <bundle-folder-name>`; the case-study template finds its failures with `where site.RegularPages "Params.case" .File.ContentBaseName`.

### 3.3 Case-study page bundle

```
content/work/ledger-cutover/
├── index.md                        # PERFORMANCE layer: front matter + narrative body
├── backstage.md                    # BACKSTAGE layer: status + optional preface (page resource)
├── steps/                          # BACKSTAGE steps, one file each (page resources)
│   ├── 01-problem.md
│   ├── 02-constraints.md
│   ├── 03-hypotheses.md
│   ├── 04-rejected.md
│   ├── 05-implementation.md
│   └── 06-result.md
├── snippets/                       # text files used by {{< ba-code >}} (plain resources)
│   ├── match-before.sql
│   └── match-after.sql
├── cover.jpg                       # cover.image
└── shots/                          # images for body, steps and {{< ba-image >}}
    ├── dashboard-before.png
    ├── dashboard-after.png
    └── shadow-ledger.svg
```

Rules, all enforced by `_partials/lib/validate.html` at build time (3.6):

- `index.md` is mandatory; it is the Performance layer. `backstage.md` and `steps/` are optional together: a bundle with no `steps/*.md` is **Performance-only** (section 9.4).
- `steps/` is exactly one level deep. Step files are Hugo *page resources* (they are not published as pages), found with `.Resources.Match "steps/*.md"` and sorted by `Params.n`.
- Every path in front matter or shortcodes (`cover.image`, `before`, `after`) is **relative to the bundle root**, never to the step file. A step in `steps/` writes `shots/dashboard-after.png`, not `../shots/...`. The helper `_partials/lib/bundle.html` resolves the owning bundle from any page or step with `.File.Dir`, so shortcodes and the `render-image` hook behave identically in `index.md` and in a step.

### 3.4 Performance layer: `index.md` front matter

YAML is used for all content front matter; TOML is used for site configuration.

| Field | Type | Req. | Rules |
|---|---|---|---|
| `title` | string | yes | ≤ 48 characters. Rendered as H1. |
| `summary` | string | yes | ≤ 140 characters. The result as one sentence. Used on the Performance face of the stage row, in `<meta name="description">` and in Programme rows. |
| `brief` | string | yes | ≤ 160 characters. The problem as one sentence. Used on the Backstage face of the stage row. **Always required, even when Backstage is unwritten**, so the Backstage face is never empty. |
| `date` | date | yes | Project end date. Year feeds the ref. |
| `weight` | int | no | Default 100. Lower sorts first. Ties break by `date` descending. |
| `headliner` | bool | no | Default `false`. At most one per site; a second one triggers `warnf` and is ignored. If none is set, the lowest `weight` is the headliner. |
| `draft` | bool | no | Standard Hugo draft. |
| `role` | string | yes | e.g. "Lead backend engineer". |
| `client` | string | no | Shown in the case-study head when present. |
| `disciplines` | list of string | yes, ≥ 1 | Taxonomy `disciplines`. |
| `stack` | list of string | no | Taxonomy `stack`. The barcode strip shows the first three and "+n". |
| `cover.image` | string | yes | Bundle-relative image. |
| `cover.alt` | string | yes | Build error if empty. |
| `cover.focus` | string | no | Hugo anchor: `Smart` (default), `Center`, `TopLeft`, `Top`, `TopRight`, `Left`, `Right`, `BottomLeft`, `Bottom`, `BottomRight`. |
| `barcode.duration` | string | yes | Free text, ≤ 16 characters ("14 weeks"). |
| `barcode.team` | int or string | yes | An int renders "4 people" (singular for 1); a string renders as written ("3 staff + 9 volunteers"). |
| `barcode.outcome.value` | string | yes | e.g. `"−93"`. |
| `barcode.outcome.unit` | string | no | e.g. `"%"`. |
| `barcode.outcome.label` | string | yes | ≤ 28 characters. |
| `barcode.ref` | string | no | Overrides the computed ref. |
| `result.headline` | string | yes | ≤ 100 characters. The result sentence, set large. |
| `result.metrics` | list, 1 to 3 | yes | Each: `value` (string, req.), `unit` (string), `label` (string, req.), `context` (string). |
| `result.outcome` | markdown string | yes | One to three short paragraphs. |
| `links` | list | no | Each: `label`, `url`, `kind` (`live`, `repo` or `writeup`). |
| `backstage.teaser` | string | yes if steps exist | ≤ 140 characters. The turning point, shown on the stage-row Backstage face. |
| `backstage.note` | string | no | Overrides the Performance-only notice text (9.4). |
| `og_image` | string | no | Bundle-relative; defaults to `cover.image`. |

**Complete example: `content/work/ledger-cutover/index.md`**

```yaml
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

Meridian's freight invoices were posted by one nightly batch against a vendor-owned database...

![Reconciliation dashboard, October 2025](shots/dashboard-after.png#wide "Month-end reconciliation dashboard after cutover. Matched lines on the left, exceptions on the right.")

## What shipped

A double-entry ledger service that receives invoice events, posts them per account in order, and
reconciles incrementally instead of once a month. {{< stepref n="5" text="How the cutover ran" >}}.
```

### 3.5 Backstage layer: `backstage.md` front matter

| Field | Type | Req. | Rules |
|---|---|---|---|
| `status` | `complete` or `in-progress` | yes | `in-progress` renders the "walkthrough in progress" notice after the last step. |
| `planned` | int | if `in-progress` | Planned step count. The notice reads "6 of 9 steps published". |
| `updated` | date | no | Shown as "Backstage updated 2025-12-02". |

The body of `backstage.md` is an optional **preface**, at most 80 words, rendered above the step list. It is plain markdown and may use `aside` and `stepref`.

```yaml
---
status: complete
updated: 2025-12-02
---
Written from my notes and the pull-request history. Times are working weeks from kickoff.
Wrong guesses are left in.
```

### 3.6 Backstage step schema

One file per step in `steps/`. **Common fields:**

| Field | Type | Req. | Rules |
|---|---|---|---|
| `title` | string | yes | ≤ 60 characters. |
| `n` | int | yes | 1-based, unique, contiguous. Order is by `n`, not by filename. |
| `kind` | enum | yes | `problem`, `constraints`, `hypotheses`, `rejected`, `implementation`, `result`, `note`. |
| `gist` | string | yes | ≤ 100 characters. Shown in the collapsed step header. |
| `when` | string | no | ≤ 24 characters ("Weeks 2–4"). |

The body of each step file is markdown (with all shortcodes and render hooks) and renders after the structured block of its kind.

**Fields and rendering by kind:**

| `kind` | Label code | Extra front matter | Structured block rendered |
|---|---|---|---|
| `problem` | `PRB` | `statement` (string, req.); `evidence` (list of `{label, value}`, opt.) | `statement` set in the label font at body-large size; `evidence` as a `<dl>` of figures. |
| `constraints` | `CON` | `constraints` (list, req.): `{name, limit, type, source}`; `type` is `hard`, `soft` or `assumed`; `source` is opt. | A table: Constraint · Limit · Type · Source. Type is a text chip: solid for `HARD`, outlined for `SOFT`, dashed for `ASSUMED`. |
| `hypotheses` | `HYP` | `hypotheses` (list, req.): `{id, claim, test, verdict, evidence}`; `verdict` is `confirmed`, `refuted`, `inconclusive` or `untested`. | One panel per hypothesis with a verdict stamp: `✓ CONFIRMED`, `✗ REFUTED`, `? INCONCLUSIVE`, `– UNTESTED`. |
| `rejected` | `REJ` | `options` (list, req.): `{name, why, revisit}`; `revisit` is `low`, `medium` or `high` (cost to reverse later). | One panel per option with the name struck through, a `REJECTED` stamp, the reason, and "Cost to revisit: HIGH". |
| `implementation` | `IMP` | `decisions` (list, opt.): `{decision, because}` | A two-column decision ledger, then the body. |
| `result` | `RES` | `metrics` (list, req.): `{label, before, after, unit, better, before_text, after_text}`; `verdict` (string, req.); `caveat` (string, opt.) | `ba-metric` rows, the verdict sentence, and "What this does not show: *caveat*". |
| `note` | `NTE` | none | Body only; for a detour that fits no other kind. |

`better` is `lower` or `higher` (default `lower`). `before` and `after` are numbers in the same `unit`; `before_text` and `after_text` are the human strings ("3 h 10 min") and default to `<number> <unit>`.

**Build-time validation** (`_partials/lib/validate.html`; `errorf` stops the build, `warnf` prints and continues):

| Rule | Severity |
|---|---|
| `cover.alt` empty; `summary`, `brief`, `role`, `barcode.*` or `result.*` missing | error |
| `kind` not in the enum; a required kind-specific field missing | error |
| `n` not unique or not contiguous from 1 | error |
| `steps/` has files but `backstage.teaser` is missing | error |
| `backstage.md` says `in-progress` without `planned` | error |
| `result.metrics` has 0 or more than 3 entries | error |
| A `ba-*` shortcode points at a bundle path that does not exist | error |
| More than one `headliner: true` on the site | warn (first by weight wins) |
| No step has `kind: result` while `result.metrics` exists (P1) | warn |
| Hypothesis `verdict` is `untested` while the step is the last `n` | warn |

**Complete example: `steps/03-hypotheses.md`**

```yaml
---
title: "Three ways the numbers could be wrong"
n: 3
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
```

**Complete example: `steps/06-result.md`**

```yaml
---
title: "What the close looks like now"
n: 6
kind: result
gist: "Reconciliation 190 → 14 min; duplicate payments 11 → 0."
when: "Weeks 12–14, then three closes"
verdict: "The shadow ledger earned the cutover; the matching rewrite earned the speed."
caveat: "Three closes is a small sample, and December's year-end peak is not in it."
metrics:
  - label: "Month-end reconciliation"
    before: 190
    after: 14
    unit: "min"
    before_text: "3 h 10 min"
    after_text: "14 min"
    better: "lower"
  - label: "Duplicate payments per quarter"
    before: 11
    after: 0
    better: "lower"
  - label: "Posting delay, p95"
    before: 86400
    after: 2.4
    unit: "s"
    before_text: "24 h"
    after_text: "2.4 s"
    better: "lower"
---

Measured from the ledger's own audit table, not from a dashboard I built for the purpose:
close-to-close timestamps for August, September and October 2025.
```

### 3.7 Trapdoor (failure) entries: `content/trapdoor/<slug>.md`

| Field | Type | Req. | Rules |
|---|---|---|---|
| `title` | string | yes | ≤ 60 characters; names the failure, not the lesson. |
| `date` | date | yes | When it happened. |
| `case` | string | no | Bundle folder name of the related case study. |
| `severity` | `minor`, `major` or `critical` | yes | Rendered as text plus filled squares (■□□, ■■□, ■■■). |
| `what` | string | yes | ≤ 200 characters. What happened. |
| `cause` | string | yes | ≤ 200 characters. |
| `cost` | string | yes | ≤ 120 characters. Time, money or trust, in numbers where possible. |
| `changed` | string | yes | ≤ 200 characters. The behaviour that changed afterwards. |
| `lessons` | list of string | yes, ≥ 1 | Taxonomy `lessons`. |

The body is the narrative account. The ref (`TD-001`…) is computed from `date` ascending across the section.

```yaml
---
title: "The cohort that posted twice"
date: 2025-10-03
case: "ledger-cutover"
severity: "minor"
what: "Cohort 3 posted 212 ledger lines twice for nine minutes during the cutover."
cause: "A consumer replayed an offset after a partition rebalance, and the posting call was not idempotent."
cost: "Three hours of cleanup and reconciliation. No money moved: payments were still gated by the batch."
changed: "Every posting carries an idempotency key. Each cohort starts with a replay drill on a copy."
lessons: ["idempotency", "dry-runs"]
---

Cohort 3 was the first cohort with live card-settlement accounts...
```

### 3.8 Shortcodes

All live in `layouts/_shortcodes/`. Image and snippet paths are bundle-relative. Missing required parameters stop the build with `errorf` naming the shortcode and the page.

| Shortcode | Purpose | File |
|---|---|---|
| `metric` | One headline figure with label and context. | `metric.html` |
| `ba-metric` | One before/after figure with computed delta. | `ba-metric.html` |
| `ba-image` | Two images compared. | `ba-image.html` |
| `ba-code` | Two code snippets compared. | `ba-code.html` |
| `aside` | A margin note. | `aside.html` |
| `stepref` | A cross-reference to a Backstage step. | `stepref.html` |

**`metric`**

| Param | Req. | Values |
|---|---|---|
| `value` | yes | string |
| `unit` | no | string |
| `label` | yes | string |
| `context` | no | string, ≤ 100 characters |
| `size` | no | `l` (default) or `xl` |

```
{{< metric value="14" unit="min" label="Month-end reconciliation" context="Was 3 h 10 min." size="xl" >}}
```

**`ba-metric`**

| Param | Req. | Values |
|---|---|---|
| `label` | yes | string |
| `before`, `after` | yes | numbers in the same unit |
| `unit` | no | string |
| `before_text`, `after_text` | no | display strings; default `<number> <unit>` |
| `better` | no | `lower` (default) or `higher` |
| `note` | no | string |

The template computes `delta = round((after − before) / before × 100)` and prints it with an arrow and words: "↓ 93% lower" or "↑ 40% higher". The accessible name is the sentence "Month-end reconciliation: before 3 h 10 min, after 14 min, 93% lower." When `before` is `0` the delta is omitted and the words "from zero" are printed. A delta that moves the wrong way against `better` is prefixed with the text "Worse:" so direction never depends on colour.

```
{{< ba-metric label="Month-end reconciliation" before="190" after="14" unit="min" before_text="3 h 10 min" after_text="14 min" >}}
```

**`ba-image`**

| Param | Req. | Values |
|---|---|---|
| `before`, `after` | yes | bundle-relative image paths |
| `before_alt`, `after_alt` | yes | alt text; build error if empty |
| `caption` | no | string |
| `before_label`, `after_label` | no | default "Before" / "After" |

```
{{< ba-image before="shots/dashboard-before.png" before_alt="Spreadsheet export with 212 unmatched lines highlighted."
             after="shots/dashboard-after.png" after_alt="Dashboard with 3 unmatched lines."
             caption="October close, same data, two systems." >}}
```

**`ba-code`**

| Param | Req. | Values |
|---|---|---|
| `before`, `after` | yes | bundle-relative paths of text files |
| `lang` | yes | any Chroma lexer name |
| `before_label`, `after_label` | no | default "Before" / "After" |
| `hl_before`, `hl_after` | no | Chroma `hl_lines` string, e.g. `"3-5"` |
| `caption` | no | string |

```
{{< ba-code before="snippets/match-before.sql" after="snippets/match-after.sql" lang="sql"
            before_label="Before: nested loop in app code" after_label="After: set-based match"
            hl_before="4-9" hl_after="2-6" >}}
```

**`aside`**

| Param | Req. | Values |
|---|---|---|
| `label` | no | default "Note" |
| inner content | yes | markdown |

```
{{< aside label="Cost of being wrong" >}}Two days spent adding an index the planner already had.{{< /aside >}}
```

**`stepref`**

| Param | Req. | Values |
|---|---|---|
| `n` | yes | step number in this bundle |
| `text` | no | link text; default "step n" |

It renders `<a href="#step-3" data-stepref="3">…</a>`. The JavaScript opens the step and switches to Backstage for this page load (without persisting); without JavaScript the anchor scrolls to the step, which is already visible. In a Performance-layer body the link text is prefixed with a visually hidden "Backstage:".

### 3.9 Images in markdown

`![alt](shots/a.png "caption")` is handled by `layouts/_markup/render-image.html`: it resolves the file in the bundle, emits a responsive `<picture>`, and wraps it in `<figure>` with `<figcaption>` when a title is given. A URL fragment sets the width: `#wide` (spans the full container), `#bleed` (viewport edge to edge, Performance layer only); no fragment means measure width. Empty `alt` is an error unless the fragment `#decorative` is present.

### 3.10 Taxonomies

```toml
[taxonomies]
  discipline = "disciplines"
  stack      = "stack"
  lesson     = "lessons"
```

| Taxonomy | Applies to | Examples | Surfaces |
|---|---|---|---|
| `disciplines` | case studies | `backend`, `product-design`, `consulting`, `events-logistics` | Chips on case-study head and Programme rows; filter links on `/work/` |
| `stack` | case studies | `Go`, `PostgreSQL`, `Airtable` | Barcode strip; term pages |
| `lessons` | trapdoor entries | `idempotency`, `dry-runs`, `estimation` | Chips on failure entries; filter links on `/trapdoor/` |

### 3.11 Other content files

`content/_index.md`

```yaml
---
title: "Home"
headline: "Every result has a backstage."
lede: "Backend systems and live-event logistics. Every project is shown twice: the result, then the working."
---
```

`content/about.md` (`type: about` selects `layouts/about/page.html`)

```yaml
---
title: "About"
type: about
lede: "I am called in when a system is correct on paper and wrong on the day."
method:
  - label: "Start from the failure"
    text: "I write down how it hurts before I write down how to fix it."
  - label: "Keep the rejected options"
    text: "A decision is only as good as the alternatives it beat. I keep those on file."
  - label: "Measure with the customer's own data"
    text: "Dashboards built for the demo do not count."
called_in_for:
  - "Cutovers that cannot have downtime"
  - "Events where the schedule is the product"
  - "Flows that generate support tickets"
---
```

`content/work/_index.md` and `content/trapdoor/_index.md` carry `title` and an optional `lede`.

### 3.12 `hugo.toml` reference

Theme defaults live in the theme's own `hugo.toml`; the site overrides them.

| Key | Type | Default | Meaning |
|---|---|---|---|
| `params.description` | string | none (required) | Site meta description. |
| `params.author.name` | string | none (required) | Wordmark and structured data. |
| `params.author.role` | string | none (required) | Shown under the headline and in the footer. |
| `params.author.location` | string | empty | Shown in the footer if set. |
| `params.author.portrait` | string | empty | Path under `assets/`; if set, a 96 × 96 px portrait appears in the About byline only. |
| `params.contact.email` | string | none (required) | Contact block. Missing: the production build omits the mailto; `hugo server` renders the error state (7.8). |
| `params.contact.availability` | string | empty | One line ("Booking from March 2027"). |
| `params.contact.links` | list of `{label, url}` | empty | Extra links in the contact block. |
| `params.stage.default_mode` | `performance` or `backstage` | `performance` | Mode for a first-time visitor. |
| `params.stage.programme_from` | int | `5` | The homepage adds a Programme list when the site has at least this many case studies. |
| `params.stage.trapdoor_on_home` | bool | `true` | Show the trapdoor strip on the homepage when a failure exists. |
| `params.scheme.switch` | bool | `true` | Footer Auto / Light / Dark switch. |
| `params.footer.note` | string | empty | One line above the colophon. |
| `params.credit` | bool | `true` | "Built with Prestige" in the footer. |
| `params.seo.og_image` | string | `img/og-default.png` | Fallback Open Graph image, path under `assets/`. |

Prestige ships **no analytics, no third-party scripts and no cookies**.

**Complete `exampleSite/hugo.toml`**

```toml
baseURL      = "https://prestige-demo.example.org/"
languageCode = "en"
title        = "Tomás Reyes"
theme        = "prestige"
enableRobotsTXT = true

[module.hugoVersion]
  min = "0.146.0"

[taxonomies]
  discipline = "disciplines"
  stack      = "stack"
  lesson     = "lessons"

[permalinks.page]
  work     = "/work/:slug/"
  trapdoor = "/trapdoor/:slug/"

[markup.highlight]
  noClasses  = false
  lineNos    = false
  guessSyntax = false
  tabWidth   = 2

[markup.goldmark.renderer]
  unsafe = false

[imaging]
  quality = 80
  resampleFilter = "CatmullRom"
  anchor = "Smart"
  [imaging.exif]
    disableLatLong = true

[outputs]
  home = ["html", "rss"]

[[menus.main]]
  name = "Work"
  pageRef = "/work"
  weight = 10
[[menus.main]]
  name = "Trapdoor"
  pageRef = "/trapdoor"
  weight = 20
[[menus.main]]
  name = "About"
  pageRef = "/about"
  weight = 30

[params]
  description = "Tomás Reyes: backend systems and live-event logistics, shown as results and as the working behind them."
  [params.author]
    name = "Tomás Reyes"
    role = "Backend engineer and production lead"
    location = "Ghent, Belgium"
  [params.contact]
    email = "hello@prestige-demo.example.org"
    availability = "Booking from March 2027"
    [[params.contact.links]]
      label = "Code"
      url = "https://github.com/prestige-demo"
    [[params.contact.links]]
      label = "Write-ups"
      url = "https://prestige-demo.example.org/writeups/"
  [params.stage]
    default_mode = "performance"
    programme_from = 5
    trapdoor_on_home = true
  [params.scheme]
    switch = true
  [params.footer]
    note = "Available for cutovers, festivals and flows that make people write in."
  credit = true
```

### 3.13 Derived values (computed in templates, never authored)

| Value | Computation |
|---|---|
| `steps` | `sort (.Resources.Match "steps/*.md") "Params.n"` |
| `hasBackstage` | `gt (len steps) 0` |
| `ref` | `barcode.ref`, else `PRS-<year>-<NNN>`, where NNN is the 3-digit position of the case study when all case studies are sorted by `date` ascending |
| `counts` | steps; constraints = `len` of the `constraints` step's list; rejected = `len` of the `rejected` step's `options`; failures = count of trapdoor pages with `case` equal to this bundle |
| `isHeadliner` | `headliner: true`, else lowest `weight` |
| `stageTitle` | by case-study count: 1 "Solo performance", 2 "Double bill", 3 "Triple bill", 4 or more "The season" (strings in `i18n/en.toml`) |
| `next` | `.NextInSection` (wraps to the first case study at the end) |

---

## 4. Information architecture

### 4.1 Sitemap

| URL | Page | Template | Purpose |
|---|---|---|---|
| `/` | Home: the split stage | `layouts/home.html` | Results in front of the curtain, process behind it, for every case study. |
| `/work/` | Programme | `layouts/work/section.html` | Every case study as a compact barcode row; discipline filter links. |
| `/work/<slug>/` | Case study | `layouts/work/page.html` | Performance, Backstage and Trapdoor layers in one document. |
| `/trapdoor/` | Failures list | `layouts/trapdoor/section.html` | Every failure as a filed report; lesson filter links. |
| `/trapdoor/<slug>/` | Failure report | `layouts/trapdoor/page.html` | One failure, in full. |
| `/about/` | About | `layouts/about/page.html` | How the author works, what they are called in for, contact. |
| `/disciplines/`, `/stack/`, `/lessons/` | Taxonomy indexes | `layouts/taxonomy.html` | All terms with counts. |
| `/disciplines/<term>/`, `/stack/<term>/`, `/lessons/<term>/` | Term pages | `layouts/term.html` | Programme rows and/or failure rows for one term. |
| `/404.html` | Not found | `layouts/404.html` | A failure report about the address. |
| `/index.xml`, `/sitemap.xml`, `/robots.txt` | Feeds and crawling | Hugo built-in templates with `enableRobotsTXT = true` | The home RSS feed lists case studies and failures in Hugo's default order; the theme does not customise feeds. |

There is no blog, no tag cloud, no search and no separate "Services" or "Resume" page. A page that does not appear in this table must not exist in the theme.

### 4.2 URL scheme

- Permalinks: `/work/:slug/` and `/trapdoor/:slug/` (`[permalinks.page]`). Slugs come from the bundle folder or file name.
- **One URL per case study for both layers.** The layer is chosen by the visitor's mode, not by the path. Deep links use fragments only:

| Fragment | Effect with JavaScript | Effect without JavaScript |
|---|---|---|
| `#performance` | Shows Performance mode for this page load (not persisted). | Scrolls to the Performance layer. |
| `#backstage` | Shows Backstage mode for this page load (not persisted). | Scrolls to the Backstage layer. |
| `#step-3` | Shows Backstage, opens step 3, moves focus to its header. | Scrolls to step 3. |
| `#trapdoor` | Shows Backstage, scrolls to the Trapdoor section. | Scrolls to the Trapdoor section. |
| `#result` | Shows Performance, scrolls to the result block. | Scrolls to the result block. |

- Query strings carry no state. Nothing is stored in a cookie.
- Canonical URLs never include fragments. Open Graph and RSS point at the path.

### 4.3 Navigation

| Element | Contents | Rules |
|---|---|---|
| **Header** (not sticky) | Wordmark (links to `/`), then `Work`, `Trapdoor`, `About` | `Trapdoor` is omitted when the site has no failure entries. The current section carries `aria-current="page"` (exact page) or `aria-current="true"` (an ancestor section, for example Work while on a case study). Below 400 px the nav wraps under the wordmark; there is no hamburger. |
| **Valance** (sticky) | Curtain toggle (left); status text (right) | On every page, at every width. It is the only sticky element. |
| **Case-study head** | "← Work" back link; discipline chips | Chips link to term pages. |
| **Pager** | "Next on the bill: <title>" | `.NextInSection`, wrapping to the first. Hidden when the site has one case study. |
| **Footer** | Contact block (compact); Browse links (`Work`, `Trapdoor`, `About`, RSS); scheme switch; colophon | The scheme switch is shown only with JavaScript. |
| **Skip link** | "Skip to content" | First focusable element; moves focus to `<main id="content" tabindex="-1">`. |

### 4.4 The Trapdoor section

Failures are surfaced in five places, each with a different amount of detail:

| Where | Variant | Shows |
|---|---|---|
| `/trapdoor/` | `row` | Ref, date, severity, title, what, cause, cost, changed, lesson chips, link to the related case study. |
| `/trapdoor/<slug>/` | `full` | Everything in `row`, plus the narrative body. |
| Case study, Performance mode | `strip` | One line: ref, title, severity, cost, link. Satisfies "a feature, not a footnote" without interrupting the result. |
| Case study, Backstage mode | `full` | The complete report after the last step, under a "Trapdoor" heading. |
| Home | `strip` | The most recent failure; only if `params.stage.trapdoor_on_home` is `true`. |

### 4.5 What each page shows in each mode

| Page | Performance mode | Backstage mode |
|---|---|---|
| Home, ≥ 960 px | Curtain down: drape covers the Backstage column. | Curtain up: Backstage faces visible beside every Performance face. Page chrome adopts the Backstage skin; the left column keeps the Performance skin. |
| Home, < 960 px | Each card shows its Performance face. | Each card shows its Backstage face. |
| Case study | Head, barcode, cover, result block, narrative, links, trapdoor strip. | Head, barcode, preface, step-through, full Trapdoor section. |
| Failures list, failure report, About, term pages, 404 | Performance skin. | Backstage skin. Content is identical in both modes. |

Switching mode on a page without a second layer changes the skin only. The preference still matters: it is remembered, so the next case study opens in the mode the visitor chose.

---

## 5. Page templates

### 5.0 Conventions

Wireframes are schematic: width is drawn at 100 columns for **1280 px** and 40 columns for **360 px**; height is not to scale. Pixel sizes are given in the annotations.

| Symbol | Meaning |
|---|---|
| `█` | Curtain fill (`--color-curtain`) |
| `▓` | Shadow-black fill (`--color-fg` used as a background) |
| `▒` | Drape (curtain fill with pleats) |
| `░` | Image or image placeholder |
| `▌▌▐▌▐` | Barcode graphic (decorative, `aria-hidden`) |
| `(●)` `( )` | Selected and unselected radio segment |
| `[ ]` | Button or link rendered as a button |
| `‹n›` | Annotation marker, explained in the table under the wireframe |

Grid: container `75rem` (1200 px) centred; page padding 1 rem (< 768), 1.5 rem (768 to 959), 2 rem (960 to 1279), 2.5 rem (≥ 1280). At 1280 px the content box is exactly 1200 px; at 360 px it is 328 px.

DOM order is reading order on every template: skip link → header → valance → `<main>` → footer.

### 5.1 Home (`layouts/home.html`)

DOM order inside `<main>`: intro → stage (`<h2>` with the count title, then one `<article>` per case study with the Performance face followed by the Backstage face) → trapdoor strip → Programme list (only when the site has at least `params.stage.programme_from` case studies).

#### Home, 1280 px, curtain closed (Performance mode)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ‹1› Tomás Reyes                                                         Work    Trapdoor    About│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│█ ‹2› (●) Performance   ( ) Backstage ████████████████████████ Performance view · 3 case studies █│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹3› Every result has                                             ‹4› HOW TO READ THIS PAGE       │
│     a backstage.                                                 ▌ Front of curtain = the result │
│     Backend systems and live-event                               ▌ Behind the curtain = how it   │
│     logistics. Two layers per project.                             was made                      │
├─────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│ ‹5› FRONT OF CURTAIN · RESULTS ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ‹6› BEHIND THE CURTAIN · PROCESS ██████████████│
│‹7› ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │ ‹8› DRAPE (closed) ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│    LEDGER CUTOVER  (slab, 48px)                 │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│    Month-end close: 3 h to 14 min.              │ Curtain down. Raise it with the ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│    14 min  reconciliation  (was 3 h 10)         │ toggle in the red bar above. ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│    ▌▌▐▌▐▐▌▐ | 14 wks | 4 ppl | Go +2 | −93%     │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│──────────────────────────────────────────────── │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│    FESTIVAL DOOR  (slab, 32px)                  │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│    ░░░░░░░░░░░░░░  Load-in: 3 h to 58 min       │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│    ▌▌▐▌▐▐▌▐ | 26 wks | 12 ppl | −69%            │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│──────────────────────────────────────────────── │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│    PICKUP POINT FINDER  (slab, 32px)            │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│    ░░░░░░░░░░░░░░  Support contacts −45%        │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│    ▌▌▐▌▐▐▌▐ | 11 wks | 3 ppl | −45%             │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
├─────────────────────────────────────────────────┴────────────────────────────────────────────────┤
│ ‹9› ///// TRAPDOOR  TD-001  The cohort that posted twice · minor · 3 h lost · Read the report →  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹10› FOOTER   Contact block · Browse: Work, Trapdoor, About · Scheme: (●)Auto ( )Light ( )Dark   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

| # | Element | Specification |
|---|---|---|
| 1 | Header | 64 px, static. Wordmark in the display face, 28 px. Nav links are 44 px tall hit areas with 24 px spacing. |
| 2 | Valance | Sticky, `top: 0`, 48 px, `--color-curtain`, `z-index: 40`. Toggle at the container's left edge (2 segments × 144 px). Status text at the right edge: "Performance view · 3 case studies", label face 13 px, `--color-on-curtain`. |
| 3 | Headline | `display-xl`, left-aligned, at most 8 of 12 columns (about 780 px). Lede below in body size, 52 ch maximum. Not centred. |
| 4 | Key | Right 4 columns. Two lines with swatches (cream and cardboard) explaining the split. Hidden below 960 px; replaced there by one line under the lede. |
| 5 | Left column header | 48 px band, `--color-fg` background, `--color-bg` text, label face: "FRONT OF CURTAIN · RESULTS". |
| 6 | Pelmet | 48 px band, `--color-curtain`, `--color-on-curtain` text, label face: "BEHIND THE CURTAIN · PROCESS". Always visible; the drape hangs from it. |
| 7 | Performance face | Cover image 16:9 (headliner row: 568 × 320 px, other rows: 200 × 112 px beside the text), title in slab type (headliner 48 px, others 32 px; 28 px at 360 px), result sentence, one `metric` (the first of `result.metrics`), compact barcode strip. The title link is stretched over the cell (`::after`), so the whole cell is one target. Row height follows content: headliner about 560 px, others about 300 px. |
| 8 | Drape | Spans the Backstage column below the pelmet; `aria-hidden`; curtain fill, pleat lines every 56 px (`rgba(0,0,0,.14)`, 2 px), a 12 px `--color-curtain-hem` band at the bottom. Text: "Curtain down. Raise it with the toggle in the red bar above." Clicking the drape toggles Backstage (mouse convenience; the real control is the toggle). |
| 9 | Trapdoor strip | Full width, 8 px diagonal hazard stripe on the top edge (`repeating-linear-gradient(135deg, var(--color-fg) 0 8px, transparent 8px 16px)`), then one line: ref, title, severity text, cost, "Read the report". |
| 10 | Footer | Three columns: contact block (compact), Browse links, scheme switch and colophon. |

#### Home, 1280 px, curtain raised (Backstage mode)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ‹1› Tomás Reyes                                                         Work    Trapdoor    About│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│█ ‹2› ( ) Performance   (●) Backstage ██████████████████████████ Backstage view · curtain raised █│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹3› Header, valance and intro now use the BACKSTAGE skin (cardboard, mono).                      │
│     The left column stays pinned to the PERFORMANCE skin.                                        │
├─────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│ ‹5› FRONT OF CURTAIN · RESULTS ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ‹6› BEHIND THE CURTAIN · PROCESS ██████████████│
│                                                 │ ‹8› ▒▒▒▒▒▒▒▒▒▒▒▒ drape rolled up (hem) ▒▒▒▒▒▒▒ │
│‹7› ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │PRS-2025-003                                    │
│    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │PROBLEM                                         │
│    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │A nightly batch was the only source             │
│    LEDGER CUTOVER  (slab, 48px)                 │of truth and paid twice 11x a quarter.          │
│    Month-end close: 3 h to 14 min.              │TURNING POINT                                   │
│    14 min  reconciliation  (was 3 h 10)         │A shadow ledger ran beside the batch            │
│    ▌▌▐▌▐▐▌▐ | 14 wks | 4 ppl | Go +2 | −93%     │for six weeks before it could disagree.         │
│                                                 │6 steps · 3 constraints · 3 rejected            │
│                                                 │[1][2][3][4][5][6] [TRAPDOOR 1] ‹9›             │
│                                                 │[ Open backstage → ]                            │
│──────────────────────────────────────────────── │─────────────────────────────────────────────── │
│    FESTIVAL DOOR  (slab, 32px)                  │PRS-2025-002   PROBLEM  ...                     │
│    ░░░░░░░░░░░░░░  Load-in: 3 h to 58 min       │6 steps · 4 constraints · 2 rejected            │
│    ▌▌▐▌▐▐▌▐ | 26 wks | 12 ppl | −69%            │[1][2][3][4][5][6]                              │
│──────────────────────────────────────────────── │─────────────────────────────────────────────── │
│    PICKUP POINT FINDER  (slab, 32px)            │PRS-2025-001   PROBLEM  ...                     │
│    ░░░░░░░░░░░░░░  Support contacts −45%        │Walkthrough on request. [ Ask → ]               │
│    ▌▌▐▌▐▐▌▐ | 11 wks | 3 ppl | −45%             │                                                │
├─────────────────────────────────────────────────┴────────────────────────────────────────────────┤
│ ‹10› ///// TRAPDOOR strip, then FOOTER                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

| # | Element | Specification |
|---|---|---|
| 1–2 | Header, valance | Unchanged in structure. The status text reads "Backstage view · curtain raised". |
| 3 | Page chrome | The `<html>` has `data-mode="backstage"`: intro region, header and footer use the Backstage tokens. |
| 5, 7 | Left column | Re-scoped with `data-mode="performance"`: keeps the cream/slab skin, so the split stays visible in both modes. |
| 6 | Pelmet | Unchanged. |
| 8 | Drape | Translated to `translateY(-100%)` behind the pelmet. Only the 12 px hem remains visible directly under the pelmet. |
| 9 | Backstage face | `ref`, label "PROBLEM" + `brief`, label "TURNING POINT" + `backstage.teaser`, counts line ("6 steps · 3 constraints · 3 rejected options"), six step ticks (32 px squares labelled 1 to 6, each linking to `/work/<slug>/#step-n`), and a "Open backstage" link to `/work/<slug>/#backstage`. A case study with failures shows a `TRAPDOOR n` chip linking to `#trapdoor`. A Performance-only case study shows its `brief` and "Walkthrough on request." with a mailto link (9.4). |
| 10 | Strip, footer | Unchanged. |

#### Home, 360 px, curtain closed (Performance mode)

```text
┌──────────────────────────────────────┐
│ ‹1› Tomás Reyes                      │
│ Work    Trapdoor    About            │
├──────────────────────────────────────┤
│█ ‹2› (●) Performance ( ) Backstage ██│
├──────────────────────────────────────┤
│ ‹3› Every result                     │
│     has a                            │
│     backstage.                       │
│ Backend systems and live-event       │
│ logistics. Two layers per project.   │
│ ‹4› ▌Front = result ▌Behind = process│
├──────────────────────────────────────┤
│ ‹5› TRIPLE BILL                      │
│█ ‹6› FRONT OF CURTAIN ███████████████│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│ LEDGER CUTOVER   (slab, 32px)        │
│ Month-end close: three hours to      │
│ fourteen minutes.                    │
│ 14 min  reconciliation               │
│ ▌▌▐▌▐▐▌▐▌▐   PRS-2025-003            │
│ 14 weeks · 4 people · Go +2          │
│ −93% reconciliation time             │
│ [ Read the case study → ]            │
├──────────────────────────────────────┤
│█ FRONT OF CURTAIN ███████████████████│
│ ‹7› card 2: image, title, metric,    │
│ barcode (shorter, no 72px type)      │
├──────────────────────────────────────┤
│ card 3: same, Performance-only       │
├──────────────────────────────────────┤
│ ‹8› ///// TRAPDOOR  TD-001           │
│ The cohort that posted twice         │
│ minor · 3 h lost    Read →           │
├──────────────────────────────────────┤
│ ‹9› Contact block (compact)          │
│ Browse · Scheme (●)Auto ( )L ( )D    │
└──────────────────────────────────────┘
```

| # | Element | Specification |
|---|---|---|
| 1 | Header | Wordmark on the first line; nav on the second (44 px targets). |
| 2 | Valance | Sticky, 48 px. Toggle segments 148 px wide each; the status text is dropped at this width. |
| 3 | Headline | `display-xl` at its minimum, 40 px. |
| 4 | Key | One line replacing the two-line legend. |
| 5 | Stage title | `h2` from the case-study count ("Triple bill"). |
| 6 | Card pelmet | Every card starts with a 40 px curtain-fill bar: "FRONT OF CURTAIN" in this mode, "BEHIND THE CURTAIN" in the other. This is the 360 px answer to the split stage (9.6). |
| 7 | Other cards | Same structure, scaled down. Every card uses a 16:9 cover crop. |
| 8 | Trapdoor strip | Stacked on three lines. |
| 9 | Footer | Single column. |

#### Home, 360 px, curtain raised (Backstage mode)

```text
┌──────────────────────────────────────┐
│ ‹1› Tomás Reyes                      │
│ Work    Trapdoor    About            │
├──────────────────────────────────────┤
│█ ‹2› ( ) Performance (●) Backstage ██│
├──────────────────────────────────────┤
│ ‹3› Intro, now in BACKSTAGE skin     │
│ (cardboard, monospace)               │
├──────────────────────────────────────┤
│ TRIPLE BILL                          │
│█ ‹4› BEHIND THE CURTAIN █████████████│
│ PRS-2025-003   LEDGER CUTOVER        │
│ PROBLEM                              │
│ A nightly batch was the only         │
│ source of truth and paid twice       │
│ 11 times a quarter.                  │
│ TURNING POINT                        │
│ A shadow ledger ran beside the       │
│ batch for six weeks before it        │
│ was allowed to disagree.             │
│ 6 steps · 3 constraints              │
│ 3 rejected options                   │
│ ‹5› [1][2][3][4][5][6]               │
│ [ TRAPDOOR 1 ] chip → #trapdoor      │
│ [ Open backstage → ]                 │
├──────────────────────────────────────┤
│█ BEHIND THE CURTAIN █████████████████│
│ card 2: same face, shorter           │
├──────────────────────────────────────┤
│ card 3: brief + ‹6›                  │
│ 'Walkthrough on request.'            │
│ [ Ask for it → ]                     │
├──────────────────────────────────────┤
│ Trapdoor strip, contact, footer      │
└──────────────────────────────────────┘
```

| # | Element | Specification |
|---|---|---|
| 2 | Valance | "Backstage" segment selected. |
| 3 | Intro | Backstage skin. |
| 4 | Card pelmet | "BEHIND THE CURTAIN". The card now shows only its Backstage face; the Performance face is `display: none` (not just hidden), so it leaves the tab order and the accessibility tree. |
| 5 | Step ticks | Six 44 px targets wrap onto two rows when they do not fit; each links to `/work/<slug>/#step-n`. |
| 6 | Performance-only card | Brief, "Walkthrough on request.", mailto link. |

### 5.2 Case study, Performance mode (`layouts/work/page.html`)

DOM order inside `<main>`: back link → head (chips, H1, summary, meta line) → barcode strip → **Performance layer** (`<section aria-label="Performance">`: cover, result block, narrative) → **Backstage layer** (`<section aria-label="Backstage">`) → **Trapdoor** (`<section aria-label="Trapdoor">`, plus the `strip` variant inside the Performance layer) → pager → contact block. In Performance mode the Backstage layer and the full Trapdoor section are `display: none`.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ‹1› Tomás Reyes                                                         Work    Trapdoor    About│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│█ ‹2› (●) Performance   ( ) Backstage █████████████████████████████████████████ Performance view █│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹3› ← Work                                                                                       │
│ ‹4› BACKEND        Meridian Freight · Lead backend engineer · 2025                               │
│ ‹5› LEDGER CUTOVER                           (slab, 72px, 2 lines max)                           │
│ Month-end reconciliation fell from 3 h 10 min to 14 min, with no downtime.                       │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹6› ▌▌▐▌▐▐▌▐▌▌▐▌▐▐▌▐▌  |  14 weeks  |  4 people  |  Go · PostgreSQL · +1  |  −93% reconciliation │
│     PRS-2025-003                                                                                 │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹7› ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │
│     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ cover, 1200×630 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹8› Month-end close went from three                        ‹9› 14 min   Month-end reconciliation │
│     hours to fourteen minutes, and                                   Was 3 h 10 min.             │
│     nobody was paid twice. (display-l)                     0        Duplicate payments / quarter │
│                                                            2.4 s    Posting delay, p95           │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹10› ## The brief                                          ‹11› margin: links                    │
│     Body text, 66ch measure, Libre Franklin 18px           Engineering write-up (PDF) →          │
│     ...stepref → ‘How the cutover ran’ (Backstage)         How this was measured → step 6        │
│ ‹12› ░░░░ #wide figure, full container ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹13› ///// TRAPDOOR  TD-001  The cohort that posted twice (related failure strip)  Read →        │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹14› NEXT ON THE BILL  →  Festival Door                                                          │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹15› Contact block (cta variant): ‘Want the walkthrough? Backstage is one toggle away.’          │
│ ‹16› FOOTER                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

| # | Element | Specification |
|---|---|---|
| 3 | Back link | "← Work", 44 px target, label face. |
| 4 | Chips and meta | Discipline chips (links), then "client · role · year" in the label face. |
| 5 | H1 | `display-xl` (slab), up to two lines; summary below in body-large. |
| 6 | Barcode strip | Full width; 4 cells separated by barcode bars; ref under the bars (component 7.6). |
| 7 | Cover | `Fill` crop 1200 × 630, `fetchpriority="high"`, no lazy loading; `alt` from `cover.alt`. |
| 8 | Result headline | `display-l`, 7 of 12 columns. |
| 9 | Metrics | 5 of 12 columns, stacked `metric` blocks (size `xl` for the first, `l` for the rest). |
| 10 | Narrative | Markdown body. Measure 66 ch. Headings are H2. |
| 11 | Margin links | `links` and "How this was measured → step n" (visible only if a `result` step exists). |
| 12 | Wide figure | `#wide` figures span all 12 columns; default figures sit in the measure. |
| 13 | Trapdoor strip | Present only if a failure has `case` equal to this bundle. |
| 14 | Pager | "Next on the bill". |
| 15 | Contact block, `cta` variant | Heading "Want the walkthrough?" and a sentence pointing at the toggle. |

```text
┌──────────────────────────────────────┐
│ ‹1› Tomás Reyes                      │
│ Work    Trapdoor    About            │
├──────────────────────────────────────┤
│█ ‹2› (●) Performance ( ) Backstage ██│
├──────────────────────────────────────┤
│ ← Work                               │
│ BACKEND · 2025                       │
│ LEDGER CUTOVER (slab, 32px)          │
│ Month-end reconciliation fell        │
│ from 3 h 10 min to 14 min.           │
├──────────────────────────────────────┤
│ ‹3› ▌▌▐▌▐▐▌▐▌▐▌▐  PRS-2025-003       │
│ DURATION   14 weeks                  │
│ TEAM       4 people                  │
│ STACK      Go · PostgreSQL · +1      │
│ OUTCOME    −93% reconciliation       │
├──────────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│ ░░░░░ cover 16:9 ░░░░░░░░░░░░░░░░░░  │
├──────────────────────────────────────┤
│ ‹4› Month-end close went from        │
│ three hours to fourteen minutes.     │
│ 14 min  Month-end reconciliation     │
│ 0       Duplicate payments           │
│ 2.4 s   Posting delay, p95           │
├──────────────────────────────────────┤
│ ‹5› ## The brief                     │
│ Body text, full width, 18px          │
│ ░░░░░░ figure, full width ░░░░░░░░   │
│ Links, ‘How this was measured →’     │
├──────────────────────────────────────┤
│ ///// TRAPDOOR  TD-001               │
│ The cohort that posted twice         │
├──────────────────────────────────────┤
│ NEXT ON THE BILL → Festival Door     │
│ Contact block (cta) · Footer         │
└──────────────────────────────────────┘
```

| # | Element | Specification |
|---|---|---|
| 3 | Barcode strip | Becomes a vertical label: bars on top (full width), then four label/value rows. |
| 4 | Result | Headline over stacked metrics, all full width. |
| 5 | Narrative | Full width, 18 px body. Figures full width. |

### 5.3 Case study, Backstage mode

Same document; the Performance layer is `display: none`, the head and barcode remain, and the Backstage layer and full Trapdoor section are shown.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ‹1› Tomás Reyes                                                         Work    Trapdoor    About│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│█ ‹2› ( ) Performance   (●) Backstage ████████████████████ Backstage view · 6 steps · 1 trapdoor █│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹3› ← Work    BACKEND    LEDGER CUTOVER   (mono 700, 44px)                                       │
│ ‹4› ▌▌▐▌▐▐▌▐▌▌▐▌▐▐▌▐▌  |  14 weeks  |  4 people  |  Go · PostgreSQL · +1  |  −93% reconciliation │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹5› Preface (≤ 80 words): ‘Written from my notes and the pull-request history...’                │
│ ‹6› [ Show all steps ]  (aria-pressed)                          Backstage updated 2025-12-02     │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹7› [01] PRB  The nightly batch was the single source of truth        ▸ gist ...     (collapsed) │
│     [02] CON  Four limits that were not negotiable                  ▸ gist ...     (collapsed)   │
│     [03] HYP  Three ways the numbers could be wrong                 ▸ gist ...     (collapsed)   │
│     [04] REJ  Three things I did not build                          ▸ gist ...     (collapsed)   │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹8› [05] IMP  A shadow ledger, then a cohort-by-cohort cutover           ▾ (expanded)            │
│     Weeks 5–11                                                                                   │
│      ‹9› DECISION LEDGER:  decision ........ because ...........................                 │
│     Body text (mono 16px, 72ch)...                                                               │
│      ‹10› BEFORE: nested loop (SQL)         │  AFTER: set-based match (SQL)                      │
│           ┌───────────────────────────┐     │  ┌───────────────────────────┐                     │
│           │ - SELECT ... loop         │     │  │ + SELECT ... join         │                     │
│           └───────────────────────────┘     │  └───────────────────────────┘                     │
│      ‹11› BEFORE: dashboard.png             │  AFTER: dashboard.png   (side by side ≥ 40rem)     │
│     [ ← Step 4: Rejected options ]                    [ Step 6: Measured result → ]              │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│     [06] RES  What the close looks like now                          ▸ gist ...     (collapsed)  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹12› ///// TRAPDOOR TD-001  The cohort that posted twice (full: what/cause/cost/changed)         │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹13› Contact block (cta)  ·  NEXT ON THE BILL  ·  FOOTER                                         │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

| # | Element | Specification |
|---|---|---|
| 3 | Head | Back link, chips, H1 in the Backstage display face (Plex Mono 700, 44 px). |
| 4 | Barcode strip | Unchanged: it ties the two layers together. |
| 5 | Preface | From `backstage.md` body. |
| 6 | Step controls | "Show all steps" (`aria-pressed`); "Backstage updated" date. |
| 7 | Collapsed step | Header only: number, kind code, title, gist, chevron. 64 px tall, full-width button. |
| 8 | Expanded step | One step open at a time unless "Show all steps" is on. Header stays; body below. |
| 9 | Kind block | The structured block for the step's `kind` (here the decision ledger). |
| 10 | Code comparison | `ba-code`: two panes side by side when the container is at least 40 rem wide. |
| 11 | Image comparison | `ba-image`: same rule. |
| 12 | Trapdoor | Full section, after the last step. |
| 13 | Closing | Contact block (`cta`), pager, footer. |

```text
┌──────────────────────────────────────┐
│ ‹1› Tomás Reyes                      │
│ Work    Trapdoor    About            │
├──────────────────────────────────────┤
│█ ‹2› ( ) Performance (●) Backstage ██│
├──────────────────────────────────────┤
│ ← Work   BACKEND                     │
│ LEDGER CUTOVER (mono 700, 28px)      │
│ ‹3› ▌▌▐▌▐▐▌▐▌▐▌▐  PRS-2025-003       │
│ DURATION   14 weeks                  │
│ TEAM       4 people                  │
│ STACK      Go · PostgreSQL · +1      │
│ OUTCOME    −93% reconciliation       │
├──────────────────────────────────────┤
│ Preface                              │
│ ‹4› [ Show all steps ]               │
├──────────────────────────────────────┤
│ [01] PRB The nightly batch      ▸    │
│ [02] CON Four limits             ▸   │
│ [03] HYP Three ways to be wrong  ▸   │
│ [04] REJ Three things not built  ▸   │
├──────────────────────────────────────┤
│ ‹5› [05] IMP Shadow ledger       ▾   │
│ Weeks 5–11                           │
│ Body text, mono 16px, full width     │
│ ‹6› BEFORE (stacked)                 │
│ ┌──────────────────────────────┐     │
│ │ - SELECT ... loop            │ →   │
│ └──────────────────────────────┘     │
│               ↓ then                 │
│ AFTER                                │
│ ┌──────────────────────────────┐     │
│ │ + SELECT ... join            │ →   │
│ └──────────────────────────────┘     │
│ [ ← Step 4 ]        [ Step 6 → ]     │
├──────────────────────────────────────┤
│ [06] RES What the close is now ▸     │
├──────────────────────────────────────┤
│ ///// TRAPDOOR  TD-001 (full)        │
│ Contact (cta) · Next · Footer        │
└──────────────────────────────────────┘
```

| # | Element | Specification |
|---|---|---|
| 3 | Barcode strip | Vertical label variant, as in Performance. |
| 4 | Show all steps | Full-width 44 px button. |
| 5 | Expanded step | Same structure, single column. |
| 6 | Comparison | Before above After, joined by a "then ↓" connector; code blocks scroll horizontally inside their own region. |

### 5.4 Failures list (`layouts/trapdoor/section.html`)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ‹1› Tomás Reyes                                                         Work    Trapdoor    About│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│█ ‹2› (●) Performance   ( ) Backstage █████████████████████████████████████████ Performance view █│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹3› TRAPDOOR  (display-xl)                                                                       │
│ ‹4› Things that went wrong, filed with what they cost and what changed. (lede, 2 lines)          │
│ ‹5› Lessons:  idempotency (1) · dry-runs (1)                                                     │
├──────────────────────────────┬───────────────────────────────────────────────────────────────────┤
│‹6› TD-001 · 2025-10-03       │‹7› The cohort that posted twice                                   │
│MINOR  ■□□                    │WHAT   Cohort 3 posted 212 lines twice for 9 minutes.              │
│Ledger Cutover →              │CAUSE  A consumer replayed an offset after a rebalance.            │
│                              │COST   3 h of cleanup; no money moved.                             │
│                              │CHANGED Idempotency key on every posting; replay drill.            │
│                              │[idempotency] [dry-runs]       Read the report →                   │
├──────────────────────────────┴───────────────────────────────────────────────────────────────────┤
│ ‹8› Empty state (no entries): ‘Nothing filed yet.’ + explanation, 1 link to Work                 │
│ ‹9› Contact block · FOOTER                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

| # | Element | Specification |
|---|---|---|
| 3–4 | Title and lede | `display-xl` "Trapdoor"; lede from `content/trapdoor/_index.md`, 2 lines. |
| 5 | Lessons filter | Links to `/lessons/<term>/` with counts. These are navigation links, not a JavaScript filter. |
| 6 | Meta column | 30 columns wide: ref, date, severity (text + squares), related case study link. |
| 7 | Report column | Title, then what / cause / cost / changed as a label–value list, lesson chips, "Read the report". |
| 8 | Empty state | If the section has no entries: "Nothing filed yet." plus one sentence: "Failures are listed here as they are written up." and a link to Work. |

```text
┌──────────────────────────────────────┐
│ ‹1› Tomás Reyes                      │
│ Work    Trapdoor    About            │
├──────────────────────────────────────┤
│█ ‹2› (●) Performance ( ) Backstage ██│
├──────────────────────────────────────┤
│ ‹3› TRAPDOOR (display-xl, 40px)      │
│ ‹4› Things that went wrong,          │
│ filed with cost and change.          │
│ ‹5› Lessons: idempotency (1)         │
│ dry-runs (1)                         │
├──────────────────────────────────────┤
│ ‹6› TD-001 · 2025-10-03              │
│ MINOR ■□□ · Ledger Cutover           │
│ The cohort that posted twice         │
│ WHAT   212 lines posted twice.       │
│ CAUSE  Offset replayed on rebalance. │
│ COST   3 h cleanup; no money moved.  │
│ CHANGED Idempotency key per posting. │
│ [idempotency] [dry-runs]             │
│ [ Read the report → ]                │
├──────────────────────────────────────┤
│ Contact block · Footer               │
└──────────────────────────────────────┘
```

### 5.5 About (`layouts/about/page.html`)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ‹1› Tomás Reyes                                                         Work    Trapdoor    About│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│█ ‹2› (●) Performance   ( ) Backstage █████████████████████████████████████████ Performance view █│
├─────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│‹3› I am called in when a system is              │‹5› METHOD                                      │
│correct on paper and wrong on                    │01  Start from the failure                      │
│the day.   (display-xl)                          │    I write down how it hurts first.            │
│‹4› Tomás Reyes · Ghent · [portrait 96px]        │02  Keep the rejected options                   │
│Backend engineer and production lead             │    A decision is only as good as the           │
│                                                 │    alternatives it beat.                       │
│                                                 │03  Measure with the customer's data            │
├─────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│‹6› CALLED IN FOR                                │‹7› CONTACT BLOCK (full)                        │
│· Cutovers that cannot have downtime             │hello@prestige-demo.example.org                 │
│· Events where the schedule is the product       │[ Copy address ]   Booking from March 2027      │
│· Flows that generate support tickets            │Code · Write-ups                                │
├─────────────────────────────────────────────────┴────────────────────────────────────────────────┤
│ ‹8› Optional body markdown (measure width) · FOOTER                                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

| # | Element | Specification |
|---|---|---|
| 3 | Statement | `lede` front matter in `display-xl`, left column. |
| 4 | Byline | Name, location, role. Optional portrait, 96 × 96 px, only here. |
| 5 | Method | `method` list: numbered, label + one sentence. No ratings, no bars, no icons. |
| 6 | Called in for | `called_in_for` list, plain bullets. |
| 7 | Contact block | `full` variant. |
| 8 | Body | Optional markdown from `about.md`, measure width. |

```text
┌──────────────────────────────────────┐
│ ‹1› Tomás Reyes                      │
│ Work    Trapdoor    About            │
├──────────────────────────────────────┤
│█ ‹2› (●) Performance ( ) Backstage ██│
├──────────────────────────────────────┤
│ ‹3› I am called in when a            │
│ system is correct on paper           │
│ and wrong on the day.                │
│ ‹4› [portrait 96px] Tomás Reyes      │
│ Ghent · Backend engineer and         │
│ production lead                      │
├──────────────────────────────────────┤
│ ‹5› METHOD                           │
│ 01 Start from the failure            │
│ 02 Keep the rejected options         │
│ 03 Measure with their data           │
├──────────────────────────────────────┤
│ ‹6› CALLED IN FOR                    │
│ · Cutovers with no downtime          │
│ · Events: schedule is the product    │
│ · Flows that cause tickets           │
├──────────────────────────────────────┤
│ ‹7› Contact block (full)             │
│ [ Copy address ]                     │
│ Footer                               │
└──────────────────────────────────────┘
```

### 5.6 Taxonomy term (`layouts/term.html`) and Programme (`layouts/work/section.html`)

`/work/` uses the same layout as a term page: a title ("Programme"), the discipline links, and one Programme row per case study. A term page for `lessons` lists failure rows instead.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ‹1› Tomás Reyes                                                         Work    Trapdoor    About│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│█ ‹2› (●) Performance   ( ) Backstage █████████████████████████████████████████ Performance view █│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹3› DISCIPLINE                                                                                   │
│ ‹4› BACKEND  (display-xl)                                  ‹5› 1 case study · 1 trapdoor         │
│ ‹6› All disciplines:  backend · events-logistics · product-design                                │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹7› PROGRAMME ROW:  ▌▌▐▌▐▐▌▐  PRS-2025-003  LEDGER CUTOVER  (slab 28px)                          │
│     Month-end reconciliation fell from 3 h 10 min to 14 min.          14 weeks · 4 people · −93% │
│     BACKEND · Go · PostgreSQL · Kafka                                  6 steps · 1 trapdoor     →│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹8› Related trapdoor entries (failure-entry, row variant) for these case studies                 │
│     TD-001 · MINOR ■□□ · The cohort that posted twice                                            │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹9› ← All disciplines (taxonomy index)          Pager (only if > 12 rows)                        │
│ FOOTER                                                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

| # | Element | Specification |
|---|---|---|
| 3–4 | Title | Taxonomy name in the label face, term in `display-xl`. |
| 5 | Counts | "n case studies · n trapdoors". |
| 6 | Sibling terms | Links to the other terms of this taxonomy. |
| 7 | Programme row | Barcode graphic, ref, title (slab 28 px), summary, meta, counts, chevron. Whole row is one link. Rows are unequal in height only because summaries differ. |
| 8 | Related failures | `failure-entry` row variant, for failures whose `case` is one of the listed case studies. |
| 9 | Pager | Hugo pagination at 12 items per page (`pagination.pagerSize = 12`). |

```text
┌──────────────────────────────────────┐
│ ‹1› Tomás Reyes                      │
│ Work    Trapdoor    About            │
├──────────────────────────────────────┤
│█ ‹2› (●) Performance ( ) Backstage ██│
├──────────────────────────────────────┤
│ ‹3› DISCIPLINE                       │
│ ‹4› BACKEND (display-xl, 40px)       │
│ ‹5› 1 case study · 1 trapdoor        │
│ ‹6› backend · events-logistics ·     │
│ product-design   (wrap)              │
├──────────────────────────────────────┤
│ ‹7› ▌▌▐▌▐▐▌▐  PRS-2025-003           │
│ LEDGER CUTOVER (slab 28px)           │
│ Reconciliation 3 h 10 → 14 min.      │
│ 14 weeks · 4 people · −93%           │
│ BACKEND · Go · PostgreSQL · +1       │
│ 6 steps · 1 trapdoor        →        │
├──────────────────────────────────────┤
│ ‹8› TD-001 · MINOR ■□□               │
│ The cohort that posted twice         │
├──────────────────────────────────────┤
│ ‹9› ← All disciplines · Footer       │
└──────────────────────────────────────┘
```

### 5.7 404 (`layouts/404.html`)

The 404 is a failure report about the address, so the error page uses the same component as every other failure.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ‹1› Tomás Reyes                                                         Work    Trapdoor    About│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│█ ‹2› (●) Performance   ( ) Backstage █████████████████████████████████████████ Performance view █│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹3› ///// TRAPDOOR  TD-404   MINOR ■□□   (failure-entry, full variant)                           │
│ ‹4› This page is not on the bill.   (display-xl)                                                 │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹5› WHAT    You asked for an address that does not exist on this site.                           │
│     CAUSE   A mistyped link, or a page that moved when a case study was renamed.                 │
│     COST    About ten seconds.                                                                   │
│     CHANGED Here is where to go instead:                                                         │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ‹6› [ Home: the stage → ]     [ Work: all case studies → ]     [ Trapdoor: failures → ]          │
│ ‹7› Latest case study:  Ledger Cutover — Month-end reconciliation fell from 3 h 10 min to 14 min.│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

| # | Element | Specification |
|---|---|---|
| 3 | Ref | `TD-404`, severity MINOR ■□□. |
| 4 | Heading | "This page is not on the bill." |
| 5 | Report | WHAT, CAUSE, COST, CHANGED as fixed copy from `i18n/en.toml`. |
| 6 | Exits | Three buttons: Home, Work, Trapdoor (Trapdoor omitted if there are no failures). |
| 7 | Latest | The newest case study's title and summary as a link. |

```text
┌──────────────────────────────────────┐
│ ‹1› Tomás Reyes                      │
│ Work    Trapdoor    About            │
├──────────────────────────────────────┤
│█ ‹2› (●) Performance ( ) Backstage ██│
├──────────────────────────────────────┤
│ ‹3› ///// TRAPDOOR  TD-404           │
│ ‹4› This page is not on the          │
│ bill. (display-xl, 40px)             │
│ ‹5› WHAT    Address not found.       │
│ CAUSE   Mistyped or moved link.      │
│ COST    About ten seconds.           │
│ CHANGED Go here instead:             │
│ ‹6› [ Home: the stage → ]            │
│ [ Work: all case studies → ]         │
│ [ Trapdoor: failures → ]             │
│ ‹7› Latest: Ledger Cutover           │
├──────────────────────────────────────┤
│ Footer                               │
└──────────────────────────────────────┘
```

---

## 6. Design tokens

### 6.1 Two independent axes

Appearance is the product of two attributes on `<html>`, and a third scope on individual elements:

| Axis | Attribute | Values | Set by | Default |
|---|---|---|---|---|
| **Mode** (which layer) | `data-mode` | `performance`, `backstage` | Visitor's toggle, then `localStorage["prestige.mode"]`; fallback `params.stage.default_mode` | `performance` |
| **Scheme** (light or dark) | `data-scheme` | `light`, `dark` (absent = follow the operating system) | Footer switch, then `localStorage["prestige.scheme"]` | absent |
| **Scope** | `data-mode` on any element | same as mode | Markup | Re-applies a mode's tokens to that element's subtree: the homepage columns, and the Backstage and Trapdoor layer sections |

Mode changes **content skin**: surface material, typefaces, density, border style. Scheme changes **luminance** only. The four resulting palettes:

| Palette | Mode · Scheme | What it looks like | Seen when |
|---|---|---|---|
| **Playbill** | Performance · Light | Cream paper, shadow-black ink, curtain-red accent, slab headlines | Default for daytime visitors |
| **House Dark** | Performance · Dark | Shadow-black stage, warm off-white ink, lit-red accent | OS in dark mode, Performance mode |
| **Cardboard Day** | Backstage · Light | Corrugated-board brown ground, label-white panels, monospace | Backstage mode, OS in light mode |
| **Cardboard Night** | Backstage · Dark | Dark-brown ground, mono type, lit-red accent | Backstage mode, OS in dark mode |

Backstage is **not** dark mode (decision and reasoning in 9.8).

Without JavaScript, `data-mode` is absent on `<html>`, so the Performance palette applies; the Backstage and Trapdoor layer sections carry their own `data-mode="backstage"` in the markup, so they still render in the Backstage palette (9.2).

### 6.2 Colour

Hex values per palette. Every token has a role; no component may use a raw hex value.

| Semantic token | CSS variable | Role | Performance · Light | Performance · Dark | Backstage · Light | Backstage · Dark |
|---|---|---|---|---|---|---|
| `bg` | `--color-bg` | Page background | `#F5EEE2` | `#14100D` | `#D9C4A3` | `#231A13` |
| `surface` | `--color-surface` | Raised surface (cards, labels, step panels) | `#FFFBF3` | `#211A16` | `#F4ECDD` | `#2E231A` |
| `sunken` | `--color-sunken` | Sunken surface (code, inputs, image wells) | `#EADFCB` | `#0C0907` | `#C9B08A` | `#1A120D` |
| `fg` | `--color-fg` | Primary text and strong borders | `#14100D` | `#F5EEE2` | `#1E140C` | `#EBDDC6` |
| `fgm` | `--color-fg-muted` | Secondary text (captions, metadata) | `#4F4338` | `#C9B9A3` | `#43341F` | `#BBA98E` |
| `accent` | `--color-accent` | Accent for text, links, icons | `#8E1B26` | `#F28B92` | `#7A1520` | `#F59A95` |
| `accentfill` | `--color-curtain` | Curtain fill: valance, drape, selected states | `#8E1B26` | `#C0303F` | `#7A1520` | `#C0303F` |
| `onaccent` | `--color-on-curtain` | Text and icons on curtain fill | `#FFF7EC` | `#FFF7EC` | `#FFF7EC` | `#FFF7EC` |
| `line` | `--color-line` | Control edges, card borders (3:1 UI contrast) | `#14100D` | `#F5EEE2` | `#1E140C` | `#D9C4A3` |
| `linesoft` | `--color-line-soft` | Decorative dividers only (exempt from contrast) | `#CDBFA8` | `#4A3C33` | `#A98F68` | `#5B4837` |
| `focus` | `--color-focus` | Focus ring on page and raised surfaces | `#14100D` | `#F5EEE2` | `#1E140C` | `#EBDDC6` |
| `focusacc` | `--color-focus-on-curtain` | Focus ring on curtain fill | `#FFF7EC` | `#FFF7EC` | `#FFF7EC` | `#FFF7EC` |
| `alert` | `--color-error` | Error text and error icon | `#A3121C` | `#FF9C9C` | `#8F0F18` | `#FFA8A0` |
| `alertbg` | `--color-error-bg` | Error panel tint | `#FBE3DF` | `#3A1517` | `#F4D9D1` | `#40191A` |
| `addbg` | `--color-diff-add` | Code diff: added line | `#FFFBF3` | `#2C241E` | `#F4ECDD` | `#3A2E24` |
| `delbg` | `--color-diff-remove` | Code diff: removed line | `#F6D9D4` | `#3A1A1A` | `#E7BFB2` | `#43201C` |
| `syn_kw` | `--syn-keyword` | Syntax: keyword | `#8E1B26` | `#F28B92` | `#7A1520` | `#F59A95` |
| `syn_str` | `--syn-string` | Syntax: string | `#5C4300` | `#E3C16F` | `#4E3A00` | `#E6C679` |
| `syn_com` | `--syn-comment` | Syntax: comment | `#5E5246` | `#A8987F` | `#4A3F31` | `#A89880` |
| `syn_num` | `--syn-number` | Syntax: number | `#1F5C73` | `#7CC4DC` | `#0F4559` | `#85C8DD` |
| `syn_fn` | `--syn-function` | Syntax: function and name | `#4B2E83` | `#C3A9F0` | `#432878` | `#C7AEF2` |
| `hem` | `--color-curtain-hem` | Drape hem band (decorative) | `#5E0F18` | `#8E1B26` | `#4D0C14` | `#8E1B26` |
| `shadow` | `--color-shadow` | Hard offset shadow colour (decorative) | `#14100D` | `#8E1B26` | `#1E140C` | `#000000` |

**Pairing rules**

| Token | May be used as text on | Never |
|---|---|---|
| `fg` | `bg`, `surface`, `sunken`, `error-bg`, `diff-add`, `diff-remove` | on `curtain` |
| `fg-muted` | `bg`, `surface`, `sunken` | on `curtain`; below 15 px |
| `accent` | `bg`, `surface`, `sunken` | on `curtain` (same hue) |
| `on-curtain` | `curtain`, `curtain-hem` | on any page surface |
| `error` | `bg`, `error-bg` | as decoration |
| `line` | n/a: borders, control edges, dividers that carry meaning | as text |
| `line-soft` | n/a: decorative hairlines only | as the only boundary of a control |

**Contrast ratios.** Computed from the hex values above with the WCAG 2.2 relative-luminance formula. Text pairs must reach 4.5:1 (all text in Prestige is normal-size or larger, so the stricter threshold is used throughout); control edges, focus rings and the curtain fill must reach 3:1. All 112 results pass.

| # | Pair (foreground on background) | Required | Performance · Light | Performance · Dark | Backstage · Light | Backstage · Dark |
|---|---|---|---|---|---|---|
| 1 | Body text (`fg` on `bg`) | text 4.5:1 | 16.41:1 | 16.41:1 | 10.66:1 | 12.77:1 |
| 2 | Body text on raised (`fg` on `surface`) | text 4.5:1 | 18.33:1 | 14.88:1 | 15.41:1 | 11.44:1 |
| 3 | Code / sunken text (`fg` on `sunken`) | text 4.5:1 | 14.34:1 | 17.22:1 | 8.67:1 | 13.81:1 |
| 4 | Muted text (`fgm` on `bg`) | text 4.5:1 | 8.31:1 | 9.87:1 | 7.07:1 | 7.47:1 |
| 5 | Muted on raised (`fgm` on `surface`) | text 4.5:1 | 9.28:1 | 8.95:1 | 10.22:1 | 6.69:1 |
| 6 | Muted on sunken (`fgm` on `sunken`) | text 4.5:1 | 7.26:1 | 10.35:1 | 5.75:1 | 8.08:1 |
| 7 | Accent text/links (`accent` on `bg`) | text 4.5:1 | 7.80:1 | 8.01:1 | 6.33:1 | 8.09:1 |
| 8 | Accent on raised (`accent` on `surface`) | text 4.5:1 | 8.71:1 | 7.26:1 | 9.15:1 | 7.25:1 |
| 9 | Accent on sunken (`accent` on `sunken`) | text 4.5:1 | 6.82:1 | 8.40:1 | 5.14:1 | 8.75:1 |
| 10 | Label on curtain fill (`onaccent` on `accentfill`) | text 4.5:1 | 8.47:1 | 5.29:1 | 10.11:1 | 5.29:1 |
| 11 | Error text (`alert` on `bg`) | text 4.5:1 | 6.84:1 | 9.45:1 | 5.50:1 | 9.25:1 |
| 12 | Error text on error tint (`alert` on `alertbg`) | text 4.5:1 | 6.45:1 | 8.07:1 | 6.98:1 | 8.28:1 |
| 13 | Body on error tint (`fg` on `alertbg`) | text 4.5:1 | 15.46:1 | 14.01:1 | 13.52:1 | 11.44:1 |
| 14 | Body on diff-add (`fg` on `addbg`) | text 4.5:1 | 18.33:1 | 13.21:1 | 15.41:1 | 9.83:1 |
| 15 | Body on diff-remove (`fg` on `delbg`) | text 4.5:1 | 14.23:1 | 13.56:1 | 10.76:1 | 10.73:1 |
| 16 | Syntax keyword (`syn_kw` on `sunken`) | text 4.5:1 | 6.82:1 | 8.40:1 | 5.14:1 | 8.75:1 |
| 17 | Syntax string (`syn_str` on `sunken`) | text 4.5:1 | 7.05:1 | 11.46:1 | 5.22:1 | 11.19:1 |
| 18 | Syntax comment (`syn_com` on `sunken`) | text 4.5:1 | 5.74:1 | 7.06:1 | 4.92:1 | 6.57:1 |
| 19 | Syntax number (`syn_num` on `sunken`) | text 4.5:1 | 5.61:1 | 10.20:1 | 4.99:1 | 9.95:1 |
| 20 | Syntax function (`syn_fn` on `sunken`) | text 4.5:1 | 7.89:1 | 9.69:1 | 5.55:1 | 9.47:1 |
| 21 | Strong border / control edge (`line` on `bg`) | UI 3:1 | 16.41:1 | 16.41:1 | 10.66:1 | 10.07:1 |
| 22 | Strong border on raised (`line` on `surface`) | UI 3:1 | 18.33:1 | 14.88:1 | 15.41:1 | 9.02:1 |
| 23 | Focus ring on page (`focus` on `bg`) | UI 3:1 | 16.41:1 | 16.41:1 | 10.66:1 | 12.77:1 |
| 24 | Focus ring on raised (`focus` on `surface`) | UI 3:1 | 18.33:1 | 14.88:1 | 15.41:1 | 11.44:1 |
| 25 | Focus ring on curtain fill (`focusacc` on `accentfill`) | UI 3:1 | 8.47:1 | 5.29:1 | 10.11:1 | 5.29:1 |
| 26 | Curtain fill vs page (`accentfill` on `bg`) | UI 3:1 | 7.80:1 | 3.37:1 | 6.33:1 | 3.04:1 |
| 27 | Label on hovered curtain control (hem colour) (`onaccent` on `hem`) | text 4.5:1 | 12.69:1 | 8.47:1 | 14.34:1 | 8.47:1 |
| 28 | Focus ring on hem colour (`focusacc` on `hem`) | UI 3:1 | 12.69:1 | 8.47:1 | 14.34:1 | 8.47:1 |

Additional computed pairs: drape text on the darkest pleat line (`on-curtain` over `curtain` darkened by 14%) measures 10.02:1 (Performance · Light), 6.66:1 (Performance · Dark), 11.60:1 (Backstage · Light) and 6.66:1 (Backstage · Dark).

**Colour is never the only signal.**

| Meaning | Colour | Non-colour carrier |
|---|---|---|
| Selected toggle segment | `on-curtain` fill | Filled dot `●` vs `○`, bold weight |
| Current page in nav | Underline in `fg` | `aria-current`, 3 px underline, bold weight |
| Link | `accent` | 2 px underline always on; 3 px on hover |
| Before / After | none | The words BEFORE and AFTER in a chip; `○` / `●` glyph; position |
| Metric direction | none | Arrow `↓` / `↑` and the words "lower" / "higher" / "Worse:" |
| Hypothesis verdict | none | `✓ CONFIRMED`, `✗ REFUTED`, `? INCONCLUSIVE`, `– UNTESTED` |
| Constraint type | none | Chip style (solid, outlined, dashed) and the words HARD / SOFT / ASSUMED |
| Rejected option | none | Struck-through name and the word REJECTED |
| Failure severity | none | The word and filled squares: ■□□, ■■□, ■■■ |
| Code diff | `diff-add`, `diff-remove` tints | `+` / `−` in the gutter; solid vs dashed 4 px left border |
| Error | `error` | "Error:" prefix, ⚠ icon, 2 px solid border |

### 6.3 Typography

**Families.** All open-licensed (SIL OFL 1.1), self-hosted as WOFF2 from `assets/fonts/` (no request to a third-party font host, so no data leaves the visitor's browser).

| Role | Family | Weights | Source files | Fallback stack (in order) | `font-display` |
|---|---|---|---|---|---|
| Vaudeville slab (front of curtain) | **Alfa Slab One** | 400 | `AlfaSlabOne-latin.woff2` | `Rockwell`, `"Rockwell Nova"`, `"Roboto Slab"`, `"Bookman Old Style"`, `Georgia`, `serif` | `optional` |
| Body (front of curtain) | **Libre Franklin** (variable) | 400 to 800 | `LibreFranklin-latin.woff2`, `LibreFranklin-latin-ext.woff2` | `"Franklin Gothic Medium"`, `"Franklin Gothic"`, `"Helvetica Neue"`, `Arial`, `sans-serif` | `swap` |
| Shipping label (behind the curtain, and every label) | **IBM Plex Mono** | 400, 500, 700 | `PlexMono-400-latin.woff2`, `PlexMono-400-latin-ext.woff2`, `PlexMono-500-latin.woff2`, `PlexMono-700-latin.woff2` | `ui-monospace`, `"SF Mono"`, `Menlo`, `Consolas`, `"Liberation Mono"`, `monospace` | `swap` |

Preloaded on every page: `AlfaSlabOne-latin`, `LibreFranklin-latin`, `PlexMono-500-latin`. The others load on demand through `unicode-range` and mode use. Total font payload on a Performance page: about 100 KB; fonts are outside the CSS and JS budgets.

`@font-face` rules are emitted inline in `<head>` by `_partials/head/fonts.html` with fingerprinted URLs, so they survive a sub-path `baseURL`. Licence texts ship in `assets/fonts/OFL-AlfaSlabOne.txt`, `OFL-LibreFranklin.txt` and `OFL-IBMPlexMono.txt`.

**Mode mapping**

| Slot | Performance | Backstage |
|---|---|---|
| `--font-display` | Alfa Slab One 400 | IBM Plex Mono 700 |
| `--font-heading` | Libre Franklin 800 | IBM Plex Mono 700 |
| `--font-body` | Libre Franklin 400 | IBM Plex Mono 400 |
| `--font-label` | IBM Plex Mono 500, uppercase, 0.08 em tracking | same |

The label face is identical in both modes on purpose: it is the printer on the shipping label and it bridges the two voices.

**Scale** (fluid values are `clamp(min, preferred, max)`; the preferred part scales between 360 and about 1015 px of viewport)

| Role | Token | Performance | Backstage | Used for |
|---|---|---|---|---|
| Display XL | `--t-display-xl` | `clamp(2.5rem, 1.2rem + 5.2vw, 4.5rem)` (40 → 72 px), lh 1.04, tracking −0.005 em | `clamp(1.75rem, 1rem + 2.6vw, 2.75rem)` (28 → 44 px), lh 1.12, tracking −0.02 em | H1 |
| Display L | `--t-display-l` | `clamp(1.75rem, 1.1rem + 2vw, 2.5rem)` (28 → 40 px), lh 1.1 | `clamp(1.375rem, 1rem + 1.2vw, 1.75rem)` (22 → 28 px), lh 1.2 | H2 |
| Heading | `--t-heading` | 1.375 rem (22 px), lh 1.2 | 1.125 rem (18 px), lh 1.3 | H3, step titles |
| Body large | `--t-body-l` | 1.3125 rem (21 px), lh 1.5 | 1.125 rem (18 px), lh 1.55 | Lede, summary |
| Body | `--t-body` | 1.125 rem (18 px), lh 1.6 | 1 rem (16 px), lh 1.65 | Running text |
| Body small | `--t-body-s` | 0.9375 rem (15 px), lh 1.5 | 0.875 rem (14 px), lh 1.55 | Captions, context |
| Label | `--t-label` | 0.8125 rem (13 px), lh 1.3 | 0.8125 rem (13 px), lh 1.3 | Chips, field labels, step codes, nav |
| Metric XL | `--t-metric-xl` | `clamp(3rem, 1.8rem + 5vw, 6rem)` (48 → 96 px), lh 1 | `clamp(2.5rem, 1.5rem + 4vw, 4.5rem)` (40 → 72 px), lh 1 | First result metric |
| Metric L | `--t-metric-l` | `clamp(2.25rem, 1.5rem + 2.4vw, 3.25rem)` (36 → 52 px), lh 1 | `clamp(2rem, 1.4rem + 2vw, 2.75rem)` (32 → 44 px), lh 1 | Other metrics |
| Code | `--t-code` | 0.9375 rem (15 px), lh 1.55 | 0.9375 rem (15 px), lh 1.55 | Code blocks, inline code |

- Measure: 66 ch in Performance, 72 ch in Backstage; both land near 680 to 690 px, so switching mode does not reflow columns.
- Numerals in metrics, barcode cells, refs and tables use `font-variant-numeric: tabular-nums`.
- No text below 13 px; no italic body text; emphasis is weight, not italic.
- Text spacing overrides (WCAG 1.4.12) must not break layout: no fixed heights on text containers; step headers use `min-height`, never `height`.

### 6.4 Spacing

4 px base, rem units.

| Token | Value | px | Typical use |
|---|---|---|---|
| `--space-1` | 0.25 rem | 4 | Icon gaps |
| `--space-2` | 0.5 rem | 8 | Chip padding, label gaps |
| `--space-3` | 0.75 rem | 12 | Tight stacks |
| `--space-4` | 1 rem | 16 | Default gap, mobile page padding |
| `--space-5` | 1.5 rem | 24 | Card padding, tablet page padding |
| `--space-6` | 2 rem | 32 | Between components |
| `--space-7` | 3 rem | 48 | Between blocks (mobile) |
| `--space-8` | 4 rem | 64 | Between blocks (desktop) |
| `--space-9` | 6 rem | 96 | Hero separation |
| `--space-10` | 8 rem | 128 | Reserved for the footer's top margin at ≥ 1280 px |

Block rhythm: `--space-7` below 960 px, `--space-8` from 960 px.

### 6.5 Borders and radii

| Token | Value | Use |
|---|---|---|
| `--bw-1` | 1 px | Hairlines (`--color-line-soft`) |
| `--bw-2` | 2 px | Backstage panel borders, underlines, error panels |
| `--bw-3` | 3 px | Performance card borders, focus ring, current-page underline |
| `--bw-4` | 4 px | Diff gutter border, hazard-strip edge |
| `--card-border` (Performance) | `3px solid var(--color-line)` | Stage faces, metric blocks, result block |
| `--card-border` (Backstage) | `2px dashed var(--color-line)` | Steps, labels, panels (a perforated label edge) |
| `--radius` (Performance) | `0` | Printed bills have square corners |
| `--radius` (Backstage) | `4px` | Labels have slightly softened corners |

The valance, drape, pelmet and toggle segments are always `border-radius: 0`.

### 6.6 Elevation

Hard offset shadows only, never blurred.

| Token | Performance | Backstage | Use |
|---|---|---|---|
| `--elev-0` | `none` | `none` | Flat |
| `--elev-1` | `3px 3px 0 0 var(--color-shadow)` | `none` | Stage face, metric block at rest |
| `--elev-2` | `6px 6px 0 0 var(--color-shadow)` | `none` | Hover on a stage face |
| `--elev-valance` | `0 3px 0 0 var(--color-curtain-hem)` | same | The line under the sticky valance |

Z-index scale: `--z-drape: 10`, `--z-pelmet: 20`, `--z-valance: 40`, `--z-skip: 100`.

### 6.7 Motion

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 120 ms | Colour, underline, shadow changes on hover and focus |
| `--dur-press` | 80 ms | Pressed state |
| `--dur-base` | 200 ms | Skin colour change when mode switches |
| `--dur-step` | 220 ms | Step expand and collapse |
| `--dur-swap` | 280 ms | Backstage face fade-in |
| `--dur-wipe` | 320 ms | Mobile face wipe |
| `--dur-lower` | 520 ms | Curtain lowering |
| `--dur-raise` | 720 ms | Curtain raising |
| `--ease-raise` | `cubic-bezier(0.22, 0.8, 0.24, 1)` | A curtain pulled up decelerates as it reaches the top |
| `--ease-lower` | `cubic-bezier(0.55, 0.05, 0.85, 0.35)` | A curtain released falls and accelerates |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Step expand, general UI |

**Curtain transition, desktop home (≥ 960 px).** Only `transform`, `opacity` and `visibility` animate; the drape gets `will-change: transform` only while moving (JS adds `.is-moving` and removes it on `transitionend`).

| Direction | Element | Property | Duration | Delay | Easing |
|---|---|---|---|---|---|
| Raise (to Backstage) | `.drape` | `transform: translateY(0)` → `translateY(-100%)` | 720 ms | 0 | `--ease-raise` |
| Raise | Backstage cells (`.stage-row__back`) | `visibility: hidden` → `visible` | 0 ms | 0 | linear |
| Raise | Backstage cells | `opacity: 0` → `1` | 280 ms | 300 ms | `--ease-raise` |
| Raise | Page chrome (header, footer, intro) | `background-color`, `color` | 200 ms | 0 | `--ease-standard` |
| Lower (to Performance) | `.drape` | `transform: translateY(-100%)` → `translateY(0)` | 520 ms | 0 | `--ease-lower` |
| Lower | Backstage cells | `visibility: visible` → `hidden` | 0 ms | 520 ms | linear (content stays until the hem has covered it) |
| Lower | Backstage cells | `opacity: 1` → `0` | 0 ms | 520 ms | linear |
| Lower | Page chrome | `background-color`, `color` | 200 ms | 0 | `--ease-standard` |

The drape travels the full height of its column in both directions; at rest raised it sits at `translateY(-100%)`, hidden behind the pelmet.

**Face swap, mobile and tablet home (< 960 px).** The incoming face animates `clip-path`:

| Direction | From | To | Duration | Easing | Reasoning |
|---|---|---|---|---|---|
| To Backstage (curtain rises) | `inset(100% 0 0 0)` | `inset(0)` | 320 ms | `--ease-raise` | The revealed area grows upward from the bottom, like a hem rising |
| To Performance (curtain falls) | `inset(0 0 100% 0)` | `inset(0)` | 320 ms | `--ease-raise` | The revealed area grows downward from the top, like a drop |

**Step expand.** The step body is a one-row grid: `grid-template-rows: 0fr` → `1fr` over 220 ms `--ease-standard`, with the content's `opacity` 0 → 1 over 160 ms. Collapsing mirrors it with 160 ms.

**Reduced motion.** All animation lives inside `@media (prefers-reduced-motion: no-preference)`. Outside it, every `--dur-*` is `0ms`, the drape has **no transition and no transform animation**: the state changes in the same frame (the drape is positioned at its end state, and Backstage cells switch `visibility`/`opacity` instantly), the mobile face swap has no clip-path animation, steps open and close instantly, and scrolling uses `scroll-behavior: auto`. The announcement and focus behaviour are identical to the animated path (section 8).

### 6.8 Breakpoints and layout

| Token | Value | Meaning |
|---|---|---|
| (base) | 360 px | Design floor; the layout holds down to 320 px without horizontal page scroll |
| `--bp-sm` | 30 rem (480 px) | Two-up chips and ticks; larger gutters for nav |
| `--bp-md` | 48 rem (768 px) | Tablet: page padding 1.5 rem; barcode strip becomes horizontal |
| `--bp-lg` | 60 rem (960 px) | Split stage and drape appear; 12-column grid; Programme rows go horizontal |
| `--bp-xl` | 80 rem (1280 px) | Page padding 2.5 rem; headliner row at full size |
| Container query | 40 rem | Before/after panes side by side |
| `--container` | 75 rem (1200 px) | Content max width |
| `--gutter` | 1 rem → 1.5 rem → 2 rem → 2.5 rem | Page padding at base, md, lg, xl |
| `--target` | 2.75 rem (44 px) | Minimum interactive target (WCAG 2.2 AA asks for 24 px) |
| `--focus-width` / `--focus-offset` | 3 px / 3 px | Focus ring |

Media queries cannot read custom properties, so the stylesheet uses the literal values `30rem`, `48rem`, `60rem`, `80rem`.

### 6.9 Ready-to-paste CSS custom properties

`assets/css/tokens.css`. The colour blocks are generated from the tables above.

```css
@layer tokens {
  :root                      { color-scheme: light dark; }
  :root[data-scheme="light"] { color-scheme: light; }
  :root[data-scheme="dark"]  { color-scheme: dark; }

  /* ---------- Colour ---------- */
  :root,
  [data-mode="performance"] {
    --color-bg: light-dark(#F5EEE2, #14100D);
    --color-surface: light-dark(#FFFBF3, #211A16);
    --color-sunken: light-dark(#EADFCB, #0C0907);
    --color-fg: light-dark(#14100D, #F5EEE2);
    --color-fg-muted: light-dark(#4F4338, #C9B9A3);
    --color-accent: light-dark(#8E1B26, #F28B92);
    --color-curtain: light-dark(#8E1B26, #C0303F);
    --color-on-curtain: light-dark(#FFF7EC, #FFF7EC);
    --color-line: light-dark(#14100D, #F5EEE2);
    --color-line-soft: light-dark(#CDBFA8, #4A3C33);
    --color-focus: light-dark(#14100D, #F5EEE2);
    --color-focus-on-curtain: light-dark(#FFF7EC, #FFF7EC);
    --color-error: light-dark(#A3121C, #FF9C9C);
    --color-error-bg: light-dark(#FBE3DF, #3A1517);
    --color-diff-add: light-dark(#FFFBF3, #2C241E);
    --color-diff-remove: light-dark(#F6D9D4, #3A1A1A);
    --syn-keyword: light-dark(#8E1B26, #F28B92);
    --syn-string: light-dark(#5C4300, #E3C16F);
    --syn-comment: light-dark(#5E5246, #A8987F);
    --syn-number: light-dark(#1F5C73, #7CC4DC);
    --syn-function: light-dark(#4B2E83, #C3A9F0);
    --color-curtain-hem: light-dark(#5E0F18, #8E1B26);
    --color-shadow: light-dark(#14100D, #8E1B26);
  }

  [data-mode="backstage"] {
    --color-bg: light-dark(#D9C4A3, #231A13);
    --color-surface: light-dark(#F4ECDD, #2E231A);
    --color-sunken: light-dark(#C9B08A, #1A120D);
    --color-fg: light-dark(#1E140C, #EBDDC6);
    --color-fg-muted: light-dark(#43341F, #BBA98E);
    --color-accent: light-dark(#7A1520, #F59A95);
    --color-curtain: light-dark(#7A1520, #C0303F);
    --color-on-curtain: light-dark(#FFF7EC, #FFF7EC);
    --color-line: light-dark(#1E140C, #D9C4A3);
    --color-line-soft: light-dark(#A98F68, #5B4837);
    --color-focus: light-dark(#1E140C, #EBDDC6);
    --color-focus-on-curtain: light-dark(#FFF7EC, #FFF7EC);
    --color-error: light-dark(#8F0F18, #FFA8A0);
    --color-error-bg: light-dark(#F4D9D1, #40191A);
    --color-diff-add: light-dark(#F4ECDD, #3A2E24);
    --color-diff-remove: light-dark(#E7BFB2, #43201C);
    --syn-keyword: light-dark(#7A1520, #F59A95);
    --syn-string: light-dark(#4E3A00, #E6C679);
    --syn-comment: light-dark(#4A3F31, #A89880);
    --syn-number: light-dark(#0F4559, #85C8DD);
    --syn-function: light-dark(#432878, #C7AEF2);
    --color-curtain-hem: light-dark(#4D0C14, #8E1B26);
    --color-shadow: light-dark(#1E140C, #000000);
  }

  @supports not (color: light-dark(#000, #fff)) {
    :root,
    [data-mode="performance"] {
      --color-bg: #F5EEE2;
      --color-surface: #FFFBF3;
      --color-sunken: #EADFCB;
      --color-fg: #14100D;
      --color-fg-muted: #4F4338;
      --color-accent: #8E1B26;
      --color-curtain: #8E1B26;
      --color-on-curtain: #FFF7EC;
      --color-line: #14100D;
      --color-line-soft: #CDBFA8;
      --color-focus: #14100D;
      --color-focus-on-curtain: #FFF7EC;
      --color-error: #A3121C;
      --color-error-bg: #FBE3DF;
      --color-diff-add: #FFFBF3;
      --color-diff-remove: #F6D9D4;
      --syn-keyword: #8E1B26;
      --syn-string: #5C4300;
      --syn-comment: #5E5246;
      --syn-number: #1F5C73;
      --syn-function: #4B2E83;
      --color-curtain-hem: #5E0F18;
      --color-shadow: #14100D;
    }
    [data-mode="backstage"] {
      --color-bg: #D9C4A3;
      --color-surface: #F4ECDD;
      --color-sunken: #C9B08A;
      --color-fg: #1E140C;
      --color-fg-muted: #43341F;
      --color-accent: #7A1520;
      --color-curtain: #7A1520;
      --color-on-curtain: #FFF7EC;
      --color-line: #1E140C;
      --color-line-soft: #A98F68;
      --color-focus: #1E140C;
      --color-focus-on-curtain: #FFF7EC;
      --color-error: #8F0F18;
      --color-error-bg: #F4D9D1;
      --color-diff-add: #F4ECDD;
      --color-diff-remove: #E7BFB2;
      --syn-keyword: #7A1520;
      --syn-string: #4E3A00;
      --syn-comment: #4A3F31;
      --syn-number: #0F4559;
      --syn-function: #432878;
      --color-curtain-hem: #4D0C14;
      --color-shadow: #1E140C;
    }
  }

  /* ---------- Typefaces ---------- */
  :root {
    --ff-slab: "Alfa Slab One", Rockwell, "Rockwell Nova", "Roboto Slab", "Bookman Old Style", Georgia, serif;
    --ff-sans: "Libre Franklin", "Franklin Gothic Medium", "Franklin Gothic", "Helvetica Neue", Arial, sans-serif;
    --ff-mono: "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;

    /* ---------- Spacing ---------- */
    --space-1: 0.25rem; --space-2: 0.5rem;  --space-3: 0.75rem; --space-4: 1rem;
    --space-5: 1.5rem;  --space-6: 2rem;    --space-7: 3rem;    --space-8: 4rem;
    --space-9: 6rem;    --space-10: 8rem;

    /* ---------- Borders, layout, targets ---------- */
    --bw-1: 1px; --bw-2: 2px; --bw-3: 3px; --bw-4: 4px;
    --container: 75rem;
    --gutter: 1rem;
    --target: 2.75rem;
    --focus-width: 3px;
    --focus-offset: 3px;
    --pelmet: 3rem;
    --valance: 3rem;

    /* ---------- Motion ---------- */
    --dur-fast: 120ms; --dur-press: 80ms; --dur-base: 200ms; --dur-step: 220ms;
    --dur-swap: 280ms; --dur-wipe: 320ms; --dur-lower: 520ms; --dur-raise: 720ms;
    --ease-raise: cubic-bezier(0.22, 0.8, 0.24, 1);
    --ease-lower: cubic-bezier(0.55, 0.05, 0.85, 0.35);
    --ease-standard: cubic-bezier(0.2, 0, 0, 1);

    /* ---------- Z-index ---------- */
    --z-drape: 10; --z-pelmet: 20; --z-valance: 40; --z-skip: 100;
  }
  @media (min-width: 48rem) { :root { --gutter: 1.5rem; } }
  @media (min-width: 60rem) { :root { --gutter: 2rem; } }
  @media (min-width: 80rem) { :root { --gutter: 2.5rem; } }

  /* ---------- Mode: Performance ---------- */
  :root,
  [data-mode="performance"] {
    --font-display: var(--ff-slab);
    --font-heading: var(--ff-sans);
    --font-body: var(--ff-sans);
    --font-label: var(--ff-mono);
    --fw-display: 400;
    --fw-heading: 800;
    --fw-body: 400;
    --track-display: -0.005em;
    --lh-display: 1.04;
    --lh-heading: 1.2;
    --lh-body: 1.6;
    --t-display-xl: clamp(2.5rem, 1.2rem + 5.2vw, 4.5rem);
    --t-display-l: clamp(1.75rem, 1.1rem + 2vw, 2.5rem);
    --t-heading: 1.375rem;
    --t-body-l: 1.3125rem;
    --t-body: 1.125rem;
    --t-body-s: 0.9375rem;
    --t-label: 0.8125rem;
    --t-code: 0.9375rem;
    --t-metric-xl: clamp(3rem, 1.8rem + 5vw, 6rem);
    --t-metric-l: clamp(2.25rem, 1.5rem + 2.4vw, 3.25rem);
    --measure: 66ch;
    --radius: 0;
    --card-border: var(--bw-3) solid var(--color-line);
    --elev-0: none;
    --elev-1: 3px 3px 0 0 var(--color-shadow);
    --elev-2: 6px 6px 0 0 var(--color-shadow);
    --elev-valance: 0 3px 0 0 var(--color-curtain-hem);
  }

  /* ---------- Mode: Backstage ---------- */
  [data-mode="backstage"] {
    --font-display: var(--ff-mono);
    --font-heading: var(--ff-mono);
    --font-body: var(--ff-mono);
    --font-label: var(--ff-mono);
    --fw-display: 700;
    --fw-heading: 700;
    --fw-body: 400;
    --track-display: -0.02em;
    --lh-display: 1.12;
    --lh-heading: 1.3;
    --lh-body: 1.65;
    --t-display-xl: clamp(1.75rem, 1rem + 2.6vw, 2.75rem);
    --t-display-l: clamp(1.375rem, 1rem + 1.2vw, 1.75rem);
    --t-heading: 1.125rem;
    --t-body-l: 1.125rem;
    --t-body: 1rem;
    --t-body-s: 0.875rem;
    --t-label: 0.8125rem;
    --t-code: 0.9375rem;
    --t-metric-xl: clamp(2.5rem, 1.5rem + 4vw, 4.5rem);
    --t-metric-l: clamp(2rem, 1.4rem + 2vw, 2.75rem);
    --measure: 72ch;
    --radius: 4px;
    --card-border: var(--bw-2) dashed var(--color-line);
    --elev-0: none;
    --elev-1: none;
    --elev-2: none;
    --elev-valance: 0 3px 0 0 var(--color-curtain-hem);
  }

  /* ---------- Reduced motion ---------- */
  @media (prefers-reduced-motion: reduce) {
    :root {
      --dur-fast: 0ms; --dur-press: 0ms; --dur-base: 0ms; --dur-step: 0ms;
      --dur-swap: 0ms; --dur-wipe: 0ms; --dur-lower: 0ms; --dur-raise: 0ms;
    }
  }

  /* ---------- Higher contrast preference ---------- */
  @media (prefers-contrast: more) {
    :root { --bw-2: 3px; --bw-3: 4px; --focus-width: 4px; }
    [data-mode] { --color-fg-muted: var(--color-fg); }
  }
}
```

---

## 7. Components

Common rules for every component:

- Class names are BEM (`block__element--modifier`). State is exposed through ARIA attributes or `data-*` attributes, not through colour-only classes.
- Every interactive element: minimum target 44 × 44 px (`--target`); focus ring `outline: var(--focus-width) solid var(--color-focus); outline-offset: var(--focus-offset)` on `:focus-visible` only; on `--color-curtain` and `--color-curtain-hem` surfaces the ring is `--color-focus-on-curtain`.
- **Links** in running text and metadata: colour `--color-accent`, 2 px underline at 3 px offset, always on; 3 px on hover; 3 px focus ring on `:focus-visible`; `translateY(1px)` when active. Component rows below that say "follows the link rules" mean this line.
- Where a state cannot occur for a component, the row says so and gives the reason; it is never left blank.
- Hover styles are wrapped in `@media (hover: hover)`.

### 7.1 Curtain toggle

**Purpose.** The one global control: chooses Performance or Backstage for the whole site. Lives in the valance.

**Anatomy**

1. `<fieldset class="curtain">` containing `<legend class="sr-only">View</legend>`.
2. Two `<label class="curtain__seg">`, each wrapping a visually hidden `<input type="radio" name="mode" value="performance|backstage">` and a `<span class="curtain__text">` ("Performance", "Backstage") preceded by a `●` or `○` glyph (`aria-hidden`).
3. Status: `<p id="mode-status" class="sr-only" role="status" aria-live="polite">`.
4. Hidden without JavaScript; the `no-js-only` jump links render instead (8.1).

Two 148 × 44 px segments (144 px at ≥ 960 px), 2 px `--color-on-curtain` border, label face 13 px uppercase. Selected: fill `--color-on-curtain`, text `--color-curtain`, glyph `●`, weight 700. Unselected: transparent, text `--color-on-curtain`, glyph `○`.

**Variants:** none. One instance per page, in the valance.

| State | Specification |
|---|---|
| Default | As above. The selected segment reflects `data-mode`. |
| Hover | Unselected segment: background `--color-curtain-hem` (on-curtain text 8.47:1 at worst), 120 ms. Selected segment: no change. |
| Focus-visible | The radio input receives focus; the label shows a 3 px ring in `--color-focus-on-curtain` with 3 px offset (via `label:has(input:focus-visible)`). Arrow keys move selection and focus together. |
| Active | Unselected segment pressed: background `--color-curtain-hem` plus `inset 0 0 0 2px var(--color-on-curtain)`, 80 ms. |
| Disabled | The theme never disables the control (a disabled mode switch would strand a visitor in one layer). The style exists for child themes: opacity 0.5, `cursor: not-allowed`, `fieldset:disabled`. |
| Empty | A site with no case studies still shows the toggle (it changes the skin). The status text omits counts: "Backstage view." |
| Error | `localStorage` unavailable or throwing: the toggle works for the page view and persistence is skipped silently. A stored value that is not `performance` or `backstage` is ignored and the default mode applies. No visible error, because nothing the visitor needs is lost. |

### 7.2 Stage card (`stage-row`)

**Purpose.** One case study on the homepage, with both faces.

**Anatomy**

1. `<article class="stage-row" data-headliner data-backstage="true|false">`
2. **Front face** `.stage-row__front` (always `data-mode="performance"`): cover (`<picture>`), ref label, `<h3><a>` title, result sentence (`summary`), first metric, compact barcode strip.
3. **Back face** `.stage-row__back` (always `data-mode="backstage"`): ref, "PROBLEM" label and `brief`, "TURNING POINT" label and `teaser`, counts line, step ticks `<ol>`, "Open backstage" link, optional `TRAPDOOR n` chip.

**Variants:** `headliner` (cover 568 px wide, title 48 px, row about 560 px); `standard` (cover 200 px beside the text, title 32 px, row about 300 px); `performance-only` (back face shows `brief`, "Walkthrough on request." and a mailto link). With one case study the headliner is scaled up 1.25 × (9.7).

| State | Specification |
|---|---|
| Default | Front: `--card-border`, `--elev-1`, background `--color-surface`. Back: dashed border, no shadow, background `--color-surface`. |
| Hover | Front (when the stretched title link is hovered): shadow to `--elev-2` and `translate(-2px, -2px)`, title underline 3 px `--color-accent`, 120 ms. Step tick: fill `--color-curtain`, text `--color-on-curtain`. |
| Focus-visible | Title link focused: the whole front face gets the 3 px ring (`.stage-row__front:has(a:focus-visible)`), and the title is underlined. Each tick and the "Open backstage" link have their own ring. |
| Active | Shadow removed and `translate(3px, 3px)`, 80 ms. |
| Disabled | Production never renders drafts. In `hugo server` a draft row carries a `DRAFT` chip and a diagonal-hatched border (`repeating-linear-gradient`). On a Performance-only back face the missing link is rendered as plain text "Walkthrough on request." in `--color-fg-muted` with no hover. |
| Empty | The stage with zero case studies renders one `--color-sunken` panel: "Nothing on the bill yet." In `hugo server` it adds "Add content/work/<slug>/index.md." |
| Error | An image that fails to load keeps its `width`/`height` box (no layout shift); the box shows `--color-sunken`, a 2 px dashed `--color-line` border and the alt text in `--color-fg-muted`. A missing cover is a build error (3.6). |

### 7.3 Backstage step

**Purpose.** One numbered unit of the process, collapsible, with a structured block per kind.

**Anatomy**

1. `<li id="step-3" class="step" data-kind="hypotheses" data-open="true|false">`
2. `<h2 class="step__head"><button type="button" aria-expanded aria-controls="step-3-body">`: visually hidden "Step 3 of 6:", number box `03` (44 px square, label face), kind chip `HYP`, title, gist, chevron (CSS, `aria-hidden`).
3. `<div id="step-3-body" class="step__body">`: `when` line, kind block, markdown body, step navigation (`[ ← Step 2: … ]`, `[ Step 4: … → ]`). It gets `role="region"` and `aria-labelledby` only when the case study has six steps or fewer (more would flood the landmark list).
4. Without JavaScript the button is a plain `<span>`, the body is always visible and `aria-expanded` is absent (8.2).

**Variants by kind:** `problem`, `constraints`, `hypotheses`, `rejected`, `implementation`, `result`, `note` (3.6 lists each block). Hypothesis panels show `id`, claim, test, verdict stamp and evidence. Rejected panels show the struck-through name, a `REJECTED` stamp, the reason and "Cost to revisit". Result steps render `ba-metric` rows, the verdict, and "What this does not show".

| State | Specification |
|---|---|
| Default (collapsed) | `--card-border` (dashed), `--color-surface`, header min-height 64 px, chevron `▸`. |
| Default (expanded) | Chevron `▾`; body visible; header gets a 4 px `--color-curtain` left edge. |
| Hover | Header background `--color-sunken`; chevron moves 2 px; title underlined; 120 ms. |
| Focus-visible | 3 px ring around the header button, offset 3 px; the panel does not use `overflow: hidden` on the header, so the ring is never clipped. |
| Active | Header `translateY(1px)`, 80 ms. |
| Disabled | Steps are never disabled. Unpublished steps are not rendered; they exist only as the count in the "in progress" notice. |
| Empty | A step with front matter and no markdown body renders only its kind block. A step missing its kind-specific list is a build error. |
| Error | `#step-9` in the URL when only 6 steps exist: the JavaScript ignores it, opens step 1 and announces "Step 9 does not exist. Showing step 1." in the polite live region, styled with the error panel (⚠, "Error:" prefix, 2 px border) for 6 seconds, then removed. |

### 7.4 Before/after comparison

**Purpose.** Two states of the same thing, side by side where there is room, one above the other where there is not. Three types share one component: image, code, metric.

**Anatomy**

1. `<figure class="ba ba--image|code|metric">` with `container-type: inline-size`, and an optional `<figcaption>`.
2. Two panes `.ba__pane[data-side="before|after"]`, `role="group"`, `aria-labelledby` pointing at the pane's chip. Chips: `○ BEFORE` (outlined) and `● AFTER` (solid), label face.
3. Connector `.ba__link` (`→` in the gutter at ≥ 40 rem, a "then ↓" row below), `aria-hidden`.
4. Image pane: `<picture>` with explicit `width`/`height`. Code pane: `<pre tabindex="0" role="region" aria-label="Before code, scrollable">` with a gutter marking `−` (removed) or `+` (added) on highlighted lines. Metric pane (`ba-metric`): `<dl>` with label, before value, after value and the delta sentence.

**Layout.** `@container (min-width: 40rem)`: two equal columns with a 3 rem gutter holding the connector. Below that: one column, Before above After, 1.5 rem apart.

**Variants:** `image`, `code`, `metric`.

| State | Specification |
|---|---|
| Default | Panes use the surrounding mode's `--card-border`. Removed lines: `--color-diff-remove` and a 4 px dashed left border; added lines: `--color-diff-add` and a 4 px solid left border. |
| Hover | The component has no hover behaviour: it is static content. The code region shows the native scrollbar on hover. |
| Focus-visible | Code regions are keyboard-focusable (`tabindex="0"`) and show the 3 px ring. Images are not focusable. |
| Active | No active state: nothing is activatable. Scrolling a code region is native. |
| Disabled | Does not apply: the component has no controls. |
| Empty | Both sides are required (build error otherwise). A `ba-metric` whose `before` is 0 prints "from zero" instead of a percentage. |
| Error | An image that fails to load keeps its aspect-ratio box with the alt text on `--color-sunken`; the chip stays. A missing bundle file is a build error naming the shortcode and the page. |

### 7.5 Metric block

**Purpose.** One figure that proves a claim.

**Anatomy:** `<div class="metric">` → `.metric__value` (display face, tabular numerals), `.metric__unit` (60% of the value size, baseline aligned), `.metric__label` (label face), `.metric__context` (body small).

**Variants:** `l`, `xl`. In the result block the first metric is `xl`.

| State | Specification |
|---|---|
| Default | `--card-border`, `--elev-1` (Performance) or dashed border (Backstage), padding `--space-5`. |
| Hover | None; the block is static. If an author wraps it in a link, the link follows the link rules. |
| Focus-visible | None unless wrapped in a link; then the 3 px ring surrounds the block. |
| Active | None unless wrapped in a link. |
| Disabled | Does not apply. |
| Empty | A metric with no `value` is not rendered and the build warns. |
| Error | A non-numeric `value` is allowed (it is a string); only `ba-metric` requires numbers, and fails the build when they are not. |

### 7.6 Barcode metadata strip

**Purpose.** Project facts in one scannable label: duration, team, stack, outcome.

**Anatomy**

1. `<dl class="barcode">`.
2. `.barcode__bars`: inline SVG from `_partials/lib/barcode-bars.html`, `aria-hidden`, 48 alternating bar and space segments of 1 to 4 units (24 visible bars) whose widths come from `crypto.SHA256` of the project ref (the same ref always gives the same bars), height 28 px, fill `currentColor`.
3. `.barcode__ref`: the ref in the label face under the bars.
4. Four cells `<div class="barcode__cell">`: `<dt>` (label face, `--color-fg-muted`) and `<dd>` (body face, 700). Duration · Team · Stack (first three terms, each a link to `/stack/<term>/`, then "+n") · Outcome (`value unit label`).
5. Cell separators are vertical rules of widths 1, 3, 1, 2 px (a barcode rhythm), `--color-line`.

**Variants:** `full` (case-study head: horizontal at ≥ 768 px, a vertical label below), `compact` (stage row: bars + ref + duration, team, outcome on one line; stack omitted).

| State | Specification |
|---|---|
| Default | Top and bottom `--bw-3` rules in `--color-line`; cells as above. |
| Hover | The strip is static. Stack term links: underline 2 px → 3 px, text `--color-accent`, 120 ms. |
| Focus-visible | Stack links show the 3 px ring. |
| Active | Stack link: `translateY(1px)`. |
| Disabled | Does not apply. |
| Empty | No `stack` terms: the Stack cell shows "—" with a visually hidden "not listed". The other three cells are mandatory (build error). |
| Error | A malformed `barcode.team` (neither an int nor a string) is a build error. |

### 7.7 Failure entry

**Purpose.** A filed failure: what happened, what it cost, what changed.

**Anatomy**

1. `<article class="failure failure--row|full|strip">`
2. Header: ref `TD-002`, date (`<time>`), severity (text and squares).
3. `<h2|h3>` title (a link in `row` and `strip`).
4. A `<dl>`: What · Cause · Cost · Changed (labels in the label face).
5. Lesson chips (links to `/lessons/<term>/`); related case-study link; "Read the report".
6. `full` adds the markdown body.

**Variants:** `row` (lists), `full` (page), `strip` (one line: ref, title, severity text, cost, link). `strip` carries the 8 px hazard edge.

| State | Specification |
|---|---|
| Default | Surface `--color-surface`; severity text and squares in `--color-fg`; hazard edge on the `strip`. |
| Hover | Title underline 3 px `--color-accent`; on `row` and `strip`, the whole entry is one stretched link with `--elev-2` in Performance and a `--color-sunken` background in Backstage. |
| Focus-visible | 3 px ring around the entry (`:has(a:focus-visible)`). |
| Active | `translate(3px, 3px)` in Performance (shadow removed); `--color-line-soft` background in Backstage. |
| Disabled | Does not apply. |
| Empty | The list with no entries: "Nothing filed yet." with one sentence and a link to Work. The nav item is also omitted (4.3). |
| Error | A missing required field (3.7) is a build error. The 404 page is the failure entry's fixed-copy instance, so a broken address is handled by the same component. |

### 7.8 Contact block

**Purpose.** The way to reach the author, with a prompt that fits the page.

**Anatomy:** heading; email as a `mailto:` link in the label face; "Copy address" button (JavaScript only); availability line; extra links list.

**Variants:** `full` (About), `compact` (footer: email and links, no heading), `cta` (case-study end: heading "Want the walkthrough?", one sentence pointing at the toggle, the mailto prefilled with the subject "Walkthrough: <case-study title>").

| State | Specification |
|---|---|
| Default | Email 700, 2 px underline, `--color-accent`. Copy button: 44 px, `--card-border`, label face. |
| Hover | Email underline 3 px; copy button background `--color-curtain`, text `--color-on-curtain`. |
| Focus-visible | 3 px ring on the link and on the button. |
| Active | Copy button `translate(1px, 1px)`. |
| Disabled | While the clipboard write is pending (under 1 s), the button has `aria-disabled="true"` and reads "Copying…". |
| Empty | `params.contact.email` unset: production omits the mailto and "Copy" button; if no links either, the block is not rendered. |
| Error | Clipboard write rejected: the button reads "Copy failed", the address is selected via a `Range`, and a message appears below in the error panel (⚠, "Error:" prefix): "Couldn't copy. The address is selected: press Ctrl+C." Under `hugo server`, a missing `params.contact.email` renders a dev-only error panel naming the setting. |

### 7.9 Header

**Purpose.** Identity and primary navigation. Static (not sticky).

**Anatomy:** wordmark (`<a>`, display face, 28 px, links to `/`); `<nav aria-label="Primary">` with a list of links in the label face, 14 px uppercase, 44 px high.

**Variants:** one. Below 400 px the nav wraps under the wordmark.

| State | Specification |
|---|---|
| Default | Links `--color-fg`, no underline. |
| Hover | 3 px `--color-accent` underline at 6 px offset, 120 ms. |
| Focus-visible | 3 px ring, offset 3 px. |
| Active | Underline thickens to 4 px; `translateY(1px)`. |
| Current | `aria-current`: persistent 3 px `--color-fg` underline and weight 700. |
| Disabled | Does not apply: a link to a section with no content is omitted (`Trapdoor` with zero failures). |
| Empty | No `menus.main` configured: only the wordmark renders. |
| Error | A menu `pageRef` that does not resolve is omitted and the build warns with the menu entry name. |

### 7.10 Footer

**Purpose.** Contact, browse links, scheme control, colophon.

**Anatomy:** contact block (`compact`); Browse list (`Work`, `Trapdoor`, `About`, RSS); scheme fieldset (Auto / Light / Dark radios, JavaScript only); `params.footer.note`; colophon ("Built with Prestige", linked, if `params.credit`).

**Variants:** three columns at ≥ 768 px; one column below.

| State | Specification |
|---|---|
| Default | Background `--color-sunken`, top border `--bw-3` `--color-line`; text `--color-fg`. |
| Hover | Links: 3 px underline in `--color-accent`. Unselected scheme radio: `--color-sunken` darkened 8% (`color-mix`). |
| Focus-visible | 3 px ring on links and on the scheme radios. |
| Active | Scheme radio: `translate(1px, 1px)`. |
| Disabled | Scheme fieldset is never disabled; without JavaScript it is not rendered. |
| Empty | No `footer.note`, no extra links: the corresponding element is omitted without leaving a gap. |
| Error | Scheme preference unreadable: Auto applies. |

### 7.11 Supporting components

| Component | File | Key rules |
|---|---|---|
| Chip | `components/chip.html` | Label face, 13 px, 44 px target when a link, `--bw-2` border, `--radius`. |
| Button | `components/button.html` | 44 px high, `--card-border`, label face, hover fills `--color-curtain`; always a `<button>` or `<a>`. |
| Valance | `site/valance.html` | Sticky, `--valance` high, `--color-curtain`, `--elev-valance`; holds the toggle and status text. |
| Programme row | `components/programme-row.html` | Whole row is one stretched link; no card shadow; separated by `--bw-1` rules in `--color-line-soft`. |
| Hypothesis panel, Rejected panel, Verdict stamp | rendered inside `components/step.html` | Stamps are bordered text in the label face, never colour-only (6.2). |
| Aside | `_shortcodes/aside.html` | Label face heading, `--color-sunken` background, left `--bw-4` border; sits in the right margin at ≥ 1280 px and inline below. |
| Pager | `components/pager.html` | One link, "Next on the bill: <title>", 64 px high, label face for the prefix. |

---

## 8. Signature interactions

JavaScript is a single bundle, `assets/js/main.js`, built by `js.Build` as an IIFE, plus a tiny inline script in `<head>` (11.5). It does exactly four things: applies mode and scheme, switches layers, runs the step accordion, and copies the email address. Everything else is HTML and CSS.

JS-only elements carry `hidden` in the HTML and are revealed by the script; elements for the no-JS case carry the class `no-js-only` and are hidden by `html.js .no-js-only { display: none }`.

### 8.1 The curtain toggle (Performance ⇄ Backstage)

**Trigger**

| Source | Persists? |
|---|---|
| Selecting a segment of the toggle in the valance (click, tap, Space, arrow keys) | Yes |
| Clicking the drape on the desktop homepage (mouse convenience; it clicks the Backstage radio) | Yes |
| First paint: stored preference | n/a |
| URL fragment `#backstage`, `#step-n`, `#trapdoor` (forces Backstage) or `#performance`, `#result` (forces Performance) | **No**: applies to this page load only |
| `storage` event from another tab | Yes (mirrors the other tab) |

**Behaviour**

1. **Before first paint** the inline head script runs: adds `class="js"` to `<html>`; reads `localStorage["prestige.mode"]` (try/catch; only `performance` or `backstage` accepted; otherwise `params.stage.default_mode`, emitted as `data-default-mode` on `<html>`); lets a recognised URL fragment override it; sets `data-mode`; reads `localStorage["prestige.scheme"]` (`light` or `dark`) and sets `data-scheme` if present. No flash, no layout shift.
2. **On DOM ready** `main.js` removes `hidden` from the toggle fieldset, checks the radio matching `data-mode`, and fills the visible status text in the valance (`aria-hidden`, so the initial state is not announced).
3. **On `change`** of a radio:
   1. Write `localStorage["prestige.mode"]` (try/catch).
   2. Set `data-mode` on `<html>`. CSS reacts: layer visibility, skin tokens, drape position.
   3. On the desktop homepage add `.is-moving` to the drape and remove it on `transitionend`.
   4. Update the visible status text in the valance.
   5. Update the screen-reader status region (`#mode-status`): set its text to empty, then in `requestAnimationFrame` to the new string (below), so identical consecutive messages are re-announced.
   6. If the URL fragment points at a layer that is now hidden (`#step-3` while switching to Performance), clear it with `history.replaceState`.
   7. On a case-study page, if the viewport top is below the head, scroll so the newly shown layer starts at the top (`scroll-margin-top: 4rem`). Scrolling is always instant (`behavior: "auto"`); there is no smooth scrolling anywhere in the theme.
   8. Focus stays on the radio the visitor used.
4. **`storage` event** from another tab: repeat steps 2 to 5 without writing.

**Keyboard**

| Key | Effect |
|---|---|
| Tab / Shift+Tab | The group is one tab stop (the checked radio). Order: skip link → header links → toggle → main. |
| ← → ↑ ↓ | Move selection and focus between the two radios; the mode changes immediately. |
| Space | Selects the focused radio. |
| Enter | No special behaviour (native radio). |

No single-character shortcuts exist (WCAG 2.1.4).

**Screen-reader announcements.** Native semantics announce the control: "View, group. Performance, radio button, 1 of 2, selected" (exact wording varies by reader). After a change, the polite status region announces one of these strings (stored in `i18n/en.toml`; counts are filled by the template into `data-*` attributes read by the script):

| Page | To Backstage | To Performance |
|---|---|---|
| Home, ≥ 960 px | "Backstage view. Curtain raised: process shown beside 3 case studies." | "Performance view. Curtain lowered." |
| Home, < 960 px | "Backstage view. Showing how each of 3 case studies was made." | "Performance view. Showing the results of 3 case studies." |
| Case study with Backstage | "Backstage view. 6 steps and 1 trapdoor on this page." | "Performance view. Result and narrative shown." |
| Case study, Performance-only | "Backstage view. No walkthrough is written for this case study; page styling changed." | "Performance view. Result and narrative shown." |
| Any other page | "Backstage view. Styling changed; this page has the same content in both views." | "Performance view. Styling changed; this page has the same content in both views." |

Singular and plural forms are handled with Hugo's `i18n` plural support ("1 step", "6 steps").

**No-JS fallback.** The toggle and the status text are not rendered visibly. The valance is still sticky (it is CSS) and shows a `no-js-only` strip: the label "Both layers are shown below." and, on case studies, a jump nav `<nav aria-label="Layers on this page">` with links `Performance`, `Backstage`, `Trapdoor` pointing at `#performance`, `#backstage`, `#trapdoor`. On the homepage the drape is `display: none` and both columns (or both faces) are visible.

**Reduced motion.** The curtain does not animate. The drape is placed directly at its end state, Backstage cells switch `visibility` and `opacity` in the same frame, the mobile face swap has no clip-path animation, and skin colours change instantly (`--dur-*` are 0 ms). Announcement, focus and persistence behave exactly as in the animated path.

### 8.2 The Backstage step-through

**Trigger:** activating a step header (click, tap, Enter, Space); the Previous and Next buttons; "Show all steps"; a `stepref` link; a `#step-n` fragment on load or `hashchange`; browser find-in-page landing inside a collapsed step.

**Behaviour**

1. **Server markup (no JS).** `<ol class="steps">` with every step expanded. The header is `<h2 class="step__head"><span class="step__head-inner">…</span></h2>`. The step navigation buttons and "Show all steps" are rendered with `hidden` (JS-only).
2. **Enhancement.** When the Backstage layer is first visible, `main.js` replaces each `.step__head-inner` span with a `<button type="button" class="step__toggle">` carrying the same children, sets `aria-expanded` and `aria-controls="step-n-body"`, reveals the JS-only controls, and finally sets `data-enhanced` on the `<ol>`. The collapse CSS is keyed to `.steps[data-enhanced]`, so a script failure at any earlier point leaves every step open and readable.
3. **Initial state.** Step 1 open, or the step named by the fragment. If `localStorage["prestige.steps"]` is `all`, every step is open and "Show all steps" is pressed.
4. **Open a step** (mode "one"): close every other step, open the target. Collapsed bodies use `hidden="until-found"` so find-in-page and fragment navigation can reach them; a `beforematch` listener opens the step.
5. **Next / Previous:** open the target step, close the current one (mode "one"), move focus to the target's header button, scroll it to the top (`scroll-margin-top: 4rem`).
6. **Show all steps** (`aria-pressed`): pressed opens every step and stores `all`; unpressed keeps only the step containing focus (or step 1) open and stores `one`.
7. **`stepref` and fragments:** switch to Backstage for this page load without persisting (8.1), open the step, move focus to its header.
8. **Unknown step** (`#step-9`): ignore the fragment, open step 1 and show the error panel from 7.3 in the polite live region for 6 seconds.
9. Expansion animates `grid-template-rows` (6.7); body content is always in the DOM.

**Keyboard**

| Key | Effect |
|---|---|
| Tab | Moves through header buttons, "Show all steps", and (inside an open step) links, code regions and the Previous/Next buttons. |
| Enter, Space | Toggle the focused step. |
| ↓ / ↑ | Move focus to the next / previous step header button (accordion pattern). |
| Home / End | First / last step header button. |

**Screen-reader announcements.** The header button's accessible name is built from its content: "Step 3 of 6: Hypotheses. Three ways the numbers could be wrong. Duplicates, slow matching, ordering: two confirmed, one refuted." (the number box and chevron are `aria-hidden`; the visually hidden "Step 3 of 6:" leads the content). State comes from `aria-expanded` ("expanded" or "collapsed"). Previous/Next buttons are named "Previous: step 2, Constraints" and "Next: step 4, Rejected options". Focus moves to the new header, so its name and state are read; no extra live message is sent (that would double the announcement). "Show all steps" is read as "Show all steps, toggle button, pressed" or "not pressed". The unknown-step message is announced through the polite live region.

**No-JS fallback.** All steps expanded in order; `stepref` links are plain anchors; Previous/Next and "Show all steps" are absent; each step still has its number, kind code and gist.

**Reduced motion.** Steps open and close in one frame; focus and scroll behaviour are unchanged.

### 8.3 The before/after comparison

**Trigger:** none. It is a static, server-rendered component; this is deliberate (no slider, no drag, no swipe).

**Behaviour:** layout is decided by a container query at 40 rem (side by side with a connector; stacked with a "then ↓" connector below). Code panes scroll horizontally inside their own region.

**Keyboard:** Tab reaches each code region (`tabindex="0"`); arrow keys scroll it. Images are not focusable.

**Screen-reader announcements:** the figure is read with its caption. Each pane is a group named by its chip: "Before: Spreadsheet export with 212 unmatched lines highlighted." and "After: Dashboard with 3 unmatched lines." Code regions are announced "Before code, scrollable, region". A `ba-metric` is read as one sentence: "Month-end reconciliation: before 3 h 10 min, after 14 min, 93% lower."

**No-JS fallback:** identical; it never needed JavaScript.

**Reduced motion:** nothing animates.

### 8.4 Fragment routing

Handled in `main.js` on load and on `hashchange`.

| Fragment | Mode forced (not persisted) | Then |
|---|---|---|
| `#performance`, `#result` | Performance | Scroll to the layer or result block. |
| `#backstage` | Backstage | Scroll to the Backstage layer. |
| `#step-n` | Backstage | Open step n; focus its header. |
| `#trapdoor` | Backstage | Scroll to the Trapdoor section. |
| Any other fragment | unchanged | Native behaviour. |

After a forced mode, the toggle shows the mode actually in effect. The next page the visitor opens uses their stored preference again.

### 8.5 Copy email address

**Trigger:** activating "Copy address" in a contact block. **Behaviour:** `navigator.clipboard.writeText(email)`; the button is `aria-disabled="true"` and reads "Copying…" while pending; on success it reads "Copied" for 2 seconds and a polite live region announces "Email address copied."; on failure it reads "Copy failed", selects the address text with a `Range`, and the error panel shows "Couldn't copy. The address is selected: press Ctrl+C." **Keyboard:** Enter or Space. **Screen reader:** button name "Copy email address"; messages as above. **No-JS fallback:** the button is not rendered; the `mailto:` link works. **Reduced motion:** the label change is instant; nothing animates.

### 8.6 Scheme switch

**Trigger:** the footer's Auto / Light / Dark radios. **Behaviour:** Auto removes `data-scheme` and the stored key; Light and Dark set `data-scheme` and write `localStorage["prestige.scheme"]`. The inline head script applies a stored value before first paint. **Keyboard:** native radio group (arrow keys). **Screen reader:** "Colour scheme, group. Auto, radio button, 1 of 3, selected"; no live message (the page content does not change). **No-JS fallback:** not rendered; the operating-system preference applies through `color-scheme: light dark`. **Reduced motion:** colours change instantly.

---

## 9. Responsive behaviour

### 9.1 What changes at each breakpoint

| Breakpoint | Changes |
|---|---|
| **320 to 479 px (base)** | One column. Page padding 16 px (content 288 px at 320, 328 px at 360). Header: wordmark on one line, nav on the next. Valance 48 px with two toggle segments sharing the width (up to 148 px each); status text hidden. Home: stage is a list of cards, one face per card, switched by mode; card pelmet bar 40 px. Case study: barcode strip is a vertical label; result metrics stacked; comparisons stacked. Step ticks: six 44 px squares, wrapping to two rows below 360 px. Display XL is 40 px (Performance) or 28 px (Backstage). |
| **≥ 480 px (`--bp-sm`)** | Chips and step ticks sit on one row; nav and wordmark share a line when they fit; stage cards show cover beside text in the standard variant. |
| **≥ 768 px (`--bp-md`)** | Page padding 24 px. Barcode strip becomes horizontal (four cells in one row). Programme rows go two-line with counts at the right. Footer has three columns. Case-study meta line is one row. Still one face per card on the homepage. |
| **≥ 960 px (`--bp-lg`)** | **The split stage appears**: two 50% columns, pelmet, drape, key legend; both faces visible at once. 12-column grid; result block 7 / 5; page padding 32 px. Valance status text appears. Display XL reaches 72 px at about 1015 px. |
| **≥ 1280 px (`--bp-xl`)** | Page padding 40 px (content exactly 1200 px at 1280). Asides move to the right margin. Headliner row at its full 560 px. `#wide` figures span the container; `#bleed` figures span the viewport. |
| **Container query ≥ 40 rem** | Before/after panes go side by side, wherever the component sits. |
| **Zoom 200% and 400%** | At 400% zoom a 1280 px viewport behaves as 320 px: everything reflows into the base layout with no horizontal page scroll. Only code regions and tables scroll horizontally, inside their own regions. |

### 9.2 Hard problem 1: Both modes with JavaScript disabled

**Decision.** Each case study is one HTML document in which Performance, Backstage and Trapdoor are three sections in that order, all fully rendered. Hiding is added only by script-gated CSS; nothing is removed from the HTML.

**How**

- `<section aria-label="Performance">`, `<section aria-label="Backstage" data-mode="backstage">`, `<section aria-label="Trapdoor" data-mode="backstage">`. Section landmarks give screen-reader users navigation between layers; the `data-mode` attribute lets the Backstage and Trapdoor layers keep their own palette and type even though `<html>` carries no `data-mode` without JS.
- Between layers a decorative divider bar (`aria-hidden`, curtain fill, label face: "Backstage: how it was made") makes the sequence legible visually.
- Layer hiding rules exist only under `html.js[data-mode="performance"]` and `html.js[data-mode="backstage"]`. Step collapse exists only under `.steps[data-enhanced]`. A script that fails to load, is blocked, or throws leaves every layer and step visible.
- The trapdoor `strip` (a summary of the full section that follows) is `display: none` without JS to avoid duplicating the content.
- The valance is CSS-sticky without JS and carries the jump links (8.1). Previous/Next buttons, "Show all steps", the scheme switch and the copy button are not rendered visibly without JS.
- Homepage: the drape is `display: none` without `.js`, so both columns show; below 960 px both faces of each card are shown, Performance first, each under its own pelmet bar.
- The print stylesheet uses the same rules: Performance, Backstage (all steps open), Trapdoor, no valance, no drape.

**Why.** The brief requires all content reachable without JavaScript. Putting the content in the HTML, in reading order, also gives search engines, feed readers, reader modes and archives the complete case study, and makes the page robust to script failure and slow networks.

### 9.3 Hard problem 2: Toggle scope and persistence

**Decision.** Both, with different jobs. The visitor's **choice is site-wide and persistent** (`localStorage["prestige.mode"]`, no expiry, no cookie). A **URL fragment overrides the mode for one page load and never writes storage**. There is one control, in the valance; there are no per-page or per-card toggles.

**How**

- A visitor who switches to Backstage on one page finds every later case study, the homepage and the failure pages already in Backstage.
- A link ending `#backstage`, `#step-3` or `#trapdoor` always opens Backstage; `#performance` or `#result` always opens Performance. The toggle then shows the mode actually in effect.
- Storage failures (private browsing, blocked storage) degrade to per-page-load behaviour with no error shown (7.1).
- `storage` events keep open tabs in step.

**Why.** Portfolios are read in short visits by people who follow links the author sent. A persistent preference stops a visitor re-toggling on each page. Deterministic deep links let the author say "read step 3 of the ledger case" and be certain what the recipient sees. Per-page-only scope would punish the first behaviour; site-wide-only scope would break the second. A single control keeps the mental model to one idea: the curtain is up or it is down.

### 9.4 Hard problem 3: A case study with only a Performance layer

**Decision.** A case study with no `steps/*.md` is **Performance-only**. It is a first-class state, not an error. The Performance layer is shown in **both** modes; in Backstage mode it wears the Backstage skin and starts with a "call sheet" notice.

**How**

- The notice is one bordered panel at the top of the content area: title "The walkthrough isn't written up yet." Body: "This project's result is below. Ask and I'll send the steps I'd write: problem, constraints, rejected options, measured result." (override text with `backstage.note`). It includes the `brief` as a labelled "PROBLEM" line and the `cta` contact block with the mailto subject "Walkthrough: <title>".
- The toggle stays enabled and works; the status announcement says "No walkthrough is written for this case study; page styling changed." (8.1).
- The barcode strip, trapdoor strip and everything else render normally. There are no placeholder steps, no skeletons, no "coming soon", no disabled controls, no counts of zero.
- On the homepage the Backstage face shows `brief` and "Walkthrough on request." with a mailto link.
- `backstage.md` with `status: in-progress` and some steps renders the steps that exist plus a closing notice: "Walkthrough in progress: 6 of 9 steps published."

**Why.** An empty layer looks broken; an honest statement plus a way to get the content reads as deliberate and gives the visitor something to do. Keeping the toggle live preserves the principle that the control never changes state by itself.

### 9.5 Hard problem 4: Before/after comparisons on mobile

**Decision.** Below a 40 rem container width the two sides **stack, Before above After**, each under a persistent labelled chip, joined by a "then ↓" connector. No slider, no drag handle, no swipe, no in-place flip.

**How, per type**

| Type | At ≥ 40 rem | Below 40 rem |
|---|---|---|
| Image | Two columns, 3 rem gutter with a `→` connector; `sizes="(min-width: 60rem) 340px, (min-width: 40rem) 45vw, 100vw"` | Single column, each image full container width (328 px at 360 px); same alt text; `width`/`height` reserved |
| Code | Two columns; each `<pre tabindex="0">` scrolls horizontally | Stacked; lines never wrap (structure matters); each block is its own focusable scroll region with a scroll hint (an edge shadow using `background-attachment: local`); gutter `+` / `−` markers stay |
| Metric | `<dl>` with label, Before, After, delta in one row | Label row, then Before, After and delta stacked, each value at `--t-metric-l`, with a `↓` connector |

**Why.** Stacking preserves narrative order (before, then after) and costs only vertical scroll. A drag slider is hard to use on touch, needs an alternative to satisfy WCAG 2.5.7, and hides the very detail the comparison exists to show. An in-place flip makes the reader compare from memory. Code is the exception that scrolls, because wrapping would destroy indentation, and WCAG's reflow rule exempts code.

### 9.6 Hard problem 5: The split-stage homepage at 360 px

**Decision.** Below 960 px the split becomes **a vertical stack of cards, each with two faces and one visible at a time**, chosen by the same site-wide mode. Each card begins with a 40 px curtain-fill **pelmet bar** that names its face. The toggle stays in the sticky valance, so it is reachable at any scroll position.

**How**

- Faces are `display: none` when inactive (not just `visibility: hidden`), so the hidden face leaves the tab order and the accessibility tree.
- Switching plays the clip-path wipe of 6.7: the Backstage face is revealed from the bottom upward (a hem rising); the Performance face from the top downward (a curtain falling). Under reduced motion the faces swap instantly.
- Without JS both faces appear, Performance first, each under its pelmet bar.
- There are no tabs, no accordions, no horizontal scrolling and no per-card toggle.
- At 768 to 959 px the structure is the same, with the cover beside the text inside each face.

**Why.** The metaphor survives (a hem rising is the same story as a drape rising), the one-control model survives, and each face carries the card's full information, so nothing needs a second tap. Side-by-side at 328 px would mean two columns of 160 px; a per-card toggle would create a second state machine that could disagree with the first.

### 9.7 Hard problem 6: A portfolio with only two case studies

**Decision.** Unequal rows plus fixed furniture. The stage always has a **headliner** and supporting acts, a count-driven title, and, when there are three case studies or fewer, a closing "stage manager's note" so the page never ends early.

| Case studies | Stage title | Layout |
|---|---|---|
| 1 | "Solo performance" | One headliner row, 640 px minimum, title 60 px; all (up to three) result metrics shown instead of one |
| 2 | "Double bill" | Headliner (about 560 px, cover 568 px wide) then one supporting act (about 360 px, cover 200 px wide, two metrics) |
| 3 | "Triple bill" | Headliner and two supporting acts (about 300 px each) |
| 4 | "The season" | Headliner and three supporting acts |
| 5 or more | "The season" | As above, plus the Programme list below the stage |

Page furniture for **n ≤ 3**: intro, stage, trapdoor strip (if any failure exists), then the **stage manager's note**: the About `lede`, a link to About and the `cta` contact block, about 240 px tall. With two case studies the homepage is therefore about 2,050 px tall at 1280 px, a full page rather than a short list.

**Why.** An equal grid with two items looks like a grid missing items. A headliner and a supporting act is a composition. The count-driven title names the situation honestly ("Double bill") so it reads as chosen, and the closing note gives the page a deliberate end. Empty placeholder tiles are never added (principle P6).

### 9.8 Hard problem 7: Backstage mode and light/dark mode

**Decision.** **Backstage is not dark mode.** Mode and scheme are independent axes, giving four palettes (6.1): Playbill, House Dark, Cardboard Day, Cardboard Night. Mode changes material and voice (cream paper and slab type versus corrugated board, monospace type, dashed label edges and flat panels). Scheme changes luminance.

**How:** `data-mode` and `data-scheme` are separate attributes with separate storage keys; every colour token is declared once per mode with `light-dark()`; the footer scheme switch and the valance toggle are separate controls; every palette passes the contrast table in 6.2.

**Why**

1. Dark is a property of the visitor's environment and eyes (bright rooms, astigmatism, light sensitivity, battery), not of the content. Tying it to Backstage would force light-sensitive visitors out of the very layer they came for, or force the others to read the polished results in the dark.
2. Backstage holds the densest reading in the theme: code diffs, constraint tables, metrics. It most needs a light option.
3. Dark-equals-process is exactly the "developer control panel" pattern Prestige exists to replace.
4. Cardboard, monospace, dashed edges and flat panels differentiate Backstage in every scheme, so the mode change never depends on lightness.

---

## 10. Accessibility

Target: **WCAG 2.2 Level AA**. Each item names the criterion and how a reviewer verifies it.

### 10.1 Structure and navigation

- [ ] Every page has `lang="en"` on `<html>`, a unique `<title>` ("Case title · Site title"), one `<h1>`, and no skipped heading levels. Case-study layers use `<section aria-label>` (not headings), so the steps and the Trapdoor are `<h2>`. (1.3.1, 2.4.2, 2.4.6; check with an outline tool.)
- [ ] Landmarks: `<header>`, `<nav aria-label="Primary">`, `<main id="content">`, `<footer>`; the jump nav has its own label. (1.3.1)
- [ ] The first focusable element is the skip link; it moves focus to `<main tabindex="-1">`. (2.4.1)
- [ ] The valance appears in the same place on every page and the footer contact block is in the same place on every page. (3.2.3, 3.2.6)
- [ ] Current page and section are exposed with `aria-current`. (1.3.1)
- [ ] Reading order equals DOM order in both modes; no CSS `order` reorders content. (1.3.2, 2.4.3)

### 10.2 The toggle and the layers

- [ ] The toggle is a radio group in a `<fieldset>` with a `<legend>`; its accessible names are "Performance" and "Backstage" and match the visible text. (4.1.2, 2.5.3)
- [ ] Changing mode announces the strings of 8.1 through a polite `role="status"` region; the initial state is not announced. (4.1.3)
- [ ] Focus stays on the toggle after a change. (3.2.2)
- [ ] Hidden layers use `display: none`, never off-screen positioning, so they are not read or tabbable. (1.3.2, 2.4.3)
- [ ] The homepage hidden face (below 960 px) and the covered Backstage column (from 960 px) are out of the tab order and the accessibility tree while hidden. (2.4.3)
- [ ] The drape, barcode graphics, chevrons, number boxes and connectors are `aria-hidden`; no information exists only in them. (1.1.1, 1.3.1)

### 10.3 The step-through

- [ ] Step headers are real `<button>`s inside `<h2>`, with `aria-expanded` and `aria-controls`. (4.1.2)
- [ ] The accessible name includes "Step n of N", the kind, title and gist, in that order. (2.5.3, 2.4.6)
- [ ] ↑ ↓ Home End move between step headers; there are no character-key shortcuts. (2.1.1, 2.1.4)
- [ ] After Next/Previous, focus is on the new header and the header is not covered by the valance (`scroll-margin-top: 4rem`). (2.4.3, 2.4.11)
- [ ] With scripts blocked, every step is visible and numbered. (1.3.1)
- [ ] An unknown `#step-n` is reported in the live region and does not strand focus. (3.3.1)

### 10.4 Comparisons, images, code

- [ ] `alt` is mandatory for every image through the render hook and shortcodes; decorative images need an explicit `#decorative`. (1.1.1; the build fails otherwise.)
- [ ] Before and after panes are labelled groups; the labels are text, not colour. (1.4.1)
- [ ] Code regions are keyboard-focusable and labelled; diff markers are glyphs, not tint alone. (2.1.1, 1.4.1)
- [ ] No drag, swipe or slider interaction exists anywhere. (2.5.1, 2.5.7)

### 10.5 Colour, contrast and focus

- [ ] Every text token pair in 6.2 is at least 4.5:1 and every UI/focus pair at least 3:1, in all four palettes. (1.4.3, 1.4.11)
- [ ] Every status carried by colour has a text or shape carrier (the table in 6.2). (1.4.1)
- [ ] `:focus-visible` shows a 3 px ring with 3 px offset on every interactive element, including on the curtain fill. (2.4.7; the ring size and contrast also meet the AAA criterion 2.4.13.)
- [ ] The sticky valance does not hide a focused element: `html { scroll-padding-top: 4rem }`. (2.4.11)
- [ ] Interactive targets are at least 44 × 44 px (the requirement is 24 px). (2.5.8)
- [ ] `forced-colors: active`: the toggle, chips, steps and panels keep visible borders (`border: 2px solid CanvasText`); selected segment uses `Highlight` / `HighlightText`; the drape gets a `CanvasText` border; barcode bars use `CanvasText`. (1.4.11)
- [ ] `prefers-contrast: more` thickens borders and sets muted text to full-strength text (6.9).

### 10.6 Motion, text and reflow

- [ ] Under `prefers-reduced-motion: reduce` nothing animates; the curtain changes state in one frame (6.7, 8.1). (2.3.3)
- [ ] No content flashes; no autoplay; no parallax. (2.3.1, 2.2.2)
- [ ] The layout survives text spacing overrides of 1.5 line height, 2 × paragraph spacing, 0.12 em letter spacing and 0.16 em word spacing: step headers use `min-height`, nothing has a fixed text height. (1.4.12)
- [ ] No horizontal page scroll at 320 px width or at 400% zoom; only code and tables scroll, inside their own region. (1.4.10)
- [ ] Text resizes to 200% without loss; sizes are in `rem`. (1.4.4)
- [ ] Orientation is not locked. (1.3.4)

### 10.7 Status and errors

- [ ] Copy success and failure are announced through a live region; the failure message is text with "Error:" and an icon. (4.1.3, 3.3.1)
- [ ] The theme has no forms, no authentication, no CAPTCHA and no time limits, so 3.3.7, 3.3.8 and 2.2.1 do not apply.

### 10.8 Manual test script (must pass before a release)

| Environment | Script |
|---|---|
| Keyboard only, any browser | Tab from the top of the homepage to the footer without a mouse; switch mode with the arrow keys; open every step of a case study with Enter; confirm focus is never lost or hidden under the valance. |
| NVDA + Firefox (Windows) | Landmarks list shows Primary, Performance, Backstage, Trapdoor; toggle announced as a radio group; mode change announced; step headers announced with number and state. |
| VoiceOver + Safari (macOS and iOS) | Same checks; confirm the hidden mobile face is not reachable by swiping. |
| JavaScript disabled | Every page readable top to bottom; both layers present; no dead controls visible. |
| 200% and 400% zoom; 320 px | No loss of content or function; no page-level horizontal scroll. |
| Windows High Contrast / `forced-colors` | All boundaries and states visible. |
| Automated | axe-core and Lighthouse accessibility on the homepage, a case study in each mode, the failures list, About, a term page and the 404, with zero violations. |

---

## 11. Hugo implementation map

Target: Hugo extended ≥ 0.146.0 (new template system). Every name below is a real path in that system: `layouts/baseof.html`, `layouts/home.html`, `layouts/page.html`, `layouts/section.html`, `layouts/taxonomy.html`, `layouts/term.html`, `layouts/404.html`, `layouts/_partials/`, `layouts/_shortcodes/`, `layouts/_markup/render-*.html`. Section-specific templates live in `layouts/<section>/page.html` and `layouts/<section>/section.html`; a content file with `type: about` resolves to `layouts/about/page.html`. The mechanics that carry risk were built and run on v0.167.0 extended: page-resource steps with `.Content` and shortcodes, bundle lookup through `.File.Dir`, `render-image` inside step resources, `urls.Parse` for the width fragment, `css.Build` with `@import`, `@layer`, nesting, `@container` and `light-dark()`, `js.Build` as an IIFE, `transform.Highlight` on bundle text files, WebP and JPEG processing with `Resize` and `Fill`, and the page-type layout lookups.

### 11.1 Theme file tree

```
prestige/
├── theme.toml
├── hugo.toml
├── README.md
├── LICENSE
├── images/
│   ├── screenshot.png                  # 1500 × 1000 (12.7)
│   └── tn.png                          # 900 × 600  (12.7)
├── archetypes/
│   ├── default.md
│   ├── trapdoor.md
│   └── work/                           # bundle archetype: hugo new content work/<slug>
│       ├── index.md
│       ├── backstage.md
│       └── steps/
│           └── 01-problem.md
├── i18n/
│   └── en.toml
├── assets/
│   ├── css/
│   │   ├── main.css                    # entry: layer order + @imports
│   │   ├── reset.css
│   │   ├── tokens.css                  # 6.9
│   │   ├── base.css                    # element styles, typography roles, links, focus
│   │   ├── syntax.css                  # Chroma class colours (--syn-*)
│   │   ├── layout.css                  # container, grid, page padding, skip link, sr-only
│   │   ├── components/
│   │   │   ├── valance.css
│   │   │   ├── curtain-toggle.css
│   │   │   ├── header.css
│   │   │   ├── footer.css
│   │   │   ├── stage.css               # stage, stage-row, drape, pelmet, step ticks
│   │   │   ├── barcode.css
│   │   │   ├── metric.css
│   │   │   ├── step.css                # step, kind blocks, panels, stamps
│   │   │   ├── before-after.css
│   │   │   ├── failure.css
│   │   │   ├── contact.css
│   │   │   ├── programme-row.css
│   │   │   └── misc.css                # chip, button, aside, pager, notices, code, table
│   │   ├── pages/
│   │   │   ├── home.css
│   │   │   ├── case.css                # layers, dividers, result block, no-JS jump nav
│   │   │   ├── failures.css
│   │   │   ├── about.css
│   │   │   ├── term.css
│   │   │   └── notfound.css
│   │   ├── prefs.css                   # forced-colors, prefers-contrast, reduced-motion gating
│   │   └── print.css
│   ├── js/
│   │   ├── head-init.js                # inline in <head> (11.5)
│   │   ├── main.js                     # entry: imports the modules below
│   │   ├── util.js                     # safe storage, live-region helper, matchMedia helper
│   │   ├── mode.js                     # 8.1
│   │   ├── scheme.js                   # 8.6
│   │   ├── route.js                    # 8.4
│   │   ├── steps.js                    # 8.2
│   │   └── copy.js                     # 8.5
│   ├── fonts/
│   │   ├── AlfaSlabOne-latin.woff2
│   │   ├── LibreFranklin-latin.woff2
│   │   ├── LibreFranklin-latin-ext.woff2
│   │   ├── PlexMono-400-latin.woff2
│   │   ├── PlexMono-400-latin-ext.woff2
│   │   ├── PlexMono-500-latin.woff2
│   │   ├── PlexMono-700-latin.woff2
│   │   ├── OFL-AlfaSlabOne.txt
│   │   ├── OFL-LibreFranklin.txt
│   │   └── OFL-IBMPlexMono.txt
│   └── img/
│       └── og-default.png              # 1200 × 630 fallback Open Graph image
├── static/
│   └── favicon.svg                     # curtain-red square with a white "P" in the slab face (outlined paths)
├── layouts/
│   ├── baseof.html
│   ├── home.html
│   ├── page.html                       # generic fallback page
│   ├── section.html                    # generic fallback section
│   ├── taxonomy.html
│   ├── term.html
│   ├── 404.html
│   ├── work/
│   │   ├── page.html                   # case study
│   │   └── section.html                # Programme
│   ├── trapdoor/
│   │   ├── page.html                   # failure report
│   │   └── section.html                # failures list
│   ├── about/
│   │   └── page.html
│   ├── _partials/
│   │   ├── head/
│   │   │   ├── meta.html
│   │   │   ├── seo.html
│   │   │   ├── fonts.html
│   │   │   ├── js-init.html
│   │   │   ├── css.html
│   │   │   └── js.html
│   │   ├── site/
│   │   │   ├── skip-link.html
│   │   │   ├── header.html
│   │   │   ├── valance.html
│   │   │   ├── footer.html
│   │   │   └── scheme-switch.html
│   │   ├── components/
│   │   │   ├── curtain-toggle.html
│   │   │   ├── stage.html
│   │   │   ├── stage-row.html
│   │   │   ├── stage-note.html
│   │   │   ├── case-head.html
│   │   │   ├── result-block.html
│   │   │   ├── barcode.html
│   │   │   ├── metric.html
│   │   │   ├── ba-metric.html
│   │   │   ├── step.html
│   │   │   ├── step-problem.html
│   │   │   ├── step-constraints.html
│   │   │   ├── step-hypotheses.html
│   │   │   ├── step-rejected.html
│   │   │   ├── step-implementation.html
│   │   │   ├── step-result.html
│   │   │   ├── step-note.html
│   │   │   ├── performance-only-notice.html
│   │   │   ├── trapdoor-strip.html
│   │   │   ├── failure-entry.html
│   │   │   ├── contact-block.html
│   │   │   ├── programme-row.html
│   │   │   ├── chip.html
│   │   │   └── pager.html
│   │   └── lib/
│   │       ├── bundle.html
│   │       ├── steps.html
│   │       ├── counts.html
│   │       ├── ref.html
│   │       ├── img.html
│   │       ├── barcode-bars.html
│   │       └── validate.html
│   ├── _shortcodes/
│   │   ├── metric.html
│   │   ├── ba-metric.html
│   │   ├── ba-image.html
│   │   ├── ba-code.html
│   │   ├── aside.html
│   │   └── stepref.html
│   └── _markup/
│       ├── render-image.html
│       ├── render-heading.html
│       ├── render-link.html
│       ├── render-codeblock.html
│       └── render-table.html
├── tools/
│   ├── capture-screenshots.mjs         # Playwright capture for 12.7 (development only)
│   └── check-budgets.sh                # CSS/JS size gate (11.5)
└── exampleSite/                        # 12.1
```

### 11.2 What each file does

| File | Purpose |
|---|---|
| `theme.toml`, `hugo.toml`, `README.md`, `LICENSE`, `images/*` | Catalogue metadata and defaults (11.9). |
| `archetypes/work/*` | `hugo new content work/<slug>` creates a complete bundle: `index.md` with all required fields set to prompts, `backstage.md`, and one step skeleton. |
| `archetypes/trapdoor.md` | Failure skeleton with every required field. |
| `i18n/en.toml` | Every user-visible string (11.8). |
| `layouts/baseof.html` | Document shell: `<html lang data-default-mode>`, head partials, skip link, header, valance, `<main id="content" tabindex="-1">`, footer, script. |
| `layouts/home.html` | Intro, stage (`components/stage.html`), trapdoor strip, Programme list (if enough case studies), stage-manager's note (if 3 or fewer). |
| `layouts/work/page.html` | The case study: head, barcode, Performance layer, Backstage layer, Trapdoor layer (11.6). |
| `layouts/work/section.html`, `layouts/term.html`, `layouts/taxonomy.html` | Programme and term pages share `components/programme-row.html` and `components/failure-entry.html`. |
| `layouts/trapdoor/page.html`, `layouts/trapdoor/section.html` | Failure report and failures list. |
| `layouts/about/page.html` | About. |
| `layouts/404.html` | A failure entry with fixed copy, three exits, the latest case study. |
| `layouts/page.html`, `layouts/section.html` | Fallbacks for content outside the model: measure-width prose in the Performance skin. |
| `_partials/head/*` | `meta`: charset, viewport, `color-scheme`, theme colour `#8E1B26`, favicon. `seo`: description, canonical, Open Graph and Twitter tags, `og:image` from `og_image`, `cover.image`, then `params.seo.og_image` (`Fill "1200x630 jpg q85 Smart"`). `fonts`: preloads and inline `@font-face`. `js-init`: the inline head script. `css`, `js`: fingerprinted bundles. |
| `_partials/site/*` | Skip link; header; valance (toggle, status text, `data-*` message strings, no-JS jump nav); footer; scheme switch. |
| `_partials/components/*` | One partial per component of section 7, plus the seven step-kind blocks. Partials take a `dict` context and never read `.Page` implicitly. |
| `_partials/lib/bundle.html` | Resolves the owning case-study bundle from a page or step (11.7). |
| `_partials/lib/steps.html`, `counts.html`, `ref.html` | Sorted steps; derived counts; computed refs (3.13). |
| `_partials/lib/img.html` | The only place that calls image processing (11.4). |
| `_partials/lib/barcode-bars.html` | The decorative SVG (7.6). |
| `_partials/lib/validate.html` | Build-time schema checks (3.6). |
| `_shortcodes/*` | The six shortcodes of 3.8. Each resolves files through `lib/bundle.html` and renders through the matching component partial. |
| `_markup/render-image.html` | Resolves the file in the owning bundle, parses the width fragment (`#wide`, `#bleed`, `#decorative`), calls `lib/img.html`, wraps in `<figure>` when a title is present, errors on empty alt. |
| `_markup/render-heading.html` | Adds `id`, demotes an authored `#` to `##` (the page owns the H1), and errors on a skipped level. |
| `_markup/render-link.html` | Appends `↗` (`aria-hidden`) and a visually hidden "(external)" for absolute URLs on other hosts; no `target="_blank"`. |
| `_markup/render-codeblock.html` | Uses `transform.HighlightCodeBlock`; wraps in `<div class="code" data-lang>` with the `<pre tabindex="0" role="region" aria-label="<lang> code, scrollable">`; supports `title` and `hl_lines`. |
| `_markup/render-table.html` | Wraps tables in a focusable, labelled scroll region. |
| `assets/css/*`, `assets/js/*`, `assets/fonts/*`, `assets/img/*` | Source assets; only `main.css`, `main.js`, `head-init.js` and the fonts are referenced from templates. |
| `tools/*` | Development only; never published to a site. |

### 11.3 Render hooks

| Hook | Input | Output |
|---|---|---|
| `render-image` | `![alt](bundle/path.png#wide "caption")` | `<figure class="figure figure--wide"><picture>…</picture><figcaption>caption</figcaption></figure>`. `#bleed` adds `figure--bleed` (Performance layer only; ignored inside Backstage). SVG and GIF pass through unprocessed. A path that does not resolve in the bundle: `errorf`. |
| `render-heading` | `## Title` | `<h2 id="title">Title</h2>`; levels below 2 become 2; a jump of more than one level fails the build. |
| `render-link` | `[text](https://other.example)` | `<a href rel="noopener">text<span aria-hidden="true"> ↗</span><span class="sr-only"> (external)</span></a>`. |
| `render-codeblock` | fenced block | Chroma-classed `<pre><code>` in a scroll region. |
| `render-table` | pipe table | Table inside `<div class="table-scroll" tabindex="0" role="region" aria-label="Table, scrollable">`. |

All hooks resolve bundle paths through `partial "lib/bundle.html" .PageInner`, so the same markdown works in `index.md` and in any step file.

### 11.4 Image processing

`lib/img.html` is the only template that touches image processing; every output is WebP with a JPEG fallback. Originals are never published. AVIF is not produced (encoder availability and build time vary by installation).

```go-html-template
{{- /*
  Responsive image. Context: dict
    "res"    (resource, required)   "alt" (string, required)
    "sizes"  (string)               "widths" (slice of int; default 480 800 1200 1600)
    "ratio"  (float: height/width; when set the image is cropped with Fill)
    "anchor" (string; default "Smart")
    "eager"  (bool)                 "class" (string)
*/ -}}
{{- $res := .res -}}
{{- $sub := $res.MediaType.SubType -}}
{{- if or (eq $sub "svg+xml") (eq $sub "gif") -}}
<img{{ with .class }} class="{{ . }}"{{ end }} src="{{ $res.RelPermalink }}" alt="{{ .alt }}"{{ if $res.Width }} width="{{ $res.Width }}" height="{{ $res.Height }}"{{ end }} loading="{{ cond .eager "eager" "lazy" }}" decoding="async">
{{- else -}}
  {{- $hint := cond (eq $sub "png") "text" "photo" -}}
  {{- $anchor := .anchor | default "Smart" -}}
  {{- $ratio := .ratio -}}
  {{- $usable := slice -}}
  {{- range (.widths | default (slice 480 800 1200 1600)) -}}{{- if le . $res.Width -}}{{- $usable = $usable | append . -}}{{- end -}}{{- end -}}
  {{- if not $usable -}}{{- $usable = slice $res.Width -}}{{- end -}}
  {{- $srcset := slice -}}
  {{- $fallbackW := index $usable 0 -}}
  {{- range $usable -}}
    {{- $w := . -}}
    {{- $v := "" -}}
    {{- if $ratio -}}
      {{- $h := int (math.Round (mul (float $w) $ratio)) -}}
      {{- $v = $res.Fill (printf "%dx%d webp q80 %s %s" $w $h $hint $anchor) -}}
    {{- else -}}
      {{- $v = $res.Resize (printf "%dx webp q80 %s" $w $hint) -}}
    {{- end -}}
    {{- $srcset = $srcset | append (printf "%s %dw" $v.RelPermalink $w) -}}
    {{- if le $w 1200 -}}{{- $fallbackW = $w -}}{{- end -}}
  {{- end -}}
  {{- $fb := "" -}}
  {{- if $ratio -}}
    {{- $fb = $res.Fill (printf "%dx%d jpg q82 %s" $fallbackW (int (math.Round (mul (float $fallbackW) $ratio))) $anchor) -}}
  {{- else -}}
    {{- $fb = $res.Resize (printf "%dx jpg q82" $fallbackW) -}}
  {{- end -}}
<picture>
  <source type="image/webp" srcset="{{ delimit $srcset ", " }}"{{ with .sizes }} sizes="{{ . }}"{{ end }}>
  <img{{ with .class }} class="{{ . }}"{{ end }} src="{{ $fb.RelPermalink }}" width="{{ $fb.Width }}" height="{{ $fb.Height }}" alt="{{ .alt }}" loading="{{ cond .eager "eager" "lazy" }}"{{ if .eager }} fetchpriority="high"{{ end }} decoding="async">
</picture>
{{- end -}}
```

Per use:

| Use | `ratio` | `widths` | `sizes` | Loading |
|---|---|---|---|---|
| Case-study cover (Performance layer) | 0.525 (1200 × 630) | 800, 1200, 1600 | `(min-width: 75rem) 1200px, 100vw` | eager, `fetchpriority="high"` |
| Stage cover, headliner | 0.5625 (16:9) | 480, 800, 1136 | `(min-width: 60rem) 568px, 100vw` | eager for the first row, lazy otherwise |
| Stage cover, standard | 0.5625 | 400, 640, 960 | `(min-width: 30rem) 200px, 100vw` | lazy |
| Figure in the measure | none | 480, 800, 1200, 1600 | `(min-width: 48rem) 680px, 100vw` | lazy |
| `#wide` figure | none | 480, 800, 1200, 1600 | `(min-width: 75rem) 1200px, 100vw` | lazy |
| `#bleed` figure | none | 800, 1200, 1600, 2400 | `100vw` | lazy |
| `ba-image` pane | none | 480, 800, 1200 | `(min-width: 60rem) 340px, (min-width: 40rem) 45vw, 100vw` | lazy |
| Open Graph | 0.525 | 1200 only, JPEG | n/a | n/a |

Global `[imaging]`: `quality = 80`, `resampleFilter = "CatmullRom"`, `anchor = "Smart"`, `exif.disableLatLong = true`. The `cover.focus` field overrides the anchor. The PNG hint `text` keeps screenshot edges crisp.

### 11.5 Asset pipeline, inline script, budgets

**Stylesheet.** `layouts/_partials/head/css.html`:

```go-html-template
{{- with resources.Get "css/main.css" | css.Build (dict "minify" hugo.IsProduction) | fingerprint -}}
<link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}">
{{- end -}}
```

`assets/css/main.css` declares the layer order once and imports every file into its layer (`tokens.css` declares its own `@layer tokens`):

```css
@layer reset, tokens, base, syntax, layout, components, pages, prefs, print;
@import "./reset.css" layer(reset);
@import "./tokens.css";
@import "./base.css" layer(base);
@import "./syntax.css" layer(syntax);
@import "./layout.css" layer(layout);
@import "./components/valance.css" layer(components);
/* ...one line per component file... */
@import "./pages/home.css" layer(pages);
/* ...one line per page file... */
@import "./prefs.css" layer(prefs);
@import "./print.css" layer(print);
```

No `target` option is passed to `css.Build`, so `light-dark()`, nesting, `@layer` and `@container` are emitted as written.

**Scripts.** `head/js.html` builds `main.js` with `js.Build (dict "minify" true "target" "es2020" "format" "iife")`, fingerprints it and emits `<script src integrity defer>` before `</body>`. `head/js-init.html` builds `head-init.js` the same way and inlines it:

```go-html-template
{{- with resources.Get "js/head-init.js" | js.Build (dict "minify" true "target" "es2020" "format" "iife") -}}
<script>{{ .Content | safeJS }}</script>
{{- end -}}
```

**`assets/js/head-init.js`, verbatim:**

```js
(function (d, w) {
  var r = d.documentElement;
  function get(k) { try { return w.localStorage.getItem(k); } catch (e) { return null; } }
  var m = get("prestige.mode"), c = get("prestige.scheme"), h = w.location.hash;
  var mode = (m === "performance" || m === "backstage") ? m : (r.getAttribute("data-default-mode") || "performance");
  if (/^#(backstage|step-\d+|trapdoor)$/.test(h)) mode = "backstage";
  else if (/^#(performance|result)$/.test(h)) mode = "performance";
  r.classList.add("js");
  r.setAttribute("data-mode", mode);
  if (c === "light" || c === "dark") r.setAttribute("data-scheme", c);
})(document, window);
```

**Budgets.** Measured twice: on the concatenated source (`cat assets/css/**/*.css | wc -c`) and on the production output (`hugo --gc --minify`). Both must be under the cap. Fingerprinted files are measured, not the sources of other pipelines.

| Asset | Target | Hard cap | Allocation |
|---|---|---|---|
| CSS (source, all files) | 45.5 KB | **50 KB (51,200 bytes)** | tokens 5.5; reset + base 5.0; syntax 1.0; layout 4.0; components 21.0 (valance + toggle 3.0, header + footer 2.0, stage 3.5, barcode 1.5, metric 1.2, step 3.5, before-after 3.0, failure 1.8, contact 1.5, programme row 1.0, misc 0.0 to 1.0); pages 5.0; prefs 2.5; print 1.5 |
| JS (inline + bundle, source after build, unminified) | 13 KB | **30 KB (30,720 bytes)** | head-init 0.6; util 0.9; mode 3.0; scheme 0.9; route 1.5; steps 4.5; copy 1.0; wrapper 0.2 |
| Fonts | about 100 KB | none (outside the CSS/JS budgets) | 11.2 |
| Images | responsive WebP | none | 11.4 |

`tools/check-budgets.sh` builds `exampleSite` with `--gc --minify` and fails when any stylesheet exceeds 51,200 bytes or the sum of all scripts (including the inline one) exceeds 30,720 bytes, measured **unminified** by building once without `--minify`.

### 11.6 How both modes render from one bundle

One template renders every layer; CSS and the `data-mode` attribute choose what is visible. This is `layouts/work/page.html` in outline:

```go-html-template
{{ define "main" }}
  {{ partial "lib/validate.html" . }}
  {{ $steps    := partial "lib/steps.html" . }}
  {{ $counts   := partial "lib/counts.html" . }}
  {{ $backstage := .Resources.GetMatch "backstage.md" }}
  {{ $failures := where site.RegularPages "Params.case" .File.ContentBaseName }}
  {{ $has := gt (len $steps) 0 }}

  <article class="case" data-has-backstage="{{ $has }}">
    {{ partial "components/case-head.html" . }}
    {{ partial "components/barcode.html" (dict "page" . "variant" "full") }}
    {{ partial "components/layer-jump.html" (dict "has" $has "failures" (len $failures)) }}  {{/* .no-js-only */}}

    <section class="layer" id="performance" aria-label="Performance" data-layer="performance"
             {{ if not $has }}data-always{{ end }}>
      {{ if not $has }}{{ partial "components/performance-only-notice.html" . }}{{ end }}
      {{ partial "components/result-block.html" . }}
      {{ .Content }}
      {{ with $failures }}{{ partial "components/trapdoor-strip.html" (index . 0) }}{{ end }}
    </section>

    {{ if $has }}
    <section class="layer" id="backstage" aria-label="Backstage" data-mode="backstage" data-layer="backstage">
      <div class="layer__divider" aria-hidden="true">Backstage: how it was made</div>
      {{ with $backstage }}{{ .Content }}{{ end }}
      <ol class="steps">
        {{ range $steps }}{{ partial "components/step.html" (dict "step" . "total" (len $steps)) }}{{ end }}
      </ol>
      {{ with $backstage }}{{ if eq .Params.status "in-progress" }}…notice…{{ end }}{{ end }}
    </section>
    {{ end }}

    {{ with $failures }}
    <section class="layer" id="trapdoor" aria-label="Trapdoor" data-mode="backstage" data-layer="trapdoor">
      {{ range . }}{{ partial "components/failure-entry.html" (dict "page" . "variant" "full") }}{{ end }}
    </section>
    {{ end }}

    {{ partial "components/pager.html" . }}
    {{ partial "components/contact-block.html" (dict "variant" "cta" "page" .) }}
  </article>
{{ end }}
```

**Visibility rules** (`pages/case.css`, `layer` = `pages`). Everything is gated on `html.js`, so nothing is ever hidden without a working script:

```css
/* Performance mode: hide Backstage and the full Trapdoor section */
html.js[data-mode="performance"] .layer[data-layer="backstage"],
html.js[data-mode="performance"] .layer[data-layer="trapdoor"] { display: none; }

/* Backstage mode: hide Performance, unless the case study has no Backstage */
html.js[data-mode="backstage"] .layer[data-layer="performance"]:not([data-always]) { display: none; }

/* The trapdoor strip duplicates the Trapdoor section: show it only when that section is hidden */
.trapdoor-strip { display: none; }
html.js[data-mode="performance"] .trapdoor-strip { display: block; }

/* Step collapse exists only after steps.js has enhanced the list */
.steps[data-enhanced] .step:not([data-open="true"]) .step__panel { grid-template-rows: 0fr; }
.steps[data-enhanced] .step:not([data-open="true"]) .step__body { visibility: hidden; }
```

**Homepage rules** (`pages/home.css`):

```css
@media (min-width: 60rem) {
  .drape { transform: translateY(var(--curtain-lift, 0%)); }
  html.js[data-mode="performance"] { --curtain-lift: 0%; }
  html.js[data-mode="backstage"]   { --curtain-lift: -100%; }
  html.js[data-mode="performance"] .stage-row__back { visibility: hidden; opacity: 0; }
  html:not(.js) .drape { display: none; }
}
@media (max-width: 59.999rem) {
  .drape { display: none; }
  html.js[data-mode="performance"] .stage-row__back  { display: none; }
  html.js[data-mode="backstage"]   .stage-row__front { display: none; }
}
```

**Valance data attributes.** `site/valance.html` renders the status strings server-side, with Hugo's plural support and the known counts, so the script contains no wording: `data-kind="home|case|other"`, `data-msg-b`, `data-msg-p` and, on the homepage, `data-msg-b-narrow` and `data-msg-p-narrow` (used when the viewport is below 60 rem). `mode.js` writes the matching string into `#mode-status` (8.1).

### 11.7 Key partials

**`lib/bundle.html`**: returns the case-study bundle for any page or step resource.

```go-html-template
{{- $dir := replace .File.Dir "\\" "/" | strings.TrimSuffix "/" -}}
{{- if strings.HasSuffix $dir "/steps" }}{{ $dir = path.Dir $dir }}{{ end -}}
{{- return site.GetPage (printf "/%s" $dir) -}}
```

**`lib/steps.html`**

```go-html-template
{{- return (sort (.Resources.Match "steps/*.md") "Params.n") -}}
```

**`lib/counts.html`**: returns `steps`, `constraints`, `rejected`, `failures`.

```go-html-template
{{- $steps := partial "lib/steps.html" . -}}
{{- $c := dict "steps" (len $steps) "constraints" 0 "rejected" 0 "failures" 0 -}}
{{- range $steps -}}
  {{- if eq .Params.kind "constraints" -}}{{- $c = merge $c (dict "constraints" (len .Params.constraints)) -}}{{- end -}}
  {{- if eq .Params.kind "rejected" -}}{{- $c = merge $c (dict "rejected" (len .Params.options)) -}}{{- end -}}
{{- end -}}
{{- $c = merge $c (dict "failures" (len (where site.RegularPages "Params.case" .File.ContentBaseName))) -}}
{{- return $c -}}
```

**`lib/barcode-bars.html`**: context is the ref string.

```go-html-template
{{- $h := crypto.SHA256 . -}}
{{- $ws := slice -}}
{{- range seq 0 47 -}}
  {{- $n := int (printf "0x%s" (substr $h . 1)) -}}
  {{- $ws = $ws | append (add 1 (mod $n 4)) -}}
{{- end -}}
{{- $total := 0 -}}{{- range $ws }}{{- $total = add $total . -}}{{- end -}}
{{- $x := 0 -}}
<svg class="barcode__bars" viewBox="0 0 {{ $total }} 28" width="{{ mul $total 2 }}" height="28" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  {{- range $i, $w := $ws -}}
    {{- if eq (mod $i 2) 0 }}<rect x="{{ $x }}" width="{{ $w }}" height="28" fill="currentColor"/>{{ end -}}
    {{- $x = add $x $w -}}
  {{- end -}}
</svg>
```

**`_shortcodes/ba-image.html`** shows the pattern every shortcode follows (resolve bundle, fetch resources, fail loudly, render through the partial):

```go-html-template
{{- $b := partial "lib/bundle.html" .Page -}}
{{- $before := $b.Resources.GetMatch (.Get "before") -}}
{{- $after  := $b.Resources.GetMatch (.Get "after") -}}
{{- if not $before }}{{ errorf "ba-image: %q not found in bundle of %s" (.Get "before") .Page.File.Path }}{{ end -}}
{{- if not $after  }}{{ errorf "ba-image: %q not found in bundle of %s" (.Get "after")  .Page.File.Path }}{{ end -}}
{{- if not (and (.Get "before_alt") (.Get "after_alt")) }}{{ errorf "ba-image: before_alt and after_alt are required (%s)" .Page.File.Path }}{{ end -}}
{{ partial "components/ba-image.html" (dict "before" $before "after" $after
     "before_alt" (.Get "before_alt") "after_alt" (.Get "after_alt")
     "before_label" (.Get "before_label" | default (i18n "ba_before"))
     "after_label"  (.Get "after_label"  | default (i18n "ba_after"))
     "caption" (.Get "caption")) }}
```

**`lib/validate.html`** applies the rules of 3.6; its shape is a list of checks of this form:

```go-html-template
{{- range slice "summary" "brief" "role" -}}
  {{- if not (index $.Params .) }}{{ errorf "prestige: %q is required in %s" . $.File.Path }}{{ end -}}
{{- end -}}
{{- if not .Params.cover.alt }}{{ errorf "prestige: cover.alt is required in %s" .File.Path }}{{ end -}}
```

Development helpers: under `hugo server` (`hugo.IsServer`), the contact block and empty states render their dev-only hints (7.2, 7.8); production never prints them.

### 11.8 `i18n/en.toml`

All user-visible strings live here; v1 ships English only (15). Plural keys use Hugo's `one` / `other` form.

| Key | English |
|---|---|
| `skip_to_content` | Skip to content |
| `toggle_legend` | View |
| `toggle_performance` | Performance |
| `toggle_backstage` | Backstage |
| `jump_label` | Layers on this page |
| `layers_both_shown` | Both layers are shown below. |
| `stage_title_1` / `_2` / `_3` / `_many` | Solo performance / Double bill / Triple bill / The season |
| `front_of_curtain` / `behind_the_curtain` | Front of curtain / Behind the curtain |
| `column_front` / `column_back` | FRONT OF CURTAIN · RESULTS / BEHIND THE CURTAIN · PROCESS |
| `drape_closed` | Curtain down. Raise it with the toggle in the red bar above. |
| `problem` / `turning_point` | Problem / Turning point |
| `counts_line` | {{ .Steps }} · {{ .Constraints }} · {{ .Rejected }} (each pluralised: "6 steps", "3 constraints", "3 rejected options") |
| `open_backstage` | Open backstage |
| `walkthrough_on_request` | Walkthrough on request. |
| `step_of` | Step {{ .N }} of {{ .Total }}: |
| `step_prev` / `step_next` | Previous: step {{ .N }}, {{ .Title }} / Next: step {{ .N }}, {{ .Title }} |
| `show_all_steps` | Show all steps |
| `step_missing` | Step {{ .N }} does not exist. Showing step 1. |
| `in_progress_notice` | Walkthrough in progress: {{ .Published }} of {{ .Planned }} steps published. |
| `performance_only_title` | The walkthrough isn't written up yet. |
| `performance_only_body` | This project's result is below. Ask and I'll send the steps I'd write: problem, constraints, rejected options, measured result. |
| `ba_before` / `ba_after` | Before / After |
| `ba_then` | then |
| `ba_lower` / `ba_higher` / `ba_worse` / `ba_from_zero` | lower / higher / Worse: / from zero |
| `status_*` | The ten announcement strings of 8.1 |
| `trapdoor` | Trapdoor |
| `failure_what` / `_cause` / `_cost` / `_changed` | What / Cause / Cost / Changed |
| `severity_minor` / `_major` / `_critical` | Minor / Major / Critical |
| `failures_empty` | Nothing filed yet. Failures are listed here as they are written up. |
| `err_404_title` | This page is not on the bill. |
| `err_404_what` / `_cause` / `_cost` / `_changed` | You asked for an address that does not exist on this site. / A mistyped link, or a page that moved when a case study was renamed. / About ten seconds. / Here is where to go instead: |
| `contact_cta_title` | Want the walkthrough? |
| `contact_cta_body` | Backstage is one toggle away on every case study. If it isn't written up, ask. |
| `copy_address` / `copy_copying` / `copy_done` / `copy_failed` | Copy address / Copying… / Copied / Copy failed |
| `copy_error` | Couldn't copy. The address is selected: press Ctrl+C. |
| `pager_next` | Next on the bill |
| `scheme_legend` / `scheme_auto` / `scheme_light` / `scheme_dark` | Colour scheme / Auto / Light / Dark |
| `external` | (external) |
| `credit` | Built with Prestige |
| `nothing_on_bill` | Nothing on the bill yet. |

### 11.9 Catalogue files

**`theme.toml`** (TOML only; YAML and JSON are not accepted by the catalogue)

```toml
name = "Prestige"
license = "MIT"
licenselink = "https://github.com/fixbyte-studio/hugo-theme-prestige/blob/main/LICENSE"
description = "A case-study portfolio theme with two authored layers per project: Performance (the result) and Backstage (the process), plus a Trapdoor for failures."
homepage = "https://github.com/fixbyte-studio/hugo-theme-prestige"
demosite = "https://fixbyte-studio.github.io/hugo-theme-prestige/"
tags = ["portfolio", "personal", "responsive", "dark", "light", "accessibility"]
features = [
  "Case-study page bundles with Performance and Backstage layers",
  "Numbered Backstage step-through with before/after comparisons",
  "Failure reports (Trapdoor)",
  "Light and dark schemes",
  "Fully readable without JavaScript",
  "WCAG 2.2 AA",
  "Responsive WebP images",
  "No analytics, no cookies",
]
min_version = "0.146.0"

[author]
  name = "FixByte Studio"
  homepage = "https://github.com/fixbyte-studio"
```

**Theme `hugo.toml`** (defaults; the site overrides)

```toml
[module.hugoVersion]
  min = "0.146.0"

[taxonomies]
  discipline = "disciplines"
  stack      = "stack"
  lesson     = "lessons"

[permalinks.page]
  work     = "/work/:slug/"
  trapdoor = "/trapdoor/:slug/"

[markup.highlight]
  noClasses   = false
  lineNos     = false
  guessSyntax = false
  tabWidth    = 2

[markup.goldmark.renderer]
  unsafe = false

[imaging]
  quality        = 80
  resampleFilter = "CatmullRom"
  anchor         = "Smart"
  [imaging.exif]
    disableLatLong = true

[outputs]
  home = ["html", "rss"]

[params.stage]
  default_mode     = "performance"
  programme_from   = 5
  trapdoor_on_home = true

[params.scheme]
  switch = true

[params]
  credit = true
```

**`README.md`** contains, in this order: title and one-line description; the screenshot as an absolute `https://raw.githubusercontent.com/fixbyte-studio/hugo-theme-prestige/main/images/screenshot.png` URL; Requirements (Hugo extended ≥ 0.146.0); Installation (Hugo Modules: `hugo mod init`, `[module] imports path`; or git submodule into `themes/prestige` with `theme = "prestige"`); Minimal configuration (the `exampleSite/hugo.toml` excerpt for taxonomies, permalinks and params); Writing a case study (`hugo new content work/my-project`, the bundle tree of 3.3, the step kinds of 3.6, the shortcode table of 3.8); Accessibility statement (WCAG 2.2 AA, no-JS behaviour, how to report issues); Browser support (Chrome and Edge 123+, Firefox 120+, Safari 17.5+; older browsers get the Performance palette in light scheme only); Fonts and licences (the three OFL families, self-hosted); Licence (MIT). No marketing copy, no badges beyond licence and Hugo version.

**`LICENSE`**: the MIT licence, "Copyright (c) 2026 FixByte Studio". Font licences are in `assets/fonts/OFL-*.txt`.

---

## 12. Demo content and catalogue presentation

### 12.1 The demo site

`exampleSite/` is a complete site for a fictional person, **Tomás Reyes, backend engineer and production lead** (Ghent, Belgium), built with the config of 3.12. All names, clients and figures are invented; all images are original illustrations and diagrams made for the demo and dedicated to the public domain (CC0).

```
exampleSite/
├── hugo.toml                               # 3.12
├── content/
│   ├── _index.md                           # headline + lede (3.11)
│   ├── about.md
│   ├── work/
│   │   ├── _index.md                       # title: Programme
│   │   ├── ledger-cutover/                 # 6 steps; carries the failure TD-001
│   │   ├── festival-door/                  # 6 steps; no failure
│   │   └── pickup-point-finder/            # Performance-only (no backstage.md, no steps/)
│   └── trapdoor/
│       ├── _index.md
│       └── cohort-posted-twice.md          # TD-001, case: ledger-cutover
└── (no assets: images live in the bundles)
```

`content/_index.md`:

```yaml
---
title: "Home"
headline: "Every result has a backstage."
lede: "Backend systems and live-event logistics. Every project is shown twice: the result, then the working."
---
```

### 12.2 Three case studies

| | **Ledger Cutover** | **Festival Door** | **Pickup Point Finder** |
|---|---|---|---|
| Discipline | `backend` | `events-logistics` | `product-design` |
| `weight`, `headliner` | 10, true | 20 | 30 |
| `date` · ref | 2025-11-14 · `PRS-2025-003` | 2025-07-21 · `PRS-2025-002` | 2025-03-10 · `PRS-2025-001` |
| Client · role | Meridian Freight · Lead backend engineer | Zeven Rivieren Festival · Production lead, site and access | Parcelo · Product designer (sole) |
| Duration · team | 14 weeks · 4 | 26 weeks · "3 staff + 9 volunteers" | 11 weeks · 3 |
| Stack | Go, PostgreSQL, Kafka | Airtable, Handheld scanners, WhatsApp | Figma, Maze, Amplitude |
| Outcome (barcode) | −93 % reconciliation time | −69 % load-in clearing time | −45 % "where is my parcel" contacts |
| `summary` | Month-end reconciliation fell from 3 h 10 min to 14 min, with no downtime in the close window. | Load-in for 61 trucks cleared in 58 minutes instead of 3 h 05, with no queue on the public road. | Support contacts about missing parcels fell 45% after the pickup flow was rebuilt around the question people actually ask. |
| `brief` | A nightly batch was the only source of truth for freight invoices, and it paid twice 11 times a quarter. | Sixty-one trucks arrived in the same three hours, queued on a public road, and the road authority was about to close the site. | People could not tell which pickup point held their parcel, so they wrote to support instead. |
| `result.headline` | Month-end close went from three hours to fourteen minutes, and nobody was paid twice. | The trucks were off the road in under an hour. | Fewer people had to ask where their parcel was. |
| Metrics | 14 min (was 3 h 10); 0 duplicate payments per quarter (was 11); 2.4 s posting delay p95 (was up to 24 h) | 58 min load-in clearing (was 3 h 05); 2 trucks on the public road at peak (was 14); 6 min p90 crew gate wait (was 24) | 21 contacts per 1,000 parcels (was 38); 41 s to find the parcel (was 94 s) |
| `backstage.teaser` | A shadow ledger ran beside the batch for six weeks before it was allowed to disagree out loud. | The dock was never the bottleneck; the gate was, and the gate was fixed with a holding field and a scanner. | none (Performance-only) |
| Failure | `TD-001` The cohort that posted twice | none | none |

### 12.3 Step outlines

**Ledger Cutover**: full source for steps 3 and 6 is in 3.6.

| n | kind | title | gist | Structured content |
|---|---|---|---|---|
| 1 | `problem` | The nightly batch was the single source of truth | Invoices posted once a night; every failure waited until morning. | statement: "A batch job posted every freight invoice once a night, against a database the vendor owned. When it failed, nobody knew until morning. When it retried, it paid twice." evidence: duplicate payments per quarter 11; month-end reconciliation 3 h 10 min; posting delay up to 24 h |
| 2 | `constraints` | Four limits that were not negotiable | Zero downtime, no schema changes, four people, one assumption. | HARD zero downtime in the close window (Finance); HARD no schema changes on the vendor-owned database (vendor contract); SOFT four engineers, Go only (team); ASSUMED partner payments API is idempotent on `reference` (partner docs, unverified) |
| 3 | `hypotheses` | Three ways the numbers could be wrong | Duplicates, slow matching, ordering: two confirmed, one refuted. | H1 confirmed, H2 refuted, H3 confirmed (3.6) |
| 4 | `rejected` | Three things I did not build | A big-bang rewrite, log-based replication, two-phase commit. | Big-bang rewrite (no rollback inside the close window; revisit HIGH); log-based CDC from the legacy database (vendor contract forbids reading the transaction log; HIGH); two-phase commit across ledger and payments (couples the availability of two systems; MEDIUM) |
| 5 | `implementation` | A shadow ledger, then a cohort-by-cohort cutover | Six weeks read-only, then eight working days, one cohort at a time. | decisions: shadow first (six weeks of read-only comparison before any write); cohorts of one eighth of accounts (a bad cohort touches 12.5%); idempotency key on every posting (added after cohort 3, see TD-001). Body: `ba-code` (nested-loop matching vs set-based match, SQL), `ba-image` (October close: spreadsheet export vs dashboard), `aside` linking TD-001 |
| 6 | `result` | What the close looks like now | Reconciliation 190 → 14 min; duplicate payments 11 → 0. | 3.6 |

**Festival Door**

| n | kind | title | gist | Structured content |
|---|---|---|---|---|
| 1 | `problem` | Sixty-one trucks, one road, three hours | Everything arrived at once and queued on a public road. | evidence: trucks 61; arrival window 3 h 05; trucks queued on public road at peak 14 |
| 2 | `constraints` | What the road authority and the site allowed | Four trucks on the road, three docks, volunteers who arrive at 06:00. | HARD at most 4 trucks on the public road (permit); HARD three loading docks (site plan); SOFT nine volunteers (budget); ASSUMED drivers read the slot email (unverified) |
| 3 | `hypotheses` | Where the time was going | Arrivals were bunched by the booking process; the docks were idle 41% of the time. | H1 confirmed (bunching comes from first-come booking); H2 refuted (docks idle 41% of the time; the gate scan was the bottleneck); H3 inconclusive (do drivers keep their slots?) |
| 4 | `rejected` | Three things I did not build | More docks, a second gate, text-message queue calls. | More docks (no space; revisit HIGH); second gate (no power and no road access; HIGH); SMS queue calls (drivers do not read them in the cab; LOW) |
| 5 | `implementation` | Slots, a holding field and one scanner | One allocator, a call-forward field, scan at the gate. | decisions: one allocator writes slots, everyone else reads a published view; trucks wait in the holding field, not on the road; scan at the gate, not at the dock. Body: `ba-image` (site plan before/after), `ba-metric` |
| 6 | `result` | What the morning looked like | Load-in cleared in 58 minutes; two trucks on the road at peak. | metrics: clearing time 185 → 58 min; trucks on road 14 → 2; p90 crew gate wait 24 → 6 min. caveat: "One festival, one site, one weather pattern." |

**Pickup Point Finder**: no `backstage.md` and no `steps/`. Its Performance body shows two `#wide` figures (old and new flow) and a short narrative. The `cta` contact block and the Performance-only notice (9.4) are the Backstage experience. This case exists in the demo to show that state.

### 12.4 Trapdoor entry

`content/trapdoor/cohort-posted-twice.md` (front matter in 3.7). Body:

> Cohort 3 was the first cohort with live card-settlement accounts. At 10:42 the reconciliation view showed 212 lines posted twice. The partition holding those accounts had rebalanced; the consumer resumed from the last committed offset, and the posting call, which I had assumed was idempotent because the partner's was, was not. Reconciliation caught it nine minutes later. No money moved, because payments were still gated by the batch, but three hours went on cleanup and on proving that to Finance.
>
> What changed: every posting now carries an idempotency key (account, source event id), and each cohort starts with a replay drill on a copy of its own data. The assumption in step 2 of the walkthrough, "partner API is idempotent", is still marked ASSUMED, now with a link here.

### 12.5 About page

```yaml
---
title: "About"
type: about
lede: "I am called in when a system is correct on paper and wrong on the day."
method:
  - label: "Start from the failure"
    text: "I write down how it hurts before I write down how to fix it."
  - label: "Keep the rejected options"
    text: "A decision is only as good as the alternatives it beat. I keep those on file."
  - label: "Measure with the customer's own data"
    text: "Dashboards built for the demo do not count."
called_in_for:
  - "Cutovers that cannot have downtime"
  - "Events where the schedule is the product"
  - "Flows that generate support tickets"
---
```

### 12.6 Demo assets

| Bundle | File | Size | Content |
|---|---|---|---|
| `ledger-cutover` | `cover.jpg` | 2400 × 1260 | Flat illustration of a reconciliation dashboard: matched and unmatched lines in two columns, curtain-red accent on the unmatched ones |
| | `shots/dashboard-before.png` | 1600 × 1000 | Spreadsheet export with 212 unmatched lines highlighted |
| | `shots/dashboard-after.png` | 1600 × 1000 | Dashboard with 3 unmatched lines |
| | `shots/shadow-ledger.svg` | vector | Diagram: batch path and shadow-ledger path side by side, with the cohort boundary |
| | `snippets/match-before.sql`, `match-after.sql` | text | Nested-loop matching and the set-based match (each under 20 lines) |
| `festival-door` | `cover.jpg` | 2400 × 1260 | Plan-view illustration of the site: road, holding field, three docks, gate |
| | `shots/site-before.png`, `shots/site-after.png` | 1600 × 1000 | The same plan with the queue before and after |
| | `shots/gate-queue.svg` | vector | Queue-length chart, 14 → 2 trucks |
| `pickup-point-finder` | `cover.jpg` | 2400 × 1260 | Two phone screens, old and new |
| | `shots/flow-before.png`, `shots/flow-after.png` | 1600 × 1000 | The two flows as annotated screens |
| (site) | `assets/img/og-default.png` | 1200 × 630 | The split-stage composition of 12.7, cropped |

### 12.7 Catalogue images

The split stage is the hook. Both images show the homepage with the curtain **caught mid-raise**, so the cream front-of-curtain column, the red drape with its hem, and the cardboard Backstage column are all visible at once.

**Capture state.** Chromium, viewport **1500 × 1000**, device pixel ratio 1, `colorScheme: light`, `reducedMotion: reduce`, `localStorage["prestige.mode"] = "backstage"` (so the toggle shows Backstage selected), scrolled to `scrollY = 64` (the static header has just scrolled away and the valance is pinned at the top), web fonts loaded. Injected CSS to freeze the curtain 176 px below the pelmet:

```css
html { --curtain-lift: calc(-100% + 176px) !important; }
.drape, .stage-row__back { transition: none !important; }
```

`tools/capture-screenshots.mjs` performs this with Playwright and writes both files; `tn.png` is made from the same capture with `magick screenshot.png -crop 1140x760+180+240 +repage -filter Lanczos -resize 900x600 tn.png`.

**`images/screenshot.png`: exactly 1500 × 1000.** Container 1200 px wide, x from 150 to 1350; the seam between the columns is at **x = 750**, the exact centre.

| Region | x | y | Content |
|---|---|---|---|
| Valance | 0 to 1500 | 0 to 48 | Full-bleed `#8E1B26`. Toggle at x 150 to 438: "Performance" unselected, "Backstage" selected (cream segment, `●`). Status text right-aligned to x 1350: "Backstage view · curtain raised". |
| Intro | 0 to 1500 | 48 to 336 | Cardboard Day `#D9C4A3` (the page chrome follows the mode). Headline "Every result has a backstage." in IBM Plex Mono 700 44 px on two lines at x 150, y 80 to 190. Lede in IBM Plex Mono 400 18 px, two lines, y 206 to 264. The two-line key at x 930 to 1350, y 80 to 200. |
| Left column header | 150 to 750 | 336 to 384 | `#14100D` band, `#F5EEE2` label "FRONT OF CURTAIN · RESULTS". |
| Pelmet | 750 to 1350 | 336 to 384 | `#8E1B26` band, `#FFF7EC` label "BEHIND THE CURTAIN · PROCESS". |
| Headliner, front face | 150 to 750 | 384 to 984 | Surface `#FFFBF3`, 3 px `#14100D` border, 6 px hard shadow. Cover 568 × 320, then "Ledger Cutover" in Alfa Slab One 48 px, the result sentence, "14 min" metric, compact barcode strip with `PRS-2025-003`. |
| Drape | 750 to 1350 | 384 to 560 | `#8E1B26` with pleat lines every 56 px; 12 px hem band `#5E0F18` at y 548 to 560. This is the bottom of the drape, so it carries no text. |
| Headliner, back face (revealed) | 750 to 1350 | 560 to 984 | Backstage palette Cardboard Day: panel `#F4ECDD`, 2 px dashed `#1E140C` border, Plex Mono text. The visible part reads, from the hem down: the turning-point text, "6 steps · 3 constraints · 3 rejected options", the six step ticks, a `TRAPDOOR 1` chip, "Open backstage →". |
| Seam | 749 to 752 | 336 to 1000 | 3 px `#14100D` vertical rule. |
| Next row peek | 150 to 1350 | 984 to 1000 | The top border of the "Festival Door" row on the left; its Backstage face on the right. |

**`images/tn.png`: exactly 900 × 600.** The crop x 180 to 1320, y 240 to 1000 of the capture above (1140 × 760), resampled with Lanczos by 0.7895. The crop is symmetric about the seam, so **the seam is at x = 450 in the thumbnail**. It contains the lede's second line, the two column headers, the whole headliner row with the red drape and its hem on the right, and the revealed cardboard panel. At 25% scale (about 225 × 150) the image still reads as three blocks: cream left half; red band over cardboard right half; black and red header bands above both.

**What must not appear:** device frames, browser chrome, cursor, mock lorem text, watermarks.

**`assets/img/og-default.png`** (1200 × 630): the region x 150 to 1350, y 384 to 1014 of an equivalent capture at 1500 × 1100, so it shows the stage rows at full size.

---

## 13. Anti-patterns

Prestige must never become any of the following. Each has a rule and a way for a reviewer to detect it.

| Anti-pattern | Rule | Detection |
|---|---|---|
| **Skill progress bars, ratings, percentages-of-proficiency** | No component shows a self-assessed level. The theme has no `skills` field. | `grep -rniE "progress|meter|rating|proficien|skill" layouts assets/css` returns nothing except the word "skill" in README prose. `role="progressbar"` and `<meter>` never appear. |
| **Logo walls** | No grid of client or tool logos. `client` is text in the case-study head. | No `<img>` in any partial outside `img.html` callers for covers and figures; no template loops over logos. |
| **Testimonial carousels and pull-quotes** | No quotes attributed to others as a component. No auto-advancing or swipeable content. | `grep -rniE "carousel|swiper|slick|testimonial|marquee|autoplay" layouts assets` returns nothing; no `setInterval` in `assets/js`. |
| **Counters and count-up animations** | Numbers are static facts. Metric blocks never animate. | No `requestAnimationFrame` loop that writes text; no `IntersectionObserver` in `assets/js`. |
| **Equal card grids** | Case studies are never rendered as N identical cards in a grid. The stage has a headliner and unequal rows; the Programme is a list of rows. | No `repeat(auto-fill` or `repeat(auto-fit` in `assets/css`; no layout where all case studies share one height; the headliner rule of 3.4 holds. |
| **Gradient heroes** | No smooth gradients anywhere. The only gradient syntax allowed is hard-stop `repeating-linear-gradient` (pleat lines, hazard stripe). | `grep -rnE "radial-gradient|conic-gradient" assets/css` is empty; every `linear-gradient(` is `repeating-` with equal stop positions. |
| **Dark "hacker" styling** | No terminal green, no monospace-on-black as identity, no typing animation, no scan lines, no glow. Dark is a scheme (6.1), never a mode. | No `text-shadow` or `box-shadow` with blur radius; no hex in the palette tables outside the four palettes; no `@keyframes` that animate `width` or `content`. |
| **Velvet textures, spotlights, confetti, parallax** | Theatre is structure and type only. | No `background-image: url(` in `assets/css`; no `transform` tied to scroll; no `scroll-timeline`. |
| **Hover-only or scroll-triggered content** | Every piece of content is in the HTML and reachable by keyboard and without JavaScript. | Disabling JavaScript and tabbing through every page reveals no hidden content; no `:hover`-gated `display` or `visibility` changes. |
| **Résumé timeline or one-page sections** | No timeline component, no employment history, no single page that stacks Experience, Education and Skills. | No such partial exists; the sitemap (4.1) is the full list of pages. |
| **Centred identity splash** | The homepage opens with a left-aligned statement and the work. | Home intro uses the 8/4 grid of 5.1, never `text-align: center`. |
| **Services grid or agency hero** | No "What I do" cards. About lists how the author works and what they are called in for, in plain text. | No component with an icon, a heading and three lines of text repeated in a grid. |
| **Before/after sliders** | Comparisons are static and stacked or side by side. | No drag handlers, no `input[type=range]` in comparison markup. |
| **Tracking, cookie banners, third-party scripts** | None. | Network panel of every page lists only same-origin requests; no `document.cookie` write in `assets/js`. |
| **Decoration that carries no data or state** | If removing it loses no information, remove it (P3). | Review each element of section 7: the drape (state), pelmet (column label), valance (control), barcode bars (stable ref signature), hazard stripe (marks a failure), pleat lines (state texture of the drape). Anything else is out. |
| **Disabled or hidden mode switch** | The toggle is always present and enabled. | `fieldset[disabled]` never appears in rendered HTML. |

---

## 14. Acceptance checklist

A release is accepted only when every box below is ticked. Each group names how to test it. Items marked (A) are mechanical and can run in CI (`tools/check-budgets.sh` automates the budget items; the others are one-line shell or script checks); the rest are manual and recorded in the release notes. Accessibility items in 10 are part of this checklist by reference: **10.1 to 10.7 must all pass, and the 10.8 script must be run.**

### 14.1 Catalogue and packaging

**How to test:** run `hugo --gc --minify` in `exampleSite/` with `--themesDir ../..`, then inspect the repository root and `images/`.

- [ ] (A) `theme.toml` parses as TOML and contains `name`, `license`, `licenselink`, `description`, `homepage`, `demosite`, `tags`, `features`, `min_version` and an `[author]` table (11.9).
- [ ] `LICENSE` is the MIT text; `README.md` has the sections listed in 11.9, including the front-matter reference and the Hugo version requirement.
- [ ] (A) `images/screenshot.png` is exactly 1500 × 1000 and `images/tn.png` is exactly 900 × 600 (`identify -format "%wx%h"`).
- [ ] Both images match the composition in 12.7: the seam is at x = 750 (screenshot) and x = 450 (thumbnail), the drape and hem are visible, and no browser chrome, cursor or placeholder text appears.
- [ ] (A) `exampleSite` builds with Hugo extended 0.146.0 and with the latest release, with zero warnings and zero errors.
- [ ] Every font file has its licence text in `assets/fonts/` and its entry in the README credits.
- [ ] Every demo image is an original CC0 illustration; no stock photographs and no third-party logos.

### 14.2 Budgets and build

**How to test:** `tools/check-budgets.sh` (11.5), then the network panel of a production build.

- [ ] (A) Concatenated CSS source is at most 51,200 bytes and the minified output is under that too.
- [ ] (A) All scripts together (inline head script plus bundle), unminified, are at most 30,720 bytes.
- [ ] (A) The built site makes no request to another origin on any template; there is no third-party script, font or analytics call, and no cookie is written.
- [ ] (A) Home, a case study, the failures list, About, a term page and the 404 each return a complete document with JavaScript blocked.
- [ ] A site with an empty `content/` directory builds and the home page renders a valid empty state.
- [ ] A site built with `baseURL = "https://example.org/sub/"` has working links, fonts, images and fragments.

### 14.3 Content model and build-time validation

**How to test:** run each case from the table in 3.6 against a copy of `exampleSite` and confirm the stated result.

- [ ] A case study with empty `cover.alt`, or without `summary`, `brief`, `role`, `barcode.*` or `result.*`, fails the build with the file path in the message.
- [ ] A step with an unknown `kind`, a missing kind-specific field, or an `n` that is duplicated or not contiguous from 1 fails the build; `steps/` with no `backstage.teaser` fails the build; `result.metrics` with 0 or more than 3 entries fails the build.
- [ ] A second `headliner: true` produces one warning and the first by `weight` wins.
- [ ] A case study without `backstage.md` and `steps/` is a valid Performance-only case study and renders the notice described in 9.4.
- [ ] A failure whose `case` matches no bundle prints one warning and is shown without a link; a failure without `case` is accepted silently.
- [ ] A case study with `result.metrics` but no `kind: result` step prints a warning (principle P1).
- [ ] The barcode of a given `ref` is identical on every build and different for different refs.
- [ ] Taxonomy pages exist for `disciplines`, `stack` and `lessons` and list only their own case studies.

### 14.4 The curtain toggle and persistence

**How to test:** manual run in Chromium, Firefox and Safari; steps 1 to 6 on the homepage, then repeat on a case study.

- [ ] With no stored value, the page opens in `params.stage.default_mode` and the radio matches it.
- [ ] Selecting Backstage changes layers, skin tokens and status text, and survives reload and navigation to another page of the site.
- [ ] A second tab opened on the site follows the first when the mode changes (`storage` event).
- [ ] Opening `/work/ledger-cutover/#step-3` shows Backstage on that page and does not overwrite the stored mode; opening `/work/ledger-cutover/#result` shows Performance and does not overwrite it.
- [ ] Switching to Performance while the fragment is `#step-3` clears the fragment.
- [ ] With `localStorage` unavailable (private window with site data blocked) the toggle still works for the current page and no error appears in the console.
- [ ] The scheme switch (Auto, Light, Dark) is independent of the toggle: all four combinations render, and neither control changes the other's stored value.
- [ ] The toggle is present on every page, is never disabled, and has a visible focus ring on `--color-curtain` that meets 3:1.

### 14.5 No-JS behaviour

**How to test:** disable JavaScript in the browser, load every page type.

- [ ] Both layers are in the document in reading order: Performance, then Backstage, then Trapdoor.
- [ ] No control is visible that does nothing: the toggle fieldset, copy button, step ticks and "Show all steps" are `hidden` until the script runs (`html.js` gating, 9.2).
- [ ] Every step is expanded and its body is readable; no content is clipped, collapsed or positioned off-screen.
- [ ] The homepage shows both columns side by side from 960 px and both faces of each card stacked below it, Performance first, with the drape absent; there is no overlay and nothing is covered.
- [ ] Every link to a step, to the Trapdoor and to a failure resolves to a visible target.
- [ ] The contact block shows a working `mailto:` link.
- [ ] Printing any case study (`print.css`, decision 41) produces both layers, expanded, in black on white, without the valance, toggle, drape or step controls.

### 14.6 The seven hard problems

**How to test:** the stated viewport, mode and setting for each; the pass condition is the sentence given.

- [ ] **No-JS (9.2):** see 14.5.
- [ ] **Toggle scope and persistence (9.3):** the mode is global and stored once; a fragment overrides it for a single page load; the status text names the current mode on every page.
- [ ] **Performance-only case study (9.4):** open `pickup-point-finder` in Backstage mode at 1280 and 360; the page shows the notice, the `brief`, and the contact block, and has no empty step area, no dead tab and no console error. On the homepage its back face reads "Walkthrough on request."
- [ ] **Before/after on mobile (9.5):** at 360 px the two images are stacked with their labels ("Before", "After") above each, both at full width, neither cropped, and a text alternative that states the difference is present. At 1280 px they sit side by side. No drag handler, no slider.
- [ ] **Split stage at 360 px (9.6):** one face per card, switched by mode; the face that is not shown is not in the tab order or accessibility tree; no horizontal scroll at 320 px.
- [ ] **A portfolio of two (9.7):** with `pickup-point-finder` removed, the home page title reads "Double bill", the headliner and one supporting act render at the heights given, the stage manager's note closes the page, and the page is about 2,050 px tall at 1280 px. With only one case study the title reads "Solo performance".
- [ ] **Backstage vs light/dark (9.8):** all four palettes render on the homepage, a case study in each mode and the failures list, and every pair in the 6.2 table is at or above its stated ratio when measured in the browser.

### 14.7 Layout and responsive behaviour

**How to test:** viewport widths 320, 360, 768, 959, 960, 1280 and 1920 px, in both modes.

- [ ] No page-level horizontal scroll at any width from 320 px to 1920 px; only code blocks and wide tables scroll inside their own container.
- [ ] The split stage appears from 960 px upward and the single-face card list below it; the change at 960 px causes no content to disappear from the accessibility tree that was visible a pixel earlier.
- [ ] The drape covers exactly the Backstage column in Performance mode and rolls up to the hem in Backstage mode; the hem is visible in both mid-transition and rest states.
- [ ] Body text measure is between 60 and 75 characters at 1280 px in both modes, and switching mode does not reflow the column (6.3).
- [ ] Headings, metrics and step numbers use the type scale of 6.3 and never fall below 13 px.
- [ ] At 360 px the barcode strip, metrics and comparisons use the stacked variants of section 7.

### 14.8 Colour, contrast and focus

**How to test:** compute each pair of 6.2 from the hex values in `assets/css/tokens.css` with the WCAG 2.2 relative-luminance formula (the table was generated that way), then inspect the four palettes in the browser with forced-colours emulation on and off.

- [ ] (A) All 28 pairs in 6.2 meet their stated ratio in all four palettes (112 checks).
- [ ] No colour other than the tokens of 6.1 appears in `assets/css` outside `tokens.css` (`grep -nE "#[0-9a-fA-F]{3,8}" assets/css | grep -v tokens.css` is empty).
- [ ] Every state that uses colour has a second carrier from the colour-never-the-sole-signal table in 6.2 (glyph, weight, border style, text).
- [ ] The focus ring is visible on every interactive element in every palette and on the curtain and hem surfaces, and is never clipped by an `overflow` ancestor.
- [ ] With `forced-colors: active` all borders, focus rings, selected states and the toggle remain visible.
- [ ] With `prefers-contrast: more` borders are 3 px and `--color-fg-muted` resolves to `--color-fg`.
- [ ] With `prefers-reduced-motion: reduce` no transition or animation runs: the curtain changes state instantly, the hem is shown at rest, and nothing slides, fades or scales.

### 14.9 Components and states

**How to test:** build a scratch site (not shipped) whose content exercises each component with the input that triggers each row of its state table, then tab through it.

- [ ] Every component in section 7 renders each state of its state table: default, hover, focus, active, selected or expanded, disabled where defined, and error where defined.
- [ ] A broken image keeps its box and shows its alt text; a code block with no language is shown without highlighting; a metric without a baseline shows only the value.
- [ ] A step with only the required fields renders without empty headings, empty lists or orphaned labels.
- [ ] The copy-email button reads "Copying…", then "Copied" for 2 seconds, and announces "Email address copied." through the polite live region; on failure it reads "Copy failed", selects the address and shows the error panel (8.5).

### 14.10 Accessibility

**How to test:** the 10.8 script, plus axe-core and Lighthouse as listed there.

- [ ] Every item of 10.1 to 10.7 is ticked.
- [ ] (A) axe-core reports zero violations on the six page types in both modes and both schemes.
- [ ] The manual script of 10.8 was run with the keyboard, NVDA with Firefox, VoiceOver with Safari, 200% and 400% zoom, JavaScript disabled, and forced colours, and the result is in the release notes.
- [ ] The skip link is the first focusable element, becomes visible on focus and moves focus to `#content`.

### 14.11 Anti-patterns

**How to test:** run the detection column of section 13 against the built site.

- [ ] Every row of the table in section 13 returns the "clean" result stated in its detection column.
- [ ] No element exists that loses no information when removed (P3); the reviewer lists every non-text element of the homepage and gives its data or state (section 13, last rows but one).

---

## 15. Decisions and assumptions

Every judgment call made while writing this specification is recorded here so the implementer does not have to guess and a reviewer can challenge a decision at its source. None of these are open questions; each is the decision.

### 15.1 Platform and tooling

1. **Hugo version.** Minimum 0.146.0 (the new template layout: `layouts/_partials/`, `layouts/_shortcodes/`, `layouts/_markup/`). The `extended` field is omitted from `theme.toml`'s `min_version` line because `css.Build` and Hugo's image processing both need the extended edition and every release from 0.146 is distributed with it; the README states "Hugo extended 0.146.0 or later". The mechanics in this document were prototyped on Hugo 0.167.0 extended (page-resource steps, `.File.Dir` bundle resolution, `css.Build` with `@import`, `@layer` and nesting, `js.Build` as IIFE, SHA-256 barcodes, WebP and JPEG processing).
2. **The full theme was not built.** Only the mechanics that carried risk were prototyped. The `exampleSite`, the component gallery and the tools in `tools/` are specified, not delivered, by this document.
3. **Content in YAML, configuration in TOML.** Front matter is YAML because the nested structures of 3.4 to 3.7 are easier to read and diff in YAML. `hugo.toml` and `theme.toml` are TOML because the catalogue requires `theme.toml` in TOML and one format in configuration avoids two parsers in the user's head.
4. **Steps are page resources.** Each step is a Markdown file in `steps/` inside the bundle and is read with `.Resources.Match "steps/*.md"`. They are not pages, so they never get URLs, never appear in sitemaps or RSS, and cannot be orphaned. The cost is that paths inside a step are resolved against the owning bundle, which `_partials/lib/bundle.html` handles with `.File.Dir`; this was verified in the prototype.
5. **Vanilla CSS and JS only.** `css.Build` is the only transform; no Sass, no PostCSS, no Tailwind, no framework. The `target` option is not set, because a target low enough to lower `light-dark()` would defeat the point; the colour fallback in 6.9 covers older browsers instead.
6. **Browser support is Baseline 2024.** `light-dark()`, nesting, `@layer`, container queries, `:has()` and `dialog` are used without a polyfill. A browser without `light-dark()` gets the `@supports not` fallback palette (Playbill and Cardboard Day) and still has every feature.
7. **Budgets are measured on source and on output.** The CSS cap is 51,200 bytes and the JS cap 30,720 bytes ("50 KB" and "30 KB", counting 1 KB as 1,024 bytes, the stricter reading). The inline head script counts toward the JS cap.
8. **No search, blog, tag cloud, comments or analytics.** A portfolio of a few case studies does not need search; taxonomies and the Programme list cover navigation. Adding any of these would break the budgets or the no-third-party rule.
9. **RSS uses Hugo's default template.** No custom feed layout is shipped; the default output works with page bundles and costs nothing.
10. **Single language in v1.** All user-facing strings are in `i18n/en.toml` and no string is hard-coded in a template, so a translation is a file; multilingual navigation and `hreflang` are out of scope.

### 15.2 Content model

11. **Seven step kinds.** `problem`, `constraints`, `hypotheses`, `rejected`, `implementation`, `result` and `note`. The first six give the arc the brief asks for; `note` exists so an author can add a step that does not fit without abusing another kind. Each step carries an explicit `n`, which must be unique and contiguous from 1, so a step's number in a link never changes silently when a file is renamed.
12. **A result step is expected, not enforced.** A Backstage account without a measured result is an anecdote, so a case study whose `result.metrics` has no matching `kind: result` step gets a build warning (principle P1); it is a warning rather than an error because a work in progress is legitimate (`in-progress` status). A case study with no steps is Performance-only and valid.
13. **Failures are standalone pages linked by a `case` param.** They live in `content/trapdoor/`, not inside bundles, so the Trapdoor section can list them across projects and a failure can outlive a rewrite of its case study. The `case` field is optional; a failure that belongs to no case study is allowed, and a `case` that matches no bundle produces a warning and no link rather than an error.
14. **The demo has exactly one failure.** `TD-001` "The cohort that posted twice" demonstrates the section without making the demo look like a confession. It is linked from Ledger Cutover (step 5 aside and the Trapdoor strip) and nowhere else.
15. **The headliner rule.** At most one case study per site is the headliner; the explicit `headliner: true` wins, otherwise the lowest `weight`. A second explicit headliner is a warning, not an error, because a mistake there should not block publishing.
16. **Count-driven stage titles.** "Solo performance", "Double bill", "Triple bill" and "The season" are the stage titles for 1, 2, 3, and 4 or more case studies. They are theatre vocabulary, are in `i18n`, and are the only place the count changes copy. The Programme list appears from 5 case studies (`params.stage.programme_from = 5`) and lists case studies in rows, not cards.
17. **Barcode is a signature of the reference number, not of the outcome.** The bars derive from the SHA-256 of `barcode.ref`, so a reference always looks the same and different references look different. The strip's text carries the data (duration, team, stack count, outcome); the bars carry none, are `aria-hidden`, and are the only decoration in the theme that is allowed to carry no information, because the strip's identity is its recognisability.
18. **Pagination is 12.** Taxonomy and Programme lists paginate at 12 items (`pagination.pagerSize = 12`). No demo content reaches it; the setting exists so a long portfolio does not produce an unbounded page.
19. **Author and URLs are assumptions.** The demo author is the fictional "Tomás Reyes". The theme author is shown as "FixByte Studio", and the repository, homepage and demo URLs in `theme.toml` (`github.com/fixbyte-studio/hugo-theme-prestige` and the matching GitHub Pages address) are derived from the account the work was done under. They are not verified to exist and must be changed to the real repository before submission to the catalogue.
20. **Contact is `mailto:` only.** There is no form, no backend and no third-party embed. The contact block shows the address in text, a mailto link and, with JavaScript, a copy button.

### 15.3 Visual design and tokens

21. **Four palettes from two independent axes.** Mode (Performance, Backstage) and scheme (light, dark) are separate attributes, giving Playbill, House Dark, Cardboard Day and Cardboard Night. Backstage is never "the dark mode" (9.8).
22. **The dark curtain is `#C0303F`, not the light curtain.** The light curtain `#8E1B26` on the dark page background `#14100D` reaches only 2.1:1, below the 3:1 non-text minimum. `#C0303F` reaches 3.4:1 against that background and still carries `#FFF7EC` text at 5.3:1. Hover on a curtain surface uses the hem colour rather than a blend, because blended hover states fell below 4.5:1 in testing.
23. **Error colour shares a hue with the brand red.** A theme whose identity is curtain red cannot have a distinct red error. This is mitigated by a second carrier on every error (an "Error:" prefix, a ⚠ icon and a 2 px solid border), and the colour-never-sole-signal table in 6.2 lists each case.
24. **Fonts are self-hosted, open-licensed, and limited to Latin and Latin-extended.** Alfa Slab One (OFL) for the Performance display face, Libre Franklin (OFL) for Performance text, and IBM Plex Mono (OFL) for Backstage and labels. Each has a named system fallback stack in 6.3. About 100 KB of WOFF2 in total, outside the CSS and JS budgets.
25. **Every image is WebP with a JPEG fallback.** `lib/img.html` writes a WebP `srcset` and a JPEG `<img src>` for every image, so the page works in any browser and in link-preview scrapers that do not read WebP. AVIF is not produced because encoder availability and build time vary by installation.
26. **No gradients, blur, glow, texture or parallax.** Pleat lines and the hazard stripe are hard-stop `repeating-linear-gradient`s. Depth is a hard-offset shadow (6 px, no blur). This is a style decision and an anti-pattern rule (13) at the same time.
27. **Cover crop is 16:9 on the stage and 1200 × 630 on the case page.** The stage covers are 568 × 320 (headliner) and 200 × 112 (others); the case-study cover is the Open Graph ratio so the same file serves as the social image.
28. **Typography is fluid between 360 and about 1015 px and fixed above.** The headliner title is 48 px at desktop; other stage titles are 32 px (28 px at 360 px). Display XL on the home page is 72 px in Performance and 44 px in Backstage, because the Backstage face is a monospace and 72 px mono would not fit the 8-column intro.
29. **Home page chrome follows the mode.** In Backstage mode the header, valance, intro and footer adopt the Backstage skin; the left (Performance) column of the stage keeps the Performance skin so a visitor can still see what the front of the curtain looks like. The catalogue screenshot is captured in this state.

### 15.4 Interaction and accessibility

30. **A radio group, not a switch.** The mode toggle is a native `<fieldset>` with two radio inputs. A switch would need a state label that changes with state ("on" means what?), and a radio group announces both options by name. Arrow keys, Space and focus are native.
31. **The valance is the only sticky element.** Nothing else sticks, so focus is never obscured by more than the 48 px valance; `scroll-padding-top` and `scroll-margin-top` of 4 rem handle fragment and focus scrolling (WCAG 2.4.11).
32. **The drape is visual only.** The Backstage column is `visibility: hidden` when covered (set after the lowering transition has finished and removed as the raise starts), not merely under the drape, so keyboard and screen-reader users never enter content that sighted users cannot see. Clicking the drape is a mouse convenience that clicks the Backstage radio; it is not a control and not in the tab order.
33. **No smooth scrolling and no autoplay anywhere.** Scrolling on mode change is instant; the curtain transition (520 ms lowering with an accelerating ease, 720 ms raising with a decelerating ease) is the only large animation, and everything animated is removed under `prefers-reduced-motion`.
34. **Mode change is announced through a `role="status"` region.** The strings are rendered into `data-msg-*` attributes by Hugo so they are translatable and the script carries no copy.
35. **Steps are an accordion, not tabs.** Each step header is a button with `aria-expanded`; there is no `tablist`. Tabs would imply the steps are alternatives; they are a sequence. With six steps or fewer the step container is a `role="region"` landmark; with more it is not, to avoid landmark overload.
36. **Before/after is static.** Stacked on mobile, side by side on desktop, never a slider (13). Each pair has a text alternative stating the difference, authored with the shortcode.
37. **Targets are 44 px although WCAG 2.2 AA asks for 24 px.** The theme is used on phones at events; a larger target costs nothing.

### 15.5 Catalogue and presentation

38. **Screenshot capture state.** The catalogue images are taken with the curtain frozen mid-raise at `--curtain-lift: calc(-100% + 176px)`, `scrollY = 64`, 1500 × 1000 at DPR 1, reduced motion on and the stored mode set to Backstage. A frozen mid-transition frame is the only state in which one image shows the cream column, the red drape with its hem and the cardboard column together; it is a staged capture, documented as such in the README, not a state a visitor sees at rest.
39. **The thumbnail is a crop of the screenshot, not a re-composition.** The crop `1140x760+180+240` is symmetrical about the seam, so the seam sits at x = 450.
40. **The demo is a fictional person.** All clients, figures and the failure are invented and the README says so.
41. **Print.** `print.css` (the `print` cascade layer) prints both layers with every step expanded, black text on white, link URLs after links, and hides the valance, toggle, drape, step controls and copy button. A case study printed from Performance mode therefore contains its Backstage account; this is intended, because a print is a document, not a view.

### 15.6 Self-review

The specification was reviewed against the brief before delivery. Findings that were fixed: the home headline and lede were unified across 3.11, 5.1, 12.1 and 12.7; the stage cover ratio (16:9) and headliner title size (48 px) were unified across 5.1, 7.2, 9.7, 11.4 and 12.7; the catalogue screenshot's intro row was changed to the Backstage skin to agree with decision 29; the failure example was unified on TD-001; and the two-case-study page height was set to about 2,050 px. Known limits that remain by decision and are not defects: the mid-raise capture (38), the unverified repository URLs (19), and the single language (10).
