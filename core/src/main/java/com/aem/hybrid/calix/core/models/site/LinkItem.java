package com.aem.hybrid.calix.core.models.site;

import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(adaptables = Resource.class, defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class LinkItem {

    @ValueMapValue
    protected String label;

    @ValueMapValue
    protected String icon;

    @ValueMapValue
    protected String url;

    @ValueMapValue
    protected String target;

    @SlingObject
    protected ResourceResolver resourceResolver;

    public String getLabel() {
        return label;
    }

    public String getUrl() {
        return LinkUtils.resolveLink(resourceResolver, url);
    }

        public String getTarget() {
        return StringUtils.equalsAny(target, "true", "_blank") ? "_blank" : "_self";
    }

    public String getIcon() {
        return icon;
    }

    public String getIconText() {
        return StringUtils.isNotBlank(icon) ? StringUtils.capitalize(icon) : StringUtils.EMPTY;
    }
}
