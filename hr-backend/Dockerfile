# Stage 1: Build the Spring Boot application
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy the Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Ensure mvnw has execute permissions
RUN chmod +x ./mvnw

# Download dependencies (this caches them in a separate Docker layer)
RUN ./mvnw dependency:go-offline -B

# Copy the source code
COPY src src

# Package the application
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built jar file from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Set the active profile to dev by default so it uses the H2 database
ENV SPRING_PROFILES_ACTIVE=dev

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
