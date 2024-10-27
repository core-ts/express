import { Request, Response } from 'express';
import { minimizeArray, query } from './http';
import { Attribute, Attributes } from './metadata';
import { resources } from './resources';

const et = '';

export interface Filter {
  fields?: string[];
  sort?: string;

  q?: string;
}
export interface SearchConfig {
  excluding?: string;
  fields?: string;
  list?: string;
  total?: string;
  token?: string;
  last?: string;
  csv?: boolean;
  page?: string;
  limit?: string;
  skip?: string;
  refId?: string;
  firstLimit?: string;
}
export interface SearchResult<T> {
  list: T[];
  total?: number;
  nextPageToken?: string;
  last?: boolean;
}

export function getOffset(limit: number, page: number): number {
  const offset = limit * (page - 1);
  return offset < 0 ? 0 : offset;
}

export function getPageTotal(pageSize?: number, total?: number): number {
  if (!pageSize || pageSize <= 0) {
    return 1;
  } else {
    if (!total) {
      total = 0;
    }
    if (total % pageSize === 0) {
      return Math.floor(total / pageSize);
    }
    return Math.floor(total / pageSize + 1);
  }
}
export function buildPages(pageSize?: number, total?: number): number[] {
  const pageTotal = getPageTotal(pageSize, total);
  if (pageTotal <= 1) {
    return [1];
  }
  const arr: number[] = [];
  for (let i = 1; i <= pageTotal; i++) {
    arr.push(i);
  }
  return arr;
}

export function hasSearch(req: Request): boolean {
  return req.url.indexOf('?') >= 0;
}
export function getSearch(url: string): string {
  const i = url.indexOf('?');
  return i < 0 ? et : url.substring(i + 1);
}
export function getField(search: string, fieldName: string): string {
  let i = search.indexOf(fieldName + '=');
  if (i < 0) {
    return '';
  }
  if (i > 0) {
    if (search.substring(i - 1, 1) != '&') {
      i = search.indexOf('&' + fieldName + '=');
      if (i < 0) {
        return search;
      }
      i = i + 1;
    }
  }
  const j = search.indexOf('&', i + fieldName.length);
  return j >= 0 ? search.substring(i, j) : search.substring(i);
}
export function removeField(search: string, fieldName: string): string {
  let i = search.indexOf(fieldName + '=');
  if (i < 0) {
    return search;
  }
  if (i > 0) {
    if (search.substring(i - 1, 1) != '&') {
      i = search.indexOf('&' + fieldName + '=');
      if (i < 0) {
        return search;
      }
      i = i + 1;
    }
  }
  const j = search.indexOf('&', i + fieldName.length);
  return j >= 0 ? search.substring(0, i) + search.substring(j + 1) : search.substring(0, i - 1);
}
export function removePage(search: string): string {
  search = removeField(search, resources.page);
  search = removeField(search, resources.partial);
  return search;
}
export function buildPageSearch(search: string): string {
  const sr = removePage(search);
  return sr.length == 0 ? sr : '&' + sr;
}
export function buildPageSearchFromUrl(url: string): string {
  const search = getSearch(url);
  return buildPageSearch(search);
}
export function removeSort(search: string): string {
  search = removeField(search, resources.sort);
  search = removeField(search, resources.partial);
  return search;
}
export interface Sort {
  field?: string;
  type?: string;
}
export interface SortType {
  url: string;
  tag: string;
}
export interface SortMap {
  [key: string]: SortType;
}
export function getSortString(field: string, sort: Sort): string {
  if (field === sort.field) {
    return sort.type === '-' ? field : '-' + field;
  }
  return field;
}
export function buildSort(s?: string): Sort {
  if (!s || s.indexOf(',') >= 0) {
    return {} as Sort;
  }
  if (s.startsWith('-')) {
    return { field: s.substring(1), type: '-' };
  } else {
    return { field: s.startsWith('+') ? s.substring(1) : s, type: '+' };
  }
}
export function buildSortFromRequest(req: Request): Sort {
  const s = query(req, resources.sort);
  return buildSort(s);
}
export function renderSort(field: string, sort: Sort): string {
  if (field === sort.field) {
    return sort.type === '-' ? "<i class='sort-down'></i>" : "<i class='sort-up'></i>";
  }
  return et;
}
export function buildSortSearch(search: string, fields: string[], sort: Sort): SortMap {
  search = removeSort(search);
  let sorts: SortMap = {};
  const prefix = search.length > 0 ? '?' + search + '&' : '?';
  for (let i = 0; i < fields.length; i++) {
    sorts[fields[i]] = {
      url: prefix + resources.sort + '=' + getSortString(fields[i], sort),
      tag: renderSort(fields[i], sort),
    };
  }
  return sorts;
}

