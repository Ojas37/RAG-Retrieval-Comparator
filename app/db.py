from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.config import settings

# Create async database engine
# We set echo=False for production, which disables verbose SQL logging in standard output.
engine = create_async_engine(
    settings.database_url,
    pool_size=20,
    max_overflow=10,
    pool_recycle=1800,
    echo=False
)

# Async session factory
async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Dependency to get async session
async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
