import {Request, Response} from 'express';

export interface NumberMap {
  [key: string]: number;
}
export interface LogConfig {
  level?: string;
  map?: LogMapConfig;
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
export interface Logger {
  level: number;
  map: LogMap;
}

export class LogController {
  map?: NumberMap;
  constructor(public logger: Logger, mp?: NumberMap) {
    this.map = mp;
    this.config = this.config.bind(this);
  }
  config(req: Request, res: Response) {
    const obj: LogConfig = req.body;
    if (!obj || obj === '') {
      return res.status(400).end('The request body cannot be empty');
    }
    if (!this.logger || !this.map) {
      return res.status(503).end('Logger is not available');
    }
    if (!this.map) {
      return res.status(503).end('Map is not available');
    }
    let changed = false;
    if (obj.level && typeof obj.level === 'string' && obj.level.length > 0) {
      const lv = this.map[obj.level.toUpperCase()];
      if (lv !== undefined) {
        this.logger.level = lv;
        changed = true;
      }
    }
    if (obj.map) {
      if (obj.map.level && typeof obj.map.level === 'string' && obj.map.level.length > 0) {
        this.logger.map.level = obj.map.level;
        changed = true;
      }
      if (obj.map.time && typeof obj.map.time === 'string' && obj.map.time.length > 0) {
        this.logger.map.time = obj.map.time;
        changed = true;
      }
      if (obj.map.msg && typeof obj.map.msg === 'string' && obj.map.msg.length > 0) {
        this.logger.map.msg = obj.map.msg;
        changed = true;
      }
    }
    if (changed) {
      return res.status(200).end('true');
    } else {
      return res.status(204).end('false');
    }
  }
}
