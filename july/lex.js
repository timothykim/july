(function () {


// HELPER FUNCTIONS

// from JavaScript: The Good Parts
var is_array = function (value) {
    return Object.prototype.toString.apply(value) === '[object Array]';
};

var is_regex = function (value) {
    return Object.prototype.toString.apply(value) === '[object RegExp]';
}


//make july visible at a global level
var july = window.july = {};



/**
 * Lexer object generator
 *
 * Array of tokens are fed to this function to generate a lexer
 */
july.lex = function (tokens) {

    // make sure tokens is an Array
    if (!is_array(tokens)) {
        throw {
            name: 'TypeError',
            message: 'lex needs an array'
        };
    }


    // our lexer object
    var lexer = {};


    // public variables
    lexer.lineno = 1; // current line number
    lexer.lexpos = 0; // current position number


    // private variables
    var lexstate = "INITIAL"; // state of the lexer : "INITIAL" -> "IN PROGRESS" -> "FINISHED"
    var lexregex = null;      // current regex
    var lexlen = 0;        // length of input text
    var lexdata = "";    // actual input text
    var lexignore = "";  // ignored character
    var lextokens = [];     // list of valid tokens
    var lexerror = null;   // error handler, initially does nothing


    // process tokens
    var i;
    var len = tokens.length;
    for (i = 0; i < len; i += 1) {
        // valid tokens are ones that have name and regex with option rule
        // there are two special tokens to take care of 'ignore' and 'error'

        var t = tokens[i];
        
        /*
        // if token doesn't have a name string then just skip it
        if (typeof t.name !== 'string') {
            continue;
        }
        */

        if (t.name === 'error' && typeof t.rule === 'function') {
            lexerror = t.rule;
            continue;
        }

        if (typeof t.ignore === 'string') {
            lexignore = t.ignore;
            continue;
        }

        //TODO: regex can be an array of strings or regex... :(

        if (is_regex(t.regex)) {
            t.regex = t.regex.source
        }

        if (typeof t.regex === 'string' || typeof t.rule === 'function') {
            lextokens.push(t);
            continue;
        }


        //TODO: process literals
    }
    

//    console.log(lextokens);

    // public methods
    

    lexer.status = function () {
        return lexstate;
    };

    // input(data)
    //
    // provide the lexer with some text to parse
    lexer.input = function (data) {
        if (typeof data !== 'string') {
            throw {
                name: 'TypeError',
                message: 'input needs a string'
            };
        }

        lexstate = "INITIAL";
        lexdata = data;
        lexlen = data.length;
    };


    lexer.skip = function (i) {
        lexer.lexpos += i;
    };

    // return the next token
    lexer.token = function () {

        lexpos = lexer.lexpos;

        while (lexpos < lexlen) {

            // short circuit ignored characters
            if (lexignore.indexOf(lexdata[lexpos]) !== -1) {
                lexpos += 1;
                continue;
            }


            // now do a match
            var i, len = lextokens.length;
            for (i = 0; i < len; i += 1) {

                //make it "local" to make things little fast
                var t = lextokens[i];


                //append ^ so that we only check from the beginning of the data
                lexregex = new RegExp('^' + t.regex);

                var match = lexdata.substr(lexpos).match(lexregex);

                if (!match) {
                    continue;
                }

                //token to be returned
                var tok = {};

                tok.value = match[0];
                tok.lineno = lexer.lineno;
                tok.lexpos = lexpos;
                tok.type = t.name;
                tok.lexer = lexer;

                //move our pointer
                lexpos += tok.value.length;
                lexer.lexpos = lexpos;

                if (typeof t.rule !== 'function') {
                    if (typeof t.name === 'string') {
                        return tok;
                    } else {
                        return null;
                    }
                }

                var func = t.rule || function (t) {};

                var new_t = func(tok);

                // if the rule returned nothing we are done
                if (!new_t) {
                    return null;
                }
                
                // TODO: if the rule didn't return a token throw an error
                /* 
                if (is_token(new_t)) {

                }
                */
                
                return new_t;

            }

            // if there was no match
            if (i === len) {
                // TODO: check if there are any literals to match

                // throw an error
                if (lexerror) {

                    var tok = {};

                    tok.value = lexdata[lexpos];
                    tok.lineno = lexer.lineno;
                    tok.lexpos = lexpos;
                    tok.type = lexdata[lexpos];
                    tok.lexer = lexer;
                    
                    new_t = lexerror(tok);

                    if (new_t) {
                        return new_t;
                    } else {
                        return null;
                    }

                } else {
                    throw {
                        name: 'LexError',
                        message: 'Illegal character ' + lexdata[lexpos] + ' at position ' + lexpos
                    };
                }

            }

        } //end while

        lexstate = "FINISHED";

        return null;
    };



    return lexer;
}


})();


