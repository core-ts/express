export type Type =
  | "ObjectId"
  | "date"
  | "datetime"
  | "time"
  | "boolean"
  | "number"
  | "integer"
  | "string"
  | "text"
  | "object"
  | "array"
  | "binary"
  | "primitives"
  | "booleans"
  | "numbers"
  | "integers"
  | "strings"
  | "dates"
  | "datetimes"
  | "times"
export type Format = "currency" | "percentage" | "email" | "url" | "phone" | "fax" | "ipv4" | "ipv6"

export type DataType = Type
export type FormatType = Format
export interface ErrorMessage {
  field: string
  code: string
  message?: string
  param?: string | number | Date
  invalid?: string
}

export interface Model {
  attributes: Attributes
}

export interface Attribute {
  name?: string
  type?: Type
  key?: boolean
}
export interface Attributes {
  [key: string]: Attribute
}
