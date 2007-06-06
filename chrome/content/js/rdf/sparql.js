//Converting between SPARQL queries and the tabulator query API

/*

function SQuery ()
{
	this.terms = [];
	return this;
}
	
STerm.prototype.toString = STerm.val;
SQuery.prototype.add = function (str) {this.terms.push()}*/

function queryToSPARQL (query)
{	
	var indent=0;
	function getSelect (query)
	{
		var str=addIndent()+"SELECT ";
		for (i=0;i<query.vars.length;i++)
			str+=query.vars[i]+" ";
		str+="\n";
		return str;
	}
	
	function getPattern (pat)
	{
		var str = "";
		var st = pat.statements;
		for (x in st)
		{
			tdebug("Found statement: "+st)
			str+=addIndent()+st[x]+"\n";
		}
		return str;
	}
	
	function getConstraints (pat)
	{
		var str="";
		for (v in pat.constraints)
		{
			var foo = pat.constraints[v]
			str+=addIndent()+"FILTER ( "+foo.describe(v)+" ) "+"\n"
		}
		return str;
	}
	
	function getOptionals (pat)
	{
		var str = ""
		for (var x=0;x<pat.optional.length;x++)
		{
			//alert(pat.optional.termType)
			tdebug("Found optional query")
			str+= addIndent()+"OPTIONAL { "+"\n";
			indent++;
			str+= getPattern (pat.optional[x])
			str+= getConstraints (pat.optional[x])
			str+= getOptionals (pat.optional[x])
			indent--;
			str+=addIndent()+"}"+"\n";
		}
	return str;
	}
	
	function getWhere (pat)
	{
		var str = addIndent() + "WHERE \n" + "{ \n";
		indent++;
		str+= getPattern (pat);
		str+= getConstraints (pat);
		str+= getOptionals (pat);
		indent--;
		str+="}"
		return str;
	}
	
	function addIndent()
	{
		var str="";
		for (i=0;i<indent;i++)
			str+="    ";
		return str;
	}
	
	function getSPARQL (query)
	{
		return getSelect(query) + getWhere(query.pat);
	}
		
	return getSPARQL (query)
}

/**
 * @SPARQL: SPARQL text that is converted to a query object which is returned.
 * @testMode: testing flag. Prevents loading of sources.
 */
 
