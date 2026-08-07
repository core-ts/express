import { Request, Response } from "express"

export type HealthStatus = "UP" | "DOWN"
export interface HealthMap {
  [key: string]: Health
}
export interface Health {
  status: HealthStatus
  data?: AnyMap
  details?: HealthMap
}
export interface AnyMap {
  [key: string]: any
}
export interface HealthChecker {
  name(): string
  build(data: AnyMap, error: any): AnyMap
  check(): Promise<AnyMap>
}

export async function health(checkers: HealthChecker[]): Promise<Health> {
  const p: Health = {
    status: "UP",
    details: {},
  }

  await Promise.all(
    checkers.map(async (checker) => {
      const sub: Health = {
        status: "UP",
      }

      try {
        const data = await checker.check()

        if (data && Object.keys(data).length > 0) {
          sub.data = data
        }
      } catch (err) {
        sub.status = "DOWN"
        p.status = "DOWN"
        sub.data = checker.build({}, err)
      }

      p.details![checker.name()] = sub
    }),
  )

  return p
}

export class HealthController {
  constructor(protected checkers: HealthChecker[]) {
    this.check = this.check.bind(this)
  }
  check(req: Request, res: Response) {
    health(this.checkers).then((r) => {
      if (r.status === "UP") {
        res.status(200).json(r).end()
      } else {
        res.status(500).json(r).end()
      }
    })
  }
}
export const HealthHandler = HealthController
