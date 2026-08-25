create schema if not exists api;
create schema if not exists private;

revoke all on schema api from public;
revoke all on schema private from public;

alter default privileges for role postgres in schema api
  revoke all on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema api
  revoke all on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema api
  revoke execute on functions from public, anon, authenticated, service_role;

alter default privileges for role postgres in schema private
  revoke all on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema private
  revoke all on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema private
  revoke execute on functions from public, anon, authenticated, service_role;

create table api.organizations (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text not null default 'active'
    check (status in ('active', 'suspended', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index organizations_slug_lower_idx
  on api.organizations (lower(slug));

create table api.organization_members (
  organization_id bigint not null
    references api.organizations (id) on delete cascade,
  user_id uuid not null
    references auth.users (id) on delete cascade,
  role text not null
    check (role in ('owner', 'admin', 'operator', 'viewer')),
  status text not null default 'active'
    check (status in ('active', 'invited', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index organization_members_user_id_idx
  on api.organization_members (user_id, organization_id);

create table api.businesses (
  id bigint generated always as identity primary key,
  organization_id bigint not null
    references api.organizations (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id)
);

create unique index businesses_org_slug_lower_idx
  on api.businesses (organization_id, lower(slug));

create table api.locations (
  id bigint generated always as identity primary key,
  organization_id bigint not null,
  business_id bigint not null,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  timezone text not null default 'America/Lima',
  currency text not null default 'PEN'
    check (currency ~ '^[A-Z]{3}$'),
  ordering_enabled boolean not null default false,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, business_id)
    references api.businesses (organization_id, id) on delete cascade,
  unique (organization_id, business_id, id)
);

create unique index locations_business_slug_lower_idx
  on api.locations (organization_id, business_id, lower(slug));

create table api.service_zones (
  id bigint generated always as identity primary key,
  organization_id bigint not null,
  business_id bigint not null,
  location_id bigint not null,
  name text not null check (char_length(name) between 1 and 80),
  service_mode text not null
    check (service_mode in ('table', 'bar', 'counter', 'pickup', 'hybrid')),
  fulfillment_mode text not null
    check (fulfillment_mode in ('table_delivery', 'bar_pickup', 'counter_pickup', 'pickup_area')),
  ordering_enabled boolean not null default false,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, business_id, location_id)
    references api.locations (organization_id, business_id, id) on delete cascade,
  unique (organization_id, business_id, id),
  unique (organization_id, business_id, location_id, name)
);

create table api.service_points (
  id bigint generated always as identity primary key,
  organization_id bigint not null,
  business_id bigint not null,
  service_zone_id bigint not null,
  label text not null check (char_length(label) between 1 and 80),
  kind text not null
    check (kind in ('table', 'bar', 'counter', 'pickup', 'shared')),
  sort_order integer not null default 0 check (sort_order >= 0),
  ordering_enabled boolean not null default false,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, business_id, service_zone_id)
    references api.service_zones (organization_id, business_id, id) on delete cascade,
  unique (organization_id, business_id, id),
  unique (organization_id, business_id, service_zone_id, label)
);

create table api.access_assets (
  id bigint generated always as identity primary key,
  organization_id bigint not null,
  business_id bigint not null,
  service_point_id bigint not null,
  asset_code text not null check (char_length(asset_code) between 3 and 80),
  technology text not null default 'ndef_url'
    check (technology in ('ndef_url', 'ntag_424_dna', 'printed_qr', 'short_link')),
  status text not null default 'provisioned'
    check (status in ('provisioned', 'installed', 'active', 'lost', 'damaged', 'retired')),
  installed_at timestamptz,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, business_id, service_point_id)
    references api.service_points (organization_id, business_id, id) on delete cascade,
  unique (organization_id, business_id, id)
);

create unique index access_assets_org_code_lower_idx
  on api.access_assets (organization_id, lower(asset_code));
create index access_assets_service_point_idx
  on api.access_assets (organization_id, business_id, service_point_id);

create table api.catalogs (
  id bigint generated always as identity primary key,
  organization_id bigint not null,
  business_id bigint not null,
  name text not null check (char_length(name) between 2 and 120),
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, business_id)
    references api.businesses (organization_id, id) on delete cascade,
  unique (organization_id, business_id, id),
  unique (organization_id, business_id, name)
);

create table api.products (
  id bigint generated always as identity primary key,
  organization_id bigint not null,
  business_id bigint not null,
  catalog_id bigint not null,
  name text not null check (char_length(name) between 1 and 160),
  description text,
  image_path text,
  available boolean not null default true,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, business_id, catalog_id)
    references api.catalogs (organization_id, business_id, id) on delete cascade,
  unique (organization_id, business_id, id)
);

