package com.aem.hybrid.calix.core.models;

import javax.annotation.PostConstruct;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.InjectionStrategy;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

/**
 * Sling Model for the Product Card component.
 *
 * This model provides the STATIC (authored) data that gets serialized into
 * the page-level .staticdata.json response. The component's HTL template also
 * uses this model to render data-attributes for the React mount point.
 *
 * HYBRID ARCHITECTURE:
 * - Static data (this model) → .staticdata.json → React props.staticData
 * - Dynamic data (service) → .dataservice.json → React props.serviceData
 */
@Model(adaptables = Resource.class)
public class ProductCardModel {

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "")
    private String productName;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "")
    private String description;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "")
    private String imageUrl;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "")
    private String category;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "")
    private String sku;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL)
    private String[] features;

    private String componentId;

    @PostConstruct
    protected void init() {
        componentId = "productcard-" + Math.abs(productName.hashCode() + sku.hashCode());
    }

    public String getProductName() {
        return productName;
    }

    public String getDescription() {
        return description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getCategory() {
        return category;
    }

    public String getSku() {
        return sku;
    }

    public String[] getFeatures() {
        return features;
    }

    public String getComponentId() {
        return componentId;
    }
}
