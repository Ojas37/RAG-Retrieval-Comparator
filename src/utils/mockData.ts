export interface RetrievalMetrics {
  mrr1: number;
  mrr5: number;
  mrr10: number;
  recall5: number;
  recall10: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  throughputQps: number;
  indexSizeMb: number;
  buildTimeMinutes: number;
}

export interface BenchmarkRun {
  id: string;
  name: string;
  timestamp: string;
  status: 'completed' | 'running' | 'failed';
  corpusSize: number;
  queryCount: number;
  embeddingModel: string;
  chunkStrategy: string;
  indexType: 'HNSW' | 'IVFFlat' | 'None';
  dense: RetrievalMetrics;
  sparse: RetrievalMetrics;
  hybrid: RetrievalMetrics;
}

export interface ChunkResult {
  id: string;
  rank: number;
  score: number;
  latencyMs: number;
  sourceDoc: string;
  chunkIndex: number;
  content: string;
  matchedTerms: string[];
}

export interface QueryComparison {
  query: string;
  dense: ChunkResult[];
  sparse: ChunkResult[];
  hybrid: ChunkResult[];
}

export const MOCK_RUNS: BenchmarkRun[] = [
  {
    id: 'run-104-hnsw',
    name: 'Standard RAG Evaluation (HNSW)',
    timestamp: '2026-05-28 10:15:30',
    status: 'completed',
    corpusSize: 12500,
    queryCount: 500,
    embeddingModel: 'openai/text-embedding-3-small (1536d)',
    chunkStrategy: 'RecursiveCharacterSplitting (500 tokens, 10% overlap)',
    indexType: 'HNSW',
    dense: {
      mrr1: 0.812,
      mrr5: 0.884,
      mrr10: 0.898,
      recall5: 0.912,
      recall10: 0.942,
      avgLatencyMs: 14.5,
      p95LatencyMs: 24.2,
      throughputQps: 185.0,
      indexSizeMb: 142.4,
      buildTimeMinutes: 3.2,
    },
    sparse: {
      mrr1: 0.724,
      mrr5: 0.801,
      mrr10: 0.822,
      recall5: 0.835,
      recall10: 0.864,
      avgLatencyMs: 8.2,
      p95LatencyMs: 15.6,
      throughputQps: 340.0,
      indexSizeMb: 45.1,
      buildTimeMinutes: 0.8,
    },
    hybrid: {
      mrr1: 0.886,
      mrr5: 0.932,
      mrr10: 0.948,
      recall5: 0.958,
      recall10: 0.976,
      avgLatencyMs: 28.4,
      p95LatencyMs: 44.8,
      throughputQps: 110.0,
      indexSizeMb: 187.5,
      buildTimeMinutes: 4.0,
    }
  },
  {
    id: 'run-103-ivfflat',
    name: 'Aggressive Cluster Partitioning (IVFFlat)',
    timestamp: '2026-05-27 16:42:11',
    status: 'completed',
    corpusSize: 12500,
    queryCount: 500,
    embeddingModel: 'openai/text-embedding-3-small (1536d)',
    chunkStrategy: 'RecursiveCharacterSplitting (500 tokens, 10% overlap)',
    indexType: 'IVFFlat',
    dense: {
      mrr1: 0.791,
      mrr5: 0.862,
      mrr10: 0.874,
      recall5: 0.889,
      recall10: 0.915,
      avgLatencyMs: 11.2,
      p95LatencyMs: 19.8,
      throughputQps: 220.0,
      indexSizeMb: 76.8,
      buildTimeMinutes: 1.5,
    },
    sparse: {
      mrr1: 0.724,
      mrr5: 0.801,
      mrr10: 0.822,
      recall5: 0.835,
      recall10: 0.864,
      avgLatencyMs: 8.2,
      p95LatencyMs: 15.6,
      throughputQps: 340.0,
      indexSizeMb: 45.1,
      buildTimeMinutes: 0.8,
    },
    hybrid: {
      mrr1: 0.854,
      mrr5: 0.908,
      mrr10: 0.921,
      recall5: 0.932,
      recall10: 0.951,
      avgLatencyMs: 22.1,
      p95LatencyMs: 38.2,
      throughputQps: 145.0,
      indexSizeMb: 121.9,
      buildTimeMinutes: 2.3,
    }
  },
  {
    id: 'run-102-bge-large',
    name: 'BGE Heavy Embeddings (HNSW)',
    timestamp: '2026-05-26 11:20:05',
    status: 'completed',
    corpusSize: 6200,
    queryCount: 200,
    embeddingModel: 'BAAI/bge-large-en-v1.5 (1024d)',
    chunkStrategy: 'FixedSizeChunking (300 tokens, 20% overlap)',
    indexType: 'HNSW',
    dense: {
      mrr1: 0.834,
      mrr5: 0.899,
      mrr10: 0.912,
      recall5: 0.931,
      recall10: 0.954,
      avgLatencyMs: 22.8,
      p95LatencyMs: 38.6,
      throughputQps: 105.0,
      indexSizeMb: 184.2,
      buildTimeMinutes: 4.8,
    },
    sparse: {
      mrr1: 0.698,
      mrr5: 0.782,
      mrr10: 0.803,
      recall5: 0.814,
      recall10: 0.839,
      avgLatencyMs: 7.1,
      p95LatencyMs: 12.4,
      throughputQps: 410.0,
      indexSizeMb: 24.8,
      buildTimeMinutes: 0.5,
    },
    hybrid: {
      mrr1: 0.898,
      mrr5: 0.945,
      mrr10: 0.959,
      recall5: 0.969,
      recall10: 0.984,
      avgLatencyMs: 34.5,
      p95LatencyMs: 54.2,
      throughputQps: 78.0,
      indexSizeMb: 209.0,
      buildTimeMinutes: 5.3,
    }
  },
  {
    id: 'run-101-flat',
    name: 'Unindexed Flat Baseline',
    timestamp: '2026-05-25 09:05:14',
    status: 'completed',
    corpusSize: 4500,
    queryCount: 100,
    embeddingModel: 'openai/text-embedding-3-small (1536d)',
    chunkStrategy: 'RecursiveCharacterSplitting (500 tokens, 10% overlap)',
    indexType: 'None',
    dense: {
      mrr1: 0.815,
      mrr5: 0.886,
      mrr10: 0.901,
      recall5: 0.914,
      recall10: 0.945,
      avgLatencyMs: 84.6,
      p95LatencyMs: 165.0,
      throughputQps: 12.0,
      indexSizeMb: 0.0,
      buildTimeMinutes: 0.0,
    },
    sparse: {
      mrr1: 0.718,
      mrr5: 0.795,
      mrr10: 0.814,
      recall5: 0.828,
      recall10: 0.859,
      avgLatencyMs: 8.5,
      p95LatencyMs: 14.8,
      throughputQps: 320.0,
      indexSizeMb: 16.2,
      buildTimeMinutes: 0.4,
    },
    hybrid: {
      mrr1: 0.879,
      mrr5: 0.928,
      mrr10: 0.942,
      recall5: 0.952,
      recall10: 0.971,
      avgLatencyMs: 98.4,
      p95LatencyMs: 184.2,
      throughputQps: 10.5,
      indexSizeMb: 16.2,
      buildTimeMinutes: 0.4,
    }
  }
];

