-- =====================================================================================
-- Datos demo (perfil dev): catálogo completo del inicio, combos y las 3 sucursales de Ica.
-- Se ejecuta después de V100 y no modifica migraciones ya aplicadas.
-- Las imágenes son rutas del frontend (frontend/public/images).
-- Coordenadas de las sucursales: aproximadas; se pueden ajustar con Google Maps.
-- =====================================================================================

-- ── Sucursales ───────────────────────────────────────────────────────────────────────
-- La sucursal demo de V100 pasa a ser la de Calle Lima (conserva empleados, horario, zonas e inventario).
update sucursales
set nombre             = 'Toto''s Pizza Calle Lima',
    direccion          = 'Calle Lima 423',
    referencia         = 'A tres cuadras de la Plaza de Armas',
    distrito           = 'Ica',
    latitud            = -14.066500,
    longitud           = -75.730200,
    telefono           = '970909904',
    imagen_url         = 'images/local-calle-lima-web.jpg',
    radio_cobertura_km = 3.5
where nombre = 'Toto''s Pizza Ica Centro';

insert into sucursales (nombre, direccion, referencia, distrito, latitud, longitud, telefono, imagen_url, activa, radio_cobertura_km) values
    ('Toto''s Pizza Av. San Martín', 'Av. San Martín 1437', 'Cerca a la Av. Ayabaca', 'Ica',
     -14.074500, -75.736000, '956232580', 'images/local-san-martin-web.jpg', true, 3.5),
    ('Toto''s Pizza Huacachina', 'Los Ficus, camino a Huacachina, Sector II Mz. C Lt. 16', 'En la vía a la laguna de Huacachina', 'Ica',
     -14.082200, -75.752000, '956232581', 'images/local-ficus.jpg', true, 3.5);

-- Horario, zonas de reparto e inventario web solo para las sucursales nuevas
insert into horarios_sucursal (sucursal_id, dia_semana, hora_inicio, hora_fin, cerrado)
select s.id, d, '12:00', '23:00', false
from sucursales s, unnest(array['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']) as d
where s.nombre in ('Toto''s Pizza Av. San Martín', 'Toto''s Pizza Huacachina');

insert into zonas_reparto (sucursal_id, nombre, distancia_desde_km, distancia_hasta_km, costo_envio, activa)
select s.id, z.nombre, z.desde, z.hasta, z.costo, true
from sucursales s,
     (values ('Zona 1', 0.0, 1.5, 3.00), ('Zona 2', 1.5, 3.5, 5.00)) as z(nombre, desde, hasta, costo)
where s.nombre in ('Toto''s Pizza Av. San Martín', 'Toto''s Pizza Huacachina');

-- Stock Web Exclusivo: 30 masas diarias por sucursal nueva
insert into inventario_ingredientes (ingrediente_id, sucursal_id, canal, stock_actual, stock_minimo, unidad)
select i.id, s.id, 'ONLINE', 30, 5, 'UNIDAD'
from ingredientes i, sucursales s
where i.nombre = 'Masa de pizza'
  and s.nombre in ('Toto''s Pizza Av. San Martín', 'Toto''s Pizza Huacachina');

-- ── Categoría Antojitos ──────────────────────────────────────────────────────────────
insert into categorias (nombre, slug, orden) values ('Antojitos', 'antojitos', 4);

-- ── Imágenes de los productos de V100 ────────────────────────────────────────────────
update productos set imagen_url = 'images/pepperoni.jpg' where slug = 'pizza-pepperoni';
update productos set imagen_url = 'images/verde.jpg'     where slug = 'pizza-vegetariana';
update productos set imagen_url = 'images/cocacola.jpg'  where slug = 'gaseosa-1-5-l';

