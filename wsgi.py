"""Vercel entrypoint. SQLite remains available through the local server."""
import logging
from threading import Lock

from app import application as mission_application, initialize
from database import DATABASE_URL, DatabaseError

_schema_lock = Lock()
_schema_ready = False


def application(environ, start_response):
    global _schema_ready
    if DATABASE_URL:
        try:
            with _schema_lock:
                if not _schema_ready:
                    initialize()
                    _schema_ready = True
        except DatabaseError as error:
            logging.getLogger(__name__).error(
                "Database startup failed: %s (SQLSTATE %s)",
                type(error).__name__, getattr(error, "sqlstate", None) or "unavailable",
            )
        else:
            return mission_application(environ, start_response)
    start_response("503 Service Unavailable", [
        ("Content-Type", "text/plain; charset=utf-8"),
        ("Cache-Control", "no-store"),
    ])
    return ["La conexión con la base de datos está pendiente.".encode()]
