/* =========================================
   PORTFOLIO — MAIN JAVASCRIPT (Commented)
   
   This file controls all the interactive
   behavior of your portfolio website.
   ========================================= */


/* ── IIFE (Immediately Invoked Function Expression) ────────────────────────
   
   Everything is wrapped inside this pattern:  (function() { ... })();
   
   WHY? To avoid "polluting the global scope."
   Variables inside here stay private to this file.
   If another script also uses a variable called "currentPage",
   they won't clash with ours.

   'use strict'; — This line turns on "Strict Mode."
   It makes JavaScript stricter about mistakes.
   For example, using a variable before declaring it will throw an error
   instead of silently failing. Always use this!
   
   ─────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';


  /* ── UTILITY FUNCTIONS ─────────────────────────────────────────────────
     
     These are shortcuts so we don't have to type long browser commands
     every single time.
     
     document.querySelector(sel)    → finds the FIRST element matching a CSS selector
     document.querySelectorAll(sel) → finds ALL elements matching a CSS selector
     
     We turned them into short functions named $ and $$.
     The "ctx = document" part means "search inside the whole document by default,
     but you can pass a different container if you want."
     
     The spread [...array] converts a NodeList (what querySelectorAll returns)
     into a real JavaScript Array so we can use .forEach(), .map(), etc.
     
     ─────────────────────────────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


  /* ── STATE ──────────────────────────────────────────────────────────────
     
     "State" just means "what's happening right now."
     currentPage tracks which page the user is on (home, about, projects, contact).
     We start on 'home'.
     
     ─────────────────────────────────────────────────────────────────────── */
  let currentPage = 'home';


  /* ── DOM REFERENCES ─────────────────────────────────────────────────────
     
     "DOM" = Document Object Model. It's the browser's representation of your HTML.
     
     Here we grab references to HTML elements we'll need to interact with.
     We do this ONCE at the top and save them in variables — it's faster than
     searching for them every time we need them.
     
     $('#navbar')   → finds the element with id="navbar"
     $$('.nav-link') → finds ALL elements with class="nav-link"
     
     ─────────────────────────────────────────────────────────────────────── */
  const navbar       = $('#navbar');           // The top navigation bar
  const hamburger    = $('.hamburger');         // The hamburger (☰) button on mobile
  const overlay      = $('#mobile-overlay');   // The full-screen mobile menu
  const navLinks     = $$('.nav-link');         // All desktop nav links
  const overlayLinks = $$('.overlay-link');    // All mobile overlay nav links


  /* ── STICKY NAVIGATION ON SCROLL ────────────────────────────────────────
     
     When the user scrolls down more than 30px, we add the class 'scrolled'
     to the navbar. That class (defined in style.css) changes the navbar's
     background to a dark blur effect.
     
     window.addEventListener('scroll', callback)
     → Runs the callback function every time the user scrolls.
     
     classList.toggle('scrolled', condition)
     → Adds 'scrolled' if condition is true, removes it if false.
     
     window.scrollY → how many pixels the user has scrolled from the top.
     
     { passive: true } → a performance hint telling the browser
     this scroll listener won't call preventDefault(), so it can
     keep scrolling smoothly without waiting for our code.
     
     ─────────────────────────────────────────────────────────────────────── */
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });


  /* ── HAMBURGER MENU TOGGLE ──────────────────────────────────────────────
     
     When the hamburger button is clicked, we open or close the mobile menu.
     
     classList.toggle('open') → adds 'open' if not there, removes it if it is.
     It also returns true/false (is the class now present?), which we save as 'isOpen'.
     
     document.body.style.overflow = 'hidden'
     → Prevents the page from scrolling in the background when the menu is open.
     Setting it back to '' (empty string) restores default scrolling.
     
     ─────────────────────────────────────────────────────────────────────── */
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    overlay.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* closeOverlay() — resets everything back to "menu closed" state.
     Called by nav links and the showPage function. */
  function closeOverlay() {
    hamburger.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }


  /* ── PAGE NAVIGATION ────────────────────────────────────────────────────
     
     Your site is a Single Page Application (SPA). All "pages" exist in the
     HTML at the same time — we just show one and hide the others using CSS
     (display: none vs display: block, controlled by the 'active' class).
     
     showPage(pageId, pushHistory)
     - pageId: a string like 'home', 'about', 'projects', 'contact'
     - pushHistory: whether to add this navigation to browser history
       (so the Back button works). Defaults to true.
     
     ─────────────────────────────────────────────────────────────────────── */
  function showPage(pageId, pushHistory = true) {

    // Step 1: Hide ALL pages by removing 'active' from every .page element
    $$('.page').forEach(p => p.classList.remove('active'));

    // Step 2: Show the page we want by finding its element and adding 'active'
    // Template literal: `#page-${pageId}` becomes e.g. "#page-about"
    const target = $(`#page-${pageId}`);
    if (!target) return; // Safety check: if the page doesn't exist, stop here
    target.classList.add('active');
    currentPage = pageId;

    // Step 3: Jump back to the top of the page
    window.scrollTo({ top: 0 });

    // Step 4: Update which nav link looks "active" (highlighted)
    // For each link, check if its data-page attribute matches the current page
    navLinks.forEach(a => a.classList.toggle('active', a.dataset.page === pageId));
    overlayLinks.forEach(a => a.classList.toggle('active', a.dataset.page === pageId));

    // Step 5: Add a new entry to browser history (so Back button works)
    // history.pushState(stateObj, title, url)
    if (pushHistory) {
      history.pushState({ page: pageId }, '', `#${pageId}`);
    }

    // Step 6: Close the mobile menu if it's open
    closeOverlay();

    // Step 7: Re-trigger CSS animations on the new page
    // We reset animation by removing it, forcing a reflow (offsetHeight), then re-adding it.
    // This is a common trick to restart CSS animations on elements.
    target.querySelectorAll('.fade-in').forEach(el => {
      el.style.animation = 'none';
      el.offsetHeight; // This line forces the browser to recalculate layout (reflow)
      el.style.animation = '';
    });
  }


  /* ── ATTACHING CLICK EVENTS TO NAVIGATION LINKS ─────────────────────────
     
     We loop over both desktop links and mobile overlay links and attach
     a click handler to each one.
     
     [...navLinks, ...overlayLinks] → spreads both arrays into one combined array.
     
     e.preventDefault() → stops the browser's default behavior for <a> tags
     (which would be to follow the href and reload the page).
     Instead, we manually call showPage().
     
     a.dataset.page → reads the data-page="..." attribute from the HTML element.
     
     ─────────────────────────────────────────────────────────────────────── */
  [...navLinks, ...overlayLinks].forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      showPage(a.dataset.page);
    });
  });

  /* Logo click → always go home */
  $$('.nav-logo, .logo-link').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      showPage('home');
    });
  });

  /* ── INTERNAL CTA BUTTONS (data-goto attribute) ─────────────────────────
     
     Instead of attaching click listeners to every individual button,
     we use "event delegation" — we listen on the whole document once,
     then check if the thing that was clicked (or its parent) has data-goto.
     
     e.target → the exact element that was clicked
     .closest('[data-goto]') → walks UP the DOM tree to find the nearest
     ancestor with a data-goto attribute. Returns null if none found.
     
     This is more efficient and works even for elements added dynamically later.
     
     ─────────────────────────────────────────────────────────────────────── */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-goto]');
    if (!t) return; // Nothing with data-goto was clicked — ignore
    e.preventDefault();
    showPage(t.dataset.goto);
  });


  /* ── BROWSER BACK / FORWARD BUTTONS ─────────────────────────────────────
     
     The 'popstate' event fires when the user clicks Back or Forward.
     e.state contains the object we saved with pushState earlier.
     
     We call showPage with pushHistory = false because we're restoring
     a history entry, not creating a new one.
     
     || 'home' means "use 'home' as a fallback if e.state is null/undefined"
     
     ─────────────────────────────────────────────────────────────────────── */
  window.addEventListener('popstate', e => {
    const page = e.state?.page || 'home'; // Optional chaining: safe if e.state is null
    showPage(page, false);
  });

  /* ── INITIAL PAGE LOAD ──────────────────────────────────────────────────
     
     When the page first loads, check if there's a hash in the URL.
     e.g. if the URL is: mysite.com/#about
     location.hash → "#about"
     .replace('#', '') → "about"
     
     If no hash, default to 'home'.
     pushHistory = false because we're not navigating, just loading.
     
     ─────────────────────────────────────────────────────────────────────── */
  const initPage = location.hash.replace('#', '') || 'home';
  showPage(initPage, false);


  /* ── CONTACT FORM ───────────────────────────────────────────────────────
     
     When the form is submitted, we prevent the default behavior (which
     would reload the page or send data to a server URL).
     
     Instead, we hide the form and show a success message.
     
     In a real project, you would send the form data to a backend
     (e.g. with fetch() and FormData) before showing the success message.
     
     ─────────────────────────────────────────────────────────────────────── */
  const form    = $('#contact-form');
  const success = $('#form-success');

  if (form) { // Guard: only run if the form element exists on the page
    form.addEventListener('submit', e => {
      e.preventDefault();             // Stop page reload
      form.style.display = 'none';    // Hide the form
      success.style.display = 'block'; // Show the "Message received!" message
    });
  }

  


  /* ── PROJECT FILTER ─────────────────────────────────────────────────────
     
     The filter buttons on the Projects page (All / Design / Development)
     show or hide project cards based on their category.
     
     Each project card has a data-cat="..." attribute (e.g. data-cat="dev").
     Each filter button has a data-filter="..." attribute (e.g. data-filter="dev").
     
     When "all" is selected, every card is shown.
     Otherwise, only cards whose data-cat matches the filter are shown.
     
     card.style.display = 'none'  → hides the card
     card.style.display = ''     → restores default display (shows the card)
     
     ─────────────────────────────────────────────────────────────────────── */
  const filterBtns   = $$('.filter-btn');
  const projectCards = $$('.project-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {

      // Remove 'active' from all filter buttons
      filterBtns.forEach(b => b.classList.remove('active'));

      // Add 'active' to the one that was clicked
      btn.classList.add('active');

      const cat = btn.dataset.filter; // e.g. 'all', 'design', or 'dev'

      // Show or hide each project card based on its category
      projectCards.forEach(card => {
        const show = cat === 'all' || card.dataset.cat === cat;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  const readMoreButtons = $$('.read-more-btn');

readMoreButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    e.stopPropagation();

    const card = button.closest('.card');

    card.classList.toggle('expanded');

    button.textContent = card.classList.contains('expanded')
      ? 'Read Less'
      : 'Read More';
  });
});

})(); // <-- This closes and immediately calls the IIFE