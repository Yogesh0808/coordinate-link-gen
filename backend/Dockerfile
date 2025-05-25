FROM python:3.10-slim

# Install system dependencies (Tesseract, OpenCV support libs)
RUN apt-get update && \
    apt-get install -y tesseract-ocr libgl1 libglib2.0-0 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Expose port
EXPOSE 8000

# Start FastAPI with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
