package com.aem.hybrid.calix.core.models.site;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(adaptables = Resource.class, defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class NavigationLink extends LinkItem {

    @ValueMapValue
    private String fragmentVariationPath;

    @ValueMapValue
    private String description;

    public String getFragmentVariationPath() {
        return fragmentVariationPath;
    }

    public String getDescription() {
        return description;
    }
}
