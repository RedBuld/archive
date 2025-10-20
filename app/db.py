import os
import redis.asyncio as rds
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from elasticsearch import Elasticsearch

DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_BASE = os.environ.get("DB_BASE")
DB_HOST = os.environ.get("DB_HOST")
RD_HOST = os.environ.get("RD_HOST")
ES_HOST = os.environ.get("ES_HOST")

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:3306/{DB_BASE}" # ?unix_socket=/var/run/mysqld/mysqld.sock&charset=utf8mb4

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=10, max_overflow=50, pool_recycle=10, pool_pre_ping=True, pool_timeout=30, pool_reset_on_return='rollback'
)

DB = sessionmaker(engine, expire_on_commit=False, autoflush=False)

RD = rds.Redis( host=RD_HOST, port=6379, db=3, protocol=3, decode_responses=True )

# ES = Elasticsearch(f"http://{ES_HOST}:9200/")

# general = {
#     "properties": {
#         "id": {"type": "integer"},
#         "type": {"type": "text"},
#         "fuzzy": {"type": "text"},
#     }
# }

# if not ES.indices.exists(index="anime"):
#     ES.indices.create(index="anime", mappings=general)

# if not ES.indices.exists(index="manga"):
#     ES.indices.create(index="manga", mappings=general)

# if not ES.indices.exists(index="book"):
#     ES.indices.create(index="book", mappings=general)

Base = declarative_base()

