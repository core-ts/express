import { Request, Response } from 'express';
import { Build, GenericController, GenericService } from './GenericController';
import { handleError, Log } from './http';
import { ErrorMessage } from './metadata';
import { StringMap } from './resources';
import { buildArray, Filter, format, fromRequest, getMetadataFunc, getParameters, initializeConfig, jsonResult, SearchConfig, SearchResult } from './search';

export interface Service<T, ID, R, S extends Filter> extends GenericService<T, ID, R> {
  search: (s: S, limit?: number, skip?: number | string, fields?: string[]) => Promise<SearchResult<T>>;
}
export class LowcodeController<T, ID, S extends Filter> extends GenericController<T, ID> {
  config?: SearchConfig;
  csv?: boolean;
  dates?: string[];
  numbers?: string[];
  fields?: string;
  excluding?: string;
  array?: string[];
  constructor(
    log: Log,
    public lowCodeService: Service<T, ID, number | ErrorMessage[], S>,
    config?: SearchConfig,
    build?: Build<T>,
    validate?: (obj: T, resource?: StringMap, patch?: boolean) => Promise<ErrorMessage[]>,
    dates?: string[],
    numbers?: string[],
  ) {
    super(log, lowCodeService, build, validate);
    this.search = this.search.bind(this);
    this.config = initializeConfig(config);
    if (this.config) {
      this.csv = this.config.csv;
      this.fields = this.config.fields;
      this.excluding = this.config.excluding;
    }
    if (!this.fields || this.fields.length === 0) {
      this.fields = 'fields';
    }
    const m = getMetadataFunc(lowCodeService, dates, numbers);
    if (m) {
      this.dates = m.dates;
      this.numbers = m.numbers;
    }
  }
  search(req: Request, res: Response) {
    const s = fromRequest<S>(req, buildArray(this.array, this.fields, this.excluding));
    const l = getParameters(s, this.config);
    const s2 = format(s, this.dates, this.numbers);
    this.lowCodeService
      .search(s2, l.limit, l.pageOrNextPageToken, l.fields)
      .then((result) => jsonResult(res, result, this.csv, l.fields, this.config))
      .catch((err) => handleError(err, res, this.log));
  }
}
export { LowcodeController as LowcodeHandler };
export class Controller<T, ID, S extends Filter> extends GenericController<T, ID> {
  config?: SearchConfig;
  csv?: boolean;
  dates?: string[];
  numbers?: string[];
  fields?: string;
  excluding?: string;
  array?: string[];
  constructor(
    log: Log,
    public lowCodeService: Service<T, ID, number | T | ErrorMessage[], S>,
    build?: Build<T>,
    validate?: (obj: T, resource?: StringMap, patch?: boolean) => Promise<ErrorMessage[]>,
    config?: SearchConfig,
    dates?: string[],
    numbers?: string[],
  ) {
    super(log, lowCodeService, build, validate);
    this.search = this.search.bind(this);
    this.config = initializeConfig(config);
    if (this.config) {
      this.csv = this.config.csv;
      this.fields = this.config.fields;
      this.excluding = this.config.excluding;
    }
    if (!this.fields || this.fields.length === 0) {
      this.fields = 'fields';
    }
    const m = getMetadataFunc(lowCodeService, dates, numbers);
    if (m) {
      this.dates = m.dates;
      this.numbers = m.numbers;
    }
  }
  search(req: Request, res: Response) {
    const s = fromRequest<S>(req, buildArray(this.array, this.fields, this.excluding));
    const l = getParameters(s, this.config);
    const s2 = format(s, this.dates, this.numbers);
    this.lowCodeService
      .search(s2, l.limit, l.pageOrNextPageToken, l.fields)
      .then((result) => jsonResult(res, result, this.csv, l.fields, this.config))
      .catch((err) => handleError(err, res, this.log));
  }
}
