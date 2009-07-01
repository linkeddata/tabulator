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
            searchM = this.searchMethod(subject);
            fetchM = this.fetchMethod(searchM, children);
            return fetchM;
        }   
    }

    /******************************
     *       Fetch Methods        *
     ******************************/
    this.fetchSingle = function(subjects) {
        if(subjects == null) return null;
        else if(subjects[0].termType === 'literal' || subjects[0].termType === 'symbol')
            return new DataContainer([subjects[0].toString()]);
        else return null;
    }

    this.fetchMultiple = function(subjects) {
        if(subjects == null) return null;
        var dataContainers = new Array();
        for(var i = 0;i < subjects.length;i++)
            if(subjects[i] == null) continue;
            else if(subjects[i].termType === 'literal' || subjects[i].termType === 'symbol')
                dataContainers.push(new DataContainer([subjects[i].toString()]));
        if(isEmpty(dataContainers)) return null;
        else return dataContainers;
    }

    this.fetchSingleOr = function(subjects, children) {
        if(subjects == null || children == null) return null;
        for(var i = 0;i < subjects.length;i++)
            for(var j = 0;j < children.length;j++) {
                fetchedData = children[j].fetch(subjects[i]);
                if(fetchedData != null) return fetchedData;
            }
        return null;
    }

    this.fetchAnd = function(subjects, children) { // Children of And nodes must not return arrays
        if(subjects == null || children == null) return null;
        for(var i = 0;i < children.length;i++) {
            var dataContainer = new DataContainer();
            for(var j = 0;j < subjects.length;j++) {
                fetchedData = children[i].fetch(subjects[j]);
                if(fetchedData == null) break;
                else if(fetchedData.data) dataContainer.appendData(fetchedData.data)
                else if(fetchedData.length) break; // fetchAnd only works when each node returns one set of data
            }
            if(dataContainer.data.length == subjects.length) return dataContainer;
        }
        return null;
    }

    this.fetchMultipleOr = function(subjects, children) {
        if(subjects == null || children == null) return null;
        var dataContainers = new Array();
        for(var i = 0;i < children.length;i++) {
            fetchedData = anchor.fetchSingleOr(subjects, children); //TODO
            if(fetchedData == null) continue;
            else if(fetchedData.data) dataContainers.push(fetchedData);
            else if(fetchedData.length) // In case one child returns multiple DataContainers
                for(var j = 0;j < fetchedData.length;j++)
                    dataContainers.push(fetchedData[j]);
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
            else return getObjects(triples);
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
    //this.parseResults = function(results) {
        


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
}
