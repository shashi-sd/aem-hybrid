package com.aem.hybrid.calix.core.servlets;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.Servlet;
import javax.servlet.ServletException;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.servlets.SlingSafeMethodsServlet;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.factory.ModelFactory;
import org.apache.sling.servlets.annotations.SlingServletResourceTypes;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.propertytypes.ServiceDescription;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.aem.hybrid.calix.core.services.GenericStructureBaseModel;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * GetPageDataServlet — serves authored CMS content as pagedata.json
 *
 * URL: /content/aem-hybrid-calix/us/en/page.pagedata.json
 *
 * HYBRID ARCHITECTURE (matches reference project GetPageStaticDataServlet):
 * 1. Traverses the page's jcr:content tree recursively
 * 2. For each resource, checks if a GenericStructureBaseModel model can be created
 * 3. Validates model resourceType matches the resource
 * 4. Wraps exported data with metadata (resourceType, componentId, isReact, order)
 *
 * Response format:
 * {
 *   "components": [
 *     { "resourceType": "aem-hybrid-calix/components/react/profile-card",
 *       "componentId": "profilecard",
 *       "order": 0,
 *       "isReact": true,
 *       "data": { ...authored props... }
 *     }
 *   ]
 * }
 */
@Component(service = { Servlet.class })
@SlingServletResourceTypes(
        resourceTypes = "cq:Page",
        methods = "GET",
        selectors = "pagedata",
        extensions = "json"
)
@ServiceDescription("Hybrid CMS - Page Data Servlet (pagedata.json)")
public class StaticDataServlet extends SlingSafeMethodsServlet {

    private static final long serialVersionUID = 1L;
    private static final Logger LOGGER = LoggerFactory.getLogger(StaticDataServlet.class);

    @Reference
    private transient ModelFactory modelFactory;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(final SlingHttpServletRequest request,
                         final SlingHttpServletResponse response) throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Resource pageResource = request.getResource();
        List<Map<String, Object>> componentList = new ArrayList<>();

        Resource contentResource = pageResource.getChild("jcr:content");
        if (contentResource != null) {
            collectValidComponents(contentResource, componentList, new int[]{0});
        } else {
            LOGGER.warn("No jcr:content found under page: {}", pageResource.getPath());
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("components", componentList);

        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
    private void collectValidComponents(Resource resource, List<Map<String, Object>> list, int[] order) {
        if (resource == null) return;

        if (modelFactory.canCreateFromAdaptable(resource, GenericStructureBaseModel.class)) {
            GenericStructureBaseModel model = modelFactory.createModel(resource, GenericStructureBaseModel.class);

            if (isModelApplicable(resource, model)) {
                try {
                    Object data = model.export(resource);
                    if (data != null) {
                        Map<String, Object> componentWrapper = new LinkedHashMap<>();
                        componentWrapper.put("resourceType", resource.getResourceType());
                        componentWrapper.put("componentId", resource.getName());
                        componentWrapper.put("order", order[0]);
                        componentWrapper.put("isReact", model.isReact());
                        componentWrapper.put("data", data);

                        list.add(componentWrapper);

                        LOGGER.debug("Added static component: {} ({}) at order {}",
                                resource.getName(), resource.getResourceType(), order[0]);
                        order[0]++;
                    }
                } catch (Exception e) {
                    LOGGER.error("Error exporting component at {}: {}",
                            resource.getPath(), e.getMessage(), e);
                }
            }
        }

        for (Resource child : resource.getChildren()) {
            collectValidComponents(child, list, order);
        }
    }


    private boolean isModelApplicable(Resource resource, GenericStructureBaseModel model) {
        if (model == null) return false;

        Model annotation = model.getClass().getAnnotation(Model.class);
        if (annotation != null) {
            for (String rt : annotation.resourceType()) {
                if (rt.equals(resource.getResourceType())) {
                    return true;
                }
            }
        }
        return false;
    }
}
