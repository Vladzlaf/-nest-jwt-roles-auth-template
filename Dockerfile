# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and lock file first to leverage Docker cache
COPY package*.json yarn.lock ./

# Install dependencies (including devDependencies needed for build)
RUN npm install

# Copy the entire project
COPY . .

# Build the project (for TypeScript or frontend assets)
RUN npm run build

# Expose the application port (Fly.io maps this automatically)
EXPOSE 3000

# Run the application in production mode
CMD ["npm", "run", "start"]
