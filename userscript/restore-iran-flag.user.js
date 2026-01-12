// ==UserScript==
// @name         Restore Iran Flag on Twitter
// @namespace    https://github.com/restore-iran-flag
// @version      1.0.0
// @description  Restores the original Iranian flag emoji on Twitter/X
// @author       You
// @match        https://twitter.com/*
// @match        https://x.com/*
// @match        https://mobile.twitter.com/*
// @grant        none
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function() {
  'use strict';

  // Iranian flag emoji codepoint
  const IRAN_FLAG_CODEPOINT = '1f1ee-1f1f7';

  // Embedded flag assets (no external dependencies)
  const ORIGINAL_FLAG_SVG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><path fill="#DA0001" d="M0 27c0 2.209 1.791 4 4 4h28c2.209 0 4-1.791 4-4v-4H0v4z"/><path fill="#EEE" d="M0 13h36v10H0z"/><path fill="#239F40" d="M36 13V9c0-2.209-1.791-4-4-4H4C1.791 5 0 6.791 0 9v4h36z"/><path fill="#E96667" d="M0 23h36v1H0z"/><g fill="#BE1931"><path d="M19.465 14.969c.957.49 3.038 2.953.798 5.731 1.391-.308 3.162-4.408-.798-5.731zm-2.937 0c-3.959 1.323-2.189 5.423-.798 5.731-2.24-2.778-.159-5.241.798-5.731zm1.453-.143c.04.197 1.101.436.974-.573-.168.408-.654.396-.968.207-.432.241-.835.182-.988-.227-.148.754.587.975.982.593z"/><path d="M20.538 17.904c-.015-1.248-.677-2.352-1.329-2.799.43.527 1.752 3.436-.785 5.351l.047-5.097-.475-.418-.475.398.08 5.146-.018-.015c-2.563-1.914-1.233-4.837-.802-5.365-.652.447-1.315 1.551-1.329 2.799-.013 1.071.477 2.243 1.834 3.205-.558.149-1.162.208-1.678.201.464.253 1.34.192 2.007.131l.001.068.398.437.4-.455v-.052c.672.062 1.567.129 2.039-.128-.532.008-1.159-.053-1.732-.213 1.344-.961 1.83-2.127 1.817-3.194z"/></g><path fill="#7BC58C" d="M0 12h36v1H0z"/></svg>');

  const ORIGINAL_FLAG_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAXVBMVEVHcEwjn0DaAAEjn0Ajn0DaAAHaAAEjn0DaAAEjn0DaAAHu7u7aAAEjn0DpZmd7xYy+GTHr4eLiub/ENEnBJj3NXGzKTmDZkZvQaXjlxsvWhJDcnqfHQVTo09bTdoQc4QL+AAAAC3RSTlMAYGDvz88gv78g73NkREsAAAERSURBVHja7dTbbsMgDIBhJ02atIzNNmdyeP/HbLNo2j1YvWj5xfUnQBhotd63btIVTR2c3QZd2XD7dS66usshDVqgAaDTInUwyUATaKEa9NnQj1BykBLqhVBiIhaAaLOIlqgSougCWaOCi1QDJbuvpBAVrdmmcoisz1EdkHLBGyqGMrJZTigYxlAMebMhnxAjGV8MoeN/iJ0thkxm/Dsa8m6KIecJ3Qk5VN4VQ4slj+mAEjrCpRhSZmFcCZFW5GBqHqShHVd8rp1MqoDUxiris6h4qxvaJftjaH0OAv9RjGIf20uhb6HkoC+hGvTZ0CzjzNDLQD3AKOGMAHC91zv3KxzSWL2fK5z1c9U999BqvW0Pwh20MZ0J3PIAAAAASUVORK5CYII=';

  // Patterns to match Iranian flag emoji images
  const FLAG_PATTERNS = [
    /1f1ee-1f1f7\.svg/i,
    /1f1ee-1f1f7\.png/i,
    /1f1ee-1f1f7/i
  ];

  // Check if an image is the Iranian flag
  function isIranFlag(src) {
    if (!src) return false;
    // Don't replace if already using our embedded flag
    if (src.startsWith('data:')) return false;
    return FLAG_PATTERNS.some(pattern => pattern.test(src));
  }

  // Get replacement URL based on original URL type
  function getReplacementUrl(originalSrc) {
    if (originalSrc.includes('.svg')) {
      return ORIGINAL_FLAG_SVG;
    }
    return ORIGINAL_FLAG_PNG;
  }

  // Replace flag in an image element
  function replaceFlag(img) {
    const src = img.getAttribute('src') || img.src;
    if (isIranFlag(src)) {
      const newSrc = getReplacementUrl(src);
      if (src !== newSrc) {
        img.src = newSrc;
        img.setAttribute('src', newSrc);
        // Also update srcset if present
        if (img.srcset) {
          img.srcset = '';
        }
      }
    }
  }

  // Process all images on the page
  function processAllImages() {
    const images = document.querySelectorAll('img');
    images.forEach(replaceFlag);
  }

  // Observe DOM changes for dynamically loaded content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Check added nodes
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'IMG') {
            replaceFlag(node);
          }
          // Check for images within added elements
          const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
          images.forEach(replaceFlag);
        }
      });

      // Check for attribute changes on images
      if (mutation.type === 'attributes' && mutation.target.tagName === 'IMG') {
        replaceFlag(mutation.target);
      }
    });
  });

  // Start observing when DOM is ready
  function init() {
    // Process existing images
    processAllImages();

    // Start observing for new images
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src']
    });
  }

  // Initialize based on document state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also process on load to catch late-loading images
  window.addEventListener('load', processAllImages);
})();
