// Restore Iran Flag on Twitter - Content Script
// Replaces the pagan flag with the original Islamic Republic flag

(function() {
  'use strict';

  // Iranian flag emoji codepoint
  const IRAN_FLAG_CODEPOINT = '1f1ee-1f1f7';

  // Local flag assets (bundled with extension)
  const ORIGINAL_FLAG_SVG = chrome.runtime.getURL('flag.svg');
  const ORIGINAL_FLAG_PNG = chrome.runtime.getURL('flag.png');

  // Patterns to match Iranian flag emoji images
  const FLAG_PATTERNS = [
    /1f1ee-1f1f7\.svg/i,
    /1f1ee-1f1f7\.png/i,
    /1f1ee-1f1f7/i
  ];

  // Check if an image is the Iranian flag
  function isIranFlag(src) {
    if (!src) return false;
    // Don't replace if already using our local flag
    if (src.startsWith('chrome-extension://')) return false;
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
