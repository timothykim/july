// calclex.py
//
// tokenizer for a simple expression evaluator for
// numbers and +,-,*,/


var tokens = [
    {
        name: 'NUMBER',
        regex: /\d+/,
        rule: function (t) {
            t.value = parseInt(t.value);
            return t;
        }
    },

    {
        name: 'PLUS',
        regex: /\+/,
    },

    {
        name: 'MINUS',
        regex: /-/,
    },

    {
        name: 'TIMES',
        regex: /\*/,
    },

    {
        name: 'DIVIDE',
        regex: /\//,
    },

    {
        name: 'LPAREN',
        regex: /\(/,
    },

    {
        name: 'RPAREN',
        regex: /\)/,
    },

    {
        //newline
        name: 'newline',
        regex: /\n+/,
        rule: function (t) {
            t.lexer.lineno += t.value.length;
        }
    },

    {
        //ignore whitespace
        ignore: " \t" 
    },


    {
        name: 'error',
        rule: function (t) {
            console.log("Illegal character '" + t.value[0] + "'");
            t.lexer.skip(1);
        }
    }
];



var lexer = july.lex(tokens);



// test


var data = "3 + 4 * 10\n45 - 2=34";

lexer.input(data);

//console.dir(lexer);

while (true) {
    var tok = lexer.token();
    if (lexer.status() === "FINISHED") {
        break;
    }
    console.log(tok);
}
