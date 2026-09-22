
package com.aem.hybrid.calix.core.servlets;

import com.aem.hybrid.calix.core.services.PageServiceModel;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import javax.servlet.Servlet;
import javax.servlet.ServletException;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.apache.sling.api.wrappers.SlingHttpServletRequestWrapper;
import org.apache.sling.models.factory.ModelFactory;
import org.apache.sling.servlets.annotations.SlingServletResourceTypes;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component(
        service = {Servlet.class}
)
@SlingServletResourceTypes(
        methods = {"GET"},
        resourceTypes = {"cq:Page"},
        selectors = {"servicedata"},
        extensions = {"json"}
)
public class GetPageServiceDataServlet extends SlingAllMethodsServlet {
    @Reference
    private transient ModelFactory modelFactory;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final Logger LOGGER = LoggerFactory.getLogger(GetPageServiceDataServlet.class);

    public GetPageServiceDataServlet() {
    }

    protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response) throws ServletException, IOException {
        Resource pageResource = request.getResource();

        try {
            Resource targetResource = pageResource;
            if ("cq:Page".equals(pageResource.getResourceType())) {
                Resource jcrContent = pageResource.getChild("jcr:content");
                if (jcrContent != null) {
                    targetResource = jcrContent;
                    LOGGER.debug("Using jcr:content resource: {}", targetResource.getPath());
                } else {
                    LOGGER.warn("cq:Page has no jcr:content child: {}", pageResource.getPath());
                }
            }

            SlingHttpServletRequest wrappedRequest = new PageResourceRequest(request, targetResource);
            LOGGER.info("GetPageServiceDataServlet - Creating model for resource: {} (type: {})", targetResource.getPath(), targetResource.getResourceType());
            PageServiceModel pageModel = (PageServiceModel)this.modelFactory.createModel(wrappedRequest, PageServiceModel.class);
            if (pageModel == null) {
                LOGGER.error("Failed to create PageServiceModel for resource: {}", targetResource.getPath());
                response.setStatus(500);
                response.getWriter().write("{\"error\": \"Failed to create PageServiceModel\"}");
                return;
            }

            LOGGER.info("GetPageServiceDataServlet - PageServiceModel created successfully");
            LOGGER.info("GetPageServiceDataServlet - Number of components: {}", pageModel.getComponents() != null ? pageModel.getComponents().size() : 0);
            String json = this.objectMapper.writeValueAsString(pageModel);
            LOGGER.info("GetPageServiceDataServlet - Serialized JSON length: {}", json.length());
            LOGGER.debug("GetPageServiceDataServlet - Serialized JSON: {}", json);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(json);
        } catch (Exception var8) {
            Exception e = var8;
            response.setStatus(500);
            response.getWriter().write("{\"error\": \"Model instantiation or serialization failed\"}");
            LOGGER.error("Error processing service data for page: {}", pageResource.getPath(), e);
        }

    }

    private static class PageResourceRequest extends SlingHttpServletRequestWrapper {
        private final Resource targetResource;

        public PageResourceRequest(SlingHttpServletRequest wrappedRequest, Resource targetResource) {
            super(wrappedRequest);
            this.targetResource = targetResource;
        }

        public Resource getResource() {
            return this.targetResource;
        }

        public String getPathInfo() {
            return this.targetResource.getPath();
        }
    }
}
