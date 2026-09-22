package com.aem.hybrid.calix.core.models.site;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(adaptables = Resource.class, defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class NavigationSection {

    @ValueMapValue
    private String eyebrow;

    @ValueMapValue
    private String heading;

    @ValueMapValue
    private String url;

    @ValueMapValue
    private String target;

    @ValueMapValue
    private String fragmentVariationPath;

    @ChildResource
    private List<NavigationLink> links;

    @SlingObject
    private ResourceResolver resourceResolver;

    public String getEyebrow() {
        return eyebrow;
    }

    public String getHeading() {
        return heading;
    }

    public String getUrl() {
        return LinkUtils.resolveLink(resourceResolver, url);
    }

    public String getTarget() {
        return StringUtils.equalsAny(target, "true", "_blank") ? "_blank" : "_self";
    }

    public String getFragmentVariationPath() {
        return fragmentVariationPath;
    }

    public List<NavigationLink> getLinks() {
        return links;
    }

    public boolean isValid() {
        boolean validLabel = StringUtils.isNotBlank(eyebrow) || StringUtils.isNotBlank(heading);
        boolean validExperience = StringUtils.isNotBlank(url) || StringUtils.isNotBlank(fragmentVariationPath);
        return validLabel && validExperience;
    }
}
