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
        if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
          setError(nameInput, 'Please enter your full name (minimum 2 characters).');
          isValid = false;
        } else {
          setValid(nameInput);
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
          setError(emailInput, 'Please enter a valid email address.');
          isValid = false;
        } else {
          setValid(emailInput);
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
  });

  // ================= Storage Keys & Helper Functions =================
  const USERS_STORAGE_KEY = 'borewellpro_users';
  const CURRENT_USER_KEY = 'borewellpro_current_user';
  const AUTH_FLASH_MSG_KEY = 'borewellpro_auth_msg';
  const AUTH_FLASH_EMAIL_KEY = 'borewellpro_auth_email';

  function getRegisteredUsers() {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading registered users:', e);
      return [];
    }
  }

  function saveRegisteredUsers(users) {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving registered users:', e);
    }
  }

  function renderAuthAlert(containerId, message, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const isSuccess = type === 'success';
    const iconClass = isSuccess ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger';
    const alertClass = isSuccess ? 'alert-success' : 'alert-danger';
    container.innerHTML = `
      <div class="alert ${alertClass} d-flex align-items-center alert-dismissible fade show mb-4 shadow-sm" role="alert">
        <i class="bi ${iconClass} fs-5 me-2 flex-shrink-0"></i>
        <div class="small fw-medium">${message}</div>
        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }

  // Check and display flash message on Login Page
  const loginAlertPlaceholder = document.getElementById('loginAlertPlaceholder');
  const loginEmailInput = document.getElementById('loginEmail');
  const loginPassInput = document.getElementById('loginPassword');

  if (loginAlertPlaceholder) {
    const flashMsg = sessionStorage.getItem(AUTH_FLASH_MSG_KEY);
    const flashEmail = sessionStorage.getItem(AUTH_FLASH_EMAIL_KEY);

    if (flashMsg) {
      renderAuthAlert('loginAlertPlaceholder', flashMsg, 'success');
      sessionStorage.removeItem(AUTH_FLASH_MSG_KEY);
    }

    if (flashEmail && loginEmailInput) {
      loginEmailInput.value = flashEmail;
      if (loginPassInput) {
        loginPassInput.value = '';
        loginPassInput.focus();
      }
      sessionStorage.removeItem(AUTH_FLASH_EMAIL_KEY);
    }
  }

  // 2. Login Form Validation & Authentication
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      let isValid = true;
      const email = document.getElementById('loginEmail');
      const pass = document.getElementById('loginPassword');

      const trimmedEmail = email ? email.value.trim().toLowerCase() : '';
      const enteredPass = pass ? pass.value : '';

      if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setError(email, 'Please enter a valid registered email address.');
        isValid = false;
      } else {
        setValid(email);
      }

      if (!enteredPass) {
        setError(pass, 'Please enter your password.');
        isValid = false;
      } else {
        setValid(pass);
      }

      if (!isValid) return;

      // Check against registered users
      const users = getRegisteredUsers();
      let matchedUser = users.find((u) => u.email && u.email.toLowerCase() === trimmedEmail);

      // Support pre-seeded admin demo account
      if (!matchedUser && trimmedEmail === 'admin@borewellpro.com' && enteredPass === 'password123') {
        matchedUser = {
          name: 'Admin User',
          email: 'admin@borewellpro.com',
          phone: '+91 98765 43210'
        };
      }

      if (matchedUser && (matchedUser.password === enteredPass || (matchedUser.email === 'admin@borewellpro.com' && enteredPass === 'password123'))) {
        // Save session state
        const sessionData = {
          name: matchedUser.name || 'User',
          email: matchedUser.email,
          phone: matchedUser.phone || ''
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionData));

        // Redirect to Home
        window.location.href = 'index.html';
      } else {
        renderAuthAlert('loginAlertPlaceholder', 'Invalid email or password. Please check your credentials.', 'danger');
        setError(pass, 'Incorrect password.');
      }
    });
  }

  // 3. Register Form Validation & User Creation
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      let isValid = true;
      const name = document.getElementById('regFullName');
      const email = document.getElementById('regEmail');
      const phone = document.getElementById('regPhone');
      const pass = document.getElementById('regPassword');
      const confirmPass = document.getElementById('regConfirmPassword');
      const terms = document.getElementById('regTerms');

      const trimmedName = name ? name.value.trim() : '';
      const trimmedEmail = email ? email.value.trim().toLowerCase() : '';
      const trimmedPhone = phone ? phone.value.trim() : '';
      const enteredPass = pass ? pass.value : '';
      const enteredConfirmPass = confirmPass ? confirmPass.value : '';

      if (!trimmedName || trimmedName.length < 2) {
        setError(name, 'Please enter your full name (minimum 2 characters).');
        isValid = false;
      } else {
        setValid(name);
      }

      if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setError(email, 'Please enter a valid email address.');
        isValid = false;
      } else {
        const users = getRegisteredUsers();
        const emailExists = users.some((u) => u.email && u.email.toLowerCase() === trimmedEmail);
        if (emailExists || trimmedEmail === 'admin@borewellpro.com') {
          setError(email, 'An account with this email address already exists. Please sign in.');
          isValid = false;
        } else {
          setValid(email);
        }
      }

      if (!trimmedPhone || trimmedPhone.replace(/\s+/g, '').length < 10) {
        setError(phone, 'Please enter a valid phone number (minimum 10 digits).');
        isValid = false;
      } else {
        setValid(phone);
      }

      if (!enteredPass || enteredPass.length < 8) {
        setError(pass, 'Password must be at least 8 characters long.');
        isValid = false;
      } else {
        setValid(pass);
      }

      if (enteredConfirmPass !== enteredPass) {
        setError(confirmPass, 'Passwords do not match.');
        isValid = false;
      } else {
        setValid(confirmPass);
      }

      if (terms && !terms.checked) {
        setError(terms, 'You must agree to the Terms & Conditions.');
        isValid = false;
      } else if (terms) {
        setValid(terms);
      }

      if (isValid) {
        // Save new user
        const users = getRegisteredUsers();
        users.push({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          password: enteredPass,
          createdAt: new Date().toISOString()
        });
        saveRegisteredUsers(users);

        // Store flash message and prefilled email for login page
        sessionStorage.setItem(AUTH_FLASH_MSG_KEY, 'Account created successfully. Please sign in.');
        sessionStorage.setItem(AUTH_FLASH_EMAIL_KEY, trimmedEmail);

        // Redirect user to Sign In page (do NOT directly go to Home)
        window.location.href = 'login.html';
      }
    });
  }

  // 4. Newsletter Subscription Form
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach((form) => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input || !input.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        if (input) setError(input, 'Please enter a valid email.');
        return;
      }
      alert('✓ Thank you for subscribing to BorewellPro Groundwater Insights!');
      form.reset();
      input.classList.remove('is-valid', 'is-invalid');
    });
  });
});
