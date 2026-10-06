# Prestige

Prestige is a Hugo theme starter for case-study portfolios. Its design separates project outcomes (Performance) from the documented process (Backstage), with standalone failure reports (Trapdoor).

![Prestige theme preview](https://raw.githubusercontent.com/fixbyte-studio/hugo-theme-prestige/main/images/screenshot.png)

> The preview URL is provisional. The theme scaffold does not yet include a screenshot or the finished theme.

## Requirements

Hugo **extended 0.146.0 or later**.

## Installation

Add Prestige as a Hugo Module:

```toml
[module]
  [[module.imports]]
    path = "github.com/fixbyte-studio/hugo-theme-prestige"
```

Or add this repository as a submodule at `themes/prestige` and set the following in your site configuration:

```toml
theme = "prestige"
```

The repository URLs above are placeholders pending verification.

## Starter structure

- `archetypes/` contains generic, case-study bundle, Backstage, step, and Trapdoor starters.
- `layouts/`, `assets/`, `i18n/`, `static/`, and `images/` are reserved for the theme implementation.
- [`stitch_markdown_prestige_system_designer/prestige_design.md`](stitch_markdown_prestige_system_designer/prestige_design.md) is the design and content-model specification.

This is a scaffold. Page templates, components, styling, interactions, and an example site have not been implemented, so the theme is not yet a finished or previewable portfolio.

## Creating content

In a site that uses the theme, Hugo archetypes can start a case-study bundle and a Trapdoor report:

```bash
hugo new content work/my-project
hugo new content trapdoor/my-failure.md
```

Replace every `TODO` in the generated front matter with verified project information before publishing. Consult the design specification for the complete case-study and step schemas. The step archetype uses `step_kind` because Hugo reserves `kind` as page metadata; the design spec's `kind` field needs reconciliation before the step schema is implemented.

## License

Prestige is distributed under the MIT License. See [`LICENSE`](LICENSE).
