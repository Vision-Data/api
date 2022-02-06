# Vision API

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://api.vision-data.io/docs)

This API is built using AdonisJS.

### ✨ [Application](https://app.vision-data.io)

## Installation

```sh
# Install dependencies
npm ci

# Create environment files for development and testing
cp .env.example .env && cp .env.testing.example .env.testing

# Generate app key and paste it to .env file
node ace generate:key

# Databases - PostgreSQL
# If you have docker on your machine, you can use it to run the database for development and testing environment.
# By default it will be create two databases, one for development and one for testing named `vision` and `vision_test`.
docker-compose up -d

# If you don't have docker, you can use the following commands to create the database for development and testing environment.
# You probably need to change informations about the database in the .env file.
psql -U postgres
\c template1
CREATE extension "pgcrypto";
CREATE DATABASE vision;
CREATE DATABASE vision_test;

# Run database migrations
node ace migration:run
```

The OpenAPI documentation is available [HERE](https://api.vision-data.io/docs).
You can also view it with an OpenAPI readers like [Redoc](https://api.vision-data.io/swagger.json).

### Seeds

It's possible to populate database with some seeders. It will generate random `users`, `workspaces` and more.

```sh
# Run database seeders
node ace db:seed
```

## Usage

```sh
# Run server in watch mode
node ace serve --watch
```

By default, the server started at port `3333`.

## Tests

```sh
# Run tests
npm run test

# Run tests + show code coverage
npm run coverage
```