export const MOCK_QUERIES: QueryComparison[] = [
  {
    query: 'What are the scaling limitations of pgvector HNSW index construction?',
    dense: [
      {
        id: 'chunk-dense-1',
        rank: 1,
        score: 0.892,
        latencyMs: 12.4,
        sourceDoc: 'pgvector_deep_dive.md',
        chunkIndex: 24,
        content: 'When constructing HNSW indexes in pgvector, RAM availability is the primary scaling bottleneck. Each HNSW index node contains links to neighbors, and during build time, these connections require recursive graph lookups. If the index graph size exceeds postgresql\'s shared_buffers or active RAM cache size, construction speeds drop by orders of magnitude due to disk swapping. Furthermore, indexing high-dimensional vectors (e.g. 1536 dimensions) increases the graph link storage requirement significantly, scaling at roughly O(N * M) where M is the maximum number of connections per node.',
        matchedTerms: ['HNSW index', 'pgvector', 'RAM availability', 'shared_buffers', 'graph link storage']
      },
      {
        id: 'chunk-dense-2',
        rank: 2,
        score: 0.841,
        latencyMs: 13.1,
        sourceDoc: 'postgres_indexing_handbook.pdf',
        chunkIndex: 128,
        content: 'In postgres, index memory is regulated by maintenance_work_mem. For pgvector\'s HNSW, having this value set too low causes index creation to spill into temporary work files. We recommend setting maintenance_work_mem to at least 1GB or 20% of system memory when compiling indexes on collections exceeding 1,000,000 document rows to avoid significant O(N log N) graph search overheads.',
        matchedTerms: ['postgres', 'maintenance_work_mem', 'index creation', 'overheads']
      },
      {
        id: 'chunk-dense-3',
        rank: 3,
        score: 0.789,
        latencyMs: 15.0,
        sourceDoc: 'vector_db_benchmarks.jsonl',
        chunkIndex: 5,
        content: 'HNSW recall degradation occurs under extreme load if ef_search parameters are constrained. While increasing ef_search improves accuracy (MRR@10 increases by 8%), query latencies scale linearly with it, which exposes a sharp performance cliff in high throughput applications.',
        matchedTerms: ['HNSW recall', 'ef_search', 'query latencies']
      }
    ],
    sparse: [
      {
        id: 'chunk-sparse-1',
        rank: 1,
        score: 0.684,
        latencyMs: 6.2,
        sourceDoc: 'pgvector_deep_dive.md',
        chunkIndex: 24,
        content: 'When constructing HNSW indexes in pgvector, RAM availability is the primary scaling bottleneck. Each HNSW index node contains links to neighbors, and during build time, these connections require recursive graph lookups. If the index graph size exceeds postgresql\'s shared_buffers or active RAM cache size, construction speeds drop by orders of magnitude due to disk swapping...',
        matchedTerms: ['HNSW', 'pgvector', 'index', 'construction']
      },
      {
        id: 'chunk-sparse-2',
        rank: 2,
        score: 0.612,
        latencyMs: 7.0,
        sourceDoc: 'postgres_indexing_handbook.pdf',
        chunkIndex: 128,
        content: 'In postgres, index memory is regulated by maintenance_work_mem. For pgvector\'s HNSW, having this value set too low causes index creation to spill into temporary work files. We recommend setting maintenance_work_mem to at least 1GB...',
        matchedTerms: ['postgres', 'index', 'HNSW']
      },
      {
        id: 'chunk-sparse-3',
        rank: 3,
        score: 0.495,
        latencyMs: 8.1,
        sourceDoc: 'pg_extensions_matrix.xlsx',
        chunkIndex: 42,
        content: 'To install the pgvector extension on a clean PostgreSQL instance, run: CREATE EXTENSION IF NOT EXISTS vector; Ensure your PG system is compiled with architecture-specific compiler flags like SSE or AVX-512 to auto-vectorize cosine distance metrics.',
        matchedTerms: ['pgvector', 'extension', 'PostgreSQL']
      }
    ],
    hybrid: [
      {
        id: 'chunk-hybrid-1',
        rank: 1,
        score: 0.948,
        latencyMs: 25.1,
        sourceDoc: 'pgvector_deep_dive.md',
        chunkIndex: 24,
        content: 'When constructing HNSW indexes in pgvector, RAM availability is the primary scaling bottleneck. Each HNSW index node contains links to neighbors, and during build time, these connections require recursive graph lookups. If the index graph size exceeds postgresql\'s shared_buffers or active RAM cache size, construction speeds drop by orders of magnitude due to disk swapping. Furthermore, indexing high-dimensional vectors (e.g. 1536 dimensions) increases the graph link storage requirement significantly, scaling at roughly O(N * M) where M is the maximum number of connections per node.',
        matchedTerms: ['HNSW index', 'pgvector', 'RAM availability', 'shared_buffers', 'graph link storage', 'construction']
      },
      {
        id: 'chunk-hybrid-2',
        rank: 2,
        score: 0.912,
        latencyMs: 26.8,
        sourceDoc: 'postgres_indexing_handbook.pdf',
        chunkIndex: 128,
        content: 'In postgres, index memory is regulated by maintenance_work_mem. For pgvector\'s HNSW, having this value set too low causes index creation to spill into temporary work files. We recommend setting maintenance_work_mem to at least 1GB or 20% of system memory when compiling indexes on collections exceeding 1,000,000 document rows to avoid significant O(N log N) graph search overheads.',
        matchedTerms: ['postgres', 'maintenance_work_mem', 'index creation', 'HNSW', 'overheads']
      },
      {
        id: 'chunk-hybrid-3',
        rank: 3,
        score: 0.851,
        latencyMs: 27.5,
        sourceDoc: 'vector_db_benchmarks.jsonl',
        chunkIndex: 5,
        content: 'HNSW recall degradation occurs under extreme load if ef_search parameters are constrained. While increasing ef_search improves accuracy (MRR@10 increases by 8%), query latencies scale linearly with it, which exposes a sharp performance cliff in high throughput applications.',
        matchedTerms: ['HNSW recall', 'ef_search', 'query latencies', 'throughput']
      }
    ]
  },
  {
    query: 'Explain the Reciprocal Rank Fusion (RRF) math in postgres.',
    dense: [
      {
        id: 'chunk-dense-11',
        rank: 1,
        score: 0.845,
        latencyMs: 14.1,
        sourceDoc: 'rrf_algorithms_overview.md',
        chunkIndex: 12,
        content: 'Reciprocal Rank Fusion (RRF) works by combining the ranking positions of retrieved documents across multiple retrieval heads (such as full-text BM25 and dense embedding distance). The RRF score for a document d is calculated as: score(d) = sum_{m \in M} 1 / (k + rank_m(d)), where M represents the set of retrieval models, rank_m(d) is the zero or 1-indexed rank of document d in model m, and k is a constant parameter (usually 60) which prevents documents ranked near the top from completely dominating those slightly lower down.',
        matchedTerms: ['Reciprocal Rank Fusion', 'RRF score', 'ranking positions', 'constant parameter', 'k = 60']
      },
      {
        id: 'chunk-dense-12',
        rank: 2,
        score: 0.812,
        latencyMs: 13.9,
        sourceDoc: 'postgres_rrf_queries.sql',
        chunkIndex: 2,
        content: 'To implement RRF directly in Postgres, we utilize full outer joins combined with window functions. By joining the dense vector CTE and the sparse tsquery CTE on document_id, we can assign an RRF score: COALESCE(1.0 / (60.0 + dense_rank), 0.0) + COALESCE(1.0 / (60.0 + sparse_rank), 0.0) AS rrf_score. Sorting the result set by this combined score retrieves the highest quality hybrid matches in O(N log N) time.',
        matchedTerms: ['Postgres', 'full outer joins', 'window functions', 'rrf_score']
      }
    ],
    sparse: [
      {
        id: 'chunk-sparse-11',
        rank: 1,
        score: 0.795,
        latencyMs: 5.9,
        sourceDoc: 'postgres_rrf_queries.sql',
        chunkIndex: 2,
        content: 'To implement RRF directly in Postgres, we utilize full outer joins combined with window functions. By joining the dense vector CTE and the sparse tsquery CTE on document_id, we can assign an RRF score: COALESCE(1.0 / (60.0 + dense_rank), 0.0) + COALESCE(1.0 / (60.0 + sparse_rank), 0.0) AS rrf_score. Sorting the result set by this combined score retrieves the highest quality hybrid matches...',
        matchedTerms: ['RRF', 'Postgres', 'rrf_score', 'joins']
      },
      {
        id: 'chunk-sparse-12',
        rank: 2,
        score: 0.724,
        latencyMs: 6.5,
        sourceDoc: 'rrf_algorithms_overview.md',
        chunkIndex: 12,
        content: 'Reciprocal Rank Fusion (RRF) works by combining the ranking positions of retrieved documents across multiple retrieval heads... The RRF score for a document d is calculated as: score(d) = sum_{m \in M} 1 / (k + rank_m(d)), where M represents the set of retrieval models, rank_m(d) is the zero or 1-indexed rank of document d...',
        matchedTerms: ['Reciprocal Rank Fusion', 'RRF', 'score', 'rank']
      }
    ],
    hybrid: [
      {
        id: 'chunk-hybrid-11',
        rank: 1,
        score: 0.985,
        latencyMs: 24.2,
        sourceDoc: 'postgres_rrf_queries.sql',
        chunkIndex: 2,
        content: 'To implement RRF directly in Postgres, we utilize full outer joins combined with window functions. By joining the dense vector CTE and the sparse tsquery CTE on document_id, we can assign an RRF score: COALESCE(1.0 / (60.0 + dense_rank), 0.0) + COALESCE(1.0 / (60.0 + sparse_rank), 0.0) AS rrf_score. Sorting the result set by this combined score retrieves the highest quality hybrid matches in O(N log N) time.',
        matchedTerms: ['RRF', 'Postgres', 'rrf_score', 'full outer joins', 'window functions']
      },
      {
        id: 'chunk-hybrid-12',
        rank: 2,
        score: 0.952,
        latencyMs: 25.8,
        sourceDoc: 'rrf_algorithms_overview.md',
        chunkIndex: 12,
        content: 'Reciprocal Rank Fusion (RRF) works by combining the ranking positions of retrieved documents across multiple retrieval heads (such as full-text BM25 and dense embedding distance). The RRF score for a document d is calculated as: score(d) = sum_{m \in M} 1 / (k + rank_m(d)), where M represents the set of retrieval models, rank_m(d) is the zero or 1-indexed rank of document d in model m, and k is a constant parameter (usually 60).',
        matchedTerms: ['Reciprocal Rank Fusion', 'RRF score', 'ranking positions', 'constant parameter', 'k = 60']
      }
    ]
  }
];

