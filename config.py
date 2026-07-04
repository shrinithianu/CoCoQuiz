import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "supersecretkey"
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or "jwtsecretkey"
    MYSQL_HOST = os.environ.get("MYSQL_HOST") or "localhost"
    MYSQL_USER = os.environ.get("MYSQL_USER") or "root"
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD") or "root123"
    MYSQL_DB = os.environ.get("MYSQL_DB") or "cocoquiz"
