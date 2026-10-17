import { Request, Response } from "express"

export interface NumberMap {
  [key: string]: number
}
interface Context {
  [key: string]: string | number | boolean | Date
}
export interface LogMap {
  time: string
  level: string
  msg: string
}
export interface LogMapConfig {
  time?: string
  level?: string
  msg?: string
}
export interface Config {
  level?: string
  map?: LogMapConfig
  constants?: Context
  name?: Name
}
export interface Name {
  trace: string
  debug: string
  info: string
  warn: string
  error: string
  panic: string
  fatal: string
}
export interface Logger {
  name: Name
  level: number
  map: LogMap
  constants?: Context
  trace(msg: string, context?: Context, ctx?: any): void
  debug(msg: string, context?: Context, ctx?: any): void
  info(msg: string, context?: Context, ctx?: any): void
  warn(msg: string, context?: Context, ctx?: any): void
  error(msg: string, context?: Context, ctx?: any): void
  panic(msg: string, context?: Context, ctx?: any): void
  fatal(msg: string, context?: Context, ctx?: any): void
  isLevelEnabled(level: number): boolean
  isTraceEnabled(): boolean
  isDebugEnabled(): boolean
  isInfoEnabled(): boolean
  isWarnEnabled(): boolean
  isErrorEnabled(): boolean
  isPanicEnabled(): boolean
  isFatalEnabled(): boolean
}
export class LogController {
  constructor(
    protected logger: Logger,
    protected updateLogger: (logger: Logger, config: Config, map?: NumberMap) => boolean,
    protected map?: NumberMap,
  ) {
    this.config = this.config.bind(this)
  }
  config(req: Request, res: Response) {
    const obj: Config = req.body
    if (!this.logger) {
      res.status(503).end("Logger is not available")
      return
    }
    if (typeof obj.level === "string" && obj.level.length > 0) {
      if (!this.map) {
        res.status(503).end("Map is not available")
        return
      }
    }
    const changed = this.updateLogger(this.logger, obj, this.map)
    if (changed) {
      res.writeHead(200).end("true")
    } else {
      res.writeHead(204).end("false")
    }
  }
}
export const LogHandler = LogController
