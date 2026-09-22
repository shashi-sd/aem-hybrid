/**
 * @jest-environment jsdom
 */

import { isAuthorMode } from '../../utils/isAuthorMode';

describe('isAuthorMode', () => {
  const setUrl = (url) => window.history.pushState({}, '', url);

  afterEach(() => setUrl('/'));

  test('is true for wcmmode=edit and wcmmode=preview', () => {
    setUrl('/content/page.html?wcmmode=edit');
    expect(isAuthorMode()).toBe(true);
    setUrl('/content/page.html?wcmmode=preview');
    expect(isAuthorMode()).toBe(true);
  });

  test('is true inside the AEM editor', () => {
    setUrl('/editor.html/content/page.html');
    expect(isAuthorMode()).toBe(true);
  });

  test('is false on a regular publish page', () => {
    setUrl('/content/page.html?wcmmode=disabled');
    expect(isAuthorMode()).toBe(false);
  });

  test('is true inside the editor ContentFrame (wcmmode cookie, plain URL)', () => {
    setUrl('/content/page.html');
    document.cookie = 'wcmmode=edit; path=/';
    expect(isAuthorMode()).toBe(true);
    document.cookie = 'wcmmode=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    expect(isAuthorMode()).toBe(false);
  });
});