export const MOCK_TERMINAL_LOGS: string[] = [
  '⚡ [SYSTEM] Launching Benchmarking Runner v1.4.2 ...',
  '⚙️ [CONFIG] Index type: HNSW (m=16, ef_construction=64)',
  '⚙️ [CONFIG] Embedding dimension: 1536 (openai/text-embedding-3-small)',
  '📦 [DATABASE] Verifying pgvector extension version 0.5.1 ... OK',
  '📂 [DATASET] Loading corpus documents from "standard_rag_corpus.jsonl" ...',
  '📖 [DATASET] Successfully parsed 12,500 document paragraphs.',
  '🧼 [PIPELINE] Text cleaning and normalizations: Completed.',
  '✂️ [PIPELINE] Chunking strategy recursive splitter: [Target size 500, Overlap 50]',
  '✂️ [PIPELINE] Generated 24,105 sub-document chunks.',
  '🚀 [EMBEDDING] Commencing batch document embeddings via OpenAI API ...',
  '🚀 [EMBEDDING] Processing batch 1/49 (500 chunks) ... success [Avg Latency 142ms]',
  '🚀 [EMBEDDING] Processing batch 10/49 (500 chunks) ... success [Avg Latency 150ms]',
  '🚀 [EMBEDDING] Processing batch 25/49 (500 chunks) ... success [Avg Latency 138ms]',
  '🚀 [EMBEDDING] Processing batch 40/49 (500 chunks) ... success [Avg Latency 144ms]',
  '🚀 [EMBEDDING] Processing batch 49/49 (105 chunks) ... success [Avg Latency 125ms]',
  '🟢 [EMBEDDING] Embedded all chunks! Accumulated tokens: 11,208,450.',
  '💰 [EMBEDDING] Estimated embedding costs: $0.224 USD.',
  '🐘 [PGVECTOR] Dropping existing vectors table if exists: "rag_vectors" ...',
  '🐘 [PGVECTOR] Creating vectors table "rag_vectors" with columns: [id, document_id, embedding vector(1536), sparse_tokens tsvector, metadata jsonb] ...',
  '🐘 [PGVECTOR] Loading dense vector records into PostgreSQL ...',
  '🐘 [PGVECTOR] 24,105 rows successfully copied to "rag_vectors". [Elapsed 4.1s]',
  '🔨 [INDEXING] Compiling dense HNSW index: "idx_rag_vectors_hnsw" via pgvector ...',
  '🔨 [INDEXING] Parameters: m=16, ef_construction=64, metric=cosine',
  '🔨 [INDEXING] Graph construction in progress (maintaining cache in shared_buffers) ...',
  '🔨 [INDEXING] Graph links created. Index compiled successfully in 184 seconds.',
  '📁 [INDEXING] Index size on disk: 142.4 MB.',
  '🔨 [INDEXING] Compiling sparse keyword tsvector GIN index: "idx_rag_sparse_gin" ...',
  '🔨 [INDEXING] GIN index compiled successfully in 48 seconds. Size: 45.1 MB.',
  '🎯 [EVALUATION] Starting benchmark run "run-104-hnsw" against 500 gold-standard queries ...',
  '🎯 [EVALUATION] Executing dense query evaluation head ... p50=12.2ms, p95=24.2ms',
  '🎯 [EVALUATION] Executing sparse query evaluation head ... p50=6.1ms, p95=15.6ms',
  '🎯 [EVALUATION] Executing hybrid (RRF k=60) evaluation head ... p50=22.4ms, p95=44.8ms',
  '📊 [EVALUATION] Benchmarked 500 queries completed! Computing score aggregates ...',
  '📈 [METRICS] Dense retrieval metrics:  MRR@1: 0.812 | Recall@10: 0.942',
  '📈 [METRICS] Sparse retrieval metrics: MRR@1: 0.724 | Recall@10: 0.864',
  '📈 [METRICS] Hybrid retrieval metrics: MRR@1: 0.886 | Recall@10: 0.976',
  '🏁 [SYSTEM] Benchmarking run finished. Visualizing dashboards.'
];

