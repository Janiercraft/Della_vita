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
                .info(new Info().title("Gestion de beneficiarios").version("1.1.0-jwt"))
                .components(new Components().addSecuritySchemes(
                        "bearerAuth",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }

    @Bean
    public OpenApiCustomizer encabezadoApi() {
        return api -> api.getPaths().forEach((rutaTexto, ruta) ->
                ruta.readOperationsMap().forEach((metodo, operacion) -> {
                    boolean esLogin = rutaTexto.endsWith("/auth/login");
                    if (esLogin) {
                        operacion.setSecurity(java.util.List.of());
                    } else if (metodo != PathItem.HttpMethod.GET) {
                        operacion.addParametersItem(new Parameter()
                                .in("header")
                                .name("X-Requested-With")
                                .required(true)
                                .schema(new StringSchema()._default("gestion-beneficiarios")));
                    }
                }));
    }
}
