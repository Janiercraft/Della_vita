package com.proyecto.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.security.*;

import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.*;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info().title("Gestion de beneficiarios").version("1.0.0"))
                .components(
                        new Components()
                                .addSecuritySchemes(
                                        "basicAuth",
                                        new SecurityScheme()
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("basic")))
                .addSecurityItem(new SecurityRequirement().addList("basicAuth"));
    }

    @Bean
    public OpenApiCustomizer encabezadoApi() {
        return api ->
                api.getPaths()
                        .values()
                        .forEach(
                                ruta ->
                                        ruta.readOperationsMap()
                                                .forEach(
                                                        (metodo, operacion) -> {
                                                            if (metodo != PathItem.HttpMethod.GET) {
                                                                operacion.addParametersItem(
                                                                        new Parameter()
                                                                                .in("header")
                                                                                .name(
                                                                                        "X-Requested-With")
                                                                                .required(true)
                                                                                .schema(
                                                                                        new StringSchema()
                                                                                                ._default(
                                                                                                        "gestion-beneficiarios")));
                                                            }
                                                        }));
    }
}
