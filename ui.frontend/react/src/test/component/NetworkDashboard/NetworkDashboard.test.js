/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import NetworkDashboard from '../../../component/NetworkDashboard/NetworkDashboard';

describe('NetworkDashboard Component', () => {
  const pageData = {
    title: 'Ops Center',
    subtitle: 'All POPs',
    badgeLabel: 'NOW',
    accentColor: 'teal',
    ctaLabel: 'Open Console',
    ctaLink: '/console',
    footerNote: 'Refreshes every minute',
    kpiList: [
      { key: 'uptime', label: 'Uptime', unit: '%', icon: 'U' },
      { key: 'subscribers', label: 'Subscribers', unit: '', icon: 'S' },
    ],
    featureList: [{ title: 'Feature A', description: 'Desc A', icon: 'A' }],
  };

  const dynamicData = {
    health: 'degraded',
    healthLabel: 'Partial outage',
    kpis: {
      uptime: { value: 99.5, status: 'good' },
      subscribers: { value: 18423, status: 'warn' },
    },
    alerts: [{ severity: 'critical', title: 'OLT down', site: 'Denver', age: '5m' }],
    trend: [10, 20, 30],
  };

  describe('Rendering', () => {
    test('renders authored header, CTA and footer', () => {
      const { container } = render(<NetworkDashboard pageData={pageData} />);
      expect(screen.getByText('Ops Center')).toBeInTheDocument();
      expect(screen.getByText('All POPs')).toBeInTheDocument();
      expect(screen.getByText('NOW')).toBeInTheDocument();
      expect(screen.getByText('Refreshes every minute')).toBeInTheDocument();
      expect(screen.getByText(/Open Console/).closest('a')).toHaveAttribute('href', '/console');
      expect(container.querySelector('.cmp-network-dashboard--teal')).toBeInTheDocument();
    });

    test('renders defaults when no data is provided', () => {
      render(<NetworkDashboard />);
      expect(screen.getByText('Network Operations')).toBeInTheDocument();
      expect(screen.getByText('Network Uptime')).toBeInTheDocument();
      expect(screen.getByText(/Waiting for live data…/)).toBeInTheDocument();
      expect(screen.getByText('No alerts — nice.')).toBeInTheDocument();
    });
  });

  describe('Live data', () => {
    test('merges authored KPI labels with live values by key', () => {
      const { container } = render(<NetworkDashboard pageData={pageData} dynamicData={dynamicData} />);
      expect(screen.getByText('Uptime')).toBeInTheDocument();
      expect(screen.getByText('99.5%')).toBeInTheDocument();
      expect(screen.getByText((18423).toLocaleString())).toBeInTheDocument();
      expect(container.querySelector('.cmp-network-dashboard__kpi--warn')).toBeInTheDocument();
    });

    test('shows placeholder value when a KPI has no live value', () => {
      render(<NetworkDashboard pageData={pageData} dynamicData={{ kpis: {} }} />);
      expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });

    test('renders health chip and alerts', () => {
      const { container } = render(<NetworkDashboard pageData={pageData} dynamicData={dynamicData} />);
      expect(screen.getByText(/Partial outage/)).toBeInTheDocument();
      expect(container.querySelector('.cmp-network-dashboard__health-chip--degraded')).toBeInTheDocument();
      expect(screen.getByText('OLT down')).toBeInTheDocument();
      expect(screen.getByText('1 in the last hour')).toBeInTheDocument();
    });

    test('renders sparkline only with 2+ trend points', () => {
      const { container, rerender } = render(<NetworkDashboard dynamicData={dynamicData} />);
      expect(container.querySelector('.cmp-network-dashboard__sparkline')).toBeInTheDocument();
      expect(screen.getByText(/Peak 30 • Avg 20/)).toBeInTheDocument();

      rerender(<NetworkDashboard dynamicData={{ trend: [5] }} />);
      expect(container.querySelector('.cmp-network-dashboard__sparkline')).not.toBeInTheDocument();
    });

    test('accepts serviceData as an alias for dynamicData', () => {
      render(<NetworkDashboard pageData={pageData} serviceData={dynamicData} />);
      expect(screen.getByText('OLT down')).toBeInTheDocument();
    });
  });
});
