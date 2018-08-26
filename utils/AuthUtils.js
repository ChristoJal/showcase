const db = require('../db')
const bcrypt = require('bcrypt')

const isAuthenticated = async (req, res, next) => {
  console.log(req.body)
  if(!req.body.username || !req.body.password){
    res.status(400).end()
    return
  }
  const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [req.body.username])
  if(!rows || !rows.length) {
    res.status(401).end()
    return
  }

  try {
    await checkPassword(req.body.password, rows[0]);
    next();
  }
  catch(err) {
    console.log(err)
    res.status(401).end()
    return
  }
}
const hashPassword = (password) => {
  return new Promise((resolve, reject) =>
    bcrypt.hash(password, 10, (err, hash) => {
      err ? reject(err) : resolve(hash)
  }))
}


const checkPassword = (reqPassword, foundUser) => {
  return new Promise((resolve, reject) =>
    bcrypt.compare(reqPassword, foundUser.password_digest, (err, response) => {
        if (err) {
          reject(err)
        }
        else if (response) {
          resolve(response)
        } else {
          reject(new Error('Passwords do not match.'))
        }
    })
  )
}

module.exports = {
  isAuthenticated
}