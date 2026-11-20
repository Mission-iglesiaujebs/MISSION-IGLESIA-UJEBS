"""Vercel entrypoint. SQLite remains available through the local server."""
from app import application as mission_application
from database import DATABASE_URL


def application(environ, start_response):
    if DATABASE_URL:
        return mission_application(environ, start_response)
    start_response("503 Service Unavailable", [
        ("Content-Type", "text/plain; charset=utf-8"),
        ("Cache-Control", "no-store"),
    ])
    return ["La conexión con la base de datos está pendiente.".encode()]