-- ── Pizzas de la casa ────────────────────────────────────────────────────────────────
-- precio_base = precio de la mediana; cada tamaño usa el precio base del tamaño por el factor de la pizza.
insert into productos (categoria_id, nombre, slug, descripcion, imagen_url, precio_base, requiere_tamano, disponible, destacado)
select c.id, p.nombre, p.slug, p.descripcion, p.imagen, round(32.00 * p.factor, 2), true, true, p.destacado
from (values
    ('Margherita Verace',   'margherita-verace', 'Salsa San Marzano, fior di latte, albahaca fresca y aceite de oliva.', 'images/margherita.jpg', 1.00, false),
    ('Diavola Picante',     'diavola-picante',   'Salame italiano, mozzarella, ají limo y miel picante.',                'images/diavola.jpg',    1.10, true),
    ('Carnívora TOTO',      'carnivora-toto',    'Salchicha italiana, tocino ahumado, pepperoni y cebolla morada.',       'images/carnivora.jpg',  1.15, true),
    ('La Burrata',          'la-burrata',        'Pomodoro, burrata cremosa, pesto y tomates confitados.',               'images/burrata.jpg',    1.20, true),
    ('Prosciutto e Rúcula', 'prosciutto-rucula', 'Prosciutto, rúcula, parmesano y aceite de oliva.',                     'images/prosciutto.jpg', 1.20, false),
    ('Portobello',          'portobello',        'Hongos portobello, mozzarella, ajo confitado y tomillo fresco.',       'images/portobello.jpg', 1.05, false),
    ('Andina',              'andina',            'Chorizo artesanal, rocoto, cebolla encurtida, choclo y huacatay.',     'images/andina.jpg',     1.10, true),
    ('La Verde',            'la-verde',          'Pesto de albahaca, zucchini, alcachofa, aceitunas y ricotta.',         'images/verde.jpg',      1.05, false)
) as p(nombre, slug, descripcion, imagen, factor, destacado)
join categorias c on c.slug = 'pizzas';

insert into producto_tamanos (producto_id, tamano_id, precio)
select p.id, t.id, round(t.precio_base * p.precio_base / 32.00, 2)
from productos p
join tamanos_pizza t on true
where p.slug in ('margherita-verace', 'diavola-picante', 'carnivora-toto', 'la-burrata',
                 'prosciutto-rucula', 'portobello', 'andina', 'la-verde');

-- ── Antojitos y bebidas ──────────────────────────────────────────────────────────────
insert into productos (categoria_id, nombre, slug, descripcion, imagen_url, precio_base, requiere_tamano, disponible, destacado)
select c.id, p.nombre, p.slug, p.descripcion, p.imagen, p.precio, false, true, false
from (values
    ('antojitos', 'Alitas BBQ',          'alitas-bbq',    '8 alitas bañadas en salsa BBQ de la casa.',              'images/antojo-alitas.png',      22.90),
    ('antojitos', 'Papas fritas',        'papas-fritas',  'Porción para compartir, crocantes y doradas.',           'images/antojo-papas.png',       14.90),
    ('antojitos', 'Nuggets',             'nuggets',       '10 nuggets de pollo con salsa a elección.',              'images/antojo-nuggets.png',     17.90),
    ('antojitos', 'Pan de ajo',          'pan-de-ajo',    '4 rebanadas de pan de la casa con mantequilla de ajo.',  'images/antojo-pan-ajo.png',     13.90),
    ('antojitos', 'Onion rings',         'onion-rings',   '12 aros de cebolla apanados.',                           'images/antojo-onion-rings.png', 15.90),
    ('antojitos', 'Tequeños',            'tequenos',      '6 tequeños de queso con guacamole.',                     'images/antojo-tequenos.png',    16.90),
    ('antojitos', 'Croquetas',           'croquetas',     '6 croquetas de jamón y queso.',                          'images/antojo-croquetas.png',   18.90),
    ('bebidas',   'Coca-Cola 500 ml',    'coca-cola-500', 'Botella personal bien helada.',                          'images/cocacola.jpg',            5.00),
    ('bebidas',   'Inca Kola 500 ml',    'inca-kola-500', 'Botella personal bien helada.',                          'images/InkaK.jpg',               5.00),
    ('bebidas',   'Agua sin gas 625 ml', 'agua-sin-gas',  'Agua de mesa sin gas.',                                  null,                             3.00)
) as p(categoria, nombre, slug, descripcion, imagen, precio)
join categorias c on c.slug = p.categoria;

