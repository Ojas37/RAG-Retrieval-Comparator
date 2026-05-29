import logging
import asyncio
from typing import Optional

# Safe thread-safe async logging queue
# FastAPI WebSocket reader loops will pop lines from this queue.
log_queue = asyncio.Queue()

class QueueLoggingHandler(logging.Handler):
    """
    Custom logging handler that puts logs into an asyncio.Queue.
    Uses call_soon_threadsafe to support thread-safe operations
    if logs are written from background threads.
    """
    def __init__(self, loop: asyncio.AbstractEventLoop):
        super().__init__()
        self.loop = loop
        
    def emit(self, record):
        try:
            msg = self.format(record)
            # Safely put the formatted log message in the queue
            self.loop.call_soon_threadsafe(log_queue.put_nowait, msg)
        except Exception:
            self.handleError(record)

def setup_websocket_logging(loop: asyncio.AbstractEventLoop, level: int = logging.INFO):
    """
    Attaches the QueueLoggingHandler to the root logger to intercept
    all logs produced by the application and pipe them to the WebSocket queue.
    """
    root_logger = logging.getLogger()
    
    # Custom format matching the terminal style
    formatter = logging.Formatter('%(message)s')
    
    handler = QueueLoggingHandler(loop)
    handler.setFormatter(formatter)
    handler.setLevel(level)
    
    root_logger.addHandler(handler)
    
    # Log a system line indicating logger is operational
    logger = logging.getLogger("system_logger")
    logger.setLevel(logging.INFO)
    logger.info("⚡ [SYSTEM] Launching Benchmarking Runner Logs Stream ... active")
