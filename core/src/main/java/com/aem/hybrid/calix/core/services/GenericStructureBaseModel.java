package com.aem.hybrid.calix.core.services;

import org.apache.sling.api.resource.Resource;

/**
 * Base interface for STATIC (authored) Sling Models that export component data as JSON.
 * Implements the pagedata.json pattern from the hybrid CMS architecture.
 *
 * Naming convention: all static Sling models implement {@link GenericStructureBaseModel};
 * all service/dynamic Sling models implement {@link GenericStructureServiceModel}.
 *
 * The StaticDataServlet traverses the page, finds components with this interface,
 * and aggregates their data into the page-level pagedata.json response.
 *
 * Response structure:
 * { "components": [{ "resourceType", "componentId", "isReact", "order", "data": {...} }] }
 */
public interface GenericStructureBaseModel {

    /**
     * Export the component's authored data.
     *
     * <p>Default implementation walks the resource tree via
     * {@link ResourceStructureSerializer} and returns a Map that mirrors the
     * authored dialog structure (properties + nested groups + multifields).
     * Component-specific static models therefore do NOT need to override this
     * method for typical dialog-driven components — just annotate the model
     * with {@code @Model} and it will work.</p>
     *
     * <p>Override only when you need custom logic (e.g. resolving content
     * fragment references, computing derived fields, etc.).</p>
     *
     * @param resource The component resource
     * @return The exported data object (will be serialized as the "data" field)
     */
    default Object export(Resource resource) {
        return ResourceStructureSerializer.serialize(resource);
    }

    /**
     * Check if this is a React component.
     * @return true if React component, false otherwise
     */
    default boolean isReact() {
        return true;
    }
}
