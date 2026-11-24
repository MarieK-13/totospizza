package com.totospizza.service.impl.operacion;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

import com.totospizza.exception.AccesoDenegadoException;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.seguridad.Empleado;
import com.totospizza.repository.seguridad.EmpleadoRepository;

@Component
@RequiredArgsConstructor
class PersonalActual {

    private final EmpleadoRepository empleadoRepository;

    Empleado de(Long usuarioId) {
        return empleadoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new AccesoDenegadoException("SIN_PERFIL_PERSONAL",
                        "Tu usuario no tiene un perfil de personal asignado"));
    }

    void exigirMismaSucursal(Empleado empleado, Pedido pedido) {
        if (!pedido.getSucursal().getId().equals(empleado.getSucursal().getId())) {
            throw new RecursoNoEncontradoException("Pedido", pedido.getId());
        }
    }
}
