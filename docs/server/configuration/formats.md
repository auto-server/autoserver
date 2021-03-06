# Formats

The same formats are supported for the
[configuration file](configuration.md#configuration-file) as for the
[client request payloads and the server responses](../../client/protocols/formats.md),
except:

- the following ones are also available: [JavaScript](#javascript).
- the [raw](../../client/protocols/formats.md#raw) format is the default one.
  This means configuration files with unrecognized file extensions will be
  loaded as strings.

Most of the examples in this documentation use
[YAML](../../client/protocols/formats.md#yaml) for the
[configuration properties](configuration.md#properties).

# JavaScript

```js
// Comment

export default {
  limits: {
    pagesize: 10,
  },
  protocols: {
    http: {
      hostname: 'myhostname',
    },
  },
}
```
