import {
    db,
    SidebarMenu,
    CommonName,
    Category,
    ProductType,
    Group,
    MetadataValue,
    Metadata,
    User,
    User_Level
} from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	// TODO
    await db.insert(SidebarMenu).values([
        {
            id: 1,
            icon: "list",
            name: "Cotizaciones",
            url: "/quotations",
            submenu: JSON.stringify([
                { title: "Lista", url: "/quotations" },
                { title: "Cotización rápida", url: "/quotations/create_fast" },
            ]),
        },
        {
            id: 2,
            icon: "package_2",
            name: "Proudctos",
            url: "",
            submenu: JSON.stringify([
                { title: "Lista", url: "/products" },
                { title: "Cotizados", url: "/quotations/products" },
            ]),
        },
        {
            id: 3,
            icon: "inventory_2",
            name: "recursos",
            url: "",
            submenu: JSON.stringify([
                { title: "Nombres Comunes", url: "/common-names" },
                { title: "Categorías", url: "/categories" },
                { title: "Marcas", url: "/brands" },
                { title: "Proveedores", url: "/suppliers" },
                { title: "Metadatps", url: "/metadata" },
            ]),
        }
    ]);
    await db.insert(CommonName).values([
        {
          id: 1,
          name: 'Auriculares de Diadema Alámbrico',
          position: 1,
          categories: JSON.stringify([2, 12, 19]),
        },
        {
          id: 2,
          name: 'Auriculares de Diadema Inalámbrico',
          position: 1,
          categories: JSON.stringify([2, 12, 20]),
        },
        {
          id: 3,
          name: 'Auriculares de Pastilla Alámbrico',
          position: 1,
          categories: JSON.stringify([2, 13, 19]),
        },
        {
          id: 4,
          name: 'Auriculares de Pastilla Inalámbrico',
          position: 1,
          categories: JSON.stringify([2, 13, 20]),
        },
        {
          id: 5,
          name: 'Ratón Alámbrico',
          position: 3,
          categories: JSON.stringify([3, 19]),
        },
        {
          id: 6,
          name: 'Ratón Inalámbrico',
          position: 3,
          categories: JSON.stringify([3, 20]),
        },
        {
          id: 7,
          name: 'Teclado Alámbrico',
          position: 2,
          categories: JSON.stringify([4, 19]),
        },
        {
          id: 8,
          name: 'Teclado Inalámbrico',
          position: 1,
          categories: JSON.stringify([4, 20]),
        },
      ]);
    await db.insert(Category).values([
    { id: 1, name: 'Perifericos', slug: 'perifericos' },
    {
    id: 2,
    name: 'Auriculares',
    slug: 'auriculares',
    parents: JSON.stringify([1]),
    },
    { id: 3, name: 'Ratón', slug: 'raton', parents: JSON.stringify([1]) },
    { id: 4, name: 'Teclado', slug: 'teclado' },
    { id: 5, name: 'Kit Teclado y Ratón', slug: 'kit-teclado-raton' },
    { id: 6, name: 'Impresora', slug: 'impresora' },
    { id: 7, name: 'Bocina(s)', slug: 'bocina-s' },
    { id: 8, name: 'Sistema de Sonido', slug: 'sistema-de-sonido' },
    { id: 9, name: 'Cámara Web', slug: 'camara-web' },
    { id: 10, name: 'Teléfono', slug: 'telefono' },
    { id: 11, name: 'Almacenamiento', slug: 'almacenamiento' },
    {
    id: 12,
    name: 'de Diadema',
    slug: 'de-diadema',
    parents: JSON.stringify([1]),
    },
    { id: 13, name: 'de Pastilla', slug: 'de-pastilla' },
    { id: 14, name: 'Portátil', slug: 'portatil' },
    { id: 15, name: 'Sobremesa', slug: 'sobremesa' },
    {
    id: 19,
    name: 'Alámbrico',
    slug: 'alambrico',
    parents: JSON.stringify([12, 13]),
    },
    {
    id: 20,
    name: 'Inalambrico',
    slug: 'inalambrico',
    parents: JSON.stringify([12, 13]),
    },
    { id: 21, name: 'Interno', slug: 'interno' },
    { id: 22, name: 'externo', slug: 'externo' },
    ]);
    await db.insert(ProductType).values([
    { id: 1, name: 'USB', categories: JSON.stringify([19]) },
    { id: 2, name: 'WiFi', categories: JSON.stringify([20]) },
    { id: 3, name: 'Bluetooth', categories: JSON.stringify([20]) },
    { id: 4, name: 'Estéreo 3.5mm', categories: JSON.stringify([19]) },
    { id: 5, name: 'RF', categories: JSON.stringify([20]) },
    { id: 6, name: 'SD', categories: JSON.stringify([]) },
    { id: 7, name: 'microSD', categories: JSON.stringify([]) },
    { id: 8, name: 'CD/DVD', categories: JSON.stringify([]) },
    { id: 9, name: 'HDD', categories: JSON.stringify([]) },
    { id: 10, name: 'SSD', categories: JSON.stringify([]) },
    ]);
    await db.insert(Group).values([
    { id: 1, name: 'Conectividad' },
    { id: 2, name: 'Pantalla' },
    { id: 3, name: 'Almacenamiento' },
    { id: 4, name: 'Caracteristicas' },
    ]);
    await db.insert(Metadata).values([
    { id: 1, name: 'Interfaz', id_group: 1 },
    { id: 2, name: 'Estilo', id_group: 4 },
    { id: 3, name: 'Textura', id_group: 4 },
    { id: 4, name: 'Color', id_group: 4 },
    { id: 5, name: 'Uso', id_group: 4 },
    { id: 6, name: 'Brazos', id_group: 4 },
    { id: 7, name: 'Rodos', id_group: 4 },
    { id: 8, name: 'Botones', id_group: 4 },
    { id: 9, name: 'Capacidad', id_group: 3 },
    { id: 10, name: 'Material', id_group: 4 },
    { id: 11, name: 'Velocidad', id_group: 4 },
    ]);
    await db.insert(MetadataValue).values([
    { id: 2, metadata_id: 1, metadata_value: '2.0 Tipo A' },
    { id: 3, metadata_id: 1, metadata_value: '2.0 Tipo B' },
    { id: 4, metadata_id: 1, metadata_value: '3.0 Tipo B' },
    { id: 5, metadata_id: 1, metadata_value: '3.1 Gen1 Tipo A' },
    { id: 6, metadata_id: 1, metadata_value: '2.4 GHz' },
    { id: 7, metadata_id: 11, metadata_value: '5GHz' },
    { id: 8, metadata_id: 11, metadata_value: '2.4/5 GHz' },
  ]);
    await db.insert(User_Level).values([
        {id:1,name:'sUser', level_value:'sudo', permissions: JSON.stringify(['full']) },
        {id:2,name:'Administrator',level_value:'admin', permissions: JSON.stringify([0,1]) },
        {id:3, name:'Auxiliar', level_value:'aux', permissions: JSON.stringify([2]) },
        {id:4,name:'User', level_value:'user', permissions: JSON.stringify([3]) },
    ])
}
