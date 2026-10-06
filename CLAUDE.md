# Prestige Hugo Theme

Prestige is a Hugo theme for case-study portfolios. Each project can present a polished **Performance** layer and a structured **Backstage** account of the work. Standalone failure reports live in the **Trapdoor** section.

## Project status

This repository is the standalone theme, not a site using the theme. The theme is implemented from the design specification: layouts, components, shortcodes, render hooks, styles, scripts, fonts, the `exampleSite/` demo and the `tools/` scripts.

The design source of truth is [`stitch_markdown_prestige_system_designer/prestige_design.md`](stitch_markdown_prestige_system_designer/prestige_design.md). Its content model, templates, visual system, accessibility requirements, and acceptance checklist govern changes. Keep that specification unchanged unless asked to revise the design. Where Hugo forced a different mechanism than the spec describes (stylesheet bundling before Hugo 0.158, SVG sizing, `params.kind`, `:contentbasename` permalinks, site-level `[markup]` and `[taxonomies]`), the code comments and README say so.

## Hugo requirements and local use

Use Hugo **extended 0.146.0 or later**. From a site that imports this theme:

```toml
theme = "prestige"
```

Then run:

```bash
hugo server -D
hugo --gc --minify
```

The repository's `.claude/launch.json` starts `hugo server -D --source exampleSite` on port 1313 from the repository root. To work on the theme itself, run `cd exampleSite && hugo server`: the repository is the Hugo Module `github.com/m0hss/Prestige`, and `exampleSite/hugo.toml` imports it with a local replacement (`../..`), so no themes folder or symlink is needed. Run `tools/check-budgets.sh` before committing CSS or JS changes (CSS ≤ 51,200 bytes, JS ≤ 30,720 bytes).

## Content vocabulary

- **Performance** is the concise, polished result of a case study.
- **Backstage** is the numbered account of the problem, constraints, hypotheses, rejected options, implementation, and measured result.
- **Trapdoor** is a standalone failure report with its own reference, impact or cost, cause, and changed behavior.
- Case studies are Hugo page bundles under `content/work/<slug>/`. Their `index.md` is Performance; optional `backstage.md` and `steps/*.md` resources hold the process.
- Trapdoor reports are regular pages under `content/trapdoor/`.

See the `issue-to-case-study` and `incident-to-trapdoor` skills in `.claude/skills/` for evidence-based drafting workflows. Keep new drafts marked `draft: true` unless the user explicitly asks otherwise.

## Implementation notes

Templates use the Hugo 0.146 layout system (`layouts/_partials/`, `layouts/_shortcodes/`, `layouts/_markup/`). Every user-visible string lives in `i18n/en.toml`. Only `assets/css/tokens.css` may contain colour values. Content is never put in JavaScript, and nothing is hidden except under `html.js` gating.

Hugo reserves `kind` as page metadata: a top-level `kind:` in a step file is an error on Hugo 0.150 and deprecated on later releases. Step files therefore write the design spec's step `kind` under `params:` (`params: { kind: problem }`); templates read it as `.Params.kind`.

The module path and repository URLs are `github.com/m0hss/Prestige`. The `demosite` URL and author details in `theme.toml` are provisional FixByte Studio placeholders; replace them when verified project details are provided.

## Safety and accuracy

- Never invent measurements, causes, outcomes, or evidence. Mark unknowns as TODOs in drafts.
- Do not include secrets, credentials, customer data, private IPs, or internal hostnames in public content.
- Keep the fictional examples in the design specification clearly identified as examples; they are not facts about a real project.
- Draft content for review. Do not publish, deploy, or post externally unless explicitly asked.
