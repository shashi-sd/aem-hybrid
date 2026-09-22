/*
 * ContextHub Personalization Sample
 *
 * Resolution order:
 *   1. ContextHub profile/role (primary)
 *   2. default authored content
 */
(function () {
  'use strict';

  var SELECTOR = '.cmp-personalization';
  var ACTIVE_CLASS = 'cmp-personalization__variant--active';
  var CH_WAIT_MS = 3000;

  function norm(value) {
    return value == null ? '' : String(value).trim().toLowerCase();
  }

  function fromContextHub() {
    if (!window.ContextHub || typeof window.ContextHub.getStore !== 'function') {
      return null;
    }

    var store = window.ContextHub.getStore('profile');
    if (!store || typeof store.getItem !== 'function') {
      return null;
    }

    var role = store.getItem('role');
    return role ? norm(role).replace(/[^a-z0-9-]+/g, '-') : null;
  }

  function pickVariant(root, role) {
    var chosen = null;
    var def = null;

    root.querySelectorAll('[data-role]').forEach(function (variant) {
      var variantRole = norm(variant.dataset.role);
      if (variantRole === 'default') {
        def = def || variant;
      }
      if (variantRole === role && !chosen) {
        chosen = variant;
      }
    });

    return chosen || def;
  }

  function showVariant(root, chosen) {
    root.querySelectorAll('[data-role]').forEach(function (variant) {
      var isChosen = variant === chosen;
      variant.classList.toggle(ACTIVE_CLASS, isChosen);
      variant.hidden = !isChosen;
    });

    root.setAttribute('data-cmp-active-role', chosen ? (chosen.dataset.role || 'default') : 'default');
  }

  function apply(root) {
    var role = fromContextHub();
    showVariant(root, pickVariant(root, role || 'default'));
  }

  function bindContextHubEvents() {
    if (!window.ContextHub || !window.ContextHub.eventing) {
      return;
    }

    try {
      window.ContextHub.eventing.on('profile:update', function () {
        document.querySelectorAll(SELECTOR).forEach(apply);
      });
      window.ContextHub.eventing.on('profile:itemupdated', function () {
        document.querySelectorAll(SELECTOR).forEach(apply);
      });
    } catch (e) {
      // ignore event binding failures and keep the default content visible
    }
  }

  function waitForContextHub(callback) {
    var start = Date.now();

    (function poll() {
      if (window.ContextHub && typeof window.ContextHub.getStore === 'function') {
        callback(true);
        return;
      }

      if (Date.now() - start > CH_WAIT_MS) {
        callback(false);
        return;
      }

      setTimeout(poll, 100);
    })();
  }

  function init() {
    var roots = document.querySelectorAll(SELECTOR);
    if (!roots.length) {
      return;
    }

    roots.forEach(function (root) {
      apply(root);
    });

    waitForContextHub(function () {
      roots.forEach(function (root) {
        apply(root);
      });
      bindContextHubEvents();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