create index products_catalog_status_idx
  on api.products (organization_id, business_id, catalog_id, status);

create table api.menus (
  id bigint generated always as identity primary key,
  organization_id bigint not null,
  business_id bigint not null,
  name text not null check (char_length(name) between 2 and 120),
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, business_id)
    references api.businesses (organization_id, id) on delete cascade,
  unique (organization_id, business_id, id),
  unique (organization_id, business_id, name)
);

create table api.menu_versions (
  id bigint generated always as identity primary key,
  organization_id bigint not null,
  business_id bigint not null,
  menu_id bigint not null,
  version_number integer not null check (version_number > 0),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, business_id, menu_id)
    references api.menus (organization_id, business_id, id) on delete cascade,
  check (status <> 'published' or published_at is not null),
  unique (organization_id, business_id, id),
  unique (organization_id, business_id, menu_id, version_number)
);

create unique index menu_versions_one_published_idx
  on api.menu_versions (organization_id, business_id, menu_id)
  where status = 'published';

create table api.menu_sections (
  id bigint generated always as identity primary key,
  organization_id bigint not null,
  business_id bigint not null,
  menu_version_id bigint not null,
  name text not null check (char_length(name) between 1 and 120),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, business_id, menu_version_id)
    references api.menu_versions (organization_id, business_id, id) on delete cascade,
  unique (organization_id, business_id, id),
  unique (organization_id, business_id, menu_version_id, name)
);

create table api.menu_items (
  id bigint generated always as identity primary key,
  organization_id bigint not null,
  business_id bigint not null,
  menu_section_id bigint not null,
  product_id bigint not null,
  name_snapshot text not null check (char_length(name_snapshot) between 1 and 160),
  description_snapshot text,
  image_path_snapshot text,
  price_minor integer not null check (price_minor >= 0),
  currency text not null default 'PEN' check (currency ~ '^[A-Z]{3}$'),
  available boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, business_id, menu_section_id)
    references api.menu_sections (organization_id, business_id, id) on delete cascade,
  foreign key (organization_id, business_id, product_id)
    references api.products (organization_id, business_id, id) on delete restrict,
  unique (organization_id, business_id, menu_section_id, product_id)
);

create index menu_items_product_idx
  on api.menu_items (organization_id, business_id, product_id);

create table api.menu_assignments (
  id bigint generated always as identity primary key,
  organization_id bigint not null,
  business_id bigint not null,
  menu_id bigint not null,
  location_id bigint,
  service_zone_id bigint,
  priority integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, business_id, menu_id)
    references api.menus (organization_id, business_id, id) on delete cascade,
  foreign key (organization_id, business_id, location_id)
    references api.locations (organization_id, business_id, id) on delete cascade,
  foreign key (organization_id, business_id, service_zone_id)
    references api.service_zones (organization_id, business_id, id) on delete cascade,
  check ((location_id is not null)::integer + (service_zone_id is not null)::integer = 1),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create unique index menu_assignments_location_idx
  on api.menu_assignments (organization_id, business_id, menu_id, location_id)
  where location_id is not null;
create unique index menu_assignments_zone_idx
  on api.menu_assignments (organization_id, business_id, menu_id, service_zone_id)
  where service_zone_id is not null;
create index menu_assignments_active_location_idx
  on api.menu_assignments (organization_id, business_id, location_id, priority desc)
  where active and location_id is not null;
create index menu_assignments_active_zone_idx
  on api.menu_assignments (organization_id, business_id, service_zone_id, priority desc)
  where active and service_zone_id is not null;

