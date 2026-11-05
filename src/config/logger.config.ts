import { Logger, type LogLevel } from '@nestjs/common'

export function getLogLevels(): LogLevel[] {
  const logger = new Logger('getLogLevels')
  const logLevelConfig = parseInt(process.env.LOG_LEVEL ?? '1', 10)

  // 'warn' stays in the list. Nest enables each level that the list contains.
  const logLevels: LogLevel[] = ['log', 'warn']

  // Adjust log levels based on the configuration
  switch (logLevelConfig) {
    case 2:
      logLevels.push('debug')
      logger.log('Log levels set to: log, warn, debug')
      break
    case 3:
      logLevels.push('debug', 'error')
      logger.log('Log levels set to: log, warn, debug, error')
      break
    default:
      logLevels.push('error')
      logger.log('Log levels set to: log, warn, error')
  }

  logger.log(`Configured log level: ${logLevels}`)
  return logLevels
}
