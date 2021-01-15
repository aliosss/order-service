export function getLogger(context: string): Logger {
    return new Logger(context);
}

class Logger {
    constructor(private context: string) {}

    public error(...args: unknown[]): void {
        console.error(`ERROR: ${this.context} -`, ...args);
    }

    public fatal(...args: unknown[]): void {
        console.error(`FATAL: ${this.context} -`, ...args);
    }

    public warn(...args: unknown[]): void {
        console.warn(`WARN: ${this.context} -`, ...args);
    }

    public info(...args: unknown[]): void {
        console.info(`INFO: ${this.context} -`, ...args);
    }

    public debug(...args: unknown[]): void {
        console.debug(`DEBUG: ${this.context} -`, ...args);
    }
}
