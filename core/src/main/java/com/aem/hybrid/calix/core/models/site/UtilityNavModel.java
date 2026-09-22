package com.aem.hybrid.calix.core.models.site;

import java.util.List;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;

@Model(adaptables = Resource.class, resourceType = UtilityNavModel.RESOURCE_TYPE,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class UtilityNavModel {

    public static final String RESOURCE_TYPE = "aem-hybrid-calix/components/utilitynav";

    @ChildResource
    private List<LinkItem> links;

    public List<LinkItem> getLinks() {
        return links;
    }
}
