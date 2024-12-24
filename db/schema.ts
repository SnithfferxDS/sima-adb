import { mysqlTable, int, text, varchar, date, double } from 'drizzle-orm/mysql-core';

export const DSproducts = mysqlTable("productos", {
    id: int("id_producto").primaryKey().autoincrement().notNull(),
    productType: int("id_tipo_producto"),
    image: text('imagen'),
    name: varchar('nombre', { length: 100 }).notNull(),
    upc: varchar('upc', { length: 100 }),
    sku: varchar('modelo', { length: 100 }).notNull(),
    link: varchar('enlace', { length: 500 }).notNull(),
    logn_description: text('descripcion'),
    warehouse: int("id_ubicacion"),
    stockMin: int("stock_minimo"),
    stockMax: int("stock_maximo"),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    fechaIntro: date("fecha_intro", { mode: 'string' }),
    defaultWarranty: varchar("garantia_por_defecto", { length: 100 }),
    disabled: int('desabilitar'),
    weight: varchar('peso', { length: 200 }),
    preSale: varchar('postventa', { length: 15 }),
    cesc: varchar('cesc', { length: 15 }).notNull(),
    shortDescription: text("descripcion_corta"),
    refurbished: varchar('seminuevo', { length: 15 }).default('\'false\''),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    offerEndDate: date('vencimiento', { mode: 'string' }),
    isOffer: varchar('promocion', { length: 15 }).default('\'false\''),
    showDescription: varchar("mostrar_des", { length: 10 }),
    warrantyTerms: varchar("terminos_garantia", { length: 500 }),
    descoutntPercentage: varchar("descuento_porcentaje", { length: 25 }),
    partNumber: varchar("numero_parte", { length: 250 }),
    origin: int("id_pais_origen"),
    offerStart: date("inicio_promo", { mode: 'string' }),
    liquidation: varchar("liquidacion", { length: 6 }),
    shipping: varchar("envio", { length: 6 }),
});

export const DSpurchases = mysqlTable("entradas", {
    id: int("id_entrada").autoincrement().notNull(),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    createdAt: date('fecha', { mode: 'string' }),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    invoiceDate: date("fecha_factura", { mode: 'string' }).notNull(),
    invoiceNumber: varchar('factura', { length: 100 }).notNull(),
    productId: int("id_producto"),
    supplierId: int("id_proveedor"),
    userId: int("id_usuario").notNull(),
    docTypeId: int("id_documento").notNull(),
    unitCost: double("costo_unitario", { precision: 10, scale: 2 }),
    qnt: int('cantidad'),
    costoTotal: double("costo_total", { precision: 10, scale: 2 }),
    rentention: varchar('retenido', { length: 25 }),
    prossesed: varchar('procesada', { length: 15 }).default('\'false\'').notNull(),
    holdOldCost: varchar("mantener_costo", { length: 15 }).default('\'false\'').notNull(),
    registerCost: double("registro_costo", { precision: 10, scale: 2 }),
    duca: varchar('duca', { length: 25 }),
});

export const DSusers = mysqlTable("usuarios", {
    id: int("id_usuario").autoincrement().notNull(),
    name: varchar('nombre', { length: 100 }).notNull(),
    email: varchar('email', { length: 100 }).notNull(),
    password: varchar('clave', { length: 100 }).notNull(),
    active: varchar('activo', { length: 100 }).notNull(),
    idPuesto: int("id_puesto"),
    user: varchar('usuario', { length: 100 }),
    idNivel: int("id_nivel"),
    movil: varchar('movil', { length: 100 }).notNull(),
    phone: varchar("telefono_fijo", { length: 100 }).notNull(),
    dui: varchar('dui', { length: 100 }).notNull(),
    nit: varchar('nit', { length: 100 }).notNull(),
    isss: varchar('iss', { length: 100 }).notNull(),
    afp: varchar('afp', { length: 100 }).notNull(),
    codigo: varchar('codigo', { length: 50 }).notNull(),
    area: varchar('area', { length: 200 }),
    boss: varchar('jefatura', { length: 15 }).default('\'false\'').notNull(),
    idSucursal: int("id_sucursal"),
    idEmpresa: int("id_empresa"),
});

export const DSsuppliers = mysqlTable("proveedores", {
    idProveedor: int("id_proveedor").autoincrement().notNull(),
    empresa: varchar('empresa', { length: 100 }),
    direccion: text('direccion'),
    telefono: varchar('telefono', { length: 100 }),
    nit: varchar('nit', { length: 100 }).notNull(),
    nrc: varchar('nrc', { length: 100 }).notNull(),
    comentario: text('comentario').notNull(),
});