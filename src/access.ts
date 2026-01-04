import { NextFunction, Request, Response } from "express"

export interface AccessConfig {
  origin?: string | string[]
  credentials?: string | string[]
  methods?: string | string[]
  headers: number | string | ReadonlyArray<string>
}
export type AccessControlAllowConfig = AccessConfig
export function allow(
  access: AccessConfig,
): (req: Request, res: Response, next: NextFunction) => void {
  const ao = access.origin
  if (typeof ao === "string") {
    return (req: Request, res: Response, next: NextFunction) => {
      res.header("Access-Control-Allow-Origin", access.origin)
      res.header("Access-Control-Allow-Credentials", access.credentials)
      res.header("Access-Control-Allow-Methods", access.methods)
      res.setHeader("Access-Control-Allow-Headers", access.headers)
      next()
    }
  } else if (Array.isArray(ao) && ao.length > 0) {
    return (req: Request, res: Response, next: NextFunction) => {
      const origin = req.headers.origin
      if (origin) {
        if (ao.includes(origin)) {
          res.setHeader("Access-Control-Allow-Origin", origin)
        }
      }
      res.header("Access-Control-Allow-Credentials", access.credentials)
      res.header("Access-Control-Allow-Methods", access.methods)
      res.setHeader("Access-Control-Allow-Headers", access.headers)
      next()
    }
  }
  return (req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Credentials", access.credentials)
    res.header("Access-Control-Allow-Methods", access.methods)
    res.setHeader("Access-Control-Allow-Headers", access.headers)
    next()
  }
}
