//  Origianl Author: Kennyluck
// Open Source MIT licence dig.csail.mit.edu

//   This code has migrated into rdflib, in sparqlUpdate.js

function updateCenter(kb){
    
    //require webdav
    var sparqlService = new tabulator.rdf.sparqlUpdate(kb);
    return {
    
    sparql: sparqlService,
    
    update_statement: function update_statement(st, callback, newObject) {
        //this._mutate_statement(st, callback, 'UPDATE', newObject);
        var st2 = $rdf.st(st.subject, st.predicate, newObject);
        return sparqlService.update([st], [st2], callback);
    },
    insert_statement: function insert_statement(st, callback) {
        dump("insert statement:"+st.toNT()+" into "+st.why+"\n");
        // this._mutate_statement(st, callback, 'INSERT');
        sparqlService.update([], [st], callback);
    },    
    delete_statement: function delete_statement(st, callback) {
        // this._mutate_statement(st, callback, 'DELETE');
        sparqlService.update([st], [], callback);
    },
    };//end of return
    
}
