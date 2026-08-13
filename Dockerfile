# Imagen para desarrollo: corre el dev server de Vite con hot reload (pensada
# para el docker-compose orquestador que levanta los 3 repos juntos, no para
# producción — para producción se build-earía `npm run build` y se serviría
# `dist/` con un servidor estático o Nginx).
FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
