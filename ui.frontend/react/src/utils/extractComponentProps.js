export const getComponentPropsMap = (components = []) => {
  const map = {};

  components.forEach((component) => {
    if (!component.isReact) return;

    map[component.componentId] = {
      ...component.data,
      componentId: component.componentId,
      resourceType: component.resourceType
    };
  });

  return map;
};
