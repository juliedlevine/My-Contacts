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
    db.any(`Select * from contact order by name`)
        .then(result => resp.json(result))
        .catch(next);
})

// Add new contact to database and return all the info about that contact, send over to front end so front end can update the state.
app.post('/api/contacts', (req, resp, next) => {
    let data = req.body;
    db.one(`insert into contact values (default, $1, $2, $3, $4, $5) returning *`, [data.name, data.phone, data.email, data.type, data.favorite])
        .then(result => resp.json(result))
        .catch(next);
})

app.delete('/api/contact/:id', (req, resp, next) => {
    let id = req.params.id;
    db.one(`delete from contact where id = $1 returning id`, id)
        .then(result => resp.json(result))
        .catch(next);
})

app.put('/api/contact/:id', (req, resp, next) => {
    let id = req.params.id;
    let data = req.body;
    db.one(`update contact set name = $1, phone = $2, email = $3, type=$4, favorite = $5 where id = $6 returning *`, [data.name, data.phone, data.email, data.type, data.favorite, id])
        .then(result => resp.json(result))
        .catch(next);
})

// Start server
app.listen(5000, function() {
    console.log('Contacts app listening on port 5000!');
});
