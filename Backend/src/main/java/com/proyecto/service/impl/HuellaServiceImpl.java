package com.proyecto.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyecto.service.HuellaService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class HuellaServiceImpl implements HuellaService {
    private final ObjectMapper objectMapper;

    @Override
    public String calcular(Object objeto) {
        try {
            return calcularBytes(objectMapper.writeValueAsBytes(objeto));
        } catch (Exception error) {
            throw new IllegalStateException("No fue posible calcular la huella");
        }
    }

    @Override
    public String calcularBytes(byte[] contenido) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(contenido));
        } catch (Exception error) {
            throw new IllegalStateException("No fue posible calcular la huella");
        }
    }
}
