
DO $$
DECLARE
    pass_admin   text := 'AdminToto';  
    pass_app     text := 'AdminMarife';   
    pass_lectura text := 'AdminPrueba';   
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'grp_totospizza_admin') THEN
        CREATE ROLE grp_totospizza_admin NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'grp_totospizza_app') THEN
        CREATE ROLE grp_totospizza_app NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'grp_totospizza_lectura') THEN
        CREATE ROLE grp_totospizza_lectura NOLOGIN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'totospizza_admin') THEN
        EXECUTE format('CREATE ROLE totospizza_admin LOGIN PASSWORD %L', pass_admin);
    ELSE
        EXECUTE format('ALTER ROLE totospizza_admin PASSWORD %L', pass_admin);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'totospizza_app') THEN
        EXECUTE format('CREATE ROLE totospizza_app LOGIN PASSWORD %L', pass_app);
    ELSE
        EXECUTE format('ALTER ROLE totospizza_app PASSWORD %L', pass_app);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'totospizza_lectura') THEN
        EXECUTE format('CREATE ROLE totospizza_lectura LOGIN PASSWORD %L', pass_lectura);
    ELSE
        EXECUTE format('ALTER ROLE totospizza_lectura PASSWORD %L', pass_lectura);
    END IF;

    GRANT grp_totospizza_admin   TO totospizza_admin;
    GRANT grp_totospizza_app     TO totospizza_app;
    GRANT grp_totospizza_lectura TO totospizza_lectura;
END
$$;
