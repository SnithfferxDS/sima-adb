export type DBTables = 'products' | 'brands' | 'categories' | 'suppliers' | 'purchases' | 'purchase_details' | 'variants' | 'variant_options' | 'variant_relations' | 'product_types' | 'metadata' | 'metadata_relations' | 'metadata_values' | 'metadata_values_relations' | 'images' | 'product_relations' | 'dai_category_product' | 'countries' | 'searchable_products' | 'menu_items';
export interface CommonName {
	id: number;
	name: string;
	categories: string[];
	active: boolean;
	desc_active: boolean;
}
export type CommonNames = CommonName[];

export interface ProductType {
	id: number;
	name: string;
	categories: string[];
}

export interface Brand {
	id: number;
	name: string;
	description: string;
	logo: string;
	active: boolean;
}

export interface Category {
	id: number;
	name: string;
	slug: string;
	description: string;
	parents: string[];
	active: boolean;
}

export interface Group {
	id: number;
	name: string;
	position: number;
	active: boolean;
	is_allow_desc: boolean;
}

export interface Metadata {
	id: number;
	name: string;
	position: number;
	active: boolean;
	allow_description: boolean;
	is_feature: boolean;
	format: string;
	tooltip: string;
	id_common_name: number;
	id_group: number;
}

export interface Aesthetics {
	id: number;
	name: string;
	description: string;
}

export interface Aesthetic_Relations {
	id: number;
	product_id: number;
	aesthetics_grade: number;
	quantity: number;
}

export interface Supplier {
	id: number;
	name: string;
	address: string;
	phone: string;
	email: string;
	website: string;
	contact: string;
	contact_phone: string;
	contact_email: string;
	country: string;
	state: string;
	city: string;
	street: string;
	optional: string;
	logo: string;
	taxes: number;
	discount: number;
	status: number;
}

export interface Status {
	id: number;
	name: string;
	description: string;
	active: boolean;
}

export interface Brand {
	id: number;
	name: string;
	description: string;
	logo: string;
	active: boolean;
}

export interface Purchase {
	id: number;
	number: string;
	purchase_date: string;
	ingress_date: string;
	processed_date: string;
	total: number;
	taxes: number;
	discount: number;
	purchase_details: number;
	supplier_id: number;
	buyer_id: number;
	processed: boolean;
}

export interface Purchase_Details {
	id: number;
	invoice_number: string;
	product_id: number;
	price: number;
	taxes: number;
	discount: number;
	quantity: number;
	processed: boolean;
}

export interface Variant {
	id: number;
	name: string;
	sku: string;
	mpn: string;
	upc: string;
	ean: string;
	isbn: string;
	price: number;
	compare_at_price: number;
	cost_price: number;
	weight: number;
	weight_unit: string;
	width: number;
	height: number;
	length: number;
	measure_unit: string;
	stock: number;
	low_stock_alert: number;
	active: boolean;
}

export interface VariantOption {
	id: number;
	name: string;
	values: string[];
}

export interface VariantRelation {
	id: number;
	product_id: number;
	variant_id: number;
	option_id: number;
	value: string;
}

export interface ProductType {
	id: number;
	name: string;
	categories: string[];
}

export interface MetadataRelations {
	id: number;
	metadata_id: number;
	common_name: number;
	category: number;
	product_type: number;
}

export interface MetadataValue {
	id: number;
	metadata_id: number;
	metadata_value: string;
	active: boolean;
	allow_description: boolean;
}

export interface MetadataValueRelations {
	id: number;
	metadata_id: number;
	product_id: string;
	content: string;
	position: number;
	active: boolean;
	allow_description: boolean;
}

export interface Image {
	id: number;
	name: string;
	url: string;
	position: number;
	active: boolean;
}

export interface ProductRelations {
	id: number;
	product_id: number;
	image_id: number;
	brand_id: number;
	status_id: number;
	variants_id: number;
	product_type_id: number;
}

export interface DaiCategoryProduct {
	id: number;
	category_id: number;
	dai: number;
	licenses: number;
	eco_tax: number;
}

export interface Country {
	id: number;
	name: string;
	tlc: string;
	impex: number;
	additional: number;
}

export interface SearchableProduct {
	id: number;
	name: string;
	sku: string;
	mpn: string;
	upc: string;
}

export interface MenuItem {
	id: number;
	name: string;
	url: string | null;
	icon: string | null;
	parent_id: number | null;
	position: number;
}

export type MenuItems = MenuItem[];

export interface Product {
	id: string;
	name: string;
	description?: string;
	common_name_id: number;
	category_id: number;
	product_type_id: number;
	active: boolean;
}

export interface MetadataValue {
	id: number;
	name: string;
	tooltip?: string;
	format?: string;
	value?: string;
}
