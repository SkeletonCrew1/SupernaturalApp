# syntax=docker/dockerfile:1

# Build stage: the -dev image includes tools needed to install packages.
FROM python:3.14-slim AS builder

# Prevent Python from writing .pyc files to disk.
ENV PYTHONDONTWRITEBYTECODE=1
# Prevent Python from buffering stdout/stderr so logs appear immediately.
ENV PYTHONUNBUFFERED=1

# hadolint ignore=DL3008
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Downloading uv and ignoring logs and warnings
RUN pip install --no-cache-dir --quiet --root-user-action=ignore uv==0.5.21
# Use copy mode since the cache and build filesystem are on different volumes.
ENV UV_LINK_MODE=copy

WORKDIR /app

# Install dependencies into a virtual environment using cache and bind mounts
# so neither uv nor the lock files need to be copied into the image.
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project

# Runtime stage: minimal DHI image with no shell or package manager,
# already runs as the nonroot user.
FROM python:3.14-slim

# Prevent Python from buffering stdout/stderr so logs appear immediately.
ENV PYTHONUNBUFFERED=1
# Activate the virtual environment copied from the build stage.
ENV PATH="/app/.venv/bin:$PATH"

# hadolint ignore=DL3008
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the pre-built virtual environment and application source code.
COPY --from=builder /app/.venv /app/.venv
COPY . .

EXPOSE 4040

# Run Gunicorn as the production WSGI server.
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:4040"]
