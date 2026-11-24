package com.totospizza.security.userdetails;

import com.totospizza.model.enums.Rol;

public record UsuarioAutenticado(Long id, String correo, Rol rol) {
}
