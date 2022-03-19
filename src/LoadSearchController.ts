import {Request, Response} from 'express';
import {handleError, Log} from './http';
import {LoadController, ViewService} from './LoadController';
import {Attribute, Attributes} from './metadata';
import {buildArray, Filter, format, fromRequest, getParameters, initializeConfig, jsonResult, SearchConfig, SearchResult} from './search';
import {getMetadataFunc} from './search_func';

export interface SearchManager {
  search(req: Request, res: Response): void;
  load(req: Request, res: Response): void;
}
export function useSearchController<T, ID, S extends Filter>(log: Log, find: (s: S, limit?: number, skip?: number|string, fields?: string[]) => Promise<SearchResult<T>>, viewService: ViewService<T, ID> | ((id: ID, ctx?: any) => Promise<T>), keys?: Attributes|Attribute[]|string[], config?: SearchConfig|boolean, dates?: string[], numbers?: string[]): SearchManager {
  return new LoadSearchController(log, find, viewService, keys, config, dates, numbers);
}
export const useSearchHandler = useSearchController;
export const createSearchController = useSearchController;
export const createSearchHandler = useSearchController;
export class LoadSearchController<T, ID, S extends Filter> extends LoadController<T, ID> {
  config?: SearchConfig;
  csv?: boolean;
  dates?: string[];
  numbers?: string[];
  fields?: string;
  excluding?: string;
  array?: string[];
  constructor(log: Log, public find: (s: S, limit?: number, skip?: number|string, fields?: string[]) => Promise<SearchResult<T>>, viewService: ViewService<T, ID> | ((id: ID, ctx?: any) => Promise<T>), keys?: Attributes|Attribute[]|string[], config?: SearchConfig|boolean, dates?: string[], numbers?: string[]) {
    super(log, viewService, keys);
    this.search = this.search.bind(this);
    if (config) {
      if (typeof config === 'boolean') {
        this.csv = config;
      } else {
        this.config = initializeConfig(config);
        if (this.config) {
          this.csv = this.config.csv;
          this.fields = this.config.fields;
          this.excluding = this.config.excluding;
        }
      }
    }
    if (!this.fields || this.fields.length === 0) {
      this.fields = 'fields';
    }
    const m = getMetadataFunc(viewService, dates, numbers, keys);
    if (m) {
      this.dates = m.dates;
      this.numbers = m.numbers;
    }
  }
  search(req: Request, res: Response): void {
    const s = fromRequest<S>(req, buildArray(this.array, this.fields, this.excluding));
    const l = getParameters(s, this.config);
    const s2 = format(s, this.dates, this.numbers);
    this.find(s2, l.limit, l.skipOrRefId, l.fields)
      .then(result => jsonResult(res, result, this.csv, l.fields, this.config))
      .catch(err => handleError(err, res, this.log));
  }
}