export function jsonResult<T>(res: Response, result: SearchResult<T>, quick?: boolean, fields?: string[], config?: SearchConfig): void {
  if (quick && fields && fields.length > 0) {
    res.status(200).json(toCsv(fields, result)).end();
  } else {
    res.status(200).json(buildResult(result, config)).end();
  }
}
export function buildResult<T>(r: SearchResult<T>, conf?: SearchConfig): any {
  if (!conf) {
    return r;
  }
  const x: any = {};
  const li = conf.list ? conf.list : 'list';
  x[li] = minimizeArray(r.list);
  const to = conf.total ? conf.total : 'total';
  x[to] = r.total;
  if (r.nextPageToken && r.nextPageToken.length > 0) {
    const t = conf.token ? conf.token : 'token';
    x[t] = r.nextPageToken;
  }
  if (r.last) {
    const l = conf.last ? conf.last : 'last';
    x[l] = r.last;
  }
  return x;
}
export function initializeConfig(conf?: SearchConfig): SearchConfig | undefined {
  if (!conf) {
    return undefined;
  }
  const c: SearchConfig = {
    excluding: conf.excluding,
    fields: conf.fields,
    list: conf.list,
    total: conf.total,
    token: conf.token,
    last: conf.last,
    csv: conf.csv,
    page: conf.page,
    limit: conf.limit,
    skip: conf.skip,
    refId: conf.refId,
    firstLimit: conf.firstLimit,
  };
  if (!c.excluding || c.excluding.length === 0) {
    c.excluding = 'excluding';
  }
  if (!c.fields || c.fields.length === 0) {
    c.fields = 'fields';
  }
  if (!c.list || c.list.length === 0) {
    c.list = 'list';
  }
  if (!c.total || c.total.length === 0) {
    c.total = 'total';
  }
  if (!c.last || c.last.length === 0) {
    c.last = 'last';
  }
  if (!c.token || c.token.length === 0) {
    c.token = 'nextPageToken';
  }
  if (!c.page || c.page.length === 0) {
    c.page = 'page';
  }
  if (!c.limit || c.limit.length === 0) {
    c.limit = 'limit';
  }
  if (!c.skip || c.skip.length === 0) {
    c.skip = 'skip';
  }
  if (!c.refId || c.refId.length === 0) {
    c.refId = 'refId';
  }
  if (!c.firstLimit || c.firstLimit.length === 0) {
    c.firstLimit = 'firstLimit';
  }
  return c;
}
export function fromRequest<S>(req: Request, arr?: string[]): S {
  const s: any = req.method === 'GET' ? fromUrl(req, arr) : req.body;
  return s;
}
export function buildArray(arr?: string[], s0?: string, s1?: string, s2?: string): string[] {
  const r: string[] = [];
  if (arr && arr.length > 0) {
    for (const a of arr) {
      r.push(a);
    }
  }
  if (s0 && s0.length > 0) {
    r.push(s0);
  }
  if (s1 && s1.length > 0) {
    r.push(s1);
  }
  if (s2 && s2.length > 0) {
    r.push(s2);
  }
  return r;
}
export function fromUrl<S>(req: Request, arr?: string[]): S {
  /*
  if (!fields || fields.length === 0) {
    fields = 'fields';
  }
  */
  const s: any = {};
  const obj = req.query;
  const keys = Object.keys(obj);
  for (const key of keys) {
    if (inArray(key, arr)) {
      const x = (obj[key] as string).split(',');
      setValue(s, key, x);
    } else {
      setValue(s, key, obj[key] as string);
    }
  }
  return s;
}
export function inArray(s: string, arr?: string[]): boolean {
  if (!arr || arr.length === 0) {
    return false;
  }
  for (const a of arr) {
    if (s === a) {
      return true;
    }
  }
  return false;
}
/*
export function setValue<T>(obj: T, path: string, value: string): void {
  const paths = path.split('.');
  if (paths.length === 1) {
    obj[path] = value;
  } else {
    let current: any = obj;
    const l = paths.length - 1;
    for (let i = 0; i < l; i++) {
      const sub = paths[i];
      if (!obj[sub]) {
        obj[sub] = {};
      }
      current = obj[sub];
    }
    current[paths[paths.length - 1]] = value;
  }
}
*/
export function setValue<T, V>(o: T, key: string, value: V): any {
  const obj: any = o;
  let replaceKey = key.replace(/\[/g, '.[').replace(/\.\./g, '.');
  if (replaceKey.indexOf('.') === 0) {
    replaceKey = replaceKey.slice(1, replaceKey.length);
  }
  const keys = replaceKey.split('.');
  const firstKey = keys.shift();
  if (!firstKey) {
    return;
  }
  const isArrayKey = /\[([0-9]+)\]/.test(firstKey);
  if (keys.length > 0) {
    const firstKeyValue = obj[firstKey] || {};
    const returnValue = setValue(firstKeyValue, keys.join('.'), value);
    return setKey(obj, isArrayKey, firstKey, returnValue);
  }
  return setKey(obj, isArrayKey, firstKey, value);
}
const setKey = (_object: any, _isArrayKey: boolean, _key: string, _nextValue: any) => {
  if (_isArrayKey) {
    if (_object.length > _key) {
      _object[_key] = _nextValue;
    } else {
      _object.push(_nextValue);
    }
  } else {
    _object[_key] = _nextValue;
  }
  return _object;
};
export interface Limit {
  limit?: number;
  offset?: number;
  nextPageToken?: string;
  fields?: string[];
  offsetOrNextPageToken?: string | number;
}
export function getParameters<T>(obj: T, config?: SearchConfig): Limit {
  const o: any = obj;
  if (!config) {
    const sfield = 'fields';
    let fields;
    const fs = o[sfield];
    if (fs && Array.isArray(fs)) {
      fields = fs;
      delete o[sfield];
    }
    let refId = o['refId'];
    if (!refId) {
      refId = o['nextPageToken'];
    }
    const r: Limit = { fields, nextPageToken: refId };
    let pageSize = o['limit'];
    if (!pageSize) {
      pageSize = o['pageSize'];
    }
    if (pageSize && !isNaN(pageSize)) {
      const ipageSize = Math.floor(parseFloat(pageSize));
      if (ipageSize > 0) {
        r.limit = ipageSize;
        const skip = o['skip'];
        if (skip && !isNaN(skip)) {
          const iskip = Math.floor(parseFloat(skip));
          if (iskip >= 0) {
            r.offset = iskip;
            r.offsetOrNextPageToken = r.offset;
            deletePageInfo(o);
            return r;
          }
        }
        let pageIndex = o['page'];
        if (!pageIndex) {
          pageIndex = o['pageIndex'];
          if (!pageIndex) {
            pageIndex = o['pageNo'];
          }
        }
        if (pageIndex && !isNaN(pageIndex)) {
          let ipageIndex = Math.floor(parseFloat(pageIndex));
          if (ipageIndex < 1) {
            ipageIndex = 1;
          }
          let firstPageSize = o['firstLimit'];
          if (!firstPageSize) {
            firstPageSize = o['firstPageSize'];
          }
          if (!firstPageSize) {
            firstPageSize = o['initPageSize'];
          }
          if (firstPageSize && !isNaN(firstPageSize)) {
            const ifirstPageSize = Math.floor(parseFloat(firstPageSize));
            if (ifirstPageSize > 0) {
              r.offset = ipageSize * (ipageIndex - 2) + ifirstPageSize;
              r.offsetOrNextPageToken = r.offset;
              deletePageInfo(o);
              return r;
            }
          }
          r.offset = ipageSize * (ipageIndex - 1);
          r.offsetOrNextPageToken = r.offset;
          deletePageInfo(o);
          return r;
        }
        r.offset = 0;
        if (r.nextPageToken && r.nextPageToken.length > 0) {
          r.offsetOrNextPageToken = r.nextPageToken;
        }
        deletePageInfo(o);
        return r;
      }
    }
    if (r.nextPageToken && r.nextPageToken.length > 0) {
      r.offsetOrNextPageToken = r.nextPageToken;
    }
    deletePageInfo(o);
    return r;
  } else {
    let sfield = config.fields;
    if (!sfield || sfield.length === 0) {
      sfield = 'fields';
    }
    let fields;
    const fs = o[sfield];
    if (fs && Array.isArray(fs)) {
      fields = fs;
      delete o[sfield];
    }
    let strRefId = config.refId;
    if (!strRefId || strRefId.length === 0) {
      strRefId = 'refId';
    }
    const refId = o[strRefId];
    const r: Limit = { fields, nextPageToken: refId };

    let strLimit = config.limit;
    if (!strLimit || strLimit.length === 0) {
      strLimit = 'limit';
    }
    const pageSize = o[strLimit];
    const arr = [config.page, config.limit, config.skip, config.refId, config.firstLimit];
    if (pageSize && !isNaN(pageSize)) {
      const ipageSize = Math.floor(parseFloat(pageSize));
      if (ipageSize > 0) {
        r.limit = ipageSize;
        let strSkip = config.skip;
        if (!strSkip || strSkip.length === 0) {
          strSkip = 'skip';
        }
        const skip = o[strSkip];
        if (skip && !isNaN(skip)) {
          const iskip = Math.floor(parseFloat(skip));
          if (iskip >= 0) {
            r.offset = iskip;
            r.offsetOrNextPageToken = r.offset;
            deletePageInfo(o, arr);
            return r;
          }
        }
        let strPage = config.page;
        if (!strPage || strPage.length === 0) {
          strPage = 'page';
        }
        const pageIndex = o[strPage];
        if (pageIndex && !isNaN(pageIndex)) {
          let ipageIndex = Math.floor(parseFloat(pageIndex));
          if (ipageIndex < 1) {
            ipageIndex = 1;
          }
          let strFirstLimit = config.firstLimit;
          if (!strFirstLimit || strFirstLimit.length === 0) {
            strFirstLimit = 'firstLimit';
          }
          const firstPageSize = o[strFirstLimit];
          if (firstPageSize && !isNaN(firstPageSize)) {
            const ifirstPageSize = Math.floor(parseFloat(firstPageSize));
            if (ifirstPageSize > 0) {
              r.offset = ipageSize * (ipageIndex - 2) + ifirstPageSize;
              r.offsetOrNextPageToken = r.offset;
              deletePageInfo(o, arr);
              return r;
            }
          }
          r.offset = ipageSize * (ipageIndex - 1);
          r.offsetOrNextPageToken = r.offset;
          deletePageInfo(o, arr);
          return r;
        }
        r.offset = 0;
        if (r.nextPageToken && r.nextPageToken.length > 0) {
          r.offsetOrNextPageToken = r.nextPageToken;
        }
        deletePageInfo(o, arr);
        return r;
      }
    }
    if (r.nextPageToken && r.nextPageToken.length > 0) {
      r.offsetOrNextPageToken = r.nextPageToken;
    }
    deletePageInfo(o, arr);
    return r;
  }
}
// tslint:disable-next-line:array-type
export function deletePageInfo(obj: any, arr?: Array<string | undefined>): void {
  if (!arr || arr.length === 0) {
    delete obj['limit'];
    delete obj['firstLimit'];
    delete obj['skip'];
    delete obj['page'];
    delete obj['pageNo'];
    delete obj['pageIndex'];
    delete obj['pageSize'];
    delete obj['initPageSize'];
    delete obj['firstPageSize'];
    delete obj['refId'];
    delete obj['nextPageToken'];
  } else {
    for (const o of arr) {
      if (o && o.length > 0) {
        delete obj[o];
      }
    }
  }
}
const re = /"/g;
export function toCsv<T>(fields: string[], r: SearchResult<T>): string {
  if (!r || r.list.length === 0) {
    return '0';
  } else {
    const e = '';
    const s = 'string';
    const n = 'number';
    const b = '""';
    const rows: string[] = [];
    rows.push('' + (r.total ? r.total : '') + ',' + (r.nextPageToken ? r.nextPageToken : '') + ',' + (r.last ? '1' : ''));
    for (const item of r.list) {
      const cols: string[] = [];
      for (const name of fields) {
        const v = (item as any)[name];
        if (!v) {
          cols.push(e);
        } else {
          if (typeof v === s) {
            if (s.indexOf(',') >= 0) {
              cols.push('"' + v.replace(re, b) + '"');
            } else {
              cols.push(v);
            }
          } else if (v instanceof Date) {
            cols.push(v.toISOString());
          } else if (typeof v === n) {
            cols.push(v.toString());
          } else {
            cols.push('');
          }
        }
      }
      rows.push(cols.join(','));
    }
    return rows.join('\n');
  }
}

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
  startTime?: Date;
  endTime?: Date;
  min?: Date;
  max?: Date;
  upper?: Date;
}
export interface NumberRange {
  min?: number;
  max?: number;
  lower?: number;
  upper?: number;
}
export interface Metadata {
  dates?: string[];
  numbers?: string[];
}
export function buildMetadata(attributes: Attributes, includeDate?: boolean): Metadata {
  const keys: string[] = Object.keys(attributes);
  const dates: string[] = [];
  const numbers: string[] = [];
  for (const key of keys) {
    const attr: Attribute = attributes[key];
    if (attr.type === 'number' || attr.type === 'integer') {
      numbers.push(key);
    } else if (attr.type === 'datetime' || (includeDate === true && attr.type === 'date')) {
      dates.push(key);
    }
  }
  const m: Metadata = {};
  if (dates.length > 0) {
    m.dates = dates;
  }
  if (numbers.length > 0) {
    m.numbers = numbers;
  }
  return m;
}