create table private.access_credentials (
  id bigint generated always as identity primary key,
  organization_id bigint not null,
  business_id bigint not null,
  service_point_id bigint not null,
  access_asset_id bigint,
  method text not null
    check (method in ('nfc', 'qr', 'short_link', 'staff_link')),
  token_hash bytea not null unique check (octet_length(token_hash) = 32),
  token_hint text not null check (char_length(token_hint) between 4 and 12),
  status text not null default 'active'
    check (status in ('active', 'revoked')),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (organization_id, business_id, service_point_id)
    references api.service_points (organization_id, business_id, id) on delete cascade,
  foreign key (organization_id, business_id, access_asset_id)
    references api.access_assets (organization_id, business_id, id)
    on delete set null (access_asset_id),
  check (status <> 'revoked' or revoked_at is not null)
);

create index access_credentials_point_status_idx
  on private.access_credentials (organization_id, business_id, service_point_id, status);
create index access_credentials_asset_idx
  on private.access_credentials (organization_id, business_id, access_asset_id)
  where access_asset_id is not null;

create table private.access_events (
  id bigint generated always as identity primary key,
  organization_id bigint not null,
  business_id bigint not null,
  location_id bigint not null,
  service_point_id bigint not null,
  access_credential_id bigint not null
    references private.access_credentials (id) on delete restrict,
  event_type text not null
    check (event_type in ('resolved', 'rejected', 'menu_loaded', 'fallback_used')),
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  foreign key (organization_id, business_id, location_id)
    references api.locations (organization_id, business_id, id) on delete cascade,
  foreign key (organization_id, business_id, service_point_id)
    references api.service_points (organization_id, business_id, id) on delete cascade
);

create index access_events_point_time_idx
  on private.access_events (organization_id, business_id, service_point_id, occurred_at desc);
create index access_events_credential_time_idx
  on private.access_events (access_credential_id, occurred_at desc);

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function private.set_updated_at() from public, anon, authenticated, service_role;

create trigger organizations_set_updated_at before update on api.organizations
  for each row execute function private.set_updated_at();
create trigger organization_members_set_updated_at before update on api.organization_members
  for each row execute function private.set_updated_at();
create trigger businesses_set_updated_at before update on api.businesses
  for each row execute function private.set_updated_at();
create trigger locations_set_updated_at before update on api.locations
  for each row execute function private.set_updated_at();
create trigger service_zones_set_updated_at before update on api.service_zones
  for each row execute function private.set_updated_at();
create trigger service_points_set_updated_at before update on api.service_points
  for each row execute function private.set_updated_at();
create trigger access_assets_set_updated_at before update on api.access_assets
  for each row execute function private.set_updated_at();
create trigger catalogs_set_updated_at before update on api.catalogs
  for each row execute function private.set_updated_at();
create trigger products_set_updated_at before update on api.products
  for each row execute function private.set_updated_at();
create trigger menus_set_updated_at before update on api.menus
  for each row execute function private.set_updated_at();
create trigger menu_versions_set_updated_at before update on api.menu_versions
  for each row execute function private.set_updated_at();
create trigger menu_sections_set_updated_at before update on api.menu_sections
  for each row execute function private.set_updated_at();
create trigger menu_items_set_updated_at before update on api.menu_items
  for each row execute function private.set_updated_at();
create trigger menu_assignments_set_updated_at before update on api.menu_assignments
  for each row execute function private.set_updated_at();

create function private.is_org_member(target_organization_id bigint)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from api.organization_members as member
      where member.organization_id = target_organization_id
        and member.user_id = (select auth.uid())
        and member.status = 'active'
    );
$$;

create function private.has_org_role(target_organization_id bigint, allowed_roles text[])
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from api.organization_members as member
      where member.organization_id = target_organization_id
        and member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role = any (allowed_roles)
    );
$$;

revoke execute on function private.is_org_member(bigint) from public, anon, service_role;
revoke execute on function private.has_org_role(bigint, text[]) from public, anon, service_role;
grant usage on schema private to authenticated, service_role;
grant execute on function private.is_org_member(bigint) to authenticated;
grant execute on function private.has_org_role(bigint, text[]) to authenticated;

