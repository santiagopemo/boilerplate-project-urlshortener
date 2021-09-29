require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(mongoose.connection.readyState);
const {Schema} = mongoose;

const urlSchema = new Schema({
  url: {type: String, required: true}
});

const Url = mongoose.model('Url', urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  dns.lookup(urlParser.parse(req.body.url).hostname, (error, address) => {
    if (!address) {
      res.json({error: 'invalid url'});
    } else {
      const url = new Url({url: req.body.url});
      url.save(function(err, data) {
        res.json({
          original_url: data.url,
          short_url: data.id
        })
      });
    }
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  const id = req.params.id;
  Url.findById(id, (err, data) => {
    if (err) {
      res.json({error: 'invalid url'});
    } else {
      res.redirect(data.url);
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
