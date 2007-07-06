/* ToDos
   1. Declare RDFizers
   2. Handle datatype=javascript
   3. able to getElementBy clicking HTML elements
*/
var rav=[];
var RDFizers={}
RDFizers["javascript2rdf"]={}
RDFizers["javascript2rdf"].load=function(uri){
    var variableName=uri.slice(11);
    if (variableName=='var'){ //magicName
        function getElementByClick(e){
            var target=getTarget(e);
            rav.push(target);
            alert('rav['+(rav.length-1)+'] is set to the target '+target);
            window.removeEventListener('click',getElementByClick,false);
        }
        //document.getElementById('docHTML').addEventListener('click',function(){alert('test')},false);
        //window.onclick=function(e){alert('test');};
        //window.addEventListener('click',function(){alert('test')},false);
        window.addEventListener('click',getElementByClick,false);
    }else{ 
        var variable=eval(uri.slice(11));
        if (typeof variable=='undefined') return true; //a function, or a script
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
}
//commit test