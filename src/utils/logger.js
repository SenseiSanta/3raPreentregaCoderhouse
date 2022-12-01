import log4js from 'log4js'

log4js.configure({
    appenders: {
        logConsole: {type: "console"},
        warnFile: {type: "file", filename: './logs/warn.log'},
        errorFile: {type: "file", filename: './logs/error.log'},
        //
        loggerConsole: { type: 'logLevelFilter', appender: "logConsole", level: "info"},
        loggerWarn: { type: 'logLevelFilter', appender: "warnFile", level: "warn"},
        loggerError: { type: 'logLevelFilter', appender: "errorFile", level: "error"},
    },
    categories: {
        default: {appenders: ["loggerConsole", "loggerWarn", "loggerError"], level: "all"},
    }
})

const logger = log4js.getLogger()

export { logger }