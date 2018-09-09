const nlp = require( 'nlp_compromise' );
const syllablesAsync = require( 'nlp-syllables-async' );
const _ = require( 'lodash' );
nlp.plugin( syllablesAsync );

var whitespaceRegex = /\W+/g;

/**
 * Counts the syllables in an array of words.
 * @param {Array} words - the array of words. 
 */
function getSyllableCount(words) {
	if ( !words || !words.length ) {
		return Promise.resolve(0);
	}

	if(_.isString(words)) {
		words = words.trim().split(whitespaceRegex);
	}

	return getSyllablesForWords(words)
		.then(countAllSyllables);
}

/**
 * Validates whole haiku poem.
 * @param {String} poem 
 */
function asyncValidateHaiku( poem, stanzaOpts ) {
	// TODO: Wire this up to affect how the validation handles syllable counting
	stanzaOpts = _.defaults( stanzaOpts || {}, {
		format: [5,7,5],
		// TODO: Other options...
	} );
	
	var stanzas = poem.split(' / ');

	// TODO: Work these validations back in, might be somewhat useful
	// if ( words.length < 3 ) {
	// 	reject( { reason: 'Less than 3 words.' } );
	// 	return;
	// } else if ( words.length > 17 ) {
	// 	reject( { reason: 'More than 17 words.' } );
	// 	return;
	// }

	return new Promise( ( resolve, reject ) => {
		// transform each stanza into a validation promise, then when all the validation is finished, resolve
		var stanzaValidationPromises = stanzas.map(function(stanza, i) {
			var stanzaLength = stanzaOpts.format[i];
			const words = stanza.trim().split( whitespaceRegex );

			return getSyllablesForWords( words ).then( ( syllables ) => {
				var syllableCount = _.sumBy( syllables, 'length' );

				if ( syllableCount != stanzaLength ) {
					reject( { reason: `Stanza ${i+1} does not have ${stanzaLength} syllables, actual count: ${stanza1Count}` } );
					return
				}
			});
		});

		Promise.all(stanzaValidationPromises).then(() => resolve({}));
	} );
}

/**
 * Helper function which sums all syllables after they've been processed by nlp_compromise
 */
function countAllSyllables( syllables ) {
	return _.sumBy( syllables, 'length' );
}

/**
 * takes in an array of words and transforms it into it's syllables
 */
function getSyllablesForWords( words ) {
	return Promise.all( words.map( ( word ) => {
		return nlp.text( word ).termsWithSyllables();
	} ) ).then( getSyllablesFromTerm );
}

/**
 * extracts the syllables from the nlp object
 */
function getSyllablesFromTerm( nlpWords ) {
	return nlpWords.map( t => {
		let term = t[ 0 ];
		return term ? term.syllables : [];
	} );
}

module.exports = {
	asyncValidateHaiku: asyncValidateHaiku,
	getSyllableCount: getSyllableCount
};