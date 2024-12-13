import { defineDb, defineTable, column, NOW } from 'astro:db';

const Product = defineTable({
    columns: {
        id: column.number({ primaryKey: true }),
        name: column.text(),
        handle: column.text({ optional: true }),
        long_description: column.text({ optional: true }),
        short_description: column.text({ optional: true }),
        tags: column.json({ optional: true }),
        sku: column.text({ optional: true }),
        mpn: column.text({ optional: true }),
        upc: column.text({ unique: true }),
        ean: column.text({ optional: true }),
        isbn: column.text({ optional: true }),
        weight: column.number({ optional: true, default: 0.0 }),
        weight_unit: column.text({ optional: true, default: 'g' }),
        width: column.number({ optional: true, default: 0.0 }),
        height: column.number({ optional: true, default: 0.0 }),
        length: column.number({ optional: true, default: 0.0 }),
        inner_diameter: column.number({ optional: true, default: 0.0 }),
        outer_diameter: column.number({ optional: true, default: 0.0 }),
        measure_unit: column.text({ optional: true, default: 'mm' }),
        customizable: column.boolean({ optional: true }),
        customizable_fields: column.json({ optional: true }),
        created_at: column.date({ default: NOW }),
        updated_at: column.date({ optional: true }),
        deleted_at: column.date({ optional: true })
    }
});

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text({ unique: true }),
    email: column.text({ unique: true }),
    password: column.text(),
    phone: column.text({ unique: true }),
    verified_token: column.text({ optional: true }),
    email_verified: column.boolean({ optional: true,default: false }),
    reset_token: column.text({ optional: true }),
    token_expiry: column.date({ optional: true }),
    person: column.number({ references: () => Person.columns.id }),
    level: column.number({ references: () => User_Level.columns.id }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true })
  }
});

const User_Level = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text({ unique: true }),
    level_value: column.text({ unique: true }),
    permissions: column.json(),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true })
  }
});

const Person = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    first_name: column.text(),
    second_name: column.text({ optional: true }),
    first_last_name: column.text(),
    second_last_name: column.text({ optional: true }),
    third_name: column.text({ optional: true }),
    third_last_name: column.text({ optional: true }),
    gender: column.text({ optional: true }),
    birthday: column.date({ optional: true }),
    address: column.text({ optional: true }),
    phone: column.text({ unique:true, optional: true }),
    email: column.text({ unique: true }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true })
  }
});

const SidebarMenu = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    url: column.text({ optional: true }),
    icon: column.text({ optional: true }),
    parent_id: column.number({ 
      optional: true,
      references: () => SidebarMenu.columns.id 
    }),
    position: column.number({ default: 0 }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true })
  }
});

const CommonName = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    position: column.number({ optional: true, default: 1 }),
    active: column.boolean({ optional: true, default: true }),
    desc_active: column.boolean({ default: true }),
    categories: column.json({ optional: true}),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true })
  }
});

const Tag = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true })
  }
});

const Category = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    slug: column.text({ unique: true }),
    description: column.text({ optional: true }),
    parents: column.json({ optional: true }),
    active: column.boolean({ default: true }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true })
  }
});

const Group = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    position: column.number({ optional: true, default: 1 }),
    active: column.boolean({ optional: true, default: true }),
    is_allow_desc: column.boolean({ optional: true, default: true }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true })
  }
});

const Metadata = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    position: column.number({ optional: true, default: 1 }),
    active: column.boolean({ optional: true, default: true }),
    allow_description: column.boolean({ optional: true, default: true }),
    is_feature: column.boolean({ optional: true, default: false }),
    format: column.text({ optional: true }),
    tooltip: column.text({ optional: true }),
    id_group: column.number({ optional:true, references: () => Group.columns.id }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true })
  }
});

const Aesthetics = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text({ unique: true }),
    description: column.text(),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
  },
});

const Aesthetic_Relations = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    aesthetics_grade: column.number(),
    product_id: column.number({ references: () => Product.columns.id }),
    quantity: column.number(),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
  },
});

const Supplier = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text({ unique: true }),
    address: column.text({ optional: true }),
    phone: column.text({ optional: true }),
    email: column.text({ optional: true }),
    website: column.text({ optional: true }),
    contact: column.text({ optional: true }),
    contact_phone: column.text({ optional: true }),
    contact_email: column.text({ optional: true }),
    country: column.text({ optional: true }),
    state: column.text({ optional: true }),
    city: column.text({ optional: true }),
    street: column.text({ optional: true }),
    optional: column.text({ optional: true }),
    logo: column.text({ optional: true }),
    taxes: column.number({ default: 0.0 }),
    discount: column.number({ default: 0.0 }),
    status: column.number({ references: () => Status.columns.id, default:1 }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
    deleted_at: column.date({ optional: true }),
  },
});

const Status = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text({ unique: true }),
    description: column.text({ optional: true }),
    active: column.boolean({ default: true }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
    deleted_at: column.date({ optional: true }),
  },
});

const Brand = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text({ unique: true }),
    description: column.text({ optional: true }),
    logo: column.text({ optional: true }),
    active: column.boolean({ default: true }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
    deleted_at: column.date({ optional: true }),
  },
});

