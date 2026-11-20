"""Copy existing sites and accounts to an empty PostgreSQL database."""
import argparse
import sqlite3
from contextlib import closing
from pathlib import Path

import app
import database


def migrate(source_path):
    if not database.DATABASE_URL:
        raise ValueError("Configura DATABASE_URL antes de migrar.")
    if not source_path.is_file():
        raise ValueError("El archivo de SQLite no existe.")
    app.initialize()
    source_uri = source_path.resolve().as_uri() + "?mode=ro"
    with closing(sqlite3.connect(source_uri, uri=True)) as source, closing(app.connect()) as target, target:
        source.execute("BEGIN")
        target.execute("LOCK TABLE sites, accounts IN ACCESS EXCLUSIVE MODE")
        if target.execute("SELECT EXISTS(SELECT 1 FROM sites) OR EXISTS(SELECT 1 FROM accounts) AS populated").fetchone()["populated"]:
            raise ValueError("La base de destino debe estar vacía.")
        sites = source.execute("SELECT id,name,country,city,schedule,published FROM sites").fetchall()
        has_accounts = source.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='accounts'").fetchone()
        users = source.execute("SELECT id,username,salt,password_hash,site_id FROM accounts").fetchall() if has_accounts else []
        for row in sites:
            target.execute("INSERT INTO sites (id,name,country,city,schedule,published) VALUES (?,?,?,?,?,?)", row)
        for row in users:
            target.execute("INSERT INTO accounts (id,username,salt,password_hash,site_id) VALUES (?,?,?,?,?)", row)
        for table in ("sites", "accounts"):
            target.execute(f"""SELECT setval(pg_get_serial_sequence('{table}', 'id'),
                COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM {table}""")
    return len(sites), len(users)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    args = parser.parse_args()
    try:
        sites, users = migrate(args.source)
    except (ValueError, sqlite3.Error, database.DatabaseError) as error:
        parser.exit(1, f"Migración interrumpida: {error}\n")
    print(f"Migración completada. Sedes: {sites}. Cuentas: {users}.")