function SPARQLToQuery (SPARQL, testMode)
{
	//AJAR_ClearTable();
	var variableHash = []
	function makeVar(name) {
		if (variableHash[name])
			return variableHash[name]
		var newVar = kb.variable(name);
		variableHash[name] = newVar;
		return newVar
	}
	
	//term type functions			
	function isRealText(term) { return (typeof term == 'string' && term.match(/[^ \n\t]/)) }
	function isVar(term) { return (typeof term == 'string' && term.match(/^[\?\$]/)) }
	function fixSymbolBrackets(term) { if (typeof term == 'string') return term.replace(/^&lt;/,"<").replace(/&gt;$/,">"); else return term }
	function isSymbol(term) { return (typeof term == 'string' && term.match(/^<[^>]*>$/)) }
	function isBnode(term) { return (typeof term == 'string' && (term.match(/^_:/)||term.match(/^[]$/))) }
	function isPrefix(term) { return (typeof term == 'string' && term.match(/:$/)) }
	function isPrefixedSymbol(term) { return (typeof term == 'string' && term.match(/^:|^[^_][^:]*:/)) } 
	function getPrefix(term) { var a = term.split(":"); return a[0] }
	function getSuffix(term) { var a = term.split(":"); return a[1] }
	function removeBrackets(term) { if (isSymbol(term)) {return term.slice(1,term.length-1)} else return term }	
	//takes a string and returns an array of strings and RDFLiterals in the place of literals
	function parseLiterals (str)
	{
		//var sin = (str.indexOf(/[ \n]\'/)==-1)?null:str.indexOf(/[ \n]\'/), doub = (str.indexOf(/[ \n]\"/)==-1)?null:str.indexOf(/[ \n]\"/);
		var sin = (str.indexOf("'")==-1)?null:str.indexOf("'"), doub = (str.indexOf('"')==-1)?null:str.indexOf('"');
		//alert("S: "+sin+" D: "+doub);
		if (!sin && !doub)
		{
			var a = new Array(1);
			a[0]=str;
			return a;
		}	
		var res = new Array(2);
		if (!sin || (doub && doub<sin)) {var br='"'; var ind = doub}
		else if (!doub || (sin && sin<doub)) {var br="'"; var ind = sin}
		else {terror ("SQARQL QUERY OOPS!"); return res}
		res[0] = str.slice(0,ind);
		var end = str.slice(ind+1).indexOf(br);
		if (end==-1) 
		{
			terror("SPARQL parsing error: no matching parentheses in literal "+str);
			return str;
		}
		//alert(str.slice(end+ind+2).match(/^\^\^/))
		if (str.slice(end+ind+2).match(/^\^\^/))
		{
			var end2 = str.slice(end+ind+2).indexOf(" ")
			//alert(end2)
			res[1]=kb.literal(str.slice(ind+1,ind+1+end),"",kb.sym(removeBrackets(str.slice(ind+4+end,ind+2+end+end2))))
			//alert(res[1].datatype.uri)
			res = res.concat(parseLiterals(str.slice(end+ind+3+end2)));
		}
		else if (str.slice(end+ind+2).match(/^@/))
		{
			var end2 = str.slice(end+ind+2).indexOf(" ")
			//alert(end2)
			res[1]=kb.literal(str.slice(ind+1,ind+1+end),str.slice(ind+3+end,ind+2+end+end2),null)
			//alert(res[1].datatype.uri)
			res = res.concat(parseLiterals(str.slice(end+ind+2+end2)));
		}
		
		else 
		{
		res[1]=kb.literal(str.slice(ind+1,ind+1+end),"",null)
		tinfo("Literal found: "+res[1]);
		res = res.concat(parseLiterals(str.slice(end+ind+2))); //finds any other literals
		}
		return res;
	}
	
	
	function spaceDelimit (str)
	{
		var str = str.replace(/\(/g," ( ").replace(/\)/g," ) ").replace(/</g," <").replace(/>/g,"> ").replace(/{/g," { ").replace(/}/g," } ").replace(/[\t\n\r]/g," ").replace(/; /g," ; ").replace(/\. /g," . ").replace(/, /g," , ");
		tinfo("New str into spaceDelimit: \n"+str)
		var res=[];
		var br = str.split(" ");
		for (x in br)
		{
			if (isRealText(br[x]))
				res = res.concat(br[x]);
		}
		return res;
	}
	
	function replaceKeywords(input) {
		var strarr = input;
		for (x=0;x<strarr.length;x++)
		{
			if (strarr[x]=="a") strarr[x] = "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>";
			if (strarr[x]=="is" && strarr[x+2]=="of") 
			{
				strarr.splice(x,1);
				strarr.splice(x+1,1) ;
				var s = strarr[x-1];
				strarr[x-1] = strarr[x+1];
				strarr[x+1] = s;
			}
		}
		return strarr;
	}
	
	function toTerms (input)
	{
		var res = []
		for (x=0;x<input.length;x++)
		{
			if (typeof input[x] != 'string') { res[x]=input[x]; continue }
			input[x]=fixSymbolBrackets(input[x])
			if (isVar(input[x]))
				res[x] = makeVar(input[x].slice(1));
			else if (isBnode(input[x]))
			{
				tinfo(input[x]+" was identified as a bnode.")
				res[x] = kb.bnode();
			}
			else if (isSymbol(input[x]))
			{
				tinfo(input[x]+" was identified as a symbol.");
				res[x] = kb.sym(removeBrackets(input[x]));
			}
			else if (isPrefixedSymbol(input[x]))
			{
				tinfo(input[x]+" was identified as a prefixed symbol");
				if (prefixes[getPrefix(input[x])])
					res[x] = kb.sym(input[x] = prefixes[getPrefix(input[x])]+getSuffix(input[x]));
				else
				{
					terror("SPARQL error: "+input[x]+" with prefix "+getPrefix(input[x])+" does not have a correct prefix entry.")
					res[x]=input[x]
				}
			}
			else res[x]=input[x];
		}
		return res;
	}
	
	function tokenize (str)
	{
		var token1 = parseLiterals(str);
		var token2=[];
		for (x in token1)
		{
			if (typeof token1[x] == 'string')
				token2=token2.concat(spaceDelimit(token1[x]));
			else
				token2=token2.concat(token1[x])
		}
	token2 = replaceKeywords(token2);
	tinfo("SPARQL Tokens: "+token2);
	return token2;
    }
    
    //CASE-INSENSITIVE
	function arrayIndexOf (str,arr)
	{
		for (i=0; i<arr.length; i++)
		{
			if (typeof arr[i] != 'string') continue;
			if (arr[i].toLowerCase()==str.toLowerCase())
				return i;
		}
		//twarn("No instance of "+str+" in array "+arr);
		return null;
	}
	
	//CASE-INSENSITIVE
	function arrayIndicesOf (str,arr)
	{
		var ind = [];
		for (i=0; i<arr.length; i++)
		{
			if (typeof arr[i] != 'string') continue;
			if (arr[i].toLowerCase()==str.toLowerCase())
				ind.push(i)
		}
		return ind;
	}
				
	
	function setVars (input,query)
	{
		tinfo("SPARQL vars: "+input);
		for (x in input)
		{
			if (isVar(input[x]))
			{
				tinfo("Added "+input[x]+" to query variables from SPARQL");
				var v = makeVar(input[x].slice(1));
				query.vars.push(v);
				v.label=input[x].slice(1);

			}
			else
				twarn("Incorrect SPARQL variable in SELECT: "+input[x]);
		}
	}
	

	function getPrefixDeclarations (input)
	{
		
		var prefInd = arrayIndicesOf ("PREFIX",input), res = [];
		for (i in prefInd)
		{
			var a = input[prefInd[i]+1], b = input[prefInd[i]+2];
			if (!isPrefix(a))
				terror("Invalid SPARQL prefix: "+a);
			else if (!isSymbol(b))
				terror("Invalid SPARQL symbol: "+b);
			else
			{
				tinfo("Prefix found: "+a+" -> "+b);
				var pref = getPrefix(a), symbol = removeBrackets(b);
				res[pref]=symbol;
			}
		}
		return res;
	}
	
	function getMatchingBracket(arr,open,close)
	{
		tinfo("Looking for a close bracket of type "+close+" in "+arr);
		var index = 0
		for (i=0;i<arr.length;i++)
		{
			if (arr[i]==open) index++;
			if (arr[i]==close) index--;
			if (index<0) return i;
		}
		terror("Statement had no close parenthesis in SPARQL query");
		return 0;
	}
	
	function setConstraint(input,pat)
	{
		if (input.length == 3 && input[0].termType=="variable" && (input[2].termType=="symbol" || input[2].termType=="literal"))
		{
			if (input[1]=="=")
			{
				tdebug("Constraint added: "+input)
				pat.constraints[input[0]]=new constraintEqualTo(input[2])
			}
			else if (input[1]==">")
			{
				tdebug("Constraint added: "+input)
				pat.constraints[input[0]]=new constraintGreaterThan(input[2])
			}
			else if (input[1]=="<")
			{
				tdebug("Constraint added: "+input)
				pat.constraints[input[0]]=new constraintLessThan(input[2])
			}
			else
				twarn("I don't know how to handle the constraint: "+input);
		}
		else if (input.length == 6 && typeof input[0] == 'string' && input[0].toLowerCase() == 'regexp' 
					&& input[1] == '(' && input[5] == ')' && input[3] == ',' && input[4].termType == 'variable'
					&& input[2].termType == 'literal')
					{
						tdebug("Constraint added: "+input)
						pat.constraints[input[4]]=new constraintRegexp(input[2].value)
					}
		
			//twarn("I don't know how to handle the constraint: "+input);
		
		//alert("length: "+input.length+" input 0 type: "+input[0].termType+" input 1: "+input[1]+" input[2] type: "+input[2].termType);
	}
	

	
	function setOptional (terms, pat)
	{
		tdebug("Optional query: "+terms+" not yet implemented.");
		var opt = kb.formula();
		setWhere (terms, opt)
		pat.optional.push(opt);
	}
	
	function setWhere (input,pat)
	{
		var terms = toTerms(input)
		tdebug("WHERE: "+terms)
		//var opt = arrayIndicesOf("OPTIONAL",terms);
		while (arrayIndexOf("OPTIONAL",terms))
		{
			opt = arrayIndexOf("OPTIONAL",terms)
			tdebug("OPT: "+opt+" "+terms[opt]+" in "+terms);
			if (terms[opt+1]!="{") twarn("Bad optional opening bracket in word "+opt)
			var end = getMatchingBracket(terms.slice(opt+2),"{","}")
			if (end == -1) terror("No matching bracket in word "+opt)
			else
			{
				setOptional(terms.slice(opt+2,opt+2+end),pat);
				//alert(pat.statements[0].toNT())
				opt = arrayIndexOf("OPTIONAL",terms)
				end = getMatchingBracket(terms.slice(opt+2),"{","}")
				terms.splice(opt,end+3)
			}
		}
		tdebug("WHERE after optionals: "+terms)
		while (arrayIndexOf("FILTER",terms))
		{
			var filt = arrayIndexOf("FILTER",terms);
			if (terms[filt+1]!="(") twarn("Bad filter opening bracket in word "+filt);
			var end = getMatchingBracket(terms.slice(filt+2),"(",")")
			if (end == -1) terror("No matching bracket in word "+filt)
			else
			{
				setConstraint(terms.slice(filt+2,filt+2+end),pat);
				filt = arrayIndexOf("FILTER",terms)
				end = getMatchingBracket(terms.slice(filt+2),"(",")")
				terms.splice(filt,end+3)
			}
		}
		tdebug("WHERE after filters and optionals: "+terms)
		extractStatements (terms,pat)	
	}
	
	function extractStatements (terms, formula)
	{
		var arrayZero = new Array(1); arrayZero[0]=-1;  //this is just to add the beginning of the where to the periods index.
		var per = arrayZero.concat(arrayIndicesOf(".",terms));
		var stat = []
		for (x=0;x<per.length-1;x++)
			stat[x]=terms.slice(per[x]+1,per[x+1])
		//Now it's in an array of statements
		for (x in stat)                             //THIS MUST BE CHANGED FOR COMMA, SEMICOLON
		{
			tinfo("s+p+o "+x+" = "+stat[x])
			var subj = stat[x][0]
			stat[x].splice(0,1)
			var sem = arrayZero.concat(arrayIndicesOf(";",stat[x]))
			sem.push(stat[x].length);
			var stat2 = []
			for (y=0;y<sem.length-1;y++)
				stat2[y]=stat[x].slice(sem[y]+1,sem[y+1])
			for (x in stat2)
			{
				tinfo("p+o "+x+" = "+stat[x])
				var pred = stat2[x][0]
				stat2[x].splice(0,1)
				var com = arrayZero.concat(arrayIndicesOf(",",stat2[x]))
				com.push(stat2[x].length);
				var stat3 = []
				for (y=0;y<com.length-1;y++)
					stat3[y]=stat2[x].slice(com[y]+1,com[y+1])
				for (x in stat3)
				{
					var obj = stat3[x][0]
					tinfo("Subj="+subj+" Pred="+pred+" Obj="+obj)
					formula.add(subj,pred,obj)
				}
			}
		}
	}
					
		
	//*******************************THE ACTUAL CODE***************************//	
	tinfo("SPARQL input: \n"+SPARQL);
	var q = new Query();
	var sp = tokenize (SPARQL); //first tokenize everything
	var prefixes = getPrefixDeclarations(sp);
	if (!prefixes["rdf"]) prefixes["rdf"]="http://www.w3.org/1999/02/22-rdf-syntax-ns#";
	if (!prefixes["rdfs"]) prefixes["rdfs"]="http://www.w3.org/2000/01/rdf-schema#";
	var selectLoc = arrayIndexOf("SELECT", sp), whereLoc = arrayIndexOf("WHERE", sp);
	if (selectLoc<0 || whereLoc<0 || selectLoc>whereLoc)
	{
		terror("Invalid or nonexistent SELECT and WHERE tags in SPARQL query");
		return false;
	}
	
	setVars (sp.slice(selectLoc+1,whereLoc),q);
	setWhere (sp.slice(whereLoc+2,sp.length-1),q.pat);
	
    if (testMode) return q;
    for (x in q.pat.statements)
    {
	var st = q.pat.statements[x]
	if (st.subject.termType == 'symbol'
	    /*&& sf.isPending(st.subject.uri)*/) { //This doesn't work.
	    sf.requestURI(st.subject.uri,"sparql:"+st.subject)
	}
	if (st.object.termType == 'symbol'
	    /*&& sf.isPending(st.object.uri)*/) {
	    sf.requestURI(st.object.uri,"sparql:"+st.object)
	}
    }
    //alert(q.pat);
    return q;
    //checkVars()
    
    //*******************************************************************//
}

