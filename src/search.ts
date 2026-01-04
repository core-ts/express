import { Request, Response } from "express"
import { minimizeArray, query, queryNumber } from "./http"
import { ViewService } from "./LoadController"
import { Attribute, Attributes } from "./metadata"
import { resources, StringMap } from "./resources"

const et = ""

export interface Filter {
  page?: number
  limit?: number

  fields?: string[]
  sort?: string

  q?: string
}
export interface SearchConfig {
  excluding?: string
  // fields?: string
  list?: string
  total?: string
  token?: string
  last?: string
  csv?: boolean
  // page?: string
  // limit?: string
  // skip?: string
  // refId?: string;
  // firstLimit?: string
}
export interface SearchResult<T> {
  list: T[]
  total?: number
  nextPageToken?: string
  last?: boolean
}

export function getPage<F extends Filter>(req: Request, filter?: F): number {
  if (filter) {
    const v0 = (filter as any)[resources.page]
    if (v0 == undefined) {
      const field = req.query[resources.page]
      const v = field ? field.toString() : undefined
      if (!v || v.length === 0) {
        ;(filter as any)[resources.page] = 1
        return 1
      }
      if (isNaN(v as any)) {
        ;(filter as any)[resources.page] = 1
        return 1
      } else {
        let n = parseFloat(v)
        if (n < 1) {
          n = 1
        }
        ;(filter as any)[resources.page] = n
        return n
      }
    } else if (typeof v0 === "number") {
      if (v0 > 0) {
        return v0
      } else {
        ;(filter as any)[resources.page] = 1
        return 1
      }
    }
  }
  const field = req.query[resources.page]
  const v = field ? field.toString() : undefined
  if (!v || v.length === 0) {
    if (filter) {
      ;(filter as any)[resources.page] = 1
    }
    return 1
  }
  if (isNaN(v as any)) {
    if (filter) {
      ;(filter as any)[resources.page] = 1
    }
    return 1
  }
  let n = parseFloat(v)
  if (n < 1) {
    n = 1
  }
  if (filter) {
    ;(filter as any)[resources.page] = n
  }
  return n
}

export function getLimit<F extends Filter>(req: Request, filter?: F): number {
  if (filter) {
    const v0 = (filter as any)[resources.limit]
    if (v0 == undefined) {
      const field = req.query[resources.limit]
      const v = field ? field.toString() : undefined
      if (!v || v.length === 0) {
        ;(filter as any)[resources.limit] = resources.defaultLimit
        return resources.defaultLimit
      }
      if (isNaN(v as any)) {
        ;(filter as any)[resources.limit] = resources.defaultLimit
        return 1
      } else {
        let n = parseFloat(v)
        if (n < 1) {
          n = resources.defaultLimit
        }
        ;(filter as any)[resources.limit] = n
        return n
      }
    } else if (typeof v0 === "number") {
      if (v0 > 0) {
        return v0
      } else {
        ;(filter as any)[resources.limit] = resources.defaultLimit
        return resources.defaultLimit
      }
    }
  }
  const field = req.query[resources.limit]
  const v = field ? field.toString() : undefined
  if (!v || v.length === 0) {
    if (filter) {
      ;(filter as any)[resources.limit] = resources.defaultLimit
    }
    return resources.defaultLimit
  }
  if (isNaN(v as any)) {
    if (filter) {
      ;(filter as any)[resources.limit] = resources.defaultLimit
    }
    return resources.defaultLimit
  }
  let n = parseFloat(v)
  if (n < 1) {
    n = resources.defaultLimit
  }
  if (filter) {
    ;(filter as any)[resources.limit] = n
  }
  return n
}
export function queryLimit(req: Request): number {
  return queryNumber(req, resources.limit, resources.defaultLimit)
}
export function queryPage<F extends Filter>(req: Request, filter?: F): number {
  const field = req.query[resources.page]
  const v = field ? field.toString() : undefined
  if (!v || v.length === 0) {
    ;(filter as any)[resources.page] = 1
    return 1
  }
  if (isNaN(v as any)) {
    ;(filter as any)[resources.page] = 1
    return 1
  }
  const n = parseFloat(v)
  ;(filter as any)[resources.page] = n
  return n
}
export function getOffset(limit: number, page: number): number {
  const offset = limit * (page - 1)
  return offset < 0 ? 0 : offset
}

