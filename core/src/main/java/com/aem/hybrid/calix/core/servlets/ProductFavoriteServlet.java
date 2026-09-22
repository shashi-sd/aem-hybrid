package com.aem.hybrid.calix.core.servlets;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.jackrabbit.api.security.user.Authorizable;
import org.apache.jackrabbit.api.security.user.UserManager;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.ModifiableValueMap;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.Node;
import javax.jcr.Session;
import javax.servlet.Servlet;
import javax.servlet.ServletException;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

/**
 * ProductFavoriteServlet — toggles a product path on the current user's
 * {@code profile/myProducts} multi-value property.
 *
 * <p>POST /bin/aem-hybrid-calix/favorite
 * &nbsp;&nbsp;productPath=/content/aem-hybrid-calix/us/en/products/router-x1
 * &nbsp;&nbsp;action=add | remove | toggle (default: toggle)</p>
 *
 * <p>Response JSON:
 * <pre>{ "userId": "...", "productPath": "...", "isFavorite": true,
 *       "myProducts": ["...", "..."] }</pre>
 * </p>
 */
@Component(
        service = Servlet.class,
        property = {
                "sling.servlet.paths=/bin/aem-hybrid-calix/favorite",
                "sling.servlet.methods=POST"
        })
public class ProductFavoriteServlet extends SlingAllMethodsServlet {

    private static final long serialVersionUID = 1L;
    private static final Logger LOGGER = LoggerFactory.getLogger(ProductFavoriteServlet.class);

    private static final String ANONYMOUS = "anonymous";
    private static final String PROFILE_PROP = "myProducts";

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doPost(SlingHttpServletRequest req, SlingHttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String productPath = req.getParameter("productPath");
        String action = req.getParameter("action");
        if (action == null || action.isEmpty()) action = "toggle";

        Map<String, Object> out = new HashMap<>();

        if (productPath == null || productPath.isEmpty()) {
            resp.setStatus(SlingHttpServletResponse.SC_BAD_REQUEST);
            out.put("error", "productPath is required");
            resp.getWriter().write(mapper.writeValueAsString(out));
            return;
        }

        ResourceResolver resolver = req.getResourceResolver();
        String userId = resolver.getUserID();
        if (userId == null || ANONYMOUS.equals(userId)) {
            resp.setStatus(SlingHttpServletResponse.SC_UNAUTHORIZED);
            out.put("error", "login required");
            resp.getWriter().write(mapper.writeValueAsString(out));
            return;
        }

        try {
            UserManager userManager = resolver.adaptTo(UserManager.class);
            Authorizable auth = (userManager != null) ? userManager.getAuthorizable(userId) : null;
            String userPath = (auth != null) ? auth.getPath() : null;
            if (userPath == null) {
                throw new IllegalStateException("Could not resolve user path for " + userId);
            }

            // Ensure profile node exists (create if missing)
            Resource profile = resolver.getResource(userPath + "/profile");
            if (profile == null) {
                Session session = resolver.adaptTo(Session.class);
                if (session != null && session.nodeExists(userPath)) {
                    Node userNode = session.getNode(userPath);
                    Node profileNode = userNode.addNode("profile", "nt:unstructured");
                    session.save();
                    profile = resolver.getResource(profileNode.getPath());
                }
            }
            if (profile == null) {
                throw new IllegalStateException("Could not access profile for user " + userId);
            }

            ModifiableValueMap vm = profile.adaptTo(ModifiableValueMap.class);
            if (vm == null) {
                throw new IllegalStateException("Profile not writable for user " + userId);
            }

            String[] current = vm.get(PROFILE_PROP, String[].class);
            if (current == null) {
                String single = vm.get(PROFILE_PROP, String.class);
                current = (single != null && !single.isEmpty()) ? new String[]{single} : new String[0];
            }
            Set<String> set = new LinkedHashSet<>(Arrays.asList(current));

            boolean isFavorite;
            switch (action) {
                case "add":
                    set.add(productPath);
                    isFavorite = true;
                    break;
                case "remove":
                    set.remove(productPath);
                    isFavorite = false;
                    break;
                default: // toggle
                    if (set.contains(productPath)) {
                        set.remove(productPath);
                        isFavorite = false;
                    } else {
                        set.add(productPath);
                        isFavorite = true;
                    }
            }

            vm.put(PROFILE_PROP, set.toArray(new String[0]));
            resolver.commit();

            out.put("userId", userId);
            out.put("productPath", productPath);
            out.put("isFavorite", isFavorite);
            out.put("myProducts", set.toArray(new String[0]));
            resp.getWriter().write(mapper.writeValueAsString(out));

        } catch (Exception e) {
            LOGGER.error("ProductFavoriteServlet - failed to update favorites for {}", userId, e);
            resp.setStatus(SlingHttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.put("error", e.getMessage());
            resp.getWriter().write(mapper.writeValueAsString(out));
        }
    }
}
