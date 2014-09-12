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

    // First, we're going to parse the source, using mostly markdown and a few other things.
    // Step 1: Parse "labels" (ex. "death:\nYou die!")
    var labelRegex = /^.*:$/gm, match;
    var labels = {}, labelName, labelIndex;
    while (true) {
        match = labelRegex.exec(source);

        if (labelName) {
            if (labels[labelName]) {
                // Appending to a previously existing label
                labels[labelName] += '\n';
            } else {
                // Initialize the label
                labels[labelName] = '';
            }
            labels[labelName] += source.slice(labelIndex + 1, (match ? match.index - 1 : undefined));
        }

        if (match === null) break;

        labelName = match[0].slice(0, -1);
        labelIndex = labelRegex.lastIndex;
    }

    // Step 2: Parse them with Markdown
    for (var label in labels) {
        labels[label] = stmd.render(labels[label]);
    }

    // Step 3: Expand the modified version of inline HTML and JS
    // TODO

    console.log(labels);

    // All the public stuff that's returned from the ZoomFork() function goes here
    return {
        source: source
    };
};

ZoomFork('this:\nis\na\ntest\nand:\nthis\nis\ntoo\nthis:\nold\nappend');
