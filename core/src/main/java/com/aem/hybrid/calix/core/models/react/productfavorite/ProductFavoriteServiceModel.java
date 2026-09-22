package com.aem.hybrid.calix.core.models.react.productfavorite;

import com.aem.hybrid.calix.core.services.GenericStructureServiceModel;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.jackrabbit.api.security.user.Authorizable;
import org.apache.jackrabbit.api.security.user.UserManager;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;


@Model(
        adaptables = SlingHttpServletRequest.class,
        adapters = GenericStructureServiceModel.class,
        resourceType = "aem-hybrid-calix/components/react/product-favorite",
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class ProductFavoriteServiceModel implements GenericStructureServiceModel {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProductFavoriteServiceModel.class);
    private static final String ANONYMOUS = "anonymous";
    private static final String PROFILE_PROP = "myProducts";

    @Self
    private SlingHttpServletRequest request;

    @SlingObject
    private Resource resource;

    @JsonProperty("productPath")
    private String productPath = "";

    @JsonProperty("isFavorite")
    private boolean isFavorite = false;

    @JsonProperty("userId")
    private String userId = ANONYMOUS;

    @JsonProperty("endpoint")
    private String endpoint = "/bin/aem-hybrid-calix/favorite";

    @PostConstruct
    protected void init() {
        try {
            ResourceResolver resolver = request.getResourceResolver();
            userId = resolver.getUserID();

            PageManager pm = resolver.adaptTo(PageManager.class);
            Page page = (pm != null && resource != null) ? pm.getContainingPage(resource) : null;
            productPath = (page != null) ? page.getPath() : "";

            if (userId == null || ANONYMOUS.equals(userId) || productPath.isEmpty()) {
                return;
            }

            UserManager userManager = resolver.adaptTo(UserManager.class);
            Authorizable auth = (userManager != null) ? userManager.getAuthorizable(userId) : null;
            String userPath = (auth != null) ? auth.getPath() : null;
            Resource profile = (userPath != null) ? resolver.getResource(userPath + "/profile") : null;
            if (profile == null) return;

            ValueMap vm = profile.getValueMap();
            String[] arr = vm.get(PROFILE_PROP, String[].class);
            if (arr == null) {
                String single = vm.get(PROFILE_PROP, String.class);
                arr = (single != null && !single.isEmpty()) ? new String[]{single} : new String[0];
            }
            Set<String> set = new HashSet<>(Arrays.asList(arr));
            isFavorite = set.contains(productPath);
        } catch (Exception e) {
            LOGGER.warn("ProductFavoriteServiceModel - error resolving favorite state", e);
        }
    }

    @Override
    public Object exportComponent(Resource resource) {
        Map<String, Object> result = new HashMap<>();
        result.put("productPath", productPath);
        result.put("isFavorite", isFavorite);
        result.put("userId", userId);
        result.put("endpoint", endpoint);
        return result;
    }

    @Override
    public boolean isReact() {
        return true;
    }
}
