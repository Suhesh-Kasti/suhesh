---
title: "Docker Compose file to run open WebUI and AI Agents"
date: 2026-01-01T10:30:00+05:45
description: "How to run open WebUI and download gguf files to run AI Agents"
image: "/images/til/ai-agent-docker-compose.jpg"
til_categories: ["AI"]
til_tags: ["docker", "docker-compose", "AI", "hugging face", "AI Agents"]
draft: false
---

## Docker Compose file to run open WebUI and AI Agents

Today I learned about Docker Compose file to run open WebUI and AI Agents just by downloading gguf files from platforms like [hugging face](https://huggingface.co).

## What are gguf files?

GGUF files are a special type of file format used to store and run large language models efficiently. They help make these models faster to load and easier to use on regular computers.

## Actual docker compose file

```yaml

services:
  llama-server:
    image: ghcr.io/ggml-org/llama.cpp:server
    container_name: llama-server
    restart: unless-stopped
    volumes:
      - /home/user/models:/models 
    ports:
      - "8080:8080"
    command: 
      - "--models-dir"
      - "/models"
      - "--host"
      - "0.0.0.0"
      - "--port"
      - "8080"
      - "--ctx-size"
      - "2048"
      - "--parallel"
      - "4"

  open-webui:
    image: ghcr.io/open-webui/open-webui:latest
    container_name: open-webui
    restart: unless-stopped
    ports:
      - "3001:8080"
    environment:
      - OPENAI_API_BASE_URL=http://llama-server:8080/v1
      - OPENAI_API_KEY=sk-no-key-required
    volumes:
      - open-webui-data:/app/data
    depends_on:
      - llama-server

volumes:
  open-webui-data:

```

### Basic Explanation

This docker-compose file runs two services:

1. **llama-server**: This service runs a llama.cpp server that provides access to the models stored in the `/models` directory.
2. **open-webui**: This service runs the Open WebUI application, which provides a user interface for interacting with the models.

### How to use

1. Download the gguf files from [hugging face](https://huggingface.co).
2. Place the gguf files in the `/models` directory.
3. Run the docker-compose file.
4. Open the Open WebUI application in your browser.
5. Select the model you want to use.
6. Start chatting!
