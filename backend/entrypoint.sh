#!/bin/sh
set -e

echo "Starting TransitOps Backend..."

if [ "$RUN_SEED" = "true" ]; then
    echo "Running database seed..."
    python -m app.seed
else
    echo "Skipping database seed..."
fi

echo "Starting FastAPI..."

exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
