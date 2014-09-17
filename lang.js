var TYPES = {
    NIL: 0,
    NUM: 1,
    BOOL: 2
}

var FUNCTIONS = [
    // Control flow
    {data: ['if', TYPES.BOOL, 'then', TYPES.NIL], rtn: TYPES.NIL},

    // Binary operators
    {data: [TYPES.NUM, 'is less than', TYPES.NUM], rtn: TYPES.BOOL},

    // Literals (double bracket syntax; hardcoded into parsing function)
    {data: [[TYPES.NUM]], rtn: TYPES.NUM}
]

function parse(expr, rtn, asdf) {
    if (rtn === undefined) rtn = TYPES.NIL;

    // we're going to try all functions possible with the correct return value
    var validFuncs = filter(FUNCTIONS, function(f) {
        if (rtn === TYPES.NIL) return true;
        if (f.rtn === rtn) return true;
        return false;
    });

    // loop through them
    var branches = [];
    funcs:
    for (var funcIdx = 0; funcIdx < validFuncs.length; ++funcIdx) {
        var func = validFuncs[funcIdx], exprIdx = 0, path = [];
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
                    var parsed = parse(segment, type);
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
    var newArr = [];
    for (var i = 0; i < arr.length; ++i) {
        if (condition(arr[i])) newArr.push(arr[i]);
    }
    return newArr;
}

function arraysEqual(a, b) {
    for (var i = 0; i < Math.max(a.length, b.length); ++i) if (a[i] !== b[i]) return false;
    return true;
}

function debug(str, type) {
    console.log(JSON.stringify(parse(str.split(' '), type), undefined, 2));
}

debug('if 5 is less than 10 then 20 is less than 2');
debug('5 is less than 10', TYPES.BOOL);
