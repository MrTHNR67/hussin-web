# Siyaj Weather Service (microservice)
#
# The service reuses the shared module at ../../server/weather-data.mjs, so the
# build context must be the repository root:
#
#   docker build -f services/weather/Dockerfile -t siyaj-weather .
#
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server/weather-data.mjs ./server/weather-data.mjs
COPY services/weather ./services/weather
ENV NODE_ENV=production
ENV PORT=4001
EXPOSE 4001
CMD ["node", "services/weather/server.mjs"]
