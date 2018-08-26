const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
var serveStatic = require('serve-static');

const json_body_parser = bodyParser.json();
const urlencoded_body_parser = bodyParser.urlencoded({ extended: true });

require('dotenv').config()

app.use(cors());
app.use(json_body_parser);
app.use(urlencoded_body_parser);
app.use(serveStatic(__dirname + "/dist", {'index': ['index.html', 'index.htm']}));

// pool.query(
// 	'CREATE TABLE IF NOT EXISTS giftlist(id SERIAL PRIMARY KEY not null, text varchar(255) not null, exact_name varchar(255) not null, site varchar(60), price float, number varchar(100), link text, ' + 
// 	'image_path text, remark text, booked BOOLEAN not null DEFAULT FALSE, paid BOOLEAN not null DEFAULT FALSE, favorite BOOLEAN not null DEFAULT FALSE, sendmethod varchar(20), buyer VARCHAR(100), multiple int not null DEFAULT 1)',
// 	(err, res) => {
// 		console.log(err, res)
// 	}
// );

// pool.query(
// 	'CREATE TABLE IF NOT EXISTS participants(id SERIAL PRIMARY KEY not null, name varchar(255))',
// 	(err, res) => {
// 		console.log(err, res)
// 	}
// );

// pool.query(
// 	'CREATE TABLE IF NOT EXISTS participants_giftlist(participant_id int REFERENCES participants (id) ON UPDATE CASCADE ON DELETE CASCADE, gift_id int REFERENCES giftlist (id) ON UPDATE CASCADE ON DELETE CASCADE, ' + 
// 	  ' participant_price float not null, CONSTRAINT participant_giftlist_pkey PRIMARY KEY (participant_id, gift_id))',
// 	(err, res) => {
// 		console.log(err, res)
// 	}
// );
// pool.query(
// 	'CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY not null, username VARCHAR(60) not null UNIQUE, password_digest TEXT)',
// 	(err, res) => {
// 		console.log(err, res)
// 	}
// );

// pool.query(
// 	"INSERT into giftlist(text, exact_name, site, price, number, link, image_path, remark, booked, paid) VALUES" + 
// 	"('Lit enfant à tiroirs rouge', 'salut', 'IKEA', 169, '000-000', 'https://www.ikea.com/be/fr/produits/b%C3%A9b%C3%A9s-enfants/b%C3%A9b%C3%A9s/lits-b%C3%A9b%C3%A9s/fritids-stuva-lit-enfant-%C3%A0-tiroirs-rouge-spr-49253185/', 'https://www.ikea.com/be/fr/images/products/fritids-stuva-lit-enfant-%C3%A0-tiroirs-rouge__0587980_pe672865_s4.jpg', '', false, false)",
// 	(err, res) => {
// 		console.log(err, res)
// 		pool.end()
// 	}
// );

const port = 8000;
// register routes
require('./api/index')(app);

app.listen(port, () => {
  console.log('We are live on ' + port);
});