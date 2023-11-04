// variables 

let express = require('express');
let app = express();
require('dotenv').config();

// middleware 

app.use(express.static('public'));
app.use(express.json());

// api id route
app.get('/apiid', (req, res) => {
    res.send(process.env.ID);
});

// api secret route
app.get('/apisecret', (req, res) => {
    res.send(process.env.SECRET);
});


// Load sever on port 3000

let port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}.....`));