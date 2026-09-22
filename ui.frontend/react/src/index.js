import { COMPONENTS, preloadComponent } from "./utils/componentRegistry";
import { getComponentPropsMap } from "./utils/extractComponentProps";
import { loadPageData, loadServiceData } from "./utils/dataLoader";
import { renderReactComponent } from "./utils/renderUtils";
import { isAuthorMode } from "./utils/isAuthorMode";
import "./main.scss";

const getJsonUrlFromLocation = () => {
  const { pathname } = window.location;
  return (
    window.location.origin +
    pathname.replace(/\.html.*/, ".pagedata.json")
  );
};

const isLocalDev = window.location.port === "3000";
const jsonUrl = getJsonUrlFromLocation();
const serviceUrl = jsonUrl.replace(".pagedata.json", ".servicedata.json");

const initialDataPromise = Promise.all([
  loadPageData(isLocalDev, jsonUrl),
  loadServiceData(isLocalDev, serviceUrl),
]);

const fetchFreshData = () => {
  const fetchOptions = { cache: "no-store" };
  return Promise.all([
    loadPageData(isLocalDev, jsonUrl, fetchOptions),
    loadServiceData(isLocalDev, serviceUrl, fetchOptions),
  ]);
};

const getReactElements = (scope) =>
  scope.matches?.(".react-component")
    ? [scope]
    : Array.from(scope.querySelectorAll?.(".react-component") || []);

const preloadChunks = (elements) => {
  if (typeof preloadComponent !== "function") return;
  new Set(elements.map((el) => el.getAttribute("data-component"))).forEach(
    (type) => preloadComponent(type)
  );
};

const renderElements = (elements, [pageData, serviceData]) => {
  const componentPropsMap = getComponentPropsMap(pageData?.components || []);
  const serviceComponents = serviceData?.components || [];

  elements.forEach((element) => {
    const componentType = element.getAttribute("data-component");
    const componentId = element.getAttribute("data-component-id");

    const Component = COMPONENTS[componentType];

    if (!Component) {
      console.warn(`No React component found for ${componentType}`);
      return;
    }

    let props = componentPropsMap[componentId];
    if (!props) {
      console.warn(`No props found for componentId ${componentId}`);
      props = {};
    }

    const serviceDataForComponent = serviceComponents.find(
      (sc) => sc.componentId === componentId
    );

    const finalProps = {
      ...props,
      pageData: props,
      dynamicData: serviceDataForComponent?.data || null,
      serviceData: serviceDataForComponent?.data || null,
    };

    renderReactComponent(Component, element, finalProps, componentId);
  });
};

const mountReactComponents = async (scope = document, { forceFresh = false } = {}) => {
  const elements = getReactElements(scope);
  if (!elements.length) return;

  preloadChunks(elements);
  const data = forceFresh ? await fetchFreshData() : await initialDataPromise;
  renderElements(elements, data);
};

const pendingElements = new Set();
let flushTimer = null;

const flushPendingMounts = async () => {
  flushTimer = null;
  const elements = Array.from(pendingElements);
  pendingElements.clear();
  if (!elements.length) return;

  preloadChunks(elements);
  const data = await fetchFreshData();
  renderElements(elements.filter((el) => el.isConnected !== false), data);
};

const scheduleMount = (element) => {
  if (!element) return;
  pendingElements.add(element);
  if (!flushTimer) flushTimer = setTimeout(flushPendingMounts, 0);
};

const unmountRemoved = (node) => {
  const roots = node.__reactRoot ? [node] : [];
  node.querySelectorAll?.(".react-component").forEach((el) => {
    if (el.__reactRoot) roots.push(el);
  });
  roots.forEach((el) => {
    setTimeout(() => {
      if (el.isConnected) return;
      try {
        el.__reactRoot.unmount();
      } catch (e) {
      }
      delete el.__reactRoot;
    }, 0);
  });
};

const initAuthorRefresh = () => {
  document.addEventListener("foundation-contentloaded", (event) => {
    const target = event.target;
    if (!target || target === document) return;
    getReactElements(target).forEach(scheduleMount);
  });

  if (typeof MutationObserver === "undefined") return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        getReactElements(node)
          .filter((el) => !el.__reactRoot)
          .forEach(scheduleMount);
      });
      mutation.removedNodes.forEach((node) => {
        if (node instanceof HTMLElement) unmountRemoved(node);
      });
    });
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });
};

const boot = () => {
  const initial = mountReactComponents();
  if (isAuthorMode()) {
    Promise.resolve(initial).finally(initAuthorRefresh);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
