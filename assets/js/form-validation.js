/**
 * BorewellPro - Form Validation & Modal Submission Handler
 * Handles Site Visit booking, contact inquiry, login, registration, and newsletter forms
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Helper: show input error
  function setError(input, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    let feedback = input.parentElement.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      input.parentElement.appendChild(feedback);
    }
    feedback.textContent = message;
  }

  // Helper: set input valid
  function setValid(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    const feedback = input.parentElement.querySelector('.invalid-feedback');
    if (feedback) feedback.textContent = '';
  }

  // Helper: Name Validation (Letters, single spaces, hyphens, and apostrophes only, min 2 chars)
  const NAME_REGEX = /^[A-Za-z]+(?:[' -][A-Za-z]+)*$/;

  function validateNameField(input) {
    if (!input) return true;
    const rawVal = input.value;
    const trimmedVal = rawVal.trim().replace(/\s+/g, ' ');

    if (!trimmedVal || trimmedVal.length < 2) {
      setError(input, 'Please enter your full name (minimum 2 characters).');
      return false;
    }

    if (!NAME_REGEX.test(trimmedVal)) {
      setError(input, 'Please enter a valid name using letters, spaces, hyphens, or apostrophes only.');
      return false;
    }

    setValid(input);
    return true;
  }

  // Helper: Email Validation (Complete address validation with lowercase domain required)
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

  function validateEmailField(input, isRequired = false, customErrorMsg = 'Please enter a valid email address.') {
    if (!input) return true;
    const val = input.value.trim();

    if (!val) {
      if (isRequired) {
        setError(input, customErrorMsg);
        return false;
      }
      return true;
    }

    if (!EMAIL_REGEX.test(val)) {
      setError(input, customErrorMsg);
      return false;
    }

    setValid(input);
    return true;
  }

  // Attach Name Input Filter (prevent numbers and invalid characters during typing & pasting)
  function attachNameInputRestrictions() {
    const nameSelector = 'input[name="fullName"], #regFullName, input[name="name"], input[placeholder*="Name"], input[placeholder*="Owner"], input[placeholder*="Developer"]';
    document.querySelectorAll(nameSelector).forEach((input) => {
      if (input.dataset.nameFilterBound) return;
      input.dataset.nameFilterBound = 'true';

      // 1. Prevent invalid key typing (numbers, special symbols)
      input.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) {
          return;
        }
        if (!/^[a-zA-Z\s'-]$/.test(e.key)) {
          e.preventDefault();
        }
      });

      // 2. Filter invalid characters during paste
      input.addEventListener('paste', function (e) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text') || '';
        const cleaned = text.replace(/[^a-zA-Z\s'-]/g, '');
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
        const cleaned = this.value.replace(/[^a-zA-Z\s'-]/g, '');
        if (this.value !== cleaned) {
          const start = this.selectionStart;
          this.value = cleaned;
          if (start !== null && this.setSelectionRange) {
            const newPos = Math.min(start, cleaned.length);
            this.setSelectionRange(newPos, newPos);
          }
        }
      });
    });
  }

  // Attach Email Input Validation on blur/change
  function attachEmailInputValidation() {
    const emailSelector = 'input[type="email"], input[name="email"], #loginEmail, #regEmail';
    document.querySelectorAll(emailSelector).forEach((input) => {
      if (input.dataset.emailValBound) return;
      input.dataset.emailValBound = 'true';

      input.addEventListener('blur', function () {
        if (this.value.trim()) {
          validateEmailField(this, this.hasAttribute('required'));
        }
      });
    });
  }

  attachNameInputRestrictions();
  attachEmailInputValidation();
  document.addEventListener('show.bs.modal', () => {
    attachNameInputRestrictions();
    attachEmailInputValidation();
  });

  // Clear validation state on input
  document.querySelectorAll('input, select, textarea').forEach((el) => {
    el.addEventListener('input', () => {
      if (el.classList.contains('is-invalid')) {
        el.classList.remove('is-invalid');
      }
    });
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

  // 1. Site Visit & Contact Booking Form
  const bookingForms = document.querySelectorAll('#siteVisitBookingForm, #contactInquiryForm, .booking-form-validate');
  bookingForms.forEach((form) => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let isValid = true;

      const nameInput = form.querySelector('[name="fullName"]');
      const phoneInput = form.querySelector('[name="phone"]');
      const emailInput = form.querySelector('[name="email"]');
      const propertyInput = form.querySelector('[name="propertyType"]');
      const locationInput = form.querySelector('[name="location"]');
      const serviceInput = form.querySelector('[name="serviceRequired"]');
      const dateInput = form.querySelector('[name="preferredDate"]');

      // Full Name Validation
      if (nameInput) {
        if (!validateNameField(nameInput)) {
          isValid = false;
        }
      }

      // Phone Number Validation (Standard 10-digit check)
      if (phoneInput) {
        const phoneVal = phoneInput.value.replace(/\s+/g, '');
        const phoneRegex = /^[+]?[0-9]{10,14}$/;
        if (!phoneRegex.test(phoneVal)) {
          setError(phoneInput, 'Please enter a valid 10-digit phone number.');
          isValid = false;
        } else {
          setValid(phoneInput);
        }
      }

      // Email Validation (optional or formatted)
      if (emailInput && emailInput.value.trim()) {
        if (!validateEmailField(emailInput, false, 'Please enter a valid email address.')) {
          isValid = false;
        }
      }

      // Property Type Validation
      if (propertyInput) {
        if (!propertyInput.value || propertyInput.value === '') {
          setError(propertyInput, 'Please select your property type.');
          isValid = false;
        } else {
          setValid(propertyInput);
        }
      }

      // Location Validation
      if (locationInput) {
        if (!locationInput.value.trim()) {
          setError(locationInput, 'Please enter your site location/city.');
          isValid = false;
        } else {
          setValid(locationInput);
        }
      }

      // Service Required Validation
      if (serviceInput) {
        if (!serviceInput.value || serviceInput.value === '') {
          setError(serviceInput, 'Please select a required service.');
          isValid = false;
        } else {
          setValid(serviceInput);
        }
      }

      // Preferred Date Validation
      if (dateInput) {
        if (!dateInput.value) {
          setError(dateInput, 'Please select a preferred date for site inspection.');
          isValid = false;
        } else {
          setValid(dateInput);
        }
      }

      if (isValid) {
        // Trigger Success Modal
        const successModalEl = document.getElementById('bookingSuccessModal');
        if (successModalEl && typeof bootstrap !== 'undefined') {
          const bookingModal = new bootstrap.Modal(successModalEl);
          // Set reference number
          const refEl = document.getElementById('bookingRefCode');
          if (refEl) {
            refEl.textContent = 'BP-' + Math.floor(100000 + Math.random() * 900000);
          }
          bookingModal.show();
        } else {
          // Fallback Alert
          alert('✓ Request Submitted Successfully!\nThank you. Our team will contact you shortly.');
        }

        form.reset();
        form.querySelectorAll('.is-valid').forEach((el) => el.classList.remove('is-valid'));
      }
    });
  // 2. Newsletter Subscription Form
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach((form) => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input || !validateEmailField(input, true, 'Please enter a valid email.')) {
        return;
      }
      alert('✓ Thank you for subscribing to BorewellPro Groundwater Insights!');
      form.reset();
      input.classList.remove('is-valid', 'is-invalid');
    });
  });

  // 5. Blog Comment Form Validation
  const blogCommentForm = document.getElementById('blogCommentForm');
  if (blogCommentForm) {
    blogCommentForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const nameInput = this.querySelector('[name="fullName"], input[type="text"]');
      const emailInput = this.querySelector('input[type="email"]');
      const commentInput = this.querySelector('textarea');
      let isValid = true;

      if (nameInput && !validateNameField(nameInput)) {
        isValid = false;
      }

      if (emailInput && !validateEmailField(emailInput, true, 'Please enter a valid email address.')) {
        isValid = false;
      }

      if (commentInput && (!commentInput.value.trim() || commentInput.value.trim().length < 5)) {
        setError(commentInput, 'Please enter a comment (minimum 5 characters).');
        isValid = false;
      } else if (commentInput) {
        setValid(commentInput);
      }

      if (isValid) {
        alert('✓ Comment submitted for moderation! Thank you for your feedback.');
        this.reset();
        this.querySelectorAll('.is-valid, .is-invalid').forEach((el) => el.classList.remove('is-valid', 'is-invalid'));
      }
    });
  }
});