alter table api.organizations enable row level security;
alter table api.organization_members enable row level security;
alter table api.businesses enable row level security;
alter table api.locations enable row level security;
alter table api.service_zones enable row level security;
alter table api.service_points enable row level security;
alter table api.access_assets enable row level security;
alter table api.catalogs enable row level security;
alter table api.products enable row level security;
alter table api.menus enable row level security;
alter table api.menu_versions enable row level security;
alter table api.menu_sections enable row level security;
alter table api.menu_items enable row level security;
alter table api.menu_assignments enable row level security;
alter table private.access_credentials enable row level security;
alter table private.access_events enable row level security;

create policy organizations_member_select on api.organizations
  for select to authenticated
  using ((select private.is_org_member(id)));
create policy organizations_admin_update on api.organizations
  for update to authenticated
  using ((select private.has_org_role(id, array['owner', 'admin'])))
  with check ((select private.has_org_role(id, array['owner', 'admin'])));

create policy organization_members_member_select on api.organization_members
  for select to authenticated
  using ((select private.is_org_member(organization_id)));
create policy organization_members_owner_manage on api.organization_members
  for all to authenticated
  using ((select private.has_org_role(organization_id, array['owner'])))
  with check ((select private.has_org_role(organization_id, array['owner'])));

create policy businesses_member_select on api.businesses
  for select to authenticated
  using ((select private.is_org_member(organization_id)));
create policy businesses_admin_manage on api.businesses
  for all to authenticated
  using ((select private.has_org_role(organization_id, array['owner', 'admin'])))
  with check ((select private.has_org_role(organization_id, array['owner', 'admin'])));

create policy locations_member_select on api.locations
  for select to authenticated
  using ((select private.is_org_member(organization_id)));
create policy locations_admin_manage on api.locations
  for all to authenticated
  using ((select private.has_org_role(organization_id, array['owner', 'admin'])))
  with check ((select private.has_org_role(organization_id, array['owner', 'admin'])));

create policy service_zones_member_select on api.service_zones
  for select to authenticated
  using ((select private.is_org_member(organization_id)));
create policy service_zones_admin_manage on api.service_zones
  for all to authenticated
  using ((select private.has_org_role(organization_id, array['owner', 'admin'])))
  with check ((select private.has_org_role(organization_id, array['owner', 'admin'])));

create policy service_points_member_select on api.service_points
  for select to authenticated
  using ((select private.is_org_member(organization_id)));
create policy service_points_admin_manage on api.service_points
  for all to authenticated
  using ((select private.has_org_role(organization_id, array['owner', 'admin'])))
  with check ((select private.has_org_role(organization_id, array['owner', 'admin'])));

create policy access_assets_member_select on api.access_assets
  for select to authenticated
  using ((select private.is_org_member(organization_id)));
create policy access_assets_admin_manage on api.access_assets
  for all to authenticated
  using ((select private.has_org_role(organization_id, array['owner', 'admin'])))
  with check ((select private.has_org_role(organization_id, array['owner', 'admin'])));

create policy catalogs_member_select on api.catalogs
  for select to authenticated
  using ((select private.is_org_member(organization_id)));
create policy catalogs_admin_manage on api.catalogs
  for all to authenticated
  using ((select private.has_org_role(organization_id, array['owner', 'admin'])))
  with check ((select private.has_org_role(organization_id, array['owner', 'admin'])));

create policy products_member_select on api.products
  for select to authenticated
  using ((select private.is_org_member(organization_id)));
create policy products_admin_manage on api.products
  for all to authenticated
  using ((select private.has_org_role(organization_id, array['owner', 'admin'])))
  with check ((select private.has_org_role(organization_id, array['owner', 'admin'])));

create policy menus_member_select on api.menus
  for select to authenticated
  using ((select private.is_org_member(organization_id)));
create policy menus_admin_manage on api.menus
  for all to authenticated
  using ((select private.has_org_role(organization_id, array['owner', 'admin'])))
  with check ((select private.has_org_role(organization_id, array['owner', 'admin'])));

create policy menu_versions_member_select on api.menu_versions
  for select to authenticated
  using ((select private.is_org_member(organization_id)));
