import React from 'react';

const InfoIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M5.99991 8.00013V5.99997M5.99991 3.99981H6.00491M11.0003 5.99997C11.0003 8.76162 8.76156 11.0004 5.99991 11.0004C3.23827 11.0004 0.999512 8.76162 0.999512 5.99997C0.999512 3.23833 3.23827 0.999573 5.99991 0.999573C8.76156 0.999573 11.0003 3.23833 11.0003 5.99997Z" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M9.99969 3L4.50024 8.4996L2.00049 5.99978" stroke="#FF6D11" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M2.49951 5.99997H9.50031M5.99991 9.50037L9.50031 5.99997L5.99991 2.49957" stroke="#0B38DB" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M6.83757 1.2127C6.78861 1.2431 6.74912 1.28657 6.72356 1.33822L5.37664 4.06764C5.2878 4.24746 5.1566 4.403 4.99432 4.52088C4.83204 4.63875 4.64354 4.71543 4.44506 4.7443L1.43214 5.18472C1.3748 5.19283 1.32089 5.21688 1.27655 5.25413C1.23222 5.29138 1.19923 5.34033 1.18136 5.39541C1.16348 5.4505 1.16144 5.50949 1.17545 5.56568C1.18947 5.62187 1.21899 5.67299 1.26064 5.71322L3.43998 7.8348C3.58383 7.97489 3.69145 8.14788 3.75354 8.33883C3.81563 8.52979 3.83034 8.73298 3.79639 8.93089L3.28248 11.9286C3.27248 11.9856 3.27867 12.0443 3.30036 12.0979C3.32205 12.1516 3.35835 12.1981 3.40515 12.2321C3.45195 12.2661 3.50735 12.2864 3.56507 12.2905C3.62279 12.2946 3.6805 12.2824 3.73164 12.2553L6.42489 10.839C6.60239 10.7458 6.79987 10.6971 7.00035 10.6971C7.20083 10.6971 7.39831 10.7458 7.57581 10.839L10.2696 12.2553C10.3208 12.2825 10.3786 12.2948 10.4364 12.2908C10.4942 12.2868 10.5497 12.2666 10.5966 12.2326C10.6435 12.1985 10.6799 12.1519 10.7016 12.0982C10.7233 12.0445 10.7295 11.9857 10.7194 11.9286L10.2049 8.9303C10.1711 8.73249 10.1859 8.52942 10.248 8.33859C10.3101 8.14775 10.4176 7.97486 10.5613 7.8348L12.7406 5.71264C12.782 5.67236 12.8112 5.62133 12.825 5.56531C12.8388 5.50929 12.8367 5.45052 12.8188 5.39566C12.801 5.34079 12.7681 5.29201 12.724 5.25484C12.6799 5.21766 12.6262 5.19358 12.5691 5.1853L9.55564 4.7443C9.35738 4.7152 9.16915 4.63843 9.00709 4.52057C8.84503 4.40271 8.714 4.24728 8.62523 4.06764L7.27773 1.33822C7.25216 1.28657 7.21267 1.2431 7.16371 1.2127C7.11475 1.18231 7.05827 1.1662 7.00064 1.1662C6.94301 1.1662 6.88653 1.18231 6.83757 1.2127Z" stroke="#FF6D11" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ProductCard = ({ pageData, dynamicData, serviceData, headingTag: Heading = 'h3' }) => {
  const authored = pageData || {};
  const live = dynamicData || serviceData || {};

  const title = authored.productName || '';
  const category = authored.category || '';
  const description = authored.description || '';
  const ctaLabel = authored.ctaLabel || 'Launch Dashboard';
  const ctaLink = authored.ctaLink || '';
  const favoriteLabel = authored.favoriteLabel || 'In My Products';
  const isFavorite = !!live.isFavorite;
  const isHighlighted = !!live.isHighlighted;

  return (
    <article className={`cmp-product-card${isHighlighted ? ' cmp-product-card--highlighted' : ''}`}>
      <div className="cmp-product-card__top">
        {category && <span className="cmp-product-card__badge">{category}</span>}
        <span className="cmp-product-card__status" aria-hidden="true">
          {isHighlighted ? <CheckIcon /> : <InfoIcon />}
        </span>
      </div>

      <div className="cmp-product-card__body">
        <Heading className="cmp-product-card__title">{title}</Heading>
        {description && <p className="cmp-product-card__description">{description}</p>}
      </div>

      <div className="cmp-product-card__footer">
        {ctaLink ? (
          <a className="cmp-product-card__link" href={ctaLink}>
            <span>{ctaLabel}</span>
            <span className="cmp-product-card__link-icon">
              <ArrowRightIcon />
            </span>
          </a>
        ) : (
          <span />
        )}
        {isFavorite && (
          <span className="cmp-product-card__favorite" role="img" aria-label={favoriteLabel} title={favoriteLabel}>
            <StarIcon />
          </span>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
