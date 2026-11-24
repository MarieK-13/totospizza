package com.totospizza.exception;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import lombok.extern.slf4j.Slf4j;

import com.totospizza.dto.common.ApiError;
import com.totospizza.dto.common.CampoError;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<ApiError> negocio(NegocioException e, HttpServletRequest request) {
        return respuesta(e.getEstado(), e.getCodigo(), e.getMessage(), request, List.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> cuerpoInvalido(MethodArgumentNotValidException e, HttpServletRequest request) {
        List<CampoError> errores = e.getBindingResult().getFieldErrors().stream()
                .map(error -> new CampoError(error.getField(), error.getDefaultMessage()))
                .toList();
        return respuesta(400, "VALIDACION_FALLIDA", "Revisa los datos enviados", request, errores);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> restriccionViolada(ConstraintViolationException e, HttpServletRequest request) {
        List<CampoError> errores = e.getConstraintViolations().stream()
                .map(violacion -> new CampoError(violacion.getPropertyPath().toString(), violacion.getMessage()))
                .toList();
        return respuesta(400, "VALIDACION_FALLIDA", "Revisa los datos enviados", request, errores);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiError> parametrosInvalidos(HandlerMethodValidationException e, HttpServletRequest request) {
        return respuesta(400, "VALIDACION_FALLIDA", "Hay parámetros inválidos en la solicitud", request, List.of());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> jsonIlegible(HttpMessageNotReadableException e, HttpServletRequest request) {
        return respuesta(400, "CUERPO_INVALIDO", "El cuerpo de la solicitud no es válido", request, List.of());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> archivoMuyGrande(MaxUploadSizeExceededException e, HttpServletRequest request) {
        return respuesta(413, "ARCHIVO_MUY_GRANDE", "El archivo es demasiado grande", request, List.of());
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ApiError> archivoFaltante(MissingServletRequestPartException e, HttpServletRequest request) {
        return respuesta(400, "ARCHIVO_REQUERIDO", "Falta el archivo '" + e.getRequestPartName() + "'", request,
                List.of());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> tipoIncorrecto(MethodArgumentTypeMismatchException e, HttpServletRequest request) {
        return respuesta(400, "PARAMETRO_INVALIDO", "El parámetro '" + e.getName() + "' no es válido", request,
                List.of());
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> parametroFaltante(MissingServletRequestParameterException e,
                                                      HttpServletRequest request) {
        return respuesta(400, "PARAMETRO_FALTANTE", "Falta el parámetro '" + e.getParameterName() + "'", request,
                List.of());
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> metodoNoPermitido(HttpRequestMethodNotSupportedException e,
                                                      HttpServletRequest request) {
        return respuesta(405, "METODO_NO_PERMITIDO", "Esa ruta no admite " + e.getMethod(), request, List.of());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiError> rutaInexistente(NoResourceFoundException e, HttpServletRequest request) {
        return respuesta(404, "RUTA_NO_ENCONTRADA", "La ruta solicitada no existe", request, List.of());
    }

    /** Lo lanza {@code @PreAuthorize} dentro del controller, por eso llega aquí y no al filtro de seguridad. */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> accesoDenegado(AccessDeniedException e, HttpServletRequest request) {
        return respuesta(403, "ACCESO_DENEGADO", "No tienes permiso para esta acción", request, List.of());
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiError> concurrencia(ObjectOptimisticLockingFailureException e, HttpServletRequest request) {
        return respuesta(409, "CONFLICTO_CONCURRENCIA", "El registro cambió mientras lo editabas. Vuelve a intentarlo",
                request, List.of());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> integridad(DataIntegrityViolationException e, HttpServletRequest request) {
        log.warn("Violación de integridad en {}", request.getRequestURI(), e);
        return respuesta(409, "CONFLICTO_DATOS", "La operación choca con datos que ya existen", request, List.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> inesperado(Exception e, HttpServletRequest request) {
        log.error("Error no controlado en {}", request.getRequestURI(), e);
        return respuesta(500, "ERROR_INTERNO", "Ocurrió un error inesperado. Inténtalo de nuevo más tarde", request,
                List.of());
    }

    private static ResponseEntity<ApiError> respuesta(int estado, String codigo, String mensaje,
                                                      HttpServletRequest request, List<CampoError> errores) {
        return ResponseEntity.status(estado)
                .body(ApiError.of(estado, codigo, mensaje, request.getRequestURI(), errores));
    }
}
