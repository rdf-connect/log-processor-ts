import { describe, expect, test } from "vitest";
import { ProcHelper } from "@rdfc/js-runner/lib/testUtils";
import * as path from "path";

import { LogProcessor, SendProcessor } from "../src";

describe("Log processor tests", async () => {
    test("rdfc:LogProcessorJs is properly defined", async () => {
        const processorConfig = `
        @prefix rdfc: <https://w3id.org/rdf-connect#>.

        <http://example.com/ns#processor> a rdfc:LogProcessorJs;
          rdfc:reader <jr>;
          rdfc:writer <jw>;
          rdfc:label "test";
          rdfc:level "warn";
          rdfc:raw true.
        `;

        const helper = new ProcHelper<LogProcessor>();

        await helper.importFile(path.resolve("./processor.ttl"));
        await helper.importInline(
            path.resolve("pipeline.ttl"),
            processorConfig,
        );
        const config = helper.getConfig("LogProcessorJs");

        expect(config.location).toBeDefined();
        expect(config.file).toBeDefined();
        expect(config.clazz).toEqual("LogProcessor");

        const processor = await helper.getProcessor(
            "http://example.com/ns#processor",
        );

        expect(processor.reader.constructor.name).toBe("ReaderInstance");
        expect(processor.writer?.constructor.name).toBe("WriterInstance");
        expect(processor.label).toBe("test");
        expect(processor.level).toBe("warn");
        expect(processor.raw).toBe(true);
    });
});

describe("Send processor tests", async () => {
    test("rdfc:SendProcessorJs is properly defined", async () => {
        const processorConfig = `
        @prefix rdfc: <https://w3id.org/rdf-connect#>.

        <http://example.com/ns#processor> a rdfc:SendProcessorJs;
          rdfc:msg "Hello", "World";
          rdfc:writer <jw>.
        `;

        const helper = new ProcHelper<SendProcessor>();

        await helper.importFile(path.resolve("./processor.ttl"));
        await helper.importInline(
            path.resolve("pipeline.ttl"),
            processorConfig,
        );

        const config = helper.getConfig("SendProcessorJs");

        expect(config.location).toBeDefined();
        expect(config.file).toBeDefined();
        expect(config.clazz).toEqual("SendProcessor");

        const processor = await helper.getProcessor(
            "http://example.com/ns#processor",
        );

        expect(processor.writer.constructor.name).toBe("WriterInstance");
        expect(processor.msgs).toEqual(["Hello", "World"]);
    });
});
