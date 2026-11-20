# Mission Iglesia Universal de Jesucristo El Buen Samaritano

Primera entrega. El directorio público muestra sedes publicadas y permite buscarlas por nombre, ciudad o país. El panel permite registrar, editar, publicar y retirar sedes del directorio.

## Ejecutar en local

Requiere Python 3.10 o posterior. No necesita instalar paquetes para la prueba local.

```bash
export MISSION_LOCAL=1
read -rsp 'Contraseña administrativa: ' MISSION_ADMIN_PASSWORD
echo
export MISSION_ADMIN_PASSWORD
export MISSION_SESSION_KEY="$(python -c 'import secrets; print(secrets.token_hex(32))')"
python app.py
```

Abre http://127.0.0.1:8000 y selecciona **Panel de sedes**. El archivo SQLite se crea automáticamente. Usa solo datos de prueba en esta versión.

## Despliegue pendiente

El servidor incluido sirve para desarrollo local. Antes de habilitar accesos reales, configurar un servidor WSGI de producción detrás de HTTPS, un volumen persistente para `MISSION_DB`, secretos del entorno, control de intentos de inicio de sesión y cuentas individuales con permisos por sede. En producción, omitir `MISSION_LOCAL`. El panel actual admite una única contraseña administrativa.
