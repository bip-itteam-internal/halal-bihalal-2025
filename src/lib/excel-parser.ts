import * as XLSX from 'xlsx'

type SheetCell = string | number | boolean | Date | null

export type ExcelRow = Record<string, SheetCell>

export interface ExcelParseOptions {
  sheetName?: string
  headerRowIndex?: number
}

export interface ExcelParseResult<T extends ExcelRow = ExcelRow> {
  sheetName: string
  headers: string[]
  rows: T[]
}

function normalizeHeader(value: unknown, index: number) {
  const text = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return text || `column_${index + 1}`
}

function parseFromWorksheet<T extends ExcelRow = ExcelRow>(
  worksheet: XLSX.WorkSheet,
  options: ExcelParseOptions = {},
) {
  const headerRowIndex = options.headerRowIndex ?? 0
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: null,
    blankrows: false,
    raw: false,
  })

  if (matrix.length === 0) {
    return {
      headers: [],
      rows: [],
    } as Pick<ExcelParseResult<T>, 'headers' | 'rows'>
  }

  const rawHeaders = matrix[headerRowIndex] ?? []
  const headers = rawHeaders.map((value, index) => normalizeHeader(value, index))
  const rows = matrix.slice(headerRowIndex + 1).map((cells) => {
    const row: ExcelRow = {}
    headers.forEach((header, index) => {
      row[header] = (cells?.[index] as SheetCell) ?? null
    })
    return row as T
  })

  return { headers, rows }
}

export function parseExcelArrayBuffer<T extends ExcelRow = ExcelRow>(
  input: ArrayBuffer,
  options: ExcelParseOptions = {},
): ExcelParseResult<T> {
  const workbook = XLSX.read(input, { type: 'array', cellDates: true })
  const targetSheetName = options.sheetName ?? workbook.SheetNames[0]

  if (!targetSheetName) {
    return {
      sheetName: '',
      headers: [],
      rows: [],
    }
  }

  const worksheet = workbook.Sheets[targetSheetName]
  if (!worksheet) {
    throw new Error(`Sheet "${targetSheetName}" tidak ditemukan.`)
  }

  const { headers, rows } = parseFromWorksheet<T>(worksheet, options)
  return {
    sheetName: targetSheetName,
    headers,
    rows,
  }
}

export async function parseExcelFile<T extends ExcelRow = ExcelRow>(
  file: File,
  options: ExcelParseOptions = {},
) {
  const buffer = await file.arrayBuffer()
  return parseExcelArrayBuffer<T>(buffer, options)
}

export function parseExcelBuffer<T extends ExcelRow = ExcelRow>(
  input: Buffer,
  options: ExcelParseOptions = {},
) {
  const arrayBuffer = input.buffer.slice(
    input.byteOffset,
    input.byteOffset + input.byteLength,
  ) as ArrayBuffer

  return parseExcelArrayBuffer<T>(arrayBuffer, options)
}
