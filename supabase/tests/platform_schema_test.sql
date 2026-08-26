begin;
select plan(26);

select has_schema('api', 'the exposed api schema exists');
select has_schema('private', 'the internal schema exists');

select has_table('api', 'organizations', 'organizations exists');
select has_table('api', 'organization_members', 'organization_members exists');
select has_table('api', 'businesses', 'businesses exists');
select has_table('api', 'locations', 'locations exists');
select has_table('api', 'service_zones', 'service_zones exists');
select has_table('api', 'service_points', 'service_points exists');
select has_table('api', 'access_assets', 'access_assets exists');
select has_table('api', 'catalogs', 'catalogs exists');
select has_table('api', 'products', 'products exists');
select has_table('api', 'menus', 'menus exists');
select has_table('api', 'menu_versions', 'menu_versions exists');
select has_table('api', 'menu_sections', 'menu_sections exists');
select has_table('api', 'menu_items', 'menu_items exists');
select has_table('api', 'menu_assignments', 'menu_assignments exists');
select has_table('private', 'access_credentials', 'access_credentials exists');
select has_table('private', 'access_events', 'access_events exists');

select ok(
  to_regprocedure('private.is_org_member(bigint)') is not null,
  'the membership helper exists'
);
select ok(
  to_regprocedure('private.has_org_role(bigint,text[])') is not null,
  'the role helper exists'
);
select ok(
  to_regprocedure('api.resolve_access(bytea)') is not null,
  'the narrow guest access resolver exists'
);

select set_eq(
  $$
    select c.relname::text collate "C"
    from pg_class as c
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'api'
      and c.relkind = 'r'
      and c.relrowsecurity
  $$,
  $$
    select expected.name collate "C"
    from (
      values
        ('access_assets'),
        ('businesses'),
        ('catalogs'),
        ('locations'),
        ('menu_assignments'),
        ('menu_items'),
        ('menu_sections'),
        ('menu_versions'),
        ('menus'),
        ('organization_members'),
        ('organizations'),
        ('products'),
        ('service_points'),
        ('service_zones')
    ) as expected(name)
  $$,
  'every exposed application table has RLS enabled'
);

select set_eq(
  $$
    select c.relname::text collate "C"
    from pg_class as c
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'private'
      and c.relkind = 'r'
      and c.relrowsecurity
  $$,
  $$
    select expected.name collate "C"
    from (values ('access_credentials'), ('access_events')) as expected(name)
  $$,
  'private data uses RLS as defense in depth'
);

select col_type_is('private', 'access_credentials', 'token_hash', 'bytea', 'tokens are stored as hashes');
select col_type_is('api', 'menu_items', 'price_minor', 'integer', 'prices use integer minor units');
select col_type_is('api', 'organizations', 'created_at', 'timestamp with time zone', 'timestamps preserve timezone');

select * from finish();
rollback;
