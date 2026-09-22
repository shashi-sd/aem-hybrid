package com.aem.hybrid.calix.core.models.react.producthero;

import com.aem.hybrid.calix.core.models.react.productfavorite.ProductFavoriteServiceModel;
import com.aem.hybrid.calix.core.services.GenericStructureServiceModel;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;

@Model(
        adaptables = SlingHttpServletRequest.class,
        adapters = GenericStructureServiceModel.class,
        resourceType = ProductHeroStaticModel.RESOURCE_TYPE,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class ProductHeroServiceModel extends ProductFavoriteServiceModel {
}
