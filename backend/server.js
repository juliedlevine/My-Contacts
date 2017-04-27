/*jshint esversion: 6 */
const express = require('express');
const app = express();
var pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const db = pgp({database: 'contacts'});
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());

// Get all contacts from database and send over to front end
app.get('/api/contacts', (req, resp, next) => {
    db.any(`Select * from contact`)
        .then(result => resp.json(result))
        .catch(next);
})

app.post('/api/contacts', (req, resp, next) => {
    let data = req.body;
    db.one(`insert into contact values (default, $1, $2, $3, $4, $5) returning *`, [data.name, data.phone, data.email, data.type, data.favorite])
        .then(result => resp.json(result))
        .catch(next);
})

app.post('/api/delete', (req, resp, next) => {
    let id = req.body.id;
    db.one(`delete from contact where id = $1 returning id`, id)
        .then(result => resp.json(result))
        .catch(next);
})

// Start server
app.listen(5000, function() {
    console.log('Contacts app listening on port 5000!');
});
