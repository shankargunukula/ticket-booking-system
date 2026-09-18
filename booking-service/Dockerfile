# ==========================================
# STAGE 1: Build & Cache Dependencies
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /build

# 1. Copy ONLY the Maven configuration descriptor
COPY pom.xml .

# 2. Leverage BuildKit cache mount to download and persist plugins/dependencies
# This folder won't be re-downloaded on code changes!
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B

# 3. Copy the actual application source code
COPY src ./src

# 4. Package the application using the cached .m2 folder
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -DskipTests

# ==========================================
# STAGE 2: Ultra-Lightweight Runtime
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as a non-root system user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy ONLY the final compiled JAR from the builder stage
COPY --from=builder /build/target/*.jar app.jar

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]
