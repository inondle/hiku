const nlp = require( 'nlp_compromise' );
const syllablesAsync = require( 'nlp-syllables-async' );
const _ = require( 'lodash' );
nlp.plugin( syllablesAsync );

function asyncValidateHaiku( poem ) {
	return new Promise( ( resolve, reject ) => {
		const poemWords = poem.trim().split( ' ' );

		if ( poemWords.length < 3 ) {
			reject( { reason: 'Less than 3 words.' } );
			return
		} else if ( poemWords.length > 17 ) {
			reject( { reason: 'More than 17 words.' } )
			return
		}

		var syllablesPromises = poemWords.map( ( word ) => {
			return nlp.text( word ).termsWithSyllables();
		} );

		Promise.all( syllablesPromises ).then( ( words ) => {
			const syllables = words.map( t => {
				var term = t[ 0 ];
				if ( !term ) {
					return [];
				}

				return term.syllables
			} );

			const total_syllables = _.sumBy( syllables, 'length' )


			if ( total_syllables !== 17 ) {
				reject( { reason: 'Syllable count does not equal 17, actual count: ' + total_syllables } )
				return
			}

			// TODO: Splice the array correctly....
			var stanza1Count = _.sumBy( syllables.splice( 0, 4 ), 'length' );
			var stanza2Count = _.sumBy( syllables.splice( 5, 11 ), 'length' );
			var stanza3Count = _.sumBy( syllables.splice( 12, 16 ), 'length' );

			if ( stanza1Count != 5 ) {
				reject( { reason: 'Stanza 1 does not have 5 syllables: ' + stanza1Count } )
				return
			} else if ( stanza2Count != 7 ) {
				reject( { reason: 'Stanza 2 does not have 7 syllables: ' + stanza2Count } )
				return
			} else if ( stanza3Count != 5 ) {
				reject( { reason: 'Stanza 3 does not have 5 syllables: ' + stanza3Count } )
				return
			}

			resolve();

		}, ( e ) => reject( { reason: 'nlp error', error: e } ) )
		.catch(e => reject( { reason: 'runtime error: ' + e }));
	} );
}

module.exports = asyncValidateHaiku;