/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import ProductHero from '../../../component/ProductHero/ProductHero';

describe('ProductHero Component', () => {
  const pageData = {
    pageTitle: 'E7-2 System',
    eyebrow: 'Enterprise Access Node',
    description: 'Scalable Ethernet access in a 2RU chassis.',
    breadcrumbs: [
      { title: 'Portal', path: '/content/aem-hybrid-calix/us/en' },
      { title: 'Products', path: '/content/aem-hybrid-calix/us/en/products' },
      { title: 'E7-2 System', path: '/content/aem-hybrid-calix/us/en/products/e7-2-system' },
    ],
    ctaText: 'Access Calix Cloud Dashboard',
    ctaLink: '/content/aem-hybrid-calix/us/en/products/calix-cloud',
    ctaIcon: 'download',
    image: '/content/dam/aem-hybrid-calix/e7-2.jpg',
    imageAlt: 'E7-2 chassis',
    imageBadge: '2RU Compact Hardware',
    imageCaptionTitle: 'Calix E7-2 Chassis Architecture',
    imageCaptionSubtitle: 'Engineered for high density deployments',
    addLabel: 'Add to My Products',
  };

  const dynamicData = {
    productPath: '/content/aem-hybrid-calix/us/en/products/e7-2-system',
    isFavorite: false,
    userId: 'admin',
  };

  describe('Rendering', () => {
    test('renders badge, title (page title fallback) and description', () => {
      render(<ProductHero pageData={pageData} dynamicData={dynamicData} />);
      expect(screen.getByText('Enterprise Access Node')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('E7-2 System');
      expect(screen.getByText(pageData.description)).toBeInTheDocument();
    });

    test('authored title overrides the page title', () => {
      render(<ProductHero pageData={{ ...pageData, title: 'E7-2 Access Node' }} />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('E7-2 Access Node');
    });

    test('renders breadcrumbs with links and the current page as text', () => {
      render(<ProductHero pageData={pageData} dynamicData={dynamicData} />);
      const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
      expect(within(nav).getByRole('link', { name: 'Portal' })).toHaveAttribute('href', '/content/aem-hybrid-calix/us/en.html');
      expect(within(nav).getByRole('link', { name: 'Products' })).toBeInTheDocument();
      expect(within(nav).getByText('E7-2 System')).toHaveAttribute('aria-current', 'page');
      expect(nav.querySelectorAll('.cmp-product-hero__breadcrumb-separator')).toHaveLength(2);
    });

    test('hides breadcrumbs when showBreadcrumbs is false (boolean or string)', () => {
      const { rerender } = render(<ProductHero pageData={{ ...pageData, showBreadcrumbs: false }} />);
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      rerender(<ProductHero pageData={{ ...pageData, showBreadcrumbs: 'false' }} />);
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    test('renders primary CTA with .html link and download icon', () => {
      const { container } = render(<ProductHero pageData={pageData} dynamicData={dynamicData} />);
      const cta = screen.getByRole('link', { name: 'Access Calix Cloud Dashboard' });
      expect(cta).toHaveAttribute('href', '/content/aem-hybrid-calix/us/en/products/calix-cloud.html');
      expect(container.querySelector('.cmp-product-hero__cta-icon')).toBeInTheDocument();
    });

    test('renders media image, badge and caption', () => {
      const { container } = render(<ProductHero pageData={pageData} />);
      expect(screen.getByRole('img', { name: 'E7-2 chassis' })).toHaveAttribute('src', pageData.image);
      expect(container.querySelector('.cmp-product-hero__media-badge')).toHaveTextContent('2RU Compact Hardware');
      expect(screen.getByText('Calix E7-2 Chassis Architecture')).toBeInTheDocument();
    });

    test('hides the caption when no image is authored', () => {
      const { image, ...noImage } = pageData;
      render(<ProductHero pageData={noImage} />);
      expect(screen.queryByText('Calix E7-2 Chassis Architecture')).not.toBeInTheDocument();
    });

    test('renders without props', () => {
      const { container } = render(<ProductHero />);
      expect(container.querySelector('.cmp-product-hero')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('Add to My Products (React ProductFavorite)', () => {
    test('shows the favorite button for a logged-in user', () => {
      render(<ProductHero pageData={pageData} dynamicData={dynamicData} />);
      expect(screen.getByRole('button', { name: 'Add to My Products' })).toHaveAttribute('aria-pressed', 'false');
    });

    test('shows the saved state from service data (serviceData alias)', () => {
      render(<ProductHero pageData={{ ...pageData, removeLabel: 'In My Products' }} serviceData={{ ...dynamicData, isFavorite: true }} />);
      expect(screen.getByRole('button', { name: 'In My Products' })).toHaveAttribute('aria-pressed', 'true');
    });

    test('can be turned off from the dialog', () => {
      render(<ProductHero pageData={{ ...pageData, showFavorite: 'false' }} dynamicData={dynamicData} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
