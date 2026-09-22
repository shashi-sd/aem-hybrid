package com.aem.hybrid.calix.core.models.site;

import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;

import com.day.cq.wcm.api.Page;

public final class LinkUtils {

    public static final String HTML_EXTENSION = ".html";

    private LinkUtils() {
    }

    public static String resolveLink(ResourceResolver resolver, String url) {
        if (StringUtils.isBlank(url) || resolver == null || !url.startsWith("/") || url.endsWith(HTML_EXTENSION)) {
            return url;
        }
        Resource resource = resolver.getResource(url);
        if (resource != null && resource.adaptTo(Page.class) != null) {
            return url + HTML_EXTENSION;
        }
        return url;
    }
}
