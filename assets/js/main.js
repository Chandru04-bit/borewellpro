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

  function setRTL(isRTL) {
    if (isRTL) {
      htmlEl.setAttribute('dir', 'rtl');
      htmlEl.setAttribute('lang', 'ar');
      localStorage.setItem(RTL_KEY, 'true');
    } else {
      htmlEl.setAttribute('dir', 'ltr');
      htmlEl.setAttribute('lang', 'en');
      localStorage.setItem(RTL_KEY, 'false');
    }
    updateRTLButtons(isRTL);
  }

  function updateRTLButtons(isRTL) {
    document.querySelectorAll('.rtl-toggle-btn').forEach((btn) => {
      btn.innerHTML = isRTL
        ? '<i class="bi bi-text-left"></i>'
        : '<i class="bi bi-text-right"></i>';
      btn.setAttribute('title', isRTL ? 'Switch to Left-to-Right (LTR)' : 'Switch to Right-to-Left (RTL)');
      btn.setAttribute('aria-label', isRTL ? 'Switch to Left-to-Right' : 'Switch to Right-to-Left');
    });
  }

  const savedRTL = localStorage.getItem(RTL_KEY) === 'true';
  if (savedRTL) {
    setRTL(true);
  }

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
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.15 });

    animatedElements.forEach((el) => revealObserver.observe(el));
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

    function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentIndex = index;

      const isRTL = htmlEl.getAttribute('dir') === 'rtl';
      const offsetMultiplier = isRTL ? 100 : -100;
      sliderTrack.style.transform = `translateX(${currentIndex * offsetMultiplier}%)`;

      indicators.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    }

    indicators.forEach((dot, i) => {
      dot.addEventListener('click', () => goToSlide(i));
    });

    // Auto rotate every 6 seconds
    let slideInterval = setInterval(() => goToSlide(currentIndex + 1), 6000);
    const sliderContainer = document.querySelector('.testimonial-slider-wrapper');
    if (sliderContainer) {
      sliderContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
      sliderContainer.addEventListener('mouseleave', () => {
        slideInterval = setInterval(() => goToSlide(currentIndex + 1), 6000);
      });
    }
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

  // 7. Project & Service Data Catalog
  const projectCatalog = {
    '1': {
      title: 'Coimbatore Suburb Residential Borewell',
      shortTitle: 'Coimbatore Suburb',
      category: 'Residential Borewell',
      depth: '480 Ft',
      yield: '2.5 Inch Continuous',
      image: 'assets/images/projects/project-1.jpg',
      lead: 'Engineered residential borewell drilled to 480 feet in Coimbatore suburbs delivering continuous 2.5-inch potable water.',
      heading: 'Coimbatore Suburb: Modern Residential Aquifer Discovery',
      description: 'At our Coimbatore suburban villa project, our hydrogeology survey identified fracture aquifers in crystalline granite at 460-480 feet. Deploying high-speed DTH percussion drilling and 80 feet of ISI-certified Class-A heavy PVC casing prevented loose topsoil ingress and unlocked continuous, crystal-clear potable water for domestic use and landscaped grounds.',
      specs: [
        { label: 'Project Location', value: 'Coimbatore Suburb (Vadavalli / Saravanampatti)' },
        { label: 'Total Drilled Depth', value: '480 Feet (146 Meters)' },
        { label: 'Discharge Yield Rate', value: '2.5 Inch Continuous Flow (~4,200 LPH)' },
        { label: 'Drilling Technology', value: '6.5" High-Pressure DTH Hammer Percussion' },
        { label: 'Casing Pipe Installed', value: 'Heavy ISI Class-A PVC Casing (80 Ft)' },
        { label: 'Pumping Equipment', value: '3.0 HP Stainless Steel Submersible Motor' },
        { label: 'Geological Formation', value: 'Hard Crystalline Charnockite Granite' },
        { label: 'Water Quality Result', value: 'Certified Potable (TDS: 320 ppm, pH: 7.2)' }
      ],
      highlights: [
        'Precise geophysical resistivity vein mapping',
        'Certified Class-A heavy PVC protective casing',
        'Tungsten carbide DTH hard-rock percussion',
        'Potable drinking water certified by lab analysis',
        'Installed 3.0 HP energy-efficient submersible motor',
        'Official lithology log & 5-year workmanship warranty'
      ]
    },
    '2': {
      title: 'Pollachi Coconut Estate Agricultural Borewell',
      shortTitle: 'Pollachi Coconut Estate',
      category: 'Agricultural Farm',
      depth: '850 Ft',
      yield: '7.5 HP Solar Pump',
      image: 'assets/images/projects/project-2.jpg',
      lead: 'Deep agricultural irrigation borewell drilled to 850 feet in Pollachi with 7.5 HP solar pump delivering heavy year-round irrigation.',
      heading: 'Pollachi Coconut Estate: High-Yield Solar Irrigation Well',
      description: 'In the fertile coconut farming belt of Pollachi, sustainable water security is essential. Our team performed comprehensive electrical resistivity profiling, discovering deep fractured aquifer zones at 820-850 feet. Equipped with heavy welded MS casing and a 7.5 HP solar-powered brushless submersible pump, this agricultural well delivers round-the-clock water to 25 acres of coconut and spice groves.',
      specs: [
        { label: 'Project Location', value: 'Pollachi Coconut Estate, Tamil Nadu' },
        { label: 'Total Drilled Depth', value: '850 Feet (259 Meters)' },
        { label: 'Discharge Yield Rate', value: '3.5 Inch Heavy Volume Flow (~8,500 LPH)' },
        { label: 'Drilling Technology', value: '6.5" Super-Drill DTH Air Percussion' },
        { label: 'Casing Pipe Installed', value: 'Heavy Duty Welded Mild Steel (MS) Casing (110 Ft)' },
        { label: 'Pumping Equipment', value: '7.5 HP Solar Submersible Pump System' },
        { label: 'Geological Formation', value: 'Gneissic Bedrock with Quartz Veins' },
        { label: 'Irrigation Coverage', value: '25+ Acres Drip & Basin Irrigation' }
      ],
      highlights: [
        'Deep fractured aquifer discovery at 850 feet',
        'Seamless integration with 7.5 HP solar arrays',
        'Zero-grid-reliance agricultural irrigation',
        'Welded heavy MS casing protects alluvial layers',
        'Dual-point high-velocity air compressor flushing',
        'Continuous 8,500+ LPH sustained discharge'
      ]
    },
    '3': {
      title: 'Tiruppur Textile Park Industrial Groundwater Solution',
      shortTitle: 'Tiruppur Textile Park',
      category: 'Industrial Facility',
      depth: '1,100 Ft',
      yield: 'Multi-Stage Dual Pump',
      image: 'assets/images/projects/project-3.jpg',
      lead: 'Heavy-duty industrial water solution drilled to 1,100 feet in Tiruppur Textile Park with multi-stage dual pump continuous setup.',
      heading: 'Tiruppur Textile Park: 24/7 Industrial Water Engineering',
      description: 'Industrial dyeing and garment facilities require uninterrupted high-volume water supply. BorewellPro drilled an 8.5-inch diameter ultra-deep borewell to 1,100 feet at Tiruppur Textile Park. Featuring full heavy-gauge industrial casing and a multi-stage dual-pump configuration, this installation guarantees uninterrupted 24/7 water flow for manufacturing operations while complying with all state groundwater norms.',
      specs: [
        { label: 'Project Location', value: 'Tiruppur Textile Park, Tamil Nadu' },
        { label: 'Total Drilled Depth', value: '1,100 Feet (335 Meters)' },
        { label: 'Discharge Yield Rate', value: 'Continuous High-Flow Industrial Discharge' },
        { label: 'Drilling Technology', value: '8.5" / 6.5" Telescopic Rotary & DTH Combo' },
        { label: 'Casing Pipe Installed', value: '8" Heavy Mild Steel Seamless Casing (150 Ft)' },
        { label: 'Pumping Equipment', value: '15 HP Multi-Stage Dual Pump Setup' },
        { label: 'Geological Formation', value: 'Dense Fissured Granitic Basement' },
        { label: 'Telemetry / Controls', value: 'IoT Digital Flow Meter & Pressure Telemetry' }
      ],
      highlights: [
        'Ultra-deep 1,100 Ft exploration into hard crystalline rock',
        '8.5-inch large diameter industrial borewell profile',
        'Automated dual multi-stage high-pressure pump setup',
        'Heavy seamless MS industrial casing insertion',
        '24/7 continuous industrial processing supply',
        'Full statutory groundwater clearance documentation'
      ]
    },
    '4': {
      title: 'Erode Commercial Center High-Capacity Borewell',
      shortTitle: 'Erode Commercial Center',
      category: 'Commercial Complex',
      depth: '620 Ft',
      yield: 'Automated Pressure Sensor',
      image: 'assets/images/projects/project-4.jpg',
      lead: 'Automated high-capacity borewell drilled to 620 feet for multi-tenant commercial center with automated sensor controls.',
      heading: 'Erode Commercial Center: Automated Multi-Storey Water Setup',
      description: 'For this bustling multi-storey shopping and office complex in Erode, our hydrogeologists mapped multiple high-permeability fissures at 590 to 620 feet. The site was engineered with computerized digital pressure transducers, automated dry-run protectors, and heavy ISI casing, ensuring zero downtime for hundreds of daily commercial tenants and visitors.',
      specs: [
        { label: 'Project Location', value: 'Erode Commercial Center, Tamil Nadu' },
        { label: 'Total Drilled Depth', value: '620 Feet (189 Meters)' },
        { label: 'Discharge Yield Rate', value: '3.0 Inch Stable Output (~6,000 LPH)' },
        { label: 'Drilling Technology', value: '6.5" High-Velocity DTH Percussion' },
        { label: 'Casing Pipe Installed', value: 'Heavy Class-A PVC Casing with Sanitary Seal (90 Ft)' },
        { label: 'Pumping Equipment', value: '5.0 HP Submersible Pump with Smart VFD Panel' },
        { label: 'Geological Formation', value: 'Weathered Gneiss transitioning to Solid Granite' },
        { label: 'Automation System', value: 'Smart Pressure Transducer & Auto-Level Cutoff' }
      ],
      highlights: [
        'Engineered for multi-tenant commercial occupancy',
        'Variable Frequency Drive (VFD) pressure regulation',
        'Integrated automated dry-run sensory protection',
        'Sanitary cement grout annular well seal',
        'Dual overhead delivery line integration',
        'Comprehensive 16-parameter water safety certification'
      ]
    }
  };

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

  // 8. Project Cards Direct Page Navigation
  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('click', function (e) {
      // If clicked element or ancestor is an <a> or <button>, allow default native link behavior
      if (e.target.closest('a') || e.target.closest('button')) {
        return;
      }
      const targetLink = this.getAttribute('data-link') ||
                         (this.querySelector('a.project-link-label') ? this.querySelector('a.project-link-label').getAttribute('href') : '') ||
                         (this.querySelector('a') ? this.querySelector('a').getAttribute('href') : '');
      if (targetLink) {
        window.location.href = targetLink;
      }
    });
  });


  // 9. Dynamic Project & Service Details Loader (service-details.html)
  const detailImg = document.getElementById('serviceDetailImg');
  if (detailImg) {
    function loadServiceDetails() {
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('project');
      const serviceId = urlParams.get('service') || (projectId ? null : '1');

      const breadcrumbEl = document.getElementById('serviceDetailBreadcrumb');
      const titleEl = document.getElementById('serviceDetailTitle');
      const subtitleEl = document.getElementById('serviceDetailSubtitle');
      const subheadingEl = document.getElementById('serviceDetailSubheading');
      const descEl = document.getElementById('serviceDetailDesc');
      const highlightsTitleEl = document.getElementById('serviceDetailHighlightsTitle');
      const highlightsGridEl = document.getElementById('serviceDetailHighlightsGrid');
      const specsTitleEl = document.getElementById('serviceSpecsTitle');
      const specsTableBodyEl = document.getElementById('serviceSpecsTableBody');

      if (projectId && projectCatalog[projectId]) {
        const p = projectCatalog[projectId];
        detailImg.src = p.image;
        detailImg.alt = p.title;

        if (breadcrumbEl) breadcrumbEl.textContent = p.shortTitle;
        if (titleEl) titleEl.textContent = p.title;
        if (subtitleEl) subtitleEl.textContent = p.lead;
        if (subheadingEl) subheadingEl.textContent = p.heading;
        if (descEl) descEl.textContent = p.description;

        if (highlightsTitleEl) {
          highlightsTitleEl.innerHTML = `<i class="bi bi-patch-check-fill me-2"></i> ${p.category} - Project Highlights`;
        }
        if (highlightsGridEl && p.highlights) {
          highlightsGridEl.innerHTML = p.highlights.map(item => `
            <div class="col-sm-6">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-check2-circle text-primary fw-bold"></i>
                <span>${item}</span>
              </div>
            </div>
          `).join('');
        }

        if (specsTitleEl) specsTitleEl.textContent = 'Project Engineering Specifications';
        if (specsTableBodyEl && p.specs) {
          specsTableBodyEl.innerHTML = p.specs.map(s => `
            <tr>
              <th class="w-35 bg-alt">${s.label}</th>
              <td class="fw-semibold">${s.value}</td>
            </tr>
          `).join('');
        }

        document.querySelectorAll('#sidebarProjectLinks a').forEach(a => {
          if (a.getAttribute('data-project-id') === projectId) {
            a.classList.add('active', 'bg-white', 'fw-bold', 'text-primary');
            a.classList.remove('text-dark');
          } else {
            a.classList.remove('active', 'bg-white', 'fw-bold', 'text-primary');
            a.classList.add('text-dark');
          }
        });
        document.querySelectorAll('#sidebarServiceLinks a').forEach(a => {
          a.classList.remove('active', 'bg-white', 'fw-bold', 'text-primary');
          a.classList.add('text-dark');
        });

        document.title = `${p.title} | BorewellPro Engineering`;
      } else if (serviceId && serviceCatalog[serviceId]) {
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

  // ================= 10. Global Authentication & Navbar Controller =================
  const CURRENT_USER_KEY = 'borewellpro_current_user';

  function getAuthPathPrefix() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/projects/') && path.endsWith('/index.html') && path.split('/projects/')[1].includes('/')) {
      return '../../';
    }
    if (path.includes('/projects/')) {
      return '../';
    }
    return '';
  }

  function getLoggedInUser() {
    try {
      const userStr = localStorage.getItem(CURRENT_USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error parsing session user:', e);
      return null;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function syncAuthNavbar() {
    const user = getLoggedInUser();
    const prefix = getAuthPathPrefix();

    // 1. Desktop Header Action
    const desktopHeader = document.querySelector('.site-header');
    if (desktopHeader) {
      let authSlot = desktopHeader.querySelector('.user-dropdown');
      let signInBtn = desktopHeader.querySelector('a[href*="login.html"]');

      if (user && user.name) {
        // User IS logged in -> Show user dropdown with Name
        const dropdownHtml = `
          <div class="dropdown user-dropdown d-none d-sm-inline-block">
            <button class="btn btn-water dropdown-toggle d-flex align-items-center gap-2" type="button" id="userMenuDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-person-circle fs-5"></i>
              <span class="user-display-name fw-semibold">${escapeHtml(user.name)}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow border" aria-labelledby="userMenuDropdown">
              <li class="px-3 py-2 border-bottom">
                <div class="fw-bold text-dark text-truncate">${escapeHtml(user.name)}</div>
                <div class="small text-muted text-truncate">${escapeHtml(user.email || '')}</div>
              </li>
              <li><hr class="dropdown-divider my-1"></li>
              <li>
                <a class="dropdown-item text-danger d-flex align-items-center gap-2 py-2 btn-logout-action" href="#">
                  <i class="bi bi-box-arrow-right"></i> Logout
                </a>
              </li>
            </ul>
          </div>
        `;

        if (authSlot) {
          authSlot.outerHTML = dropdownHtml;
        } else if (signInBtn) {
          signInBtn.outerHTML = dropdownHtml;
        }
      } else {
        // User is NOT logged in -> Show Sign In button
        const signInHtml = `
          <a href="${prefix}login.html" class="btn btn-water d-none d-sm-inline-flex">
            <i class="bi bi-box-arrow-in-right"></i>
            <span>Sign In</span>
          </a>
        `;

        if (authSlot) {
          authSlot.outerHTML = signInHtml;
        }
      }
    }

    // 2. Mobile Drawer Action (#mobileNavDrawer)
    const mobileDrawer = document.getElementById('mobileNavDrawer');
    if (mobileDrawer) {
      let mobileAuthSlot = mobileDrawer.querySelector('.mobile-user-slot');
      let mobileSignInBtn = mobileDrawer.querySelector('a[href*="login.html"]');

      if (user && user.name) {
        // User IS logged in -> Show user box and Logout
        const mobileUserHtml = `
          <div class="mobile-user-slot mb-3 p-3 bg-alt border rounded-3">
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-person-circle fs-3 text-primary"></i>
              <div class="overflow-hidden">
                <div class="fw-bold text-truncate">${escapeHtml(user.name)}</div>
                <div class="small text-muted text-truncate">${escapeHtml(user.email || '')}</div>
              </div>
            </div>
            <button type="button" class="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 btn-logout-action">
              <i class="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        `;

        if (mobileAuthSlot) {
          mobileAuthSlot.outerHTML = mobileUserHtml;
        } else if (mobileSignInBtn) {
          mobileSignInBtn.outerHTML = mobileUserHtml;
        }
      } else {
        // User is NOT logged in -> Show Sign In button
        const mobileSignInHtml = `
          <a href="${prefix}login.html" class="btn btn-water w-100 mb-3">
            <i class="bi bi-box-arrow-in-right me-1"></i> Sign In
          </a>
        `;

        if (mobileAuthSlot) {
          mobileAuthSlot.outerHTML = mobileSignInHtml;
        }
      }
    }
  }

  // Handle Logout clicks across desktop & mobile
  document.addEventListener('click', (e) => {
    const logoutBtn = e.target.closest('.btn-logout-action');
    if (logoutBtn) {
      e.preventDefault();
      localStorage.removeItem(CURRENT_USER_KEY);
      syncAuthNavbar();
      const prefix = getAuthPathPrefix();
      window.location.href = `${prefix}index.html`;
    }
  });

  // Run on page load
  syncAuthNavbar();
});
