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
  const p: Health = { status: "UP" }
  const total = checkers.length - 1
  let count = 0
  p.details = {} as HealthMap
  for (const checker of checkers) {
    const sub: Health = { status: "UP" }
    try {
      const r = await checker.check()
      if (r && Object.keys(r).length > 0) {
        sub.data = r
      }
      p.details[checker.name()] = sub
      if (count >= total) {
        return p
      } else {
        count++
      }
    } catch (err) {
      sub.status = "DOWN"
      p.status = "DOWN"
      sub.data = checker.build({} as AnyMap, err)
      p.details[checker.name()] = sub
      if (count >= total) {
        return p
      } else {
        count++
      }
    }
  }
  return p
}
