import { Application, NextFunction, Request, Response } from "express"
import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import { Attributes, ErrorMessage } from "./metadata"

export interface StringMap {
  [key: string]: string
}
// tslint:disable-next-line:class-name
export class resources {
  static languageParam = "lang"
  static defaultLanguage = "en"
  static limits = [12, 24, 60, 100, 120, 180, 300, 600]
  static pages = "pages"
  static page = "page"
  static nextPageToken = "next"
  static limit = "limit"
  static defaultLimit = 12
  static sort = "sort"
  static fields = "fields"
  static partial = "partial"
  static subPartial = "sub"
  static createValidator?: <T>(attributes: Attributes, allowUndefined?: boolean, max?: number) => Validator<T>
  static check: (obj: any, attributes: Attributes, allowUndefined?: boolean, patch?: boolean) => ErrorMessage[]
  static encoding?: BufferEncoding = "utf-8"
}
export function getView(req: Request, view: string): string {
  const partial = req.query[resources.partial]
  return partial === "true" ? resources.pages + "/" + view : view
}
export function isPartial(req: Request): boolean {
  return req.query[resources.partial] === "true"
}
export function isSubPartial(req: Request): boolean {
  return req.query[resources.subPartial] === "true"
}
export interface Validator<T> {
  validate(obj: T, resource?: StringMap, patch?: boolean): Promise<ErrorMessage[]>
}

// tslint:disable-next-line:max-classes-per-file
export class TypeChecker {
  constructor(
    public attributes: Attributes,
    public allowUndefined?: boolean,
  ) {
    this.check = this.check.bind(this)
  }
  check(req: Request, res: Response, next: NextFunction): void {
    const obj = req.body
    if (!obj || (obj as any) === "") {
      res.status(400).end("The request body cannot be empty")
    } else {
      const errors = resources.check(obj, this.attributes, this.allowUndefined)
      if (errors.length > 0) {
        res.status(400).json(errors).end()
      } else {
        next()
      }
    }
  }
}
export type Handler = (req: Request, res: Response, next: NextFunction) => void
export function check(attributes: Attributes, allowUndefined?: boolean): Handler {
  const x = new TypeChecker(attributes, allowUndefined)
  return x.check
}
export interface Parameter {
  name: string
  type: string
}
export interface StringFormat {
  texts: string[]
  parameters: Parameter[]
}
export interface Template {
  name?: string | null
  text: string
  templates: TemplateNode[]
}
export interface TemplateNode {
  type: string
  text: string
  property: string | null
  encode?: string | null
  value: string | null
  format: StringFormat
  array?: string | null
  separator?: string | null
  suffix?: string | null
  prefix?: string | null
}
export function loadTemplates(
  ok: boolean | undefined,
  buildTemplates: (streams: string[], correct?: (stream: string) => string) => Map<string, Template>,
  correct?: (stream: string) => string,
  files?: string[],
): Map<string, Template> | undefined {
  if (!ok) {
    return undefined
  }
  if (!files) {
    files = ["./src/query.xml"]
  }
  const mappers: string[] = []
  for (const file of files) {
    const mapper = fs.readFileSync(file, "utf8")
    mappers.push(mapper)
  }
  return buildTemplates(mappers, correct)
}
export interface Server {
  port: number
  https?: boolean
  options?: any
  key?: string
  cert?: string
}
export function start(a: Application, s: Server): void {
  process.on("uncaughtException", (err) => {
    console.log(err)
  })
  if (s.https) {
    if (s.options) {
      https.createServer(s.options, a).listen(s.port, () => {
        console.log("Use https and start server at port " + s.port)
      })
    } else if (s.key && s.cert && s.key.length > 0 && s.cert.length > 0) {
      const options = {
        key: fs.readFileSync(s.key),
        cert: fs.readFileSync(s.cert),
      }
      https.createServer(options, a).listen(s.port, () => {
        console.log("Use https and start server at port " + s.port)
      })
    } else {
      http.createServer(a).listen(s.port, () => {
        console.log("Start server at port " + s.port)
      })
    }
  } else {
    http.createServer(a).listen(s.port, () => {
      console.log("Start server at port " + s.port)
    })
  }
}
