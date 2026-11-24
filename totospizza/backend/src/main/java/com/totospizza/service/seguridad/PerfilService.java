package com.totospizza.service.seguridad;

import java.util.List;

import com.totospizza.dto.request.seguridad.ActualizarPerfilRequest;
import com.totospizza.dto.request.seguridad.DireccionClienteRequest;
import com.totospizza.dto.response.seguridad.DireccionClienteResponse;
import com.totospizza.dto.response.seguridad.PerfilResponse;

/** Perfil del cliente autenticado y su libreta de direcciones. */
public interface PerfilService {

    PerfilResponse obtener(Long usuarioId);

    PerfilResponse actualizar(Long usuarioId, ActualizarPerfilRequest request);

    List<DireccionClienteResponse> listarDirecciones(Long usuarioId);

    DireccionClienteResponse agregarDireccion(Long usuarioId, DireccionClienteRequest request);

    DireccionClienteResponse actualizarDireccion(Long usuarioId, Long direccionId, DireccionClienteRequest request);

    void eliminarDireccion(Long usuarioId, Long direccionId);
}
