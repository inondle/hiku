const path = require( 'path' );
const _ = require( 'lodash' );
const config = require( './config' );
const { User, Message } = require( './models' );
const {asyncValidateHaiku, getSyllableCount} = require( './asyncValidateHaiku' );
const SSE = require( 'express-sse' );
const sse = new SSE();

function wireUpControllers( app ) {

	// serves up main page.
	app.get( '/', ( req, res ) => res.sendFile( path.join( config.STATIC_ROOT, 'main.js' ) ) )
	app.get( '/stream', sse.init );

	// registers a new user
	app.post( '/register', ( req, res ) => {
		// TODO: Add user validation / finding	
		User.findOrCreate( { where: { username: req.body.username } } )
			// response is an array of [{User}, wasCreated (boolean)]
			.then( ( response ) => {
				var newUser = response[ 0 ];
				res.json( { user: newUser, success: true } );
				sse.send( newUser, 'NEW_USER' );
			}, ( e ) => logErrorAndRespondWithJson( res, e ) );
	} );

	// gets all messages, should be paginated so client doesn't get clobbered
	app.get( '/message/all', ( req, res ) => {
		Message.findAll()
			.then( ( messages ) => {
				// TODO: Optimize this call. As it's implemented now, it's very wasteful

				// resolve all the author names for each message
				var authorResolutionPromises = messages.map( ( m, i ) => {
					return m.getAuthor().then( ( author ) => messages[ i ].author = author.username );
				} );

				Promise.all( authorResolutionPromises ).then(
					() => {
						res.json( messages.map( function ( m ) {
							return { id: m.id, text: m.text, author: m.author };
						} ) );
					},
					( e ) => logErrorAndRespondWithJson( res, e )
				);
			}, ( e ) => logErrorAndRespondWithJson( res, e ) );
	} );

	// post a new message, should do haiku validation here, save to new model and return success / failure.
	app.post( '/message', ( req, res ) => {
		var text = req.body.text,
			authorName = req.body.author;

		var poem = text.trim();

		asyncValidateHaiku( poem ).then( () => {
			User.findOne( { where: { username: authorName } } )
				.then(
					( author ) => createMessageWithAuthor( res, text, author ),
					( e ) => logErrorAndRespondWithJson( res, e )
				);
		}, (e) => {
			if(e instanceof Error) {
				// code broke...
				console.error(e);
				throw e;
			} else {
				console.log( 'Not a Haiku: ' + text );
				console.log( 'reason: ' + e.reason );
				res.json( Object.assign( {}, { success: false, failedValidation: true }, e ) );
			}
		} ).catch(function(e) {console.error(e)});
	} );
}

function createMessageWithAuthor( res, messageText, author ) {
	if ( !author ) {
		console.error( "Cannot create new message with no author." );
		return;
	}

	return Message.create( { text: messageText, authorId: author.id } )
		.then(
			( response ) => {
				res.json( { message: response, success: true } );

				// Client wants the whole user object attached to the author property
				var clientData = { id: response.id, author: author.username, text: response.text };
				sse.send( clientData, 'NEW_MESSAGE' );
			},
			( e ) => logErrorAndRespondWithJson(res, e)
		);
}

function logErrorAndRespondWithJson( res, e ) {
	logError( e );
	res.json( { success: false } );
}

function logError( e ) {
	console.error( e );
}

module.exports = wireUpControllers;