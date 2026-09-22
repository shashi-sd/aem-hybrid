/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfileCard from '../../../component/ProfileCard/ProfileCard';

describe('ProfileCard Component', () => {
  const pageData = {
    sectionLabel: 'My Profile',
    greetingPrefix: 'Welcome back,',
    favoritesLabel: 'My Favorites',
    favoritesLink: '/content/aem-hybrid-calix/us/en/my-favorites',
  };

  const dynamicData = {
    user: { userId: 'admin', firstName: 'Administrator', fullName: 'Administrator Admin' },
  };

  describe('Rendering', () => {
    test('renders accent bar, eyebrow and greeting with live user name', () => {
      const { container } = render(<ProfileCard pageData={pageData} dynamicData={dynamicData} />);
      expect(container.querySelector('.cmp-profile-card__accent')).toBeInTheDocument();
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Welcome back, Administrator');
    });

    test('renders the favorites chip as a link when a link is authored', () => {
      render(<ProfileCard pageData={pageData} dynamicData={dynamicData} />);
      expect(screen.getByRole('link', { name: 'My Favorites' })).toHaveAttribute(
        'href',
        '/content/aem-hybrid-calix/us/en/my-favorites.html'
      );
    });

    test('renders the favorites chip as plain text without a link', () => {
      const { container } = render(<ProfileCard pageData={{ ...pageData, favoritesLink: '' }} />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(container.querySelector('.cmp-profile-card__favorites')).toHaveTextContent('My Favorites');
    });

    test('uses default labels and shows only the prefix without user data', () => {
      render(<ProfileCard />);
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/^Welcome back,$/);
      expect(screen.getByText('My Favorites')).toBeInTheDocument();
    });
  });

  describe('Display name fallbacks', () => {
    test('falls back to fullName, then userId', () => {
      const { rerender } = render(
        <ProfileCard pageData={pageData} dynamicData={{ user: { fullName: 'Jane Doe', userId: 'jdoe' } }} />
      );
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Welcome back, Jane Doe');

      rerender(<ProfileCard pageData={pageData} dynamicData={{ user: { userId: 'jdoe' } }} />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Welcome back, jdoe');
    });

    test('updates when serviceData changes', () => {
      const { rerender } = render(<ProfileCard pageData={pageData} dynamicData={dynamicData} />);
      rerender(<ProfileCard pageData={pageData} serviceData={{ user: { firstName: 'John' } }} />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Welcome back, John');
    });
  });
});
