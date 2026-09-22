package com.aem.hybrid.calix.core.models.site;

import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(adaptables = Resource.class, resourceType = NavigationFeaturedXFModel.RESOURCE_TYPE,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class NavigationFeaturedXFModel {

    public static final String RESOURCE_TYPE = "aem-hybrid-calix/components/navigation-featured-xf";

    @ValueMapValue
    private String title;

    @ValueMapValue
    private String description;

    @ValueMapValue
    private String imagePath;

    @ValueMapValue
    private String imageAlt;

    @ValueMapValue
    private String ctaLabel;

    @ValueMapValue
    private String ctaUrl;

    @ValueMapValue
    private String ctaTarget;

    @SlingObject
    private ResourceResolver resourceResolver;

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getImagePath() {
        return imagePath;
    }

    public String getImageAlt() {
        return StringUtils.defaultString(imageAlt);
    }

    public String getCtaLabel() {
        return ctaLabel;
    }

    public String getCtaUrl() {
        return LinkUtils.resolveLink(resourceResolver, ctaUrl);
    }

    public String getCtaTarget() {
        return StringUtils.equalsAny(ctaTarget, "true", "_blank") ? "_blank" : "_self";
    }

    public boolean isEmpty() {
        return StringUtils.isAllBlank(title, description);
    }
}