export function getPageTotal(pageSize?: number, total?: number): number {
  if (!pageSize || pageSize <= 0) {
    return 1
  } else {
    if (!total) {
      total = 0
    }
    if (total % pageSize === 0) {
      return Math.floor(total / pageSize)
    }
    return Math.floor(total / pageSize + 1)
  }
}
export function formatText(...args: any[]): string {
  let formatted = args[0]
  if (!formatted || formatted === "") {
    return ""
  }
  if (args.length > 1 && Array.isArray(args[1])) {
    const params = args[1]
    for (let i = 0; i < params.length; i++) {
      const regexp = new RegExp("\\{" + i + "\\}", "gi")
      formatted = formatted.replace(regexp, params[i])
    }
  } else {
    for (let i = 1; i < args.length; i++) {
      const regexp = new RegExp("\\{" + (i - 1) + "\\}", "gi")
      formatted = formatted.replace(regexp, args[i])
    }
  }
  return formatted
}
export function buildMessage<T>(resource: StringMap, results: T[], limit: number, page: number | undefined, total?: number): string {
  if (!results || results.length === 0) {
    return resource.msg_no_data_found
  } else {
    if (!page) {
      page = 1
    }
    const fromIndex = (page - 1) * limit + 1
    const toIndex = fromIndex + results.length - 1
    const pageTotal = getPageTotal(limit, total)
    if (pageTotal > 1) {
      const msg2 = formatText(resource.msg_search_result_page_sequence, fromIndex, toIndex, total, page, pageTotal)
      return msg2
    } else {
      const msg3 = formatText(resource.msg_search_result_sequence, fromIndex, toIndex)
      return msg3
    }
  }
}
export function buildPages(pageSize?: number, total?: number): number[] {
  const pageTotal = getPageTotal(pageSize, total)
  if (pageTotal <= 1) {
    return [1]
  }
  const arr: number[] = []
  for (let i = 1; i <= pageTotal; i++) {
    arr.push(i)
  }
  return arr
}

