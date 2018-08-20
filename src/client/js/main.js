( function () {

	function HikuClient() {
		var that = this;
		that.username = ko.observable( "" );
		that.displayUsername = ko.pureComputed( function () {
			return "Username: " + that.username();
		} );

		that.loggedIn = ko.observable( false );
		that.messages = ko.observableArray();

		that.stanza1 = ko.observable( "" );
		that.stanza2 = ko.observable( "" );
		that.stanza3 = ko.observable( "" );

		that.es = new EventSource( '/stream' );

		that.es.addEventListener( 'NEW_USER', function ( e ) {
			console.log( e );
		} );

		that.es.addEventListener( 'NEW_MESSAGE', function ( e ) {
			var newMessage = JSON.parse( e.data );

			if ( !that.messages().some( ( m ) => m.id == newMessage.id ) ) {
				that.messages.push( newMessage );
			}
		} );

		that.refreshMessages();
	}

	HikuClient.prototype.constructor = HikuClient;
	window.HikuClient = HikuClient;

	HikuClient.prototype.registerUser = function () {
		var that = this;
		$.post( {
			url: '/register',
			data: JSON.stringify( { username: that.username() } ),
			contentType: 'application/json',
			dataType: 'JSON',
		} ).done( function ( response ) {
			that.loggedIn( response.success );
		} );
	};

	HikuClient.prototype.refreshMessages = function () {
		var that = this;

		return $.get( '/message/all' ).done( function ( messages ) {
			AddMessages.call( that, messages );
		} ).promise();
	};

	HikuClient.prototype.sendMessage = function () {
		var that = this,
			haiku = [ that.stanza1(), that.stanza2(), that.stanza3() ].join( ' / ' ),
			newMessage = {
				author: that.username(),
				text: haiku
			};

		return $.post( {
			url: '/message',
			data: JSON.stringify( newMessage ),
			contentType: 'application/json',
			dataType: 'JSON',
		} ).done( function (response) {
			if(response.success) {
				that.stanza1( "" );
				that.stanza2( "" );
				that.stanza3( "" );
			} else {
				if(response.failedValidation) {
					alert('Haiku failed validation because: "'+response.reason+'".');
				}
			}
		} ).promise();
	};

	function AddMessages( messages ) {
		var that = this;

		if ( !messages )
			return;

		messages.forEach( AddMessage.bind( that ) );
	}

	function AddMessage( message ) {
		var that = this;

		if ( !message )
			return;

		if ( !that.messages().some( ( m ) => m.id == newMessage.id ) ) {
			that.messages.push( message );
		}
	}

}() )