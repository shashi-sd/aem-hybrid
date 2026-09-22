/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import LazyErrorBoundary from '../../utils/LazyErrorBoundary';

describe('LazyErrorBoundary', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  test('renders children when there is no error', () => {
    render(<LazyErrorBoundary><p>content</p></LazyErrorBoundary>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  test('renders fallback when a child throws', () => {
    const Broken = () => { throw new Error('boom'); };
    render(<LazyErrorBoundary><Broken /></LazyErrorBoundary>);
    expect(screen.getByText('Component failed to load')).toBeInTheDocument();
  });
});
