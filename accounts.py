"""Administrative accounts and revocable sessions."""
import hashlib
import hmac
import re
import secrets
import time

SCHEMA = """
CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    salt BLOB NOT NULL,
    password_hash BLOB NOT NULL,
    site_id INTEGER REFERENCES sites(id)
);
CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    expires INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS login_attempts (
    username TEXT PRIMARY KEY,
    window_start INTEGER NOT NULL,
    attempts INTEGER NOT NULL
);
"""


def normalize(username):
    username = username.strip().lower()
    return username if re.fullmatch(r"[a-z0-9][a-z0-9_.-]{2,63}", username) else ""


def password_hash(password, salt):
    return hashlib.scrypt(password.encode(), salt=salt, n=32768, r=8, p=1, maxmem=64 * 1024 * 1024)


def create_account(db, username, password, site_id):
    username = normalize(username)
    if not username or not 14 <= len(password) <= 256:
        raise ValueError("Usa un usuario de 3 a 64 caracteres y una contraseña de 14 a 256 caracteres.")
    salt = secrets.token_bytes(16)
    db.execute("INSERT INTO accounts (username,salt,password_hash,site_id) VALUES (?,?,?,?)",
               (username, salt, password_hash(password, salt), site_id))


def sign_in(db, username, password):
    username = normalize(username)
    if not username or len(password) > 256:
        return None
    now = int(time.time())
    with db:
        db.execute("DELETE FROM login_attempts WHERE window_start <= ?", (now - 900,))
        account = db.execute("SELECT * FROM accounts WHERE username=?", (username,)).fetchone()
        if account is None:
            return None
        row = db.execute("SELECT attempts FROM login_attempts WHERE username=?", (username,)).fetchone()
        if row and row["attempts"] >= 8:
            return None
        db.execute("""INSERT INTO login_attempts VALUES (?,?,1)
            ON CONFLICT(username) DO UPDATE SET attempts=attempts+1""", (username, now))
    if not hmac.compare_digest(account["password_hash"], password_hash(password, account["salt"])):
        return None
    token = secrets.token_hex(32)
    with db:
        db.execute("DELETE FROM login_attempts WHERE username=?", (username,))
        db.execute("DELETE FROM sessions WHERE expires <= ?", (now,))
        db.execute("INSERT INTO sessions VALUES (?,?,?)", (token_hash(token), account["id"], now + 7200))
    return token


def token_hash(token):
    return hashlib.sha256(token.encode()).hexdigest()


def signed_in_account(db, token):
    if not re.fullmatch(r"[0-9a-f]{64}", token):
        return None
    return db.execute("""SELECT accounts.id, accounts.username, accounts.site_id
        FROM sessions JOIN accounts ON accounts.id=sessions.account_id
        WHERE token_hash=? AND expires>?""", (token_hash(token), int(time.time()))).fetchone()
