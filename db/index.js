const { Pool } = require('pg')

const pool = new Pool({
	connectionString: 'postgresql://postgres:test@localhost:5432/naissance',
	max: 10,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
})

module.exports = {
    query: (text, params, callback) => {
      return pool.query(text, params, callback)
    }
}