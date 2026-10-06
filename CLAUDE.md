# Prestige Hugo Theme

Prestige is a Hugo theme for case-study portfolios. Each project can present a polished **Performance** layer and a structured **Backstage** account of the work. Standalone failure reports live in the **Trapdoor** section.

## Project status

This repository is the standalone theme, not a site using the theme. It currently contains the starter scaffold only. The full theme behavior, page layouts, styles, scripts, and example site are not implemented yet.

The design source of truth is [`stitch_markdown_prestige_system_designer/prestige_design.md`](stitch_markdown_prestige_system_designer/prestige_design.md). Its content model, templates, visual system, accessibility requirements, and acceptance checklist guide future implementation. Keep that specification unchanged unless asked to revise the design.

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

The repository's `.claude/launch.json` starts `hugo server -D` on port 1313 when launched from a Hugo site.

## Content vocabulary

- **Performance** is the concise, polished result of a case study.
- **Backstage** is the numbered account of the problem, constraints, hypotheses, rejected options, implementation, and measured result.
- **Trapdoor** is a standalone failure report with its own reference, impact or cost, cause, and changed behavior.
- Case studies are Hugo page bundles under `content/work/<slug>/`. Their `index.md` is Performance; optional `backstage.md` and `steps/*.md` resources hold the process.
- Trapdoor reports are regular pages under `content/trapdoor/`.

See the `issue-to-case-study` and `incident-to-trapdoor` skills in `.claude/skills/` for evidence-based drafting workflows. Keep new drafts marked `draft: true` unless the user explicitly asks otherwise.

## Scaffold boundaries

The starter includes theme metadata, default Hugo settings, archetypes, and top-level theme directories. Do not treat placeholder archetype values as real project facts. Do not add finished components, visual styling, interactions, or demo content as part of scaffold-only work; implement those only when requested, following the design specification.

Hugo reserves `kind` as page metadata. The step archetype therefore temporarily uses `step_kind`; reconcile this with the design spec's step `kind` field when implementing and validating the step schema.

Theme author and repository/demo URLs in `theme.toml` are provisional FixByte Studio placeholders. Replace them when verified project details are provided.

## Safety and accuracy

- Never invent measurements, causes, outcomes, or evidence. Mark unknowns as TODOs in drafts.
- Do not include secrets, credentials, customer data, private IPs, or internal hostnames in public content.
- Keep the fictional examples in the design specification clearly identified as examples; they are not facts about a real project.
- Draft content for review. Do not publish, deploy, or post externally unless explicitly asked.
