FROM python:3.10-slim

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Expose application port
EXPOSE 8000

# Start using entrypoint
CMD ["./entrypoint.sh"]
