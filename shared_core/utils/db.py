import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./local.db")

# Configure SQLAlchemy to use psycopg3 for PostgreSQL connections
connect_args = {}
if DATABASE_URL.startswith("postgresql"):
    # Force use of psycopg3
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://")

# Try to create engine, fallback to SQLite if database connection fails
try:
    engine = create_engine(DATABASE_URL, future=True, connect_args=connect_args)
    # Test the connection
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"Database connection failed: {e}")
    print("Falling back to SQLite for deployment testing")
    DATABASE_URL = "sqlite:///./local.db"
    engine = create_engine(DATABASE_URL, future=True, connect_args=connect_args)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