const Purchase = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    number: column.text({ unique: true }),
    purchase_date: column.date(),
    ingress_date: column.date(),
    processed_date: column.date(),
    total: column.number({ default: 0.0 }),
    taxes: column.number({ default: 0.0 }),
    discount: column.number({ default: 0.0 }),
    purchase_details: column.number(),
    supplier_id: column.number(),
    buyer_id: column.number(),
    processed: column.boolean({ default: false }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
    deleted_at: column.date({ optional: true }),
  },
});

const Purchase_Details = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    invoice_number: column.text(),
    product_id: column.number(),
    price: column.number({ default: 0.0 }),
    taxes: column.number({ default: 0.0 }),
    discount: column.number({ default: 0.0 }),
    quantity: column.number({ default: 1 }),
    processed: column.boolean({ default: false }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
    deleted_at: column.date({ optional: true }),
  },
});

const Variant = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    sku: column.text({ optional: true }),
    mpn: column.text({ optional: true }),
    upc: column.text({ unique: true }),
    ean: column.text({ optional: true }),
    isbn: column.text({ optional: true }),
    price: column.number({ default: 0.0 }),
    compare_at_price: column.number({ optional: true }),
    cost_price: column.number({ optional: true }),
    weight: column.number({ optional: true, default: 0.0 }),
    weight_unit: column.text({ optional: true, default: 'g' }),
    width: column.number({ optional: true, default: 0.0 }),
    height: column.number({ optional: true, default: 0.0 }),
    length: column.number({ optional: true, default: 0.0 }),
    measure_unit: column.text({ optional: true, default: 'mm' }),
    stock: column.number({ default: 0 }),
    low_stock_alert: column.number({ optional: true }),
    active: column.boolean({ default: true }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
    deleted_at: column.date({ optional: true }),
  },
});

const VariantOption = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    values: column.json(), // Array of possible values for this option
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
  },
});

const VariantRelation = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    product_id: column.number({ references: () => Product.columns.id }),
    variant_id: column.number({ references: () => Variant.columns.id }),
    option_id: column.number({ references: () => VariantOption.columns.id }),
    value: column.text(), // The selected value from VariantOption.values for this variant
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
  },
});

const variantType = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    active: column.boolean({ default: false }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
  },
});

const variantTypeValue = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    value: column.text(),
    abbreviation: column.text(),
    variant_type_id: column.number({
      references: () => variantType.columns.id,
    }),
    active: column.boolean({ default: false }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
  },
});

const ProductType = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    name: column.text(),
    categories: column.json(),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
  },
});

const MetadataRelations = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    metadata_id: column.number(),
    common_name: column.json({ deprecated:true, optional: true}),
    common_names: column.json({optional: true}),
    category: column.json({ deprecated:true, optional: true}),
    categories: column.json({ deprecated:true, optional: true }),
    product_type: column.number({ deprecated:true, optional: true }),
    product_types: column.json({ optional: true }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
  },
});

const MetadataValue = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    metadata_id: column.number(),
    metadata_value: column.text({ unique: true }),
    active: column.boolean({ optional: true, default: true }),
    allow_description: column.boolean({ optional: true, default: true }),
    created_at: column.date({ default: NOW }),
  }
})

const MetadataValueRelations = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    metadata_id: column.number(),
    product_id: column.text(),
    content: column.text({ optional: true }),
    position: column.number({ optional: true, default: 1 }),
    active: column.boolean({ optional: true, default: true }),
    allow_description: column.boolean({ optional: true, default: true }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
  },
});

const Image = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    name: column.text(),
    url: column.text(),
    position: column.number({ optional: true, default: 1 }),
    active: column.boolean({ optional: true, default: true }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
  },
});

const ProductRelations = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    product_id: column.number(),
    image_id: column.number({
      optional: true,
      references: () => Image.columns.id,
    }),
    brand_id: column.number({
      optional: true,
      references: () => Brand.columns.id,
    }),
    status_id: column.number({
      optional: true,
      references: () => Status.columns.id,
    }),
    variants_id: column.json(),
    product_type_id: column.number({
      optional: true,
      references: () => ProductType.columns.id,
    }),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
  },
});

const DaiCategoryProduct = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    category_id: column.number({
      references: () => Category.columns.id,
    }),
    dai: column.number(),
    licenses: column.number(),
    eco_tax: column.number(),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
  },
});

const Country = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    name: column.text(),
    tlc: column.text(),
    impex: column.number(),
    additional: column.number(),
    created_at: column.date({ default: NOW }),
    updated_at: column.date({ optional: true }),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Product,
    User,
    User_Level,
    Person,
    SidebarMenu,
    CommonName,
    Tag,
    Group,
    Category,
    Metadata,
    Aesthetics,
    Aesthetic_Relations,
    Supplier,
    Status,
    Brand,
    Purchase,
    Purchase_Details,
    Variant,
    variantType,
    variantTypeValue,
    VariantOption,
    VariantRelation,
    ProductType,
    MetadataRelations,
    MetadataValue,
    MetadataValueRelations,
    ProductRelations,
    Image,
    DaiCategoryProduct,
    Country,
  }
});