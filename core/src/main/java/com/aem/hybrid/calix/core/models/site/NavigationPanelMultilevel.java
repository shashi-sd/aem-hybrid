package com.aem.hybrid.calix.core.models.site;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(adaptables = Resource.class, resourceType = NavigationPanelMultilevel.RESOURCE_TYPE,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class NavigationPanelMultilevel {

    public static final String RESOURCE_TYPE = "aem-hybrid-calix/components/navigation-panel-multi";

    @ValueMapValue(name = "cq:panelTitle")
    private String panelTitle;

    @ChildResource
    private NavigationSection first;

    @ChildResource
    private List<NavigationSection> mainLinks;

    @ChildResource
    private List<NavigationLink> bottomLinks;

    public String getPanelTitle() {
        return panelTitle;
    }

    public NavigationSection getFirst() {
        return first;
    }

    public List<NavigationSection> getMainLinks() {
        return mainLinks;
    }

    public List<NavigationLink> getBottomLinks() {
        return bottomLinks;
    }

    public boolean isEmpty() {
        return StringUtils.isBlank(panelTitle) && (mainLinks == null || mainLinks.isEmpty());
    }
}
