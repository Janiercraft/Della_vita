package com.proyecto;

import module java.base;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DellaVitaApplication {

    public static void main(String[] args) {
        System.out.println("INICIO: arranque de DellaVitaApplication");
        SpringApplication.run(DellaVitaApplication.class, args);
        System.out.println("OK: aplicacion Della Vita iniciada - URABA-PAIS");
    }
}
