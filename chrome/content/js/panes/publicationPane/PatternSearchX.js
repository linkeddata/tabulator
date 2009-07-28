function PatternSearchX() {    
    function Node(amount, fetch, search, children) {
        this.fetch = function(symbol) {
            if(symbol)
                AJAR_handleNewTerm(tabulator.kb, symbol, symbol);
            return amount(search(symbol), fetch(children));
        }
    }

    // input: array or null, function
    // return: array or boolean
    var amount = new function() {
        this.single = function(symbols, fetch) {
            if(!symbols) return false;
            for(var i = 0;i < symbols.length;i++) {
                var fetched = fetch(symbols[i]);
                if(fetched) return fetched;
            }
            return false;
        }

        this.multiple = function(symbols, fetch) {
            if(!symbols) return false;
            var containers = [];
            for(var i = 0;i < symbols.length;i++) {
                var fetched = fetch(symbols[i]);
                if(fetched) containers.push(fetched);
            }
            if(containers.length == 0) return false;
            else if(containers.length == 1) return containers[0];
            else return containers;
        }
    }

    // input: RDF*
    // return: RDF*, array or boolean
    var fetch = new function() {
        this.or = function(collect) {
            var collect = new Boolean(collect).valueOf();
            return function(children) {
                return function(symbol) {
                    for(var i = 0;i < children.length;i++) {
                        var childFetched = children[i].fetch(symbol);
                        if(!childFetched) continue;
                        else if(collect) {
                            if(childFetched.constructor === Boolean) return [symbol];
                            else return [symbol, childFetched];
                        }
                        else {
                            if(childFetched.constructor === Boolean) return true;
                            else return childFetched;
                        }
                    }
                    return false;
                }
            }
        }

        this.and = function(collect) {
            var collect = new Boolean(collect).valueOf();
            return function(children) {
                return function(symbol) {
                    var container = [];
                    for(var i = 0;i < children.length;i++) {
                        var childFetched = children[i].fetch(symbol);
                        if(!childFetched) return false;
                        else container.push(childFetched);
                    }
                    var pruned = pruneBooleans(container);
                    if(collect) {
                        if(pruned.length == 0) return [symbol];
                        else if(pruned.length == 1) return [symbol, pruned[0]];
                        else return [symbol, pruned]
                    }
                    else {
                        if(pruned.length == 0) return true;
                        else if(pruned.length == 1) return pruned[0];
                        else return pruned;
                    }
                }
            }
        }

        this.aggregate = function(collect) {
            var collect = new Boolean(collect).valueOf();
            return function(children) {
                return function(symbol) {
                    var container = [];
                    for(var i = 0;i < children.length;i++) {
                        var childFetched = children[i].fetch(symbol);
                        if(!childFetched) continue;
                        else container.push(childFetched);
                    }
                    if(container.length == 0) return false;
                    var pruned = pruneBooleans(container);
                    var extracted = [];
                    for(var i = 0;i < pruned.length;i++) {
                        if(pruned[i].constructor === Array) {
                            for(var j = 0;j < pruned[i].length;j++) {
                                extracted.push(pruned[i][j]);
                            }
                        }
                        else {
                            extracted.push(pruned[i]);
                        }
                    }
                    pruned = extracted;
                    if(collect) {
                        if(pruned.length == 0) return [symbol];
                        else if(pruned.length == 1) return [symbol, pruned[0]];
                        else return [symbol, pruned];
                    }
                    else {
                        if(pruned.length == 0) return true;
                        else if(pruned.length == 1) return pruned[0];
                        else return pruned;
                    }
                }
            }
        }


        this.end = function(collect) {
            var collect = new Boolean(collect).valueOf();
            return function() {
                return function(symbol) {
                    if(!symbol) // TODO: Check termTypes
                        return false;
                    else if(collect)
                        return [symbol];
                    else
                        return true;
                }
            }
        }

        function pruneBooleans(arr) {
            var newArr = [];
            for(var i = 0;i < arr.length;i++) {
                if(arr[i].constructor !== Boolean) {
                    newArr.push(arr[i]);
                }
            }
            return newArr;
        }
    }

    // input: RDF*, RDF*
    // return: function
    //  input: RDF*
    //  output: null or array of RDF*
    // index: whether it will retrieve subjects (0), predicates (1), or objects(2)
    var search = new function() {
        function extract(triples, index) {
            if(!triples) return triples;
            var symbols = new Array();
            var part;
            switch(index) {
                case 0: part = "subject"; break;
                case 1: part = "predicate"; break;
                case 2: part = "object"; break;
                default: alert('search->extract:invalid index'); return;
            }
            for(var i = 0;i < triples.length;i++) {
                symbols.push(triples[i][part]);
            }
            return symbols;
        }

        this.bySubject = function(predicate, object, index) {
            return function(subject) {
                return extract(tabulator.kb.statementsMatching(subject, predicate, object), index);
            }
        }

        this.byPredicate = function(subject, object, index) {
            return function(predicate) {
                return extract(tabulator.kb.statementsMatching(subject, predicate, object), index);
            }
        }

        this.byObject = function(subject, predicate, index) {
            return function(object) {
                return extract(tabulator.kb.statementsMatching(subject, predicate, object), index);
            }
        }

        this.blank = function() {
            return function(symbol) {
                return [symbol];
            }
        }
    }

    // Shortcuts for declaring nodes
    this.scut = function(label) {
        var labelArr = label.split("");
        // default options
        var a = amount.single;
        var s = search.blank;
        var f = fetch.end;
        if(label[0] === "M") {
            a = amount.multiple;
        }
        if(label[1] === "S") {
            s = search.bySubject;
        }
        else if(label[1] === "P") {
            s = search.byPredicate;
        }
        else if(label[1] === "O") {
            s = search.byObject;
        }
        if(label[2] === "A") {
            f = fetch.and;
        }
        else if(label[2] === "O") {
            f = fetch.or;
        }
        else if(label[2] === "G") {
            f = fetch.aggregate;
        }

        if(f === fetch.end && s === search.blank) {
            return function(collect) {
                return new Node(a, f(collect), s());
            }
        }
        else if(f === fetch.end) {
            return function(collect, uri1, uri2, index) {
                return new Node(a, f(collect), s(uri1, uri2, index));
            }
        }
        else if(s === search.blank) {
            return function(collect, children) {
                return new Node(a, f(collect), s(), children);
            }
        }
        else {
            return function(collect, uri1, uri2, index, children) {
                return new Node(a, f(collect), s(uri1,uri2, index), children);
            }
        }
    }
}
