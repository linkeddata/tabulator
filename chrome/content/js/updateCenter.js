function updateCenter(kb){
    
    //require webdav
    var sparqlService = new sparql (kb);
    return {
    editMethod: function editMethod(uri){ //extends sparql.editable, by the way, I think a "document"
                                      //can be editable, but a general thing can't be.
        //{?document link:request ?request. ?request httph:ms-author-via ?protocol}
        //=> {?document :editable true}.
        var request = kb.any(kb.sym(uri), tabulator.ns.link("request"));
        if (request !== undefined) {//what case is this?
            return kb.any(request, tabulator.ns.httph("ms-author-via"));
        } else {
            throw "there is no 'request' for this document: "+uri;
        }
        return false;        
    },
    //!! sts = [statement, new object]
    update_statement: function update_statement(st, callback, newObject) {
        this._mutate_statement(st, callback, 'UPDATE', newObject);
    },
    insert_statement: function insert_statement(st, callback) {
        this._mutate_statement(st, callback, 'INSERT');
    },    
    delete_statement: function delete_statement(st, callback) {
        this._mutate_statement(st, callback, 'DELETE');
    },
    _mutate_statement: function mutate_statement(st, callback, mode, newObject){
        var docURI = st.why.uri;
        switch (this.editMethod(docURI).value){
            case 'SPARQL': //cool!
                try{
                    if (mode == 'INSERT'){
                        sparqlService.insert_statement(st, callback);
                    }else if (mode == 'DELETE'){
                        sparqlService.delete_statement(st, callback);
                    }else if (mode == 'UPDATE'){
                        var temp = sparqlService.update_statement(st);
                        temp.set_object(newObject, callback);
                    }
                }catch(e){throw e;}
                break;
            case 'DAV': //I don't like this at all, updating the whole document doesn't make any sense.
                try{
                    var documentString;
                    var request = kb.any(kb.sym(docURI), tabulator.ns.link("request"));
                
                    var sts = kb.statementsMatching(undefined, undefined, undefined, st.why);
                    var newSts = [];//it's necessary to make a copy to avoid
                                    //side-effects, this is tricky
                    for (var i=0;i<sts.length;i++)
                        newSts.push(sts[i]);                                     
                    if (mode == 'INSERT'){
                        newSts.push(st);
                    }else if (mode == 'DELETE'){
                        RDFArrayRemove(newSts, st);
                    }else if (mode == 'UPDATE'){
                        newSts.push(new RDFStatement(st.subject,st.predicate,newObject,st.why));
                        RDFArrayRemove(newSts, st);
                    }else{
                        throw "unknow mode @ updateCenter::_mutate_statement";
                    } 
                    // @@ slow with current store!
                    var sz = Serializer();
                    sz.suggestNamespaces(kb.namespaces);
                    sz.setBase(docURI);//??                    
                    var content_type = kb.the(request, tabulator.ns.httph("content-type")).value;            
                    switch(content_type){
                        case 'application/rdf+xml': 
                            documentString = sz.statementsToXML(newSts);
                            break;
                        case 'text/rdf+n3':
                        case 'text/n3':
                        case 'text/turtle':
                        case 'application/x-turtle':
                        case 'application/n3': //I saw this on a SIMILE page, should we support?
                            documentString = sz.statementsToN3(newSts);
                            break;
                        default:
                            throw "Content-type not supported";                                                                            
                    }
                    //webdav.client.prototype.PUT(docURI, documentString, callback);
                    //I can't use this...
                    var xhr = Util.XMLHTTPFactory();
                    xhr.onreadystatechange = function (){
                        if (xhr.readyState == 4){
                            //formula from sparqlUpdate.js, what about redirects?
                            var success = (!xhr.status || (xhr.status >= 200 && xhr.status < 300));
                            callback(docURI,success,xhr.responseText);
                        }
                    };
                    xhr.open('PUT', docURI, true);
                    //assume the server does PUT content-negotiation.
                    xhr.setRequestHeader('Content-type', content_type);//OK?
                    xhr.send(documentString);
                    tabulator.log.info("sending "+sts+"["+documentString+"] to +"+docURI);                 
                }catch(e){throw e;}
                break;
            case 'N3': //?? where is it?
                break;
            default:
                //I suggest we should provide a space from the wiki to the user, as I think
                //any opinion is valuable. But for now:            
                throw ("Unsupported protocol (or no protocol) for this document: "+docURI);                                 
        }
    }        
    };//end of return
    
}
