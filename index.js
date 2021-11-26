const { response } = require('express');
const express = require('express');

const db = require('./db_connection');

const app = express();

const port = process.env.PORT || 5000;

// const port = 5000;

app.use(express.json());
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
  next();
});

app.post('/', (req, res) => {
  db.getFilteredPosts(req.body)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error));
});

app.post('/count', (req, res) => {
  db.getCount(req.body)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error));
});

app.post('/info', (req, res) => {
  db.getInfo(req.body)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error));
});

app.get('/keywords', (req, res) => {
  db.getKeywords()
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error));
});

app.delete('/delete', (req, res) => {
  db.deleteKey(req.body.keyword)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => res.status(500).send(error));
});

app.post('/add', (req, res) => {
  db.addNewKey(req.body.keyword)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => res.status(500).send(error));
});

app.post('/line', (req, res) => {
  db.getDataForLineChart(req.body)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => res.status(500).send(error));
});

app.post('/bar', (req, res) => {
  db.getDataForBarChart(req.body)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => res.status(500).send(error));
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
