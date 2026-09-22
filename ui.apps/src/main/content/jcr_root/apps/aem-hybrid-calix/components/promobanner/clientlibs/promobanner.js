/*
 * Promo Banner — hybrid AEM personalization (OOTB HTL + progressive JS)
 *
 * WHY THIS DEMONSTRATES "HYBRID BEATS SPA":
 *
 *   The server (HTL, see promobanner.html) already renders the FULL
 *   default variant, visible, plus every role variant pre-rendered but
 *   `hidden`. This means the page is meaningful the instant HTML arrives —
 *   with JS disabled, slow, or not-yet-loaded, the visitor still sees real
 *   content (the default variant), not a blank screen or spinner.
 *
 *   A pure SPA has to ship + parse + execute a JS bundle, boot the
 *   framework, resolve personalization context, and hydrate — all BEFORE
 *   the first pixel of real content appears. Any failure/slowness in that
 *   chain (bundle 404, slow network, ad-blocker, JS error) means nothing
 *   renders at all.
 *
 *   This script only ever *swaps which pre-rendered variant is visible*.
 *   It never blocks or delays the first paint. That's the OOTB AEM/HTL
 *   behavior working seamlessly where a client-only SPA architecture
 *   cannot.
 *
 *   For live demos, append ?hybridDemo=spa to simulate the SPA failure
 *   mode on this exact component (see simulateSpaMode() below) — it hides
 *   ALL variants (including default) until an artificial bundle/hydrate
 *   delay elapses, so you can toggle between "hybrid" and "SPA-style"
 *   behavior side by side without touching the markup.
 *
 * Role resolution (evaluated in order, first non-empty wins):
 *
 *   1. ?role=<value>   — explicit author/QA override (URL). Kept first so
 *                        you can force-preview any variant.
 *   2. ContextHub      — store & item from data-cmp-contexthub-key
 *                        (default "profile/role"). This is the intended
 *                        production source of the role.
 *                        Also tries profile/authorizableId → GROUP_TO_ROLE.
 *   3. <meta name="calix-role"> / window.calixRole
 *                      — optional server-side hint (SSR / dispatcher).
 *   4. /libs/granite/security/currentuser.json
 *                      — Granite fallback that maps AEM group memberships
 *                        to a role (useful on publish when ContextHub is
 *                        populated lazily / not at all).
 *   5. Cookie chRole   — last resolved role (sticky across pages, avoids
 *                        flicker on subsequent loads).
 *   6. "default".
 *
 * The resolved role is persisted into the chRole cookie.
 * Emits CustomEvent "promobanner:role-applied" on each root when done.
 * Listens for "promobanner:set-role" to force a role at runtime.
 */
