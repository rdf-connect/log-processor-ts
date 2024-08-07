import { expect, test, describe } from "vitest";
import { extractProcessors, extractSteps, Source } from "@rdfc/js-runner";

const pipeline = `
        @prefix js: <https://w3id.org/conn/js#>.
        @prefix : <https://w3id.org/conn#>.
        @prefix owl: <http://www.w3.org/2002/07/owl#>.

        <> owl:imports <./node_modules/@rdfc/js-runner/ontology.ttl>, <./processor.ttl>.

        [ ] a :Channel;
            :reader <incoming>.
        [ ] a :Channel;
            :writer <outgoing>.
        <incoming> a js:JsReaderChannel.
        <outgoing> a js:JsWriterChannel.

        [ ] a js:Log;
            js:incoming <incoming>;
            js:outgoing <outgoing>;
            js:label "test";
            js:level "warn";
            js:raw true.
    `;

describe("processor", () => {
    test("definition", async () => {
        expect.assertions(8);

        const source: Source = {
            value: pipeline,
            baseIRI: process.cwd() + "/config.ttl",
            type: "memory",
        };

        // Parse pipeline into processors.
        const {
            processors,
            quads,
            shapes: config,
        } = await extractProcessors(source);

        // Extract the Log processor.
        const env = processors.find((x) => x.ty.value.endsWith("Log"))!;
        expect(env).toBeDefined();

        const args = extractSteps(env, quads, config);
        expect(args.length).toBe(1);
        expect(args[0].length).toBe(5);

        const [[incoming, outgoing, label, level, raw]] = args;
        expect(incoming.ty.id).toBe("https://w3id.org/conn/js#JsReaderChannel");
        expect(outgoing.ty.id).toBe("https://w3id.org/conn/js#JsWriterChannel");
        expect(label).toBe("test");
        expect(level).toBe("warn");
        expect(raw).toBe(true);
    });
});
