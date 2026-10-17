import { NextFunction, Request, Response } from "express"
import { PassThrough } from "stream"
import { resources } from "./resources"

export interface MiddlewareLogConfig {
  log?: boolean
  separate?: boolean
  skips?: string
  request?: string
  response?: string
  duration?: string
  status?: string
  size?: string
}
export interface MiddleLog {
  log?: boolean
  separate?: boolean
  skips: string[]
  duration: string
  request: string
  response: string
  status: string
  size: string
}
export interface Context {
  [key: string]: string | number | boolean | Date
}
export function createConfig(cfg?: MiddlewareLogConfig): MiddleLog {
  if (!cfg) {
    return { skips: [], duration: "duration", request: "", response: "", status: "", size: "" }
  }
  const tempSkips = cfg.skips ? cfg.skips.split(",") : []
  const skips: string[] = []
  for (const s of tempSkips) {
    const sf = s.startsWith("/") ? s : "/" + s
    skips.push(sf)
  }
  const l: MiddleLog = {
    log: cfg.log,
    separate: cfg.separate,
    skips: skips,
    duration: cfg.duration ? cfg.duration : "duration",
    request: cfg.request ? cfg.request : "",
    response: cfg.response ? cfg.response : "",
    status: cfg.status ? cfg.status : "",
    size: cfg.size ? cfg.size : "",
  }
  return l
}
export interface Middleware {
  config: MiddleLog
}
const o = "OPTIONS"
export class MiddlewareLogger {
  constructor(
    protected write: (msg: string, map?: Context) => void,
    config?: MiddlewareLogConfig,
    protected buildContext?: (req: Request, map: Context) => Context,
    protected encryptResponse?: (rs: string) => string,
    protected encryptRequest: (body: any) => string = JSON.stringify,
  ) {
    this.log = this.log.bind(this)
    this.config = createConfig(config)
  }
  config: MiddleLog
  log(req: Request, res: Response, next: NextFunction) {
    const mt = req.method
    if (mt !== o && this.config.log && !this.config.skips.includes(req.path)) {
      const start = process.hrtime()
      const rq = this.config.request
      let r = false
      if (mt !== "GET" && mt !== "DELETE") {
        r = true
      }
      const msg = `${mt} ${req.originalUrl}`
      if (this.config.separate && r) {
        if (this.config.request.length > 0) {
          const op: Context = {}
          op[rq] = this.encryptRequest(req.body)
          if (this.buildContext) {
            const op2 = this.buildContext(req, op)
            this.write(msg, op2)
          } else {
            this.write(msg, op)
          }
        }
      }
      const chunks: Uint8Array[] = []
      mapResponseBody(res, chunks)
      res.on("finish", () => {
        const duration = getDurationInMilliseconds(start)
        const op: Context = {}
        if (r && !this.config.separate && this.config.request.length > 0) {
          op[rq] = this.encryptRequest(req.body)
        }
        if (this.config.response.length > 0) {
          const rsBody = Buffer.concat(chunks).toString(resources.encoding)
          if (this.encryptResponse) {
            op[this.config.response] = this.encryptResponse(rsBody)
          } else {
            op[this.config.response] = rsBody
          }
        }
        if (this.config.status.length > 0) {
          op[this.config.status] = res.statusCode
        }
        if (this.config.size.length > 0) {
          if ("_contentLength" in res) {
            op[this.config.size] = (res as any)["_contentLength"]
          } else if (res.hasHeader("content-length")) {
            const lg = res.getHeader("content-length")
            if (typeof lg === "number" || typeof lg === "string") {
              op[this.config.size] = lg
            }
          }
        }
        op[this.config.duration] = duration
        if (this.buildContext) {
          const op2 = this.buildContext(req, op)
          this.write(msg, op2)
        } else {
          this.write(msg, op)
        }
      })
      next()
    } else {
      next()
    }
  }
}
const mapResponseBody = (res: Response, chunks: Uint8Array[]) => {
  const defaultWrite = res.write.bind(res)
  const defaultEnd = res.end.bind(res)
  const ps = new PassThrough()

  ps.on("data", (data: any) => chunks.push(data))
  ;(res as any).write = (...args: any) => {
    ;(ps as any).write(...args)
    ;(defaultWrite as any)(...args)
  }
  ;(res as any).end = (...args: any) => {
    ps.end(...args)
    defaultEnd(...args)
  }
}
const NS_PER_SEC = 1e9
const NS_TO_MS = 1e6
const getDurationInMilliseconds = (start: [number, number] | undefined) => {
  const diff = process.hrtime(start)
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}

// tslint:disable-next-line:max-classes-per-file
export class MiddlewareController {
  constructor(public logger: Middleware) {
    this.config = this.config.bind(this)
  }
  config(req: Request, res: Response) {
    const obj: MiddleLog = req.body
    if (!this.logger) {
      res.status(503).end("Logger is not available")
      return
    }
    let changed = false
    if (obj.log !== undefined) {
      this.logger.config.log = obj.log
      changed = true
    }
    if (obj.separate !== undefined) {
      this.logger.config.separate = obj.separate
      changed = true
    }
    if (Array.isArray(obj.skips)) {
      if (isValidSkips(obj.skips)) {
        this.logger.config.skips = obj.skips
        changed = true
      }
    }
    if (typeof obj.duration === "string" && obj.duration.length > 0) {
      this.logger.config.duration = obj.duration
      changed = true
    }
    if (typeof obj.request === "string") {
      this.logger.config.request = obj.request
      changed = true
    }
    if (typeof obj.response === "string") {
      this.logger.config.response = obj.response
      changed = true
    }
    if (typeof obj.status === "string") {
      this.logger.config.status = obj.status
      changed = true
    }
    if (typeof obj.size === "string") {
      this.logger.config.size = obj.size
      changed = true
    }
    if (changed) {
      res.status(200).json(true).end()
    } else {
      res.status(204).json(false).end()
    }
  }
}
export function isValidSkips(s: string[]): boolean {
  for (const x of s) {
    if (!(typeof x === "string")) {
      return false
    }
  }
  return true
}
export function mask(s: string, start: number, end: number, replace: string): string {
  if (start < 0) {
    start = 0
  }
  if (end < 0) {
    end = 0
  }
  const t = start + end
  if (t >= s.length) {
    return replace.repeat(s.length)
  }
  return s.substring(0, start) + replace.repeat(s.length - t) + s.substring(s.length - end)
}
export function margin(s: string, start: number, end: number, replace: string): string {
  if (start >= end) {
    return ""
  }
  if (start < 0) {
    start = 0
  }
  if (end < 0) {
    end = 0
  }
  if (start >= s.length) {
    return replace.repeat(s.length)
  }
  if (end >= s.length) {
    return replace.repeat(start) + s.substring(start)
  }
  return replace.repeat(start) + s.substring(start, end - start) + replace.repeat(s.length - end)
}
export const maskMargin = margin
