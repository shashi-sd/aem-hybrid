package com.aem.hybrid.calix.core.models.react.networkdashboard;

import com.aem.hybrid.calix.core.services.GenericStructureServiceModel;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Model(
        adaptables = Resource.class,
        adapters = GenericStructureServiceModel.class,
        resourceType = "aem-hybrid-calix/components/react/network-dashboard",
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class NetworkDashboardServiceModel implements GenericStructureServiceModel {

    private Map<String, Object> payload;

    @PostConstruct
    protected void init() {
        payload = buildPayload();
    }

    private Map<String, Object> buildPayload() {
        Map<String, Object> out = new LinkedHashMap<>();

        out.put("health", "healthy");
        out.put("healthLabel", "All systems operational");
        out.put("lastUpdated", java.time.Instant.now().toString());

        Map<String, Object> kpis = new LinkedHashMap<>();
        kpis.put("uptime",      kpi(99.98,  "good"));
        kpis.put("subscribers", kpi(12480,  "good"));
        kpis.put("bandwidth",   kpi(74,     "warn"));
        kpis.put("alerts",      kpi(3,      "good"));
        out.put("kpis", kpis);

        List<Map<String, Object>> alerts = new ArrayList<>();
        alerts.add(alert("info",     "Firmware update available",         "POP-SJC-01", "2m ago"));
        alerts.add(alert("warning",  "Bandwidth utilisation > 70%",       "POP-DFW-02", "18m ago"));
        alerts.add(alert("info",     "Scheduled maintenance in 6 hours",  "POP-NYC-01", "1h ago"));
        out.put("alerts", alerts);

        List<Integer> trend = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            trend.add(50 + ThreadLocalRandom.current().nextInt(-15, 25));
        }
        out.put("trend", trend);

        return out;
    }

    private Map<String, Object> kpi(Object value, String status) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("value", value);
        m.put("status", status);
        return m;
    }

    private Map<String, Object> alert(String severity, String title, String site, String age) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("severity", severity);
        m.put("title", title);
        m.put("site", site);
        m.put("age", age);
        return m;
    }

    @Override
    public Object exportComponent(Resource resource) {
        return payload;
    }

    @Override
    public boolean isReact() {
        return true;
    }
}
