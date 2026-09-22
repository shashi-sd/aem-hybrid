import React, { useState } from 'react';

const HeartOffIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M5.68753 2.64981C5.9057 2.7914 6.10439 2.96096 6.27853 3.15414C6.30691 3.18449 6.34122 3.20868 6.37933 3.22521C6.41744 3.24175 6.45855 3.25029 6.50009 3.25029C6.54164 3.25029 6.58274 3.24175 6.62085 3.22521C6.65896 3.20868 6.69327 3.18449 6.72165 3.15414C7.12329 2.70284 7.65286 2.38457 8.23986 2.24169C8.82686 2.0988 9.44346 2.13808 10.0076 2.3543C10.5717 2.57051 11.0566 2.95341 11.3977 3.45203C11.7389 3.95065 11.9201 4.54133 11.9172 5.14547C11.9172 6.15955 11.3744 6.96345 10.7325 7.66713M9.19076 9.1908L7.31699 11.0034C7.21605 11.1193 7.0916 11.2124 6.9519 11.2765C6.8122 11.3407 6.66046 11.3743 6.50675 11.3753C6.35304 11.3763 6.20088 11.3446 6.06038 11.2822C5.91988 11.2198 5.79426 11.1283 5.69186 11.0137L2.70813 8.12526C1.89557 7.31269 1.08301 6.39178 1.08301 5.14585C1.08305 4.62321 1.22056 4.10978 1.48176 3.65709C1.74295 3.20439 2.11863 2.82837 2.57108 2.56677M1.08301 1.08289L11.9172 11.9171" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" focusable="false">
    <path
      d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6C19 16.5 12 21 12 21z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
  </svg>
);

const ProductFavorite = ({ pageData, dynamicData, serviceData }) => {
  const live = dynamicData || serviceData || {};
  const labels = pageData || {};
  const addLabel = labels.addLabel || 'Add to My Products';
  const removeLabel = labels.removeLabel || 'In My Products';
  const loginMessage = labels.loginMessage || 'Please log in to save products';
  const endpoint = live.endpoint || '/bin/aem-hybrid-calix/favorite';
  const productPath = live.productPath || '';
  const userId = live.userId || 'anonymous';
  const isAnonymous = !userId || userId === 'anonymous';

  const [isFavorite, setIsFavorite] = useState(!!live.isFavorite);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const toggle = async () => {
    if (isAnonymous || !productPath || busy) return;
    setBusy(true);
    setError(null);
    try {
      let csrfToken = '';
      try {
        const t = await fetch('/libs/granite/csrf/token.json', {
          credentials: 'same-origin',
        });
        if (t.ok) {
          const j = await t.json();
          csrfToken = j.token || '';
        }
      } catch (e) {
      }

      const body = new URLSearchParams();
      body.set('productPath', productPath);
      body.set('action', 'toggle');
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(csrfToken ? { 'CSRF-Token': csrfToken } : {}),
        },
        body: body.toString(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setIsFavorite(!!json.isFavorite);
    } catch (e) {
      console.error('[ProductFavorite] toggle failed', e);
      setError('Could not update. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (isAnonymous) {
    return (
      <div className="cmp-product-favorite cmp-product-favorite--anon">
        <span className="cmp-product-favorite__icon">
          <HeartOffIcon />
        </span>
        <span>{loginMessage}</span>
      </div>
    );
  }

  let label = isFavorite ? removeLabel : addLabel;
  if (busy) label = isFavorite ? 'Removing…' : 'Saving…';

  return (
    <div className="cmp-product-favorite">
      <button
        type="button"
        className={`cmp-product-favorite__btn${isFavorite ? ' cmp-product-favorite__btn--on' : ''}`}
        onClick={toggle}
        disabled={busy || !productPath}
        aria-pressed={isFavorite}
        aria-live="polite"
        title={isFavorite ? removeLabel : addLabel}
      >
        <span className="cmp-product-favorite__icon">
          {isFavorite ? <HeartIcon /> : <HeartOffIcon />}
        </span>
        <span className="cmp-product-favorite__label">{label}</span>
        {busy && <span className="cmp-product-favorite__spinner" aria-hidden="true" />}
      </button>
      {error && <span className="cmp-product-favorite__error" role="alert">{error}</span>}
    </div>
  );
};

export default ProductFavorite;
