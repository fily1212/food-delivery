# Stage 1: Build con Maven e Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copia solo i file necessari per scaricare le dipendenze in anticipo (per caching efficace)
COPY pom.xml .
COPY .mvn/ .mvn
COPY mvnw .
RUN ./mvnw dependency:go-offline

# Copia tutto il resto del progetto e compila
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime con JRE Java 21
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8090
CMD ["java", "-jar", "app.jar"]
