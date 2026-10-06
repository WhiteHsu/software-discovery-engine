-- Run in staging AFTER applying 202610060001_seed_claim_evidence_mapping.sql.
-- Read-only checks. Does not import seed data.
begin;
do $$
declare
  table_name text;
  column_table text;
  relation regclass;
begin
  foreach column_table in array array['evidence_sources', 'claim_evidence'] loop
    relation := to_regclass('software_discovery.' || column_table);
    if relation is null then raise exception 'Missing table: %', column_table; end if;
    if not exists (
      select 1 from pg_attribute
      where attrelid = relation and attname = 'seed_key' and not attisdropped and not attnotnull
    ) then raise exception 'Missing nullable seed_key on %', column_table; end if;
    if not exists (
      select 1 from pg_constraint c
      join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
      where c.conrelid = relation and c.contype = 'u' and array_length(c.conkey, 1) = 1 and a.attname = 'seed_key'
    ) then raise exception 'Missing unique seed_key on %', column_table; end if;
  end loop;

  foreach table_name in array array[
    'product_attribute_evidence', 'product_anchor_evidence',
    'product_problem_evidence', 'product_audience_evidence'
  ] loop
    relation := to_regclass('software_discovery.' || table_name);
    if relation is null then raise exception 'Missing table: %', table_name; end if;
    if not (select relrowsecurity from pg_class where oid = relation) then
      raise exception 'RLS disabled on %', table_name;
    end if;
    if exists (select 1 from pg_policy where polrelid = relation) then
      raise exception 'Evidence junction unexpectedly has access policies: %', table_name;
    end if;
    if has_table_privilege('anon', relation, 'SELECT,INSERT,UPDATE,DELETE')
       or has_table_privilege('authenticated', relation, 'SELECT,INSERT,UPDATE,DELETE') then
      raise exception 'Client privileges exposed on %', table_name;
    end if;
    if (select count(*) from pg_constraint where conrelid = relation and contype = 'f') <> 2 then
      raise exception 'Expected two typed/source foreign keys on %', table_name;
    end if;
    if not exists (select 1 from pg_constraint where conrelid = relation and contype = 'p') then
      raise exception 'Missing primary key on %', table_name;
    end if;
  end loop;
  raise notice 'PR3.2B migration verification passed.';
end $$;
rollback;
