export async function loadPageData (isLocalDev, jsonUrl, options = {}) {
  try {
    if (isLocalDev) {
      const response = await fetch("/mock/page-data.json");
      if (!response.ok) throw new Error("Failed to load mock page data");
      return await response.json();
    } else {
      const response = await fetch(jsonUrl, options);
      if (!response.ok) throw new Error("Failed to load page data");
      return await response.json();
    }
  } catch (err) {
    console.error("Error loading page data:", err);
    return {};
  }
}

export async function loadServiceData (isLocalDev, serviceUrl, options = {}) {
  try {
    if (isLocalDev) {
      const response = await fetch("/mock/service-data.json");
      if (!response.ok) throw new Error("Failed to load mock service data");
      return await response.json();
    } else {
      const response = await fetch(serviceUrl, options);
      if (response.ok) {
        return await response.json();
      }
      return {};
    }
  } catch (err) {
    console.error("Error loading service data:", err);
    return {};
  }
}