-- ── Etiquetas (alérgenos y dietas) ───────────────────────────────────────────────────
insert into producto_etiquetas (producto_id, etiqueta_id)
select p.id, e.id
from (values
    ('margherita-verace', 'contiene-gluten'), ('margherita-verace', 'contiene-lacteos'), ('margherita-verace', 'vegetariana'),
    ('diavola-picante',   'contiene-gluten'), ('diavola-picante',   'contiene-lacteos'), ('diavola-picante',   'picante'),
    ('carnivora-toto',    'contiene-gluten'), ('carnivora-toto',    'contiene-lacteos'),
    ('la-burrata',        'contiene-gluten'), ('la-burrata',        'contiene-lacteos'), ('la-burrata', 'contiene-frutos-secos'), ('la-burrata', 'vegetariana'),
    ('prosciutto-rucula', 'contiene-gluten'), ('prosciutto-rucula', 'contiene-lacteos'),
    ('portobello',        'contiene-gluten'), ('portobello',        'contiene-lacteos'), ('portobello', 'vegetariana'),
    ('andina',            'contiene-gluten'), ('andina',            'contiene-lacteos'), ('andina', 'picante'),
    ('la-verde',          'contiene-gluten'), ('la-verde',          'contiene-lacteos'), ('la-verde', 'contiene-frutos-secos'), ('la-verde', 'vegetariana'),
    ('alitas-bbq',        'sin-lacteos'),
    ('papas-fritas',      'sin-lacteos'),     ('papas-fritas',      'vegetariana'),
    ('nuggets',           'contiene-gluten'),
    ('pan-de-ajo',        'contiene-gluten'), ('pan-de-ajo',        'contiene-lacteos'), ('pan-de-ajo', 'vegetariana'),
    ('onion-rings',       'contiene-gluten'), ('onion-rings',       'vegetariana'),
    ('tequenos',          'contiene-gluten'), ('tequenos',          'contiene-lacteos'), ('tequenos', 'vegetariana'),
    ('croquetas',         'contiene-gluten'), ('croquetas',         'contiene-lacteos'),
    ('coca-cola-500',     'sin-lacteos'),     ('inca-kola-500',     'sin-lacteos'),       ('agua-sin-gas', 'sin-lacteos')
) as x(producto, etiqueta)
join productos p on p.slug = x.producto
join etiquetas e on e.slug = x.etiqueta;

-- ── Promociones ──────────────────────────────────────────────────────────────────────
-- Carrusel del inicio: tipo DESCUENTO.
-- "Elige tu Duo": tipo COMBO. Las promociones con la misma etiqueta forman un duo
-- y cada una es una opción para completarlo.
create temporary table promos_demo (
    clave       text primary key,
    titulo      text not null,
    descripcion text,
    tipo        text not null,
    etiqueta    text,
    precio      numeric(10,2) not null,
    costo       numeric(10,2),
    imagen      text,
    color       text not null,
    condiciones text,
    orden       integer not null
);

