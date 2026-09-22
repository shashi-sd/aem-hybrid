/* global IntersectionObserver */
export const mountWhenVisible = (element, onVisible, options = {}) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          onVisible();
        }
      });
    },
    {
      rootMargin: "150px",
      threshold: 0.1,
      ...options,
    }
  );

  observer.observe(element);
};
