FROM maven:3.9.11-eclipse-temurin-25 AS compilacion
WORKDIR /proyecto
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget libc-bin postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system aplicacion \
    && useradd --system --gid aplicacion aplicacion
COPY --from=compilacion /proyecto/target/gestion-beneficiarios-1.0.0.jar /app/app.jar
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh && chown -R aplicacion:aplicacion /app
USER aplicacion
EXPOSE 8080
ENTRYPOINT ["/app/docker-entrypoint.sh"]
