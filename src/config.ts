import { readFile, writeFile } from 'node:fs/promises'
import type { CmdConfig, Config, FileConfig } from './type'
import log from './logger'

export const defaultConfig: Required<CmdConfig> = {
  src: 'src/**/*.tsx',
  output: '.testid.json',
  config: '.testidrc',
}

export const defaultFileConfig: Required<Omit<FileConfig, 'src' | 'output'>> = {
  excludeTags: [],
  removeExcludeTags: false,
}

export async function readConfigFile(configPath: string): Promise<FileConfig> {
  try {
    const text = await readFile(configPath, 'utf-8')
    return JSON.parse(text)
  }
  catch (e) {
    log.error(`read config file failed: ${configPath}, `, e)
    return {}
  }
}

export async function initConfigFile(configPath: string) {
  try {
    const { config, ...restCmdConfig } = defaultConfig
    await writeFile(
      configPath,
      JSON.stringify({ ...restCmdConfig, ...defaultFileConfig }, null, 2),
      'utf-8',
    )
  }
  catch (e) {
    log.error(`init config file failed: ${configPath}, `, e)
  }
}

export async function resolveConfig(cmdConfig: CmdConfig): Promise<Config> {
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
