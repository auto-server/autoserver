# HTTP server options

HTTP is one of the available [protocols](README.md).

The HTTP server has the following [options](README.md#options):

- `hostname` `{string}` (defaults to `localhost`)
- `port` `{integer}` (defaults to `80`). Can be `0` for "any available port".

```yml
protocols:
  http:
    hostname: localhost
    port: 80
```
