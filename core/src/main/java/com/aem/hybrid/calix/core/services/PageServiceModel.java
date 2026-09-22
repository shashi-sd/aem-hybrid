package com.aem.hybrid.calix.core.services;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.wrappers.SlingHttpServletRequestWrapper;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.apache.sling.models.factory.ModelFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * PageServiceModel - Main page aggregator for .servicedata.json
 *
 * ARCHITECTURE:
 * 1. Adapts from SlingHttpServletRequest (ensures request is available)
 * 2. Traverses the page resource tree recursively
 * 3. For each component, wraps the request to point to that component's resource
 * 4. Adapts component models from the wrapped request (giving them request access)
 * 5. All component models can now access @Self SlingHttpServletRequest
 *
 * URL: /content/mycalix/path/to/page.servicedata.json
 */
@Model(
        adaptables = SlingHttpServletRequest.class,
        resourceType = "aem-hybrid-calix/components/page",
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Exporter(name = "dataservice", extensions = "json")
public class PageServiceModel {

    private static final Logger LOGGER = LoggerFactory.getLogger(PageServiceModel.class);

    private static final String REACT_COMPONENT_PREFIX = "aem-hybrid-calix/components/react/";


    private static final Set<String> CONTAINER_COMPONENTS = new HashSet<>(Arrays.asList(
            "mycalix/components/react/product-tabs"
    ));

    @Self
    private SlingHttpServletRequest request;

    @SlingObject
    private Resource resource;

    @Inject
    private ModelFactory modelFactory;

    @JsonProperty("components")
    private List<Map<String, Object>> components;

    private int componentOrder = 0;

    @PostConstruct
    private void init() {
        components = new ArrayList<>();
        componentOrder = 0;

        LOGGER.info("PageServiceModel - Initializing for page: {}", resource != null ? resource.getPath() : "null");
        LOGGER.info("PageServiceModel - Resource type: {}", resource != null ? resource.getResourceType() : "null");
        LOGGER.info("PageServiceModel - Request: {}, User: {}",
                request != null ? "Available" : "NULL",
                request != null ? request.getResourceResolver().getUserID() : "unknown");

        if (resource != null) {
            Resource startResource = resource;
            if ("cq:Page".equals(resource.getResourceType())) {
                Resource jcrContent = resource.getChild("jcr:content");
                if (jcrContent != null) {
                    startResource = jcrContent;
                    LOGGER.info("PageServiceModel - Starting traversal from jcr:content: {}", startResource.getPath());
                } else {
                    LOGGER.warn("PageServiceModel - cq:Page has no jcr:content child!");
                }
            }

            traverse(startResource);
        }

        LOGGER.info("PageServiceModel - Successfully exported {} components", components.size());
    }

    private void traverse(Resource res) {
        if (res == null) return;

        LOGGER.debug("PageServiceModel - Traversing: {} (type: {})", res.getPath(), res.getResourceType());

        String resourceType = res.getResourceType();

        // Only attempt adaptation for mycalix/components/react/* nodes
        // All other nodes — nt:unstructured, cq:*, wcm/*, mycalix/components/* — just traverse children
        if (resourceType.startsWith(REACT_COMPONENT_PREFIX)) {

            GenericStructureServiceModel model = exportDynamicComponent(res);

            if (model != null) {
                Object data = model.exportComponent(res);

                if (data != null) {
                    Map<String, Object> componentWrapper = new LinkedHashMap<>();
                    componentWrapper.put("resourceType", resourceType);
                    componentWrapper.put("componentId", res.getName());
                    componentWrapper.put("order", componentOrder++);
                    componentWrapper.put("isReact", model.isReact());
                    componentWrapper.put("data", data);
                    components.add(componentWrapper);

                    LOGGER.info("PageServiceModel - ✓ Added component: {} ({})",
                            res.getName(), resourceType);
                } else {
                    LOGGER.debug("PageServiceModel - Skipped empty component: {}", res.getPath());
                }

                // CONTAINER: STOP — product-tabs handles its children internally via exportComponent
                // PSM must NOT traverse children — causes duplicate products-card export at root level
                if (CONTAINER_COMPONENTS.contains(resourceType)) {
                    LOGGER.debug("PageServiceModel - Container STOP, children handled internally: {}", res.getPath());
                    return;
                }

                // Non-container react component — STOP
                // Children are dialog/config nodes, not page components
                return;
            }
        }

        // Not a react component OR no model found — continue traversal into children
        for (Resource child : res.getChildren()) {
            traverse(child);
        }
    }

    /**
     * Export a component by adapting from a wrapped request or resource
     * Supports both Request-adaptable and Resource-adaptable models
     * @return The model instance, or null if not exportable
     */
    private GenericStructureServiceModel exportDynamicComponent(Resource res) {
        GenericStructureServiceModel model = null;

        try {
            ComponentResourceRequest wrappedRequest = new ComponentResourceRequest(request, res);

            if (modelFactory.canCreateFromAdaptable(wrappedRequest, GenericStructureServiceModel.class)) {
                LOGGER.debug("PageServiceModel - Can create model from Request for: {}", res.getPath());
                model = modelFactory.createModel(wrappedRequest, GenericStructureServiceModel.class);
            }

            if (model == null && modelFactory.canCreateFromAdaptable(res, GenericStructureServiceModel.class)) {
                LOGGER.debug("PageServiceModel - Can create model from Resource for: {}", res.getPath());
                model = modelFactory.createModel(res, GenericStructureServiceModel.class);
            }

            if (model != null) {
                LOGGER.debug("PageServiceModel - Created model: {}", model.getClass().getSimpleName());

                if (isValidModel(res, model)) {
                    LOGGER.info("PageServiceModel - ✓ Exported: {} -> {}",
                            res.getName(), model.getClass().getSimpleName());
                    return model;
                } else {
                    LOGGER.debug("PageServiceModel - Model validation failed for: {}", res.getPath());
                }
            } else {
                LOGGER.trace("PageServiceModel - Cannot create model for: {}", res.getPath());
            }
        } catch (Exception e) {
            LOGGER.debug("PageServiceModel - Could not export {}: {}",
                    res.getPath(), e.getMessage());
        }
        return null;
    }

    private boolean isValidModel(Resource res, GenericStructureServiceModel model) {
        Model annotation = model.getClass().getAnnotation(Model.class);
        if (annotation != null) {
            for (String rt : annotation.resourceType()) {
                if (rt.equals(res.getResourceType())) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Public getter for components array - used by servlet and Jackson serialization
     */
    public List<Map<String, Object>> getComponents() {
        return components;
    }

    /**
     * ComponentResourceRequest - Wraps the original request but overrides getResource()
     *
     * This is the CRITICAL piece that makes everything work:
     * - Component models adapt from SlingHttpServletRequest (@Self)
     * - But when they inject @SlingObject Resource, they get the component's resource
     * - The request context (user, session, attributes) is preserved from original request
     *
     * Result: Component models have BOTH request AND correct resource!
     */
    private static class ComponentResourceRequest extends SlingHttpServletRequestWrapper {
        private final Resource componentResource;

        public ComponentResourceRequest(SlingHttpServletRequest wrappedRequest, Resource componentResource) {
            super(wrappedRequest);
            this.componentResource = componentResource;
        }

        @Override
        public Resource getResource() {
            return componentResource;
        }

        @Override
        public String getPathInfo() {
            return componentResource.getPath();
        }
    }
}