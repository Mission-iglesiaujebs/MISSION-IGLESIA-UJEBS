# Mission Iglesia Universal de Jesucristo El Buen Samaritano

El portal público permite buscar sedes por nombre, ciudad o país. El panel gestiona su publicación con cuentas individuales. Una cuenta general puede registrar y editar todas las sedes. Una cuenta asociada a una sede solo puede editar esa sede.

## Prueba local

Requiere Python 3.10 o posterior.

```bash
python app.py crear-cuenta direccion
MISSION_LOCAL=1 python app.py
```

Abre http://127.0.0.1:8000. Registra una sede para obtener su ID desde el enlace **Editar sede**. Crea una cuenta local con el ID correspondiente, por ejemplo `python app.py crear-cuenta administrador-local --sede 1`. El sistema solicitará la contraseña de manera interactiva.

## Contenedor

```bash
docker build -t mission-ujebs .
docker volume create mission-data
docker run --rm -it -v mission-data:/data mission-ujebs python app.py crear-cuenta direccion
docker run --rm -p 127.0.0.1:8000:8000 -e MISSION_LOCAL=1 -v mission-data:/data mission-ujebs
```

Para alojarlo en la nube, configura HTTPS, un volumen persistente con permisos de escritura para el usuario 10001 montado en `/data` y una sola réplica de la aplicación mientras se use SQLite. Crea la cuenta inicial con el comando interactivo en el volumen del servicio. Mantén desactivado `MISSION_LOCAL` en producción. El arranque crea las tablas de cuentas y sesiones sin sustituir los registros de sedes existentes.

El repositorio contiene la primera fase del proyecto. Afiliación de miembros, agenda, formación, finanzas, acompañamiento y videoconferencias pertenecen a entregas posteriores. El proceso de alojamiento y las pruebas de producción se realizan por separado.

## PostgreSQL administrado

Configura `DATABASE_URL` como secreto del entorno. Para AWS RDS, apunta a una base privada, usa un usuario de base de datos dedicado y activa la validación TLS con `sslmode=verify-full` y el certificado raíz correspondiente. El arranque aplica el esquema. Sin `DATABASE_URL`, sigue disponible SQLite.

Si ya hay sedes o cuentas, detén las escrituras y guarda una copia consistente de SQLite. Con PostgreSQL vacío, ejecuta `python migrate_sqlite.py /ruta/copia.sqlite3`. Conserva los identificadores y permisos. Las sesiones anteriores se cierran y los usuarios deben iniciar sesión de nuevo. Comprueba el acceso y los conteos antes de dirigir tráfico a PostgreSQL.
