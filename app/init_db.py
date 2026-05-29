import asyncio
import logging
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import engine, async_session
from app.models import Base, SystemConfig

logger = logging.getLogger("db_init")
logging.basicConfig(level=logging.INFO)

async def init_database():
    logger.info("Starting database initialization...")
    
    # 1. Create extension pgvector
    async with engine.begin() as conn:
        logger.info("Enabling pgvector extension...")
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
    
    # 2. Create tables
    async with engine.begin() as conn:
        logger.info("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Tables compiled successfully.")

    # 3. Seed default system configurations if not exists
    async with async_session() as session:
        async with session.begin():
            # Check if default settings exist
            res = await session.execute(
                text("SELECT 1 FROM system_config WHERE key = 'hnsw_params'")
            )
            if not res.scalar():
                logger.info("Seeding default HNSW params inside system_config...")
                config = SystemConfig(
                    key="hnsw_params",
                    value={
                        "hnsw_m": 16,
                        "hnsw_ef_construction": 64,
                        "hnsw_ef_search": 40
                    }
                )
                session.add(config)
            
            res_db = await session.execute(
                text("SELECT 1 FROM system_config WHERE key = 'db_params'")
            )
            if not res_db.scalar():
                logger.info("Seeding default DB params inside system_config...")
                db_config = SystemConfig(
                    key="db_params",
                    value={
                        "db_host": "postgresql://localhost:5432/ragdb"
                    }
                )
                session.add(db_config)
                
            await session.commit()
    logger.info("Database initialization complete.")

if __name__ == "__main__":
    asyncio.run(init_database())
