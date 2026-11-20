FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt && \
    useradd --uid 10001 --create-home mission && \
    install -d -o mission -g mission /data
COPY app.py accounts.py database.py migrate_sqlite.py ./
ENV MISSION_DB=/data/mission.sqlite3 PYTHONUNBUFFERED=1
USER mission
VOLUME /data
EXPOSE 8000
CMD ["sh", "-c", "python app.py inicializar && exec gunicorn --bind 0.0.0.0:${PORT:-8000} --workers 2 --access-logfile - app:application"]
