import argparse
import getpass
import hmac
import html
import os
import re
import sqlite3
from contextlib import closing
from urllib.parse import parse_qs
from wsgiref.simple_server import make_server

import accounts

BRAND = "Mission Iglesia Universal de Jesucristo El Buen Samaritano"
FIELDS = {"name": "Nombre de la sede", "country": "País", "city": "Ciudad", "schedule": "Horario de culto"}
DB_PATH = os.environ.get("MISSION_DB", "mission.sqlite3")
LOCAL = os.environ.get("MISSION_LOCAL") == "1"


def escape(value):
    return html.escape(str(value), quote=True)


def connect():
    db = sqlite3.connect(DB_PATH)
    db.execute("PRAGMA foreign_keys=ON")
    db.row_factory = sqlite3.Row
    return db


def initialize():
    with closing(connect()) as db, db:
        db.execute("""CREATE TABLE IF NOT EXISTS sites (
            id INTEGER PRIMARY KEY, name TEXT NOT NULL, country TEXT NOT NULL,
            city TEXT NOT NULL, schedule TEXT NOT NULL, published INTEGER NOT NULL
            CHECK (published IN (0,1))
        )""")

        db.executescript(accounts.SCHEMA)


def page(title, content):
    return f"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)} · Mission UJEBS</title><style>
