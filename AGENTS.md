# AGENTS.md - Rybkr

This is the personal webpage for Ryan Baker.

## Repository Guidelines

## Content and Presentation

Maintain a **strict separation between content and presentation**:

- All authored page content belongs in Markdown under `content/`, including blog posts and resume text. Keep metadata in Markdown front matter.
- Layout and rendering belong in HTML/Hugo templates under `layouts/`; styles belong in `static/css/`.
- Never hardcode page content in templates or embed layout HTML, styling, or rendering logic in Markdown.
- Writing a blog postm updating resume content, or other similar edits should require **only Markdown edits**.

## Development

- Preview: `hugo server -D`.
- Build: `hugo --gc --minify`.
- Treat `docs/` as generated output; edit sources and rebuild.
- Follow existing formatting and verify affected pages in the browser.
