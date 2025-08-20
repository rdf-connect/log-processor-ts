import { describe, expect, test, vi } from "vitest";
import { LogProcessor } from "../src";
import { createWriter, logger } from "@rdfc/js-runner/lib/testUtils";
import { FullProc } from "@rdfc/js-runner";

describe("Functional tests for the Log processor", () => {
    test("Log works in raw mode", async () => {
        const consoleLog = vi.spyOn(console, "log");
        expect.assertions(7);

        const [inputWriter, inputReader] = createWriter();
        const [outputWriter, outputReader] = createWriter();

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

        // Push messages into input
        await inputWriter.string("Hello, World!");
        await inputWriter.string("This is a second message");
        await inputWriter.string("Goodbye.");
        await inputWriter.close();

        // Close reader so iteration finishes
        outputReader.close();

        // Collect output
        const collected: string[] = [];
        for await (const msg of outputReader.strings()) {
            collected.push(msg);
        }

        // Wait for processor to finish
        await prom;

        console.log("collected", collected);

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
