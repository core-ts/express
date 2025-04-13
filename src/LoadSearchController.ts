import { Request, Response } from "express"
import { resources } from "resources"
import { handleError, Log } from "./http"
import { LoadController, ViewService } from "./LoadController"
import { Attribute, Attributes } from "./metadata"
import { buildArray, Filter, format, fromRequest, getMetadataFunc, getParameters, initializeConfig, jsonResult, SearchConfig, SearchResult } from "./search"

export interface Search {
  search(req: Request, res: Response): void
  load(req: Request, res: Response): void
}
export interface Query<T, ID, S> extends ViewService<T, ID> {
  search: (s: S, limit: number, page?: number | string, fields?: string[]) => Promise<SearchResult<T>>
  metadata?(): Attributes | undefined
  load(id: ID, ctx?: any): Promise<T | null>
}
export interface SearchManager {
  search(req: Request, res: Response): void
  load(req: Request, res: Response): void
}
export function useSearchController<T, ID, S extends Filter>(
  log: Log,
  find: (s: S, limit: number, page?: number | string, fields?: string[]) => Promise<SearchResult<T>>,
  viewService: ViewService<T, ID> | ((id: ID, ctx?: any) => Promise<T>),
  array?: string[],
  dates?: string[],
  numbers?: string[],
  keys?: Attributes | Attribute[] | string[],
  config?: SearchConfig | boolean,
): Search {
  const c = new LoadSearchController(log, find, viewService, keys, config, dates, numbers)
  c.array = array
  return c
}
export const useSearchHandler = useSearchController
export const createSearchController = useSearchController
export const createSearchHandler = useSearchController
export class LoadSearchController<T, ID, S extends Filter> extends LoadController<T, ID> {
  config?: SearchConfig
  csv?: boolean
  dates?: string[]
  numbers?: string[]
  excluding?: string
  array?: string[]
  constructor(
    log: Log,
    public find: (s: S, limit: number, page?: number | string, fields?: string[]) => Promise<SearchResult<T>>,
    viewService: ViewService<T, ID> | ((id: ID, ctx?: any) => Promise<T>),
    keys?: Attributes | Attribute[] | string[],
    config?: SearchConfig | boolean,
    dates?: string[],
    numbers?: string[],
  ) {
    super(log, viewService, keys)
    this.search = this.search.bind(this)
    if (config) {
      if (typeof config === "boolean") {
        this.csv = config
      } else {
        this.config = initializeConfig(config)
        if (this.config) {
          this.csv = this.config.csv
          this.excluding = this.config.excluding
        }
      }
    }
    const m = getMetadataFunc(viewService, dates, numbers, keys)
    if (m) {
      this.dates = m.dates
      this.numbers = m.numbers
    }
  }
  search(req: Request, res: Response): void {
    const s = fromRequest<S>(req, buildArray(this.array, resources.fields, this.excluding))
    const l = getParameters(s, this.config)
    const s2 = format(s, this.dates, this.numbers)
    this.find(s2, l.limit, l.pageOrNextPageToken, l.fields)
      .then((result) => jsonResult(res, result, this.csv, l.fields, this.config))
      .catch((err) => handleError(err, res, this.log))
  }
}
export class QueryController<T, ID, S extends Filter> extends LoadController<T, ID> {
  config?: SearchConfig
  csv?: boolean
  dates?: string[]
  numbers?: string[]
  excluding?: string
  array?: string[]
  constructor(log: Log, protected query: Query<T, ID, S>, config?: SearchConfig | boolean, dates?: string[], numbers?: string[], array?: string[]) {
    super(log, query)
    this.search = this.search.bind(this)
    this.array = array
    if (config) {
      if (typeof config === "boolean") {
        this.csv = config
      } else {
        this.config = initializeConfig(config)
        if (this.config) {
          this.csv = this.config.csv
          this.excluding = this.config.excluding
        }
      }
    }
    const m = getMetadataFunc(query, dates, numbers)
    if (m) {
      this.dates = m.dates
      this.numbers = m.numbers
    }
  }
  search(req: Request, res: Response): void {
    const s = fromRequest<S>(req, buildArray(this.array, resources.fields, this.excluding))
    const l = getParameters(s, this.config)
    const s2 = format(s, this.dates, this.numbers)
    this.query
      .search(s2, l.limit, l.pageOrNextPageToken, l.fields)
      .then((result) => jsonResult(res, result, this.csv, l.fields, this.config))
      .catch((err) => handleError(err, res, this.log))
  }
}
export { QueryController as QueryHandler }
