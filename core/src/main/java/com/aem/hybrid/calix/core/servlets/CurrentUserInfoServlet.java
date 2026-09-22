package com.aem.hybrid.calix.core.servlets;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.Servlet;
import javax.servlet.ServletException;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.servlets.SlingSafeMethodsServlet;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * CurrentUserInfoServlet — lightweight, dispatcher-friendly replacement for
 * the OOTB {@code /system/sling/info.sessionInfo.json} endpoint, which is
 * blocked by the default dispatcher filters (everything under
 * {@code /system/*} is denied) and therefore unreachable through the
 * publish-facing dispatcher/CDN.
 *
 * <p>URL: <b>GET /bin/aem-hybrid-calix/userinfo.json</b></p>
 *
 * <p>Response JSON:
 * <pre>{ "userId": "admin", "authenticated": true }</pre>
 * or, for anonymous requests:
 * <pre>{ "userId": "anonymous", "authenticated": false }</pre>
 * </p>
 *
 * <p>This response is intentionally marked as non-cacheable
 * ({@code Cache-Control: no-store, no-cache, must-revalidate, max-age=0})
 * so that:
 * <ul>
 *   <li>the AEM dispatcher never caches it at the docroot (see the
 *       matching deny rule added to {@code cache/rules.any}), and</li>
 *   <li>the visitor's browser always re-fetches the current auth state
 *       on every page load rather than reusing a stale cached response.</li>
 * </ul>
 * It is called client-side by
 * {@code ui.frontend/src/site/components/auth/auth-status.js} to hydrate
 * the (always anonymously server-rendered, dispatcher-cache-safe)
 * {@code userauthcontrol} component with the real signed-in user.</p>
 */
@Component(
        service = Servlet.class,
        property = {
                "sling.servlet.paths=/bin/aem-hybrid-calix/userinfo",
                "sling.servlet.methods=GET",
                "sling.servlet.extensions=json"
        })
public class CurrentUserInfoServlet extends SlingSafeMethodsServlet {

    private static final long serialVersionUID = 1L;
    private static final Logger LOGGER = LoggerFactory.getLogger(CurrentUserInfoServlet.class);

    private static final String ANONYMOUS = "anonymous";

    private final transient ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(final SlingHttpServletRequest request,
                          final SlingHttpServletResponse response) throws ServletException, IOException {

        String userId = request.getRemoteUser();
        boolean authenticated = isNotBlank(userId) && !ANONYMOUS.equalsIgnoreCase(userId);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("userId", authenticated ? userId : ANONYMOUS);
        body.put("authenticated", authenticated);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);

        try {
            mapper.writeValue(response.getWriter(), body);
        } catch (IOException e) {
            LOGGER.error("Failed to write current user info response", e);
            throw e;
        }
    }

    private static boolean isNotBlank(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
