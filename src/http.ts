import {Request, Response} from 'express';
import {Attribute} from './metadata';

export type Log = (msg: string) => void;
export type LogFunc = Log;
export function handleError(err: any, res: Response, log?: (msg: string) => void) {
  if (log) {
    log(toString(err));
    res.status(500).end('Internal Server Error');
  } else {
    res.status(500).end(toString(err));
  }
}
export const error = handleError;
export function toString(v: any): string {
  if (typeof v === 'string') {
    return v;
  } else {
    return JSON.stringify(v);
  }
}
export function attr(name: string): Attribute {
  return {name, type: 'string'};
}
export function attrs(keys: string[]): Attribute[] {
  const atts: Attribute[] = [];
  for (const str of keys) {
    const at: Attribute = {name: str as string, type: 'string'};
    atts.push(at);
  }
  return atts;
}
export function respondModel<T>(obj: T, res: Response): void {
  if (obj) {
    res.status(200).json(obj).end();
  } else {
    res.status(404).json(null).end();
  }
}
export function queryRequiredParams(req: Request, res: Response, name: string, split?: string): string[]|undefined {
  const v = req.query[name];
  if (!v) {
    res.status(400).end(`'${name}' cannot be empty`);
    return undefined;
  }
  const v2 = v.toString();
  if (v2.length === 0) {
    res.status(400).end(`'${name}' cannot be empty`);
    return undefined;
  }
  if (!split) {
    split = ',';
  }
  return v2.split(split);
}
export function queryParams(req: Request, name: string, d?: string[], split?: string): string[]|undefined {
  const q = req.query[name];
  if (!q) {
    return d;
  }
  const v = q.toString();
  if (!v || v.length === 0) {
    return d;
  }
  if (!split) {
    split = ',';
  }
  return v.split(split);
}
export function queryParam(req: Request, res: Response, name: string): string|undefined {
  const v = req.query[name];
  if (!v) {
    res.status(400).end(`'${name}' cannot be empty`);
    return undefined;
  } else {
    const v1 = v.toString();
    if (v1.length === 0) {
      res.status(400).end(`'${name}' cannot be empty`);
      return undefined;
    } else {
      return v1;
    }
  }
}
export function query(req: Request, name: string, d?: string): string|undefined {
  const p = req.query[name];
  if (!p || p.toString().length === 0) {
    return d;
  }
  return p.toString();
}
export function queryRequiredNumber(req: Request, res: Response, name: string): number|undefined {
  const field = req.query[name];
  if (!field) {
    return undefined;
  }
  const v = field.toString();
  if (!v || v.length === 0) {
    res.status(400).end(`'${name}' cannot be empty`);
    return undefined;
  }
  if (isNaN(v as any)) {
    res.status(400).end(`'${name}' is not a valid number`);
    return undefined;
  }
  const n = parseFloat(v);
  return n;
}
export function queryNumber(req: Request, name: string, d?: number): number|undefined {
  const field = req.query[name];
  const v = field ? field.toString() : undefined;
  if (!v || v.length === 0) {
    return d;
  }
  if (isNaN(v as any)) {
    return d;
  }
  const n = parseFloat(v);
  return n;
}
export function queryRequiredDate(req: Request, res: Response, name: string): Date|undefined {
  const field = req.query[name];
  if (!field) {
    return undefined;
  }
  const v = field.toString();
  if (!v || v.length === 0) {
    res.status(400).end(`'${name}' cannot be empty`);
    return undefined;
  }
  const date = new Date(v);
  if (date.toString() === 'Invalid Date') {
    res.status(400).end(`'${name}' is not a valid date`);
    return undefined;
  }
  return date;
}
export function queryDate(req: Request, name: string, d?: Date): Date|undefined {
  const field = req.query[name];
  if (field) {
    const v = field.toString();
    if (!v || v.length === 0) {
      return d;
    }
    const date = new Date(v);
    if (date.toString() === 'Invalid Date') {
      return d;
    }
    return date;
  }
  return undefined;
}

export function param(req: Request, res: Response, name: string): string|undefined {
  const v = req.params[name];
  if (!v || v.length === 0) {
    res.status(400).end(`'${name}' cannot be empty`);
    return undefined;
  }
  return v;
}
export const getParam = param;
export function params(req: Request, name: string, d?: string[], split?: string): string[]|undefined {
  const v = req.params[name];
  if (!v || v.length === 0) {
    return d;
  }
  if (!split) {
    split = ',';
  }
  return v.split(split);
}
export const getParams = params;
export function getRequiredParameters(req: Request, res: Response, name: string, split?: string): string[]|undefined {
  const v = req.params[name];
  if (!v || v.length === 0) {
    res.status(400).end(`'${name}' cannot be empty`);
    return undefined;
  }
  if (!split) {
    split = ',';
  }
  return v.split(split);
}
export function getRequiredNumber(req: Request, res: Response, name: string): number|undefined {
  const v = req.params[name];
  if (!v || v.length === 0) {
    res.status(400).end(`'${name}' cannot be empty`);
    return undefined;
  }
  if (isNaN(v as any)) {
    res.status(400).end(`'${name}' must be a number`);
    return undefined;
  }
  const n = parseFloat(v);
  return n;
}
export function getNumber(req: Request, name: string, d?: number): number|undefined {
  const v = req.params[name];
  if (!v || v.length === 0) {
    return d;
  }
  if (isNaN(v as any)) {
    return d;
  }
  const n = parseFloat(v);
  return n;
}
export function getInteger(req: Request, name: string, d?: number): number|undefined {
  const v = req.params[name];
  if (!v || v.length === 0) {
    return d;
  }
  if (isNaN(v as any)) {
    return d;
  }
  const n = parseFloat(v);
  const s = n.toFixed(0);
  return parseFloat(s);
}
export function getRequiredDate(req: Request, res: Response, name: string): Date|undefined {
  const v = req.params[name];
  if (!v || v.length === 0) {
    res.status(400).end(`'${name}' cannot be empty`);
    return undefined;
  }
  const date = new Date(v);
  if (date.toString() === 'Invalid Date') {
    res.status(400).end(`'${name}' must be a date`);
    return undefined;
  }
  return date;
}
export function getDate(req: Request, name: string, d?: Date): Date|undefined {
  const v = req.params[name];
  if (!v || v.length === 0) {
    return d;
  }
  const date = new Date(v);
  if (date.toString() === 'Invalid Date') {
    return d;
  }
  return date;
}
const o = 'object';
export function minimize(obj: any): any {
  if (!obj || typeof obj !== o) {
    return obj;
  }
  const keys = Object.keys(obj);
  for (const key of keys) {
    const v = obj[key];
    if (v == null) {
      delete obj[key];
    } else if (Array.isArray(v) && v.length > 0) {
      const v1 = v[0];
      if (typeof v1 === o && !(v1 instanceof Date)) {
        for (const item of v) {
          minimize(item);
        }
      }
    }
  }
  return obj;
}
export function minimizeArray<T>(arrs: T[]): T[] {
  if (!arrs) {
    return arrs;
  }
  if (arrs.length > 0) {
    for (const obj of arrs) {
      minimize(obj);
    }
  }
  return arrs;
}
