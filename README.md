# log-processor-ts

[![Build and tests with Node.js](https://github.com/rdf-connect/log-processor-ts/actions/workflows/build-test.yml/badge.svg)](https://github.com/rdf-connect/log-processor-ts/actions/workflows/build-test.yml)

This repository contains a simple processor to log an incoming stream to the RDF-Connect logging system.

The processor accepts input from a stream, logs it to the console, and pipes it back into the outgoing stream.
Winston is used to log the incoming data, unless the `raw` option is set to `true`, in which case the data is logged
using `console.log`.

## Configuration

Parameters of `rdfc:SendProcessorJs`:
- `rdfc:writer`: The channel to which the processor will write messages.
- `rdfc:msg`: The messages to be sent by the processor.

Parameters of `rdfc:LogProcessorJs`:
- `rdfc:reader`: The channel from which the processor will read messages.
- `rdfc:writer`: The channel to which the processor will write log messages (optional).
- `rdfc:level`: The log level to use (e.g., "debug", "info", "warning", "error", "critical"). Defaults to "info".
- `rdfc:label`: A label for the log messages, which can be used to filter or categorize logs. Defaults to "log".
- `rdfc:raw`: If set to `true`, the processor will log raw messages to stdout without any formatting instead of to the RDF-Connect logging system. Defaults to `false`.

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