create policy menu_versions_admin_manage on api.menu_versions
  for all to authenticated
  using ((select private.has_org_role(organization_id, array['owner', 'admin'])))
  with check ((select private.has_org_role(organization_id, array['owner', 'admin'])));

create policy menu_sections_member_select on api.menu_sections
  for select to authenticated
  using ((select private.is_org_member(organization_id)));
create policy menu_sections_admin_manage on api.menu_sections
  for all to authenticated
  using ((select private.has_org_role(organization_id, array['owner', 'admin'])))
  with check ((select private.has_org_role(organization_id, array['owner', 'admin'])));

create policy menu_items_member_select on api.menu_items
  for select to authenticated
  using ((select private.is_org_member(organization_id)));
create policy menu_items_admin_manage on api.menu_items
  for all to authenticated
  using ((select private.has_org_role(organization_id, array['owner', 'admin'])))
  with check ((select private.has_org_role(organization_id, array['owner', 'admin'])));

create policy menu_assignments_member_select on api.menu_assignments
  for select to authenticated
  using ((select private.is_org_member(organization_id)));
create policy menu_assignments_admin_manage on api.menu_assignments
  for all to authenticated
  using ((select private.has_org_role(organization_id, array['owner', 'admin'])))
  with check ((select private.has_org_role(organization_id, array['owner', 'admin'])));

create function api.resolve_access(p_token_hash bytea)
returns table (
  organization_id bigint,
  business_id bigint,
  business_name text,
  business_slug text,
  location_id bigint,
  location_name text,
  service_zone_id bigint,
  service_zone_name text,
  service_mode text,
  fulfillment_mode text,
  service_point_id bigint,
  service_point_label text,
  access_method text
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    organization.id,
    business.id,
    business.name,
    business.slug,
    location.id,
    location.name,
    zone.id,
    zone.name,
    zone.service_mode,
    zone.fulfillment_mode,
    point.id,
    point.label,
    credential.method
  from private.access_credentials as credential
  join api.service_points as point
    on point.organization_id = credential.organization_id
   and point.business_id = credential.business_id
   and point.id = credential.service_point_id
  join api.service_zones as zone
    on zone.organization_id = point.organization_id
   and zone.business_id = point.business_id
   and zone.id = point.service_zone_id
  join api.locations as location
    on location.organization_id = zone.organization_id
   and location.business_id = zone.business_id
   and location.id = zone.location_id
  join api.businesses as business
    on business.organization_id = location.organization_id
   and business.id = location.business_id
  join api.organizations as organization
    on organization.id = business.organization_id
  left join api.access_assets as asset
    on asset.organization_id = credential.organization_id
   and asset.business_id = credential.business_id
   and asset.id = credential.access_asset_id
  where octet_length(p_token_hash) = 32
    and credential.token_hash = p_token_hash
    and credential.status = 'active'
    and (credential.expires_at is null or credential.expires_at > now())
    and (credential.access_asset_id is null or asset.status in ('installed', 'active'))
    and point.status = 'active'
    and point.ordering_enabled
    and zone.status = 'active'
    and zone.ordering_enabled
    and location.status = 'active'
    and location.ordering_enabled
    and business.status = 'active'
    and organization.status = 'active'
  limit 1;
$$;

revoke execute on function api.resolve_access(bytea) from public;
grant usage on schema api to anon, authenticated, service_role;
grant execute on function api.resolve_access(bytea) to anon, authenticated, service_role;

grant select, insert, update, delete on table
  api.organizations,
  api.organization_members,
  api.businesses,
  api.locations,
  api.service_zones,
  api.service_points,
  api.access_assets,
  api.catalogs,
  api.products,
  api.menus,
  api.menu_versions,
  api.menu_sections,
  api.menu_items,
  api.menu_assignments
to authenticated;

grant all on table
  api.organizations,
  api.organization_members,
  api.businesses,
  api.locations,
  api.service_zones,
  api.service_points,
  api.access_assets,
  api.catalogs,
  api.products,
  api.menus,
  api.menu_versions,
  api.menu_sections,
  api.menu_items,
  api.menu_assignments,
  private.access_credentials,
  private.access_events
to service_role;

grant usage, select on all sequences in schema api to authenticated, service_role;
grant usage, select on all sequences in schema private to service_role;
