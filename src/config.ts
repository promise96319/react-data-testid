import { readFile, writeFile } from 'node:fs/promises'
import { CmdConfig, Config, FileConfig } from './type'

export const defaultConfig: Required<CmdConfig> = {
  src: 'src/**/*.tsx',
  output: '.testid.json',
  config: '.testidrc',
}

export const defaultFileConfig: Required<Omit<FileConfig, 'src' | 'output'>> = {
  excludeTags: [
    // design
    'Collapse.Item',
    'Form.Item',
    'Table.Column',
    'Tabs.Item',
    'Tag',
    'Typography',

    'ConfigProvider',
    'ConfigContext.Provider',
    'ConfigContext.Consumer',

    // ui
    'UiConditionSearch.Field',
    'UiConditionSearch.Logic',

    'UiFilter.Select',
    'UiFilter.Input',
    'UiFilter.Date',
    'UiFilter.Number',
    'UiFilter.Cascader',

    'UiSearch.Input',
    'UiSearch.Select',
    'UiSearch.Date',
    'UiSearch.Custom',
    'UiSearch.Tree',
    'UiSearch.Cascader',

    'UiTable.Column',

    'UiGrid.Item',

    'UiTag',
  ],
  removeExcludeTags: false,
}

export const readConfigFile = async (
  configPath: string,
): Promise<FileConfig> => {
  try {
    const text = await readFile(configPath, 'utf-8')
    return JSON.parse(text)
  } catch (e) {
    return {}
  }
}

export const initConfigFile = async (configPath: string) => {
  try {
    const { config, ...restCmdConfig } = defaultConfig
    await writeFile(
      configPath,
      JSON.stringify({ ...restCmdConfig, ...defaultFileConfig }, null, 2),
      'utf-8',
    )
  } catch (e) {
    return
  }
}

export const resolveConfig = async (cmdConfig: CmdConfig): Promise<Config> => {
  const fileConfigPath = cmdConfig.config ?? defaultConfig.config
  const fileConfig = await readConfigFile(fileConfigPath)

  const mergedFileConfig = {
    ...defaultFileConfig,
    ...defaultConfig,
    ...fileConfig,
    ...cmdConfig,
  }

  return mergedFileConfig
}
