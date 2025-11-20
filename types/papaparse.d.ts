declare module 'papaparse' {
  export interface ParseMeta {
    delimiter: string
    linebreak: string
    aborted: boolean
    truncated: boolean
    cursor: number
    fields?: string[]
  }

  export interface ParseError {
    code: string
    message: string
    row: number
  }

  export interface ParseResult<T> {
    data: T[]
    errors: ParseError[]
    meta: ParseMeta
  }

  export interface ParseConfig<T> {
    delimiter?: string
    newline?: string
    quoteChar?: string
    escapeChar?: string
    header?: boolean
    transformHeader?: (header: string, index: number) => string
    dynamicTyping?: boolean | Record<string, boolean>
    preview?: number
    encoding?: string
    worker?: boolean
    comments?: false | string
    download?: boolean
    skipEmptyLines?: boolean | 'greedy'
    delimitersToGuess?: string[]
    complete?: (results: ParseResult<T>) => void
    error?: (error: ParseError) => void
  }

  const Papa: {
    parse<T = any>(input: string, config?: ParseConfig<T>): ParseResult<T> | void
  }

  export default Papa
}

