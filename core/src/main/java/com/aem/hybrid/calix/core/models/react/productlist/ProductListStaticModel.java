package com.aem.hybrid.calix.core.models.react.productlist;

import com.aem.hybrid.calix.core.services.GenericStructureBaseModel;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;


@Model(
        adaptables = Resource.class,
        adapters = GenericStructureBaseModel.class,
        resourceType = "aem-hybrid-calix/components/react/product-list",
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class ProductListStaticModel implements GenericStructureBaseModel {
}

