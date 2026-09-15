# BorewellPro – Premium Borewell Drilling & Water Solutions HTML Template

**BorewellPro** is a commercial-grade, fully responsive, multipurpose HTML5 website template specifically designed for borewell drilling contractors, groundwater exploration specialists, water testing laboratories, pump technicians, and municipal water solution companies.

Built to ThemeForest and TemplateMonster standards with semantic HTML5, modern Bootstrap 5.3, vanilla JavaScript, comprehensive dark mode, and full right-to-left (RTL) layout support.

---

## 🌟 Key Features

- **15 Standalone HTML Pages**: 100% functional without server dependencies or build steps.
- **Two Distinct Homepages**:
  - `index.html`: General services landing page with 8+ rich conversion sections.
  - `index-2.html`: Niche industrial borewell specialist landing page featuring before/after project showcase.
- **Complete Dark Mode System**:
  - One-click toggle switch in top bar and header.
  - Automatic preference detection with `localStorage` persistence.
  - High-contrast typography and cards with zero white bleed.
- **Bi-directional RTL Support**:
  - Dynamic `dir="rtl"` layout flipping with mirrored breadcrumbs and navigation.
- **Interactive JavaScript Features**:
  - Animated numeric counter metrics (`IntersectionObserver`).
  - Interactive testimonials slider with autoplay and manual controls.
  - Real-time live service area search (filter by city, district, or pincode).
  - Real-time blog search and interactive category tag filtering.
  - Interactive Before/After groundwater project transformation.
  - Working countdown timer on the Coming Soon page.
- **Full Client-Side Form Validation**:
  - Site visit booking form with 10-digit phone and date validation.
  - Interactive submission modal confirmation with dynamic reference number generator.
  - Login & registration forms with show/hide password toggle.
  - Newsletter subscription validation.
- **SEO & Accessibility**:
  - Semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`).
  - WCAG-compliant color contrast and keyboard navigation focus states.

---

## 📁 File Structure

```
borewell-pro/
│
├── index.html              # Home Page 1 – General Services Landing
├── index-2.html            # Home Page 2 – Borewell Niche Landing
├── about.html              # Company Profile, Mission, Vision, Team & Stats
├── services.html           # 6 Core Services Grid & Catalog
├── service-details.html    # Detailed Technical Service Blueprint
├── pricing.html            # Pricing Packages & Feature Comparison Matrix
├── service-area.html       # Searchable Regional Coverage & Logistics Map
├── blog.html               # Groundwater Insights with Live Filter
├── blog-details.html       # Technical Article with TOC, Author Bio & Comments
├── contact.html            # Contact Cards & Interactive Site Visit Form
├── login.html              # Authentication Login Screen
├── register.html           # Account Registration Screen
├── 404.html                # Custom Drilling Themed 404 Error Page
├── coming-soon.html        # Maintenance Page with Working Countdown
│
├── assets/
│   ├── css/
│   │   ├── bootstrap.min.css   # Bootstrap 5.3.3 Core Framework
│   │   ├── style.css           # Core Industrial Design Tokens & Components
│   │   ├── responsive.css      # Viewport Overrides (320px to 1440px+)
│   │   └── dark-mode.css       # Complete Dark Mode Overrides
│   │
│   ├── js/
│   │   ├── bootstrap.bundle.min.js # Bootstrap Interactive Bundle
│   │   ├── main.js             # Counters, Testimonial Slider, RTL, Countdown
│   │   ├── navigation.js       # Sticky Navbar & Mobile Offcanvas Drawer
│   │   ├── form-validation.js  # Booking & Contact Form Validation Engine
│   │   ├── dark-mode.js        # Theme Toggle & LocalStorage Engine
│   │   └── search.js           # Live Blog & Service Area Search Filters
│   │
│   └── images/                 # Categorized High-Resolution Industrial Photos
│       ├── hero/
│       ├── services/
│       ├── about/
│       ├── projects/
│       ├── equipment/
│       ├── team/
│       ├── blog/
│       └── testimonials/
│
├── components/                 # Modular Snippets for Reference & Integration
│   ├── header.html
│   ├── footer.html
│   ├── mobile-menu.html
│   ├── breadcrumb.html
│   └── modals.html
│
└── README.md
```

---

## 🎨 Color System

| Role | Color | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary Navy** | Deep Charcoal / Navy | `#080D15` / `#0F172A` | Backgrounds, Headers, Badges |
| **Water Blue Accent** | Ocean Blue | `#0284C7` / `#0EA5E9` | Buttons, Active Links, Icons, Highlights |
| **Earth Tone** | Clay Sand | `#D4A373` / `#B08968` | Secondary badges, Geological accents |
| **Surface Light** | Off-White / Slate | `#FFFFFF` / `#F8FAFC` | Page backgrounds, Card surfaces |
| **Surface Dark** | Deep Slate | `#090E17` / `#131E2E` | Dark mode cards and input fields |

---

## 🚀 Quick Start Guide

1. **Unzip or Clone the Template**:
   Open the `borewell-pro` folder on your local computer.
2. **Open in Any Browser**:
   Double click on `index.html` (or `index-2.html`). No Node.js, Webpack, or local server is required to view the pages.
3. **Optional Local Server**:
   You can run a local development server using Python:
   ```bash
   python -m http.server 8000
   ```
   Then navigate to `http://localhost:8000/borewell-pro/index.html`.

---

## ⚙️ Customization

### Changing Phone & Email
Search and replace the demo contact details across all HTML files:
- Phone: `+91 98765 43210`
- Email: `support@borewellpro.com` / `info@borewellpro.com`

### Modifying Brand Colors
Open `assets/css/style.css` and update the CSS variables in the `:root` block:
```css
:root {
  --bp-blue-600: #0284C7; /* Change to your brand color */
  --bp-navy-800: #0F172A; /* Change to your primary dark tone */
}
```

---

## 📄 Browser Support

- Google Chrome (Latest)
- Mozilla Firefox (Latest)
- Apple Safari (Latest)
- Microsoft Edge (Latest)
- Opera (Latest)
- Mobile Safari & Chrome on iOS and Android

---

## 📜 License

Created for commercial distribution and professional client deployment.
All imagery is sourced from Unsplash with permissible free commercial usage licenses.
Bootstrap 5.3 is released under the MIT License.
Icons provided by Bootstrap Icons under the MIT License.
