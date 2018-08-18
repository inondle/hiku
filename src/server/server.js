const express = require( 'express' );
const config = require( './config' );
const path = require( 'path' );
const app = express();

app.use( express.static( config.STATIC_ROOT ) );
app.use( express.json() );


// serves up main page.
app.get( '/', ( req, res ) => res.sendFile( path.join( config.STATIC_ROOT, 'main.js' ) ) )

// registers a new user
app.post( '/register', ( req, res ) => {
	// TODO: implement me
	res.json( { success: true } );
} );

// gets all messages, should be paginated so client doesn't get clobbered
app.get( '/message/all', ( req, res ) => {
	// Return some dummy data for now
	res.json( {
		messages: [ {
			author: 'a',
			message: 'asdf'
		},
		{
			author: 'b',
			message: 'fdsa'
		},
		{
			author: 'c',
			message: ';lkj'
		} ]
	} );
} );

// post a new message, should do haiku validation here, save to new model and return success / failure.
app.post( '/message', ( req, res ) => {
	var newMessage = req.body.message;
	console.log( "Received new message: " + newMessage );
	res.json( { success: true } );
} );

app.listen( config.PORT, () => console.log( 'Hiku server listening on port ' + config.PORT ) );