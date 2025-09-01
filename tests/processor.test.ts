import { describe, expect, test } from "vitest";
import { Processor } from "@rdfc/js-runner";
import { checkProcDefinition, getProc } from "@rdfc/js-runner/lib/testUtils";
import { Writer } from "n3";

import { LogProcessor } from "../src";

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

        const configLocation = process.cwd() + "/processor.ttl";
        await checkProcDefinition(configLocation, "LogProcessorJs");

        const processor = await getProc<LogProcessor>(
            processorConfig,
            "LogProcessorJs",
            configLocation,
        );
        await processor.init();

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

        const configLocation = process.cwd() + "/processor.ttl";
        await checkProcDefinition(configLocation, "SendProcessorJs");

        const processor = await getProc<
            Processor<{ msgs: string[]; writer: Writer }>
        >(processorConfig, "SendProcessorJs", configLocation);
        await processor.init();

        expect(processor.writer.constructor.name).toBe("WriterInstance");
        expect(processor.msgs).toEqual(["Hello", "World"]);
    });
});
