import * as http from "http"
import * as https from "https"
import { AnyMap, HealthChecker } from "./health"

function getHealthSecure(url: string, timeout: number): Promise<AnyMap> {
  return new Promise((resolve) => {
    https
      .get(url, { rejectUnauthorized: false }, (res: any) => {
        let data = ""
        res.on("data", (d: any) => {
          data += d
        })
        res.on("end", () => {
          resolve({ statusCode: res.statusCode, data, statusMessage: res.statusMessage })
        })
      })
      .on("error", (e: any) => {
        return { statusCode: 500, statusMessage: e }
      })
    setTimeout(() => resolve({ statusCode: 408, statusMessage: "Time out" }), timeout)
  })
}
function getHealth(url: string, timeout: number): Promise<AnyMap> {
  return new Promise((resolve) => {
    http
      .get(url, (res: any) => {
        let data = ""
        res.on("data", (d: any) => {
          data += d
        })
        res.on("end", () => {
          resolve({ statusCode: res.statusCode, data, statusMessage: res.statusMessage })
        })
      })
      .on("error", (e: any) => {
        return { statusCode: 500, statusMessage: e }
      })
    setTimeout(() => resolve({ statusCode: 408, statusMessage: "Time out" }), timeout)
  })
}
export class ClientChecker implements HealthChecker {
  timeout: number
  constructor(private service: string, private url: string, timeout: number) {
    this.timeout = timeout ? timeout : 4200
    this.check = this.check.bind(this)
    this.name = this.name.bind(this)
    this.build = this.build.bind(this)
  }
  check(): Promise<AnyMap> {
    let obj = {} as AnyMap
    if (this.url.startsWith("https://")) {
      return getHealthSecure(this.url, this.timeout).then((r) => (obj = r))
    } else {
      return getHealth(this.url, this.timeout).then((r) => (obj = r))
    }
  }
  name(): string {
    return this.service
  }
  build(data: AnyMap, err: any): AnyMap {
    if (err) {
      if (!data) {
        data = {} as AnyMap
      }
      data["error"] = err
    }
    return data
  }
}
