// PatternSearch: SPARQL's very primitve cousin

function PatternSearch() { // Encapsulates all of the methods and classes
    /*****************************
     *     Main Node Class       *
     *****************************/
    var anchor = this;
    this.debug = false;
    this.PatternNode = function(amountMethod, fetchMethod, searchMethod, children) {
        this.amountMethod = amountMethod;
        this.fetchMethod = fetchMethod;
        this.searchMethod = searchMethod;
        this.children = children;
    }
    this.PatternNode.prototype.fetch = function(subject) {
        if(subject == null) return null;
        if(subject.type === 'Symbol')
            tabulator.sf.requestURI(getBaseURI(subject.uri));
        return this.amountMethod(this.searchMethod(subject), this.fetchMethod, this.children);
    }
    this.PatternNode.prototype.toString = function() {
        if(this.children) {
            var str = "";
            if(this.type) str = "{["+this.type+"\n";
            else str = "{[\n";
            for(var i = 0;i < this.children.length;i++) {
                var strarr = this.children[i].toString().split("\n");
                for(var j = 0;j < strarr.length;j++)
                    str += "   "+strarr[j]+"\n";
            }
            return str+"]}";
        }
        else
            return "END"+(this.type?"/"+this.type:"");
    }

    /******************************
     *       Amount Methods       *
     ******************************/
     var amount = new function() {
        this.single = function(searchResults, fetchMethod, children) {
            if(util.isEmpty(searchResults)) return null;
            for(var i = 0;i < searchResults.length;i++) {
                var data = fetchMethod(searchResults[i], children);
                if(!util.isEmpty(data)) return data;
            }
            return null;
        }
        this.multiple = function(searchResults, fetchMethod, children) {
            if(util.isEmpty(searchResults)) return null;
            var data = new Array();
            for(var i = 0;i < searchResults.length;i++) {
                var fetchedData = fetchMethod(searchResults[i], children);
                if(!util.isEmpty(fetchedData)) data.push(fetchedData);
            }
            if(data.length == 0) return null;
            else return data; // Might need to change this
        }
    }

    /******************************
     *       Fetch Methods        *
     ******************************/
    var fetch = new function() {
        this.end = function(subject) {
            if(subject == null) return null;
            else if(subject.termType === 'literal' || subject.termType === 'symbol')
                return new util.Container([subject.toString()]);
            else return null;
        }

        this.or = function(subject, children) {
            if(subject == null || util.isEmpty(children)) return null;
            for(var i = 0;i < children.length;i++) {
                var fetchedData = children[i].fetch(subject);
                if(fetchedData != null) return fetchedData;
            }
            return null;
        }

        this.and = function(subject, children) { // Children of And nodes must not return arrays
            if(subject == null || util.isEmpty(children)) return null;
            var dataContainer = new util.Container();
            for(var i = 0;i < children.length;i++) {
                var fetchedData = children[i].fetch(subject);
                if(util.isEmpty(fetchedData)) break; // Eliminating Array check for now
                else dataContainer.appendData(fetchedData);
            }
            if(dataContainer.data.length == children.length) return dataContainer;
            else return null;
        }
        //this.fetchMultipleAggregate = function(
    }


    /****************************
     *     Search Methods       *
     ****************************/
    var search = new function() {
        this.byPredicate = function(uri) {
            return function(subject) {
                var triples = tabulator.kb.statementsMatching(subject, uri);
                if(util.isEmpty(triples)) return new Array();
                return util.getObjects(triples);
            }
        }

        this.byType = function(uri) {
            return function(subject) {
                var triples = tabulator.kb.statementsMatching(subject,null,null,null);
                var objects = util.getObjects(triples);
                var matchingTriples = new Array();
                if(util.isEmpty(triples)) return matchingTriples;
                for(var i = 0;i < objects.length;i++)
                    if(tabulator.kb.whether(objects[i],tabulator.ns.rdf('type'),uri))
                        matchingTriples.push(triples[i]);
                return util.getObjects(matchingTriples);
            }
        }

        this.blank = function() {
            return function(subject) {
                return [subject];
            }
        }

        this.filter = function(uri) {
            return function(subject) {
                if(uri.uri == subject.uri) return [subject];
                else return null;
            }
        }
    }

    /****************************
     *    Results extractor     *
     ****************************/
    this.extract = function(results) {
        if(util.isEmpty(results)) return null;
        var values = new Array();
        if(results instanceof Array) {
            for(var i = 0;i < results.length;i++) {
                var subValues = anchor.extract(results[i]);
                if(subValues == null) continue;
                else if(subValues instanceof Array)
                    for(var j = 0;j < subValues.length;j++)
                        values.push(subValues[j]);
            }
        }
        else if(results instanceof util.Container) {
            var datum = "";
            for(var i = 0;i < results.data.length;i++) {
                var str = "";
                if(results.data[i] instanceof Array) {
                    if(results.data[i][0].constructor === String) // "Hello" instanceof String -> false
                        str = results.data[i].toString();
                    else if(results.data[i][0] instanceof util.Container)
                        str = anchor.extract(results.data[i][0]);
                }
                else if(results.data[i].constructor === String)
                    str = results.data[i].toString();
                else if(results.data[i] instanceof util.Container)
                    str = anchor.extract(results.data[i]);
                datum += str;
                if(i < results.data.length-1) datum += " ";
            }
            values.push(datum);
        }
        return values;
    }

    /**********************************
      *   Shortcuts & Abbreviations    *
     **********************************/
    this.scut = new function() {
        this.debug = function(type, arg) {
            var node = anchor.scut[type](arg);
            node.type = type;
            if(arg) node.type += ":"+arg;
            return node;
        }
        this.SAT = function(uri, children) {
            return new anchor.PatternNode(amount.single, fetch.and, search.byType(uri) , children);
        }
        this.SAP = function(uri, children) {
            return new anchor.PatternNode(amount.single, fetch.and, search.byPredicate(uri), children);
        }
        this.SAN = function(children) {
            return new anchor.PatternNode(amount.single, fetch.and, search.blank(), children);
        }
        this.SAF = function(uri, children) {
            return new anchor.PatternNode(amount.single, fetch.and, search.filter(uri), children);
        }
        this.MAT = function(uri, children) {
            return new anchor.PatternNode(amount.multiple, fetch.and, search.byType(uri), children);
        }
        this.MAP = function(uri, children) {
            return new anchor.PatternNode(amount.multiple, fetch.and, search.byPredicate(uri), children);
        }
        this.MAF = function(uri, children) {
            return new anchor.PatternNode(amount.multiple, fetch.and, search.filter(uri), children);
        }

        this.SOT = function(uri, children) {
            return new anchor.PatternNode(amount.single, fetch.or, search.byType(uri), children);
        }
        this.SOP = function(uri, children) {
            return new anchor.PatternNode(amount.single, fetch.or, search.byPredicate(uri), children);
        }
        this.SON = function(children) {
            return new anchor.PatternNode(amount.single, fetch.or, search.blank(), children);
        }
        this.SOF = function(children) {
            return new anchor.PatternNode(amount.single, fetch.or, search.filter(uri), children);
        }
        this.MOT = function(uri, children) {
            return new anchor.PatternNode(amount.multiple, fetch.or, search.byType(uri), children);
        }
        this.MOP = function(uri, children) {
            return new anchor.PatternNode(amount.multiple, fetch.or, search.byPredicate(uri), children);
        }
        this.MOF = function(uri, children) {
            return new anchor.PatternNode(amount.multiple, fetch.or, search.filter(uri), children);
        }

        this.SNT = function(uri) {
            return new anchor.PatternNode(amount.single, fetch.end, search.byType(uri));
        }
        this.SNP = function(uri) {
            return new anchor.PatternNode(amount.single, fetch.end, search.byPredicate(uri));
        }
        this.SNF = function(uri) {
            return new anchor.PatternNode(amount.single, fetch.end, search.filter(uri));
        }
        this.MNT = function(uri) {
            return new anchor.PatternNode(amount.multiple, fetch.end, search.byType(uri));
        }
        this.MNP = function(uri) {
            return new anchor.PatternNode(amount.multiple, fetch.end, search.byPredicate(uri));
        }
        this.MNF = function(uri) {
            return new anchor.PatternNode(amount.multiple, fetch.end, search.filter(uri));
        }
    }

    /*********************************
     *    Special Syntax Parser      *
     *********************************/
    this.parse = function(stringTree) {
        // takes in trees that are placed within brackets and integrates them into the new tree
        var reallocatedString = function(tree) { // this function was a pain to debug
            var numberOfSpaces = new Array();
            var treeArray = stringTree.split("\n");
            for(var i = 0;i < treeArray.length;i++) {
                var leftBrackets = util.indicesOf("[",treeArray[i]);
                var rightBrackets = util.indicesOf("]",treeArray[i]);
                var toBeAdded = 0;
                if(leftBrackets.length > 0)
                    toBeAdded = treeArray[i].lastIndexOf(">",leftBrackets[leftBrackets.length-1])-(leftBrackets.length)+3;
                var toBePopped = rightBrackets.length;
                var spaces = util.sumArray(numberOfSpaces);
                
                treeArray[i] = util.createBlankString(spaces) + treeArray[i];
                if(toBeAdded > 0) numberOfSpaces.push(toBeAdded);
                for(;toBePopped > 0;toBePopped--)
                    numberOfSpaces.pop();
                treeArray[i] = treeArray[i].replace(/\[/g,"").replace(/\]/g,"");
            }
            var newTree = "";
            for(var i = 0;i < treeArray.length;i++)
                newTree += treeArray[i]+(i+1==treeArray.length?"":"\n");
            return newTree;
        }(stringTree).replace(/ \^/g," >^"); // Built as it is because the procedure was recursive
        // 1) reallocatedString checks out

        var splicedString = reallocatedString.split("\n");

        // Returns the level of the node in the tree
        var nodeLevel = function(currentIndex,currentLine,indicesLevels) {
            for(var line = currentLine-1;line >= 0;line--)
                for(var index = indicesLevels[line].length-1;index >= 0;index--)
                    if(indicesLevels[line][index] == null) break;
                    else if(indicesLevels[line][index][0] == currentIndex &&
                           (index == 0 || indicesLevels[line][index-1] != null))
                        return indicesLevels[line][index][1];
            return indicesLevels[currentLine][indicesLevels[currentLine].length-1][1]+1;
        }
        // Builds an array of the indices of the '>'
        var indicesLevels = new Array();
        for(var line = 0;line < splicedString.length;line++) {
            indicesLevels.push(new Array());
            var lineIndices = util.indicesOf(">",splicedString[line]);
            var levelOffset = 0;
            if(line > 0) levelOffset = nodeLevel(lineIndices[0],line,indicesLevels);
            else { lineIndices.push(0); lineIndices.sort(function(a,b){return a - b;}); };
            for(var nullLevel = 0;nullLevel < levelOffset;nullLevel++)
                indicesLevels[line].push(null);
            for(var level = 0;level < lineIndices.length;level++)
                indicesLevels[line].push([lineIndices[level],level+levelOffset]);
        }
        // 2) indicesLevels checks out

        // Builds a two-dimensional array of nodes resembling the original string
        var stringTree = new Array();
        for(var line = 0;line < indicesLevels.length;line++) {
            stringTree.push(new Array());
            var level = 0;
            for(;level < indicesLevels[line].length && indicesLevels[line][level] == null;level++)
                stringTree[line].push(null);
            for(;level < indicesLevels[line].length;level++) {
                var start = indicesLevels[line][level][0];
                if(level+1 < indicesLevels[line].length) {
                    var end = indicesLevels[line][level+1][0];
                    stringTree[line].push(splicedString[line].substring(start,end)
                    .replace(/ /g,"").replace(/>/g,""));
                }
                else
                    stringTree[line].push(splicedString[line].substring(start)
                    .replace(/ /g,"").replace(/>/g,""));
            }
        }

        // Converts a string representation of a node into a node object (without children)
        var instantiateNode = function(nodeString) {
            if(nodeString == null) return null;
            else if(nodeString.length == 0) return anchor.scut.debug('SON');
            else if(nodeString.indexOf("^") != -1) return nodeString;
            var nodeString = nodeString.replace(/\(/g,"").replace(/\)/g,"");
            var params = nodeString.split(",");
            if(params[3]) params[3] = util.normalizeURI(params[3]);
            var nodeType = params[0]+params[1]+params[2];
            if(anchor.scut[nodeType]) {
                if(params[3]) {
                    if(anchor.debug) return anchor.scut.debug(nodeType,params[3]);
                    else return anchor.scut[nodeType](params[3]);
                } // Added debugging functionality
                else {
                    if(anchor.debug) return anchor.scut.debug(nodeType);
                    else return anchor.scut[nodeType](params[3]);
                }
            }
            alert('Unrecognized type of node: '+nodeType);
            return nodeString;
        }

        // Actual instantiation
        var instantiatedNodes = new Array();
        for(var line = 0;line < stringTree.length;line++) {
            var lineInstantiatedNodes = new Array();
            instantiatedNodes.push(lineInstantiatedNodes);
            for(var level = 0;level < indicesLevels[line].length;level++)
                lineInstantiatedNodes.push(instantiateNode(stringTree[line][level]));
        }

        // Links and returns the tree
        return function linkNodes(nodes,line,level) {
            if(nodes[line].length == level+1) return nodes[line][level];
            nodes[line][level].children = new Array();
            for(var endingLine = line;nodes[endingLine]&&(nodes[endingLine][level]===null||endingLine==line);endingLine++);
            for(var i = line;i < endingLine;i++) {
                var childrenLevel = level+1;
                if(nodes[i] && nodes[i][childrenLevel]) {
                    if(nodes[i][childrenLevel].constructor === String) {
                        var numNodes = util.indicesOf("^",nodes[i][childrenLevel]).length;
                        for(var j=i-1;numNodes > 0 && j >= 0;j--) {
                            if(nodes[j] && nodes[j][childrenLevel] != null && numNodes == 1)
                                nodes[i][childrenLevel] = nodes[j][childrenLevel];
                            if(nodes[j] && nodes[j][childrenLevel] != null) numNodes--;
                        }
                        if(numNodes > 0) nodes[line][level].children.push(null);
                        else nodes[line][level].children.push(nodes[i][childrenLevel]);
                    }
                    else
                        nodes[line][level].children.push(linkNodes(nodes,i,childrenLevel));
                }
            }
            return nodes[line][level];
        }(instantiatedNodes,0,0);
    }

    /********************************
     *  Utility Methods & Classes   *
     ********************************/
    var util = new function() {
        // Container object that is used to store fetched data
        this.Container = function(data) {
            if(data == null || data == undefined) this.data = new Array();
            else this.data = data;
        }
        this.Container.prototype.appendData = function(data) {
            this.data.push(data);
        }
        /***** Array methods ****/
        // Tests whether an array is empty
        this.isEmpty = function(array) {
            if(array == null) return true;
            else if(array.length == 0) return true;
            else return false;
        }
        // Prints the members of an array
        this.printArray = function(arr) {
            var str = "";
            for(var i = 0;i < arr.length;i++)
                str += arr[i]+"\n";
            return str;
        }
        // Sums the members of an array
        this.sumArray = function(arr) {
            var sum = 0;
            for(var i = 0;i < arr.length;i++)
                sum += arr[i];
            return sum;
        }
        /***** String methods *****/
        // Creates a blank string of length size
        this.createBlankString = function(size) {
            var str = "";
            for(var i = 0;i < size;i++)
                str += " ";
            return str;
        }
        // Returns an array of the indices of the char ch in str
        this.indicesOf = function(ch,str) {
            var indices = new Array();
            var index = str.indexOf(ch);
            while(index != -1) {
                indices.push(index);
                index = str.indexOf(ch,index+1);
            }
            return indices;
        }
        // replaces the chars between begIndex and endIndex;
        // inclusive and non-inclusive, respectively; with newStr
        this.insertString = function(str,newStr,begIndex, endIndex) {
            return str.substring(0,begIndex).concat(newStr).concat(str.substring(endIndex));
        }
        /***** URI methods *****/
        // Normalizes a URI of type 'base:child'
        this.normalizeURI = function(shortURI) {
            var base = shortURI.substring(0,shortURI.indexOf(":"));
            var obj = shortURI.substring(shortURI.indexOf(":")+1);
            //alert("Base: "+base+";   "+obj);
            return tabulator.ns[base](obj);
        }
        // Gets the base URI of a standard uri: base#child
        this.getBaseURI = function(uri) {
            if(uri.indexOf('#') >= 0)
                return uri.substring(0,uri.indexOf('#'));
            else
                return uri;
        }
        /**** Triple methods *****/
        // Yanks the objects out of an array of triples
        this.getObjects = function(triples) {
            if(util.isEmpty(triples)) return new Array();
            var objects = new Array();
            for(var i = 0;i < triples.length;i++)
                objects.push(triples[i].object);
            return objects;
        }
        /***** Debugging methods *****/
        // Debugs an object; prints source or null
        this.debug = function(obj) {
            if(obj == null) alert('null');
            else alert(obj.toSource());
            return obj;
        }
    }
}


/* Unused functions

        // Gets two bracket indices, within which there are no brackets
        function getBrackets(tree) {
            var left = indicesOf("[",tree);
            var right = indicesOf("]",tree);
            if(left.length != right.length) alert("Unequal number of brackets");
            if(left.length == 0 || right.length == 0) return [];
            var pair = [left[0],right[0]];
            for(var l = 0;l < left.length;l++)
                for(var r = 0;r < right.length;r++)
                    if(right[r]-left[l]<pair[1]-pair[0] && right[r]-left[l]>0) {
                        minim = right[r] - left[l];
                        pair = [left[l],right[r]];
                    }
            return pair;
        }

        // Returns the first char in a string that is not a space
        function firstNonspace(lineString) {
            return lineString.indexOf(lineString.replace(/ /g,"").charAt(0));
        }

        alert("searchByPredicate:\nuri: "+uri.toSource()+"\nsubject: "+subject.toSource()+"\ntriples: "+util.getObjects(triples).toSource());
        alert("searchByObjectType:\nuri: "+uri.toSource()+"\nsubject: "+subject.toSource()+"\nmatchingObjects: "+
                util.getObjects(matchingTriples).toSource());
        alert("searchBlankPatternNode:\nsubject: "+subject.toSource());

*/
