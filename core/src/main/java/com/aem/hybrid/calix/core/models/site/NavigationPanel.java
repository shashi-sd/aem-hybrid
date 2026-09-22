package com.aem.hybrid.calix.core.models.site;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(adaptables = Resource.class, resourceType = NavigationPanel.RESOURCE_TYPE,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class NavigationPanel {

    public static final String RESOURCE_TYPE = "aem-hybrid-calix/components/navigation-panel";

    @ValueMapValue(name = "cq:panelTitle")
    private String panelTitle;

    @ChildResource
    private List<NavigationSection> panels;

    @ChildResource
    private List<NavigationLink> bottomLinks;

    public String getPanelTitle() {
        return panelTitle;
    }

    public List<NavigationSection> getPanels() {
        return panels;
    }

    public List<NavigationLink> getBottomLinks() {
        return bottomLinks;
    }

    public boolean isEmpty() {
        return StringUtils.isBlank(panelTitle) && (panels == null || panels.isEmpty());
    }
}
