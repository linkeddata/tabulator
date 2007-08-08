/*
   This is a translator between computer-recognizable object identifiers (URIs) and
   human terms.
                                                                    Sunday 2007.07.22 kennyluck
*/
//ToDo: sorted array for optimization, I need a binary search tree... 
function Labeler(kb,lang){
    this.kb=kb;
    var ns = tabulator.ns;
    this.lang=lang; // a universal version? how to sort?
    this.addLabelProperty(ns.link('message'),20); //quite a different semantic, cause confusion?
    this.addLabelProperty(ns.foaf('name'),10);
    this.addLabelProperty(ns.dc('title'),8);
    this.addLabelProperty(ns.rss('title'),6);   // = dc:title?
    this.addLabelProperty(ns.contact('fullName'),4);
    this.addLabelProperty(kb.sym('http://www.w3.org/2001/04/roadmap/org#name'),4);
    this.addLabelProperty(ns.foaf('nick'),3);
    this.addLabelProperty(ns.rdfs('label'),2);
    var lb=this;
    this.kb.propertyAction[ns.rdfs('subPropertyOf').uri] = function(formula,subject,predicate,object,why){
        var hashP=subject.hashString();
        var already;
        if (object.sameTerm(ns.rdfs('label'))) already=lb.addLabelProperty(subject, 3);
        if (already) return;
        for (var i=0;i<this.kb.predicateIndex[hashP].length;i++){
            var st=kb.predicateIndex[hashP][i];
            if (typeof st.object.lang !='undefined' && st.object.lang!="" && st.object.lang!=this.lang) continue;
            var label=st.object.value.toLowerCase();
            for (var i=0;i<this.entry.length;i++){ //O(n) bad!
                if (label>this.entry[i][0].toLowerCase()){
                    lb.entry.splice(i+1,0,[st.object,st.subject,3]);
                    break;
                }
            }
            //lb.optimize(lb.entry[lb.entry.length-1]);
            lb.optimize([st.object,st.subject,3]);
        }
    }
}
Labeler.prototype={
//[label,subject,strength]
entry: [],
labelDirectory:{},
//returns a literal term
label: function(term){
    var candidate=this.labelDirectory[term.hashString()];
    return candidate?candidate[0]:undefined;
},
addLabelProperty: function(property, priority){
    var lb=this;
    /*
    for(var i=0;i<this.labelProperty.length;i++){
        if (priority >= this.labelProperty[i][1])
            this.labelProperty.splice(i,0,[property,priority]);
    }
    */
    if (this.kb.propertyAction[property.hashString()]) return true; //this is already loaded
    this.kb.propertyAction[property.hashString()]=function (formula,subject,predicate,object,why){
        if (typeof object.lang !='undefined' && object.lang!="" && object.lang!=lb.lang) return;
        if (object.termType!='literal') return; //Request
        var label=object.value.toLowerCase();
        //var hashS=subject.hashString();
        var entryVol=lb.entry.length;
        if (entryVol==0) 
            lb.entry.push([object,subject,priority]);
        else if (label>lb.entry[entryVol-1][0].value.toLowerCase()) 
            lb.entry.push([object,subject,priority])
        else{
            for (var i=0;i<entryVol;i++){ //O(n) bad!
                if (label<lb.entry[i][0].value.toLowerCase()){
                    //lb.entry.splice(i+1,0,[label+">"+lb.entry[i][0].toLowerCase(),subject,priority]);
                    lb.entry.splice(i,0,[object,subject,priority]);
                    break;
                }
            }
        }
        //lb.optimize(lb.entry[lb.entry.length-1]); //why is this not working.......
        lb.optimize([object,subject,priority]);
    }
},
optimize: function(entry){
    var subjectID=entry[1].hashString();
    var preEntry=this.labelDirectory[subjectID];
    var prePriority=preEntry?preEntry[2]:0;
    if (entry[2] > prePriority) {
        this.labelDirectory[subjectID]=entry;
    }
},
search: function(searchString,context,filterType){
    var label=searchString.toLowerCase(); //case insensitive
    var match=false;
    var results=[];
    var types=[];
    for (var i=0;i<this.entry.length;i++){
        var matchingString=this.entry[i][0].value.toLowerCase();
        if (!match && string_startswith(matchingString,label)) 
            match=true;
        else if (match &&!string_startswith(matchingString,label))
            break;
        if (match){
            if (this.kb.whether(this.entry[i][1],rdf('type'),tabulator.ns.link('Request'))) continue;
            results.push(this.entry[i]);
            types.push(this.kb.any(this.entry[i][1],rdf('type')));
        }
    }
    return [results,types];
},
searchAdv: function(searchString,context,filterType){ //extends search
    var filter = (filterType=='predicate')?function(item){return this.kb.predicateIndex[item.hashString()]}:
                                           undefined;
    var label=searchString.toLowerCase(); //case insensitive
    var match=false;
    var results=[];
    var types=[];
    for (var i=0;i<this.entry.length;i++){
        var matchingString=this.entry[i][0].value.toLowerCase();
        if (!match && string_startswith(matchingString,label)) 
            match=true;
        else if (match &&!string_startswith(matchingString,label))
            break;
        if (match){
            if (this.kb.whether(this.entry[i][1],rdf('type'),tabulator.ns.link('Request'))) continue;
            if (filter && filter(this.entry[i][1])){
                results.push(this.entry[i]);
                //ToDo: Context
                types.push(this.kb.any(this.entry[i][1],rdf('type')));
            }
        }
    }
    return [results,types];
},
debug:""
}