*{{box-sizing:border-box}}body{{margin:0;background:#f4f5f8;color:#182641;font:1rem/1.55 system-ui,sans-serif}}
header{{background:#142743;color:#fff}}nav,main{{width:min(100% - 2rem,70rem);margin:auto}}
nav{{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 0}}
nav a{{color:#fff}}main{{padding:2rem 0 4rem}}h1{{font-size:clamp(2rem,5vw,3.3rem);line-height:1.1;margin:.25rem 0 1rem}}
.hero{{background:#e4eaf6;border-radius:1rem;padding:clamp(1.25rem,4vw,3rem);margin-bottom:2rem}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr));gap:1rem}}
article,form.editor{{background:white;border:1px solid #d9e0eb;border-radius:.75rem;padding:1.2rem}}
form.editor{{max-width:40rem;margin-bottom:1.5rem}}h2,h3,p{{margin-top:.25rem}}
label{{display:block;margin-bottom:.85rem}}input:not([type=checkbox]){{display:block;width:100%;font:inherit;padding:.65rem;border:1px solid #8291a8;border-radius:.4rem}}
button,.button{{font:inherit;background:#264979;color:white;padding:.6rem 1rem;border:0;border-radius:.4rem;cursor:pointer;text-decoration:none;display:inline-block}}
a{{color:#264979}}.quiet{{color:#4a5a72}}.notice{{border-left:4px solid #264979;padding:.75rem 1rem;background:white}}.status{{font-weight:600}}
</style></head><body><header><nav><a href="/"><strong>Mission UJEBS</strong></a>
<a href="/admin">Panel de sedes</a></nav></header><main>{content}</main></body></html>"""


def directory(query):
    with closing(connect()) as db:
        rows = db.execute("SELECT * FROM sites WHERE published = 1 ORDER BY country, city, name").fetchall()
    matches = [row for row in rows if query.casefold() in f"{row['name']} {row['country']} {row['city']}".casefold()]
    cards = "".join(
        f"<article><p class='quiet'>{escape(row['city'])}, {escape(row['country'])}</p>"
        f"<h3>{escape(row['name'])}</h3><p>{escape(row['schedule'] or 'Horario por confirmar')}</p></article>"
        for row in matches
    )
    empty = "No se encontraron sedes para esta búsqueda." if query else "Todavía no hay sedes publicadas."
    listings = cards or f"<p class='notice'>{empty}</p>"
    return page("Inicio", f"""<section class="hero"><h1>{BRAND}</h1>
<p>Encuentra una congregación y consulta sus horarios de culto.</p></section>
<h2>Directorio de congregaciones</h2><form method="get" action="/" class="editor">
<label>Buscar por sede, país o ciudad<input name="q" value="{escape(query)}" maxlength="100"></label>
<button>Buscar</button> <a href="/">Ver todas</a></form><section class="grid">{listings}</section>""")


def csrf(token):
    return f'<input type="hidden" name="csrf" value="{escape(token)}">'


def admin(token, account, site_id=None, values=None, error=""):
    with closing(connect()) as db:
        rows = db.execute("SELECT * FROM sites ORDER BY country, city, name").fetchall()
    if account["site_id"] is not None:
        rows = [row for row in rows if row["id"] == account["site_id"]]
    if values is None:
        selected = next((row for row in rows if row["id"] == site_id), None)
        if site_id and selected is None:
            return None
        values = dict(selected) if selected else {}
    inputs = "".join(
        f'<label>{label}<input name="{field}" value="{escape(values.get(field, ""))}" maxlength="120"'
        f'{" required" if field != "schedule" else ""}></label>' for field, label in FIELDS.items()
    )
    checked = "checked" if values.get("published") else ""
    cards = "".join(
        f"<article><p class='status'>{'Publicada' if row['published'] else 'Borrador'}</p>"
        f"<h3>{escape(row['name'])}</h3><p>{escape(row['city'])}, {escape(row['country'])}</p>"
        f"<a href='/admin/sedes/{row['id']}'>Editar sede</a></article>" for row in rows
    )
    notice = f'<p class="notice" role="alert">{escape(error)}</p>' if error else ""
    action = f"/admin/sedes/{site_id}" if site_id else "/admin/sedes"
    return page("Panel de sedes", f"""<h1>Panel de sedes</h1>
<form method="post" action="/salir">{csrf(token)}<button>Cerrar sesión</button></form>
<h2>{'Editar sede' if site_id else 'Registrar sede'}</h2>{notice}
<form class="editor" method="post" action="{action}">{csrf(token)}{inputs}
<label><input type="checkbox" name="published" {checked}> Mostrar en el directorio público</label>
<button>Guardar sede</button> <a href="/admin">Volver al panel</a></form>
<h2>Sedes registradas</h2><section class="grid">{cards or '<p>Registra la primera sede.</p>'}</section>""")


def login(error=""):
    notice = f'<p class="notice" role="alert">{escape(error)}</p>' if error else ""
    return page("Acceso administrativo", f"""<h1>Acceso administrativo</h1>{notice}
<form class="editor" method="post" action="/acceso">
<label>Usuario<input name="username" autocomplete="username" maxlength="64" required></label>
<label>Contraseña<input name="password" type="password" autocomplete="current-password" required></label>
<button>Iniciar sesión</button></form>""")


def application(environ, start_response):
    def response(status, body="", headers=()):
        start_response(status, [("Content-Type", "text/html; charset=utf-8"), ("Cache-Control", "no-store"),
                                ("X-Content-Type-Options", "nosniff"), ("X-Frame-Options", "DENY"),
                                ("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'"), *headers])
        return [body.encode()]

    def redirect(location, *headers):
        return response("303 See Other", headers=(("Location", location), *headers))

    path = environ.get("PATH_INFO", "/")
    method = environ["REQUEST_METHOD"]
    if method == "GET" and path == "/healthz":
        try:
            with closing(connect()) as db:
                db.execute("SELECT id FROM sites LIMIT 1").fetchone()
        except sqlite3.Error:
            return response("503 Service Unavailable", "Base de datos no disponible.")
        return response("200 OK", "OK")
    if method == "GET" and path == "/":
        query = parse_qs(environ.get("QUERY_STRING", "")).get("q", [""])[0][:100].strip()
        return response("200 OK", directory(query))

    cookie = re.search(r"(?:^|;\s*)mission_session=([^;]*)", environ.get("HTTP_COOKIE", ""))
    token = cookie.group(1) if cookie else ""
    cookie_flags = "; Path=/; HttpOnly; SameSite=Strict" + ("" if LOCAL else "; Secure")
    if path == "/acceso" and method == "GET":
        return response("200 OK", login())

    if method == "POST":
        try:
            length = int(environ.get("CONTENT_LENGTH") or "0")
            if not 0 < length <= 8192:
                return response("400 Bad Request", "Formulario inválido.")
            data = parse_qs(environ["wsgi.input"].read(length).decode(), max_num_fields=16)
        except ValueError:
            return response("400 Bad Request", "Formulario inválido.")
        if path == "/acceso":
            with closing(connect()) as db:
                new_token = accounts.sign_in(db, data.get("username", [""])[0], data.get("password", [""])[0])
            if not new_token:
                return response("403 Forbidden", login("No se pudo iniciar sesión."))
            return redirect("/admin", ("Set-Cookie", f"mission_session={new_token}{cookie_flags}"))

    with closing(connect()) as db:
        account = accounts.signed_in_account(db, token)
    if method == "POST":
        if account is None or not hmac.compare_digest(data.get("csrf", [""])[0].encode(), token.encode()):
            return response("403 Forbidden", "Solicitud no autorizada.")
        if path == "/salir":
            with closing(connect()) as db, db:
                db.execute("DELETE FROM sessions WHERE token_hash=?", (accounts.token_hash(token),))
            return redirect("/", ("Set-Cookie", f"mission_session={cookie_flags}; Max-Age=0"))

    match = re.fullmatch(r"/admin/sedes/([1-9][0-9]{0,14})", path)
    site_id = int(match.group(1)) if match else None
    if method == "GET" and (path == "/admin" or match):
        if account is None:
            return redirect("/acceso")
        assigned = account["site_id"]
        if assigned is not None:
            if site_id is None:
                return redirect(f"/admin/sedes/{assigned}")
            if site_id != assigned:
                return response("404 Not Found", "Sede no encontrada.")
        body = admin(token, account, site_id)
        return response("200 OK", body) if body else response("404 Not Found", "Sede no encontrada.")
    if method == "POST" and (path == "/admin/sedes" or match):
        if account["site_id"] is not None and account["site_id"] != site_id:
            return response("403 Forbidden", "Solicitud no autorizada.")
        values = {field: data.get(field, [""])[0].strip() for field in FIELDS}
        values["published"] = int("published" in data)
        if any(not values[field] for field in ("name", "country", "city")) or any(len(values[field]) > 120 for field in FIELDS):
            return response("422 Unprocessable Entity", admin(token, account, site_id, values, "Revisa los campos obligatorios y el límite de 120 caracteres."))
        with closing(connect()) as db, db:
            params = [values[field] for field in (*FIELDS, "published")]
            if site_id:
                changed = db.execute("UPDATE sites SET name=?, country=?, city=?, schedule=?, published=? WHERE id=?", (*params, site_id))
                if not changed.rowcount:
                    return response("404 Not Found", "Sede no encontrada.")
            else:
                db.execute("INSERT INTO sites (name,country,city,schedule,published) VALUES (?,?,?,?,?)", params)
        return redirect("/admin")
    return response("404 Not Found", "Página no encontrada.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    commands = parser.add_subparsers(dest="command")
    user = commands.add_parser("crear-cuenta")
    user.add_argument("usuario")
    user.add_argument("--sede", type=int)
    commands.add_parser("inicializar")
    args = parser.parse_args()
    initialize()
    if args.command == "crear-cuenta":
        password = getpass.getpass("Contraseña: ")
        if password != getpass.getpass("Repite la contraseña: "):
            parser.exit(1, "Las contraseñas deben coincidir.\n")
        try:
            with closing(connect()) as db, db:
                accounts.create_account(db, args.usuario, password, args.sede)
        except ValueError as error:
            parser.exit(1, f"{error}\n")
        except sqlite3.IntegrityError:
            parser.exit(1, "El usuario ya existe o la sede indicada no está registrada.\n")
        print("Cuenta creada.")
    elif not args.command:
        with make_server("127.0.0.1", 8000, application) as server:
            print("http://127.0.0.1:8000", flush=True)
            server.serve_forever()
