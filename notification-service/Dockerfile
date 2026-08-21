# Stage 1: Runtime environment using lightweight OpenJDK 21
FROM eclipse-temurin:21-jre-alpine

# Set working directory inside the container
WORKDIR /app

# Copy the compiled JAR artifact from your target folder
COPY target/notification-service-1.0.0.jar app.jar

# Expose the Notification Service microservice port
EXPOSE 8082

# Execution command to start the application with optimized memory settings
ENTRYPOINT ["java", "-XX:+UseG1GC", "-jar", "app.jar"]
