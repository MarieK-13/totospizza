package com.totospizza.rules.generator;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

import com.totospizza.repository.pedido.PedidoRepository;

/**
 * Número visible del pedido (PZ-2847).
 */
@Component
@RequiredArgsConstructor
public class NumeroPedidoGenerator {

    private final PedidoRepository pedidoRepository;

    public String siguiente() {
        return "PZ-" + pedidoRepository.siguienteNumero();
    }
}
