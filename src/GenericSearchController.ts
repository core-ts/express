import { Request, Response } from "express"
import { Build, GenericController, GenericService } from "./GenericController"
import { handleError, Log } from "./http"
import { ErrorMessage } from "./metadata"
import { resources, StringMap } from "./resources"
import { buildArray, Filter, format, fromRequest, getMetadataFunc, getParameters, initializeConfig, jsonResult, SearchConfig, SearchResult } from "./search"

export class GenericSearchController<T, ID, S extends Filter> extends GenericController<T, ID> {
  config?: SearchConfig
  csv?: boolean
  dates?: string[]
  numbers?: string[]
  excluding?: string
  array?: string[]
  constructor(
    log: Log,
    public find: (s: S, limit: number, page?: number | string, fields?: string[]) => Promise<SearchResult<T>>,
    service: GenericService<T, ID, number | ErrorMessage[]>,
    config?: SearchConfig,
    build?: Build<T>,
    validate?: (obj: T, resource?: StringMap, patch?: boolean) => Promise<ErrorMessage[]>,
    dates?: string[],
    numbers?: string[],
  ) {
    super(log, service, build, validate)
    this.search = this.search.bind(this)
    this.config = initializeConfig(config)
    if (this.config) {
      this.csv = this.config.csv
      this.excluding = this.config.excluding
    }
    const m = getMetadataFunc(service, dates, numbers)
    if (m) {
      this.dates = m.dates
      this.numbers = m.numbers
    }
  }
  search(req: Request, res: Response) {
    const s = fromRequest<S>(req, buildArray(this.array, resources.fields, this.excluding))
    const l = getParameters(s, this.config)
    const s2 = format(s, this.dates, this.numbers)
    this.find(s2, l.limit, l.pageOrNextPageToken, l.fields)
      .then((result) => jsonResult(res, result, this.csv, l.fields, this.config))
      .catch((err) => handleError(err, res, this.log))
  }
}