insert into promos_demo values
    ('familiar',      'La noche sabe mejor en familia', 'Pizza Pepperoni y Carnívora TOTO familiares + pan de ajo + gaseosa de 1.5 L.', 'DESCUENTO', 'Promo familiar', 89.90, 55.00, 'images/hero-promo-familiar.jpg', 'ROJO',   'Hasta agotar el stock web del día.', 1),
    ('cena-dos',      'Pizza + pan de ajo + gaseosa',   'La cena para dos: Pizza Pepperoni mediana, pan de ajo y gaseosa de 1.5 L.',   'DESCUENTO', 'Combo',          44.90, 26.00, 'images/hero-combo.jpg',          'BLANCO', 'Hasta agotar el stock web del día.', 2),
    ('veggie',        'Pizza veggie para compartir',    'La Verde familiar + 2 Inca Kola de 500 ml.',                                   'DESCUENTO', 'Oferta',         49.90, 30.00, 'images/hero-oferta-veggie.jpg',  'VERDE',  'Hasta agotar el stock web del día.', 3),

    ('pp-coca',       'Pack Pepperoni + Coca-Cola',     'Pizza Pepperoni mediana + 1 bebida a tu elección.', 'COMBO', 'Pack Pepperoni & Co', 34.90, 20.00, 'images/cocacola.jpg', 'ROJO', null, 10),
    ('pp-inca',       'Pack Pepperoni + Inca Kola',     'Pizza Pepperoni mediana + 1 bebida a tu elección.', 'COMBO', 'Pack Pepperoni & Co', 34.90, 20.00, 'images/InkaK.jpg',    'ROJO', null, 11),
    ('pp-agua',       'Pack Pepperoni + Agua',          'Pizza Pepperoni mediana + 1 bebida a tu elección.', 'COMBO', 'Pack Pepperoni & Co', 33.90, 19.50, null,                  'ROJO', null, 12),

    ('mp-pan',        'Match Perfecto + Pan de ajo',    'Inca Kola de 500 ml + 1 antojito para compartir.', 'COMBO', 'Match Perfecto', 16.90,  9.00, 'images/antojo-pan-ajo.png',     'BLANCO', null, 20),
    ('mp-tequenos',   'Match Perfecto + Tequeños',      'Inca Kola de 500 ml + 1 antojito para compartir.', 'COMBO', 'Match Perfecto', 19.90, 10.50, 'images/antojo-tequenos.png',    'BLANCO', null, 21),
    ('mp-croquetas',  'Match Perfecto + Croquetas',     'Inca Kola de 500 ml + 1 antojito para compartir.', 'COMBO', 'Match Perfecto', 21.90, 11.50, 'images/antojo-croquetas.png',   'BLANCO', null, 22),
    ('mp-alitas',     'Match Perfecto + Alitas BBQ',    'Inca Kola de 500 ml + 1 antojito para compartir.', 'COMBO', 'Match Perfecto', 24.90, 14.00, 'images/antojo-alitas.png',      'BLANCO', null, 23),
    ('mp-onion',      'Match Perfecto + Onion rings',   'Inca Kola de 500 ml + 1 antojito para compartir.', 'COMBO', 'Match Perfecto', 18.90, 10.00, 'images/antojo-onion-rings.png', 'BLANCO', null, 24),

    ('ac-margherita', 'Antojo Compartido + Margherita', 'Alitas BBQ + papas fritas, más la pizza mediana que elijas.', 'COMBO', 'Antojo Compartido', 59.90, 36.00, 'images/margherita.jpg', 'VERDE', null, 30),
    ('ac-verde',      'Antojo Compartido + La Verde',   'Alitas BBQ + papas fritas, más la pizza mediana que elijas.', 'COMBO', 'Antojo Compartido', 61.90, 37.00, 'images/verde.jpg',      'VERDE', null, 31),
    ('ac-andina',     'Antojo Compartido + Andina',     'Alitas BBQ + papas fritas, más la pizza mediana que elijas.', 'COMBO', 'Antojo Compartido', 62.90, 37.50, 'images/andina.jpg',     'VERDE', null, 32),
    ('ac-portobello', 'Antojo Compartido + Portobello', 'Alitas BBQ + papas fritas, más la pizza mediana que elijas.', 'COMBO', 'Antojo Compartido', 61.90, 37.00, 'images/portobello.jpg', 'VERDE', null, 33),

    ('bf-burrata',    'Banquete Familiar + La Burrata', 'Carnívora TOTO familiar + otra pizza familiar a tu elección.', 'COMBO', 'Banquete Familiar', 99.90, 60.00, 'images/burrata.jpg',    'ROJO', null, 40),
    ('bf-diavola',    'Banquete Familiar + Diavola',    'Carnívora TOTO familiar + otra pizza familiar a tu elección.', 'COMBO', 'Banquete Familiar', 94.90, 57.00, 'images/diavola.jpg',    'ROJO', null, 41),
    ('bf-prosciutto', 'Banquete Familiar + Prosciutto', 'Carnívora TOTO familiar + otra pizza familiar a tu elección.', 'COMBO', 'Banquete Familiar', 99.90, 60.00, 'images/prosciutto.jpg', 'ROJO', null, 42),
    ('bf-andina',     'Banquete Familiar + Andina',     'Carnívora TOTO familiar + otra pizza familiar a tu elección.', 'COMBO', 'Banquete Familiar', 94.90, 57.00, 'images/andina.jpg',     'ROJO', null, 43);

insert into promociones (titulo, descripcion, tipo, etiqueta, precio_promocional, costo_estimado, imagen_url, color_fondo,
                         condiciones, vigente_desde, vigente_hasta, activa, orden)
