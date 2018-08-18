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

		// TODO: register `handleEvent` to handle SSE.

		// Test message to view output
		that.messages.push( { author: 'q', message: 'hello' } );
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

		$.get( '/message/all' ).done( function ( response ) {
			AddMessages.call(that, response.messages);
			console.log( response );
		} );
	};

	HikuClient.prototype.sendMessage = function () {
		var that = this,
			haiku = [ that.stanza1(), that.stanza2(), that.stanza3() ].join( ' / ' ),
			newMessage = {
				author: that.username(),
				message: haiku
			};

		$.post( {
			url: '/message',
			data: JSON.stringify( newMessage ),
			contentType: 'application/json',
			dataType: 'JSON',
		} ).done( function ( response ) {
			that.stanza1( "" );
			that.stanza2( "" );
			that.stanza3( "" );

			// TODO: The server should send us a notification about this, don't push it manually
			that.messages.push( newMessage );
			console.log( response );
		} );
	};

	HikuClient.prototype.handleEvent = function () {
		var that = this;
	};

	function AddMessages(messages) {
		var that = this;

		if(!messages)
			return;

		messages.forEach(AddMessage.bind(that));
	}

	function AddMessage(message) {
		var that = this;

		if(!message)
			return;

		that.messages.push(message);
	}

}() )