package com.aem.hybrid.calix.core.models;

import javax.annotation.PostConstruct;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.InjectionStrategy;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

/**
 * Sling Model backing the {@code userauthcontrol} HTL component.
 *
 * IMPORTANT (dispatcher/CDN caching): this model intentionally does NOT
 * look at {@code request.getRemoteUser()} any more. Doing so would bake
 * a specific visitor's auth state into HTML that gets cached and served
 * to every subsequent visitor. Instead, this model only resolves the
 * authorable URLs/labels; the component always renders in its anonymous
 * (Login-visible) state, and the actual "Hi, &lt;user&gt;" / Logout state
 * is hydrated client-side (see ui.frontend/src/site/components/auth/auth-status.js)
 * by calling AEM's OOTB per-request session endpoint
 * {@code /system/sling/info.sessionInfo.json}, which is never dispatcher-cached.
 */
@Model(adaptables = {Resource.class, SlingHttpServletRequest.class},
        resourceType = "aem-hybrid-calix/components/userauthcontrol")
public class UserAuthControlModel {

    private static final String DEFAULT_HOME_URL = "/content/aem-hybrid-calix/us/en.html";
    private static final String DEFAULT_LOGIN_URL = "/content/aem-hybrid-calix/us/en/login.html";
    private static final String DEFAULT_LOGOUT_REDIRECT = "/content/aem-hybrid-calix/us/en/login.html";


    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "")
    private String homeUrl;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "Home")
    private String homeLabel;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "true")
    private boolean showHomeIcon;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "")
    private String loginUrl;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "Login")
    private String loginLabel;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "")
    private String logoutUrl;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "")
    private String logoutRedirectPath;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "Logout")
    private String logoutLabel;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "Hi,")
    private String greetingPrefix;

    private String resolvedHomeUrl;
    private String resolvedLoginUrl;
    private String resolvedLogoutUrl;

    @PostConstruct
    protected void init() {
        resolvedHomeUrl = defaultIfBlank(homeUrl, DEFAULT_HOME_URL);
        resolvedLoginUrl = withHtmlExtension(defaultIfBlank(loginUrl, DEFAULT_LOGIN_URL));

        if (isNotBlank(logoutUrl)) {
            resolvedLogoutUrl = logoutUrl;
        } else {
            String redirect = withHtmlExtension(defaultIfBlank(logoutRedirectPath, DEFAULT_LOGOUT_REDIRECT));
            resolvedLogoutUrl = "/system/sling/logout.html?resource=" + redirect;
        }
    }

    private static boolean isNotBlank(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private static String defaultIfBlank(String value, String fallback) {
        return isNotBlank(value) ? value : fallback;
    }

    private static String withHtmlExtension(String path) {
        if (path == null || path.isEmpty()) {
            return path;
        }

        String pathOnly = path;
        int qIdx = pathOnly.indexOf('?');
        String suffix = "";
        if (qIdx >= 0) {
            suffix = pathOnly.substring(qIdx);
            pathOnly = pathOnly.substring(0, qIdx);
        }
        int lastSlash = pathOnly.lastIndexOf('/');
        String lastSegment = pathOnly.substring(lastSlash + 1);
        if (lastSegment.contains(".")) {
            return path;
        }
        return pathOnly + ".html" + suffix;
    }


    public String getGreetingPrefix() {
        return greetingPrefix;
    }

    public boolean isShowHomeIcon() {
        return showHomeIcon;
    }

    public String getHomeUrl() {
        return resolvedHomeUrl;
    }

    public String getHomeLabel() {
        return homeLabel;
    }

    public String getLoginUrl() {
        return resolvedLoginUrl;
    }

    public String getLoginLabel() {
        return loginLabel;
    }

    public String getLogoutUrl() {
        return resolvedLogoutUrl;
    }

    public String getLogoutLabel() {
        return logoutLabel;
    }
}