(function () {
    'use strict';

    var SELECTOR         = '.cmp-promobanner';
    var VARIANT_SELECTOR = '.cmp-promobanner__variant';
    var ACTIVE_CLASS     = 'cmp-promobanner__variant--active';
    var COOKIE_NAME      = 'chRole';
    var CH_WAIT_MS       = 3000;
    // Artificial "bundle download + boot + hydrate" delay used only when
    // ?hybridDemo=spa is present, to visually simulate what a client-only
    // SPA visitor experiences before ANY content can appear.
    var SPA_SIM_DELAY_MS = 2000;

    // Map AEM group ids (or ContextHub authorizableIds) → banner role.
    var GROUP_TO_ROLE = {
        'administrators'  : 'admin',
        'calix-admin'     : 'admin',
        'calix-technician': 'technician',
        'calix-subscriber': 'subscriber',
        'contributor'     : 'admin',
        'everyone'        : 'guest'
    };

    function log() {
        if (window.console && console.debug) {
            console.debug.apply(console, ['[promobanner]'].concat([].slice.call(arguments)));
        }
    }
    function getQueryParam(name) {
        try { return new URLSearchParams(window.location.search).get(name); }
        catch (e) { return null; }
    }
    function getCookie(name) {
        var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return m ? decodeURIComponent(m[1]) : null;
    }
    function setCookie(name, value) {
        try {
            document.cookie = name + '=' + encodeURIComponent(value)
                + '; path=/; max-age=' + (60 * 60 * 24 * 30) + '; SameSite=Lax';
        } catch (e) { /* ignore */ }
    }
    function norm(v) { return v == null ? '' : String(v).trim().toLowerCase(); }

    function parseKey(key) {
        // "profile/role" -> { store: "profile", item: "/role" }
        var parts = (key || 'profile/role').split('/').filter(Boolean);
        var store = parts.shift() || 'profile';
        var item  = '/' + (parts.join('/') || 'role');
        return { store: store, item: item };
    }

    // -------- role sources --------

    function fromMeta() {
        if (typeof window.calixRole === 'string' && window.calixRole) return window.calixRole;
        var m = document.querySelector('meta[name="calix-role"]');
        return m ? m.getAttribute('content') : null;
    }

    function fromContextHub(key) {
        if (!window.ContextHub || typeof ContextHub.getStore !== 'function') return null;
        var k = parseKey(key);
        var store = ContextHub.getStore(k.store);
        if (!store) { log('ContextHub store not found:', k.store); return null; }

        // Preferred: an explicit role item on the store (e.g. profile/role).
        var v = store.getItem(k.item);
        if (v) { log('ContextHub', k.store + k.item, '=', v); return String(v); }

        // Fallback: derive from the user's authorizableId via GROUP_TO_ROLE.
        var uid = store.getItem('/authorizableId');
        if (uid && GROUP_TO_ROLE[norm(uid)]) return GROUP_TO_ROLE[norm(uid)];
        return null;
    }

    var currentUserPromise = null;
    function fromCurrentUser() {
        if (currentUserPromise) return currentUserPromise;
        if (!window.fetch) return (currentUserPromise = Promise.resolve(null));

        currentUserPromise = fetch('/libs/granite/security/currentuser.json', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        }).then(function (r) { return r.ok ? r.json() : null; })
          .then(function (data) {
              if (!data) return null;
              var groups = [].concat(
                  data.memberOf || [],
                  data.declaredMemberOf || [],
                  [data.authorizableId || '']);
              for (var i = 0; i < groups.length; i++) {
                  var g = norm(typeof groups[i] === 'string'
                      ? groups[i]
                      : (groups[i] && groups[i].authorizableId));
                  if (g && GROUP_TO_ROLE[g]) return GROUP_TO_ROLE[g];
              }
              if (norm(data.authorizableId) === 'anonymous') return 'guest';
              return null;
          }).catch(function () { return null; });

        return currentUserPromise;
    }

    // -------- variant handling --------

    function pickVariant(root, role) {
        var chosen = null, def = null;
        root.querySelectorAll(VARIANT_SELECTOR).forEach(function (v) {
            var r = norm(v.getAttribute('data-role'));
            if (r === 'default') def = def || v;
            if (r === role && !chosen) chosen = v;
        });
        return chosen || def;
    }

    function showVariant(root, chosen) {
        root.querySelectorAll(VARIANT_SELECTOR).forEach(function (v) {
            var isChosen = v === chosen;
            v.classList.toggle(ACTIVE_CLASS, isChosen);
            if (isChosen) v.removeAttribute('hidden');
            else          v.setAttribute('hidden', 'hidden');
        });
        var applied = chosen ? (chosen.getAttribute('data-role') || 'default') : 'default';
        root.setAttribute('data-cmp-active-role', applied);
        try {
            root.dispatchEvent(new CustomEvent('promobanner:role-applied',
                { bubbles: true, detail: { role: applied } }));
        } catch (e) { /* older browsers */ }
        log('applied role:', applied);
        return applied;
    }

    // -------- resolver --------

    /**
     * Synchronously resolve a role for a single banner root.
     * ContextHub is the primary source; the URL param is an explicit override
     * that also wins so QA/authors can force-preview a variant.
     */
    function resolveRoleSync(root) {
        var key = root.getAttribute('data-cmp-contexthub-key') || 'profile/role';
        return norm(
               getQueryParam('role')       // explicit override
            || fromContextHub(key)         // primary: ContextHub
            || fromMeta()                  // server-side hint
            || getCookie(COOKIE_NAME)      // sticky previous resolution
        );
    }

    function applySync(root) {
        var role = resolveRoleSync(root);
        var applied = showVariant(root, pickVariant(root, role || 'default'));
        if (applied && applied !== 'default') setCookie(COOKIE_NAME, applied);
        return role;
    }

    function applyAllSync() {
        document.querySelectorAll(SELECTOR).forEach(applySync);
    }

    /**
     * Async upgrade path: if neither the URL override nor ContextHub gave us
     * a role (typical on publish for anonymous users), fall back to
     * currentuser.json group mapping.
     */
    function applyAllAsync() {
        var roots = document.querySelectorAll(SELECTOR);
        if (!roots.length) return;

        // Nothing to do if any authoritative source already resolved a role.
        var alreadyResolved = false;
        roots.forEach(function (root) {
            if (root.getAttribute('data-cmp-active-role') &&
                root.getAttribute('data-cmp-active-role') !== 'default') {
                alreadyResolved = true;
            }
        });
        if (alreadyResolved) return;
        if (getQueryParam('role')) return;

        fromCurrentUser().then(function (role) {
            if (!role) return;
            roots.forEach(function (root) {
                showVariant(root, pickVariant(root, norm(role)));
            });
            setCookie(COOKIE_NAME, role);
        });
    }

    // -------- ContextHub bindings --------

    function bindContextHubEvents() {
        if (!window.ContextHub || !ContextHub.eventing) return;
        var stores = {};
        document.querySelectorAll(SELECTOR).forEach(function (root) {
            stores[parseKey(root.getAttribute('data-cmp-contexthub-key')).store] = true;
        });
        Object.keys(stores).forEach(function (s) {
            [':update', ':itemadded', ':itemupdated', ':itemremoved'].forEach(function (evt) {
                try { ContextHub.eventing.on(s + evt, applyAllSync); } catch (e) { /* ignore */ }
            });
        });
    }

    function waitForContextHub(cb) {
        var start = Date.now();
        (function poll() {
            if (window.ContextHub && typeof ContextHub.getStore === 'function') return cb(true);
            if (Date.now() - start > CH_WAIT_MS) return cb(false);
            setTimeout(poll, 100);
        })();
    }

    // -------- SPA comparison demo mode --------

    /**
     * Simulates the "pure SPA" rendering model on THIS SAME component/markup,
     * for a live side-by-side demo:
     *
     *   Normal hybrid mode (no query param): the browser already painted the
     *   server-rendered `default` variant before this script ever ran — real
     *   content is visible even if JS never loads.
     *
     *   ?hybridDemo=spa: we immediately hide EVERY variant (including
     *   default) and show a "Loading…" placeholder, simulating the blank/
     *   spinner state a client-only SPA shows while its JS bundle downloads,
     *   boots, resolves personalization context, and hydrates. Only after
     *   SPA_SIM_DELAY_MS do we reveal content — exactly mirroring the delay
     *   a real SPA bundle+hydrate cycle would add before first paint.
     *
     * Returns true if simulation mode is active (caller should skip the
     * normal synchronous "instant paint" path and let this function drive
     * the reveal instead).
     */
    function simulateSpaMode() {
        if (norm(getQueryParam('hybridDemo')) !== 'spa') return false;

        var roots = document.querySelectorAll(SELECTOR);
        if (!roots.length) return false;

        log('SPA simulation mode active — blanking content for', SPA_SIM_DELAY_MS, 'ms');

        roots.forEach(function (root) {
            root.querySelectorAll(VARIANT_SELECTOR).forEach(function (v) {
                v.setAttribute('hidden', 'hidden');
                v.classList.remove(ACTIVE_CLASS);
            });
            root.setAttribute('data-cmp-spa-sim', 'loading');

            var placeholder = document.createElement('div');
            placeholder.className = 'cmp-promobanner__spa-placeholder';
            placeholder.textContent = 'Loading personalized content…';
            placeholder.style.cssText = 'padding:1.5em;text-align:center;'
                + 'font-style:italic;color:#888;border:1px dashed #ccc;';
            root.appendChild(placeholder);
        });

        setTimeout(function () {
            roots.forEach(function (root) {
                var placeholder = root.querySelector('.cmp-promobanner__spa-placeholder');
                if (placeholder) placeholder.remove();
                root.setAttribute('data-cmp-spa-sim', 'hydrated');
            });
            applyAllSync();
            waitForContextHub(function (ready) {
                if (ready) { applyAllSync(); bindContextHubEvents(); }
                applyAllAsync();
            });
        }, SPA_SIM_DELAY_MS);

        return true;
    }

    // -------- init --------

    function init() {
        if (!document.querySelector(SELECTOR)) return;

        // Live demo toggle: ?hybridDemo=spa simulates the SPA "blank until
        // hydrated" model on this exact markup so it can be A/B compared
        // against normal hybrid behavior in front of an audience.
        if (simulateSpaMode()) return;

        // Initial render: whatever we know synchronously right now
        // (URL override, ContextHub if already booted, meta, cookie).
        applyAllSync();

        // ContextHub often boots slightly after DOMContentLoaded — wait for it
        // and re-resolve, then subscribe for live updates.
        waitForContextHub(function (ready) {
            if (ready) {
                log('ContextHub ready — resolving role');
                applyAllSync();
                bindContextHubEvents();
            } else {
                log('ContextHub not present — publish/anonymous mode');
            }
            // Final fallback: Granite currentuser.json group mapping, only if
            // nothing above produced a non-default role.
            applyAllAsync();
        });

        // Programmatic override:
        //   window.dispatchEvent(new CustomEvent('promobanner:set-role',{detail:{role:'admin'}}))
        window.addEventListener('promobanner:set-role', function (e) {
            var role = e && e.detail && e.detail.role;
            if (!role) return;
            setCookie(COOKIE_NAME, role);
            document.querySelectorAll(SELECTOR).forEach(function (root) {
                showVariant(root, pickVariant(root, norm(role)));
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
