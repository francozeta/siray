export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableDefinition<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Row>;
  Relationships: [];
};

type InsertRow<Row, RequiredKeys extends keyof Row> = Pick<Row, RequiredKeys> &
  Partial<Omit<Row, RequiredKeys>>;

type Timestamped = {
  created_at: string;
  updated_at: string;
};

export type OrganizationRow = Timestamped & {
  id: number;
  name: string;
  slug: string;
  status: "active" | "suspended" | "closed";
};

export type OrganizationMemberRow = Timestamped & {
  organization_id: number;
  user_id: string;
  role: "owner" | "admin" | "operator" | "viewer";
  status: "active" | "invited" | "disabled";
};

export type BusinessRow = Timestamped & {
  id: number;
  organization_id: number;
  name: string;
  slug: string;
  status: "active" | "inactive" | "archived";
};

export type LocationRow = Timestamped & {
  id: number;
  organization_id: number;
  business_id: number;
  name: string;
  slug: string;
  timezone: string;
  currency: string;
  ordering_enabled: boolean;
  status: "active" | "inactive" | "archived";
};

export type ServiceZoneRow = Timestamped & {
  id: number;
  organization_id: number;
  business_id: number;
  location_id: number;
  name: string;
  service_mode: "table" | "bar" | "counter" | "pickup" | "hybrid";
  fulfillment_mode:
    | "table_delivery"
    | "bar_pickup"
    | "counter_pickup"
    | "pickup_area";
  ordering_enabled: boolean;
  status: "active" | "inactive" | "archived";
};

export type ServicePointRow = Timestamped & {
  id: number;
  organization_id: number;
  business_id: number;
  service_zone_id: number;
  label: string;
  kind: "table" | "bar" | "counter" | "pickup" | "shared";
  sort_order: number;
  ordering_enabled: boolean;
  status: "active" | "inactive" | "archived";
};

export type AccessAssetRow = Timestamped & {
  id: number;
  organization_id: number;
  business_id: number;
  service_point_id: number;
  asset_code: string;
  technology: "ndef_url" | "ntag_424_dna" | "printed_qr" | "short_link";
  status:
    | "provisioned"
    | "installed"
    | "active"
    | "lost"
    | "damaged"
    | "retired";
  installed_at: string | null;
  last_verified_at: string | null;
};

export type CatalogRow = Timestamped & {
  id: number;
  organization_id: number;
  business_id: number;
  name: string;
  status: "active" | "inactive" | "archived";
};

export type ProductRow = Timestamped & {
  id: number;
  organization_id: number;
  business_id: number;
  catalog_id: number;
  name: string;
  description: string | null;
  image_path: string | null;
  available: boolean;
  status: "active" | "inactive" | "archived";
};

export type MenuRow = Timestamped & {
  id: number;
  organization_id: number;
  business_id: number;
  name: string;
  status: "active" | "inactive" | "archived";
};

export type MenuVersionRow = Timestamped & {
  id: number;
  organization_id: number;
  business_id: number;
  menu_id: number;
  version_number: number;
  status: "draft" | "published" | "archived";
  published_at: string | null;
};

export type MenuSectionRow = Timestamped & {
  id: number;
  organization_id: number;
  business_id: number;
  menu_version_id: number;
  name: string;
  sort_order: number;
};

export type MenuItemRow = Timestamped & {
  id: number;
  organization_id: number;
  business_id: number;
  menu_section_id: number;
  product_id: number;
  name_snapshot: string;
  description_snapshot: string | null;
  image_path_snapshot: string | null;
  price_minor: number;
  currency: string;
  available: boolean;
  sort_order: number;
};

export type MenuAssignmentRow = Timestamped & {
  id: number;
  organization_id: number;
  business_id: number;
  menu_id: number;
  location_id: number | null;
  service_zone_id: number | null;
  priority: number;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
};

export type ResolvedAccessRow = {
  organization_id: number;
  business_id: number;
  business_name: string;
  business_slug: string;
  location_id: number;
  location_name: string;
  service_zone_id: number;
  service_zone_name: string;
  service_mode: ServiceZoneRow["service_mode"];
  fulfillment_mode: ServiceZoneRow["fulfillment_mode"];
  service_point_id: number;
  service_point_label: string;
  access_method: "nfc" | "qr" | "short_link" | "staff_link";
};

export type Database = {
  api: {
    Tables: {
      organizations: TableDefinition<
        OrganizationRow,
        InsertRow<OrganizationRow, "name" | "slug">
      >;
      organization_members: TableDefinition<
        OrganizationMemberRow,
        InsertRow<OrganizationMemberRow, "organization_id" | "user_id" | "role">
      >;
      businesses: TableDefinition<
        BusinessRow,
        InsertRow<BusinessRow, "organization_id" | "name" | "slug">
      >;
      locations: TableDefinition<
        LocationRow,
        InsertRow<
          LocationRow,
          "organization_id" | "business_id" | "name" | "slug"
        >
      >;
      service_zones: TableDefinition<
        ServiceZoneRow,
        InsertRow<
          ServiceZoneRow,
          | "organization_id"
          | "business_id"
          | "location_id"
          | "name"
          | "service_mode"
          | "fulfillment_mode"
        >
      >;
      service_points: TableDefinition<
        ServicePointRow,
        InsertRow<
          ServicePointRow,
          | "organization_id"
          | "business_id"
          | "service_zone_id"
          | "label"
          | "kind"
        >
      >;
      access_assets: TableDefinition<
        AccessAssetRow,
        InsertRow<
          AccessAssetRow,
          "organization_id" | "business_id" | "service_point_id" | "asset_code"
        >
      >;
      catalogs: TableDefinition<
        CatalogRow,
        InsertRow<CatalogRow, "organization_id" | "business_id" | "name">
      >;
      products: TableDefinition<
        ProductRow,
        InsertRow<
          ProductRow,
          "organization_id" | "business_id" | "catalog_id" | "name"
        >
      >;
      menus: TableDefinition<
        MenuRow,
        InsertRow<MenuRow, "organization_id" | "business_id" | "name">
      >;
      menu_versions: TableDefinition<
        MenuVersionRow,
        InsertRow<
          MenuVersionRow,
          "organization_id" | "business_id" | "menu_id" | "version_number"
        >
      >;
      menu_sections: TableDefinition<
        MenuSectionRow,
        InsertRow<
          MenuSectionRow,
          "organization_id" | "business_id" | "menu_version_id" | "name"
        >
      >;
      menu_items: TableDefinition<
        MenuItemRow,
        InsertRow<
          MenuItemRow,
          | "organization_id"
          | "business_id"
          | "menu_section_id"
          | "product_id"
          | "name_snapshot"
          | "price_minor"
        >
      >;
      menu_assignments: TableDefinition<
        MenuAssignmentRow,
        InsertRow<
          MenuAssignmentRow,
          "organization_id" | "business_id" | "menu_id"
        >
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      resolve_access: {
        Args: { p_token_hash: string };
        Returns: ResolvedAccessRow[];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
