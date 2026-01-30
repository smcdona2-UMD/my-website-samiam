# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static personal portfolio website for www.samiam.info, hosted on GoDaddy. No build step required - files can be uploaded directly to GoDaddy via FTP or file manager.

## Project Structure

```
my-website/
├── index.html      # Single-page site with all sections
├── css/
│   └── styles.css  # All styles, uses CSS variables for theming
├── js/
│   └── main.js     # Mobile nav, scroll effects, form handling
└── images/         # Place images here
```

## Development

**Local preview:** Open `index.html` directly in a browser, or use a local server:
```bash
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Deployment to GoDaddy

Upload all files maintaining the folder structure:
- `index.html` goes in the root (public_html or www folder)
- `css/`, `js/`, and `images/` folders alongside it

## Customization

**Colors/Theme:** Edit CSS variables at the top of `css/styles.css` (`:root` block)

**Contact Form:** Currently shows an alert. To enable actual email delivery:
1. Use a service like [Formspree](https://formspree.io) - change form `action` to your Formspree URL
2. Or use GoDaddy's form processing if your plan includes it

## Architecture Notes

- Single-page layout with anchor navigation (#about, #portfolio, #contact)
- Mobile-responsive with hamburger menu at 768px breakpoint
- Fixed header with scroll shadow effect
- No dependencies or build tools - pure HTML/CSS/JS
