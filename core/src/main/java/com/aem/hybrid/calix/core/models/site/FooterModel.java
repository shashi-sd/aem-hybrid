package com.aem.hybrid.calix.core.models.site;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(adaptables = Resource.class, resourceType = FooterModel.RESOURCE_TYPE,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class FooterModel {

    public static final String RESOURCE_TYPE = "aem-hybrid-calix/components/footer";

    static final String DEFAULT_LOGO = "/content/dam/aem-hybrid-calix/calix-logo.svg";

    @ValueMapValue
    private String logo;

    @ValueMapValue
    private String logoAlt;

    @ValueMapValue
    private String copyright;

    @ChildResource
    private List<LinkItem> bottomLinks;

    public String getLogo() {
        return StringUtils.defaultIfBlank(logo, DEFAULT_LOGO);
    }

    public String getLogoAlt() {
        return StringUtils.defaultIfBlank(logoAlt, "Calix");
    }

    public String getCopyright() {
        return copyright;
    }

    public List<LinkItem> getBottomLinks() {
        return bottomLinks;
    }
}
