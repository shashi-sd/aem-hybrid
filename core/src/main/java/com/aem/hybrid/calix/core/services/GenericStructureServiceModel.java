package com.aem.hybrid.calix.core.services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.sling.api.resource.Resource;

/**
 * Base interface for DYNAMIC (service/API) Sling Models that export component data as JSON.
 * Implements the servicedata.json pattern from the hybrid CMS architecture.
 *
 * Naming convention: all static Sling models implement {@link GenericStructureBaseModel};
 * all service/dynamic Sling models implement {@link GenericStructureServiceModel}.
 *
 * The GetServiceDataServlet traverses the page, finds components with this interface,
 * and aggregates their data into the page-level servicedata.json response.
 *
 * Service models typically call external APIs, backend services, or compute live data
 * (user profiles, product selections, pricing, etc.)
 *
 * Response structure:
 * { "components": [{ "resourceType", "componentId", "isReact", "order", "data": {...} }] }
 */
public interface GenericStructureServiceModel {


    Object exportComponent(Resource resource);

    @JsonIgnore
    default boolean isReact() {
        return true;
    }
}
