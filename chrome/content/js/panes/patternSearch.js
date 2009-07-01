function PatternSearch() { // Encapsulates all of the methods and classes
    /*****************************
     *     Main Node Class       *
     *****************************/
    this.PatternNode = function(fetchMethod, searchMethod, children) {
        this.fetchMethod = fetchMethod;
        this.searchMethod = searchMethod;
        this.children = children;

        this.fetch = new function(subject) {
            if(subjects == null) return null;
            return this.fetchMethod(this.searchMethod(subjects), children);
        }   
    }

    /******************************
     *       Fetch Methods        *
     ******************************/
    this.fetchSingle = function(subjects) {
        if(subjects == null) return null;
        else if(subjects[0].termType === 'literal' || subjects[0].termType === 'symbol')
            return new DataContainer([subjects[0].toString()]);
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

    fetchAnd = function(subjects, children) { // Children of And nodes must not return arrays
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

    fetchMultipleOr = function(subjects, children) {
        if(subjects == null || children == null) return null;
        var dataContainers = new Array();
        for(var i = 0;i < children.length;i++) {
            fetchedData = this.fetchSingleOr(subjects, children);
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
                if(tabulator.kb.whether(objects[i],tabulator.ns.rdf('type'),desiredType))
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
     *      Utility Methods         *
     ********************************/
    function DataContainer(data) {
        if(data == null || data == undefined) this.data = new Array();
        else this.data = data;
        this.appendData = function(data) {
            this.data.push(data);
        }
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
}
