import process from 'node:process'
import { program } from 'commander'
import { name, version } from '../package.json'
import {
  defaultConfig,
  initConfigFile,
  resolveConfig,
} from './config'
import { generateTestId } from './index'

program.name(name).version(version)

program
  .command('init')
  .description('init config file')
  .option('-c, --config <config>', 'testid config file path', defaultConfig.configFilePath)
  .action(async (args) => {
    await initConfigFile(args.config)
  })

program
  .option('-s, --src <src>', `tsx file path (default "${defaultConfig.src}")`)
  .option(
    '-o, --output <output>',
    `testid output path (default "${defaultConfig.output}")`,
  )
  .option(
    '-c, --config <config>',
    `testid config path (default "${defaultConfig.configFilePath}")`,
  )
  .action(async (args) => {
    const resolvedConfig = await resolveConfig(args)
    generateTestId(resolvedConfig)
  })

program.parse(process.argv)
