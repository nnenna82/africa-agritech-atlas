# Design system

A research tool, not a brochure: field greens for growth, millet gold for emphasis, a mono face for data. Match `screenshots/` and `prototype/atlas-prototype.html`.

## Fonts (Google Fonts)
| Role | Font | Use |
| --- | --- | --- |
| Display | Bricolage Grotesque 500/700 | Page titles, headings, big numbers |
| Body | IBM Plex Sans 400/500/600 | Everything else, 15px / 1.55 |
| Data | IBM Plex Mono 400/500 | Labels, eyebrows, chips, numbers in tables (tabular) |

## Colors (light / dark)
| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| bg | #f5f6f2 | #111713 | Page |
| surface | #ffffff | #18201b | Cards, tables |
| sunk | #eceee7 | #0c110e | Table headers, tracks |
| fg | #18231d | #e7ece6 | Text |
| muted | #5b665e | #9aa69d | Secondary text |
| line | #d9ddd3 | #2c3730 | Borders |
| accent | #1f6b4f | #6cc39b | Links, buttons, selected |
| accent-soft | #dcebe3 | #1f3a2e | Selected backgrounds |
| gold | #b5821b | #e0b55a | Rules, highlights, "my interest" on the map |
| gold-soft | #f3e7cb | #3a2f17 | Crop Journeys band, notices |

## Color groups (scores)
| Group | Light | Dark |
| --- | --- | --- |
| Leading | #1a5a42 | #9fe0bd |
| Advancing | #3f8a67 | #6cb592 |
| Middle | #7fb598 | #4f8a6c |
| Emerging | #b7d4c1 | #3d6150 |
| Early stage | #e3ece1 | #2a3b31 |
| Not enough data | #e6e8e2 | #2a312c |

Always show the group name next to the swatch; never show the number.

## Region colors (map)
North #c9a227 · West #c46b4a · Central #8a6fb0 · East #3f8fb0 · Southern #4f9a5a

## Components
- **The bar:** dark band (fg background) under the menu with the four dropdowns and Clear
- **Breadcrumbs:** Home › Africa › Region › Country, links in accent
- **Tier chip:** swatch + group name; **color scale:** five swatches with the current one outlined
- **Region card:** color strip, name, counts, strongest countries, mini color-mix bar
- **Crop Journeys band:** gold-soft panel, four white crop cards, "Open Crop Journeys ↗" button
- **News item:** relative date column, headline, summary, "Why it matters", tags, source link
- **Suggest box:** dashed border at the end of list pages, "Suggest an addition or correction" button
- Cards: white surface, 1px line border, 8–10px radius, no shadows

## Map rules
- Mercator fitted to Africa including island dots; same proportions when zoomed to a region (pad the shorter side)
- Thin light borders between countries; hover thickens the border and shows "Country · Region · Group"
- Other regions fade to about 30% opacity when a region is selected; never crop into a wide strip
- Countries are keyboard-focusable and open on Enter

## Accessibility
Text contrast at least 4.5:1, touch targets at least 44px, visible focus rings (gold), works at 400px wide, respects reduced motion.
