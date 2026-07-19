# Shelfwire — public site (GitHub Pages)

English mini-site for:

- Pinterest / developer app **Website URL**
- **Privacy Policy URL**
- Honest positioning: independent advertising / product-content specialist (not the manufacturer)

## URLs after publish

If the repo is `YOUR_USER/shelfwire-site` and GitHub Pages is on:

| Field in Pinterest | URL |
|--------------------|-----|
| Website | `https://YOUR_USER.github.io/shelfwire-site/` |
| Privacy policy | `https://YOUR_USER.github.io/shelfwire-site/privacy.html` |

## Before you publish

1. Replace **email** in `index.html` and `privacy.html`  
   (search for `hello.shelfwire@gmail.com`).
2. Optional: rename “Shelfwire” if you want another brand.

## Deploy (5 minutes)

### A. New empty GitHub repo

1. GitHub → **New repository** → name e.g. `shelfwire-site` → Public → Create.
2. On your Mac:

```bash
cd "/Volumes/SSD 250/Grok social-poster/public-site"
git init
git add .
git commit -m "Initial Shelfwire public site + privacy policy"
git branch -M main
git remote add origin https://github.com/YOUR_USER/shelfwire-site.git
git push -u origin main
```

3. Repo → **Settings** → **Pages** → Source: **Deploy from a branch** → Branch: `main` / `/ (root)` → Save.
4. Wait 1–2 minutes → open `https://YOUR_USER.github.io/shelfwire-site/`

### B. Local preview

```bash
cd "/Volumes/SSD 250/Grok social-poster/public-site"
python3 -m http.server 5500
# http://127.0.0.1:5500
```

## What to paste into Pinterest app form

**App purpose (example):**

> Independent product-content and advertising tool for publishing wholesale catalog media (images/video) to boards I manage via Pinterest API v5. Used for authorized trade marketing content related to assortments sold in Russia and export. Not a public multi-user posting SaaS.

**Website:** your GitHub Pages home URL  
**Privacy:** your `.../privacy.html` URL
