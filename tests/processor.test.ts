import { describe, expect, test } from "vitest";
import {
    FullProc,
    Processor,
    ReaderInstance,
    Runner,
    WriterInstance,
} from "@rdfc/js-runner";
import { logger, TestClient } from "@rdfc/js-runner/lib/testUtils";
import { NamedNode, Parser, Writer } from "n3";
import { extractShapes } from "rdf-lens";
import { OrchestratorMessage } from "@rdfc/js-runner/lib/reexports";
import { Quad, Term } from "@rdfjs/types";
import { readFile } from "fs/promises";
import { createTermNamespace } from "@treecg/types";

import { LogProcessor } from "../src";

const shapeQuads = `
@prefix rdfc: <https://w3id.org/rdf-connect#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix sh: <http://www.w3.org/ns/shacl#>.
[ ] a sh:NodeShape;
  sh:targetClass <JsProcessorShape>;
  sh:property [
    sh:path rdfc:entrypoint;
    sh:name "location";
    sh:minCount 1;
    sh:maxCount 1;
    sh:datatype xsd:string;
  ], [
    sh:path rdfc:file;
    sh:name "file";
    sh:minCount 1;
    sh:maxCount 1;
    sh:datatype xsd:string;
  ], [
    sh:path rdfc:class;
    sh:name "clazz";
    sh:maxCount 1;
    sh:datatype xsd:string;
  ].
`;
const OWL = createTermNamespace("http://www.w3.org/2002/07/owl#", "imports");
const processorShapes = extractShapes(new Parser().parse(shapeQuads));
const base = "https://w3id.org/rdf-connect#";

export async function importFile(file: string): Promise<Quad[]> {
    const done = new Set<string>();
    const todo = [new URL("file://" + file)];
    const quads: Quad[] = [];

    let item = todo.pop();
    while (item !== undefined) {
        if (done.has(item.toString())) {
            item = todo.pop();
            continue;
        }
        done.add(item.toString());
        if (item.protocol !== "file:") {
            throw "No supported protocol " + item.protocol;
        }

        const txt = await readFile(item.pathname, { encoding: "utf8" });
        const extras = new Parser({ baseIRI: item.toString() }).parse(txt);

        for (const o of extras
            .filter(
                (x) =>
                    x.subject.value === item?.toString() &&
                    x.predicate.equals(OWL.imports),
            )
            .map((x) => x.object.value)) {
            todo.push(new URL(o));
        }
        quads.push(...extras);

        item = todo.pop();
    }

    return quads;
}

export async function getProc<T extends Processor<unknown>>(
    config: string,
    ty: string,
    configLocation: string,
    uri = "http://example.com/ns#processor",
): Promise<FullProc<T>> {
    const configQuads = await importFile(configLocation);
    const procConfig = processorShapes.lenses["JsProcessorShape"].execute({
        id: new NamedNode(base + ty),
        quads: configQuads,
    });

    const msgs: OrchestratorMessage[] = [];
    const write = async (x: OrchestratorMessage) => {
        msgs.push(x);
    };
    const runner = new Runner(
        new TestClient(),
        write,
        "http://example.com/ns#",
        logger,
    );
    configQuads.push(...new Parser().parse(config));
    await runner.handleOrchMessage({
        pipeline: new Writer().quadsToString(configQuads),
    });

    const proc = await runner.addProcessor<T>({
        config: JSON.stringify(procConfig),
        arguments: "",
        uri,
    });

    return proc;
}

async function checkProcDefinition(file: string, n: string) {
    const quads = await importFile(file);
    console.log(quads);
    const procConfig = <{ file: Term; location: string; clazz: string }>(
        processorShapes.lenses["JsProcessorShape"].execute({
            id: new NamedNode(base + n),
            quads: quads,
        })
    );
    expect(procConfig.file, n + " has file").toBeDefined();
    expect(procConfig.location, n + " has location").toBeDefined();
    expect(procConfig.clazz, n + " has clazz").toBeDefined();
}

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
            "LogProcessor",
            configLocation,
        );
        await processor.init();

        expect(processor.reader).toBeInstanceOf(ReaderInstance);
        expect(processor.writer).toBeInstanceOf(WriterInstance);
        expect(processor.label).toBe("test");
        expect(processor.level).toBe("warn");
        expect(processor.raw).toBe(true);
    });
});
