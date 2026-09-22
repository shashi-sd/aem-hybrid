/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductCard from '../../../component/ProductCard/ProductCard';

describe('ProductCard Component', () => {
  const pageData = {
    category: 'Broadband',
    productName: 'E7-2 System',
    description: 'Manage node deployments, system health and provisioned subscriber bands.',
    ctaLabel: 'Launch Dashboard',
    ctaLink: '/content/products/e7-2.html',
  };

  describe('Rendering', () => {
    test('renders badge, title, description and CTA link', () => {
      const { container } = render(<ProductCard pageData={pageData} />);
      expect(container.querySelector('.cmp-product-card__badge')).toHaveTextContent('Broadband');
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('E7-2 System');
      expect(screen.getByText(pageData.description)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Launch Dashboard' })).toHaveAttribute('href', pageData.ctaLink);
    });

    test('uses the default CTA label and a configurable heading level', () => {
      const { ctaLabel, ...rest } = pageData;
      render(<ProductCard pageData={rest} headingTag="h4" />);
      expect(screen.getByRole('link', { name: 'Launch Dashboard' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('E7-2 System');
    });

    test('omits badge, description and link when not authored', () => {
      const { container } = render(<ProductCard pageData={{ productName: 'C7 System' }} />);
      expect(container.querySelector('.cmp-product-card__badge')).not.toBeInTheDocument();
      expect(container.querySelector('.cmp-product-card__description')).not.toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    test('renders without any props', () => {
      const { container } = render(<ProductCard />);
      expect(container.querySelector('.cmp-product-card')).toBeInTheDocument();
    });
  });

  describe('Live state', () => {
    test('default card shows the info status and no favorite star', () => {
      const { container } = render(<ProductCard pageData={pageData} />);
      expect(container.querySelector('.cmp-product-card--highlighted')).not.toBeInTheDocument();
      expect(container.querySelector('.cmp-product-card__status path').getAttribute('stroke')).toBe('#94A3B8');
      expect(container.querySelector('.cmp-product-card__favorite')).not.toBeInTheDocument();
    });

    test('isFavorite shows the star with an accessible label', () => {
      render(<ProductCard pageData={pageData} dynamicData={{ isFavorite: true }} />);
      expect(screen.getByRole('img', { name: 'In My Products' })).toBeInTheDocument();
    });

    test('isHighlighted switches to the highlighted variant with the check status', () => {
      const { container } = render(<ProductCard pageData={pageData} dynamicData={{ isHighlighted: true }} />);
      expect(container.querySelector('.cmp-product-card--highlighted')).toBeInTheDocument();
      expect(container.querySelector('.cmp-product-card__status path').getAttribute('stroke')).toBe('#FF6D11');
    });

    test('accepts serviceData as an alias for dynamicData', () => {
      render(<ProductCard pageData={pageData} serviceData={{ isFavorite: true }} />);
      expect(screen.getByRole('img', { name: 'In My Products' })).toBeInTheDocument();
    });
  });
});
