import { Request, Response } from 'express';
import { SimpleMap } from './log';

export interface NumberMap {
  [key: string]: number;
}
export interface LogConf {
  level?: string;
  map?: LogMapConfig;
  constants?: SimpleMap;
  name?: Name;
}
export interface LogMapConfig {
  time?: string;
  level?: string;
  msg?: string;
}
export interface LogMap {
  time: string;
  level: string;
  msg: string;
}
export interface Name {
  trace: string;
  debug: string;
  info: string;
  warn: string;
  error: string;
  panic: string;
  fatal: string;
}
export interface Logger {
  name: Name;
  level: number;
  map: LogMap;
  constants?: SimpleMap;
  trace(msg: string, m?: SimpleMap, ctx?: any): void;
  debug(msg: string, m?: SimpleMap, ctx?: any): void;
  info(msg: string, m?: SimpleMap, ctx?: any): void;
  warn(msg: string, m?: SimpleMap, ctx?: any): void;
  error(msg: string, m?: SimpleMap, ctx?: any): void;
  panic(msg: string, m?: SimpleMap, ctx?: any): void;
  fatal(msg: string, m?: SimpleMap, ctx?: any): void;
  isLevelEnabled(level: number): boolean;
  isTraceEnabled(): boolean;
  isDebugEnabled(): boolean;
  isInfoEnabled(): boolean;
  isWarnEnabled(): boolean;
  isErrorEnabled(): boolean;
  isPanicEnabled(): boolean;
  isFatalEnabled(): boolean;
}
export const map: NumberMap = {
  TRACE: -2,
  DEBUG: -1,
  INFO: 0,
  WARN: 1,
  ERROR: 2,
  PANIC: 3,
  FATAL: 4
};
export class LogController {
  map: NumberMap;
  constructor(public logger: Logger, mp?: NumberMap) {
    this.map = (mp ? mp : map);
    this.config = this.config.bind(this);
  }
  config(req: Request, res: Response) {
    const obj: LogConf = req.body;
    if (!obj || obj === '') {
      return res.status(400).end('The request body cannot be empty');
    }
    if (!this.logger) {
      return res.status(503).end('Logger is not available');
    }
    let changed = false;
    if (typeof obj.level === 'string' && obj.level.length > 0) {
      if (!this.map) {
        return res.status(503).end('Map is not available');
      }
      const lv = this.map[obj.level.toUpperCase()];
      if (lv !== undefined) {
        this.logger.level = lv;
        changed = true;
      }
    }
    if (obj.map) {
      if (typeof obj.map.level === 'string' && obj.map.level.length > 0) {
        this.logger.map.level = obj.map.level;
        changed = true;
      }
      if (typeof obj.map.time === 'string' && obj.map.time.length > 0) {
        this.logger.map.time = obj.map.time;
        changed = true;
      }
      if (typeof obj.map.msg === 'string' && obj.map.msg.length > 0) {
        this.logger.map.msg = obj.map.msg;
        changed = true;
      }
    }
    if (obj.constants !== undefined && typeof obj.constants === 'object') {
      const ks = Object.keys(obj.constants);
      if (ks.length > 0) {
        this.logger.constants = obj.constants;
      } else {
        this.logger.constants = undefined;
      }
      changed = true;
    }
    if (obj.name) {
      if (typeof obj.name.trace === 'string'
        && typeof obj.name.debug === 'string'
        && typeof obj.name.info === 'string'
        && typeof obj.name.warn === 'string'
        && typeof obj.name.error === 'string'
        && typeof obj.name.panic === 'string'
        && typeof obj.name.fatal === 'string') {
        this.logger.name = obj.name;
        changed = true;
      }
    }
    if (changed) {
      return res.status(200).json(true).end();
    } else {
      return res.status(204).json(false).end();
    }
  }
}
