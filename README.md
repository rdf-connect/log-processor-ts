# log-processor-ts

[![Build and tests with Node.js](https://github.com/rdf-connect/log-processor-ts/actions/workflows/build-test.yml/badge.svg)](https://github.com/rdf-connect/log-processor-ts/actions/workflows/build-test.yml)

This repository contains a simple processor to log an incoming stream to the console for the RDF Connect framework.

The processor accepts input from a stream, logs it to the console, and pipes it back into the outgoing stream.
Winston is used to log the incoming data, unless the `raw` option is set to `true`, in which case the data is logged
using `console.log`.

## Configuration

The processor can be configured using the following parameters:

* `incoming`: The incoming stream to log.
* `outgoing`: The outgoing stream to pipe the incoming data to. If not set, the incoming data will not be piped to any
  stream.
* `label`: The label to use for the log messages. The default value is `log`.
* `level`: The log level to use when logging the incoming data. This can be one of the following
  values: `error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`. The default value is `info`.
* `raw`: If set to `true`, the incoming data will be logged using `console.log` instead of Winston. The default value
  is `false`.

## Installation

```
npm install
npm run build
```

Or install from NPM:

```
npm install @rdfc/log-processor-ts
```

## Example

An example configuration of the processor can be found in the `example` directory.

You can run this example by executing the following command:

```bash
npx js-runner example/pipeline.ttl
```

To enable all debug logs, add `DEBUG=*` before the command:

```bash
DEBUG=* npx js-runner example/pipeline.ttl
```
