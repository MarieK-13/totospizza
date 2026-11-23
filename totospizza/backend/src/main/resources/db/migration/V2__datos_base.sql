
insert into parametros_sistema (clave, valor, tipo, descripcion) values
    ('envio_gratis_desde',         '49.00', 'NUMERO', 'Subtotal (S/) desde el cual el delivery es gratis'),
    ('costo_delivery_base',        '5.00',  'NUMERO', 'Costo de delivery (S/) cuando no hay zona de reparto configurada'),
    ('radio_cobertura_km',         '3.5',   'NUMERO', 'Radio de cobertura de delivery en km'),
    ('minutos_preparacion',        '25',    'NUMERO', 'Minutos de cocina por pedido'),
    ('minutos_por_km',             '4',     'NUMERO', 'Minutos de viaje por kilómetro'),
    ('minutos_vencimiento_recojo', '90',    'NUMERO', 'Minutos que un pedido para recoger espera antes de marcarse no recogido'),
    ('minutos_expiracion_pago',    '15',    'NUMERO', 'Minutos que un pedido sin pago espera antes de cancelarse'),
    ('minutos_tolerancia_garantia','10',    'NUMERO', 'Minutos de tolerancia antes de aplicar la Garantía TOTO');

insert into metodos_pago_habilitados (metodo, activo, orden) values
    ('TARJETA', true, 1),
    ('YAPE',    true, 2),
    ('PLIN',    true, 3),
    ('CMR',     true, 4);

insert into perfil_negocio (nombre_comercial) values ('Toto''s Pizza');

insert into categorias (nombre, slug, orden) values
    ('Pizzas',  'pizzas',  1),
    ('Bebidas', 'bebidas', 2),
    ('Salsas',  'salsas',  3);

insert into etiquetas (nombre, slug, es_filtro) values
    ('Contiene Gluten',        'contiene-gluten',        false),
    ('Contiene Lácteos',       'contiene-lacteos',       false),
    ('Sin Lácteos',            'sin-lacteos',            true),
    ('Contiene Frutos Secos',  'contiene-frutos-secos',  false),
    ('Vegetariana',            'vegetariana',            true),
    ('Picante',                'picante',                true);

with masa as (
    insert into ingredientes (nombre, tipo, precio_extra, disponible)
    values ('Masa de pizza', 'OTRO', 0, true)
    returning id
)
insert into parametros_sistema (clave, valor, tipo, descripcion)
select 'ingrediente_masa_id', id::text, 'NUMERO', 'Ingrediente que representa la masa en el stock web exclusivo'
from masa;
