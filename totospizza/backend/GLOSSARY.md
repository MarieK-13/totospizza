# Toto's Pizza

Sistema web de pedidos de una pizzería artesanal de Ica con tres sucursales. Permite pedir y personalizar pizzas, pagar en línea, seguir el pedido hasta la entrega y operar la cocina, el despacho, el reparto y la administración.

## Language

### Personas y roles

**Cliente**:
Persona que hace pedidos en el sistema.
_Avoid_: Usuario final, comprador

**Pizzero**:
Empleado que prepara y hornea los pedidos en la cocina.
_Avoid_: Cocinero

**Despachador**:
Empleado que entrega los pedidos listos al motorizado o al cliente que recoge en tienda.
_Avoid_: Vendedor, cajero

**Motorizado**:
Empleado que lleva los pedidos con delivery hasta la dirección del cliente.
_Avoid_: Repartidor, courier

**Administrador**:
Empleado que gestiona la carta, el personal, las finanzas y la configuración.

**Rol**:
Función que una persona cumple en el sistema: cliente, pizzero, despachador, motorizado o administrador.
_Avoid_: Cargo, perfil

**Sucursal**:
Local físico de Toto's Pizza donde se prepara y entrega.
_Avoid_: Local, sede, tienda

### Carta

**Producto**:
Artículo de la carta que se vende: pizza, piqueo, ensalada, pasta, postre o bebida.
_Avoid_: Ítem, plato

**Categoría**:
Agrupación principal de la carta, como Pizzas o Bebidas.

**Etiqueta**:
Marca de un producto, ya sea un filtro del menú (Clásica, Especial, Vegetariana) o una insignia (Popular, Nuevo).
_Avoid_: Tag

**Tamaño**:
Medida de una pizza: Personal, Mediana, Grande o Familiar.

**Masa**:
Base de la pizza, por ejemplo Artesanal o Delgada.

**Ingrediente**:
Insumo que el cliente puede elegir: queso, salsa, carne u otro.

**Adicional**:
Ingrediente extra que el cliente agrega a un producto con un costo aparte.
_Avoid_: Extra, topping

**Pizza personalizada**:
Pizza que el cliente arma eligiendo tamaño, masa, quesos, salsas e ingredientes.
_Avoid_: Pizza a medida

**Promoción**:
Oferta con precio especial que se muestra en el Home: combo, 2x1 o descuento.
_Avoid_: Cupón

**Oferta flash**:
Promoción de corta duración cuyo precio puede quedar por debajo del costo, por lo que genera una alerta de pérdida.

### Compra y entrega

**Carrito**:
Selección provisional de productos de un cliente antes de pagar.
_Avoid_: Cesta

**Pedido**:
Compra confirmada de un cliente.
_Avoid_: Orden, compra

**Tipo de entrega**:
Forma en que el cliente recibe su pedido: delivery o recojo en tienda.

**Delivery**:
Entrega del pedido en la dirección del cliente.

**Recojo en tienda**:
Entrega en la que el cliente retira su pedido en la sucursal que eligió.
_Avoid_: Pickup, retiro

**Cobertura**:
Área dentro de la cual una sucursal hace delivery, definida por un radio en kilómetros.

**Zona de reparto**:
Anillo de distancia alrededor de una sucursal con su costo de envío.

**Envío gratis**:
Delivery sin costo cuando el subtotal del pedido alcanza el monto mínimo configurado.

**Pago**:
Cobro de un pedido con un método de pago: tarjeta, Yape, Plin, CMR o efectivo.

**Entrega**:
Reparto de un pedido con delivery, desde que se asigna a un motorizado hasta que se confirma.

**Código de entrega**:
Número de 4 dígitos que el cliente le da al motorizado para confirmar que recibió su pedido.
_Avoid_: PIN, código único, clave

**Estado del pedido**:
Situación interna de un pedido: pendiente de pago, confirmado, en preparación, en el horno, listo, en camino, entregado, cancelado o no recogido.

**Etapa de seguimiento**:
Cada una de las cuatro etapas que ve el cliente: Preparación, Horno, En camino y Entregado.
_Avoid_: Fase

**Ventana de cancelación**:
Periodo en el que el cliente puede cancelar y recibir reembolso; termina cuando el pedido entra al horno.

**Pedido no recogido**:
Pedido para recojo en tienda que el cliente no retiró dentro de los 90 minutos posteriores a estar listo; no se reembolsa.

**Garantía TOTO**:
Compensación que recibe el cliente cuando su delivery llega con demora.

### Operación

**Turno**:
Periodo de trabajo programado de un empleado en una sucursal.

**Inventario**:
Existencias de un ingrediente en una sucursal. El inventario online y el físico se llevan por separado.

**Pago al motorizado**:
Liquidación de un motorizado por un periodo: pago base por turno más un bono por cada entrega.

**Reseña**:
Opinión de un cliente sobre un pedido, con estrellas para cada producto.

**Reseña destacada**:
Reseña elegida por el administrador para mostrarse en la página Nosotros.
