/*
 * File: RDFTreeSearcher.js
 * Purpose: SPARQLtoQuery is limited; this class allows one to set multiple search alternatives to find similar data.
 */

function RDFTreeSearcher() {
    /************************
     * TREEE ELEMENT CLASSES
     ************************/
    this.TreePredicateNode = function(uri, operator, isMultiple) {
        this.uri = uri;
        this.operator = operator;
        this.isMultiple = new Boolean(isMultiple).valueOf();
    }

    this.TreeTypeNode = function(uri, operator, isMultiple) {
        this.uri = uri;
        this.operator = operator;
        this.isMultiple = new Boolean(isMultiple).valueOf();
    }

    this.BlankTreeNode = function(operator, isMultiple) {
        this.uri = null;
        this.operator = operator;
        this.isMultiple = new Boolean(isMultiple).valueOf();
    }

    this.AndOperator = function(nodes) {
        this.nodes = nodes;
    }

    this.OrOperator = function(nodes) {
        this.nodes = nodes;
    }

    /*******************
     * Utility classes *
     *******************/
    function NodeDataContainer(data) {
        this.data = data;
        this.append = function(data) {
            this.data.push(data);
        }
        this.isEmpty = function() {
            return isEmpty(this.data);
        }
    }

    function MultipleNodeContainer(nodes) {
        this.nodeContainers = nodes;
        this.merge = function(nodeContainer2) {
            nodes2 = nodeContainer2.nodeContainers;
            this.nodeContainers = merge(this.nodeContainers(nodes2));
        }
        this.append = function(dataContainer) {
            this.nodeContainers.push(data);
        }
        this.isEmpty = function() {
            return isEmpty(this.nodeContainers);
        }
    }

    /*************************
     * MAIN SEARCHING METHOD *
     *************************/
    this.traverse = function(subject, node) {
        if(subject.termType === 'literal' && node == null) return new NodeDataContainer([subject.toString()]);
        else if(subject.termType === 'literal') return null;
        else if(subject.termType === 'bnode') { }
        else if(subject.termType === 'collection') { }
        else if(subject.termType === 'symbol' && node == null) return new NodeDataContainer([subject.toString()]); // Might need to change this.

        var triples = new Array();
        if(node instanceof this.TreePredicateNode) triples = filterByPredicate(subject, node.uri);
        else if(node instanceof this.TreeTypeNode) triples = filterByType(subject, node.uri);
        
        if(node instanceof this.BlankTreeNode) {
            if(node.operator == null || operator.nodes == null) return null; // Blank nodes need operators and can't tail
        }
        objects = getObjects(triples);

        var operator = node.operator;
        if(isEmpty(triples) && !(node instanceof this.BlankTreeNode)) return null;
        else if(!node.isMultiple) { // Single object lookup
            if(operator == null) {
                for(var i = 0;i < objects.length;i++) {
                    var searchData = this.traverse(objects[i], null);
                    if(searchData != null)
                        return searchData;
                }
                return null;
            }
            else if(operator instanceof this.OrOperator) {
                for(var i = 0;i < objects.length;i++)
                    for(var j = 0;j < operator.nodes.length;j++) {
                        var searchData = this.traverse(objects[i], operator.nodes[j]);
                        if(searchData == null) continue;
                        else if(searchData.data || searchData.nodeContainers)
                            return searchData;
                    }
                return null;
            }
            else if(operator instanceof this.AndOperator) {
                nodeContainer = new NodeDataContainer(new Array());
                for(var j = 0;j < operator.nodes.length;j++) {
                    for(var i = 0;i < objects.length;i++) {
                        var searchData = this.traverse(objects[i], operator.nodes[j]);
                        if(searchData == null) continue;
                        else if(searchData.data || searchData.nodeContainers) {
                            nodeContainer.push(searchData);
                            break;
                        }
                    }
                    return null;
                }
                return new NodeDataContainer(nodes);
            }
        }
        else {
            if(operator == null) {
                var nodeContainer = new MultipleNodeContainer(new Array());
                for(var i = 0;i < objects.length;i++) {
                    var searchData = this.traverse(objects[i], null);
                    if(searchData == null) continue;
                    else if(searchData.nodeContainers)
                        nodeContainer.merge(searchData);
                    else if(searchData.data)
                        nodeContainer.append(searchData);
                }
                if(nodeContainer.isEmpty()) return null;
                else return nodeContainer;
            }
            else if(operator instanceof this.OrOperator) {
                alert("MultiOr; "+objects.toSource()+"; "+operator.toSource());
                var nodeContainer = new MultipleNodeContainer(new Array());
                for(var i = 0;i < objects.length;i++) {
                    for(var j = 0;j < operator.nodes.length;j++) {
                        var searchData = this.traverse(objects[i], operator.nodes[j]);
                        if(searchData == null)
                            continue;
                        else if(searchData.nodeContainers) {
                            nodeContainer.merge(searchData);
                            break;
                        }
                        else if(searchData.data) {
                            nodeContainer.append(searchData);
                            break;
                        }
                    }
                }
                if(nodeContainer.isEmpty()) return null;
                else return nodeContainer;
            }
            // else if(operator instanceof "AndOperator") NOTE: Is it even logically sound to implement it?
        }               
    }

    /*******************
     * UTILITY METHODS *
     *******************/
    /*this.convertToArray(container) {
        var arr = new Array();
        if(isEmpty(container)) return new Array();
        else if(container.nodeContainers)
            for(var i = 0;i < container.nodeContainers.length;i++)
                arr.push(this.convertToArray(container.nodeContainers[i]));
        else if(container.data) {
            str = "";
            for(var i = 0;i < container.data.length;i++)
                str +*/

    function isEmpty(arr) {
        if(arr == null) return true;
        else if(arr.length == 0) return true;
        else return false;
    }

    function merge(arr1,arr2) {
        for(var i = 0;i < arr2.length;i++)
            arr1.append(arr2[i]);
    }

    function filterByPredicate(subject, predicate) {
        var triples = tabulator.kb.statementsMatching(subject, predicate);
        alert("filterByPredicate: "+triples.toSource());
        //alert(triples.toSource()+" "+subject.toSource()+" "+predicate.toSource());
        if(isEmpty(triples)) return new Array();
        else return triples;
    }

    function filterByType(subject,desiredType) { // Returns objects that are children of subject and of type desiredType
        var triples = tabulator.kb.statementsMatching(subject,null,null,null);
        var objects = getObjects(triples);
        alert("filterByType: "+objects.toSource()+" desiredType: "+desiredType.toSource());
        var matchingTriples = new Array();
        if(isEmpty(triples)) return matchingTriples;
        for(var i = 0;i < objects.length;i++)
            if(tabulator.kb.whether(objects[i],tabulator.ns.rdf('type'),desiredType))
                matchingTriples.push(triples[i]);
        return matchingTriples;
    }

    function getObjects(triples) {
        if(isEmpty(triples)) return new Array();
        var objects = new Array();
        for(var i = 0;i < triples.length;i++)
            objects.push(triples[i].object);
        return objects;
    }
}
