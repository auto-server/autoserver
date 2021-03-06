# Cursor pagination

[`find` commands](../request/crud.md#find-command) are paginated by default.

The default pagination system is cursor-based.

For example, a paginated response will look like this.

```json
{
  "data": [
    { "id": "1", "name": "Anthony" },
    ...{ "id": "100", "name": "Mary" }
  ],
  "metadata": {
    "pages": {
      "pagesize": 100,
      "has_next_page": true,
      "next_token": "eyJwIjpbIjEiXX0",
      "first_token": ""
    }
  }
}
```

To fetch the next batch, use the `after` [argument](../rpc/README.md#rpc) with
the `next_token` as value.

```HTTP
GET /rest/users/?after=eyJwIjpbIjEiXX0
```

One can check `has_next_page` in the response to know when to stop iterating.

The `filter` and `order` [arguments](../rpc/README.md#rpc) must remain the same
across all batches.

# Backward iteration

To iterate through batches backward, use the `before`
[argument](../rpc/README.md#rpc) instead of `after`. Start the iteration with
the `last_token` which is always an empty string.

```HTTP
GET /rest/users/?before=
```

```json
{
  "data": [
    { "id": "1000", "name": "Anthony" },
    ...{ "id": "901", "name": "Mary" }
  ],
  "metadata": {
    "pages": {
      "pagesize": 100,
      "has_prev_page": true,
      "prev_token": "eyJwIjpbIjMiXX0",
      "last_token": ""
    }
  }
}
```

`prev_token` and `has_prev_page` should then be used instead of `next_token` and
`has_next_page`.

# Page size

The page size is determined by the server using the `limits.pagesize`
[configuration property](../../server/configuration/configuration.md#properties),
which defaults to `100`. Setting it to `0` will disable pagination.

Clients can decrease the page size by using the `pagesize`
[argument](../rpc/README.md#rpc).

```HTTP
GET /rest/users/?pagesize=20
```

The actually used page size is returned in `metadata.pages.pagesize` and can be
smaller than the requested page size.

# Offset pagination

One can use an offset-based pagination, by using the `page`
[argument](../rpc/README.md#rpc) (starting at 1).

```HTTP
GET /rest/users/?pagesize=20&page=5
```

```json
{
  "data": [{ "id": "1", "name": "Anthony" }, ...{ "id": "20", "name": "Mary" }],
  "metadata": {
    "pages": {
      "pagesize": 20,
      "page": 5,
      "has_prev_page": true,
      "has_next_page": true
    }
  }
}
```

`metadata.pages` will not be defined if the page is out of range.

Offset pagination is easier as it does not involve cursors. Also, it allows
client to query a page in a non-serial fashion (random access).

However, cursor pagination provides stronger consistency guarantees. If the
collection is being modified while the pagination iteration is ongoing, cursor
pagination offers a much lower chance of either retrieving duplicate models or
skipping some models.

# Other commands

[`patch` commands](../request/crud.md#patch-command) are also paginated. However
offset pagination and backward iterations are not available.

[`delete`](../request/crud.md#delete-command),
[`create`](../request/crud.md#create-command) and
[`upsert`](../request/crud.md#upsert-command) commands are not paginated.

# Maximum number of models

The maximum number of models in any request or response is determined by the
server using the `limits.maxmodels`
[configuration property](../../server/configuration/configuration.md#properties),
which defaults to `100` times the default [`pagesize`](#page-size), i.e.
`10000`. It can be disabled by being set to `0`.

This is used to limit the size of nested commands, since pagination is only
applied at the top level.

It is enforced differently depending on the command.

## `find`

In [`find` commands](../request/crud.md#find-command), if the response contains
too many models, the nested attributes will be truncated to fit within the
limit.

```json
{
  "data": [
    { "id": "1", "friends": [...] },
    ...
    { "id": "100", "friends": [...] },
  ],
  "metadata": {
    "pages": {
      "pagesize": 100,
      "nested_pagesize": 10,
      "has_next_page": true,
      "next_token": "eyJwIjpbIjEiXX0",
      "first_token": ""
    }
  }
}
```

In the example above, the `friends` attributes contain only the first `10`
nested models, as indicated by `metadata.pages.nested_pagesize`. If no attribute
was truncated, `nested_pagesize` would not be defined.

The `nested_pagesize` is calculated by the server depending on `maxmodels`.

Also, it is only possible to query collections at the top level or the second
level of depth. This means only collections at the second level of depth will be
truncated.

## `patch`, `create`, `upsert`

In [`patch`](../request/crud.md#patch-command),
[`create`](../request/crud.md#create-command) and
[`upsert`](../request/crud.md#upsert-command) commands, an error response is
sent when the request or response contains too many models.

## `delete`

In [`delete` commands](../request/crud.md#delete-command), no maximum number of
models is enforced, unless the [`dryrun`](dryrun.md)
[argument](../rpc/README.md#rpc) is used.
