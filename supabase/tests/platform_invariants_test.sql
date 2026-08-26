begin;
select plan(13);

insert into auth.users (id, email)
values
  ('44444444-4444-4444-4444-444444444444', 'first-owner@siray.test'),
  ('55555555-5555-5555-5555-555555555555', 'second-owner@siray.test');

insert into api.organizations (id, name, slug)
overriding system value
values (901, 'Invariant Hospitality', 'invariant-hospitality');

insert into api.organization_members (organization_id, user_id, role)
values (901, '44444444-4444-4444-4444-444444444444', 'owner');

select throws_ok(
  $$update api.organization_members
    set status = 'disabled'
    where organization_id = 901
      and user_id = '44444444-4444-4444-4444-444444444444'$$,
  '23514',
  'organization must retain at least one active owner',
  'the last active owner cannot disable themselves'
);

select throws_ok(
  $$delete from api.organization_members
    where organization_id = 901
      and user_id = '44444444-4444-4444-4444-444444444444'$$,
  '23514',
  'organization must retain at least one active owner',
  'the last active owner cannot delete themselves'
);

insert into api.organization_members (organization_id, user_id, role)
values (901, '55555555-5555-5555-5555-555555555555', 'owner');

select lives_ok(
  $$update api.organization_members
    set role = 'admin'
    where organization_id = 901
      and user_id = '44444444-4444-4444-4444-444444444444'$$,
  'an owner can be demoted when another active owner remains'
);

insert into api.businesses (id, organization_id, name, slug)
overriding system value
values (902, 901, 'Invariant Café', 'invariant-cafe');

insert into api.locations (id, organization_id, business_id, name, slug)
overriding system value
values (903, 901, 902, 'Barranco', 'barranco');

insert into api.service_zones (
  id,
  organization_id,
  business_id,
  location_id,
  name,
  service_mode,
  fulfillment_mode
)
overriding system value
values (904, 901, 902, 903, 'Salón', 'table', 'table_delivery');

insert into api.service_points (
  id,
  organization_id,
  business_id,
  service_zone_id,
  label,
  kind
)
overriding system value
values
  (905, 901, 902, 904, 'Mesa 01', 'table'),
  (906, 901, 902, 904, 'Mesa 02', 'table');

insert into api.access_assets (
  id,
  organization_id,
  business_id,
  service_point_id,
  asset_code
)
overriding system value
values (907, 901, 902, 905, 'INVARIANT-M01-NFC');

select throws_ok(
  $$insert into private.access_credentials (
      organization_id,
      business_id,
      service_point_id,
      access_asset_id,
      method,
      token_hash,
      token_hint
    ) values (
      901,
      902,
      906,
      907,
      'nfc',
      decode(repeat('ef', 32), 'hex'),
      'efefef'
    )$$,
  '23503',
  null,
  'a credential cannot bind an asset to a different service point'
);

insert into api.catalogs (id, organization_id, business_id, name)
overriding system value
values (910, 901, 902, 'Main Catalog');

insert into api.products (id, organization_id, business_id, catalog_id, name)
overriding system value
values (911, 901, 902, 910, 'Flat White');

insert into api.menus (id, organization_id, business_id, name)
overriding system value
values (912, 901, 902, 'All Day');

insert into api.menu_versions (
  id,
  organization_id,
  business_id,
  menu_id,
  version_number
)
overriding system value
values (913, 901, 902, 912, 1);

insert into api.menu_sections (
  id,
  organization_id,
  business_id,
  menu_version_id,
  name
)
overriding system value
values (914, 901, 902, 913, 'Cafés');

insert into api.menu_items (
  id,
  organization_id,
  business_id,
  menu_section_id,
  product_id,
  name_snapshot,
  price_minor
)
overriding system value
values (915, 901, 902, 914, 911, 'Flat White', 1500);

select lives_ok(
  $$update api.menu_items set price_minor = 1600 where id = 915$$,
  'draft menu content remains editable'
);

select lives_ok(
  $$update api.menu_versions
    set status = 'published', published_at = now()
    where id = 913$$,
  'a reviewed draft can be published'
);

select throws_ok(
  $$update api.menu_items set price_minor = 1700 where id = 915$$,
  '23514',
  'published menu items are immutable',
  'published item prices cannot change in place'
);

select throws_ok(
  $$insert into api.menu_sections (
      organization_id,
      business_id,
      menu_version_id,
      name
    ) values (901, 902, 913, 'Postres')$$,
  '23514',
  'published menu sections are immutable',
  'sections cannot be added to a published version'
);

select throws_ok(
  $$delete from api.menu_sections where id = 914$$,
  '23514',
  'published menu sections are immutable',
  'published sections cannot be deleted'
);

select throws_ok(
  $$update api.menu_versions set version_number = 2 where id = 913$$,
  '23514',
  'a published menu version is immutable',
  'published version identity cannot change'
);

select throws_ok(
  $$delete from api.menu_versions where id = 913$$,
  '23514',
  'a published menu version cannot be deleted',
  'published versions retain their audit history'
);

select lives_ok(
  $$update api.menu_versions set status = 'archived' where id = 913$$,
  'a published version can be archived without changing its content'
);

select throws_ok(
  $$update api.menu_items set available = false where id = 915$$,
  '23514',
  'published menu items are immutable',
  'archiving does not make previously published content editable'
);

select * from finish();
rollback;
