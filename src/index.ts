import { Stream, Writer } from "@rdfc/js-runner";
import { getLoggerFor } from "./utils/logUtil";

/**
 * The logging function is a very simple processor which simply logs the
 * incoming stream to the console and pipes it directly into the outgoing
 * stream. Uses Winston to format the log messages, unless the raw flag is set.
 *
 * @param incoming The data stream which must be logged.
 * @param outgoing The data stream into which the incoming stream is written.
 * @param label The label to use for the log messages. Default is "log".
 * @param level The log level to use for the log messages. Default is "info".
 * @param raw Whether to log the raw data or not. Default is false.
 */
export function log(
    incoming: Stream<string>,
    outgoing?: Writer<string>,
    label: string = "log",
    level: string = "info",
    raw: boolean = false,
): () => Promise<void> {
    /**************************************************************************
     * This is where you set up your processor. This includes reading         *
     * configuration files, initializing class instances, etc. You are        *
     * guaranteed that no data will flow in the pipeline as long as your      *
     * processor function has not returned here.                              *
     *                                                                        *
     * You must therefore initialize the data handlers, but you may not push  *
     * any data into the pipeline here.                                       *
     **************************************************************************/

    const logger = getLoggerFor(label);

    incoming.on("data", async (data) => {
        // Log the data to the console.
        if (raw) {
            console.log(data);
        } else {
            logger.log(level, data);
        }

        // Push data into outgoing stream.
        await outgoing?.push(data);
    });

    // If a processor upstream terminates the channel, we propagate this change
    // onto the processors downstream.
    incoming.on("end", async () => {
        logger.info("[processor] Incoming stream terminated.");
        await outgoing?.end();
    });

    /**************************************************************************
     * Any code that must be executed after the pipeline goes online must be  *
     * embedded in the returned function. This guarantees that all channels   *
     * are initialized and the other processors are available. A common use   *
     * case is the source processor, which introduces data into the pipeline  *
     * from an external source such as the file system or an HTTP API, since  *
     * these must be certain that the downstream processors are ready and     *
     * awaiting data.                                                         *
     *                                                                        *
     * Note that this entirely optional, and you may return void instead.     *
     **************************************************************************/
    return async () => {
        // await outgoing.push("You're being logged. Do not resist.");
    };
}
