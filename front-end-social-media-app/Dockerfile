# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the app
RUN npm run build

# Expose port 5173 to the outside world
EXPOSE 5173

# Run the app in preview mode, which serves the build output
CMD ["vite", "preview", "--port", "5173", "--host"]
