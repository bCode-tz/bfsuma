# Deployment Guide – BF SUMA Website

## Main entry point

**index.html** is the main page. All assets are linked from it and must stay in the **same folder** as `index.html` when you deploy.

### Files linked from index.html

| Purpose        | File / path              |
|----------------|---------------------------|
| Styles         | `styles.css`              |
| Scripts        | `script.js`               |
| Admin page     | `admin.html` (footer)     |
| Logo           | `logo.jpeg`               |
| Product images | All `.jpeg`, `.jpg`, `.png` in this folder (paths in HTML) |

### Admin dashboard (admin.html)

- **admin.html** – Admin page (linked from footer “Admin”).
- **admin-styles.css** – Admin styles.
- **admin-script.js** – Admin logic.
- **logo.jpeg** – Used in admin header.

Upload the **entire project folder** so that `index.html`, `admin.html`, CSS, JS, and all image files stay in one directory. No build step required.

---

## Pre-deployment check

- [x] All paths in `index.html` and `admin.html` are **relative** (no absolute local paths).
- [x] WhatsApp: +255 743 347 824.
- [x] Orders use `localStorage` key `bfsumaOrders`.
- [x] Admin login: username `bfsuma`, password `bfsuma@123`.

---

## How to deploy (any static host)

1. **Upload** the whole folder (including `index.html`, `admin.html`, all CSS, JS, and images) to your host.
2. **Set** the site’s default document to **index.html** (most hosts do this automatically).
3. **Open** the site URL in a browser; the main page is `index.html`, admin is `yoursite.com/admin.html` (or `yoursite.com/bfsuma/admin.html` if in a subfolder).

### Examples

- **Netlify / Vercel**: Drag the folder or connect a repo; root file = `index.html`.
- **Shared hosting (cPanel, etc.)**: Upload all files to `public_html` (or the folder your domain points to).
- **GitHub Pages**: Upload the folder; set Pages to serve from this folder/branch. No `.gitignore` or GitHub-specific files are required for the site to run.

---

## After deployment

- [ ] Open the live URL and check home, catalog, cart, and “Place Order”.
- [ ] Open `yoursite.com/admin.html`, log in, and check orders.
- [ ] Test the WhatsApp link and one full order flow.
- [ ] Test on phone and desktop.

---

## Notes

- **Data**: Orders and cart use **localStorage**; data is per browser/device.
- **Admin**: Credentials are in `admin-script.js`; for stronger security, use server-side auth later.
- **Images**: Keep image filenames exactly as in the HTML (including spaces, e.g. `gluzo joint capsule.jpeg`).

**Ready for deployment.**
