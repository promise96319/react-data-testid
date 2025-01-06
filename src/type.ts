export interface TsxFile {
  path: string
  name: string
  code?: string
  transformedCode?: string
}

export type FilePath = string
export type TestId = string
export type TestIdDescription = string
export type TestIds = Record<FilePath, Record<TestId, TestIdDescription>>

export interface CmdConfig {
  // 配置文件路径
  config?: string

  // tsx 路径
  src?: string
  // testid 输出路径
  output?: string
}

export interface FileConfig extends Partial<Omit<CmdConfig, 'config'>> {
  // 排除的 tags
  excludeTags?: string[]
  removeExcludeTags?: boolean
}

export interface Config extends Required<FileConfig> {}
