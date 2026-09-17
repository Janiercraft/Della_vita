FROM maven:3.9.11-eclipse-temurin-25 AS compilacion
WORKDIR /proyecto
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src src
RUN mvn -B package -DskipTests
FROM eclipse-temurin:25-jre
WORKDIR /app
RUN groupadd --system aplicacion && useradd --system --gid aplicacion aplicacion
COPY --from=compilacion /proyecto/target/gestion-beneficiarios-1.0.0.jar app.jar
USER aplicacion
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