export const MOCK_VECTOR_POINTS = [
  // Clusters corresponding to topics
  { x: 30, y: 40, label: 'Chunk #108 (Vector Search)', strategy: 'dense', score: 0.89 },
  { x: 34, y: 43, label: 'Chunk #12 (pgvector HNSW)', strategy: 'dense', score: 0.85 },
  { x: 28, y: 38, label: 'Chunk #94 (Similarity Metrics)', strategy: 'dense', score: 0.82 },
  { x: 40, y: 35, label: 'Query (Scaling Limitations)', strategy: 'query', score: 1.0 },
  
  { x: 75, y: 70, label: 'Chunk #412 (Lexical Match)', strategy: 'sparse', score: 0.78 },
  { x: 80, y: 74, label: 'Chunk #321 (Index terms)', strategy: 'sparse', score: 0.72 },
  { x: 72, y: 68, label: 'Chunk #85 (Keyword Tokenizer)', strategy: 'sparse', score: 0.69 },
  { x: 68, y: 80, label: 'Query (Scaling Limitations - sparse matches)', strategy: 'query', score: 1.0 },

  { x: 45, y: 55, label: 'Chunk #24 (RRF Fusion Hybrid)', strategy: 'hybrid', score: 0.94 },
  { x: 48, y: 52, label: 'Chunk #128 (Postgres Query Optimization)', strategy: 'hybrid', score: 0.91 },
  { x: 42, y: 58, label: 'Chunk #5 (Performance Tradeoffs)', strategy: 'hybrid', score: 0.88 },
];
