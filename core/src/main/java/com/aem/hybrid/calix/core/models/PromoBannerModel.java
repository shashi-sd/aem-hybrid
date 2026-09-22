package com.aem.hybrid.calix.core.models;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.annotation.PostConstruct;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;
import org.apache.sling.models.annotations.injectorspecific.InjectionStrategy;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

/**
 * Sling Model backing the Promo Banner component.
 *
 * PERSONALIZATION APPROACH (ContextHub-driven):
 *  - Author defines a "default" promo (title, message, CTA, etc.).
 *  - Author defines N "variants", each keyed by a role value
 *    (e.g. "admin", "technician", "subscriber", "guest").
 *  - Server renders ALL variants into the DOM (each as a hidden {@code <div>}
 *    with a {@code data-role} attribute). The default variant is shown.
 *  - A tiny client script reads the current user's role from the
 *    ContextHub {@code profile} store (item {@code role}) — falling back to
 *    the {@code ?role=} query parameter — and reveals the matching variant.
 *
 * This keeps the page cacheable on the dispatcher (single HTML for everyone)
 * while still allowing per-role personalization on the client.
 */
@Model(adaptables = Resource.class,
        resourceType = "aem-hybrid-calix/components/promobanner")
public class PromoBannerModel {

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "")
    private String title;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "")
    private String message;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "")
    private String ctaText;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "")
    private String ctaLink;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "")
    private String secondaryCtaText;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "")
    private String secondaryCtaLink;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "")
    private String backgroundColor;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "profile/role")
    private String contextHubKey;

    @ChildResource(injectionStrategy = InjectionStrategy.OPTIONAL)
    private List<Resource> variants;

    private final List<Variant> variantList = new ArrayList<>();

    private String componentId;

    @PostConstruct
    protected void init() {
        if (variants != null) {
            for (Resource r : variants) {
                variantList.add(new Variant(r.getValueMap()));
            }
        }
        componentId = "promobanner-" + Math.abs((title + "|" + message).hashCode());
    }

    public String getTitle()           { return title; }
    public String getMessage()         { return message; }
    public String getCtaText()         { return ctaText; }
    public String getCtaLink()         { return ctaLink; }
    public String getSecondaryCtaText() { return secondaryCtaText; }
    public String getSecondaryCtaLink() { return secondaryCtaLink; }
    public String getBackgroundColor() { return backgroundColor; }

    public String getBackgroundStyle() { return toBackgroundStyle(backgroundColor); }
    public String getContextHubKey()   { return contextHubKey; }
    public String getComponentId()     { return componentId; }

    public List<Variant> getVariants() {
        return Collections.unmodifiableList(variantList);
    }

    public static class Variant {
        private final String role;
        private final String title;
        private final String message;
        private final String ctaText;
        private final String ctaLink;
        private final String secondaryCtaText;
        private final String secondaryCtaLink;
        private final String backgroundColor;

        Variant(ValueMap vm) {
            this.role            = vm.get("role", "");
            this.title           = vm.get("title", "");
            this.message         = vm.get("message", "");
            this.ctaText         = vm.get("ctaText", "");
            this.ctaLink         = vm.get("ctaLink", "");
            this.secondaryCtaText = vm.get("secondaryCtaText", "");
            this.secondaryCtaLink = vm.get("secondaryCtaLink", "");
            this.backgroundColor = vm.get("backgroundColor", "");
        }

        public String getRole()            { return role; }
        public String getTitle()           { return title; }
        public String getMessage()         { return message; }
        public String getCtaText()         { return ctaText; }
        public String getCtaLink()         { return ctaLink; }
        public String getSecondaryCtaText() { return secondaryCtaText; }
        public String getSecondaryCtaLink() { return secondaryCtaLink; }
        public String getBackgroundColor() { return backgroundColor; }
        public String getBackgroundStyle() { return toBackgroundStyle(backgroundColor); }
    }

    private static String toBackgroundStyle(String color) {
        return (color == null || color.trim().isEmpty()) ? null : "background: " + color.trim();
    }
}