function SPARQLResultsInterpreter (xml, callback, doneCallback)
{

	function isVar(term) { return (typeof term == 'string' && term.match(/^[\?\$]/)) }
	function fixSymbolBrackets(term) { if (typeof term == 'string') return term.replace(/^&lt;/,"<").replace(/&gt;$/,">"); else return term }
	function isSymbol(term) { return (typeof term == 'string' && term.match(/^<[^>]*>$/)) }
	function isBnode(term) { return (typeof term == 'string' && (term.match(/^_:/)||term.match(/^[]$/))) }
	function isPrefix(term) { return (typeof term == 'string' && term.match(/:$/)) }
	function isPrefixedSymbol(term) { return (typeof term == 'string' && term.match(/^:|^[^_][^:]*:/)) } 
	function getPrefix(term) { var a = term.split(":"); return a[0] }
	function getSuffix(term) { var a = term.split(":"); return a[1] }
	function removeBrackets(term) { if (isSymbol(term)) {return term.slice(1,term.length-1)} else return term }	
	
	function parsePrefix(attribute)
	{
		if (!attribute.name.match(/^xmlns/))
			return false;
		
		var pref = attribute.name.replace(/^xmlns/,"").replace(/^:/,"").replace(/ /g,"");
		prefixes[pref]=attribute.value;
		tinfo("Prefix: "+pref+"\nValue: "+attribute.value);
	}
	
	function handleP (str)  //reconstructs prefixed URIs
	{
		if (isPrefixedSymbol(str))
			var pref = getPrefix(str), suf = getSuffix(str);
		else
			var pref = "", suf = str;
		if (prefixes[pref])
			return prefixes[pref]+suf;
		else
			terror("Incorrect SPARQL results - bad prefix");
	}
	
	function xmlMakeTerm(node)
	{
		//alert("xml Node name: "+node.nodeName+"\nxml Child value: "+node.childNodes[0].nodeValue);
		var val=node.childNodes[0]
		for (var x=0; x<node.childNodes.length;x++)
			if (node.childNodes[x].nodeType==3) { val=node.childNodes[x]; break; }
		
		if (handleP(node.nodeName) == spns+"uri") 
			return kb.sym(val.nodeValue);
		else if (handleP(node.nodeName) == spns+"literal")
			return kb.literal(val.nodeValue);
		else if (handleP(node.nodeName) == spns+"unbound")
			return 'unbound'
		
		else twarn("Don't know how to handle xml binding term "+node);
		return false
	}
	function handleResult (result)
	{
		var resultBindings = [],bound=false;
		for (var x=0;x<result.childNodes.length;x++)
		{
			//alert(result[x].nodeName);
			if (result.childNodes[x].nodeType != 1) continue;
			if (handleP(result.childNodes[x].nodeName) != spns+"binding") {twarn("Bad binding node inside result"); continue;}
			var bind = result.childNodes[x];
			var bindVar = makeVar(bind.getAttribute('name'));
			var binding = null
			for (var y=0;y<bind.childNodes.length;y++)
				if (bind.childNodes[y].nodeType == 1) { binding = xmlMakeTerm(bind.childNodes[y]); break }
			if (!binding) { twarn("Bad binding"); return false }
			tinfo("var: "+bindVar+" binding: "+binding);
			bound=true;
			if (binding != 'unbound')
			resultBindings[bindVar]=binding;
		}
		
		//alert(callback)
		if (bound && callback) setTimeout(function(){callback(resultBindings)},0)
		bindingList.push(resultBindings);
		return;
	}
	
	//****MAIN CODE**********
	var prefixes = [], bindingList=[], head, results, sparql = xml.childNodes[0], spns = "http://www.w3.org/2005/sparql-results#";
	prefixes[""]="";
	
	if (sparql.nodeName != 'sparql') { terror("Bad SPARQL results XML"); return }
	
	for (var x=0;x<sparql.attributes.length;x++)  //deals with all the prefixes beforehand
		parsePrefix(sparql.attributes[x]);
		
	for (var x=0;x<sparql.childNodes.length;x++) //looks for the head and results childNodes
	{
		tinfo("Type: "+sparql.childNodes[x].nodeType+"\nName: "+sparql.childNodes[x].nodeName+"\nValue: "+sparql.childNodes[x].nodeValue);
		
		if (sparql.childNodes[x].nodeType==1 && handleP(sparql.childNodes[x].nodeName)== spns+"head")
			head = sparql.childNodes[x];
		else if (sparql.childNodes[x].nodeType==1 && handleP(sparql.childNodes[x].nodeName)==spns+"results")
			results = sparql.childNodes[x];
	}
	
	if (!results && !head) { terror("Bad SPARQL results XML"); return }
	
	for (var x=0;x<head.childNodes.length;x++) //@@does anything need to be done with these? Should we check against query vars?
	{
		if (head.childNodes[x].nodeType == 1 && handleP(head.childNodes[x].nodeName) == spns+"variable")
			tinfo("Var: "+head.childNodes[x].getAttribute('name'))
	}
	
	for (var x=0;x<results.childNodes.length;x++)
	{
		if (handleP(results.childNodes[x].nodeName)==spns+"result")
		{
			tinfo("Result # "+x);
			handleResult(results.childNodes[x]);
		}
	}
	
	if (doneCallback) doneCallback();
	return bindingList;
	//****END OF MAIN CODE*****
}
	
	
function constraintGreaterThan (value)
{
	this.describe = function (varstr) { return varstr + " > "+value.toNT() }
	this.test = function (term) {
		if (term.value.match(/[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/))
			return (parseFloat(term.value) > parseFloat(value)); 
		else return (term.toNT() > value.toNT()); 
	}
	return this;
}

function constraintLessThan (value) //this is not the recommended usage. Should only work on literal, numeric, dateTime
{
	this.describe = function (varstr) { return varstr + " < "+value.toNT() }
	this.test = function (term) {
		//this.describe = function (varstr) { return varstr + " < "+value }
		if (term.value.match(/[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/))
			return (parseFloat(term.value) < parseFloat(value)); 
		else return (term.toNT() < value.toNT()); 
	}
	return this;
}

function constraintEqualTo (value) //This should only work on literals but doesn't.
{
	this.describe = function (varstr) { return varstr + " = "+value.toNT() }
	this.test = function (term) {
		return value.sameTerm(term)
	}
	return this;
}

function constraintRegexp (value) //value must be a literal
{
	this.describe = function (varstr) { return "REGEXP( '"+value+"' , "+varstr+" )"}
	this.test=function(term) { 
		var str = value;
		//str = str.replace(/^//,"").replace(//$/,"")
		var rg = new RegExp(str); 
		if (term.value) return rg.test(term.value); 
		else return false;
	}
}