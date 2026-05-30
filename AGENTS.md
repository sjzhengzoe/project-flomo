# Project Agent Guidance

## Project Skills

When working on A6 landscape loose-leaf menu backgrounds, use the project-local skill:

`skills/menu-binder-background-design/SKILL.md`

Use it for requests involving:
- `菜谱背景图`
- `活页菜单背景`
- `A6 横版菜单背景`
- printable binder menu card backgrounds
- white-base cafe, retro, hand-drawn, food, dessert, or coffee shop menu background styles
- prompt writing for backgrounds that preserve the left binding area while keeping the right content area flexible

Key rules from the skill:
- Keep A6 landscape output at `1748 × 1240px` / `300dpi` unless the user asks otherwise.
- Preserve the left `16mm` binding safe area and divider position.
- Treat the binding area as a width/layout constraint, not as a forced pure-white strip. It may share subtle background treatment, but should not contain important motifs, text-like marks, or high-contrast details.
- Do not draw punch holes unless explicitly requested.
- Account for printer white margins. Avoid full-bleed tinted backgrounds that create obvious white borders after printing.
- Prefer a white/no-color visual base with added decoration, or make any paper tint/texture fade naturally to white/no-color on all four outer edges.
- Avoid fixed photo frames, text boxes, prices, logos, or fake menu text.
- Avoid full-page color fills, hard-edge paper textures, and decoration that depends on exact trimming.
- Keep the central-right content zone low-interference so foreground food image/text sizes can change.
- Use the current foreground zones to balance decoration without drawing them: image area `x=43mm y=13mm w=78mm h=52mm`, text area `x=43mm y=70mm w=78mm h=26mm`.
- Do not push all decoration to the far right edge. Distribute sparse motifs around the usable right-side page while respecting the image/text reference zones, so the left side of the display area does not feel empty.
- Save generated background assets under `public/菜谱背景图/`.
- Name background files from the secondary tab name plus two digits, e.g. `基础极简01.png`.
- If wiring a background into the UI, add it to the A6 background list with `name` matching the filename without extension and `src` using `encodeURI("/菜谱背景图/{filename}.png")`.
- Run `npm run build` after code changes.
