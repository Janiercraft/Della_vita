package com.proyecto.exception;

import lombok.Getter;

@Getter
public class ProveedorIaException extends RuntimeException {
    private final String proveedor;
    private final Integer estadoHttp;
    private final boolean reintentable;
    private final boolean configurado;

    private ProveedorIaException(
            String proveedor,
            Integer estadoHttp,
            boolean reintentable,
            boolean configurado,
            String mensaje,
            Throwable causa) {
        super(mensaje, causa);
        this.proveedor = proveedor;
        this.estadoHttp = estadoHttp;
        this.reintentable = reintentable;
        this.configurado = configurado;
    }

    public static ProveedorIaException noConfigurado(String proveedor) {
        return new ProveedorIaException(
                proveedor,
                null,
                false,
                false,
                proveedor + " no esta configurado",
                null);
    }

    public static ProveedorIaException http(
            String proveedor, int estadoHttp, String mensaje, Throwable causa) {
        boolean reintentable = estadoHttp == 408 || estadoHttp == 429 || estadoHttp >= 500;
        return new ProveedorIaException(
                proveedor, estadoHttp, reintentable, true, mensaje, causa);
    }

    public static ProveedorIaException conexion(
            String proveedor, String mensaje, Throwable causa) {
        return new ProveedorIaException(
                proveedor, null, true, true, mensaje, causa);
    }

    public static ProveedorIaException respuestaInvalida(String proveedor, String mensaje) {
        return new ProveedorIaException(
                proveedor, null, false, true, mensaje, null);
    }
}
