import React, { useMemo, useState } from 'react';
import ProductCard from '../ProductCard/ProductCard';

const FILTER_ALL = '__all__';
const FILTER_FAVORITES = '__favorites__';

const ProductList = ({ pageData, dynamicData, serviceData }) => {
  const [activeFilter, setActiveFilter] = useState(FILTER_ALL);

  const liveData = dynamicData || serviceData;
  const labels = pageData || {};
  const heading = labels.heading || 'My Products';
  const sectionLabel = labels.sectionLabel || 'Products';
  const emptyMessage = labels.emptyMessage || 'No products found';
  const showFilters = labels.showFilters !== false;
  const countLabel = labels.countLabel || 'Active';
  const showAllLabel = labels.showAllLabel || 'Show All';
  const favoritesLabel = labels.favoritesLabel || 'Favorites';
  const ctaLabel = labels.ctaLabel || 'Launch Dashboard';

  const products = useMemo(() => {
    const raw = labels.products;
    const authored = Array.isArray(raw) ? raw : raw?.items || [];

    const liveMap = new Map();
    (liveData?.products || []).forEach((lp) => {
      if (lp?.id) liveMap.set(lp.id, lp);
    });

    return authored
      .filter((p) => p && (p.productPath || p.productName))
      .map((p) => {
        const id = p.productPath || p.productName || '';
        const live = liveMap.get(id) || {};
        return {
          id,
          name: p.productName,
          description: p.productDescription,
          category: p.productCategory,
          link: p.productPath ? `${p.productPath}.html` : undefined,
          isSelected: !!live.isSelected,
          isHighlighted: !!live.isHighlighted,
        };
      });
  }, [labels.products, liveData]);

  const categories = useMemo(() => {
    const authored = Array.isArray(labels.filterCategories)
      ? labels.filterCategories
      : String(labels.filterCategories || '').split(',');
    const cleaned = authored.map((c) => String(c).trim()).filter(Boolean);
    if (cleaned.length) return [...new Set(cleaned)];
    return [...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [labels.filterCategories, products]);

  const selectedCount = products.filter((p) => p.isSelected).length;

  const visibleProducts = useMemo(() => {
    if (activeFilter === FILTER_FAVORITES) return products.filter((p) => p.isSelected);
    if (activeFilter !== FILTER_ALL) return products.filter((p) => p.category === activeFilter);
    return products;
  }, [products, activeFilter]);

  const filters = [
    { value: FILTER_ALL, label: showAllLabel },
    { value: FILTER_FAVORITES, label: favoritesLabel },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  return (
    <section className="cmp-product-list">
      <span className="cmp-product-list__accent" aria-hidden="true" />
      <div className="cmp-product-list__header">
        <div className="cmp-product-list__title-group">
          <span className="cmp-product-list__eyebrow">{sectionLabel}</span>
          <div className="cmp-product-list__heading-row">
            <h2 className="cmp-product-list__heading">{heading}</h2>
            {products.length > 0 && (
              <span className="cmp-product-list__count">
                {selectedCount} of {products.length} {countLabel}
              </span>
            )}
          </div>
        </div>

        {showFilters && products.length > 0 && (
          <div className="cmp-product-list__filters" role="group" aria-label="Filter products">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                className={`cmp-product-list__chip${activeFilter === f.value ? ' cmp-product-list__chip--active' : ''}`}
                aria-pressed={activeFilter === f.value}
                onClick={() => setActiveFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {visibleProducts.length > 0 ? (
        <ul className="cmp-product-list__grid">
          {visibleProducts.map((product) => (
            <li key={product.id} className="cmp-product-list__item">
              <ProductCard
                pageData={{
                  productName: product.name || 'Unnamed Product',
                  description: product.description,
                  category: product.category,
                  ctaLabel,
                  ctaLink: product.link,
                  favoriteLabel: `In ${heading}`,
                }}
                dynamicData={{
                  isFavorite: product.isSelected,
                  isHighlighted: product.isHighlighted,
                }}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="cmp-product-list__empty">{emptyMessage}</div>
      )}
    </section>
  );
};

export default ProductList;
