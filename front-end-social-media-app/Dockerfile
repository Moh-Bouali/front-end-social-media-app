# Stage 1: Build the app
FROM node:18 AS build

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the app files and build the app
COPY . .
RUN npm run build

# Stage 2: Serve the app with a lightweight web server
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 5173

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]