function PatternSearch() { // Encapsulates all of the methods and classes
    /*****************************
     *     Main Node Class       *
     *****************************/
    anchor = this;
    this.PatternNode = function(searchMethod, fetchMethod, children) {
        this.searchMethod = searchMethod;
        this.fetchMethod = fetchMethod;
        this.children = children;

        this.fetch = function(subject) {
            var newTerm = AJAR_handleNewTerm(tabulator.kb, subject, subject);
            if(subject == null) return null;
            var searchM = this.searchMethod(subject);
            var fetchM = this.fetchMethod(searchM, children);
            return fetchM;
        }   
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
        for(var i = 0;i < subjects.length;i++) {;
            var dataContainer = new DataContainer();
            for(var j = 0;j < children.length;j++) {
                var fetchedData = children[j].fetch(subjects[i]);
                if(isEmpty(fetchedData) || fetchedData instanceof Array) break;
                else if(fetchedData.data) dataContainer.appendData(fetchedData.data);
            }
            if(dataContainer.data.length == children.length) return dataContainer;
        }
        return null;
    }

    this.fetchMultipleOr = function(subjects, children) {
        if(isEmpty(subjects) || isEmpty(children)) return null;
        var dataContainers = new Array();
        for(var i = 0;i < children.length;i++)
            for(var j = 0;j < subjects.length;j++) {
                var fetchedData = children[i].fetch(subjects[j]);
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
            for(var i = 0;i < results.data.length;i++)
                if(i < results.data.length-1)
                    datum += results.data[i]+" ";
                else
                    datum += results.data[i];
            values.push(datum);
        }
        return values;
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
}
