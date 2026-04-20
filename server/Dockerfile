FROM node:20-alpine

RUN apk add --no-cache python3 py3-pip gcc musl-dev && \
    pip3 install --break-system-packages \
      pandas numpy sentence-transformers scikit-learn \
      rapidfuzz langdetect networkx

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 5000
CMD ["node", "index.js"]
