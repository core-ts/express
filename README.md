# express-web-kit

A lightweight toolkit for building clean, modular, and maintainable **Express.js** applications.

`express-web-kit` provides reusable utilities for REST APIs, including request parsing, response helpers, validation integration, search and pagination, logging middleware, localization, and common HTTP utilities. It is designed to reduce boilerplate while remaining framework-agnostic and easy to integrate into existing Express applications.

---

# Features

- REST API helper functions
- Request validation
- Standardized HTTP responses
- Search and pagination support
- Query parameter parsing
- Request and response logging
- Localization support
- Health check utilities
- Configurable middleware
- Lightweight and dependency-friendly
- Express 5 compatible

---

# Why express-web-kit?

Building REST APIs with Express often involves writing the same code repeatedly:

- Parsing query parameters
- Validating requests
- Returning consistent HTTP responses
- Handling pagination
- Logging requests
- Managing localization

`express-web-kit` provides reusable building blocks for these common tasks, allowing you to focus on business logic instead of infrastructure code.

---

# Installation

```bash
npm install express-web-kit
```

---

# Philosophy

The library follows a simple layered architecture.

```text
 HTTP Request
       │
       ▼
Express Middleware
       │
       ▼
   Controller
       │
       ▼
    Service
       │
       ▼
   Repository
       │
       ▼
    Database
```

It intentionally avoids:

- Dependency injection containers
- Decorators
- Reflection
- Runtime code generation
- Framework lock-in

Instead, it embraces explicit composition and lightweight utilities.

---

# Core Components

## HTTP Utilities

Simplify working with Express requests and responses.

Features include:

- Query parameter parsing
- Path parameter parsing
- Type conversion
- Required parameter validation
- Date parsing
- Number parsing

Example:

```ts
const page = queryNumber(req, "page", 1)
const limit = queryNumber(req, "limit", 20)
```

---

## Response Helpers

Standardize API responses across your application.

Typical operations include:

- Success responses
- Created responses
- Updated responses
- Deleted responses
- Validation errors
- Conflict responses
- Not found responses

Using shared response helpers keeps controllers concise and consistent.

---

## Search & Pagination

The library provides reusable helpers for implementing search APIs.

Supported parameters include:

```text
?page=1
&limit=20
&sort=-createdAt
&fields=id,name,email
&q=john
```

These helpers reduce repetitive pagination logic across controllers.

---

## Validation

`express-web-kit` integrates with validation libraries through a simple abstraction.

This allows applications to plug in any validation implementation without coupling controllers to a specific library.

Typical validation flow:

```text
HTTP Request
      │
      ▼
  Validation
      │
      ▼
  Controller
      │
      ▼
   Service
```

---

## Logging

Built-in middleware can log:

- HTTP method
- URL
- Status code
- Execution time
- Response size
- Request ID
- Correlation ID

Sensitive request and response data can also be masked before logging.

---

## Localization

The library supports localized validation and error messages.

Applications can provide resource files for multiple languages without changing controller logic.

---

## Global Configuration

Application-wide settings can be configured centrally, including:

- Default page size
- Maximum page size
- Validation implementation
- Logging behavior
- Localization resources

---

# Example

A simple controller can remain focused on business logic.

```ts
export async function search(req: Request, res: Response) {
  const result = await service.search(buildSearch(req))
  return respond(res, result)
}
```

Most HTTP infrastructure is handled by reusable helpers.

---

# Project Structure

Typical application layout:

```text
src/
├── app.ts
├── config.ts
├── context.ts
├── route.ts
│
├── user/
│   ├── controller.ts
│   ├── service.ts
│   ├── repository.ts
│   └── model.ts
│
└── resources/
```

---

# Best Practices

- Keep controllers thin.
- Place business logic in services.
- Keep repositories focused on data access.
- Validate requests before invoking business logic.
- Use shared response helpers for consistency.
- Centralize application configuration.

---

# Related Projects

`express-web-kit` is part of the Core TS ecosystem and works well with:

- **mongodb-kit** — Generic MongoDB repositories
- **postgres-kit** — PostgreSQL integration
- **query-mappers** — Object mapping utilities
- **validation-core** — High-performance validation
- **config-plus** — Configuration management
- **logger-core** — Structured logging
- **io-one** — Import and export utilities
- **onecore** — Generic CRUD use cases and common abstractions

These libraries can be used independently or combined to build complete enterprise applications.

---

# Sample Application

See the **mongo-modular-sample** project for a complete example demonstrating how to build a modular microservice using `express-web-kit` together with other Core TS libraries.

---

# Design Goals

- Lightweight
- Modular
- Explicit
- Testable
- Framework-agnostic
- Production-ready
- Minimal boilerplate
- Enterprise-friendly

---

# License

MIT
