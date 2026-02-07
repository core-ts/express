import { Response } from "express"
import { handleError } from "./http"
import { Attribute, ErrorMessage } from "./metadata"
/*
export interface StatusConfig {
  duplicate_key: number|string;
  not_found: number|string;
  success: number|string;
  version_error?: number|string;
  validation_error: number|string;
  error?: number|string;
}
export interface ResultInfo<T> {
  status: number|string;
  errors?: ErrorMessage[];
  value?: T;
  message?: string;
}
export function initializeStatus(s?: StatusConfig): StatusConfig {
  if (s) {
    return s;
  }
  const s1: StatusConfig = {
    duplicate_key: 0,
    not_found: 0,
    success: 1,
    version_error: 2,
    validation_error: 4,
    error: 4
  };
  return s1;
}
*/
export function checkId<T, ID>(obj: T, id: ID, keys?: Attribute[]): boolean {
  const n: string = keys && keys.length === 1 && keys[0].name ? keys[0].name : "id"
  const o: any = obj
  const i: any = id
  if (!keys || keys.length === 1) {
    const v = o[n]
    if (!v) {
      o[n] = i
      return true
    }
    // tslint:disable-next-line:triple-equals
    if (v != i) {
      return false
    }
    return true
  }
  const ks = Object.keys(i)
  for (const k of ks) {
    const v = o[k]
    if (!v) {
      o[k] = i[k]
    } else {
      // tslint:disable-next-line:triple-equals
      if (v != i[k]) {
        return false
      }
    }
    o[k] = i[k]
  }
  return true
}
export function create<T>(res: Response, obj: T, insert: (obj: T, ctx?: any) => Promise<number | T | ErrorMessage[]>, returnNumber?: boolean): void {
  insert(obj)
    .then((result) => {
      if (typeof result === "number") {
        if (result >= 1) {
          res
            .status(201)
            .json(returnNumber ? result : obj)
            .end()
        } else {
          res.status(409).json(result).end()
        }
      } else if (Array.isArray(result)) {
        res.status(422).json(result).end()
      } else {
        res
          .status(201)
          .json(returnNumber ? result : obj)
          .end()
      }
    })
    .catch((err) => handleError(err, res))
}
export function update<T>(res: Response, obj: T, save: (obj: T, ctx?: any) => Promise<number | T | ErrorMessage[]>, returnNumber?: boolean): void {
  save(obj)
    .then((result) => {
      if (typeof result === "number") {
        if (result >= 1) {
          res
            .status(200)
            .json(returnNumber ? result : obj)
            .end()
        } else if (result === 0) {
          res.status(404).json(result).end()
        } else {
          res.status(409).json(result).end()
        }
      } else if (Array.isArray(result)) {
        res.status(422).json(result).end()
      } else {
        res
          .status(200)
          .json(returnNumber ? result : obj)
          .end()
      }
    })
    .catch((err) => handleError(err, res))
}
export function isTypeError(errs: ErrorMessage[]): boolean {
  if (!errs) {
    return false
  }
  for (const err of errs) {
    const c = err.code
    if (
      c === "type" ||
      c === "string" ||
      c === "number" ||
      c === "date" ||
      c === "boolean" ||
      c === "strings" ||
      c === "numbers" ||
      c === "integers" ||
      c === "dates" ||
      c === "datetimes" ||
      c === "booleans"
    ) {
      return true
    }
  }
  return false
}
export function getStatusCode(errs: ErrorMessage[]): number {
  return isTypeError(errs) ? 400 : 422
}
export function respondError(res: Response, errors: ErrorMessage[]) {
  res.status(getStatusCode(errors)).json(errors).end()
}
