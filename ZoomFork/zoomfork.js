var global = this;
global.ZoomFork = function(source, options) {
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
    var labels = {}, labelName = '_start', labelIndex = -1;
    while (true) {
        match = labelRegex.exec(source);

        if (labels[labelName]) {
            // Appending to a previously existing label
            labels[labelName] += '\n';
        } else {
            // Initialize the label
            labels[labelName] = '';
        }
        labels[labelName] += source.slice(labelIndex + 1, (match ? match.index - 1 : undefined));

        if (match === null) break;

        labelName = match[0].slice(0, -1);
        labelIndex = labelRegex.lastIndex;
    }

    // Step 2: Parse them with Markdown
    var parser = new stmd.DocParser(), renderer = new stmd.HtmlRenderer();
    //parser.inlineParser.parseHtmlTag = function() { return false; };
    // We're using a very ugly hack involving a global variable here since we can't bind onclick to Markdown links
    // Make the variable name as difficult to find and accidentally use as possible
    var hackyGlobalThing = '__ZoomFork_' + Math.random().toString().slice(2) + '_onclick__';
    global[hackyGlobalThing] = function(){};
    for (var label in labels) {
        var parsed = parser.parse(labels[label]);

        // Expand special links (ones starting with "@")
        // Uses iteration instead of recursion, because meh I'm not going to run out of stack space but I don't care
        var toIterate = [parsed];
        while (toIterate.length > 0) {
            var nextIteration = [];
            for (var i = 0; i < toIterate.length; ++i) {
                var node = toIterate[i];

                // recurse(ish)
                if (node.children) nextIteration = nextIteration.concat(node.children);

                // the things we're interested in: inline content, which includes links
                for (var j = 0; j < node.inline_content.length; ++j) {
                    var inline = node.inline_content[j];
                    if (inline.t == 'Link' && inline.destination.charAt(0) == '@') {
                        var destName = inline.destination.slice(1).replace(/['\\]/g, function(match) {
                            return '\\' + match;
                        });
                        inline.destination = 'javascript:' + hackyGlobalThing + '(\'' + destName + '\')';
                    }
                }
            }
            toIterate = nextIteration;
        }

        labels[label] = renderer.render(parsed);
    }

    // Step 3: Expand the modified version of inline HTML and JS
    // TODO

    console.log(labels);

    // All the public stuff that's returned from the ZoomFork() function goes here
    var zf = {
        source: source,
        labels: labels,
        hackyGlobalThing: hackyGlobalThing,
        renderTo: function(dest) {
            dest.innerHTML = labels['_start'];
            global[hackyGlobalThing] = function(labelName) {
                dest.innerHTML = labels[labelName];
            };
        }
    };
    return zf;
};
