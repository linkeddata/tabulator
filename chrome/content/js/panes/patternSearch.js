/*
    Why patternSearch was created:
        Bibliographical data can be represented in many different ways. The
        goal of patternSearch is to provide a convenient way of establishing
        searching patterns and alternatives, so as to be able to collect data
        from a document without having to resort to nested arrays or complic-
        ated logical structures.
        These patterns are represented as trees of nodes, each of which has
        its own searching and fetch methods. Intermediary nodes fetch
        what their children nodes return; end nodes fetch literals (or URIs).
        If one specific pattern fails to encounter data, then fetch attempts
        to use the following patterns. Nested arrays of literals and contain-
        ers are returned and then parsed.

        search methods always begin with search; fetch methods also follow
        this pattern.
*/

function PatternSearch() { // Encapsulates all of the methods and classes
    /*****************************
     *     Main Node Class       *
     *****************************/
    anchor = this;
    this.PatternNode = function(searchMethod, fetchMethod, children) {
        this.searchMethod = searchMethod;
        this.fetchMethod = fetchMethod;
        this.children = children;
    }
    this.PatternNode.prototype.fetch = function(subject) {
        if(subject == null) return null;
        if(subject.type === 'Symbol')
            tabulator.sf.requestURI(getBaseURI(subject.uri));
        return this.fetchMethod(this.searchMethod(subject), this.children);
    }
    this.PatternNode.prototype.toString = function() {
        return this.children.toString();
    }

    /******************************
     *       Fetch Methods        *
     ******************************/
    this.fetchSingle = function(subjects) {
        if(isEmpty(subjects)) return null;
        else if(subjects[0].termType === 'literal' || subjects[0].termType === 'symbol')
            return new DataContainer([subjects[0].toString()]);
        else return null;
    }

    this.fetchMultiple = function(subjects) {
        if(isEmpty(subjects)) return null;
        var dataContainers = new Array();
        for(var i = 0;i < subjects.length;i++)
            if(subjects[i] == null) continue;
            else if(subjects[i].termType === 'literal' || subjects[i].termType === 'symbol')
                dataContainers.push(new DataContainer([subjects[i].toString()]));
        if(isEmpty(dataContainers)) return null;
        else return dataContainers;
    }

    this.fetchSingleOr = function(subjects, children) {
        if(isEmpty(subjects) || isEmpty(children)) return null;
        for(var i = 0;i < subjects.length;i++)
            for(var j = 0;j < children.length;j++) {
                var fetchedData = children[j].fetch(subjects[i]);
                if(fetchedData != null) return fetchedData;
            }
        return null;
    }

    this.fetchAnd = function(subjects, children) { // Children of And nodes must not return arrays
        if(isEmpty(subjects) || isEmpty(children)) return null;
        for(var i = 0;i < subjects.length;i++) {
            var dataContainer = new DataContainer();
            for(var j = 0;j < children.length;j++) {
                var fetchedData = children[j].fetch(subjects[i]);
                if(isEmpty(fetchedData) || fetchedData instanceof Array) break;
                else if(fetchedData instanceof DataContainer) dataContainer.appendData(fetchedData); //@@
            }
            if(dataContainer.data.length == children.length) return dataContainer;
        }
        return null;
    }

    this.fetchMultipleOr = function(subjects, children) {
        if(isEmpty(subjects) || isEmpty(children)) return null;
        var dataContainers = new Array();
        for(var i = 0;i < subjects.length;i++)
            for(var j = 0;j < children.length;j++) {
                var fetchedData = children[j].fetch(subjects[i]);
                if(isEmpty(fetchedData)) continue;
                else {
                    if(fetchedData instanceof DataContainer) dataContainers.push(fetchedData);
                    else if(fetchedData instanceof Array) // In case one child returns multiple DataContainers
                        for(var k = 0;k < fetchedData.length;k++)
                            dataContainers.push(fetchedData[k]);
                    break;
                }
            }
        if(dataContainers.length == 0) return null;
        else return dataContainers;
    }

    //this.fetchMultipleAggregate = function(


    /****************************
     *     Search Methods       *
     ****************************/
    this.searchByPredicate = function(uri) {
        return function(subject) {
            var triples = tabulator.kb.statementsMatching(subject, uri);
            if(isEmpty(triples)) return new Array();
            return getObjects(triples);
        }
    }

    this.searchByObjectType = function(uri) {
        return function(subject) {
            var triples = tabulator.kb.statementsMatching(subject,null,null,null);
            var objects = getObjects(triples);
            var matchingTriples = new Array();
            if(isEmpty(triples)) return matchingTriples;
            for(var i = 0;i < objects.length;i++)
                if(tabulator.kb.whether(objects[i],tabulator.ns.rdf('type'),uri))
                    matchingTriples.push(triples[i]);
            return getObjects(matchingTriples);
        }
    }

    this.searchBlankPatternNode = function() {
        return function(subject) {
            return [subject];
        }
    }


    /********************************
     *  Utility Methods & Classes   *
     ********************************/
    function DataContainer(data) {
        if(data == null || data == undefined) this.data = new Array();
        else this.data = data;
    }
    DataContainer.prototype.appendData = function(data) {
        this.data.push(data);
    }

    function isEmpty(array) {
        if(array == null) return true;
        else if(array.length == 0) return true;
        else return false;
    }

    function getObjects(triples) {
        if(isEmpty(triples)) return new Array();
        var objects = new Array();
        for(var i = 0;i < triples.length;i++)
            objects.push(triples[i].object);
        return objects;
    }

    // Returns an array of strings
    this.parseResults = function(results) {
        if(isEmpty(results)) return null;
        var values = new Array();
        if(results instanceof Array) {
            for(var i = 0;i < results.length;i++) {
                var subValues = anchor.parseResults(results[i]);
                if(subValues == null) continue;
                else if(subValues instanceof Array)
                    for(var j = 0;j < subValues.length;j++)
                        values.push(subValues[j]);
            }
        }
        else if(results instanceof DataContainer) {
            var datum = "";
            for(var i = 0;i < results.data.length;i++) {
                var str = "";
                if(results.data[i] instanceof Array) {
                    if(results.data[i][0].constructor === String) // "Hello" instanceof String -> false
                        str = results.data[i].toString();
                    else if(results.data[i][0] instanceof DataContainer)
                        str = this.parseResults(results.data[i][0]);
                }
                else if(results.data[i].constructor === String)
                    str = results.data[i].toString();
                else if(results.data[i] instanceof DataContainer)
                    str = this.parseResults(results.data[i]);
                datum += str;
                if(i < results.data.length-1) datum += " ";
            }
            values.push(datum);
        }
        return values;
    }

    function getBaseURI(uri) {
        if(uri.indexOf('#') >= 0)
            return uri.substring(0,uri.indexOf('#'));
        else
            return uri;
    }

    this.debugStatement = function(obj) {
        if(obj == null) alert('null');
        else alert(obj.toSource());
        return obj;
    }


    /**********************************
     *   Shortcuts & Abbreviations    *
     **********************************/
    this.MultipleOrTypeNode = function(uri, children) {
        return new this.PatternNode(this.searchByObjectType(uri),this.fetchMultipleOr,children);
    }
    this.MultipleOrPredicateNode = function(uri, children) {
        return new this.PatternNode(this.searchByPredicate(uri),this.fetchMultipleOr,children);
    }
    this.MultipleTypeEndNode = function(uri) {
        return new this.PatternNode(this.searchByObjectType(uri),this.fetchMultiple);
    }
    this.MultiplePredicateEndNode = function(uri) {
        return new this.PatternNode(this.searchByPredicate(uri),this.fetchMultiple);
    }
    this.SingleOrTypeNode = function(uri, children) {
        return new this.PatternNode(this.searchByObjectType(uri),this.fetchSingleOr,children);
    }
    this.SingleOrPredicateNode = function(uri, children) {
        return new this.PatternNode(this.searchByPredicate(uri),this.fetchSingleOr,children);
    }
    this.SingleTypeEndNode = function(uri) {
        return new this.PatternNode(this.searchByObjectType(uri),this.fetchSingle);
    }
    this.SinglePredicateEndNode = function(uri) {
        return new this.PatternNode(this.searchByPredicate(uri),this.fetchSingle);
    }
    this.AndTypeNode = function(uri, children) {
        return new this.PatternNode(this.searchByObjectType(uri),this.fetchAnd,children);
    }
    this.AndPredicateNode = function(uri, children) {
        return new this.PatternNode(this.searchByPredicate(uri),this.fetchAnd,children);
    }
    this.MultipleOrBlankNode = function(children) {
        return new this.PatternNode(this.searchBlankPatternNode(),this.fetchMultipleOr,children);
    }
    this.SingleOrBlankNode = function(children) {
        return new this.PatternNode(this.searchBlankPatternNode(),this.fetchSingleOr,children);
    }
    this.AndBlankNode = function(children) {
        return new this.PatternNode(this.searchBlankPatternNode(),this.fetchAnd,children);
    }

    this.MOTN = this.MultipleOrTypeNode;
    this.MOPN = this.MultipleOrPredicateNode;
    this.MTEN = this.MultipleTypeEndNode;
    this.MPEN = this.MultiplePredicateEndNode;
    this.SOTN = this.SingleOrTypeNode;
    this.SOPN = this.SingleOrPredicateNode;
    this.STEN = this.SingleTypeEndNode;
    this.SPEN = this.SinglePredicateEndNode;
    this.APN = this.AndPredicateNode;
    this.ATN = this.AndTypeNode;
    this.MOBN = this.MultipleOrBlankNode;
    this.SOBN = this.SingleOrBlankNode;
    this.ABN = this.AndBlankNode;

    /*********************************
     *    Special Syntax Parser      *
     *********************************/
    this.parseToTree = function(stringTree) {
        // takes in another tree that is placed within brackets and integrates it into the new tree
        function reallocate(tree) {
            return tree; // For now.
        }
        // Returns the first char in a string that is not a space
        function firstNonSpaceCharLoc(lineString) {
            for(var index = 0;index < lineString.length;index++)
                if(str.charAt(index) !== " ") return index;
            return -1;
        }
        // Returns the level of the node in the tree
        function nodeLevel(currentIndex,currentLine,indicesLevels) {
            for(var line = currentLine-1;line >= 0;line--)
                for(var index = 0;index < indicesLevels[line].length;index++)
                    if(indicesLevels[line][index][0] == currentIndex)
                        return indicesLevels[line][index][1];
            return indicesLevels[currentLine][indicesLevels[currentLine].length-1];
        }
        // Returns an array of the indices of the char ch in str
        function indicesOf(ch,str) {
            var indices = new Array();
            var index = str.indexOf(ch);
            while(index != -1) {
                indices.push(index);
                index = str.indexOf(ch,index+1);
            }
            return indices;
        }

        // Builds a two-dimensional array of doubles with the level and index of each '>'
        var splicedString = reallocate(stringTree).replace(" ^"," >^").split("\n");
        var indicesLevels = new Array();
        for(var line = 0;line < splicedString.length;line++) {
            indicesLevels.push(new Array());
            var lineIndices = indicesOf(">",splicedString[line]);
            var levelOffset = 0;
            if(line > 0) levelOffset = nodeLevel(lineIndices[0],line,indicesLevels);
            else { lineIndices.push(0); lineIndices.sort(function(a,b){return a - b;}); }
            for(var level = 0;level < lineIndices.length;level++)
                indicesLevels[line].push([lineIndices[level],level+levelOffset])
        }
        alert(indicesLevels.toSource());
        

        // Builds a two-dimensional array of nodes resembling the original string
        var stringTree = new Array();
        for(var line = 0;line < indicesLevels.length;line++) {
            stringTree.push(new Array());
            for(var level = 0;level < indicesLevels[line][0][1];level++)
                stringTree[line].push(null);
            for(var level = 0;level < indicesLevels[line].length;level++) {
                var start = indicesLevels[line][level][0];
                if(level+1 < indicesLevels[line].length) {
                    var end = indicesLevels[line][level+1][0];
                    stringTree[line].push(splicedString[line].substring(start,end)
                    .replace(" ","").replace(">",""));
                }
                else
                    stringTree[line].push(splicedString[line].substring(start)
                    .replace(" ","").replace(">",""));
            }
        }
        alert(stringTree.toSource());
        // ^^ WORKS TILL HERE
    }
    function printArr(arr) {
        str = "";
        for(var i = 0;i < arr.length;i++)
            str += arr[i]+"\n";
        return str;
    }
}
