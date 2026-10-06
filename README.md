# Prestige

A Hugo theme for case-study portfolios: every project is shown as its polished result (**Performance**) and as a numbered account of how it was made (**Backstage**), with failures filed in their own section (**Trapdoor**).

![Prestige: the split-stage homepage with the curtain caught mid-raise](https://raw.githubusercontent.com/m0hss/Prestige/master/images/screenshot.png)

[![License: MIT](https://img.shields.io/badge/license-MIT-8E1B26)](LICENSE) [![Hugo extended ≥ 0.146.0](https://img.shields.io/badge/hugo-extended%20%E2%89%A5%200.146.0-14100D)](https://gohugo.io)

> The demo is deployed to Netlify; the `demosite` URL in `theme.toml` is provisional until the Netlify site's address is set there. The screenshot is a staged frame with the curtain frozen mid-raise (see `tools/capture-screenshots.mjs`); visitors see it either down or up.

## Requirements

Hugo **extended 0.146.0 or later**. Builds are tested on 0.146.0 and 0.167.0. On Hugo 0.158 and later the stylesheet is bundled with `css.Build`; on older releases the theme assembles the same bundle itself.

## Installation

As a Hugo Module:

```bash
hugo mod init github.com/you/your-site
```

```toml
[module]
  [[module.imports]]
    path = "github.com/m0hss/Prestige"
```

Or as a git submodule:

```bash
git submodule add https://github.com/m0hss/Prestige.git themes/prestige
```

```toml
theme = "prestige"
```

## Minimal configuration

Hugo does not merge a theme's `[markup]` or `[taxonomies]` into your site, so copy these into your `hugo.toml` (the permalinks keep slugs equal to folder and file names). The complete example is [`exampleSite/hugo.toml`](exampleSite/hugo.toml).

```toml
[taxonomies]
  discipline = "disciplines"
  stack      = "stack"
  lesson     = "lessons"

[permalinks.page]
  work     = "/work/:contentbasename/"
  trapdoor = "/trapdoor/:contentbasename/"

[markup.goldmark.parser]
  wrapStandAloneImageWithinParagraph = false   # lets standalone images become <figure>

[markup.highlight]
  noClasses = false

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
  description = "One sentence about you and your work."
  [params.author]
    name = "Your Name"
    role = "What you do"
    location = ""            # optional, shown in the footer
    portrait = ""            # optional, a path under assets/; 96 px, About page only
  [params.contact]
    email = "you@example.org"
    availability = ""        # optional, e.g. "Booking from March 2027"
    # [[params.contact.links]]
    #   label = "Code"
    #   url = "https://example.org"
  [params.stage]
    default_mode = "performance"   # or "backstage": the mode for a first-time visitor
    programme_from = 5             # add the Programme list to the homepage from this many case studies
    trapdoor_on_home = true
  [params.scheme]
    switch = true                  # footer Auto / Light / Dark switch
  [params.footer]
    note = ""
  credit = true                    # "Built with Prestige" in the footer
```

Prestige ships no analytics, no third-party scripts and no cookies. It stores the visitor's mode and colour scheme in `localStorage` only.

## Writing a case study

```bash
hugo new content work/my-project
hugo new content trapdoor/my-failure.md
```

A case study is a page bundle. `index.md` is the Performance layer; `backstage.md` and `steps/` are optional together, and a bundle without steps is a valid Performance-only case study. Paths in front matter and shortcodes are relative to the bundle folder, including from inside a step.

```
content/work/my-project/
├── index.md          # Performance: front matter + narrative
├── backstage.md      # Backstage: status, planned, updated + optional preface (≤ 80 words)
├── steps/
│   ├── 01-problem.md
│   └── 02-constraints.md
├── snippets/         # text files for {{< ba-code >}}
├── cover.jpg
└── shots/            # images for the body, steps and {{< ba-image >}}
```

### `index.md` front matter

| Field | Required | Notes |
|---|---|---|
| `title` | yes | ≤ 48 characters |
| `summary` | yes | The result as one sentence, ≤ 140 characters |
| `brief` | yes | The problem as one sentence, ≤ 160 characters |
| `date` | yes | Project end date; its year feeds the `PRS-<year>-<NNN>` reference |
| `weight`, `headliner` | no | Lower weight sorts first (default 100). One `headliner: true` per site |
| `role`, `client` | `role` yes | |
| `disciplines`, `stack` | `disciplines` yes | Taxonomies |
| `cover.image`, `cover.alt`, `cover.focus` | image and alt yes | `focus` is a Hugo anchor such as `TopLeft` |
| `barcode.duration`, `barcode.team`, `barcode.outcome.value`, `.unit`, `.label`, `barcode.ref` | yes, except `unit` and `ref` | `team` is a number ("4 people") or a string |
| `result.headline`, `result.metrics` (1 to 3), `result.outcome` | yes | Each metric: `value`, `unit`, `label`, `context` |
| `links` | no | `label`, `url`, `kind` (`live`, `repo`, `writeup`) |
| `backstage.teaser` | when steps exist | The turning point, ≤ 140 characters |
| `backstage.note`, `og_image` | no | |

### Steps

One file per step in `steps/`, numbered with `n` from 1 without gaps. Hugo reserves a top-level `kind`, so the step kind goes under `params`:

```yaml
---
title: "Three ways the numbers could be wrong"
n: 3
params:
  kind: hypotheses
gist: "Duplicates, slow matching, ordering: two confirmed, one refuted."
when: "Weeks 2–4"
hypotheses:
  - { id: "H1", claim: "…", test: "…", verdict: "confirmed", evidence: "…" }
---
```

| Kind | Code | Extra fields |
|---|---|---|
| `problem` | PRB | `statement` (required), `evidence` list of `{label, value}` |
| `constraints` | CON | `constraints` list of `{name, limit, type: hard/soft/assumed, source}` |
| `hypotheses` | HYP | `hypotheses` list of `{id, claim, test, verdict: confirmed/refuted/inconclusive/untested, evidence}` |
| `rejected` | REJ | `options` list of `{name, why, revisit: low/medium/high}` |
| `implementation` | IMP | `decisions` list of `{decision, because}` (optional) |
| `result` | RES | `metrics` list of `{label, before, after, unit, better, before_text, after_text}`, `verdict`, `caveat` |
| `note` | NTE | none |

The build checks this schema and stops with the file path when something required is missing.

### Trapdoor entries

`content/trapdoor/<slug>.md` with `title`, `date`, `severity` (`minor`, `major`, `critical`), `what`, `cause`, `cost`, `changed`, `lessons` (at least one) and an optional `case` naming a case-study folder. The `TD-<NNN>` reference is computed from the date.

### Shortcodes

| Shortcode | Purpose |
|---|---|
| `{{< metric value="14" unit="min" label="…" context="…" size="xl" >}}` | One headline figure |
| `{{< ba-metric label="…" before="190" after="14" unit="min" before_text="3 h 10 min" after_text="14 min" >}}` | Before/after figure with computed change |
| `{{< ba-image before="shots/a.png" before_alt="…" after="shots/b.png" after_alt="…" caption="…" >}}` | Two images compared |
| `{{< ba-code before="snippets/a.sql" after="snippets/b.sql" lang="sql" hl_before="4-9" hl_after="2-6" >}}` | Two code snippets compared |
| `{{< aside label="Cost of being wrong" >}}…{{< /aside >}}` | A margin note |
| `{{< stepref n="5" text="How the cutover ran" >}}` | A link to a Backstage step |

Markdown images take a fragment for width: `![alt](shots/a.png#wide "Caption")`; `#bleed` spans the viewport in the Performance layer; `#decorative` allows empty alt text.

## Accessibility

Prestige targets WCAG 2.2 AA. Every layer and every step is plain HTML in reading order, so the whole site is readable with JavaScript disabled; the script only hides the inactive layer, remembers the choice and runs the step accordion. The curtain toggle is a native radio group, mode changes are announced through a polite status region, targets are at least 44 px, and the four palettes meet the contrast pairs listed in the design specification. Report accessibility problems as issues on the repository.

## Browser support

Chrome and Edge 123+, Firefox 120+, Safari 17.5+. Older browsers get the Performance palette in the light scheme only.

## Fonts and licences

Self-hosted, Latin and Latin Extended subsets, under the SIL Open Font License 1.1 (texts in [`assets/fonts/`](assets/fonts/)):

- Alfa Slab One by JM Solé
- Libre Franklin by Impallari Type
- IBM Plex Mono by IBM

## Development

`exampleSite/` is a demo for a fictional person; every name, client, figure and failure in it is invented, and its images are original illustrations dedicated to the public domain (CC0).

```bash
cd exampleSite && hugo server     # http://localhost:1313/
cd .. && tools/check-budgets.sh            # CSS ≤ 51,200 bytes, JS ≤ 30,720 bytes
node tools/capture-screenshots.mjs  # catalogue images (needs Playwright and ImageMagick)
```

The repository is a Hugo Module (`github.com/m0hss/Prestige`). `exampleSite/hugo.toml` imports it by that path and maps the path to the local checkout (`replacements = "github.com/m0hss/Prestige -> ../.."`), so the demo runs from any clone, whatever its folder is called, without Go installed and without a `themes/` folder.

The demo is deployed to Netlify by `netlify.toml`: it builds `exampleSite/` against the same commit's theme with Hugo extended and overrides the demo's placeholder `baseURL` with the URL Netlify gives each deploy, so deploy previews work too. To set it up, import the repository in Netlify; the build settings come from `netlify.toml`.

The design source of truth is [`stitch_markdown_prestige_system_designer/prestige_design.md`](stitch_markdown_prestige_system_designer/prestige_design.md).

## Licence

MIT. See [LICENSE](LICENSE).
