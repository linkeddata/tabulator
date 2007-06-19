/* ToDos
   1. Declare RDFizers
   2. Handle datatype=javascript
   3. able to getElementBy clicking HTML elements
*/
var RDFizers={}
RDFizers["javascript2rdf"]={}
RDFizers["javascript2rdf"].load=function(uri){
    var variable=eval(uri.slice(11));
    for (var propertyName in variable){
        switch (typeof variable[propertyName]){
            case 'number':
            case 'string':
            case 'function':
                kb.add(kb.sym(uri),kb.sym(uri+"#"+propertyName),kb.literal(variable[propertyName]));
                break;
            case 'object':
                kb.add(kb.sym(uri),kb.sym(uri+"#"+propertyName),kb.sym(uri+"['"+propertyName+"']"));
                break;
            default:
        }
    }
}