import uuid
from datetime import datetime
from typing import Any, Optional
from sqlalchemy import Text, Integer, Float, ForeignKey, Index, String, DateTime, func, Computed
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB, TSVECTOR
from pgvector.sqlalchemy import Vector

class Base(DeclarativeBase):
    pass

class SystemConfig(Base):
    __tablename__ = "system_config"
    
    key: Mapped[str] = mapped_column(String(255), primary_key=True)
    value: Mapped[dict] = mapped_column(JSONB)

class Corpus(Base):
    __tablename__ = "corpus"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    doc_id: Mapped[str] = mapped_column(Text, unique=True, index=True)
    content: Mapped[str] = mapped_column(Text)
    embedding: Mapped[list[float]] = mapped_column(Vector(384))  # 384 dimensions for bge-small
    token_count: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # TSVECTOR column defined here, it will automatically sync with full text
    ts: Mapped[Any] = mapped_column(
        TSVECTOR, 
        Computed("to_tsvector('english', content)", persisted=True),
        nullable=True
    )

    __table_args__ = (
        Index(
            "hnsw_idx",
            "embedding",
            postgresql_using="hnsw",
            postgresql_ops={"embedding": "vector_cosine_ops"},
            postgresql_with={"m": 16, "ef_construction": 64}
        ),
        Index("ts_idx", "ts", postgresql_using="gin"),
    )

class Query(Base):
    __tablename__ = "queries"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    query_id: Mapped[str] = mapped_column(Text, unique=True, index=True)
    text: Mapped[str] = mapped_column(Text)
    relevant_doc_ids: Mapped[list[str]] = mapped_column(JSONB)  # ground truth answer key

class BenchmarkRun(Base):
    __tablename__ = "benchmark_runs"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text, default="running")  # running, completed, failed
    config: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

class RetrievalResult(Base):
    __tablename__ = "retrieval_results"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    run_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("benchmark_runs.id", ondelete="CASCADE"), index=True)
    query_id: Mapped[str] = mapped_column(Text, index=True)
    strategy: Mapped[str] = mapped_column(Text)  # dense, sparse, hybrid
    retrieved_ids: Mapped[list[str]] = mapped_column(JSONB)
    reciprocal_rank: Mapped[float] = mapped_column(Float)
    latency_ms: Mapped[int] = mapped_column(Integer)
