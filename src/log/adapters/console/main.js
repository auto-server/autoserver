import { report } from './report.js'

const logConsole = {
  name: 'console',
  title: 'Console log adapter',
  description:
    'Log adapter printing on the console, meant as a development helper',
  report,
  // Do not report `perf` events as it would be too verbose
}

module.exports = {
  logConsole,
}
