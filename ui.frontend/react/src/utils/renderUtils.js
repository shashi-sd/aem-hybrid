/* eslint-disable */

import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import LazyErrorBoundary from "./LazyErrorBoundary";
import { mountWhenVisible } from "./mountWhenVisible";
import { isAuthorMode } from "./isAuthorMode";

export function renderReactComponent(Component, element, props, componentId) {
  const { key, ...restProps } = props || {};
  const finalProps = { ...restProps, dynamicData: props?.dynamicData || null };

  const existingSkeleton = element.querySelector('[class*="--skeleton"]');
  const fallbackMarkup = existingSkeleton ? existingSkeleton.outerHTML : null;

  const renderComponent = () => {
    const root = element.__reactRoot || ReactDOM.createRoot(element);
    element.__reactRoot = root;

    root.render(
      <Suspense
        fallback={
          fallbackMarkup ? (
            <div dangerouslySetInnerHTML={{ __html: fallbackMarkup }} />
          ) : null
        }
      >
        <LazyErrorBoundary>
          <Component key={componentId} {...finalProps} />
        </LazyErrorBoundary>
      </Suspense>,
    );
  };

  if (isAuthorMode()) {
    renderComponent();
  } else {
    mountWhenVisible(element, renderComponent);
  }
}
