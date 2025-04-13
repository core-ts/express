import { Request, Response } from "express"
import { health, HealthChecker } from "./health"

export class HealthController {
  constructor(protected checkers: HealthChecker[]) {
    this.check = this.check.bind(this)
  }
  check(req: Request, res: Response) {
    health(this.checkers).then((r) => {
      if (r.status === "UP") {
        return res.status(200).json(r).end()
      } else {
        return res.status(500).json(r).end()
      }
    })
  }
}
