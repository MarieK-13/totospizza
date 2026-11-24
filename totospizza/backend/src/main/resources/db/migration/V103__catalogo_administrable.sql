-- Catálogo administrable: tamaños activables, ingredientes de cada producto e imágenes subidas.

alter table tamanos_pizza add column activo boolean not null default true;

create table producto_ingredientes (
    producto_id bigint not null,
    ingrediente_id bigint not null,
    primary key (producto_id, ingrediente_id),
    constraint fk_producto_ingredientes_producto_id foreign key (producto_id) references productos (id) on delete cascade,
    constraint fk_producto_ingredientes_ingrediente_id foreign key (ingrediente_id) references ingredientes (id)
);

create index idx_producto_ingredientes_ingrediente_id on producto_ingredientes (ingrediente_id);

-- Las imágenes subidas se guardan con la URL completa del backend.
alter table productos alter column imagen_url type varchar(500);
