/*
   This is a translator between computer-recognizable object identifiers (URIs) and
   human terms.
                                                                    Sunday 2007.07.22 kennyluck
*/
//ToDo: sorted array for optimization, I need a binary search tree... - Kenny
function Labeler(kb, LanguagePreference){
    this.kb = kb;
    // dump("\nLabeler: INITIALIZED  (...,"+LanguagePreference+")\n");
    var ns = tabulator.ns;
    var trim = function(str){return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};
    this.isLanguagePreferred = 10; //how much you like your language
    //this.lang=lang; // a universal version? how to sort?
    this.preferredLanguages = [];
    if (LanguagePreference){
      var order = LanguagePreference.split(',');
      for (var i=order.length-1;i>=0;i--)
	this.preferredLanguages.push(trim(order[i].split(";")[0]));
    }
    this.LanguagePreference = LanguagePreference;
    this.addLabelProperty(ns.link('message'),20); //quite a different semantic, cause confusion?
    this.addLabelProperty(ns.foaf('name'),10);
    this.addLabelProperty(ns.dc('title'),8);
    this.addLabelProperty(ns.rss('title'),6);   // = dc:title?
    this.addLabelProperty(ns.contact('fullName'),4);
    this.addLabelProperty(kb.sym('http://www.w3.org/2001/04/roadmap/org#name'),4);
    this.addLabelProperty(ns.foaf('nick'),3);
    this.addLabelProperty(ns.rdfs('label'),2);
    var lb=this;
    
    // Note that adding a newPropertyAction has retrospecive effect
    tabulator.kb.newPropertyAction(ns.rdfs('subPropertyOf'), function(formula,subject,predicate,object,why) {
        if (!object.sameTerm(ns.rdfs('label'))) return; // Not doing transitive closure yet
        lb.addLabelProperty(subject);
        return;
    });
/*        
        var hashP = subject.hashString();
        var already;
        if (object.sameTerm(ns.rdfs('label'))) already=lb.addLabelProperty(subject, 3);
        if (already) return;
        
        var sts = kb.statementsMatching(undefined, subject); // Where was the subproperty used?
        for (var i=0;i< sts.length;i++){  // Where is the subproperty used?
            var st = sts[i];
            if (typeof st.object.lang !='undefined' && st.object.lang!="" && st.object.lang != lb.lang
                            ) continue;
            if (st.object.value == undefined) continue; // not literal - just in case
            var label = st.object.value.toLowerCase();
            // Insert the new entry into the ordered list
            for (var i=0;i<lb.entry.length;i++){ // O(n) bad!
                if (label> lb.entry[i][0].toLowerCase()){
                    lb.entry.splice(i+1,0,[st.object,st.subject,3]);
                    break;
                }
            }
            lb.optimize([st.object,st.subject,3]);
        }
    });
*/

}

