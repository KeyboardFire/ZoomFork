var TYPES = {
    NIL: 0,
    NUM: 1,
    BOOL: 2,
    STR: 3
};

var FUNCTIONS = [
    // Control flow
    {data: ['if', TYPES.BOOL, 'then', TYPES.NIL], rtn: TYPES.NIL},
    {data: ['unless', TYPES.BOOL, 'do', TYPES.NIL], rtn: TYPES.NIL},
    {data: ['while', TYPES.BOOL, 'do', TYPES.NIL], rtn: TYPES.NIL},
    {data: ['until', TYPES.BOOL, 'do', TYPES.NIL], rtn: TYPES.NIL},
    {data: ['otherwise', TYPES.NIL], rtn: TYPES.NIL},
    {data: ['else', TYPES.NIL], rtn: TYPES.NIL},

    // Binary operators
    {data: [TYPES.NUM, 'plus', TYPES.NUM], rtn: TYPES.NUM},
    {data: [TYPES.NUM, 'minus', TYPES.NUM], rtn: TYPES.NUM},
    {data: [TYPES.NUM, 'times', TYPES.NUM], rtn: TYPES.NUM},
    {data: [TYPES.NUM, 'divided by', TYPES.NUM], rtn: TYPES.NUM},
    {data: [TYPES.NUM, 'to power', TYPES.NUM], rtn: TYPES.NUM},
    {data: [TYPES.NUM, 'is less than', TYPES.NUM], rtn: TYPES.BOOL},
    {data: [TYPES.NUM, 'is greater than', TYPES.NUM], rtn: TYPES.BOOL},

    // Unary mathematical operators
    {data: ['absolute value', TYPES.NUM], rtn: TYPES.NUM},

    // I/O
    {data: ['output', TYPES.NIL], rtn: TYPES.NIL},

    // Misc.
    {data: ['set', TYPES.STR, 'to', TYPES.NIL], rtn: TYPES.NIL},

    // Literals (double bracket syntax; hardcoded into parsing function)
    {data: [[TYPES.NUM]], rtn: TYPES.NUM}
]