const _datereg = '/Date(';
const _re = /-?\d+/;
function toDate(v: any): Date | null | undefined {
  if (!v) {
    return null;
  }
  if (v instanceof Date) {
    return v;
  } else if (typeof v === 'number') {
    return new Date(v);
  }
  const i = v.indexOf(_datereg);
  if (i >= 0) {
    const m = _re.exec(v);
    if (m !== null) {
      const d = parseInt(m[0], 10);
      return new Date(d);
    } else {
      return null;
    }
  } else {
    if (isNaN(v)) {
      return new Date(v);
    } else {
      const d = parseInt(v, 10);
      return new Date(d);
    }
  }
}

export function format<T>(obj: T, dates?: string[], nums?: string[]): T {
  const o: any = obj;
  if (dates && dates.length > 0) {
    for (const s of dates) {
      const v = o[s];
      if (v) {
        if (v instanceof Date) {
          continue;
        }
        if (typeof v === 'string' || typeof v === 'number') {
          const d = toDate(v);
          if (d) {
            if (!(d instanceof Date) || d.toString() === 'Invalid Date') {
              delete o[s];
            } else {
              o[s] = d;
            }
          }
        } else if (typeof v === 'object') {
          const keys = Object.keys(v);
          for (const key of keys) {
            const v2 = v[key];
            if (v2 instanceof Date) {
              continue;
            }
            if (typeof v2 === 'string' || typeof v2 === 'number') {
              const d2 = toDate(v2);
              if (d2) {
                if (!(d2 instanceof Date) || d2.toString() === 'Invalid Date') {
                  delete v[key];
                } else {
                  v[key] = d2;
                }
              }
            }
          }
        }
      }
    }
  }
  if (nums && nums.length > 0) {
    for (const s of nums) {
      const v = o[s];
      if (v) {
        if (v instanceof Date) {
          delete o[s];
          continue;
        }
        if (typeof v === 'number') {
          continue;
        }
        if (typeof v === 'string') {
          if (!isNaN(v as any)) {
            delete o[s];
            continue;
          } else {
            const i = parseFloat(v);
            o[s] = i;
          }
        } else if (typeof v === 'object') {
          const keys = Object.keys(v);
          for (const key of keys) {
            const v2 = v[key];
            if (v2 instanceof Date) {
              delete o[key];
              continue;
            }
            if (typeof v2 === 'number') {
              continue;
            }
            if (typeof v2 === 'string') {
              if (!isNaN(v2 as any)) {
                delete v[key];
              } else {
                const i = parseFloat(v2);
                v[key] = i;
              }
            }
          }
        }
      }
    }
  }
  return o;
}