export function hasSearch(req: Request): boolean {
  return req.url.indexOf("?") >= 0
}
export function getSearch(url: string): string {
  const i = url.indexOf("?")
  return i < 0 ? et : url.substring(i + 1)
}
export function getField(search: string, fieldName: string): string {
  let i = search.indexOf(fieldName + "=")
  if (i < 0) {
    return ""
  }
  if (i > 0) {
    if (search.substring(i - 1, 1) != "&") {
      i = search.indexOf("&" + fieldName + "=")
      if (i < 0) {
        return search
      }
      i = i + 1
    }
  }
  const j = search.indexOf("&", i + fieldName.length)
  return j >= 0 ? search.substring(i, j) : search.substring(i)
}
export function removeField(search: string, fieldName: string): string {
  let i = search.indexOf(fieldName + "=")
  if (i < 0) {
    return search
  }
  if (i > 0) {
    if (search.substring(i - 1, 1) != "&") {
      i = search.indexOf("&" + fieldName + "=")
      if (i < 0) {
        return search
      }
      i = i + 1
    }
  }
  const j = search.indexOf("&", i + fieldName.length)
  return j >= 0 ? search.substring(0, i) + search.substring(j + 1) : search.substring(0, i - 1)
}
export function removePage(search: string): string {
  search = removeField(search, resources.page)
  search = removeField(search, resources.partial)
  return search
}
export function buildPageSearch(search: string): string {
  const sr = removePage(search)
  return sr.length == 0 ? sr : "&" + sr
}
export function buildPageSearchFromUrl(url: string): string {
  const search = getSearch(url)
  return buildPageSearch(search)
}
export function removeSort(search: string): string {
  search = removeField(search, resources.sort)
  search = removeField(search, resources.partial)
  return search
}
export interface Sort {
  field?: string
  type?: string
}
export interface SortType {
  url: string
  tag: string
}
export interface SortMap {
  [key: string]: SortType
}
export function getSortString(field: string, sort: Sort): string {
  if (field === sort.field) {
    return sort.type === "-" ? field : "-" + field
  }
  return field
}
export function buildSort(s?: string): Sort {
  if (!s || s.indexOf(",") >= 0) {
    return {} as Sort
  }
  if (s.startsWith("-")) {
    return { field: s.substring(1), type: "-" }
  } else {
    return { field: s.startsWith("+") ? s.substring(1) : s, type: "+" }
  }
}
export function buildSortFromRequest(req: Request): Sort {
  const s = query(req, resources.sort)
  return buildSort(s)
}
export function renderSort(field: string, sort: Sort): string {
  if (field === sort.field) {
    return sort.type === "-" ? "<i class='sort-down'></i>" : "<i class='sort-up'></i>"
  }
  return et
}
export function buildSortSearch(search: string, fields: string[], sortStr?: string): SortMap {
  const sort = buildSort(sortStr)
  search = removeSort(search)
  let sorts: SortMap = {}
  const prefix = search.length > 0 ? "?" + search + "&" : "?"
  for (let i = 0; i < fields.length; i++) {
    sorts[fields[i]] = {
      url: prefix + resources.sort + "=" + getSortString(fields[i], sort),
      tag: renderSort(fields[i], sort),
    }
  }
  return sorts
}
export function clone(obj: any): any {
  if (!obj) {
    return obj
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  if (typeof obj !== "object") {
    return obj
  }
  if (Array.isArray(obj)) {
    const arr = []
    for (const sub of obj) {
      const c = clone(sub)
      arr.push(c)
    }
    return arr
  }
  const x: any = {}
  const keys = Object.keys(obj)
  for (const k of keys) {
    const v = obj[k]
    if (v instanceof Date) {
      x[k] = new Date(v.getTime())
    } else {
      switch (typeof v) {
        case "object":
          x[k] = clone(v)
          break
        default:
          x[k] = v
          break
      }
    }
  }
  return x
}
export function cloneFilter<F extends Filter>(obj: F, limit: number, page: number): F {
  const f = clone(obj)
  if (!obj.hasOwnProperty(resources.page)) {
    ;(obj as any)[resources.page] = page
  }
  if (!obj.hasOwnProperty(resources.limit)) {
    ;(obj as any)[resources.limit] = limit
  }
  return f
}
export function addSequence<T>(list: T[], offset: number, name?: string): T[] {
  const n = name ? name : "sequence"
  const l = list.length
  for (let i = 0; i < l; i++) {
    ;(list[i] as any)[n] = offset + i + 1
  }
  return list
}
export function jsonResult<T>(res: Response, result: SearchResult<T>, quick?: boolean, fields?: string[], config?: SearchConfig): void {
  if (quick && fields && fields.length > 0) {
    res.status(200).json(toCsv(fields, result)).end()
  } else {
    res.status(200).json(buildResult(result, config)).end()
  }
}
export function buildResult<T>(r: SearchResult<T>, conf?: SearchConfig): any {
  if (!conf) {
    return r
  }
  const x: any = {}
  const li = conf.list ? conf.list : "list"
  x[li] = minimizeArray(r.list)
  const to = conf.total ? conf.total : "total"
  x[to] = r.total
  if (r.nextPageToken && r.nextPageToken.length > 0) {
    const t = conf.token ? conf.token : "token"
    x[t] = r.nextPageToken
  }
  if (r.last) {
    const l = conf.last ? conf.last : "last"
    x[l] = r.last
  }
  return x
}
export function initializeConfig(conf?: SearchConfig): SearchConfig | undefined {
  if (!conf) {
    return undefined
  }
  const c: SearchConfig = {
    excluding: conf.excluding,
    list: conf.list,
    total: conf.total,
    token: conf.token,
    last: conf.last,
    csv: conf.csv,
  }
  if (!c.excluding || c.excluding.length === 0) {
    c.excluding = "excluding"
  }
  if (!c.list || c.list.length === 0) {
    c.list = "list"
  }
  if (!c.total || c.total.length === 0) {
    c.total = "total"
  }
  if (!c.last || c.last.length === 0) {
    c.last = "last"
  }
  if (!c.token || c.token.length === 0) {
    c.token = "nextPageToken"
  }
  return c
}
export function fromRequest<S>(req: Request, arr?: string[]): S {
  const s: any = req.method === "GET" ? fromUrl(req, arr) : req.body
  const page = s[resources.page]
  if (page) {
    if (isNaN(page as any)) {
      s[resources.page] = 1
    } else {
      let n = parseFloat(page)
      if (n < 1) {
        n = 1
      }
      s[resources.page] = n
    }
  } else {
    s[resources.page] = 1
  }

  const limit = s[resources.limit]
  if (limit) {
    if (isNaN(page as any)) {
      s[resources.limit] = resources.defaultLimit
    } else {
      let n = parseFloat(limit)
      if (n < 1) {
        n = resources.defaultLimit
      }
      s[resources.page] = n
    }
  } else {
    s[resources.limit] = resources.defaultLimit
  }
  if (resources.partial.length > 0) {
    delete s[resources.partial]
  }
  return s
}
export function buildArray(arr?: string[], s0?: string, s1?: string, s2?: string): string[] {
  const r: string[] = []
  if (arr && arr.length > 0) {
    for (const a of arr) {
      r.push(a)
    }
  }
  if (s0 && s0.length > 0) {
    r.push(s0)
  }
  if (s1 && s1.length > 0) {
    r.push(s1)
  }
  if (s2 && s2.length > 0) {
    r.push(s2)
  }
  return r
}
export function fromUrl<S>(req: Request, arr?: string[]): S {
  /*
  if (!fields || fields.length === 0) {
    fields = 'fields';
  }
  */
  const s: any = {}
  const obj = req.query
  const keys = Object.keys(obj)
  for (const key of keys) {
    if (inArray(key, arr)) {
      const x = (obj[key] as string).split(",")
      setValue(s, key, x)
    } else {
      setValue(s, key, obj[key] as string)
    }
  }
  return s
}
export function inArray(s: string, arr?: string[]): boolean {
  if (!arr || arr.length === 0) {
    return false
  }
  for (const a of arr) {
    if (s === a) {
      return true
    }
  }
  return false
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
  const obj: any = o
  let replaceKey = key.replace(/\[/g, ".[").replace(/\.\./g, ".")
  if (replaceKey.indexOf(".") === 0) {
    replaceKey = replaceKey.slice(1, replaceKey.length)
  }
  const keys = replaceKey.split(".")
  const firstKey = keys.shift()
  if (!firstKey) {
    return
  }
  const isArrayKey = /\[([0-9]+)\]/.test(firstKey)
  if (keys.length > 0) {
    const firstKeyValue = obj[firstKey] || {}
    const returnValue = setValue(firstKeyValue, keys.join("."), value)
    return setKey(obj, isArrayKey, firstKey, returnValue)
  }
  return setKey(obj, isArrayKey, firstKey, value)
}
const setKey = (_object: any, _isArrayKey: boolean, _key: string, _nextValue: any) => {
  if (_isArrayKey) {
    if (_object.length > _key) {
      _object[_key] = _nextValue
    } else {
      _object.push(_nextValue)
    }
  } else {
    _object[_key] = _nextValue
  }
  return _object
}
export interface Limit {
  limit: number
  page?: number
  nextPageToken?: string
  fields?: string[]
  pageOrNextPageToken?: string | number
}
export function getParameters<T>(obj: T, config?: SearchConfig): Limit {
  const o: any = obj
  let fields: string[] | undefined
  const fs = o[resources.fields]
  if (fs && Array.isArray(fs)) {
    fields = fs
  }
  let nextPageToken: string | undefined = o[resources.nextPageToken]
  let page = 1
  let spage = o[resources.page]
  if (spage && typeof spage === "string") {
    if (!isNaN(spage as any)) {
      const ipage = Math.floor(parseFloat(spage))
      if (ipage > 1) {
        page = ipage
      }
    }
  }
  let pageSize = resources.defaultLimit
  let spageSize = o[resources.limit]
  if (spageSize && typeof spageSize === "string") {
    if (!isNaN(spageSize as any)) {
      const ipageSize = Math.floor(parseFloat(spageSize))
      if (ipageSize > 0) {
        pageSize = ipageSize
      }
    }
  }
  const r: Limit = { limit: pageSize, fields, page, nextPageToken, pageOrNextPageToken: page }
  if (r.nextPageToken && r.nextPageToken.length > 0) {
    r.pageOrNextPageToken = r.nextPageToken
  }
  deletePageInfo(o)
  return r
}
// tslint:disable-next-line:array-type
export function deletePageInfo(obj: any, arr?: Array<string | undefined>): void {
  if (!arr || arr.length === 0) {
    delete obj[resources.fields]
    delete obj[resources.limit]
    delete obj[resources.page]
    if (resources.nextPageToken && resources.nextPageToken.length > 0) {
      delete obj[resources.nextPageToken]
    }
    if (resources.partial && resources.partial.length > 0) {
      delete obj[resources.partial]
    }
  } else {
    for (const o of arr) {
      if (o && o.length > 0) {
        delete obj[o]
      }
    }
  }
}
const re = /"/g
export function toCsv<T>(fields: string[], r: SearchResult<T>): string {
  if (!r || r.list.length === 0) {
    return "0"
  } else {
    const e = ""
    const s = "string"
    const n = "number"
    const b = '""'
    const rows: string[] = []
    rows.push("" + (r.total ? r.total : "") + "," + (r.nextPageToken ? r.nextPageToken : "") + "," + (r.last ? "1" : ""))
    for (const item of r.list) {
      const cols: string[] = []
      for (const name of fields) {
        const v = (item as any)[name]
        if (!v) {
          cols.push(e)
        } else {
          if (typeof v === s) {
            if (s.indexOf(",") >= 0) {
              cols.push('"' + v.replace(re, b) + '"')
            } else {
              cols.push(v)
            }
          } else if (v instanceof Date) {
            cols.push(v.toISOString())
          } else if (typeof v === n) {
            cols.push(v.toString())
          } else {
            cols.push("")
          }
        }
      }
      rows.push(cols.join(","))
    }
    return rows.join("\n")
  }
}

export interface DateRange {
  startDate?: Date
  endDate?: Date
  startTime?: Date
  endTime?: Date
  min?: Date
  max?: Date
  upper?: Date
}
export interface NumberRange {
  min?: number
  max?: number
  lower?: number
  upper?: number
}
export interface Metadata {
  dates?: string[]
  numbers?: string[]
}
export function buildMetadata(attributes: Attributes, includeDate?: boolean): Metadata {
  const keys: string[] = Object.keys(attributes)
  const dates: string[] = []
  const numbers: string[] = []
  for (const key of keys) {
    const attr: Attribute = attributes[key]
    if (attr.type === "number" || attr.type === "integer") {
      numbers.push(key)
    } else if (attr.type === "datetime" || (includeDate === true && attr.type === "date")) {
      dates.push(key)
    }
  }
  const m: Metadata = {}
  if (dates.length > 0) {
    m.dates = dates
  }
  if (numbers.length > 0) {
    m.numbers = numbers
  }
  return m
}

const _datereg = "/Date("
const _re = /-?\d+/
function toDate(v: any): Date | null | undefined {
  if (!v) {
    return null
  }
  if (v instanceof Date) {
    return v
  } else if (typeof v === "number") {
    return new Date(v)
  }
  const i = v.indexOf(_datereg)
  if (i >= 0) {
    const m = _re.exec(v)
    if (m !== null) {
      const d = parseInt(m[0], 10)
      return new Date(d)
    } else {
      return null
    }
  } else {
    if (isNaN(v)) {
      return new Date(v)
    } else {
      const d = parseInt(v, 10)
      return new Date(d)
    }
  }
}

export function format<T>(obj: T, dates?: string[], nums?: string[]): T {
  const o: any = obj
  if (dates && dates.length > 0) {
    for (const s of dates) {
      const v = o[s]
      if (v) {
        if (v instanceof Date) {
          continue
        }
        if (typeof v === "string" || typeof v === "number") {
          const d = toDate(v)
          if (d) {
            if (!(d instanceof Date) || d.toString() === "Invalid Date") {
              delete o[s]
            } else {
              o[s] = d
            }
          }
        } else if (typeof v === "object") {
          const keys = Object.keys(v)
          for (const key of keys) {
            const v2 = v[key]
            if (v2 instanceof Date) {
              continue
            }
            if (typeof v2 === "string" || typeof v2 === "number") {
              const d2 = toDate(v2)
              if (d2) {
                if (!(d2 instanceof Date) || d2.toString() === "Invalid Date") {
                  delete v[key]
                } else {
                  v[key] = d2
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
      const v = o[s]
      if (v) {
        if (v instanceof Date) {
          delete o[s]
          continue
        }
        if (typeof v === "number") {
          continue
        }
        if (typeof v === "string") {
          if (!isNaN(v as any)) {
            delete o[s]
            continue
          } else {
            const i = parseFloat(v)
            o[s] = i
          }
        } else if (typeof v === "object") {
          const keys = Object.keys(v)
          for (const key of keys) {
            const v2 = v[key]
            if (v2 instanceof Date) {
              delete o[key]
              continue
            }
            if (typeof v2 === "number") {
              continue
            }
            if (typeof v2 === "string") {
              if (!isNaN(v2 as any)) {
                delete v[key]
              } else {
                const i = parseFloat(v2)
                v[key] = i
              }
            }
          }
        }
      }
    }
  }
  return o
}
export function getMetadataFunc<T, ID>(
  viewService: ViewService<T, ID> | ((id: ID, ctx?: any) => Promise<T>),
  dates?: string[],
  numbers?: string[],
  keys?: Attributes | Attribute[] | string[],
): Metadata | undefined {
  const m: Metadata = { dates, numbers }
  if ((m.dates && m.dates.length > 0) || (m.numbers && m.numbers.length > 0)) {
    return m
  }
  if (keys) {
    if (!Array.isArray(keys)) {
      return buildMetadata(keys)
    }
  }
  if (typeof viewService !== "function" && viewService.metadata) {
    const metadata = viewService.metadata()
    if (metadata) {
      return buildMetadata(metadata)
    }
  }
  return undefined
}
