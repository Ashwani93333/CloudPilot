# Multi-stage build for Spring Boot Backend
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace/app

# Copy maven wrapper and dependencies definition
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

# Pre-fetch dependencies
RUN ./mvnw dependency:go-offline -B || true

# Copy source and build
COPY src src
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S cloudpilot && adduser -S cloudpilot -G cloudpilot
USER cloudpilot

COPY --from=builder /workspace/app/target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
