import { promisify } from 'util'
import { stat, readdir, readFile, writeFile } from 'fs'

// TODO: replace with `fs.promises` after dropping support for Node 10
const pStat = promisify(stat)
const pReaddir = promisify(readdir)
const pReadFile = promisify(readFile)
const pWriteFile = promisify(writeFile)

module.exports = {
  pStat,
  pReaddir,
  pReadFile,
  pWriteFile,
}
