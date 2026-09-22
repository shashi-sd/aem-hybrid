/**
 * @jest-environment jsdom
 */

import { renderReactComponent } from '../utils/renderUtils';
import { loadPageData, loadServiceData } from '../utils/dataLoader';
import { preloadComponent } from '../utils/componentRegistry';
import { isAuthorMode } from '../utils/isAuthorMode';

jest.mock('../utils/renderUtils', () => ({ renderReactComponent: jest.fn() }));
jest.mock('../utils/dataLoader', () => ({
  loadPageData: jest.fn(),
  loadServiceData: jest.fn(),
}));
jest.mock('../utils/componentRegistry', () => ({
  COMPONENTS: {
    'aem-hybrid-calix/components/react/profile-card': 'ProfileCardStub',
  },
  preloadComponent: jest.fn(() => Promise.resolve()),
}));
jest.mock('../utils/isAuthorMode', () => ({ isAuthorMode: jest.fn(() => false) }));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('React entry point (index.js)', () => {
  let domReadyListeners = [];

  beforeEach(() => {
    jest.clearAllMocks();
    domReadyListeners = [];
    const addListener = document.addEventListener.bind(document);
    jest.spyOn(document, 'addEventListener').mockImplementation((type, listener, options) => {
      if (type === 'DOMContentLoaded') domReadyListeners.push(listener);
      addListener(type, listener, options);
    });
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    document.body.innerHTML = `
      <div class="react-component"
           data-component="aem-hybrid-calix/components/react/profile-card"
           data-component-id="profilecard"></div>
      <div class="react-component"
           data-component="aem-hybrid-calix/components/react/profile-card"
           data-component-id="no-data"></div>
      <div class="react-component"
           data-component="aem-hybrid-calix/components/react/not-registered"
           data-component-id="unknown"></div>
    `;

    loadPageData.mockResolvedValue({
      components: [
        {
          resourceType: 'aem-hybrid-calix/components/react/profile-card',
          componentId: 'profilecard',
          isReact: true,
          data: { greetingPrefix: 'Hi' },
        },
      ],
    });
    loadServiceData.mockResolvedValue({
      components: [{ componentId: 'profilecard', data: { user: { firstName: 'Jane' } } }],
    });

  });

  const loadEntry = (readyState) => {
    const spy = jest.spyOn(document, 'readyState', 'get').mockReturnValue(readyState);
    jest.isolateModules(() => {
      require('../index');
    });
    spy.mockRestore();
  };

  afterEach(() => {
    domReadyListeners.forEach((listener) => document.removeEventListener('DOMContentLoaded', listener));
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  test('mounts immediately when the async bundle runs after DOMContentLoaded', async () => {
    loadEntry('complete');
    await flushPromises();
    expect(renderReactComponent).toHaveBeenCalledTimes(2);
  });

  test('waits for DOMContentLoaded while the document is still loading', async () => {
    loadEntry('loading');
    await flushPromises();
    expect(renderReactComponent).not.toHaveBeenCalled();

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();
    expect(renderReactComponent).toHaveBeenCalledTimes(2);
  });

  test('loads page + service data and renders registered components with merged props', async () => {
    loadEntry('loading');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    expect(loadPageData).toHaveBeenCalledWith(false, expect.stringMatching(/\.pagedata\.json$|^http:\/\/localhost\/?$/));
    expect(loadServiceData).toHaveBeenCalled();

    expect(renderReactComponent).toHaveBeenCalledTimes(2);

    const [Component, element, props, componentId] = renderReactComponent.mock.calls[0];
    expect(Component).toBe('ProfileCardStub');
    expect(element.getAttribute('data-component-id')).toBe('profilecard');
    expect(componentId).toBe('profilecard');
    expect(props.pageData).toEqual({
      greetingPrefix: 'Hi',
      componentId: 'profilecard',
      resourceType: 'aem-hybrid-calix/components/react/profile-card',
    });
    expect(props.greetingPrefix).toBe('Hi');
    expect(props.dynamicData).toEqual({ user: { firstName: 'Jane' } });
    expect(props.serviceData).toEqual({ user: { firstName: 'Jane' } });
  });

  test('renders with empty props when no page data exists and skips unregistered components', async () => {
    loadEntry('loading');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    const [, , props, componentId] = renderReactComponent.mock.calls[1];
    expect(componentId).toBe('no-data');
    expect(props.pageData).toEqual({});
    expect(props.dynamicData).toBeNull();

    expect(console.warn).toHaveBeenCalledWith('No props found for componentId no-data');
    expect(console.warn).toHaveBeenCalledWith(
      'No React component found for aem-hybrid-calix/components/react/not-registered'
    );
  });

  test('starts data fetch on bundle eval and preloads chunks before data resolves', async () => {
    loadEntry('loading');
    expect(loadPageData).toHaveBeenCalledTimes(1);
    expect(loadServiceData).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(preloadComponent).toHaveBeenCalledWith('aem-hybrid-calix/components/react/profile-card');
    await flushPromises();
    expect(renderReactComponent).toHaveBeenCalledTimes(2);
  });

  test('author: batches refreshed components into one fresh data fetch', async () => {
    isAuthorMode.mockReturnValue(true);
    loadEntry('complete');
    await flushPromises();
    renderReactComponent.mockClear();
    loadPageData.mockClear();
    loadServiceData.mockClear();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="react-component" data-component="aem-hybrid-calix/components/react/profile-card" data-component-id="profilecard"></div>
      <div class="react-component" data-component="aem-hybrid-calix/components/react/profile-card" data-component-id="no-data"></div>`;
    document.body.appendChild(wrapper);
    wrapper.dispatchEvent(new Event('foundation-contentloaded', { bubbles: true }));

    await flushPromises();
    await flushPromises();
    expect(loadPageData).toHaveBeenCalledTimes(1);
    expect(loadPageData).toHaveBeenCalledWith(false, expect.any(String), { cache: 'no-store' });
    expect(loadServiceData).toHaveBeenCalledTimes(1);
    expect(renderReactComponent).toHaveBeenCalledTimes(2);
    isAuthorMode.mockReturnValue(false);
  });
});
