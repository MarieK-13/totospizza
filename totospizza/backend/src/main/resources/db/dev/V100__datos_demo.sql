
insert into usuarios (nombres, apellidos, tipo_documento, numero_documento, telefono, correo, contrasena_hash, rol, activo) values
    ('Admin',   'Toto',    'DNI', '10000001', '900000001', 'admin@totospizza.pe',      '$2a$10$c2etcmD8ml.ZWdFwhNWhBeHTl9JEVT0kBf48Dej8QOXU6Mcnwjvbu', 'ADMINISTRADOR', true),
    ('Carla',   'Pizzero', 'DNI', '10000002', '900000002', 'pizzero@totospizza.pe',    '$2a$10$c2etcmD8ml.ZWdFwhNWhBeHTl9JEVT0kBf48Dej8QOXU6Mcnwjvbu', 'PIZZERO',       true),
    ('Diego',   'Despacho','DNI', '10000003', '900000003', 'despachador@totospizza.pe','$2a$10$c2etcmD8ml.ZWdFwhNWhBeHTl9JEVT0kBf48Dej8QOXU6Mcnwjvbu', 'DESPACHADOR',   true),
    ('Mario',   'Moto',    'DNI', '10000004', '900000004', 'motorizado@totospizza.pe', '$2a$10$c2etcmD8ml.ZWdFwhNWhBeHTl9JEVT0kBf48Dej8QOXU6Mcnwjvbu', 'MOTORIZADO',    true),
    ('Marife',  'Cliente', 'DNI', '10000005', '900000005', 'cliente@totospizza.pe',    '$2a$10$c2etcmD8ml.ZWdFwhNWhBeHTl9JEVT0kBf48Dej8QOXU6Mcnwjvbu', 'CLIENTE',       true);

insert into sucursales (nombre, direccion, referencia, distrito, latitud, longitud, telefono, activa, radio_cobertura_km)
values ('Toto''s Pizza Ica Centro', 'Av. Grau 123', 'Frente a la Plaza de Armas', 'Ica', -14.067800, -75.728600, '056123456', true, 3.5);

insert into horarios_sucursal (sucursal_id, dia_semana, hora_inicio, hora_fin, cerrado)
select s.id, d, '12:00', '23:00', false
from sucursales s, unnest(array['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']) as d;

insert into zonas_reparto (sucursal_id, nombre, distancia_desde_km, distancia_hasta_km, costo_envio, activa)
select s.id, z.nombre, z.desde, z.hasta, z.costo, true
from sucursales s,
     (values ('Zona 1', 0.0, 1.5, 3.00), ('Zona 2', 1.5, 3.5, 5.00)) as z(nombre, desde, hasta, costo);

insert into empleados (usuario_id, sucursal_id, estado, hora_inicio, hora_fin, fecha_ingreso, pago_base_turno, bono_por_entrega)
select u.id, s.id,
       case u.rol when 'MOTORIZADO' then 'DISPONIBLE' else 'ACTIVO' end,
       '12:00', '23:00', current_date,
       case u.rol when 'MOTORIZADO' then 0 else 40 end,
       case u.rol when 'MOTORIZADO' then 3 else 0 end
from usuarios u, sucursales s
where u.rol in ('PIZZERO', 'DESPACHADOR', 'MOTORIZADO');

-- Stock Web Exclusivo: 30 masas diarias de la sucursal destinadas solo a compras online.
insert into inventario_ingredientes (ingrediente_id, sucursal_id, canal, stock_actual, stock_minimo, unidad)
select i.id, s.id, 'ONLINE', 30, 5, 'UNIDAD'
from ingredientes i, sucursales s
where i.nombre = 'Masa de pizza';

insert into tamanos_pizza (nombre, diametro_cm, personas_min, personas_max, precio_base, orden) values
    ('Personal', 22, 1, 1, 18.00, 1),
    ('Mediana',  30, 2, 3, 32.00, 2),
    ('Familiar', 40, 4, 5, 48.00, 3);

insert into tipos_masa (nombre, recargo, activa) values
    ('Clásica', 0.00, true),
    ('Delgada', 0.00, true),
    ('Borde de queso', 6.00, true);

insert into ingredientes (nombre, tipo, precio_extra, disponible) values
    ('Mozzarella',       'QUESO', 4.00, true),
    ('Queso parmesano',  'QUESO', 4.00, true),
    ('Salsa de tomate',  'SALSA', 0.00, true),
    ('Salsa BBQ',        'SALSA', 2.00, true),
    ('Pepperoni',        'CARNE', 5.00, true),
    ('Jamón',            'CARNE', 4.00, true),
    ('Tocino',           'CARNE', 5.00, true),
    ('Champiñones',      'OTRO',  3.00, true),
    ('Aceitunas',        'OTRO',  2.00, true);

insert into productos (categoria_id, nombre, slug, descripcion, precio_base, requiere_tamano, disponible, destacado)
select c.id, p.nombre, p.slug, p.descripcion, p.precio, p.tamano, true, p.destacado
from (values
    ('pizzas',  'Pizza Pepperoni',  'pizza-pepperoni',  'Masa, salsa de tomate, mozzarella y pepperoni.',          32.00, true,  true),
    ('pizzas',  'Pizza Hawaiana',   'pizza-hawaiana',   'Masa, salsa de tomate, mozzarella, jamón y piña.',        32.00, true,  false),
    ('pizzas',  'Pizza Vegetariana','pizza-vegetariana','Masa, salsa de tomate, mozzarella, champiñones y aceitunas.', 30.00, true, false),
    ('bebidas', 'Gaseosa 1.5 L',    'gaseosa-1-5-l',    'Gaseosa de 1.5 litros.',                                   9.00, false, false),
    ('salsas',  'Salsa BBQ',        'salsa-bbq',        'Porción de salsa BBQ.',                                    2.50, false, false)
) as p(categoria, nombre, slug, descripcion, precio, tamano, destacado)
join categorias c on c.slug = p.categoria;

insert into producto_tamanos (producto_id, tamano_id, precio)
select p.id, t.id, round(t.precio_base * case p.slug when 'pizza-vegetariana' then 0.95 else 1 end, 2)
from productos p join tamanos_pizza t on true
where p.requiere_tamano;

insert into producto_etiquetas (producto_id, etiqueta_id)
select p.id, e.id
from (values
    ('pizza-pepperoni',   'contiene-gluten'),   ('pizza-pepperoni',   'contiene-lacteos'), ('pizza-pepperoni', 'picante'),
    ('pizza-hawaiana',    'contiene-gluten'),   ('pizza-hawaiana',    'contiene-lacteos'),
    ('pizza-vegetariana', 'contiene-gluten'),   ('pizza-vegetariana', 'contiene-lacteos'), ('pizza-vegetariana', 'vegetariana'),
    ('gaseosa-1-5-l',     'sin-lacteos'),
    ('salsa-bbq',         'sin-lacteos')
) as x(producto, etiqueta)
join productos p on p.slug = x.producto
join etiquetas e on e.slug = x.etiqueta;
