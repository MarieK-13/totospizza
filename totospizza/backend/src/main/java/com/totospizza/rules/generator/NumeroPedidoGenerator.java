package com.totospizza.rules.generator;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

import com.totospizza.repository.pedido.PedidoRepository;

/**
 * Número visible del pedido (PZ-2847). Sale de la secuencia {@code seq_numero_pedido}, así que
 * es único aunque lleguen pedidos al mismo tiempo.
 */
@Component
@RequiredArgsConstructor
public class NumeroPedidoGenerator {

    private final PedidoRepository pedidoRepository;

    public String siguiente() {
        return "PZ-" + pedidoRepository.siguienteNumero();
    }
}
