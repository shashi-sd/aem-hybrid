import { getComponentPropsMap } from '../../utils/extractComponentProps';

describe('getComponentPropsMap', () => {
  test('maps React components by componentId and merges identity fields', () => {
    const map = getComponentPropsMap([
      { resourceType: 'app/react/a', componentId: 'a', isReact: true, data: { title: 'A' } },
      { resourceType: 'app/htl/b', componentId: 'b', isReact: false, data: { title: 'B' } },
    ]);

    expect(map).toEqual({
      a: { title: 'A', componentId: 'a', resourceType: 'app/react/a' },
    });
  });

  test('returns an empty map by default', () => {
    expect(getComponentPropsMap()).toEqual({});
  });
});
