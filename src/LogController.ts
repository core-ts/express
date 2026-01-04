import { Request, Response } from "express"
import { SimpleMap } from "./log"

export interface NumberMap {
  [key: string]: number
}
export interface LogConfig {
  level?: string
  map?: LogMapConfig
  constants?: SimpleMap
  name?: Name
}
export interface LogMapConfig {
  time?: string
  level?: string
  msg?: string
}
export interface LogMap {
  time: string
  level: string
  msg: string
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
  constants?: SimpleMap
  trace(msg: string, m?: SimpleMap, ctx?: any): void
  debug(msg: string, m?: SimpleMap, ctx?: any): void
  info(msg: string, m?: SimpleMap, ctx?: any): void
  warn(msg: string, m?: SimpleMap, ctx?: any): void
  error(msg: string, m?: SimpleMap, ctx?: any): void
  panic(msg: string, m?: SimpleMap, ctx?: any): void
  fatal(msg: string, m?: SimpleMap, ctx?: any): void
  isLevelEnabled(level: number): boolean
  isTraceEnabled(): boolean
  isDebugEnabled(): boolean
  isInfoEnabled(): boolean
  isWarnEnabled(): boolean
  isErrorEnabled(): boolean
  isPanicEnabled(): boolean
  isFatalEnabled(): boolean
}
export const map: NumberMap = {
  TRACE: -2,
  DEBUG: -1,
  INFO: 0,
  WARN: 1,
  ERROR: 2,
  PANIC: 3,
  FATAL: 4,
}
export class LogController {
  map: NumberMap
  update: (logger: Logger, obj: LogConfig, mp: NumberMap) => boolean
  constructor(public logger: Logger, updateL?: (logger: Logger, obj: LogConfig, mp: NumberMap) => boolean, mp?: NumberMap) {
    this.map = mp ? mp : map
    this.update = updateL ? updateL : updateLog
    this.config = this.config.bind(this)
  }
  config(req: Request, res: Response) {
    const obj: LogConfig = req.body
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
    const changed = this.update(this.logger, obj, this.map)
    if (changed) {
      res.status(200).json(true).end()
    } else {
      res.status(204).json(false).end()
    }
  }
}
export function updateLog(logger: Logger, obj: LogConfig, mp: NumberMap): boolean {
  let changed = false
  if (typeof obj.level === "string" && obj.level.length > 0) {
    const lv = mp[obj.level.toUpperCase()]
    if (lv !== undefined) {
      logger.level = lv
      changed = true
    }
  }
  if (obj.map) {
    if (typeof obj.map.level === "string" && obj.map.level.length > 0) {
      logger.map.level = obj.map.level
      changed = true
    }
    if (typeof obj.map.time === "string" && obj.map.time.length > 0) {
      logger.map.time = obj.map.time
      changed = true
    }
    if (typeof obj.map.msg === "string" && obj.map.msg.length > 0) {
      logger.map.msg = obj.map.msg
      changed = true
    }
  }
  if (obj.constants !== undefined && typeof obj.constants === "object") {
    const ks = Object.keys(obj.constants)
    if (ks.length > 0) {
      logger.constants = obj.constants
    } else {
      logger.constants = undefined
    }
    changed = true
  }
  if (obj.name) {
    if (
      typeof obj.name.trace === "string" &&
      typeof obj.name.debug === "string" &&
      typeof obj.name.info === "string" &&
      typeof obj.name.warn === "string" &&
      typeof obj.name.error === "string" &&
      typeof obj.name.panic === "string" &&
      typeof obj.name.fatal === "string"
    ) {
      logger.name = obj.name
      changed = true
    }
  }
  return changed
}
