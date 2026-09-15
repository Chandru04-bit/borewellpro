/**
 * BorewellPro - Search & Filter Controller
 * Real-time filter for Service Areas and Blog Articles
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Service Area Search Filter
  const areaSearchInput = document.getElementById('serviceAreaSearch');
  const areaCards = document.querySelectorAll('.service-area-card');
  const areaNoResults = document.getElementById('areaNoResults');
  const areaCounter = document.getElementById('areaResultCount');

  if (areaSearchInput && areaCards.length > 0) {
    areaSearchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();
      let matchCount = 0;

      areaCards.forEach((card) => {
        const areaName = card.getAttribute('data-area-name') || card.textContent.toLowerCase();
        const areaDistrict = card.getAttribute('data-district') || '';
        const areaPincode = card.getAttribute('data-pincode') || '';

        if (
          areaName.includes(query) ||
          areaDistrict.toLowerCase().includes(query) ||
          areaPincode.includes(query)
        ) {
          card.style.display = '';
          matchCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (areaCounter) {
        areaCounter.textContent = `Showing ${matchCount} of ${areaCards.length} service locations`;
      }

      if (areaNoResults) {
        areaNoResults.style.display = matchCount === 0 ? 'block' : 'none';
      }
    });
  }

  // 2. Blog Search & Category Tag Filter
  const blogSearchInput = document.getElementById('blogSearchInput');
  const blogPills = document.querySelectorAll('.blog-filter-pill');
  const blogArticles = document.querySelectorAll('.blog-article-item');
  const blogNoResults = document.getElementById('blogNoResults');
  const blogCounter = document.getElementById('blogResultCount');

  let activeCategory = 'all';

  function applyBlogFilters() {
    if (!blogArticles.length) return;
    const query = blogSearchInput ? blogSearchInput.value.toLowerCase().trim() : '';
    let matchCount = 0;

    blogArticles.forEach((article) => {
      const title = (article.querySelector('.blog-title') ? article.querySelector('.blog-title').textContent : '').toLowerCase();
      const snippet = (article.querySelector('.blog-excerpt') ? article.querySelector('.blog-excerpt').textContent : '').toLowerCase();
      const category = (article.getAttribute('data-category') || '').toLowerCase();

      const matchesCat = activeCategory === 'all' || category === activeCategory;
      const matchesQuery = query === '' || title.includes(query) || snippet.includes(query) || category.includes(query);

      if (matchesCat && matchesQuery) {
        article.style.display = '';
        matchCount++;
      } else {
        article.style.display = 'none';
      }
    });

    if (blogCounter) {
      blogCounter.textContent = `Displaying ${matchCount} ${matchCount === 1 ? 'article' : 'articles'}`;
    }

    if (blogNoResults) {
      blogNoResults.style.display = matchCount === 0 ? 'block' : 'none';
    }
  }

  if (blogSearchInput) {
    blogSearchInput.addEventListener('input', applyBlogFilters);
  }

  if (blogPills.length > 0) {
    blogPills.forEach((pill) => {
      pill.addEventListener('click', function (e) {
        e.preventDefault();
        blogPills.forEach((p) => p.classList.remove('active'));
        this.classList.add('active');
        activeCategory = this.getAttribute('data-filter') || 'all';
        applyBlogFilters();
      });
    });
  }
});
