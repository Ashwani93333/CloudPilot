package com.cloudpilot.health;

import com.cloudpilot.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Health & Readiness", description = "Application and infrastructure liveness checks")
public class HealthController {

    @Autowired(required = false)
    private DataSource dataSource;

    public HealthController() {
    }

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    @Operation(summary = "Liveness probe", description = "Returns basic application status and uptime info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkHealth() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "cloudpilot-api");
        status.put("version", "1.0.0");
        status.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(ApiResponse.ok("CloudPilot API service is healthy", status));
    }

    @GetMapping("/ready")
    @Operation(summary = "Readiness probe", description = "Verifies connectivity to underlying database and dependencies")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkReadiness() {
        Map<String, Object> readiness = new HashMap<>();
        readiness.put("service", "cloudpilot-api");
        readiness.put("timestamp", Instant.now().toString());

        boolean dbReady = false;
        if (dataSource != null) {
            try (Connection conn = dataSource.getConnection()) {
                dbReady = conn.isValid(2);
            } catch (Exception e) {
                dbReady = false;
            }
        }

        readiness.put("database", dbReady ? "CONNECTED" : "UNAVAILABLE");

        if (dbReady) {
            readiness.put("status", "READY");
            return ResponseEntity.ok(ApiResponse.ok("All dependencies healthy and ready", readiness));
        } else {
            readiness.put("status", "DEGRADED");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.ok("Dependencies pending connection", readiness));
        }
    }
}
