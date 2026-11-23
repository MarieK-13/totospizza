REVOKE ALL ON DATABASE totospizza FROM PUBLIC;
GRANT CONNECT ON DATABASE totospizza TO grp_totospizza_admin, grp_totospizza_app, grp_totospizza_lectura;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
ALTER SCHEMA public OWNER TO grp_totospizza_admin;
GRANT USAGE ON SCHEMA public TO grp_totospizza_app, grp_totospizza_lectura;

ALTER DEFAULT PRIVILEGES FOR ROLE totospizza_admin IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO grp_totospizza_app;
ALTER DEFAULT PRIVILEGES FOR ROLE totospizza_admin IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO grp_totospizza_app;
ALTER DEFAULT PRIVILEGES FOR ROLE totospizza_admin IN SCHEMA public GRANT SELECT ON TABLES TO grp_totospizza_lectura;
ALTER DEFAULT PRIVILEGES FOR ROLE totospizza_admin IN SCHEMA public GRANT SELECT ON SEQUENCES TO grp_totospizza_lectura;
ALTER DEFAULT PRIVILEGES FOR ROLE grp_totospizza_admin IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO grp_totospizza_app;
ALTER DEFAULT PRIVILEGES FOR ROLE grp_totospizza_admin IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO grp_totospizza_app;
ALTER DEFAULT PRIVILEGES FOR ROLE grp_totospizza_admin IN SCHEMA public GRANT SELECT ON TABLES TO grp_totospizza_lectura;
ALTER DEFAULT PRIVILEGES FOR ROLE grp_totospizza_admin IN SCHEMA public GRANT SELECT ON SEQUENCES TO grp_totospizza_lectura;
