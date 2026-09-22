package com.aem.hybrid.calix.core.models.react.productlist;

import com.aem.hybrid.calix.core.services.GenericStructureServiceModel;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * ProductList SERVICE Model — exports the current user's product selection state
 * for servicedata.json.
 *
 * <p>Reads the logged-in user's profile node (typically
 * {@code /home/users/.../profile}) and looks for a multi-value property named
 * {@code myProducts} containing the paths of the products the user has picked.
 * For every product authored on this component, we emit a small object with
 * {@code id} (the authored path) and {@code isSelected} (whether it appears in
 * the user's profile).</p>
 *
 * <p>Corresponding React state is merged in {@code ProductList.tsx}: authored
 * page-data drives the tiles, this service-data toggles the checkmark.</p>
 */
@Model(
        adaptables = SlingHttpServletRequest.class,
        adapters = GenericStructureServiceModel.class,
        resourceType = "aem-hybrid-calix/components/react/product-list",
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class ProductListServiceModel implements GenericStructureServiceModel {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProductListServiceModel.class);
    private static final String ANONYMOUS = "anonymous";
    /** Property name on the user's /profile node holding selected product paths. */
    private static final String PROFILE_PROP = "myProducts";

    @Self
    private SlingHttpServletRequest request;

    @SlingObject
    private Resource resource;

    @JsonProperty("products")
    private List<Map<String, Object>> products = new ArrayList<>();

    @JsonProperty("userId")
    private String userId;

    @PostConstruct
    protected void init() {
        try {
            Set<String> selected = loadUserSelectedPaths();
            products = buildSelectionState(resource, selected);
            LOGGER.debug("ProductListServiceModel - user={} selectedCount={} totalProducts={}",
                    userId, selected.size(), products.size());
        } catch (Exception e) {
            LOGGER.error("ProductListServiceModel - error building selection state", e);
        }
    }


    private Set<String> loadUserSelectedPaths() {
        ResourceResolver resolver = request.getResourceResolver();
        userId = resolver.getUserID();
        if (userId == null || ANONYMOUS.equals(userId)) {
            return Collections.emptySet();
        }
        try {
            UserManager userManager = resolver.adaptTo(UserManager.class);
            Authorizable auth = (userManager != null) ? userManager.getAuthorizable(userId) : null;
            String userPath = (auth != null) ? auth.getPath() : null;
            Resource profile = (userPath != null) ? resolver.getResource(userPath + "/profile") : null;
            if (profile == null) {
                return Collections.emptySet();
            }
            ValueMap vm = profile.getValueMap();
            String[] arr = vm.get(PROFILE_PROP, String[].class);
            if (arr == null) {
                String single = vm.get(PROFILE_PROP, String.class);
                arr = (single != null && !single.isEmpty()) ? new String[]{single} : new String[0];
            }
            return new HashSet<>(Arrays.asList(arr));
        } catch (Exception e) {
            LOGGER.warn("ProductListServiceModel - could not read profile for user {}", userId, e);
            return Collections.emptySet();
        }
    }

    private List<Map<String, Object>> buildSelectionState(Resource componentResource, Set<String> selected) {
        List<Map<String, Object>> out = new ArrayList<>();
        Resource productsRes = (componentResource != null) ? componentResource.getChild("products") : null;
        if (productsRes == null) {
            return out;
        }
        Iterator<Resource> it = productsRes.listChildren();
        while (it.hasNext()) {
            Resource item = it.next();
            String path = item.getValueMap().get("productPath", String.class);
            if (path == null || path.isEmpty()) {
                continue;
            }
            Map<String, Object> row = new HashMap<>();
            row.put("id", path);
            row.put("isSelected", selected.contains(path));
            out.add(row);
        }
        return out;
    }

    @Override
    public Object exportComponent(Resource resource) {
        Map<String, Object> result = new HashMap<>();
        result.put("products", products);
        result.put("userId", userId);
        return result;
    }

    @Override
    public boolean isReact() {
        return true;
    }
}
