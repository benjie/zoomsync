export function red(text: string) {
  return `\x1b[31m${text}\x1b[0m`;
}
export function blue(text: string) {
  return `\x1b[34m${text}\x1b[0m`;
}
export const INFO = `[ ${blue(`INFO`)} ] `;
export const WARN = `[ ${red(`WARN`)} ] `;
