export const isAuthorMode = () => {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("wcmmode");
  if (mode === "edit" || mode === "preview") return true;
  if (mode === "disabled") return false;

  if (
    window.location.hostname.includes("author") ||
    window.location.pathname.includes("/editor.html")
  ) {
    return true;
  }

  try {
    if (
      window.parent &&
      window.parent !== window &&
      window.parent.location.pathname.includes("/editor.html")
    ) {
      return true;
    }
  } catch (e) {
  }

  if (/(?:^|;\s*)wcmmode=(edit|preview)(?:;|$)/.test(document.cookie || "")) {
    return true;
  }

  return false;
};
