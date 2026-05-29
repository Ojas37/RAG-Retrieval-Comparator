import numpy as np

def reciprocal_rank(retrieved: list[str], relevant: list[str], k: int) -> float:
    """
    Calculates Reciprocal Rank at K.
    1.0 / (rank of first relevant document), or 0.0 if none found in top-K.
    """
    relevant_set = set(relevant)
    for rank, doc_id in enumerate(retrieved[:k], 1):
        if doc_id in relevant_set:
            return 1.0 / rank
    return 0.0

def recall_at_k(retrieved: list[str], relevant: list[str], k: int) -> float:
    """
    Calculates Recall at K.
    (number of relevant retrieved items in top-K) / (total number of relevant items).
    """
    if not relevant:
        return 0.0
    retrieved_set = set(retrieved[:k])
    relevant_set = set(relevant)
    hits = len(retrieved_set.intersection(relevant_set))
    return hits / len(relevant)

def compute_all_metrics(all_results: list[dict], k_limit: int = 10) -> dict:
    """
    Given a list of result dictionaries containing 'retrieved', 'relevant', 'latency_ms',
    computes average MRR@1/5/10, Recall@1/5/10, and detailed latency metrics.
    """
    if not all_results:
        return {
            "mrr1": 0.0, "mrr5": 0.0, "mrr10": 0.0,
            "recall5": 0.0, "recall10": 0.0,
            "avgLatencyMs": 0.0, "p95LatencyMs": 0.0,
            "throughputQps": 0.0
        }
    
    rr_1 = [reciprocal_rank(r["retrieved"], r["relevant"], 1) for r in all_results]
    rr_5 = [reciprocal_rank(r["retrieved"], r["relevant"], 5) for r in all_results]
    rr_10 = [reciprocal_rank(r["retrieved"], r["relevant"], 10) for r in all_results]
    
    rec_5 = [recall_at_k(r["retrieved"], r["relevant"], 5) for r in all_results]
    rec_10 = [recall_at_k(r["retrieved"], r["relevant"], 10) for r in all_results]
    
    latencies = [r["latency_ms"] for r in all_results]
    avg_latency = float(np.mean(latencies))
    p95_latency = float(np.percentile(latencies, 95))
    
    # QPS = 1000 / avg_latency if avg_latency > 0 else 0.0
    throughput = 1000.0 / avg_latency if avg_latency > 0 else 0.0

    return {
        "mrr1": round(float(np.mean(rr_1)), 4),
        "mrr5": round(float(np.mean(rr_5)), 4),
        "mrr10": round(float(np.mean(rr_10)), 4),
        "recall5": round(float(np.mean(rec_5)), 4),
        "recall10": round(float(np.mean(rec_10)), 4),
        "avgLatencyMs": round(avg_latency, 1),
        "p95LatencyMs": round(p95_latency, 1),
        "throughputQps": round(throughput, 1)
    }
