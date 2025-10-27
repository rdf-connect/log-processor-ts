import { describe, expect, test, vi } from "vitest";
import { LogProcessor } from "../src";
import { channel, createRunner } from "@rdfc/js-runner/lib/testUtils/index";
import { FullProc } from "@rdfc/js-runner/lib/runner";
import { createLogger, transports } from "winston";

const logger = createLogger({
    transports: new transports.Console({
        level: process.env["DEBUG"] || "info",
    }),
});

describe("Functional tests for the Log processor", () => {
    test("Log works in raw mode", async () => {
        const runner = createRunner();
        const consoleLog = vi.spyOn(console, "log");
        expect.assertions(5);

        const [inputWriter, inputReader] = channel(runner, "input");
        const [outputWriter, outputReader] = channel(runner, "output");

        const proc = <FullProc<LogProcessor>>new LogProcessor(
            {
                reader: inputReader, // SHACL-compliant field
                writer: outputWriter, // SHACL-compliant field
                label: "test",
                level: "info",
                raw: true,
            },
            logger,
        );

        await proc.init();
        const prom = proc.transform();

        // Read messages in the background
        // (we don't await it yet, as we want to push messages first)
        const readPromise = (async () => {
            const collected: string[] = [];
            for await (const msg of outputReader.strings()) {
                collected.push(msg);
            }
            return collected;
        })();

        // Push messages into input
        await inputWriter.string("Hello, World!");
        await inputWriter.string("This is a second message");
        await inputWriter.string("Goodbye.");
        await new Promise((r) => process.nextTick(r));
        await inputWriter.close();

        // Close reader so iteration finishes
        await outputWriter.close();

        // Collect output
        const collected = await readPromise;

        // Wait for processor to finish
        await prom;

        // Assertions on output data
        expect(collected).toEqual([
            "Hello, World!",
            "This is a second message",
            "Goodbye.",
        ]);

        // Assertions on console.log calls
        const calls = consoleLog.mock.calls;
        expect(calls).toHaveLength(3);
        expect(calls[0][0]).toBe("Hello, World!");
        expect(calls[1][0]).toBe("This is a second message");
        expect(calls[2][0]).toBe("Goodbye.");

        consoleLog.mockRestore();
    });
});
