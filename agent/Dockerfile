# FROM nvidia/cuda:12.2.0-runtime-ubuntu22.04

# ENV NODE_VERSION=20.11.1

# RUN apt-get update && apt-get install -y --no-install-recommends \
#     ca-certificates curl xz-utils \
#  && rm -rf /var/lib/apt/lists/*

# # Install Node.js
# RUN curl -fsSL https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz \
#  | tar -xJ -C /usr/local --strip-components=1

# WORKDIR /agent

# # Install dependencies
# COPY package.json ./
# RUN npm install --production

# # Copy agent code
# COPY agent.js .

# CMD ["node", "agent.js"]


# FROM nvidia/cuda:12.2.0-runtime-ubuntu22.04

# ENV NODE_VERSION=20.11.1

# RUN apt-get update && apt-get install -y --no-install-recommends \
#     ca-certificates \
#     curl \
#     xz-utils \
#     docker.io \
#  && rm -rf /var/lib/apt/lists/*

# # Install Node.js
# RUN curl -fsSL https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz \
#  | tar -xJ -C /usr/local --strip-components=1

# WORKDIR /agent

# # Install dependencies
# COPY package.json ./
# RUN npm install --production

# # Copy agent code
# COPY agent.js .

# CMD ["node", "agent.js"]


FROM node:20-slim

# 1. Install basic utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
 && rm -rf /var/lib/apt/lists/*

# 2. Install latest Docker CLI (Fix for API 1.44 issue)
# We copy the binary directly from the official Docker image
COPY --from=docker:cli /usr/local/bin/docker /usr/local/bin/docker

WORKDIR /agent

COPY package.json ./
RUN npm install --production

COPY agent.js .

CMD ["node", "agent.js"]