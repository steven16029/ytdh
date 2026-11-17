# Etapa 1: Construcción con Red Hat UBI 9 Node.js
FROM registry.access.redhat.com/ubi9/nodejs-20:latest AS builder
WORKDIR /opt/app-root/src
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor web ligero sin root con Red Hat UBI 9 Nginx
FROM registry.access.redhat.com/ubi9/nginx-124:latest
COPY --from=builder /opt/app-root/src/build /opt/app-root/src

USER 0
RUN echo 'server { \
    listen 8080; \
    root /opt/app-root/src; \
    index index.html; \
    location / { try_files $uri $uri/ /index.html; } \
}' > /etc/nginx/conf.d/default.conf && \
    chmod -R g+rwX /opt/app-root/src /var/log/nginx /var/run

USER 1001
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
