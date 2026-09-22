package com.aem.hybrid.calix.core.models.site;

import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(adaptables = Resource.class, resourceType = HeaderModel.RESOURCE_TYPE,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class HeaderModel {

    public static final String RESOURCE_TYPE = "aem-hybrid-calix/components/header";

    static final String DEFAULT_LOGO = "/content/dam/aem-hybrid-calix/calix-logo.svg";

    @ValueMapValue
    private String logo;

    @ValueMapValue
    private String alt;

    @ValueMapValue
    private String accessibilityLabel;

    @ValueMapValue
    private String aspectRatio;

    @ValueMapValue
    private String homeUrl;

    @SlingObject
    private ResourceResolver resourceResolver;

    public String getLogo() {
        return StringUtils.defaultIfBlank(logo, DEFAULT_LOGO);
    }

    public String getAlt() {
        return StringUtils.defaultIfBlank(alt, "Calix");
    }

    public String getAccessibilityLabel() {
        return StringUtils.defaultIfBlank(accessibilityLabel, "Calix home");
    }

    public String getAspectRatio() {
        return StringUtils.defaultIfBlank(aspectRatio, "4/1");
    }

    public String getHomeUrl() {
        return StringUtils.defaultIfBlank(LinkUtils.resolveLink(resourceResolver, homeUrl), "/");
    }
}
