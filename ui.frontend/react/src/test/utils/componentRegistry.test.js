/**
 * @jest-environment jsdom
 */

import { COMPONENTS } from '../../utils/componentRegistry';

describe('componentRegistry', () => {
  const expectedKeys = [
    'aem-hybrid-calix/components/react/network-dashboard',
    'aem-hybrid-calix/components/react/product-favorite',
    'aem-hybrid-calix/components/react/product-hero',
    'aem-hybrid-calix/components/react/product-list',
    'aem-hybrid-calix/components/react/profile-card',
  ];

  test('registers every React component by AEM resourceType', () => {
    expect(Object.keys(COMPONENTS).sort()).toEqual(expectedKeys.sort());
  });

  test('every entry is a React.lazy component', () => {
    Object.values(COMPONENTS).forEach((Component) => {
      expect(Component.$$typeof).toBe(Symbol.for('react.lazy'));
    });
  });

  test('returns undefined for unknown resourceTypes', () => {
    expect(COMPONENTS['aem-hybrid-calix/components/react/unknown']).toBeUndefined();
  });
});
