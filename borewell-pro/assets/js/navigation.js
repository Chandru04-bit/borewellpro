/**
 * BorewellPro - Navigation Controller
 * Manages sticky navbar, dropdown states, offcanvas mobile drawer, and active links
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const header = document.querySelector('.site-header');

  // Sticky header on scroll
  function handleScrollHeader() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', handleScrollHeader, { passive: true });
  handleScrollHeader();

  // Active Link Highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const urlParams = new URLSearchParams(window.location.search);
  const currentService = urlParams.get('service');
  const navLinks = document.querySelectorAll('.site-header .nav-link, .offcanvas-mobile-nav .nav-link, .dropdown-item');

  function updateActiveLinks() {
    const activeService = new URLSearchParams(window.location.search).get('service');
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const targetBase = href.split('?')[0].split('/').pop();
      const linkParams = href.includes('?') ? new URLSearchParams(href.split('?')[1]) : null;
      const linkService = linkParams ? linkParams.get('service') : null;

      let isMatch = false;
      if (currentPath === 'service-details.html') {
        if (targetBase === 'service-details.html') {
          if (activeService && linkService) {
            isMatch = (activeService === linkService);
          } else if (!activeService && !linkService) {
            isMatch = true;
          }
        }
      } else if (targetBase === currentPath || (currentPath === '' && targetBase === 'index.html')) {
        if (!href.includes('?') || targetBase !== 'service-details.html') {
          isMatch = true;
        }
      }

      if (isMatch) {
        link.classList.add('active');
        const parentDropdown = link.closest('.dropdown');
        if (parentDropdown) {
          const toggle = parentDropdown.querySelector('.dropdown-toggle');
          if (toggle) toggle.classList.add('active');
        }
      } else {
        // Only remove active from dropdown-item if not matching
        if (link.classList.contains('dropdown-item')) {
          link.classList.remove('active');
        }
      }
    });
  }
  updateActiveLinks();

  // Handle dropdown item clicks reliably
  document.querySelectorAll('.site-header .dropdown-item').forEach((item) => {
    item.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      // Close parent dropdown menu cleanly
      const parentDropdown = this.closest('.dropdown');
      if (parentDropdown && typeof bootstrap !== 'undefined') {
        const toggle = parentDropdown.querySelector('[data-bs-toggle="dropdown"]');
        if (toggle) {
          const bsDropdown = bootstrap.Dropdown.getInstance(toggle) || new bootstrap.Dropdown(toggle);
          if (bsDropdown) {
            bsDropdown.hide();
          }
        }
      }

      // If already on service-details.html and clicking another service detail item
      const thisPath = window.location.pathname.split('/').pop() || 'index.html';
      if (thisPath === 'service-details.html' && href.includes('service-details.html')) {
        e.preventDefault();
        window.history.pushState(null, '', href);
        updateActiveLinks();
        if (typeof window.loadServiceDetails === 'function') {
          window.loadServiceDetails();
        } else {
          window.location.href = href;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // Close mobile drawer when clicking internal link
  const offcanvasEl = document.getElementById('mobileNavDrawer');
  if (offcanvasEl && typeof bootstrap !== 'undefined') {
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
    offcanvasEl.querySelectorAll('a:not(.dropdown-toggle)').forEach((link) => {
      link.addEventListener('click', () => {
        bsOffcanvas.hide();
      });
    });
  }
});
