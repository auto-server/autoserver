import { MongoClient } from 'mongodb'

// Starts connection
const connect = async function({
  options: { hostname, port, username, password, dbname, opts },
}) {
  const host = getHost({ hostname, port })
  const auth = getAuth({ username, password })
  const url = `mongodb://${auth}${host}/${dbname}`

  const mongoClient = new MongoClient()
  const db = await mongoClient.connect(url, opts)
  return db
}

// MongoDB can connect to several replicas or mongos at once
// which looks like: `HOST:PORT,HOST2:PORT2,...`
const getHost = function({ hostname, port }) {
  const hostnameA = Array.isArray(hostname) ? hostname : [hostname]
  const portA = Array.isArray(port) ? port : [port]

  const { hostname: hostnameB, port: portB } = fixHostLength({
    hostname: hostnameA,
    port: portA,
  })

  return hostnameB
    .map((hostnameC, index) => `${hostnameC}:${portB[index]}`)
    .join(',')
}

const fixHostLength = function({ hostname, port }) {
  if (hostname.length === port.length) {
    return { hostname, port }
  }

  if (hostname.length === 1) {
    return {
      hostname: new Array(port.length).fill(hostname),
      port,
    }
  }

  if (port.length === 1) {
    return {
      hostname,
      port: new Array(hostname.length).fill(port),
    }
  }

  throw new Error(
    "Invalid options: 'databases.mongodb.hostname' and 'databases.mongodb.port' must have the same number of items",
  )
}

// Retrieve `username:password@`
const getAuth = function({ username, password }) {
  if (!username && !password) {
    return ''
  }

  validateAuth({ username, password })

  return `${username}:${password}@`
}

const validateAuth = function({ username, password }) {
  if (!username) {
    throw new Error(
      "Invalid option 'databases.mongodb.password': 'databases.mongodb.username' must also be defined",
    )
  }

  if (!password) {
    throw new Error(
      "Invalid option 'databases.mongodb.username': 'databases.mongodb.password' must also be defined",
    )
  }
}

module.exports = {
  connect,
}
