/**
 * @jest-environment jsdom
 */

import { mountWhenVisible } from '../../utils/mountWhenVisible';

describe('mountWhenVisible', () => {
  let observerCallback;
  let observerOptions;
  const observe = jest.fn();
  const disconnect = jest.fn();

  beforeEach(() => {
    global.IntersectionObserver = jest.fn((cb, options) => {
      observerCallback = cb;
      observerOptions = options;
      return { observe, disconnect };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete global.IntersectionObserver;
  });

  test('observes the element with default options', () => {
    const el = document.createElement('div');
    mountWhenVisible(el, jest.fn());
    expect(observe).toHaveBeenCalledWith(el);
    expect(observerOptions).toEqual({ rootMargin: '150px', threshold: 0.1 });
  });

  test('calls onVisible once and disconnects when intersecting', () => {
    const onVisible = jest.fn();
    mountWhenVisible(document.createElement('div'), onVisible);

    observerCallback([{ isIntersecting: false }]);
    expect(onVisible).not.toHaveBeenCalled();

    observerCallback([{ isIntersecting: true }]);
    expect(disconnect).toHaveBeenCalled();
    expect(onVisible).toHaveBeenCalledTimes(1);
  });

  test('allows overriding observer options', () => {
    mountWhenVisible(document.createElement('div'), jest.fn(), { rootMargin: '0px' });
    expect(observerOptions.rootMargin).toBe('0px');
  });
});
