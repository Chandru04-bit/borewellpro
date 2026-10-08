/**
 * BorewellPro - Comprehensive Form Validation & Modal Submission Handler
 * Handles Field Appointment booking, Contact inquiries, Quick quote modals,
 * and Newsletter subscriptions with real-time feedback and past date prevention.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Helper: show input error
  function setError(input, message) {
    if (!input) return;
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    let feedback = null;
    
    // Check next sibling or parent element for feedback container
    if (input.parentElement) {
      feedback = input.parentElement.querySelector('.invalid-feedback');
      if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        input.parentElement.appendChild(feedback);
      }
      feedback.textContent = message;
      feedback.style.display = 'block';
    }
  }

  // Helper: set input valid
  function setValid(input) {
    if (!input) return;
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    if (input.parentElement) {
      const feedback = input.parentElement.querySelector('.invalid-feedback');
      if (feedback) {
        feedback.textContent = '';
        feedback.style.display = '';
      }
    }
  }

  // Helper: clear validation state
  function clearValidation(input) {
    if (!input) return;
    input.classList.remove('is-invalid', 'is-valid');
    if (input.parentElement) {
      const feedback = input.parentElement.querySelector('.invalid-feedback');
      if (feedback) {
        feedback.textContent = '';
        feedback.style.display = '';
      }
    }
  }

  // 1. Strict Name Validation (Letters, single spaces, hyphens, periods, and apostrophes only, min 2 chars, max 60 chars)
  function validateNameField(input, isRequired = true) {
    if (!input) return true;
    const rawVal = input.value;
    const trimmedVal = rawVal.trim().replace(/\s+/g, ' ');

    if (!trimmedVal) {
      if (isRequired) {
        setError(input, 'Please enter your full name (minimum 2 characters).');
        return false;
      }
      setValid(input);
      return true;
    }

    if (trimmedVal.length < 2) {
      setError(input, 'Please enter your full name (minimum 2 characters).');
      return false;
    }

    if (trimmedVal.length > 60) {
      setError(input, 'Name cannot exceed 60 characters.');
      return false;
    }

    // Must strictly reject numbers and forbidden symbols
    if (/[0-9!@#$%^&*()_+={}\[\]:;"<>?,/\\|`~]/.test(trimmedVal) || !/^[A-Za-z][A-Za-z\s'.-]*[A-Za-z.]$/.test(trimmedVal)) {
      setError(input, 'Please enter a valid name using letters and spaces only. Numbers and special characters are not allowed.');
      return false;
    }

    setValid(input);
    return true;
  }

  // Attach Name Input Filter (prevent numbers and invalid symbols during typing & pasting)
  function attachNameInputRestrictions() {
    const nameSelector = 'input[name="fullName"], input[name="name"], input[placeholder*="Name"], input[placeholder*="Owner"], input[placeholder*="Developer"], #regFullName';
    document.querySelectorAll(nameSelector).forEach((input) => {
      if (input.dataset.nameFilterBound) return;
      input.dataset.nameFilterBound = 'true';

      // 1. Prevent invalid key typing (numbers, special symbols)
      input.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) {
          return;
        }
        if (!/^[a-zA-Z\s'.-]$/.test(e.key)) {
          e.preventDefault();
        }
      });

      // 2. Filter invalid characters during paste
      input.addEventListener('paste', function (e) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text') || '';
        const cleaned = text.replace(/[^a-zA-Z\s'.-]/g, '');
        const start = this.selectionStart !== null ? this.selectionStart : this.value.length;
        const end = this.selectionEnd !== null ? this.selectionEnd : this.value.length;
        const currentVal = this.value;
        this.value = currentVal.substring(0, start) + cleaned + currentVal.substring(end);
        const newPos = start + cleaned.length;
        if (this.setSelectionRange) {
          this.setSelectionRange(newPos, newPos);
        }
        this.dispatchEvent(new Event('input', { bubbles: true }));
      });

      // 3. Sanitize on input (handles drag-and-drop, autofill, IME composition)
      input.addEventListener('input', function () {
        const cleaned = this.value.replace(/[^a-zA-Z\s'.-]/g, '');
        if (this.value !== cleaned) {
          const start = this.selectionStart;
          this.value = cleaned;
          if (start !== null && this.setSelectionRange) {
            const newPos = Math.min(start, cleaned.length);
            this.setSelectionRange(newPos, newPos);
          }
        }
        if (this.classList.contains('is-invalid') || this.value.trim().length >= 2) {
          validateNameField(this, this.hasAttribute('required'));
        }
      });

      input.addEventListener('blur', function () {
        if (this.value.trim() || this.hasAttribute('required')) {
          validateNameField(this, this.hasAttribute('required'));
        }
      });
    });
  }

  // 2. Strict Email Validation
  // Requires valid format: username@domain.tld (minimum 2 char TLD, no consecutive dots, proper host)
  const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9]+([._%+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;

  function validateEmailField(input, isRequired = false, customMsg) {
    if (!input) return true;
    const val = input.value.trim();

    if (!val) {
      if (isRequired) {
        setError(input, customMsg || 'Please enter your email address.');
        return false;
      }
      clearValidation(input);
      return true;
    }

    if (!STRICT_EMAIL_REGEX.test(val) || val.includes('..') || val.startsWith('.') || val.endsWith('.')) {
      setError(input, customMsg || 'Please enter a valid email address (e.g. name@example.com).');
      return false;
    }

    setValid(input);
    return true;
  }

  function attachEmailValidation() {
    const emailSelector = 'input[type="email"], input[name="email"], #loginEmail, #regEmail';
    document.querySelectorAll(emailSelector).forEach((input) => {
      if (input.dataset.emailValBound) return;
      input.dataset.emailValBound = 'true';

      input.addEventListener('blur', function () {
        if (this.value.trim() || this.hasAttribute('required')) {
          validateEmailField(this, this.hasAttribute('required'));
        }
      });

      input.addEventListener('input', function () {
        if (this.classList.contains('is-invalid')) {
          validateEmailField(this, this.hasAttribute('required'));
        }
      });
    });
  }

  // 3. Strict Date Validation (Prevent Past Dates, allow today or future dates)
  function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function validateDateField(input, isRequired = true) {
    if (!input) return true;
    const val = input.value.trim();

    if (!val) {
      if (isRequired) {
        setError(input, 'Please select a preferred date for site inspection.');
        return false;
      }
      clearValidation(input);
      return true;
    }

    // Validate standard YYYY-MM-DD pattern
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(val)) {
      setError(input, 'Please enter a valid date in YYYY-MM-DD format.');
      return false;
    }

    const parts = val.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const inputDate = new Date(year, month, day);
    if (isNaN(inputDate.getTime()) || inputDate.getFullYear() !== year || inputDate.getMonth() !== month || inputDate.getDate() !== day) {
      setError(input, 'Please enter a valid calendar date.');
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      setError(input, 'Please select today or a future date. Past dates are not allowed.');
      return false;
    }

    setValid(input);
    return true;
  }

  function attachDateValidation() {
    const todayStr = getTodayDateString();
    const dateSelector = 'input[type="date"], input[name="preferredDate"]';

    document.querySelectorAll(dateSelector).forEach((input) => {
      // Set min attribute to today to prevent selection of past dates in native picker
      input.setAttribute('min', todayStr);

      if (input.dataset.dateValBound) return;
      input.dataset.dateValBound = 'true';

      input.addEventListener('change', function () {
        validateDateField(this, this.hasAttribute('required'));
      });

      input.addEventListener('input', function () {
        validateDateField(this, this.hasAttribute('required'));
      });

      input.addEventListener('blur', function () {
        validateDateField(this, this.hasAttribute('required'));
      });
    });
  }

  // 4. Strict Phone Validation (10 digits minimum, allow country prefix)
  function validatePhoneField(input, isRequired = true) {
    if (!input) return true;
    const rawVal = input.value.trim();
    const cleanVal = rawVal.replace(/[\s\-()]/g, '');

    if (!cleanVal) {
      if (isRequired) {
        setError(input, 'Please enter your 10-digit mobile number.');
        return false;
      }
      clearValidation(input);
      return true;
    }

    // Check for 10-14 digits, optional leading +
    const phoneRegex = /^(\+?[0-9]{1,4})?[0-9]{10}$/;
    if (!phoneRegex.test(cleanVal) || cleanVal.replace(/\+/g, '').length < 10) {
      setError(input, 'Please enter a valid 10-digit mobile number.');
      return false;
    }

    setValid(input);
    return true;
  }

  function attachPhoneValidation() {
    const phoneSelector = 'input[type="tel"], input[name="phone"]';
    document.querySelectorAll(phoneSelector).forEach((input) => {
      if (input.dataset.phoneValBound) return;
      input.dataset.phoneValBound = 'true';

      // Restrict typing to digits, +, -, space
      input.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) return;
        if (!/^[0-9+\s-]$/.test(e.key)) {
          e.preventDefault();
        }
      });

      input.addEventListener('blur', function () {
        if (this.value.trim() || this.hasAttribute('required')) {
          validatePhoneField(this, this.hasAttribute('required'));
        }
      });

      input.addEventListener('input', function () {
        if (this.classList.contains('is-invalid')) {
          validatePhoneField(this, this.hasAttribute('required'));
        }
      });
    });
  }

  // 5. Select & Text Input Validation
  function validateRequiredSelect(select, message) {
    if (!select) return true;
    if (!select.value || select.value.trim() === '') {
      setError(select, message || 'Please select an option.');
      return false;
    }
    setValid(select);
    return true;
  }

  function validateRequiredText(input, minLen = 2, message) {
    if (!input) return true;
    const val = input.value.trim();
    if (!val || val.length < minLen) {
      setError(input, message || `Please fill in this field (minimum ${minLen} characters).`);
      return false;
    }
    setValid(input);
    return true;
  }

  // Initialize input filters on page load
  attachNameInputRestrictions();
  attachEmailValidation();
  attachDateValidation();
  attachPhoneValidation();

  document.addEventListener('show.bs.modal', () => {
    attachNameInputRestrictions();
    attachEmailValidation();
    attachDateValidation();
    attachPhoneValidation();
  });

  // Password Show / Hide Toggle
  document.querySelectorAll('.btn-toggle-password').forEach((btn) => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const icon = this.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        if (icon) {
          icon.classList.remove('bi-eye');
          icon.classList.add('bi-eye-slash');
        }
      } else {
        input.type = 'password';
        if (icon) {
          icon.classList.remove('bi-eye-slash');
          icon.classList.add('bi-eye');
        }
      }
    });
  });

  // Helper: Ensure Success Modal is mounted in the document
  function ensureBookingSuccessModal() {
    let modalEl = document.getElementById('bookingSuccessModal');
    if (!modalEl) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <div class="modal fade" id="bookingSuccessModal" tabindex="-1" aria-labelledby="bookingSuccessModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg text-center p-4">
              <div class="modal-body p-2">
                <div class="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success" style="width: 70px; height: 70px;">
                  <i class="bi bi-check-circle-fill fs-1 text-success"></i>
                </div>
                <h3 class="modal-title fw-bold text-success mb-2" id="bookingSuccessModalLabel">Request Submitted Successfully!</h3>
                <p class="text-muted mb-3">
                  Thank you for choosing <strong>BorewellPro</strong>. Our senior hydrogeology and drilling engineer will review your site coordinates and contact you within <strong>2 hours</strong> to confirm your site inspection schedule.
                </p>
                <div class="p-3 bg-alt rounded-3 mb-4 text-start">
                  <div class="d-flex justify-content-between mb-1 small">
                    <span class="text-muted">Booking Reference:</span>
                    <span class="fw-bold text-primary" id="bookingRefCode">BP-849201</span>
                  </div>
                  <div class="d-flex justify-content-between small">
                    <span class="text-muted">Emergency Dispatch:</span>
                    <span class="text-success fw-semibold">Active (Available 24/7)</span>
                  </div>
                </div>
                <div class="d-flex gap-2 justify-content-center">
                  <a href="tel:+919876543210" class="btn btn-outline-water">
                    <i class="bi bi-telephone-fill me-1"></i> Call Support
                  </a>
                  <button type="button" class="btn btn-water" data-bs-dismiss="modal">
                    <i class="bi bi-check2"></i> Close Window
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(wrapper.firstElementChild);
      modalEl = document.getElementById('bookingSuccessModal');
    }
    return modalEl;
  }

  // ================= 1. Field Appointment & Site Visit Booking Forms =================
  const bookingForms = document.querySelectorAll('#siteVisitBookingForm, #contactInquiryForm, .booking-form-validate');
  bookingForms.forEach((form) => {
    // Attach real-time select & input listeners
    form.querySelectorAll('select[required]').forEach((select) => {
      select.addEventListener('change', function () {
        if (this.name === 'propertyType') {
          validateRequiredSelect(this, 'Please select your property type.');
        } else if (this.name === 'serviceRequired') {
          validateRequiredSelect(this, 'Please select a required service.');
        } else {
          validateRequiredSelect(this, 'Please make a selection.');
        }
      });
    });

    form.querySelectorAll('input[name="location"]').forEach((loc) => {
      loc.addEventListener('blur', function () {
        validateRequiredText(this, 2, 'Please enter your site location/city.');
      });
      loc.addEventListener('input', function () {
        if (this.classList.contains('is-invalid')) {
          validateRequiredText(this, 2, 'Please enter your site location/city.');
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let isValid = true;
      let firstInvalidElement = null;

      const nameInput = form.querySelector('[name="fullName"], [name="name"]');
      const phoneInput = form.querySelector('[name="phone"]');
      const emailInput = form.querySelector('[name="email"]');
      const propertyInput = form.querySelector('[name="propertyType"]');
      const locationInput = form.querySelector('[name="location"]');
      const serviceInput = form.querySelector('[name="serviceRequired"]');
      const dateInput = form.querySelector('[name="preferredDate"], input[type="date"]');

      // 1. Full Name Validation
      if (nameInput) {
        if (!validateNameField(nameInput, nameInput.hasAttribute('required') || true)) {
          isValid = false;
          if (!firstInvalidElement) firstInvalidElement = nameInput;
        }
      }

      // 2. Phone Number Validation
      if (phoneInput) {
        if (!validatePhoneField(phoneInput, phoneInput.hasAttribute('required') || true)) {
          isValid = false;
          if (!firstInvalidElement) firstInvalidElement = phoneInput;
        }
      }

      // 3. Email Validation
      if (emailInput) {
        const isEmailRequired = emailInput.hasAttribute('required');
        if (emailInput.value.trim() || isEmailRequired) {
          if (!validateEmailField(emailInput, isEmailRequired, 'Please enter a valid email address (e.g. name@example.com).')) {
            isValid = false;
            if (!firstInvalidElement) firstInvalidElement = emailInput;
          }
        }
      }

      // 4. Property Type Validation
      if (propertyInput && propertyInput.hasAttribute('required')) {
        if (!validateRequiredSelect(propertyInput, 'Please select your property type.')) {
          isValid = false;
          if (!firstInvalidElement) firstInvalidElement = propertyInput;
        }
      }

      // 5. Location / City Validation
      if (locationInput && (locationInput.hasAttribute('required') || locationInput.value.trim())) {
        if (!validateRequiredText(locationInput, 2, 'Please enter your site location / area.')) {
          isValid = false;
          if (!firstInvalidElement) firstInvalidElement = locationInput;
        }
      }

      // 6. Service Required Validation
      if (serviceInput && serviceInput.hasAttribute('required')) {
        if (!validateRequiredSelect(serviceInput, 'Please select a required service.')) {
          isValid = false;
          if (!firstInvalidElement) firstInvalidElement = serviceInput;
        }
      }

      // 7. Preferred Date Validation (Prevent past dates)
      if (dateInput) {
        if (!validateDateField(dateInput, dateInput.hasAttribute('required') || true)) {
          isValid = false;
          if (!firstInvalidElement) firstInvalidElement = dateInput;
        }
      }

      if (!isValid) {
        // Focus and scroll to first invalid field smoothly
        if (firstInvalidElement) {
          firstInvalidElement.focus();
          firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // All fields valid -> Show success modal
      const successModalEl = ensureBookingSuccessModal();
      if (successModalEl && typeof bootstrap !== 'undefined') {
        const bookingModal = bootstrap.Modal.getInstance(successModalEl) || new bootstrap.Modal(successModalEl);
        const refEl = document.getElementById('bookingRefCode');
        if (refEl) {
          refEl.textContent = 'BP-' + Math.floor(100000 + Math.random() * 900000);
        }
        bookingModal.show();
      } else {
        alert('✓ Site Inspection Request Submitted Successfully!\nThank you. Our engineering team will contact you shortly.');
      }

      form.reset();
      form.querySelectorAll('.is-valid, .is-invalid').forEach((el) => el.classList.remove('is-valid', 'is-invalid'));
    });
  });

  // ================= 2. Newsletter Subscription Form =================
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach((form) => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input || !validateEmailField(input, true, 'Please enter a valid email address.')) {
        if (input) input.focus();
        return;
      }
      alert('✓ Thank you for subscribing to BorewellPro Groundwater Insights!');
      form.reset();
      input.classList.remove('is-valid', 'is-invalid');
    });
  });

  // ================= 3. Blog Comment Form Validation =================
  const blogCommentForm = document.getElementById('blogCommentForm');
  if (blogCommentForm) {
    blogCommentForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const nameInput = this.querySelector('[name="fullName"], input[type="text"]');
      const emailInput = this.querySelector('input[type="email"]');
      const commentInput = this.querySelector('textarea');
      let isValid = true;
      let firstInvalid = null;

      if (nameInput && !validateNameField(nameInput, true)) {
        isValid = false;
        if (!firstInvalid) firstInvalid = nameInput;
      }

      if (emailInput && !validateEmailField(emailInput, true, 'Please enter a valid email address.')) {
        isValid = false;
        if (!firstInvalid) firstInvalid = emailInput;
      }

      if (commentInput && (!commentInput.value.trim() || commentInput.value.trim().length < 5)) {
        setError(commentInput, 'Please enter a comment (minimum 5 characters).');
        isValid = false;
        if (!firstInvalid) firstInvalid = commentInput;
      } else if (commentInput) {
        setValid(commentInput);
      }

      if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      alert('✓ Comment submitted for moderation! Thank you for your feedback.');
      this.reset();
      this.querySelectorAll('.is-valid, .is-invalid').forEach((el) => el.classList.remove('is-valid', 'is-invalid'));
    });
  }
});

