/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from '@testing-library/react';
import { renderReactComponent } from '../../utils/renderUtils';
import { isAuthorMode } from '../../utils/isAuthorMode';
import { mountWhenVisible } from '../../utils/mountWhenVisible';

jest.mock('../../utils/isAuthorMode', () => ({ isAuthorMode: jest.fn() }));
jest.mock('../../utils/mountWhenVisible', () => ({ mountWhenVisible: jest.fn() }));

describe('renderReactComponent', () => {
  const Hello = ({ name, dynamicData }) => (
    <p>Hello {name} {dynamicData ? dynamicData.tag : 'no-live'}</p>
  );

  let element;

  beforeAll(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('renders immediately in author mode', async () => {
    isAuthorMode.mockReturnValue(true);

    await act(async () => {
      renderReactComponent(Hello, element, { name: 'Author', dynamicData: { tag: 'live' } }, 'hello');
    });

    expect(mountWhenVisible).not.toHaveBeenCalled();
    expect(element.textContent).toBe('Hello Author live');
  });

  test('defers rendering until visible outside author mode', async () => {
    isAuthorMode.mockReturnValue(false);

    renderReactComponent(Hello, element, { name: 'Publish' }, 'hello');
    expect(mountWhenVisible).toHaveBeenCalledWith(element, expect.any(Function));
    expect(element.textContent).toBe('');

    const [, onVisible] = mountWhenVisible.mock.calls[0];
    await act(async () => {
      onVisible();
    });

    expect(element.textContent).toBe('Hello Publish no-live');
  });
});
