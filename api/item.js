const db = require('../db')
const Auth = require('../utils/AuthUtils')
module.exports =  function(app) {
    app.get('/gift', async (req, res) => {
        let rs = null
        let count = null
        if(req.query.count){
          let rs = await db.query('SELECT COUNT(id) AS count FROM giftlist');  
          count = {count: rs['rows'][0].count}
        }
        const args = [req.query.orderlimit || 20, req.query.offset || 0]
        rs = await db.query(`SELECT G.*, G.price*COALESCE(G.multiple, 1) AS multiplePrice, SUM(PG.participant_price) AS total_paid FROM giftlist G LEFT JOIN participants_giftlist PG ON PG.gift_id = G.id WHERE G.paid = FALSE GROUP BY G.id ORDER BY booked, favorite DESC, ${(req.query.orderBy || 'text') + ' ' +  (req.query.orderType || 'asc')} LIMIT $1 OFFSET $2`, args);
        res.status(200).json(Object.assign({gifts: rs['rows']}, count || null)).end()
    });
    app.get('/gift/paid', async (req, res) => {
        const args = [req.query.limit || 20, req.query.offset || 0]
        const rs = await db.query('SELECT G.* FROM giftlist G WHERE G.paid = TRUE ORDER BY favorite DESC, text LIMIT $1 OFFSET $2', args);
        res.status(200).json(Object.assign({gifts: rs['rows']})).end()
    });
    app.put('/gift/book', Auth.isAuthenticated, async (req, res) => {
        if(!req.body.id) {
            res.status(400)
            return
        }
        const rs = await db.query('SELECT * from giftlist SET WHERE id = $1', [req.body.id]);
        if(!rs || !rs.rowCount){
            res.statusMessage = `L'objet ${req.body.id} n'existe pas`
            res.status(404).end()
            return
        }
        const item = rs.rows[0];
        if(item.booked) {
            res.statusMessage = `${item.text} est déjà réservé`
            res.status(400).end()
            return
        }
        let { rows } = await db.query('SELECT SUM(participant_price) AS total_paid FROM participants_giftlist WHERE gift_id = $1', [req.body.id]);
        let remainingPrice = (((item.multiple || 1) * item.price) - rows[0].total_paid).toFixed(2)
        if(remainingPrice < item.price) {
            return (async () => {       
                try {
                  await db.query('BEGIN')
                  let { rows } = await db.query('INSERT INTO participants(name) VALUES($1) RETURNING id', [req.body.buyer])
                  await db.query('INSERT INTO participants_giftlist VALUES($1, $2, $3)', [rows[0].id, req.body.id, remainingPrice])
                  await db.query('UPDATE giftlist SET booked = true WHERE id= $1', [req.body.id]);
                  await db.query('COMMIT')
                  res.statusMessage = `Votre participation de ${remainingPrice} euros pour "${item.text}" est bien été enregistrée, merci beaucoup !`
                  res.status(200).end()
                  return
                } catch (e) {
                  await db.query('ROLLBACK')
                  console.log(e);
                  throw e
                } finally {
                  // db.release()
                }
              })().catch(e => {res.status(500).end(); console.error(e.stack)})
        }

        const result = await db.query('UPDATE giftlist SET booked=true, buyer=$2, sendMethod=$3 WHERE id=$1', [item.id, req.body.buyer, req.body.sendmethod]);
        if(result) {
            res.statusMessage = `${item.text} à bien été reservé par ${item.buyer} type d'envoi ${item.sendmethod}`
            res.status(200).end()
            return
        }
        res.status(500).end()
    })
    app.put('/gift/participation', Auth.isAuthenticated, async (req, res) => {
        if(!req.body.id || !req.body.amount || !req.body.participant) {
            res.status(400).end()
            return
        }
        let rs = await db.query('SELECT * from giftlist SET WHERE id = $1', [req.body.id]);
        if(!rs || !rs.rowCount){
            res.statusMessage = `L'objet ${req.body.id} n'existe pas`
            res.status(404).end()
            return
        }
        const item = rs.rows[0]
        if(item.booked) {
            res.statusMessage = `${item.name} était déjà réservé`
            res.status(400).end()
            return
        }
        let { rows } = await db.query('SELECT SUM(participant_price) AS total_paid FROM participants_giftlist WHERE gift_id = $1', [req.body.id]);
        let remainingPrice = (((item.multiple || 1) * item.price) - rows[0].total_paid).toFixed(2)
        const amount = parseFloat(req.body.amount).toFixed(2);
        if(remainingPrice - amount < 0) {
          res.statusMessage = `Le montant ${amount} est plus élevé que le prix restant ${remainingPrice}`
          res.status(400).end()
          return
        }
        (async () => {       
            try {
              let booked = false;  
              await db.query('BEGIN')
              let { rows } = await db.query('INSERT INTO participants(name) VALUES($1) RETURNING id', [req.body.participant])
              await db.query('INSERT INTO participants_giftlist VALUES($1, $2, $3)', [rows[0].id, req.body.id, amount])
              if(remainingPrice <= amount) {
                await db.query('UPDATE giftlist SET booked = true WHERE id= $1', [req.body.id]);
                booked = true;
              }
              await db.query('COMMIT')
              res.statusMessage = `Votre participation de ${amount} euros pour "${item.text}" est bien été enregistrée, merci beaucoup !`
              res.status(200).json({'amount_paid': parseFloat(amount).toFixed(2), booked }).end()
              return
            } catch (e) {
              await db.query('ROLLBACK')
              console.log(e);
              throw e
            } finally {
              // db.release()
            }
          })().catch(e => {res.status(500).end(); console.error(e.stack)})
    })
};