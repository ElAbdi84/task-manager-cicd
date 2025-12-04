FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

FROM nginx:alpine

# Ajouter la configuration custom, sans toucher nginx.conf
COPY taskmanager.conf /etc/nginx/conf.d/taskmanager.conf

# Copier le build frontend
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
