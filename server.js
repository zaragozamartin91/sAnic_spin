/**
 * Module dependencies.
 */
const express = require('express')
const path = require('path');

const app = module.exports = express();

// Path to our public directory

app.use(express.static(path.join(__dirname, 'public')));

// Without this you would need to
// supply the extension to res.render()
// ex: res.render('users.html').
app.set('view engine', 'html');


/* istanbul ignore next */
const port = process.env.PORT || 8080
app.listen(port);
console.log('Express started on port ', port);
