# ETAP 1: Budowanie (Build)
# Zmiana: "as" na "AS" (duże litery)
FROM node:18-alpine AS build

WORKDIR /app

# Kopiujemy pliki zależności
COPY package.json package-lock.json ./

# Instalujemy zależności
RUN npm ci

# Kopiujemy resztę kodu
COPY . .

# Budujemy aplikację
RUN npm run build

# ETAP 2: Serwowanie (Production)
FROM nginx:alpine

# Kopiujemy zbudowane pliki z etapu 1
COPY --from=build /app/dist /usr/share/nginx/html

# Kopiujemy config Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Wystawiamy port 80
EXPOSE 80

# Startujemy Nginx
CMD ["nginx", "-g", "daemon off;"]