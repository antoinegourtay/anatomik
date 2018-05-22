const express = require('express'),
  path = require('path'),
  port = normalizePort(process.env.PORT || '3000'),
  favicon = require('serve-favicon'),
  morgan = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  mongoose = require('mongoose'),
  app = express(),
  server = app.listen(port),
  io = require('socket.io').listen(server),
  debug = require('debug')('anatomik-webapp:server'),
  routes = require('./routes/index'),
  connext_flash = require('connect-flash'),
  flash = require('express-flash'),

  configDB = require('./config/database.json'),

  userModel = mongoose.model('Users'),
  OfferModel = require('./models/Offer'),
  AssociationModel = require('./models/Association'),
  ServiceModel = require('./models/Service'),
  EtablissementModel = require('./models/Etablissement'),
  EntrepriseModel = require('./models/Entreprise');


require('./config/passport')(passport);
mongoose.Promise = require('bluebird');

app.set('port', port);
app.use(flash());
/**
 * Listen on provided port, on all network interfaces.
 */


server.on('error', onError);
server.on('listening', onListening);
/**
 * Normalize a port into a number, string, or false.
 */

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

mongoose.Promise = global.Promise;
// mongoose.connect("mongodb://localhost:27017/anatomik-dev");
//Database connection
mongoose.connect(configDB.production)
  .catch(err => {
    console.log(err);
  });

app.use(session({
  secret: 'jonsnowknowsnothing',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(userModel.authenticate()));
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50MB'
}));

app.use(morgan('dev'));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//   extended: true
// }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
  debug('Listening on ' + bind);
}