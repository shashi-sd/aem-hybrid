/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductFavorite from '../../../component/ProductFavorite/ProductFavorite';

describe('ProductFavorite Component', () => {
  const pageData = {
    addLabel: 'Save product',
    removeLabel: 'Saved',
    loginMessage: 'Log in first',
  };

  const dynamicData = {
    productPath: '/content/products/gp-1100',
    isFavorite: false,
    userId: 'jdoe',
    endpoint: '/bin/favorite',
  };

  const jsonResponse = (body, ok = true, status = 200) =>
    Promise.resolve({ ok, status, json: () => Promise.resolve(body) });

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.fetch;
  });

  describe('Rendering', () => {
    test('renders login message for anonymous users', () => {
      render(<ProductFavorite pageData={pageData} dynamicData={{ ...dynamicData, userId: 'anonymous' }} />);
      expect(screen.getByText('Log in first')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('renders add label when not a favorite', () => {
      render(<ProductFavorite pageData={pageData} dynamicData={dynamicData} />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Save product');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    test('renders remove label when already a favorite', () => {
      render(<ProductFavorite pageData={pageData} dynamicData={{ ...dynamicData, isFavorite: true }} />);
      expect(screen.getByRole('button')).toHaveTextContent('Saved');
    });

    test('disables button when productPath is missing', () => {
      render(<ProductFavorite pageData={pageData} dynamicData={{ ...dynamicData, productPath: '' }} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Toggle', () => {
    test('fetches CSRF token, POSTs to endpoint and updates state', async () => {
      global.fetch
        .mockImplementationOnce(() => jsonResponse({ token: 'abc' }))
        .mockImplementationOnce(() => jsonResponse({ isFavorite: true }));

      render(<ProductFavorite pageData={pageData} dynamicData={dynamicData} />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('Saved'));

      expect(global.fetch).toHaveBeenNthCalledWith(1, '/libs/granite/csrf/token.json', { credentials: 'same-origin' });
      const [url, options] = global.fetch.mock.calls[1];
      expect(url).toBe('/bin/favorite');
      expect(options.method).toBe('POST');
      expect(options.headers['CSRF-Token']).toBe('abc');
      expect(options.body).toBe('productPath=%2Fcontent%2Fproducts%2Fgp-1100&action=toggle');
    });

    test('shows error message when the POST fails', async () => {
      global.fetch
        .mockImplementationOnce(() => jsonResponse({ token: 'abc' }))
        .mockImplementationOnce(() => jsonResponse({}, false, 500));

      render(<ProductFavorite pageData={pageData} dynamicData={dynamicData} />);
      fireEvent.click(screen.getByRole('button'));

      expect(await screen.findByRole('alert')).toHaveTextContent('Could not update. Please try again.');
      expect(screen.getByRole('button')).toHaveTextContent('Save product');
    });
  });
});
