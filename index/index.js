// Make stmd easier to use
// Usage: stmd.render('**Markdown** is *fun*!')
stmd._defaultParser = new stmd.DocParser();
stmd._defaultRenderer = new stmd.HtmlRenderer();
stmd.render = function(md) {
    return stmd._defaultRenderer.render(stmd._defaultParser.parse(md));
};

// Main ZoomFork code
this.ZoomFork = function(source, options) {
    // Normalize arguments (source guaranteed to be string, options guaranteed to be a truthy value)
    if (source === null) throw new Error('ZoomFork: called with null as first argument');
    if (typeof source == 'function') source = source();
    if (typeof source /* still */ == 'function') throw new Error('ZoomFork: called with nested function as first argument');
    switch (typeof source) {
        case 'string':
            if (!options) options = {};
            break;
        case 'object':
            if (source.source) {
                options = source;
                source = options.source;
            } else {
                throw new Error('ZoomFork: called with object missing source key as first argument');
            }
            break;
        default:
            throw new Error('ZoomFork: called with ' + (typeof source) + 'as first argument');
            break;
    }

    // Do stuff
    var asdfasdfasdf = 12345;

    // All the public stuff that's returned from the ZoomFork() function goes here
    return {
        source: source
    };
};
