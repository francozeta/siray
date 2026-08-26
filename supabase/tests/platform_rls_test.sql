begin;
select plan(13);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'owner@siray.test'),
  ('22222222-2222-2222-2222-222222222222', 'operator@siray.test'),
  ('33333333-3333-3333-3333-333333333333', 'outsider@siray.test');

insert into api.organizations (id, name, slug)
overriding system value
values
  (101, 'Alpha Hospitality', 'alpha-hospitality'),
  (102, 'Beta Hospitality', 'beta-hospitality');

insert into api.organization_members (organization_id, user_id, role)
values
  (101, '11111111-1111-1111-1111-111111111111', 'owner'),
  (101, '22222222-2222-2222-2222-222222222222', 'operator');

insert into api.businesses (id, organization_id, name, slug)
overriding system value
values
  (201, 101, 'Alpha Café', 'alpha-cafe'),
  (202, 102, 'Beta Café', 'beta-cafe');

insert into api.locations (
  id,
  organization_id,
  business_id,
  name,
  slug,
  ordering_enabled
)
overriding system value
values (301, 101, 201, 'Miraflores', 'miraflores', true);

insert into api.service_zones (
  id,
  organization_id,
  business_id,
  location_id,
  name,
  service_mode,
  fulfillment_mode,
  ordering_enabled
)
overriding system value
values (401, 101, 201, 301, 'Salón', 'table', 'table_delivery', true);

insert into api.service_points (
  id,
  organization_id,
  business_id,
  service_zone_id,
  label,
  kind,
  ordering_enabled
)
overriding system value
values (501, 101, 201, 401, 'Mesa 07', 'table', true);

insert into api.access_assets (
  id,
  organization_id,
  business_id,
  service_point_id,
  asset_code,
  status
)
overriding system value
values (601, 101, 201, 501, 'ALPHA-M07-NFC', 'active');

insert into private.access_credentials (
  id,
  organization_id,
  business_id,
  service_point_id,
  access_asset_id,
  method,
  token_hash,
  token_hint
)
overriding system value
values (
  701,
  101,
  201,
  501,
  601,
  'nfc',
  decode(repeat('ab', 32), 'hex'),
  'ababab'
);

set local role anon;
select throws_ok(
  $$select * from api.businesses$$,
  '42501',
  null,
  'anonymous users cannot read tenant tables'
);
select throws_ok(
  $$select * from private.access_credentials$$,
  '42501',
  null,
  'anonymous users cannot read credential hashes'
);
select throws_ok(
  $$select * from api.resolve_access(decode(repeat('ab', 32), 'hex'))$$,
  '42501',
  null,
  'anonymous users cannot call the server-only access resolver'
);

set local role service_role;
select results_eq(
  $$select business_slug from api.resolve_access(decode(repeat('ab', 32), 'hex'))$$,
  array['alpha-cafe'],
  'the server resolves an active opaque credential to narrow service context'
);
select is_empty(
  $$select * from api.resolve_access(decode(repeat('cd', 32), 'hex'))$$,
  'an unknown credential reveals no context'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select throws_ok(
  $$select * from api.resolve_access(decode(repeat('ab', 32), 'hex'))$$,
  '42501',
  null,
  'authenticated browsers cannot bypass the server-only access resolver'
);
select results_eq(
  $$select slug from api.businesses order by slug$$,
  array['alpha-cafe'],
  'an owner reads only their organization'
);
select results_eq(
  $$insert into api.businesses (organization_id, name, slug)
    values (101, 'Alpha Bakery', 'alpha-bakery')
    returning slug$$,
  array['alpha-bakery'],
  'an owner can configure their organization'
);
select throws_ok(
  $$insert into api.businesses (organization_id, name, slug)
    values (102, 'Stolen Business', 'stolen-business')$$,
  '42501',
  null,
  'an owner cannot write into another organization'
);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select results_eq(
  $$select slug from api.businesses order by slug$$,
  array['alpha-bakery', 'alpha-cafe'],
  'an operator can read their organization'
);
select throws_ok(
  $$insert into api.businesses (organization_id, name, slug)
    values (101, 'Operator Write', 'operator-write')$$,
  '42501',
  null,
  'an operator cannot change configuration'
);

set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select is_empty(
  $$select slug from api.businesses where slug = 'operator-write'$$,
  'the denied operator write created no row'
);

set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select is_empty(
  $$select * from api.businesses$$,
  'a signed-in non-member reads no tenant rows'
);

select * from finish();
rollback;
