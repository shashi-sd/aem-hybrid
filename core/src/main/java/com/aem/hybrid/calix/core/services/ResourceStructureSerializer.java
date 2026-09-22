package com.aem.hybrid.calix.core.services;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Recursively serializes a Sling {@link Resource} tree into a nested
 * {@link Map} / {@link List} structure that mirrors the authored dialog
 * structure in the JCR.
 *
 * <p>All authored dialog data — including nested groups and multifields —
 * is captured automatically, so component-level Sling Models do NOT need to
 * hand-pick each property. Just annotate the model with @Model and let the
 * default {@code GenericStructureBaseModel#export(Resource)} do the work.</p>
 *
 * <p>Filtering rules:
 * <ul>
 *   <li>System / infrastructure properties are skipped:
 *       {@code jcr:*}, {@code sling:*}, {@code cq:*}.</li>
 *   <li>Child nodes whose name starts with {@code jcr:} (e.g. jcr:content
 *       inside a page) are skipped.</li>
 *   <li>If ALL child nodes have numeric names (item0, item1, ... or 0, 1, ...)
 *       OR follow the Granite multifield pattern, they are serialized as a
 *       JSON array under the child-collection key. Otherwise they are
 *       serialized as a nested object keyed by node name.</li>
 * </ul>
 */
public final class ResourceStructureSerializer {

    private ResourceStructureSerializer() {
        // utility
    }

    /**
     * Serialize a resource's authored data (properties + children) into a Map.
     *
     * @param resource the resource to serialize
     * @return a nested Map mirroring the JCR structure, or empty map if null
     */
    public static Map<String, Object> serialize(Resource resource) {
        Map<String, Object> result = new LinkedHashMap<>();
        if (resource == null) {
            return result;
        }

        ValueMap props = resource.getValueMap();
        for (Map.Entry<String, Object> entry : props.entrySet()) {
            if (isSystemProperty(entry.getKey())) {
                continue;
            }
            result.put(entry.getKey(), entry.getValue());
        }

        List<Resource> children = new ArrayList<>();
        for (Resource child : resource.getChildren()) {
            if (child.getName().startsWith("jcr:")) {
                continue;
            }
            children.add(child);
        }

        if (children.isEmpty()) {
            return result;
        }


        if (looksLikeMultifield(children)) {
            List<Map<String, Object>> items = new ArrayList<>();
            for (Resource child : children) {
                items.add(serialize(child));
            }
            result.putIfAbsent("items", items);
        } else {
            for (Resource child : children) {
                result.put(child.getName(), serialize(child));
            }
        }

        return result;
    }

    private static boolean isSystemProperty(String name) {
        return name.startsWith("jcr:")
                || name.startsWith("sling:")
                || name.startsWith("cq:");
    }

    private static boolean looksLikeMultifield(List<Resource> children) {
        if (children.isEmpty()) {
            return false;
        }
        for (Resource child : children) {
            String name = child.getName();
            if (!name.matches("item\\d+") && !name.matches("\\d+")) {
                return false;
            }
        }
        return true;
    }
}
