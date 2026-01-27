// Docker Redis README
# Redis Configuration

This directory contains Redis configuration files for the Trivexa Backend.

## Usage

Redis is used for:
- Session caching
- Rate limiting
- Idempotency key storage
- Temporary data caching

## Configuration

Set the following environment variables:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0
```
