import { lazy } from "react";

const once = (loader) => {
  let promise;
  return () => {
    if (!promise) promise = loader();
    return promise;
  };
};

const LOADERS = {
  "aem-hybrid-calix/components/react/network-dashboard": once(() =>
    import("../component/NetworkDashboard/NetworkDashboard")
  ),
  "aem-hybrid-calix/components/react/product-favorite": once(() =>
    import("../component/ProductFavorite/ProductFavorite")
  ),
  "aem-hybrid-calix/components/react/product-hero": once(() =>
    import("../component/ProductHero/ProductHero")
  ),
  "aem-hybrid-calix/components/react/product-list": once(() =>
    import("../component/ProductList/ProductList")
  ),
  "aem-hybrid-calix/components/react/profile-card": once(() =>
    import("../component/ProfileCard/ProfileCard")
  ),
};

export const COMPONENTS = Object.fromEntries(
  Object.entries(LOADERS).map(([type, load]) => [type, lazy(load)])
);

export const preloadComponent = (type) => {
  const load = LOADERS[type];
  return load ? load().catch(() => null) : Promise.resolve(null);
};
