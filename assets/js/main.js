/**
 * BorewellPro - Main Application Controller
 * Handles animated counters, testimonial slider, RTL layout toggle, scroll triggers,
 * coming-soon countdown, and back-to-top button
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Replace page-local footers with the shared Home Page 1 footer.
  const footerMount = document.querySelector('[data-footer-component]');
  const localFooter = document.querySelector('footer');
  if (footerMount || localFooter) {
    const mainScript = document.querySelector('script[src$="/assets/js/main.js"]');
    const scriptUrl = mainScript ? new URL(mainScript.getAttribute('src'), document.baseURI) : null;
    const siteRoot = scriptUrl ? new URL('../../', scriptUrl).href : new URL('./', document.baseURI).href;
    const componentUrl = new URL('components/footer.html', siteRoot).href;

    fetch(componentUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Footer request failed: ${response.status}`);
        return response.text();
      })
      .then((footerHtml) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = footerHtml;
        wrapper.querySelectorAll('a[href]').forEach((link) => {
          const href = link.getAttribute('href');
          if (href && !/^(?:[a-z]+:|\/|#)/i.test(href)) {
            link.setAttribute('href', new URL(href, siteRoot).href);
          }
        });

        const replacement = document.createDocumentFragment();
        while (wrapper.firstChild) replacement.appendChild(wrapper.firstChild);
        if (footerMount) {
          footerMount.replaceWith(replacement);
        } else if (localFooter) {
          localFooter.replaceWith(replacement);
        }
      })
      .catch(() => {
        // Keep the page-local footer available if the component cannot load.
      });
  }

  // 1. RTL Layout Switcher & Persistence
  const RTL_KEY = 'borewellpro_rtl';
  const htmlEl = document.documentElement;

  function readRTLPreference() {
    try {
      return localStorage.getItem(RTL_KEY) === 'true';
    } catch (error) {
      return false;
    }
  }

  function saveRTLPreference(isRTL) {
    try {
      localStorage.setItem(RTL_KEY, String(isRTL));
    } catch (error) {
      // The current page still switches even when storage is unavailable.
    }
  }

  function setRTL(isRTL) {
    htmlEl.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    htmlEl.classList.toggle('is-rtl', isRTL);
    saveRTLPreference(isRTL);
    updateRTLButtons(isRTL);
    window.dispatchEvent(new CustomEvent('rtlchange', { detail: { isRTL } }));
  }

  function updateRTLButtons(isRTL) {
    document.querySelectorAll('.rtl-toggle-btn').forEach((btn) => {
      btn.textContent = isRTL ? 'LTR' : 'RTL';
      btn.setAttribute('title', isRTL ? 'Switch to Left-to-Right (LTR)' : 'Switch to Right-to-Left (RTL)');
      btn.setAttribute('aria-label', isRTL ? 'Switch to Left-to-Right' : 'Switch to Right-to-Left');
      btn.classList.toggle('active', isRTL);
    });
  }

  const savedRTL = readRTLPreference();
  if (savedRTL) {
    htmlEl.setAttribute('dir', 'rtl');
    htmlEl.classList.add('is-rtl');
  } else {
    htmlEl.setAttribute('dir', 'ltr');
    htmlEl.classList.remove('is-rtl');
  }
  updateRTLButtons(savedRTL);

  document.querySelectorAll('.rtl-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = htmlEl.getAttribute('dir') === 'rtl';
      setRTL(!current);
    });
  });

  // 2. Animated Numeric Counters (IntersectionObserver)
  const counterEls = document.querySelectorAll('[data-counter-target]');
  if (counterEls.length > 0) {
    const observerOptions = { threshold: 0.2 };
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-counter-target'), 10);
          const prefix = el.getAttribute('data-counter-prefix') || '';
          const suffix = el.getAttribute('data-counter-suffix') || '';
          const duration = 1800; // ms
          const start = 0;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quad
            const easeProgress = 1 - (1 - progress) * (1 - progress);
            const currentVal = Math.floor(start + (target - start) * easeProgress);

            el.textContent = `${prefix}${currentVal.toLocaleString()}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
            }
          }

          requestAnimationFrame(updateCounter);
          observer.unobserve(el);
        }
      });
    }, observerOptions);

    counterEls.forEach((el) => counterObserver.observe(el));
  }

  // 3. Scroll Reveal Animation
  const animatedElements = document.querySelectorAll('.animate-up');
  if (animatedElements.length > 0) {
    animatedElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 80) {
        el.classList.add('in-view');
      }
    });

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05, rootMargin: '0px 0px 60px 0px' });

      animatedElements.forEach((el) => {
        if (!el.classList.contains('in-view')) {
          revealObserver.observe(el);
        }
      });
    } else {
      animatedElements.forEach((el) => el.classList.add('in-view'));
    }
  }

  // 4. Testimonial Carousel / Slider Controller
  const sliderTrack = document.querySelector('.testimonial-slider-track');
  const slides = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.querySelector('.slider-control-prev');
  const nextBtn = document.querySelector('.slider-control-next');
  const indicators = document.querySelectorAll('.slider-dot-indicator');

  if (sliderTrack && slides.length > 0) {
    let currentIndex = 0;
    const totalSlides = slides.length;
    let slideInterval = null;

    function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentIndex = index;

      sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;

      indicators.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function resetAutoRotate() {
      if (slideInterval) {
        clearInterval(slideInterval);
      }
      slideInterval = setInterval(() => goToSlide(currentIndex + 1), 6000);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
        resetAutoRotate();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
        resetAutoRotate();
      });
    }

    indicators.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goToSlide(i);
        resetAutoRotate();
      });
    });

    // Auto rotate every 6 seconds
    slideInterval = setInterval(() => goToSlide(currentIndex + 1), 6000);
    const sliderContainer = document.querySelector('.testimonial-slider-wrapper');
    if (sliderContainer) {
      sliderContainer.addEventListener('mouseenter', () => {
        if (slideInterval) clearInterval(slideInterval);
      });
      sliderContainer.addEventListener('mouseleave', () => {
        resetAutoRotate();
      });
    }

    // Re-calculate position when RTL mode changes
    window.addEventListener('rtlchange', () => {
      goToSlide(currentIndex);
    });

    // Initialize slide state
    goToSlide(0);
  }

  // 5. Back to Top Button
  const backToTopBtn = document.querySelector('.back-to-top-btn');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 450) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 6. Coming Soon Countdown Timer
  const countdownEl = document.getElementById('comingSoonCountdown');
  if (countdownEl) {
    // 45 days from current date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 45);

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        countdownEl.innerHTML = '<h4 class="text-white">We are officially live!</h4>';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const dEl = document.getElementById('countDays');
      const hEl = document.getElementById('countHours');
      const mEl = document.getElementById('countMinutes');
      const sEl = document.getElementById('countSeconds');

      if (dEl) dEl.textContent = String(days).padStart(2, '0');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
      if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // 7. Service Data Catalog
  const serviceCatalog = {
    '1': {
      title: 'Professional Borewell Drilling Services',
      shortTitle: 'Borewell Drilling',
      image: 'assets/images/services/service-1.jpg',
      lead: 'High-precision DTH & rotary drilling engineered for maximum aquifer yield and well longevity.',
      heading: 'Engineered Groundwater Discovery & Drilling',
      description: 'At BorewellPro, drilling a borewell is an exact scientific process. We combine geological resistivity aquifer mapping, high-pressure Down-The-Hole (DTH) percussion drilling, and heavy-duty casing systems to ensure your well delivers sustainable, crystal-clear water for decades to come.',
      highlights: [
        'Geological resistivity survey & vein pinpointing',
        '4.5" to 8.5" diameter drilling capability',
        'High-velocity DTH hammer percussion rigs',
        'Heavy ISI-certified PVC & seamless MS casing',
        'Real-time flow yield measurement & depth logging',
        'Experienced certified drilling operators'
      ],
      specs: [
        { label: 'Drilling Technology', value: 'High-Pressure DTH & Hydraulic Rotary' },
        { label: 'Drill Diameter', value: '4.5" to 8.5" Standard Profiles' },
        { label: 'Drilling Depth Capacity', value: 'Up to 1,500 Feet' },
        { label: 'Casing Pipe Installed', value: 'Heavy Duty ISI PVC / Seamless MS Casing' },
        { label: 'Geological Formations', value: 'Hard Rock, Crystalline Gneiss, Alluvial Clay' },
        { label: 'Average Execution Time', value: '1 to 2 Days Typical Completion' }
      ]
    },
    '2': {
      title: 'Certified Groundwater Quality Testing',
      shortTitle: 'Water Testing',
      image: 'assets/images/services/service-2.jpg',
      lead: 'Detailed 16-parameter chemical and microbiological screening ensuring healthy, safe drinking water.',
      heading: 'Certified Groundwater Lab Analysis & Testing',
      description: 'Ensure the safety of your family, livestock, crops, and industrial machinery with our accredited lab testing. We test for pH, Total Dissolved Solids (TDS), total hardness, iron, fluorides, nitrates, chlorides, and coliform bacteria, providing full actionable filtration reports.',
      highlights: [
        'Comprehensive 16-parameter water analysis',
        'Certified environmental laboratory accreditation',
        'TDS, hardness, iron, and fluoride profiling',
        'Agricultural salinity & irrigation suitability indexing',
        'Full potability and health clearance certification',
        'Doorstep water sample collection service'
      ],
      specs: [
        { label: 'Testing Parameters', value: '16 Standard Physicochemical & Microbial Tests' },
        { label: 'Key Markers Tested', value: 'pH, TDS, Hardness, Nitrates, Fluoride, E. Coli' },
        { label: 'Report Delivery', value: '24 to 48 Hours with Expert Recommendations' },
        { label: 'Compliance Standard', value: 'IS 10500 Indian Drinking Water Standards' },
        { label: 'Filtration Guidance', value: 'Custom RO / Softener / UV Sizing Advice' },
        { label: 'Sampling Method', value: 'Sterilized Direct Aquifer Sample Collection' }
      ]
    },
    '3': {
      title: 'Submersible Pump Installation & Setup',
      shortTitle: 'Pump Installation',
      image: 'assets/images/services/service-3.jpg',
      lead: 'Accurate pump sizing, high-grade stainless steel motors, digital control panels, and expert lowering.',
      heading: 'High-Efficiency Submersible Motor & Pump Solutions',
      description: 'Selecting and installing the exact horsepower and stage rating is critical to guarantee peak water discharge and prevent premature motor burnout. We supply and install premium stainless steel pumps, heavy copper cables, digital auto-start panels, and safety suspension cables.',
      highlights: [
        'Computerized pump head, yield & flow calculations',
        '100% SS-304 stainless steel submersible impellers',
        'Digital control panels with auto-start & dry-run cutoff',
        'Heavy-duty submersible flat copper cabling',
        'High-tensile stainless steel safety suspension wire',
        'Energy-efficient 5-star BEE rated electric motors'
      ],
      specs: [
        { label: 'Pump Technologies', value: 'Multi-Stage Submersible, V4/V6, Solar Hybrid' },
        { label: 'Power Range', value: '1.0 HP to 30.0 HP Industrial Capacities' },
        { label: 'Max Discharge Head', value: 'Up to 1,200 Feet Dynamic Head' },
        { label: 'Panel Protection', value: 'Phase Loss, Voltage Fluctuation & Dry-Run Sensors' },
        { label: 'Cable Type', value: 'Finolex / Havells 3-Core Submersible Flat Cable' },
        { label: 'Manufacturer Warranty', value: '1 to 2 Years Comprehensive Warranty' }
      ]
    },
    '4': {
      title: 'Borewell Cleaning & Desilting Services',
      shortTitle: 'Borewell Cleaning',
      image: 'assets/images/services/service-4.jpg',
      lead: 'Specialized chemical and mechanical desilting to restore original depth and clear clogged aquifer veins.',
      heading: 'Deep Borewell Desilting & Yield Restoration',
      description: 'Over years of pumping, borewells accumulate fine silt, sand deposits, and bio-film encrustation that block water fissures. Our specialized desilting and chemical restoration cleans bottom sediment, re-opens rock veins, and restores peak water capacity.',
      highlights: [
        'Deep bottom silt, mud, and sand evacuation',
        'Eco-friendly chemical descaling for rock fissures',
        'Restoration of original drilled bore depth',
        'Reopening of dormant subterranean recharge veins',
        'Noticeable water clarity and yield improvements',
        'Non-invasive process preserving casing integrity'
      ],
      specs: [
        { label: 'Cleaning Method', value: 'High-Pressure Air Jetting & Eco-Descaling' },
        { label: 'Supported Diameters', value: '4.5" to 8.5" Casing Sizes' },
        { label: 'Depth Capability', value: 'Up to 1,200 Feet Deep' },
        { label: 'Debris Cleared', value: 'Silt, Slurry, Sand, Rock Dust & Biofilm' },
        { label: 'Turnaround Time', value: '4 to 6 Hours on Site' },
        { label: 'Recommended Cycle', value: 'Every 3 to 4 Years for Maintained Wells' }
      ]
    },
    '5': {
      title: 'High-Pressure Air Compressor Flushing',
      shortTitle: 'Borewell Flushing',
      image: 'assets/images/services/service-5.jpg',
      lead: 'High-velocity 350 PSI air injection using 1200 CFM screw compressors to blast out mud slurry.',
      heading: 'Industrial Air Compressor Flushing & Rejuvenation',
      description: 'Using high-capacity 1200 CFM screw air compressors operating at 350 PSI, we inject high-velocity compressed air deep into the well column. This vigorous scouring lifts muddy slurry, loose rock granules, and debris up to the surface, unlocking sealed water veins.',
      highlights: [
        '1200 CFM high-velocity rotary screw compressors',
        '350 PSI operating pressure for deep scouring',
        'Rapid evacuation of dense mud slurry & debris',
        'Unclogs blocked aquifer fractures in solid rock',
        'Restores static water level recovery speed',
        'On-site discharge flow measurement verification'
      ],
      specs: [
        { label: 'Compressor Unit', value: '1200 CFM / 350 PSI Industrial Rig' },
        { label: 'Injection Stems', value: 'High-Tensile Steel Air Lance Assembly' },
        { label: 'Maximum Flushing Depth', value: 'Up to 1,500 Feet' },
        { label: 'Process Mechanism', value: 'Dual-Phase Continuous Air-Lift Evacuation' },
        { label: 'Yield Assessment', value: 'V-Notch Discharge Weir Testing Included' },
        { label: 'Execution Duration', value: '4 to 8 Hours Typical' }
      ]
    },
    '6': {
      title: 'Submersible Pump Repair & Rapid Maintenance',
      shortTitle: 'Pump Maintenance',
      image: 'assets/images/services/service-6.jpg',
      lead: 'Rapid 24/7 on-site troubleshooting for jammed pumps, motor winding burnouts, and control panel faults.',
      heading: 'Fast-Response Pump Diagnostics & Maintenance',
      description: 'When your pump fails or gets jammed deep inside the casing, rapid emergency response is crucial. Our mobile service rigs are equipped with heavy lifting cranes, electrical test equipment, replacement control panels, and specialized retrieval tools.',
      highlights: [
        '24/7 emergency breakdown dispatch support',
        'Mega-ohm winding insulation & capacitor diagnostics',
        'Heavy-winch retrieval for stuck or disconnected pumps',
        'Control panel contactor, starter & relay overhauls',
        'Submersible cable joint testing and waterproof sealing',
        'Genuine OEM spare parts with replacement warranty'
      ],
      specs: [
        { label: 'Response Window', value: 'Same-Day / Emergency 24-Hour Dispatch' },
        { label: 'Lifting Equipment', value: 'Hydraulic Winch Rig up to 1,200 Ft Capacity' },
        { label: 'Electrical Diagnostics', value: 'Digital Meggers, Phase Analyzers, Ammeters' },
        { label: 'Spares Available', value: 'Original Bushings, Mechanical Seals, Impellers' },
        { label: 'Supported Brands', value: 'CRI, Kirloskar, Texmo, Crompton, Grundfos' },
        { label: 'Service Scope', value: 'Residential, Agricultural & Industrial Wells' }
      ]
    }
  };

  // 8. Dynamic Service Details Loader (service-details.html)
  const detailImg = document.getElementById('serviceDetailImg');
  if (detailImg) {
    function loadServiceDetails() {
      const urlParams = new URLSearchParams(window.location.search);
      const serviceId = urlParams.get('service') || '1';

      const breadcrumbEl = document.getElementById('serviceDetailBreadcrumb');
      const titleEl = document.getElementById('serviceDetailTitle');
      const subtitleEl = document.getElementById('serviceDetailSubtitle');
      const subheadingEl = document.getElementById('serviceDetailSubheading');
      const descEl = document.getElementById('serviceDetailDesc');
      const highlightsTitleEl = document.getElementById('serviceDetailHighlightsTitle');
      const highlightsGridEl = document.getElementById('serviceDetailHighlightsGrid');
      const specsTitleEl = document.getElementById('serviceSpecsTitle');
      const specsTableBodyEl = document.getElementById('serviceSpecsTableBody');

      if (serviceId && serviceCatalog[serviceId]) {
        const s = serviceCatalog[serviceId];
        detailImg.src = s.image;
        detailImg.alt = s.title;

        if (breadcrumbEl) breadcrumbEl.textContent = s.shortTitle;
        if (titleEl) titleEl.textContent = s.title;
        if (subtitleEl) subtitleEl.textContent = s.lead;
        if (subheadingEl) subheadingEl.textContent = s.heading;
        if (descEl) descEl.textContent = s.description;

        if (highlightsTitleEl) {
          highlightsTitleEl.innerHTML = `<i class="bi bi-shield-check me-2"></i> ${s.shortTitle} - Key Service Benefits`;
        }
        if (highlightsGridEl && s.highlights) {
          highlightsGridEl.innerHTML = s.highlights.map(item => `
            <div class="col-sm-6">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-check2 text-primary fw-bold"></i>
                <span>${item}</span>
              </div>
            </div>
          `).join('');
        }

        if (specsTitleEl) specsTitleEl.textContent = `${s.shortTitle} Technical Specifications`;
        if (specsTableBodyEl && s.specs) {
          specsTableBodyEl.innerHTML = s.specs.map(sp => `
            <tr>
              <th class="w-35 bg-alt">${sp.label}</th>
              <td class="fw-semibold">${sp.value}</td>
            </tr>
          `).join('');
        }

        document.querySelectorAll('#sidebarServiceLinks a').forEach(a => {
          if (a.getAttribute('data-service-id') === serviceId) {
            a.classList.add('active', 'bg-white', 'fw-bold', 'text-primary');
            a.classList.remove('text-dark');
          } else {
            a.classList.remove('active', 'bg-white', 'fw-bold', 'text-primary');
            a.classList.add('text-dark');
          }
        });

        document.title = `${s.title} | BorewellPro Services`;
      }
    }

    window.loadServiceDetails = loadServiceDetails;
    loadServiceDetails();
    window.addEventListener('popstate', loadServiceDetails);
  }
});
