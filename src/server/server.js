const express = require( 'express' );
const config = require( './config' );
const wireUpControllers = require('./controllers');
const app = express();

app.use( express.static( config.STATIC_ROOT ) );
app.use( express.json() );

wireUpControllers(app);

app.listen( config.PORT, () => console.log( 'Hiku server listening on port ' + config.PORT ) );