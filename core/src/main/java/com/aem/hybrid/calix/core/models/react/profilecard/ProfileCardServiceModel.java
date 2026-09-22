package com.aem.hybrid.calix.core.models.react.profilecard;

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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;


@Model(
        adaptables = SlingHttpServletRequest.class,
        adapters = GenericStructureServiceModel.class,
        resourceType = "aem-hybrid-calix/components/react/profile-card",
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class ProfileCardServiceModel implements GenericStructureServiceModel {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProfileCardServiceModel.class);

    private static final String EMPTY = "";
    private static final String ANONYMOUS = "anonymous";

    @Self
    private SlingHttpServletRequest request;

    @JsonProperty("user")
    private Map<String, String> user = new HashMap<>();

    @PostConstruct
    protected void init() {
        try {
            ResourceResolver resolver = request.getResourceResolver();
            String userId = resolver.getUserID();

            if (userId == null || ANONYMOUS.equals(userId)) {
                LOGGER.info("ProfileCardServiceModel - anonymous user");
                populate(userId != null ? userId : ANONYMOUS, null, null);
                return;
            }

            UserManager userManager = resolver.adaptTo(UserManager.class);
            Authorizable auth = (userManager != null) ? userManager.getAuthorizable(userId) : null;

            String userPath = (auth != null) ? auth.getPath() : null;
            Resource profile = (userPath != null) ? resolver.getResource(userPath + "/profile") : null;
            ValueMap props = (profile != null) ? profile.getValueMap() : null;

            populate(userId, userPath, props);
        } catch (Exception e) {
            LOGGER.error("ProfileCardServiceModel - failed to load current user profile", e);
            populate(ANONYMOUS, null, null);
        }
    }

    private void populate(String userId, String userPath, ValueMap props) {
        String firstName = val(props, "givenName");
        String lastName  = val(props, "familyName");
        String fullName  = (firstName + " " + lastName).trim();

        user.put("userId", userId != null ? userId : EMPTY);
        user.put("userPath", userPath != null ? userPath : EMPTY);
        user.put("firstName", firstName);
        user.put("lastName", lastName);
        user.put("fullName", fullName.isEmpty() ? (userId != null ? userId : EMPTY) : fullName);
        user.put("email", val(props, "email"));
        user.put("role", val(props, "jobTitle"));
        user.put("avatar", val(props, "photos/primary"));
        user.put("accountSFid", val(props, "accountSFid"));

        LOGGER.info("ProfileCardServiceModel - user={} fullName={} email={}",
                userId, user.get("fullName"), user.get("email"));
    }

    private String val(ValueMap props, String key) {
        if (props == null) return EMPTY;
        String v = props.get(key, String.class);
        return v != null ? v : EMPTY;
    }

    @Override
    public Object exportComponent(Resource resource) {
        Map<String, Object> result = new HashMap<>();
        result.put("user", user);
        return result;
    }

    @Override
    public boolean isReact() {
        return true;
    }
}
