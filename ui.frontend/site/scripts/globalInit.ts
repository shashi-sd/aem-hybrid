function initScrollReveal(): void {
    const revealNow = (el: HTMLElement) => el.classList.add('is-visible');

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
        try {
            io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            revealNow(entry.target as HTMLElement);
                            io!.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
            );
        } catch (e) {
            io = undefined;
        }
    }

    const observe = (el: HTMLElement) => {
        if (el.classList.contains('is-visible')) return;
        if (io) {
            io.observe(el);
            setTimeout(() => revealNow(el), 2500);
        } else {
            revealNow(el);
        }
    };

    const scanAndObserve = (root: ParentNode) => {
        root.querySelectorAll<HTMLElement>('.reveal-on-scroll').forEach(observe);
    };

    scanAndObserve(document);

    if (typeof MutationObserver !== 'undefined') {
        const mo = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (!(node instanceof HTMLElement)) return;
                    if (node.matches('.reveal-on-scroll')) {
                        observe(node);
                    }
                    scanAndObserve(node);
                });
            });
        });

        mo.observe(document.body, { childList: true, subtree: true });
    }
}

const USER_INFO_URL = '/bin/aem-hybrid-calix/userinfo.json';
const ANONYMOUS = 'anonymous';

function hydrateAuthControl(control: HTMLElement, userId: string): void {
    const isAuthenticated = !!userId && userId.toLowerCase() !== ANONYMOUS;

    const userEl = control.querySelector<HTMLElement>('[data-cmp-hook-auth="user"]');
    const logoutEl = control.querySelector<HTMLElement>('[data-cmp-hook-auth="logout"]');
    const loginEl = control.querySelector<HTMLElement>('[data-cmp-hook-auth="login"]');
    const prefix = control.getAttribute('data-greeting-prefix') || '';

    if (isAuthenticated) {
        if (userEl) {
            userEl.textContent = (prefix ? prefix + ' ' : '') + userId;
            userEl.hidden = false;
        }
        if (logoutEl) logoutEl.hidden = false;
        if (loginEl) loginEl.hidden = true;
    } else {
        if (userEl) {
            userEl.hidden = true;
            userEl.textContent = '';
        }
        if (logoutEl) logoutEl.hidden = true;
        if (loginEl) loginEl.hidden = false;
    }

    control.setAttribute('data-cmp-auth-hydrated', 'true');
}

function fetchCurrentUserId(): Promise<string> {
    return fetch(USER_INFO_URL, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
        cache: 'no-store'
    })
        .then((res) => {
            if (!res.ok) throw new Error('userinfo request failed: ' + res.status);
            return res.json();
        })
        .then((data) => (data && data.userId ? data.userId : ANONYMOUS))
        .catch(() => ANONYMOUS);
}

function initAuthControlHydration(): void {
    const controls = document.querySelectorAll<HTMLElement>('[data-cmp-auth-control]');
    if (!controls.length) return;

    fetchCurrentUserId().then((userId) => {
        controls.forEach((control) => hydrateAuthControl(control, userId));
    });
}

function showLoginErrorFromQuery(): void {
    const el = document.querySelector<HTMLElement>('.cmp-login [data-cmp-hook-login="server-error"]');
    if (!el) return;

    const params = new URLSearchParams(window.location.search || '');
    const reason = params.get('j_reason') || params.get('j_reason_code');
    if (!reason) return;

    let msg = 'Sign-in failed. Please check your username and password.';
    switch (reason) {
        case 'INVALID_CREDENTIALS':
        case 'invalid_login':
            msg = 'Invalid username or password.';
            break;
        case 'ACCOUNT_LOCKED':
            msg = 'Your account is locked. Contact an administrator.';
            break;
        case 'ACCOUNT_NOT_FOUND':
            msg = 'Account not found.';
            break;
        case 'PASSWORD_EXPIRED':
        case 'PASSWORD_EXPIRED_AND_NEW_PASSWORD_IN_HISTORY':
            msg = 'Your password has expired. Please reset it.';
            break;
        default:
            msg = 'Sign-in failed. Please try again.';
    }
    el.textContent = msg;
    el.hidden = false;
}

function guardLoginForm(): void {
    const form = document.querySelector<HTMLFormElement>('.cmp-login [data-cmp-hook-login="form"]');
    if (!form) return;
    const errorEl = form.querySelector<HTMLElement>('[data-cmp-hook-login="error"]');
    const submitBtn = form.querySelector<HTMLButtonElement>('.cmp-login__submit');
    const submitOriginalLabel = submitBtn ? submitBtn.textContent : '';

    form.addEventListener('submit', (evt) => {
        const username = (form.querySelector<HTMLInputElement>('#cmp-login-username') || ({} as HTMLInputElement)).value || '';
        const password = (form.querySelector<HTMLInputElement>('#cmp-login-password') || ({} as HTMLInputElement)).value || '';
        if (!username.trim() || !password.trim()) {
            evt.preventDefault();
            if (errorEl) {
                errorEl.hidden = false;
                errorEl.textContent = 'Please enter both a username and a password.';
            }
            return;
        }
        if (submitBtn) {
            submitBtn.setAttribute('disabled', 'disabled');
            submitBtn.textContent = 'Signing in…';
            setTimeout(() => {
                submitBtn.removeAttribute('disabled');
                submitBtn.textContent = submitOriginalLabel;
            }, 8000);
        }
    });
}

function initPasswordToggle(): void {
    const toggles = document.querySelectorAll<HTMLButtonElement>('.cmp-login [data-cmp-hook-login="toggle-password"]');
    toggles.forEach((btn) => {
        const input = document.getElementById(btn.getAttribute('aria-controls') || '') as HTMLInputElement | null;
        if (!input) return;
        btn.addEventListener('click', () => {
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            btn.setAttribute('aria-pressed', String(show));
            btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        });
    });
}

function initAuth(): void {
    showLoginErrorFromQuery();
    guardLoginForm();
    initPasswordToggle();
}

function init(): void {
    try { initAuth(); } catch (e) { }
    try { initAuthControlHydration(); } catch (e) { }
    try { initScrollReveal(); } catch (e) { }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
