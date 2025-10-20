FROM python:3.12-slim-bookworm

WORKDIR /

COPY ./app/r.txt /r.txt

RUN pip install --no-cache-dir --upgrade -r /r.txt

VOLUME /app/web

COPY ./app /app

COPY ./web/dist /app/web_prebuilded

EXPOSE 7050

CMD [ "python", "-m", "uvicorn", "--host", "0.0.0.0", "--port", "7050", "--workers", "4", "--log-level", "debug", "app.main:app" ]