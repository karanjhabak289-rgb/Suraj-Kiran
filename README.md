# Suraj Kiran Website

A premium, Stitch-inspired static frontend for Suraj Kiran.

## Included
- Home page
- Product catalogue with search and filters
- Product detail pages
- Shopping bag using browser localStorage
- About page
- Contact page
- Admin UI prototype for product CRUD
- GitHub Pages `CNAME` and `.nojekyll`

## Important admin note
The included `admin.html` is a **prototype only**. Product edits are stored in the browser's localStorage and are NOT a secure global admin system. Do not publish this as a real production admin panel.

For a real admin system, connect:
- Authentication
- Cloud database
- Image storage
- Server-side authorization

A good next phase is to connect a free-tier backend such as Supabase or Firebase, then deploy the public frontend and admin securely.

## GitHub Pages
1. Create a GitHub repository.
2. Upload the contents of this folder.
3. Enable GitHub Pages from Settings → Pages → Deploy from branch.
4. The included `CNAME` is already set to `surajkiran.in`.
5. In GoDaddy DNS, point the domain to GitHub Pages using GitHub's current custom-domain instructions.

## Replace product information
Product data is in `app.js` inside `DEFAULT_PRODUCTS`.

You can replace the placeholder product names, descriptions, prices and image URLs.

## Brand
Suraj Kiran
