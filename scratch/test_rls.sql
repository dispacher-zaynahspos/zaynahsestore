DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'store_settings',
    'shipping_methods',
    'payment_methods',
    'coupons',
    'categories',
    'products',
    'product_images',
    'product_variants',
    'product_modifiers',
    'reviews',
    'badges',
    'customers',
    'orders',
    'homepage_sections',
    'whatsapp_subscribers',
    'variant_presets',
    'size_guides',
    'meta_category_mapping',
    'seo_meta',
    'media_library'
  ];
  r RECORD;
BEGIN
  -- Test as anon
  RAISE NOTICE '=== TESTING ROLE: anon ===';
  PERFORM set_config('role', 'anon', true);
  PERFORM set_config('request.jwt.claims', '{"role": "anon"}', true);
  FOREACH t IN ARRAY tables LOOP
    BEGIN
      EXECUTE format('SELECT * FROM %I LIMIT 1', t) INTO r;
      RAISE NOTICE '✅ Table: % - Success', t;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ Table: % - Error: % (%)', t, SQLERRM, SQLSTATE;
    END;
  END LOOP;

  -- Reset role to superuser/owner to switch role
  PERFORM set_config('role', 'postgres', true);

  -- Test as authenticated
  RAISE NOTICE '=== TESTING ROLE: authenticated ===';
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', '{"role": "authenticated"}', true);
  FOREACH t IN ARRAY tables LOOP
    BEGIN
      EXECUTE format('SELECT * FROM %I LIMIT 1', t) INTO r;
      RAISE NOTICE '✅ Table: % - Success', t;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ Table: % - Error: % (%)', t, SQLERRM, SQLSTATE;
    END;
  END LOOP;
END;
$$;
