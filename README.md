# Tem Tem Sabah — Website Rebuild

Pixel-perfect React frontend rebuild of [temtemsabah.com](https://www.temtemsabah.com) — forensic UI/UX reconstruction without WordPress dependency.

## Tech Stack

- **React 19** + **Vite 8**
- **React Router** (client-side routing)
- **Plain CSS** with custom properties (no framework dependency)
- **Lucide React** (icons)

## Pages

| Path | Page |
|---|---|
| `/` | Home (Hero, Mission, Products, Team, Contact) |
| `/contact` | Contact page with form |
| `/newsroom` | Newsroom / milestones |

## Sections (Landing Page)

1. **Hero** — Headline, tagline, CTA, feature cards
2. **Mission & Values** — Vision, Mission, TAGIH values
3. **Products** — Image gallery, certification badges
4. **Team** — Leadership cards, welcome story
5. **Contact** — Contact info, social links, form

## Development

```bash
npm install
npm run dev     # dev server at http://localhost:5173
npm run build   # production build to dist/
npm run preview # preview production build
```

## Deployment

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
npx netlify deploy --prod --dir=dist
```

### cPanel (static hosting)
Upload `dist/` folder contents to public_html via FTP.

## Design Extraction

All colors, fonts, spacing, and layout values extracted from the original WordPress site:
- **Colors:** #00373e (brand teal), #03081e (dark), #ffffff (white)
- **Fonts:** Prata (headings), Work Sans (body), IBM Plex Sans (thin/alternate)
- **Layout:** 1200px wide, 650px content
- **Breakpoint:** 768px (tablet/mobile)

## Asset Credits

- All images hotlinked from the original WordPress site
- Product images from temtemsabah.com
- Hero background: Bryan Heng via Unsplash

## License

© Tem Tem Sabah / Hong Xin Food Sdn Bhd
