# log-processor-ts

[![Build and tests with Node.js](https://github.com/rdf-connect/log-processor-ts/actions/workflows/build-test.yml/badge.svg)](https://github.com/rdf-connect/log-processor-ts/actions/workflows/build-test.yml)

This repository contains a simple processor to log an incoming stream to the RDF-Connect logging system.

The processor accepts input from a stream, logs it to the console, and pipes it back into the outgoing stream.
Winston is used to log the incoming data, unless the `raw` option is set to `true`, in which case the data is logged
using `console.log`.

## Usage

To use the `rdfc:LogProcessorJs` or `rdfc:SendProcessorJs` in your RDF-Connect pipeline, you need to have a pipeline configuration that includes the [rdfc:NodeRunner](https://github.com/rdf-connect/js-runner) (check out their documentation to find out how to install and configure it).


### Installation

```
npm install
npm run build
```

Or install from NPM:

```
npm install @rdfc/log-processor-ts
```

Next, you can add the processors to your pipeline configuration as follows:

```turtle
@prefix rdfc: <https://w3id.org/rdf-connect#>.
@prefix owl: <http://www.w3.org/2002/07/owl#>.

### Import the processor
<> owl:imports <./node_modules/@rdfc/log-processor-ts/processor.ttl>.

### Define the channels your processor needs
<channel> a rdfc:Writer, rdfc:Reader.

### Attach the processor to the pipeline under the NodeRunner
# Add the `rdfc:processor <send>, <log>` statement under the `rdfc:consistsOf` statement of the `rdfc:NodeRunner`

### Define and configure the processors
<send> a rdfc:SendProcessorJs;
       rdfc:writer <channel>;
       rdfc:msg "Hello, World!", "Good afternoon, World!",
                "Good evening, World!", "Good night, World!".

<log> a rdfc:LogProcessorJs;
      rdfc:reader <channel>;
      rdfc:level "info";
      rdfc:label "test".
```


### Configuration

Parameters of `rdfc:SendProcessorJs`:
- `rdfc:writer`: The channel to which the processor will write messages.
- `rdfc:msg`: The messages to be sent by the processor.

Parameters of `rdfc:LogProcessorJs`:
- `rdfc:reader`: The channel from which the processor will read messages.
- `rdfc:writer`: The channel to which the processor will write log messages (optional).
- `rdfc:level`: The log level to use (e.g., "debug", "info", "warning", "error", "critical"). Defaults to "info".
- `rdfc:label`: A label for the log messages, which can be used to filter or categorize logs. Defaults to "log".
- `rdfc:raw`: If set to `true`, the processor will log raw messages to stdout without any formatting instead of to the RDF-Connect logging system. Defaults to `false`.

