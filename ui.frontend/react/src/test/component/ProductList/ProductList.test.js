/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ProductList from '../../../component/ProductList/ProductList';

describe('ProductList Component', () => {
  const items = [
    { productName: 'E7-2 System', productPath: '/content/products/e7-2', productDescription: 'OLT', productCategory: 'Broadband' },
    { productName: 'E9-2 System', productPath: '/content/products/e9-2', productDescription: 'Multi-terabit', productCategory: 'Multi-Terabit' },
    { productName: 'E3-2 System', productPath: '/content/products/e3-2', productCategory: 'Broadband' },
  ];

  const pageData = {
    heading: 'My Products',
    emptyMessage: 'Nothing here',
    showFilters: true,
    products: { items },
  };

  const dynamicData = {
    products: [
      { id: '/content/products/e7-2', isSelected: true },
      { id: '/content/products/e9-2', isSelected: false },
      { id: '/content/products/e3-2', isSelected: true, isHighlighted: true },
    ],
  };

  const cards = (container) => container.querySelectorAll('.cmp-product-card');

  describe('Rendering', () => {
    test('renders heading, count badge and one ProductCard per authored product', () => {
      const { container } = render(<ProductList pageData={pageData} dynamicData={dynamicData} />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('My Products');
      expect(screen.getByText('2 of 3 Active')).toBeInTheDocument();
      expect(cards(container)).toHaveLength(3);
      expect(screen.getAllByRole('link', { name: 'Launch Dashboard' })).toHaveLength(3);
    });

    test('card links point to the product page and use the authored CTA label', () => {
      render(<ProductList pageData={{ ...pageData, ctaLabel: 'Open' }} />);
      const links = screen.getAllByRole('link', { name: 'Open' });
      expect(links[0]).toHaveAttribute('href', '/content/products/e7-2.html');
    });

    test('accepts products as a plain array', () => {
      const { container } = render(<ProductList pageData={{ ...pageData, products: items }} />);
      expect(cards(container)).toHaveLength(3);
    });

    test('renders empty message and no filters when no products are authored', () => {
      const { container } = render(<ProductList pageData={{ ...pageData, products: { items: [] } }} />);
      expect(screen.getByText('Nothing here')).toBeInTheDocument();
      expect(container.querySelector('.cmp-product-list__filters')).not.toBeInTheDocument();
    });

    test('hides filters when showFilters is false', () => {
      const { container } = render(<ProductList pageData={{ ...pageData, showFilters: false }} />);
      expect(container.querySelector('.cmp-product-list__filters')).not.toBeInTheDocument();
    });

    test('uses defaults with no props', () => {
      render(<ProductList />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('My Products');
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });
  });

  describe('Live state', () => {
    test('selected products show the favorite star, highlighted products the highlighted card', () => {
      const { container } = render(<ProductList pageData={pageData} dynamicData={dynamicData} />);
      expect(container.querySelectorAll('.cmp-product-card__favorite')).toHaveLength(2);
      expect(container.querySelectorAll('.cmp-product-card--highlighted')).toHaveLength(1);
    });

    test('accepts serviceData as an alias for dynamicData', () => {
      const { container } = render(<ProductList pageData={pageData} serviceData={dynamicData} />);
      expect(container.querySelectorAll('.cmp-product-card__favorite')).toHaveLength(2);
    });
  });

  describe('Filters', () => {
    test('renders Show All, Favorites and one chip per unique category', () => {
      render(<ProductList pageData={pageData} dynamicData={dynamicData} />);
      const group = screen.getByRole('group', { name: 'Filter products' });
      const chips = within(group).getAllByRole('button').map((b) => b.textContent);
      expect(chips).toEqual(['Show All', 'Favorites', 'Broadband', 'Multi-Terabit']);
      expect(within(group).getByRole('button', { name: 'Show All' })).toHaveAttribute('aria-pressed', 'true');
    });

    test('uses authored filterCategories instead of every product category', () => {
      render(<ProductList pageData={{ ...pageData, filterCategories: ['Broadband'] }} dynamicData={dynamicData} />);
      const group = screen.getByRole('group', { name: 'Filter products' });
      expect(within(group).getAllByRole('button').map((b) => b.textContent)).toEqual(['Show All', 'Favorites', 'Broadband']);
    });

    test('accepts filterCategories as a comma separated string', () => {
      render(<ProductList pageData={{ ...pageData, filterCategories: 'Multi-Terabit, Broadband' }} />);
      const group = screen.getByRole('group', { name: 'Filter products' });
      expect(within(group).getAllByRole('button').map((b) => b.textContent)).toEqual(['Show All', 'Favorites', 'Multi-Terabit', 'Broadband']);
    });

    test('Favorites shows only selected products; category chip filters by category; Show All resets', () => {
      const { container } = render(<ProductList pageData={pageData} dynamicData={dynamicData} />);

      fireEvent.click(screen.getByRole('button', { name: 'Favorites' }));
      expect(cards(container)).toHaveLength(2);
      expect(screen.getByRole('button', { name: 'Favorites' })).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(screen.getByRole('button', { name: 'Multi-Terabit' }));
      expect(cards(container)).toHaveLength(1);
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('E9-2 System');

      fireEvent.click(screen.getByRole('button', { name: 'Show All' }));
      expect(cards(container)).toHaveLength(3);
    });

    test('shows the empty message when a filter matches nothing', () => {
      render(<ProductList pageData={pageData} />);
      fireEvent.click(screen.getByRole('button', { name: 'Favorites' }));
      expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });

    test('uses authored filter and count labels', () => {
      render(
        <ProductList
          pageData={{ ...pageData, showAllLabel: 'All', favoritesLabel: 'Starred', countLabel: 'saved' }}
          dynamicData={dynamicData}
        />
      );
      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Starred' })).toBeInTheDocument();
      expect(screen.getByText('2 of 3 saved')).toBeInTheDocument();
    });
  });
});