Labeler.prototype={
    //[label,subject,strength]
    entry: [],
    priority: [],   // Map hash to priority number
    labelDirectory:{},
    //returns a literal term
    label: function(term){
        if (typeof term == 'undefined') return undefined;
        var candidate=this.labelDirectory[term.hashString()];
        return candidate?candidate[0]:undefined;
    },



    //  Add a new label property:
    // - set a callback so we are notified of new labels
    //
    addLabelProperty: function(property, priority){
        // dump('    addLabelProperty: New label property:'+(property? ''+property:"@@")+'\n')
        if (tabulator.kb.propertyActions[property.hashString()]) return true; //this is already loaded
        if (priority) this.priority[property.hashString()] = priority;
        var lb = this;
        tabulator.kb.newPropertyAction(property, function (formula, subject, predicate, object,why){
            // dump('    addLabelProperty: New label:'+ (object? ''+object:"@@")+'\n')
            var hashP = predicate.hashString();
            var priority = lb.priority[hashP];
            if (priority == undefined) priority = 3;
	    var languageIndex = lb.preferredLanguages.indexOf(object.lang);
	    if (languageIndex >= 0)
	      priority = priority + (languageIndex + 1) * lb.isLanguagePreferred;
            // if (typeof object.lang !='undefined' && object.lang!="" && object.lang!=lb.lang) return;
            if (object.termType!='literal') return; //Request
            var label=object.value.toLowerCase();
            var entryVol=lb.entry.length;
            if (entryVol==0) 
                lb.entry.push([object,subject,priority]);
            else if (label>lb.entry[entryVol-1][0].value.toLowerCase()) 
                lb.entry.push([object,subject,priority])
            else{
                for (var i=0;i<entryVol;i++){ //O(n) bad!     Put in in order
                    if (label<lb.entry[i][0].value.toLowerCase()){
                        //lb.entry.splice(i+1,0,[label+">"+lb.entry[i][0].toLowerCase(),subject,priority]);
                        lb.entry.splice(i,0,[object,subject,priority]);
                        break;
                    }
                }
            }
            //tabulator.log.warn('Label: "'+object+'" for '+(''+subject).slice(-20)+
            //                    ', via:'+(''+predicate).slice(-20)) // @@
            lb.optimize([object,subject,priority]);
        });
    },


    // Entry is   Label, Thing labeled,   priority
    // Label Directory keeps the highest priority label for each thing.
    optimize: function(entry){
        var subjectID=entry[1].hashString();
        var preEntry=this.labelDirectory[subjectID];
        var prePriority=preEntry?preEntry[2]:0;
        if (entry[2] > prePriority) {
            this.labelDirectory[subjectID]=entry;
        }
    },
    search: function(searchString,limited){
        var label=searchString.toLowerCase(); //case insensitive
        var match=false;
        var results=[];
        var types=[];
        for (var i=0;i<(limited||this.entry.length);i++){   // What? limi
            var matchingString=this.entry[i][0].value.toLowerCase();
            if (!match && tabulator.rdf.Util.string_startswith(matchingString,label)) 
                match=true;
            else if (match &&!tabulator.rdf.Util.string_startswith(matchingString,label))
                break;
            if (match){
                if (tabulator.kb.whether(this.entry[i][1],tabulator.ns.rdf('type'),tabulator.ns.link('Request'))) continue;
                results.push(this.entry[i]);
                types.push(tabulator.kb.any(this.entry[i][1],tabulator.ns.rdf('type')));
            }
        }
        return [results,types];
    },
    
    // This is (only) used for when the user has asked to add data and now
    // needs to sepcify a predicate.
    // It is called with (usertext, undefined, 'predicate')
    //
    searchAdv: function(searchString, context, filterType){ //extends search
        var filter = (filterType=='predicate')?function(item)
        {return tabulator.kb.predicateIndex[item.hashString()]|| // used as a predicate?
                //should use transitive closure, but this takes too long
                tabulator.kb.whether(item,tabulator.ns.rdf('type'),tabulator.ns.rdf('Property'))||
                tabulator.kb.whether(item,tabulator.ns.rdf('type'),tabulator.ns.owl('DatatypeProperty'))||
                tabulator.kb.whether(item,tabulator.ns.rdf('type'),tabulator.ns.owl('ObjectProperty'));}:undefined;
        var label=searchString.toLowerCase(); //case insensitive
        var match=false;
        var results=[];
        var types=[];
        for (var i=0;i<this.entry.length;i++){
            var matchingString=this.entry[i][0].value.toLowerCase();
            if (!match && tabulator.rdf.Util.string_startswith(matchingString,label)) 
                match=true;
            else if (match &&!tabulator.rdf.Util.string_startswith(matchingString,label))
                break;
            if (match){
                if (tabulator.kb.whether(this.entry[i][1],tabulator.ns.rdf('type'),tabulator.ns.link('Request'))) continue;
                if (filter && filter(this.entry[i][1])){
                    results.push(this.entry[i]);
                    //ToDo: Context
                    types.push(tabulator.kb.any(this.entry[i][1],tabulator.ns.rdf('type')));
                }
            }
        }
        // dump('    labeler.searchAdv: this.entry.length = '+this.entry.length+
        //                    ', results.length='+results.length+'\n'); // TBL
        return [results,types];
    },
    debug:""
}
