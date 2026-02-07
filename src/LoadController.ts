import { Request, Response } from "express"
import { attrs, handleError, minimize, queryNumber, respondModel } from "./http"
import { Attribute, Attributes } from "./metadata"
import { buildAndCheckId, buildKeys } from "./view"

export interface ViewService<T, ID> {
  metadata?(): Attributes | undefined
  load(id: ID, ctx?: any): Promise<T | null>
}
export type Load<T, ID> = (id: ID, ctx?: any) => Promise<T | null>
function getViewFunc<T, ID>(viewService: ViewService<T, ID> | Load<T, ID>): (id: ID, ctx?: any) => Promise<T | null> {
  if (typeof viewService === "function") {
    return viewService
  }
  return viewService.load
}
function getKeysFunc<T, ID>(viewService: ViewService<T, ID> | Load<T, ID>, keys?: Attributes | Attribute[] | string[]): Attribute[] | undefined {
  if (keys) {
    if (Array.isArray(keys)) {
      if (keys.length > 0) {
        if (typeof keys[0] === "string") {
          return attrs(keys as string[])
        } else {
          return keys as Attribute[]
        }
      }
      return undefined
    } else {
      return buildKeys(keys as Attributes)
    }
  }
  if (typeof viewService !== "function" && viewService.metadata) {
    const metadata = viewService.metadata()
    if (metadata) {
      return buildKeys(metadata)
    }
  }
  return undefined
}
export class LoadController<T, ID> {
  protected keys?: Attribute[]
  protected view: Load<T, ID>
  constructor(viewService: ViewService<T, ID> | Load<T, ID>, keys?: Attributes | Attribute[] | string[]) {
    this.load = this.load.bind(this)
    this.view = getViewFunc(viewService)
    this.keys = getKeysFunc(viewService, keys)
  }
  load(req: Request, res: Response): void {
    const id = buildAndCheckId<ID>(req, res, this.keys)
    if (id) {
      this.view(id)
        .then((obj) => respondModel(minimize(obj), res))
        .catch((err) => handleError(err, res))
    }
  }
}
// tslint:disable-next-line:max-classes-per-file
export class ItemController<T> {
  constructor(
    private loadData: (keyword: string, max?: number) => Promise<T>,
    name?: string,
    protected param?: boolean,
    max?: number,
    maxName?: string,
  ) {
    this.name = name && name.length > 0 ? name : "keyword"
    this.max = max && max > 0 ? max : 20
    this.maxName = maxName && maxName.length > 0 ? maxName : "max"
    this.load = this.load.bind(this)
    this.query = this.query.bind(this)
  }
  name: string
  max: number
  maxName: string
  query(req: Request, res: Response) {
    return this.load(req, res)
  }
  load(req: Request, res: Response) {
    const v = this.param ? req.params[this.name] : req.query[this.name]
    if (!v) {
      res.status(400).end(`'${this.name}' cannot be empty`)
    } else {
      const s = v.toString()
      if (s.length === 0) {
        res.status(400).end(`'${this.name}' cannot be empty`)
      } else {
        const max = queryNumber(req, this.maxName, this.max)
        this.loadData(s, max)
          .then((result) => respondModel(minimize(result), res))
          .catch((err) => handleError(err, res))
      }
    }
  }
}
export { ItemController as ItemHandler }
