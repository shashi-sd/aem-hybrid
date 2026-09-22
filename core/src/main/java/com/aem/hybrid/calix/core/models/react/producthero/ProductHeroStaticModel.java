package com.aem.hybrid.calix.core.models.react.producthero;

import com.aem.hybrid.calix.core.services.GenericStructureBaseModel;
import com.aem.hybrid.calix.core.services.ResourceStructureSerializer;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


@Model(
        adaptables = Resource.class,
        adapters = GenericStructureBaseModel.class,
        resourceType = ProductHeroStaticModel.RESOURCE_TYPE,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class ProductHeroStaticModel implements GenericStructureBaseModel {

    static final String RESOURCE_TYPE = "aem-hybrid-calix/components/react/product-hero";
    private static final int DEFAULT_START_LEVEL = 3;

    @Override
    public Object export(Resource resource) {
        Map<String, Object> data = ResourceStructureSerializer.serialize(resource);
        if (data == null) {
            data = new LinkedHashMap<>();
        }

        PageManager pageManager = resource.getResourceResolver().adaptTo(PageManager.class);
        Page page = pageManager != null ? pageManager.getContainingPage(resource) : null;
        if (page == null) {
            return data;
        }

        data.put("pageTitle", pageTitle(page));

        int startLevel = DEFAULT_START_LEVEL;
        Object configured = data.get("breadcrumbStartLevel");
        if (configured != null && String.valueOf(configured).matches("\\d+")) {
            startLevel = Integer.parseInt(String.valueOf(configured));
        }
        String homeLabel = data.get("breadcrumbHomeLabel") != null ? String.valueOf(data.get("breadcrumbHomeLabel")) : "";

        List<Map<String, String>> breadcrumbs = new ArrayList<>();
        int depth = page.getDepth();
        for (int level = startLevel; level < depth; level++) {
            Page crumb = page.getAbsoluteParent(level);
            if (crumb == null) {
                continue;
            }
            Map<String, String> item = new LinkedHashMap<>();
            String title = breadcrumbs.isEmpty() && isNotBlank(homeLabel) ? homeLabel : pageTitle(crumb);
            item.put("title", title);
            item.put("path", crumb.getPath());
            breadcrumbs.add(item);
        }
        data.put("breadcrumbs", breadcrumbs);
        return data;
    }

    private static String pageTitle(Page page) {
        if (isNotBlank(page.getNavigationTitle())) {
            return page.getNavigationTitle();
        }
        if (isNotBlank(page.getPageTitle())) {
            return page.getPageTitle();
        }
        if (isNotBlank(page.getTitle())) {
            return page.getTitle();
        }
        return page.getName();
    }

    private static boolean isNotBlank(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
