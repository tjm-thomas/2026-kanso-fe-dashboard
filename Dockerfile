# Build the React app with Node, serve the static files with nginx under /dashboard/.
FROM node:26-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.30-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist /usr/share/nginx/html/dashboard
# Build-time version, served at /dashboard/version.txt and shown in the footer
ARG VERSION=dev
RUN echo "$VERSION" > /usr/share/nginx/html/dashboard/version.txt
EXPOSE 80
