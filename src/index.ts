import { extendLogger, Processor, Reader, Writer } from "@rdfc/js-runner";
import { Logger } from "winston";

type LogArgs = {
    reader: Reader;
    writer?: Writer;
    label?: string;
    level?: string;
    raw?: boolean;
    readAsStream?: boolean;
};

/**
 * The Log processor is a simple processor that logs incoming data to the console
 * and optionally pipes it to an outgoing stream. It uses Winston for logging,
 * unless the `raw` flag is set, in which case it logs the raw data.
 */
export class LogProcessor extends Processor<LogArgs> {
    private msgLogger: Logger;

    constructor(args: LogArgs, logger: Logger) {
        super(args, logger);
    }

    async init(this: LogArgs & this): Promise<void> {
        this.msgLogger = extendLogger(this.logger, this.label || "log");
    }

    async transform(this: LogArgs & this): Promise<void> {
        if (this.readAsStream) {
            for await (const stream of this.reader.streams()) {
                for await (const chunk of stream) {
                    if (this.raw) {
                        process.stdout.write(chunk);
                    } else {
                        this.msgLogger.log(
                            this.level || "info",
                            chunk.toString(),
                        );
                    }
                }
            }
        } else {
            for await (const msg of this.reader.strings()) {
                // Log the data to the console.
                if (this.raw) {
                    console.log(msg);
                } else {
                    this.msgLogger.log(this.level || "info", msg);
                }

                // Push data into outgoing stream.
                if (this.writer) {
                    await this.writer.string(msg);
                }
            }
        }

        // Close the writer if it exists.
        if (this.writer) {
            await this.writer.close();
        }
    }

    async produce(this: LogArgs & this): Promise<void> {
        // nothing
    }
}

type SendArgs = {
    msgs: string[];
    writer: Writer;
};

export class SendProcessor extends Processor<SendArgs> {
    async init(this: SendArgs & this): Promise<void> {}

    async transform(this: SendArgs & this): Promise<void> {}

    async produce(this: SendArgs & this): Promise<void> {
        for (const msg of this.msgs) {
            await this.writer.string(msg);

            this.logger.info("Sending " + msg);
            await new Promise((res) => setTimeout(res, 1000));
        }
        await this.writer.close();
        this.logger.debug("Closed");
    }
}