function parse(expr, rtn, depth) {
    if (rtn === undefined) rtn = TYPES.NIL;
    if (depth === undefined) depth = 1;
    // <HACK> (see the huge comment a few lines below)
    if (depth > 8) return false;
    // </HACK>

    // loop through them
    var branches = [];
    funcs:
    for (var funcIdx = 0; funcIdx < FUNCTIONS.length; ++funcIdx) {
        var func = FUNCTIONS[funcIdx];

        // make sure it has the correct return value
        if (rtn !== TYPES.NIL && func.rtn !== rtn) continue;

        /*
         * okay, so this was a big problem before and here's an ugly kludge to solve it
         * here's the basic idea: when the thing wanted a number, it looped through all the
         *   functions that returned numbers to see if they worked
         * eventually it would reach <number> plus <number>
         * but "plus" returns a number, and it also has a number as its first argument
         * so when parsing that, it would try (<number> plus <number>) plus <number> and so on
         * I fixed it by searching for all the constant strings in the right order
         * which partially worked, because not everything was getting stack overflows
         * but "plus" still didn't work. because...
         * it kept finding the same "plus" each recurse (?)
         * I spent about 30 minutes on some elaborate "indeces already found" system
         * but I realized the lazier -- uhh, I mean, more efficient -- way of doing this
         *   would be to keep track of the recurse depth and abort when it's too high
         * so I was lazy and did that
         * TODO: this is really inefficient; it should only abort on n consecutive calls of
         *   the *same* function
         * and now the code's really messy
         * sorry about that
         */
        // <HACK>
        // step 1: get a list of all constant strings in the function
        var funcStrings = [];
        for (var i = 0; i < func.data.length; ++i) {
            if (typeof func.data[i] === 'string') funcStrings.push(func.data[i]);
        }
        // only continue if there are constants (literals don't have string constants)
        if (funcStrings.length >= 1) {
            // step 2: walk through the expression and verify the function's constant strings
            // appear in the right order
            var currentWords = funcStrings.shift().split(' ');
            for (var i = 0; i < expr.length; ++i) {
                if (arraysEqual(expr.slice(i, i + currentWords.length), currentWords)) {
                    // yay! it's good
                    currentWords = funcStrings.shift();
                    if (currentWords === undefined) {
                        // everything's good!
                        break;
                    }
                    currentWords = currentWords.split(' ');
                }
            }
            // step 3: fail if the constants weren't found
            if (currentWords !== undefined) {
                // this function didn't work
                continue funcs;
            }
        }
        // </HACK>

        var exprIdx = 0, path = [];
        // this looks ugly but I have to define this in here because scope
        var backtrack = function() {
            while (true) {
                var lastBranch = branches[branches.length - 1];
                if (lastBranch) {
                    if (lastBranch.lastPathTaken >= lastBranch.possibilities.length - 1) {
                        // that branch has run out of paths; it won't work
                        branches.pop();
                    } else {
                        exprIdx = lastBranch.exprIdx;
                        path = lastBranch.path;

                        // advance the current index
                        var result = lastBranch.possibilities[++lastBranch.lastPathTaken];
                        path.push(result.parsed);
                        exprIdx = result.segmentEnd;

                        return lastBranch.i;
                    }
                } else {
                    return false;
                }
            }
        };

        // now walk through this function's data instructions while keeping track of location within expr
        // also keep track of the parse path, which will be returned
        funcparse:
        for (var i = 0; i < func.data.length; ++i) {
            if (typeof func.data[i] === 'string') {
                // must be an exact string match
                var words = func.data[i].split(' ');

                // if the words are present at the current index
                if (arraysEqual(expr.slice(exprIdx, exprIdx + words.length), words)) {
                    // advance the current index
                    path.push(words.join(' '));
                    exprIdx += words.length;
                } else {
                    // fail! backtrack if possible; otherwise just continue
                    // (this is ugly code duplication from a few lines up)
                    var bt = backtrack();
                    if (bt !== false) {
                        i = bt;
                        continue funcparse;
                    } else continue funcs;
                }
            } else if (typeof func.data[i] === 'number') {
                // keep adding words until the expression returns the correct value
                var type = func.data[i], possibilities = [];

                // let expr = "this is a test"; this checks "this" "this is" "this is a" and "this is a test"
                for (var segmentEnd = exprIdx + 1; segmentEnd <= expr.length; ++segmentEnd) {
                    var segment = expr.slice(exprIdx, segmentEnd);
                    // if this expression segment returns the right value
                    var parsed = parse(segment, type, depth + 1);
                    if (parsed) {
                        // it's a possibility (remember, ambiguity exists)
                        possibilities.push({parsed: parsed, segmentEnd: segmentEnd});
                    }
                }
                if (possibilities.length === 0) {
                    // fail! no possibilities; backtrack if possible; otherwise just continue
                    // (this is ugly code duplication from a few lines up)
                    var bt = backtrack();
                    if (bt !== false) {
                        i = bt;
                        continue funcparse;
                    } else continue funcs;
                }
                if (possibilities.length >= 2) {
                    branches.push({
                        i: i,
                        exprIdx: exprIdx,
                        path: path.slice(0),
                        possibilities: possibilities,
                        lastPathTaken: 0
                    });
                }
                var result = possibilities[0];
                // advance the current index
                path.push(result.parsed);
                exprIdx = result.segmentEnd;
            } else {
                // literal (hardcoded)
                var type = func.data[0][0];
                switch (type) {
                    case TYPES.NUM:
                        if (/^\d+$/.test(expr[exprIdx])) {
                            // advance the current index
                            path.push(expr[exprIdx]);
                            exprIdx += 1;
                        } else {
                            // fail! backtrack if possible; otherwise just continue
                            // (this is ugly code duplication from a few lines up)
                            var bt = backtrack();
                            if (bt !== false) {
                                i = bt;
                                continue funcparse;
                            } else continue funcs;
                        }
                        break;
                }
            }
        }
        if (exprIdx == expr.length) {
            return path;
        }
    }

    return false;
}

function filter(arr, condition) {
}

function arraysEqual(a, b) {
    for (var i = 0; i < Math.max(a.length, b.length); ++i) if (a[i] !== b[i]) return false;
    return true;
}

function debug(str, type) {
    var parsed = parse(str.split(' '), type);
    console.log(JSON.stringify(parsed, undefined, 2));
    console.log(JSON.stringify(parsed).replace(/"/g, '').replace(/,/g, ' '));
}

debug('if 5 is less than 10 then 20 is less than 2');
//debug('5 is less than 10', TYPES.BOOL);
debug('if 5 plus 5 is less than 15 then output 5');
