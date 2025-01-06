import { red, yellow } from 'kolorist'
import { name } from '../package.json'

export function log(msg: any, ...args: any[]) {
  // eslint-disable-next-line no-console
  console.log(`[${name}]: ${msg}`, ...args)
}

export function warn(msg: any, ...args: any[]) {
  console.warn(yellow(`[${name} warning]: ${msg}`), ...args.map(arg => yellow(arg)))
}

export function error(msg: any, ...args: any[]) {
  console.error(red(`[${name} error]: ${msg}`), ...args.map(arg => red(arg)))
}

log.warn = warn
log.error = error

export default log
