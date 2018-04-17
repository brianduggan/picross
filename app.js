//******** MODULES AND MIDDLEWARE ********//
var express         = require('express'),
    app             = express(),
    path            = require('path')
    bodyParser      = require('body-parser'),
    cookieParser    = require('cookie-parser'),
    morgan          = require('morgan'),
    mongoose        = require('mongoose'),
    mongoPath       = process.env.MONGOLAB_URI || 'mongodb://localhost/picross'


mongoose.connect(mongoPath);

require('dotenv').config();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(morgan('combined'))

// Later on will be used for setting up user auth
// var loadUser = require('./middleware/loadUser');
// app.use(loadUser);

//******** ROUTES ********//

app.get('/', function(req, res){
    res.render('index');
});

app.get('/creator', function(req,res){
    res.render('creator');
})

//******** LISTENING @ ********//

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('listening on port '+ port);
});
