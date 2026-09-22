import React from 'react';
import ProductFavorite from '../ProductFavorite/ProductFavorite';

const ChevronRightIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M3.75 7.5L6.25 5L3.75 2.5" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CloudDownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M6.49959 7.04167V11.375M8.66626 9.20833L6.49959 11.375L4.33293 9.20833M2.37915 8.27048C1.93675 7.88347 1.59039 7.39891 1.36741 6.85506C1.14443 6.31121 1.05094 5.72296 1.09433 5.13678C1.13772 4.5506 1.31679 3.98253 1.61741 3.47744C1.91803 2.97235 2.33196 2.54406 2.82652 2.2264C3.32107 1.90875 3.88271 1.71042 4.46707 1.64708C5.05144 1.58374 5.64252 1.65713 6.19365 1.86145C6.74479 2.06576 7.24087 2.39541 7.64273 2.82437C8.04459 3.25332 8.34122 3.76983 8.50919 4.3331H9.47878C10.0053 4.33303 10.5177 4.50347 10.9393 4.8189C11.3609 5.13433 11.669 5.57779 11.8176 6.08294C11.9661 6.58809 11.9471 7.12776 11.7634 7.62119C11.5796 8.11463 11.241 8.5353 10.7983 8.82027" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const isOn = (value, fallback) =>
  value === undefined || value === null || value === '' ? fallback : String(value) !== 'false';

const withHtml = (path) => (path && path.startsWith('/content/') && !path.includes('.') ? `${path}.html` : path);

const ProductHero = ({ pageData, dynamicData, serviceData }) => {
  const authored = pageData || {};
  const live = dynamicData || serviceData || null;

  const title = authored.title || authored.pageTitle || '';
  const breadcrumbs = Array.isArray(authored.breadcrumbs) ? authored.breadcrumbs : [];
  const showBreadcrumbs = isOn(authored.showBreadcrumbs, true) && breadcrumbs.length > 0;
  const showFavorite = isOn(authored.showFavorite, true);
  const hasCta = authored.ctaText && authored.ctaLink;
  const hasCaption = authored.image && (authored.imageCaptionTitle || authored.imageCaptionSubtitle);

  return (
    <section className="cmp-product-hero">
      <div className="cmp-product-hero__content">
        {showBreadcrumbs && (
          <nav className="cmp-product-hero__breadcrumbs" aria-label="Breadcrumb">
            <ol className="cmp-product-hero__breadcrumb-list">
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <li
                    key={crumb.path || i}
                    className={`cmp-product-hero__breadcrumb${isLast ? ' cmp-product-hero__breadcrumb--active' : ''}`}
                  >
                    {i > 0 && (
                      <span className="cmp-product-hero__breadcrumb-separator">
                        <ChevronRightIcon />
                      </span>
                    )}
                    {isLast || !crumb.path ? (
                      <span aria-current={isLast ? 'page' : undefined}>{crumb.title}</span>
                    ) : (
                      <a href={withHtml(crumb.path)}>{crumb.title}</a>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        <div className="cmp-product-hero__title-group">
          {authored.eyebrow && <span className="cmp-product-hero__eyebrow">{authored.eyebrow}</span>}
          {title && <h1 className="cmp-product-hero__title">{title}</h1>}
          {authored.description && <p className="cmp-product-hero__description">{authored.description}</p>}
        </div>

        {(showFavorite || hasCta) && (
          <div className="cmp-product-hero__actions">
            {showFavorite && (
              <ProductFavorite
                pageData={{
                  addLabel: authored.addLabel,
                  removeLabel: authored.removeLabel,
                  loginMessage: authored.loginMessage,
                }}
                dynamicData={live}
              />
            )}
            {hasCta && (
              <a className="cmp-product-hero__cta" href={withHtml(authored.ctaLink)}>
                {authored.ctaIcon === 'download' && (
                  <span className="cmp-product-hero__cta-icon">
                    <CloudDownloadIcon />
                  </span>
                )}
                <span>{authored.ctaText}</span>
              </a>
            )}
          </div>
        )}
      </div>

      <div className="cmp-product-hero__media">
        {authored.image && (
          <img className="cmp-product-hero__image" src={authored.image} alt={authored.imageAlt || ''} />
        )}
        {authored.imageBadge && <span className="cmp-product-hero__media-badge">{authored.imageBadge}</span>}
        {hasCaption && (
          <div className="cmp-product-hero__media-caption">
            {authored.imageCaptionTitle && (
              <p className="cmp-product-hero__media-caption-title">{authored.imageCaptionTitle}</p>
            )}
            {authored.imageCaptionSubtitle && (
              <p className="cmp-product-hero__media-caption-subtitle">{authored.imageCaptionSubtitle}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductHero;
