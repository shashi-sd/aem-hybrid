package com.aem.hybrid.calix.core.models.site;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(adaptables = Resource.class, resourceType = FooterColumnModel.RESOURCE_TYPE,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class FooterColumnModel {

    public static final String RESOURCE_TYPE = "aem-hybrid-calix/components/footer-column-item";

    @ValueMapValue
    private String title;

    @ChildResource
    private List<LinkItem> links;

    @ChildResource
    private List<LinkItem> icons;

    public String getTitle() {
        return title;
    }

    public List<LinkItem> getLinks() {
        return links;
    }

    public List<LinkItem> getIcons() {
        return icons;
    }

    public boolean isEmpty() {
        return StringUtils.isBlank(title) && (links == null || links.isEmpty()) && (icons == null || icons.isEmpty());
    }
}
