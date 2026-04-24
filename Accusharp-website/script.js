/* ==========================================================
   ACCUSHARP CUTLERY — SHARED JAVASCRIPT
   Used by: index.html, booking.html, pricing.html, about.html, los-angeles.html

   Handles:
   - Mobile nav toggle
   - FAQ accordion open/close
   - Booking form: tier selector, price estimator, checkboxes, submit
   - Pricing calculator slider
   ========================================================== */

// Wait for the DOM to be fully loaded before running anything
document.addEventListener('DOMContentLoaded', function () {

  // ------------------------------------------------------------------
  // MOBILE NAVIGATION TOGGLE
  // ------------------------------------------------------------------
  // Shows/hides the nav menu on mobile screens when hamburger is tapped
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const nav = document.querySelector('.nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  // ------------------------------------------------------------------
  // FAQ ACCORDION
  // ------------------------------------------------------------------
  // Click a question to expand/collapse its answer
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    item.addEventListener('click', function () {
      item.classList.toggle('open');
    });
  });

  // ------------------------------------------------------------------
  // BOOKING FORM — TIER SELECTOR & PRICE ESTIMATOR
  // ------------------------------------------------------------------
  const tierOptions = document.querySelectorAll('.tier-option');
  const exactCountGroup = document.getElementById('exactCountGroup');
  const exactCountInput = document.getElementById('exactCount');
  const estimateContent = document.getElementById('estimateContent');
  let selectedTier = null;

  // Handle tier selection (the 3 clickable buttons: 1-8, 9-19, 20+)
  tierOptions.forEach(function (opt) {
    opt.addEventListener('click', function () {
      // Remove 'selected' from all tiers first
      tierOptions.forEach(function (o) { o.classList.remove('selected'); });
      // Mark the clicked one as selected
      opt.classList.add('selected');
      selectedTier = opt.dataset.tier;

      // Show the exact count input now that a tier is picked
      if (exactCountGroup) {
        exactCountGroup.style.display = 'block';

        // Set a sensible default count based on tier
        if (exactCountInput && !exactCountInput.value) {
          if (selectedTier === '1-8') exactCountInput.value = 5;
          else if (selectedTier === '9-19') exactCountInput.value = 12;
          else exactCountInput.value = 25;
        }
      }

      updateEstimate();
    });
  });

  // Update estimate whenever the count changes
  if (exactCountInput) {
    exactCountInput.addEventListener('input', updateEstimate);
  }

  // Calculates and displays the estimate based on tier + count
  function updateEstimate() {
    if (!estimateContent) return;

    if (!selectedTier) {
      estimateContent.innerHTML = '<div class="est-placeholder">Select how many knives to see your estimate</div>';
      return;
    }

    const count = parseInt(exactCountInput.value) || 0;
    let total = 0;
    let breakdown = '';

    if (selectedTier === '1-8') {
      // Flat $80 for 1-8 knives
      total = 80;
      breakdown =
        '<div class="est-row"><span>' + (count || 'Up to 8') + ' knives</span><strong>Flat rate</strong></div>' +
        '<div class="est-row"><span>Minimum visit</span><strong>$80</strong></div>';
    } else if (selectedTier === '9-19') {
      // $10 per knife, $80 minimum applied
      const raw = count * 10;
      total = Math.max(raw, 80);
      breakdown =
        '<div class="est-row"><span>' + (count || 'Knives') + ' × $10</span><strong>$' + raw + '</strong></div>' +
        (raw < 80 ? '<div class="est-row"><span>Minimum applied</span><strong>$80</strong></div>' : '');
    } else if (selectedTier === '20+') {
      // $8 per knife, $80 minimum applied
      const raw = count * 8;
      total = Math.max(raw, 80);
      breakdown =
        '<div class="est-row"><span>' + (count || 'Knives') + ' × $8</span><strong>$' + raw + '</strong></div>' +
        (raw < 80 ? '<div class="est-row"><span>Minimum applied</span><strong>$80</strong></div>' : '');
    }

    estimateContent.innerHTML =
      breakdown +
      '<div class="est-row est-total"><span>Your estimate</span><strong>$' + total + '</strong></div>' +
      '<div class="est-note">Price confirmed on-site. No charge until work is done. Mileage may apply to outer areas.</div>';
  }

  // ------------------------------------------------------------------
  // BOOKING FORM — CHECKBOX STYLING
  // ------------------------------------------------------------------
  // Adds a .checked class to the <label> wrapping a checked checkbox
  // so we can style it differently
  const checkboxes = document.querySelectorAll('.checkbox-option input[type="checkbox"]');
  checkboxes.forEach(function (input) {
    input.addEventListener('change', function () {
      input.parentElement.classList.toggle('checked', input.checked);
    });
  });

  // ------------------------------------------------------------------
  // BOOKING FORM — SUBMIT HANDLING
  // ------------------------------------------------------------------
  // Note: the actual form submission is handled by Netlify Forms
  // (set via data-netlify="true" attribute on the <form> tag).
  // This script just ensures required validation and a friendly
  // confirmation experience before the form actually submits.
  const bookingForm = document.getElementById('bookingForm');

  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      // Basic validation
      const firstName = document.getElementById('firstName');
      const lastName = document.getElementById('lastName');
      const email = document.getElementById('email');
      const phone = document.getElementById('phone');
      const street = document.getElementById('street');
      const city = document.getElementById('city');
      const zip = document.getElementById('zip');

      // Check required fields
      const required = [firstName, lastName, email, phone, street, city, zip];
      const missing = required.filter(function (field) {
        return field && !field.value.trim();
      });

      if (missing.length > 0) {
        e.preventDefault();
        alert('Please fill out all required fields (marked with *).');
        if (missing[0]) missing[0].focus();
        return;
      }

      if (!selectedTier) {
        e.preventDefault();
        alert('Please select how many knives you need sharpened.');
        if (tierOptions[0]) tierOptions[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Attach the tier as a hidden field so Netlify captures it
      const hiddenTier = document.createElement('input');
      hiddenTier.type = 'hidden';
      hiddenTier.name = 'knife_count_tier';
      hiddenTier.value = selectedTier;
      bookingForm.appendChild(hiddenTier);

      // Attach the calculated estimate
      const count = parseInt(exactCountInput && exactCountInput.value) || 0;
      let estimate = 80;
      if (selectedTier === '9-19') estimate = Math.max(count * 10, 80);
      else if (selectedTier === '20+') estimate = Math.max(count * 8, 80);
      const hiddenEstimate = document.createElement('input');
      hiddenEstimate.type = 'hidden';
      hiddenEstimate.name = 'estimated_total';
      hiddenEstimate.value = '$' + estimate;
      bookingForm.appendChild(hiddenEstimate);

      // Form will now submit to Netlify, which handles email delivery
      // and redirects to the thank-you behavior configured in booking.html
    });
  }

  // ------------------------------------------------------------------
  // PRICING PAGE — CALCULATOR SLIDER
  // ------------------------------------------------------------------
  const slider = document.getElementById('knifeSlider');
  const sliderVal = document.getElementById('sliderVal');
  const calcBreakdown = document.getElementById('calcBreakdown');

  function updateCalc() {
    if (!slider || !calcBreakdown) return;

    const count = parseInt(slider.value);
    if (sliderVal) sliderVal.textContent = count;

    let total = 0;
    let raw = 0;
    let html = '';

    if (count <= 8) {
      total = 80;
      raw = 80;
      html =
        '<div class="calc-line"><span>' + count + ' knives</span><strong>1-8 tier</strong></div>' +
        '<div class="calc-line"><span>Flat rate (minimum)</span><strong>$80</strong></div>' +
        '<div class="calc-line calc-total"><span>Your estimate</span><strong>$' + total + '</strong></div>' +
        '<div class="calc-note">Covers up to 8 knives. Adding more moves you into the 9-19 tier starting at knife #9.</div>';
    } else if (count <= 19) {
      raw = count * 10;
      total = Math.max(raw, 80);
      html =
        '<div class="calc-line"><span>' + count + ' × $10</span><strong>$' + raw + '</strong></div>' +
        (raw < 80 ? '<div class="calc-line"><span>Minimum applied</span><strong>$80</strong></div>' : '') +
        '<div class="calc-line calc-total"><span>Your estimate</span><strong>$' + total + '</strong></div>' +
        '<div class="calc-note">Standard tier pricing. No minimum applies once you pass $80.</div>';
    } else {
      raw = count * 8;
      total = raw;
      html =
        '<div class="calc-line"><span>' + count + ' × $8</span><strong>$' + raw + '</strong></div>' +
        '<div class="calc-line calc-total"><span>Your estimate</span><strong>$' + total + '</strong></div>' +
        '<div class="calc-note">Bulk tier — best per-knife rate. Travel fees may apply if outside core area.</div>';
    }

    calcBreakdown.innerHTML = html;
  }

  if (slider) {
    slider.addEventListener('input', updateCalc);
    updateCalc(); // run once on page load
  }

  // ------------------------------------------------------------------
  // CURRENT YEAR IN FOOTER
  // ------------------------------------------------------------------
  // Automatically updates © year so you never have to edit it
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ------------------------------------------------------------------
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ------------------------------------------------------------------
  // When someone clicks a link like href="#form", smoothly scroll to it
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  anchorLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