select titulo, descripcion, tipo, etiqueta, precio, costo, imagen, color,
       condiciones, now() - interval '1 day', now() + interval '1 year', true, orden
from promos_demo;

-- Productos de cada promoción (tamaño solo en las pizzas)
insert into promocion_items (promocion_id, producto_id, tamano_id, cantidad)
select pr.id, p.id, t.id, x.cantidad
from (values
    ('familiar', 'pizza-pepperoni', 'Familiar', 1), ('familiar', 'carnivora-toto', 'Familiar', 1),
    ('familiar', 'pan-de-ajo',      null,       1), ('familiar', 'gaseosa-1-5-l',  null,       1),
    ('cena-dos', 'pizza-pepperoni', 'Mediana',  1), ('cena-dos', 'pan-de-ajo',     null,       1), ('cena-dos', 'gaseosa-1-5-l', null, 1),
    ('veggie',   'la-verde',        'Familiar', 1), ('veggie',   'inca-kola-500',  null,       2),

    ('pp-coca', 'pizza-pepperoni', 'Mediana', 1), ('pp-coca', 'coca-cola-500', null, 1),
    ('pp-inca', 'pizza-pepperoni', 'Mediana', 1), ('pp-inca', 'inca-kola-500', null, 1),
    ('pp-agua', 'pizza-pepperoni', 'Mediana', 1), ('pp-agua', 'agua-sin-gas',  null, 1),

    ('mp-pan',       'inca-kola-500', null, 1), ('mp-pan',       'pan-de-ajo',  null, 1),
    ('mp-tequenos',  'inca-kola-500', null, 1), ('mp-tequenos',  'tequenos',    null, 1),
    ('mp-croquetas', 'inca-kola-500', null, 1), ('mp-croquetas', 'croquetas',   null, 1),
    ('mp-alitas',    'inca-kola-500', null, 1), ('mp-alitas',    'alitas-bbq',  null, 1),
    ('mp-onion',     'inca-kola-500', null, 1), ('mp-onion',     'onion-rings', null, 1),

    ('ac-margherita', 'alitas-bbq', null, 1), ('ac-margherita', 'papas-fritas', null, 1), ('ac-margherita', 'margherita-verace', 'Mediana', 1),
    ('ac-verde',      'alitas-bbq', null, 1), ('ac-verde',      'papas-fritas', null, 1), ('ac-verde',      'la-verde',          'Mediana', 1),
    ('ac-andina',     'alitas-bbq', null, 1), ('ac-andina',     'papas-fritas', null, 1), ('ac-andina',     'andina',            'Mediana', 1),
    ('ac-portobello', 'alitas-bbq', null, 1), ('ac-portobello', 'papas-fritas', null, 1), ('ac-portobello', 'portobello',        'Mediana', 1),

    ('bf-burrata',    'carnivora-toto', 'Familiar', 1), ('bf-burrata',    'la-burrata',        'Familiar', 1),
    ('bf-diavola',    'carnivora-toto', 'Familiar', 1), ('bf-diavola',    'diavola-picante',   'Familiar', 1),
    ('bf-prosciutto', 'carnivora-toto', 'Familiar', 1), ('bf-prosciutto', 'prosciutto-rucula', 'Familiar', 1),
    ('bf-andina',     'carnivora-toto', 'Familiar', 1), ('bf-andina',     'andina',            'Familiar', 1)
) as x(promo, producto, tamano, cantidad)
join promos_demo d on d.clave = x.promo
join promociones pr on pr.titulo = d.titulo
join productos p on p.slug = x.producto
left join tamanos_pizza t on t.nombre = x.tamano;

-- Precio anterior = lo que costarían los productos comprados por separado
update promociones pr
set precio_anterior = suelto.total
from (
    select pi.promocion_id,
           sum(pi.cantidad * coalesce(pt.precio, p.precio_base)) as total
    from promocion_items pi
    join productos p on p.id = pi.producto_id
    left join producto_tamanos pt on pt.producto_id = pi.producto_id and pt.tamano_id = pi.tamano_id
    group by pi.promocion_id
) as suelto
where pr.id = suelto.promocion_id
  and pr.titulo in (select titulo from promos_demo);

drop table promos_demo;
