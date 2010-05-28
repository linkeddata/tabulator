/*!
 * jQuery JavaScript Library v1.4.2
 * http://jquery.com/
 *
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2010, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Sat Feb 13 22:33:48 2010 -0500
 */
(function(A,w){function ma(){if(!c.isReady){try{s.documentElement.doScroll("left")}catch(a){setTimeout(ma,1);return}c.ready()}}function Qa(a,b){b.src?c.ajax({url:b.src,async:false,dataType:"script"}):c.globalEval(b.text||b.textContent||b.innerHTML||"");b.parentNode&&b.parentNode.removeChild(b)}function X(a,b,d,f,e,j){var i=a.length;if(typeof b==="object"){for(var o in b)X(a,o,b[o],f,e,d);return a}if(d!==w){f=!j&&f&&c.isFunction(d);for(o=0;o<i;o++)e(a[o],b,f?d.call(a[o],o,e(a[o],b)):d,j);return a}return i?
e(a[0],b):w}function J(){return(new Date).getTime()}function Y(){return false}function Z(){return true}function na(a,b,d){d[0].type=a;return c.event.handle.apply(b,d)}function oa(a){var b,d=[],f=[],e=arguments,j,i,o,k,n,r;i=c.data(this,"events");if(!(a.liveFired===this||!i||!i.live||a.button&&a.type==="click")){a.liveFired=this;var u=i.live.slice(0);for(k=0;k<u.length;k++){i=u[k];i.origType.replace(O,"")===a.type?f.push(i.selector):u.splice(k--,1)}j=c(a.target).closest(f,a.currentTarget);n=0;for(r=
j.length;n<r;n++)for(k=0;k<u.length;k++){i=u[k];if(j[n].selector===i.selector){o=j[n].elem;f=null;if(i.preType==="mouseenter"||i.preType==="mouseleave")f=c(a.relatedTarget).closest(i.selector)[0];if(!f||f!==o)d.push({elem:o,handleObj:i})}}n=0;for(r=d.length;n<r;n++){j=d[n];a.currentTarget=j.elem;a.data=j.handleObj.data;a.handleObj=j.handleObj;if(j.handleObj.origHandler.apply(j.elem,e)===false){b=false;break}}return b}}function pa(a,b){return"live."+(a&&a!=="*"?a+".":"")+b.replace(/\./g,"`").replace(/ /g,
"&")}function qa(a){return!a||!a.parentNode||a.parentNode.nodeType===11}function ra(a,b){var d=0;b.each(function(){if(this.nodeName===(a[d]&&a[d].nodeName)){var f=c.data(a[d++]),e=c.data(this,f);if(f=f&&f.events){delete e.handle;e.events={};for(var j in f)for(var i in f[j])c.event.add(this,j,f[j][i],f[j][i].data)}}})}function sa(a,b,d){var f,e,j;b=b&&b[0]?b[0].ownerDocument||b[0]:s;if(a.length===1&&typeof a[0]==="string"&&a[0].length<512&&b===s&&!ta.test(a[0])&&(c.support.checkClone||!ua.test(a[0]))){e=
true;if(j=c.fragments[a[0]])if(j!==1)f=j}if(!f){f=b.createDocumentFragment();c.clean(a,b,f,d)}if(e)c.fragments[a[0]]=j?f:1;return{fragment:f,cacheable:e}}function K(a,b){var d={};c.each(va.concat.apply([],va.slice(0,b)),function(){d[this]=a});return d}function wa(a){return"scrollTo"in a&&a.document?a:a.nodeType===9?a.defaultView||a.parentWindow:false}var c=function(a,b){return new c.fn.init(a,b)},Ra=A.jQuery,Sa=A.$,s=A.document,T,Ta=/^[^<]*(<[\w\W]+>)[^>]*$|^#([\w-]+)$/,Ua=/^.[^:#\[\.,]*$/,Va=/\S/,
Wa=/^(\s|\u00A0)+|(\s|\u00A0)+$/g,Xa=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,P=navigator.userAgent,xa=false,Q=[],L,$=Object.prototype.toString,aa=Object.prototype.hasOwnProperty,ba=Array.prototype.push,R=Array.prototype.slice,ya=Array.prototype.indexOf;c.fn=c.prototype={init:function(a,b){var d,f;if(!a)return this;if(a.nodeType){this.context=this[0]=a;this.length=1;return this}if(a==="body"&&!b){this.context=s;this[0]=s.body;this.selector="body";this.length=1;return this}if(typeof a==="string")if((d=Ta.exec(a))&&
(d[1]||!b))if(d[1]){f=b?b.ownerDocument||b:s;if(a=Xa.exec(a))if(c.isPlainObject(b)){a=[s.createElement(a[1])];c.fn.attr.call(a,b,true)}else a=[f.createElement(a[1])];else{a=sa([d[1]],[f]);a=(a.cacheable?a.fragment.cloneNode(true):a.fragment).childNodes}return c.merge(this,a)}else{if(b=s.getElementById(d[2])){if(b.id!==d[2])return T.find(a);this.length=1;this[0]=b}this.context=s;this.selector=a;return this}else if(!b&&/^\w+$/.test(a)){this.selector=a;this.context=s;a=s.getElementsByTagName(a);return c.merge(this,
a)}else return!b||b.jquery?(b||T).find(a):c(b).find(a);else if(c.isFunction(a))return T.ready(a);if(a.selector!==w){this.selector=a.selector;this.context=a.context}return c.makeArray(a,this)},selector:"",jquery:"1.4.2",length:0,size:function(){return this.length},toArray:function(){return R.call(this,0)},get:function(a){return a==null?this.toArray():a<0?this.slice(a)[0]:this[a]},pushStack:function(a,b,d){var f=c();c.isArray(a)?ba.apply(f,a):c.merge(f,a);f.prevObject=this;f.context=this.context;if(b===
"find")f.selector=this.selector+(this.selector?" ":"")+d;else if(b)f.selector=this.selector+"."+b+"("+d+")";return f},each:function(a,b){return c.each(this,a,b)},ready:function(a){c.bindReady();if(c.isReady)a.call(s,c);else Q&&Q.push(a);return this},eq:function(a){return a===-1?this.slice(a):this.slice(a,+a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(R.apply(this,arguments),"slice",R.call(arguments).join(","))},map:function(a){return this.pushStack(c.map(this,
function(b,d){return a.call(b,d,b)}))},end:function(){return this.prevObject||c(null)},push:ba,sort:[].sort,splice:[].splice};c.fn.init.prototype=c.fn;c.extend=c.fn.extend=function(){var a=arguments[0]||{},b=1,d=arguments.length,f=false,e,j,i,o;if(typeof a==="boolean"){f=a;a=arguments[1]||{};b=2}if(typeof a!=="object"&&!c.isFunction(a))a={};if(d===b){a=this;--b}for(;b<d;b++)if((e=arguments[b])!=null)for(j in e){i=a[j];o=e[j];if(a!==o)if(f&&o&&(c.isPlainObject(o)||c.isArray(o))){i=i&&(c.isPlainObject(i)||
c.isArray(i))?i:c.isArray(o)?[]:{};a[j]=c.extend(f,i,o)}else if(o!==w)a[j]=o}return a};c.extend({noConflict:function(a){A.$=Sa;if(a)A.jQuery=Ra;return c},isReady:false,ready:function(){if(!c.isReady){if(!s.body)return setTimeout(c.ready,13);c.isReady=true;if(Q){for(var a,b=0;a=Q[b++];)a.call(s,c);Q=null}c.fn.triggerHandler&&c(s).triggerHandler("ready")}},bindReady:function(){if(!xa){xa=true;if(s.readyState==="complete")return c.ready();if(s.addEventListener){s.addEventListener("DOMContentLoaded",
L,false);A.addEventListener("load",c.ready,false)}else if(s.attachEvent){s.attachEvent("onreadystatechange",L);A.attachEvent("onload",c.ready);var a=false;try{a=A.frameElement==null}catch(b){}s.documentElement.doScroll&&a&&ma()}}},isFunction:function(a){return $.call(a)==="[object Function]"},isArray:function(a){return $.call(a)==="[object Array]"},isPlainObject:function(a){if(!a||$.call(a)!=="[object Object]"||a.nodeType||a.setInterval)return false;if(a.constructor&&!aa.call(a,"constructor")&&!aa.call(a.constructor.prototype,
"isPrototypeOf"))return false;var b;for(b in a);return b===w||aa.call(a,b)},isEmptyObject:function(a){for(var b in a)return false;return true},error:function(a){throw a;},parseJSON:function(a){if(typeof a!=="string"||!a)return null;a=c.trim(a);if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return A.JSON&&A.JSON.parse?A.JSON.parse(a):(new Function("return "+
a))();else c.error("Invalid JSON: "+a)},noop:function(){},globalEval:function(a){if(a&&Va.test(a)){var b=s.getElementsByTagName("head")[0]||s.documentElement,d=s.createElement("script");d.type="text/javascript";if(c.support.scriptEval)d.appendChild(s.createTextNode(a));else d.text=a;b.insertBefore(d,b.firstChild);b.removeChild(d)}},nodeName:function(a,b){return a.nodeName&&a.nodeName.toUpperCase()===b.toUpperCase()},each:function(a,b,d){var f,e=0,j=a.length,i=j===w||c.isFunction(a);if(d)if(i)for(f in a){if(b.apply(a[f],
d)===false)break}else for(;e<j;){if(b.apply(a[e++],d)===false)break}else if(i)for(f in a){if(b.call(a[f],f,a[f])===false)break}else for(d=a[0];e<j&&b.call(d,e,d)!==false;d=a[++e]);return a},trim:function(a){return(a||"").replace(Wa,"")},makeArray:function(a,b){b=b||[];if(a!=null)a.length==null||typeof a==="string"||c.isFunction(a)||typeof a!=="function"&&a.setInterval?ba.call(b,a):c.merge(b,a);return b},inArray:function(a,b){if(b.indexOf)return b.indexOf(a);for(var d=0,f=b.length;d<f;d++)if(b[d]===
a)return d;return-1},merge:function(a,b){var d=a.length,f=0;if(typeof b.length==="number")for(var e=b.length;f<e;f++)a[d++]=b[f];else for(;b[f]!==w;)a[d++]=b[f++];a.length=d;return a},grep:function(a,b,d){for(var f=[],e=0,j=a.length;e<j;e++)!d!==!b(a[e],e)&&f.push(a[e]);return f},map:function(a,b,d){for(var f=[],e,j=0,i=a.length;j<i;j++){e=b(a[j],j,d);if(e!=null)f[f.length]=e}return f.concat.apply([],f)},guid:1,proxy:function(a,b,d){if(arguments.length===2)if(typeof b==="string"){d=a;a=d[b];b=w}else if(b&&
!c.isFunction(b)){d=b;b=w}if(!b&&a)b=function(){return a.apply(d||this,arguments)};if(a)b.guid=a.guid=a.guid||b.guid||c.guid++;return b},uaMatch:function(a){a=a.toLowerCase();a=/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version)?[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||!/compatible/.test(a)&&/(mozilla)(?:.*? rv:([\w.]+))?/.exec(a)||[];return{browser:a[1]||"",version:a[2]||"0"}},browser:{}});P=c.uaMatch(P);if(P.browser){c.browser[P.browser]=true;c.browser.version=P.version}if(c.browser.webkit)c.browser.safari=
true;if(ya)c.inArray=function(a,b){return ya.call(b,a)};T=c(s);if(s.addEventListener)L=function(){s.removeEventListener("DOMContentLoaded",L,false);c.ready()};else if(s.attachEvent)L=function(){if(s.readyState==="complete"){s.detachEvent("onreadystatechange",L);c.ready()}};(function(){c.support={};var a=s.documentElement,b=s.createElement("script"),d=s.createElement("div"),f="script"+J();d.style.display="none";d.innerHTML="   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
var e=d.getElementsByTagName("*"),j=d.getElementsByTagName("a")[0];if(!(!e||!e.length||!j)){c.support={leadingWhitespace:d.firstChild.nodeType===3,tbody:!d.getElementsByTagName("tbody").length,htmlSerialize:!!d.getElementsByTagName("link").length,style:/red/.test(j.getAttribute("style")),hrefNormalized:j.getAttribute("href")==="/a",opacity:/^0.55$/.test(j.style.opacity),cssFloat:!!j.style.cssFloat,checkOn:d.getElementsByTagName("input")[0].value==="on",optSelected:s.createElement("select").appendChild(s.createElement("option")).selected,
parentNode:d.removeChild(d.appendChild(s.createElement("div"))).parentNode===null,deleteExpando:true,checkClone:false,scriptEval:false,noCloneEvent:true,boxModel:null};b.type="text/javascript";try{b.appendChild(s.createTextNode("window."+f+"=1;"))}catch(i){}a.insertBefore(b,a.firstChild);if(A[f]){c.support.scriptEval=true;delete A[f]}try{delete b.test}catch(o){c.support.deleteExpando=false}a.removeChild(b);if(d.attachEvent&&d.fireEvent){d.attachEvent("onclick",function k(){c.support.noCloneEvent=
false;d.detachEvent("onclick",k)});d.cloneNode(true).fireEvent("onclick")}d=s.createElement("div");d.innerHTML="<input type='radio' name='radiotest' checked='checked'/>";a=s.createDocumentFragment();a.appendChild(d.firstChild);c.support.checkClone=a.cloneNode(true).cloneNode(true).lastChild.checked;c(function(){var k=s.createElement("div");k.style.width=k.style.paddingLeft="1px";s.body.appendChild(k);c.boxModel=c.support.boxModel=k.offsetWidth===2;s.body.removeChild(k).style.display="none"});a=function(k){var n=
s.createElement("div");k="on"+k;var r=k in n;if(!r){n.setAttribute(k,"return;");r=typeof n[k]==="function"}return r};c.support.submitBubbles=a("submit");c.support.changeBubbles=a("change");a=b=d=e=j=null}})();c.props={"for":"htmlFor","class":"className",readonly:"readOnly",maxlength:"maxLength",cellspacing:"cellSpacing",rowspan:"rowSpan",colspan:"colSpan",tabindex:"tabIndex",usemap:"useMap",frameborder:"frameBorder"};var G="jQuery"+J(),Ya=0,za={};c.extend({cache:{},expando:G,noData:{embed:true,object:true,
applet:true},data:function(a,b,d){if(!(a.nodeName&&c.noData[a.nodeName.toLowerCase()])){a=a==A?za:a;var f=a[G],e=c.cache;if(!f&&typeof b==="string"&&d===w)return null;f||(f=++Ya);if(typeof b==="object"){a[G]=f;e[f]=c.extend(true,{},b)}else if(!e[f]){a[G]=f;e[f]={}}a=e[f];if(d!==w)a[b]=d;return typeof b==="string"?a[b]:a}},removeData:function(a,b){if(!(a.nodeName&&c.noData[a.nodeName.toLowerCase()])){a=a==A?za:a;var d=a[G],f=c.cache,e=f[d];if(b){if(e){delete e[b];c.isEmptyObject(e)&&c.removeData(a)}}else{if(c.support.deleteExpando)delete a[c.expando];
else a.removeAttribute&&a.removeAttribute(c.expando);delete f[d]}}}});c.fn.extend({data:function(a,b){if(typeof a==="undefined"&&this.length)return c.data(this[0]);else if(typeof a==="object")return this.each(function(){c.data(this,a)});var d=a.split(".");d[1]=d[1]?"."+d[1]:"";if(b===w){var f=this.triggerHandler("getData"+d[1]+"!",[d[0]]);if(f===w&&this.length)f=c.data(this[0],a);return f===w&&d[1]?this.data(d[0]):f}else return this.trigger("setData"+d[1]+"!",[d[0],b]).each(function(){c.data(this,
a,b)})},removeData:function(a){return this.each(function(){c.removeData(this,a)})}});c.extend({queue:function(a,b,d){if(a){b=(b||"fx")+"queue";var f=c.data(a,b);if(!d)return f||[];if(!f||c.isArray(d))f=c.data(a,b,c.makeArray(d));else f.push(d);return f}},dequeue:function(a,b){b=b||"fx";var d=c.queue(a,b),f=d.shift();if(f==="inprogress")f=d.shift();if(f){b==="fx"&&d.unshift("inprogress");f.call(a,function(){c.dequeue(a,b)})}}});c.fn.extend({queue:function(a,b){if(typeof a!=="string"){b=a;a="fx"}if(b===
w)return c.queue(this[0],a);return this.each(function(){var d=c.queue(this,a,b);a==="fx"&&d[0]!=="inprogress"&&c.dequeue(this,a)})},dequeue:function(a){return this.each(function(){c.dequeue(this,a)})},delay:function(a,b){a=c.fx?c.fx.speeds[a]||a:a;b=b||"fx";return this.queue(b,function(){var d=this;setTimeout(function(){c.dequeue(d,b)},a)})},clearQueue:function(a){return this.queue(a||"fx",[])}});var Aa=/[\n\t]/g,ca=/\s+/,Za=/\r/g,$a=/href|src|style/,ab=/(button|input)/i,bb=/(button|input|object|select|textarea)/i,
cb=/^(a|area)$/i,Ba=/radio|checkbox/;c.fn.extend({attr:function(a,b){return X(this,a,b,true,c.attr)},removeAttr:function(a){return this.each(function(){c.attr(this,a,"");this.nodeType===1&&this.removeAttribute(a)})},addClass:function(a){if(c.isFunction(a))return this.each(function(n){var r=c(this);r.addClass(a.call(this,n,r.attr("class")))});if(a&&typeof a==="string")for(var b=(a||"").split(ca),d=0,f=this.length;d<f;d++){var e=this[d];if(e.nodeType===1)if(e.className){for(var j=" "+e.className+" ",
i=e.className,o=0,k=b.length;o<k;o++)if(j.indexOf(" "+b[o]+" ")<0)i+=" "+b[o];e.className=c.trim(i)}else e.className=a}return this},removeClass:function(a){if(c.isFunction(a))return this.each(function(k){var n=c(this);n.removeClass(a.call(this,k,n.attr("class")))});if(a&&typeof a==="string"||a===w)for(var b=(a||"").split(ca),d=0,f=this.length;d<f;d++){var e=this[d];if(e.nodeType===1&&e.className)if(a){for(var j=(" "+e.className+" ").replace(Aa," "),i=0,o=b.length;i<o;i++)j=j.replace(" "+b[i]+" ",
" ");e.className=c.trim(j)}else e.className=""}return this},toggleClass:function(a,b){var d=typeof a,f=typeof b==="boolean";if(c.isFunction(a))return this.each(function(e){var j=c(this);j.toggleClass(a.call(this,e,j.attr("class"),b),b)});return this.each(function(){if(d==="string")for(var e,j=0,i=c(this),o=b,k=a.split(ca);e=k[j++];){o=f?o:!i.hasClass(e);i[o?"addClass":"removeClass"](e)}else if(d==="undefined"||d==="boolean"){this.className&&c.data(this,"__className__",this.className);this.className=
this.className||a===false?"":c.data(this,"__className__")||""}})},hasClass:function(a){a=" "+a+" ";for(var b=0,d=this.length;b<d;b++)if((" "+this[b].className+" ").replace(Aa," ").indexOf(a)>-1)return true;return false},val:function(a){if(a===w){var b=this[0];if(b){if(c.nodeName(b,"option"))return(b.attributes.value||{}).specified?b.value:b.text;if(c.nodeName(b,"select")){var d=b.selectedIndex,f=[],e=b.options;b=b.type==="select-one";if(d<0)return null;var j=b?d:0;for(d=b?d+1:e.length;j<d;j++){var i=
e[j];if(i.selected){a=c(i).val();if(b)return a;f.push(a)}}return f}if(Ba.test(b.type)&&!c.support.checkOn)return b.getAttribute("value")===null?"on":b.value;return(b.value||"").replace(Za,"")}return w}var o=c.isFunction(a);return this.each(function(k){var n=c(this),r=a;if(this.nodeType===1){if(o)r=a.call(this,k,n.val());if(typeof r==="number")r+="";if(c.isArray(r)&&Ba.test(this.type))this.checked=c.inArray(n.val(),r)>=0;else if(c.nodeName(this,"select")){var u=c.makeArray(r);c("option",this).each(function(){this.selected=
c.inArray(c(this).val(),u)>=0});if(!u.length)this.selectedIndex=-1}else this.value=r}})}});c.extend({attrFn:{val:true,css:true,html:true,text:true,data:true,width:true,height:true,offset:true},attr:function(a,b,d,f){if(!a||a.nodeType===3||a.nodeType===8)return w;if(f&&b in c.attrFn)return c(a)[b](d);f=a.nodeType!==1||!c.isXMLDoc(a);var e=d!==w;b=f&&c.props[b]||b;if(a.nodeType===1){var j=$a.test(b);if(b in a&&f&&!j){if(e){b==="type"&&ab.test(a.nodeName)&&a.parentNode&&c.error("type property can't be changed");
a[b]=d}if(c.nodeName(a,"form")&&a.getAttributeNode(b))return a.getAttributeNode(b).nodeValue;if(b==="tabIndex")return(b=a.getAttributeNode("tabIndex"))&&b.specified?b.value:bb.test(a.nodeName)||cb.test(a.nodeName)&&a.href?0:w;return a[b]}if(!c.support.style&&f&&b==="style"){if(e)a.style.cssText=""+d;return a.style.cssText}e&&a.setAttribute(b,""+d);a=!c.support.hrefNormalized&&f&&j?a.getAttribute(b,2):a.getAttribute(b);return a===null?w:a}return c.style(a,b,d)}});var O=/\.(.*)$/,db=function(a){return a.replace(/[^\w\s\.\|`]/g,
function(b){return"\\"+b})};c.event={add:function(a,b,d,f){if(!(a.nodeType===3||a.nodeType===8)){if(a.setInterval&&a!==A&&!a.frameElement)a=A;var e,j;if(d.handler){e=d;d=e.handler}if(!d.guid)d.guid=c.guid++;if(j=c.data(a)){var i=j.events=j.events||{},o=j.handle;if(!o)j.handle=o=function(){return typeof c!=="undefined"&&!c.event.triggered?c.event.handle.apply(o.elem,arguments):w};o.elem=a;b=b.split(" ");for(var k,n=0,r;k=b[n++];){j=e?c.extend({},e):{handler:d,data:f};if(k.indexOf(".")>-1){r=k.split(".");
k=r.shift();j.namespace=r.slice(0).sort().join(".")}else{r=[];j.namespace=""}j.type=k;j.guid=d.guid;var u=i[k],z=c.event.special[k]||{};if(!u){u=i[k]=[];if(!z.setup||z.setup.call(a,f,r,o)===false)if(a.addEventListener)a.addEventListener(k,o,false);else a.attachEvent&&a.attachEvent("on"+k,o)}if(z.add){z.add.call(a,j);if(!j.handler.guid)j.handler.guid=d.guid}u.push(j);c.event.global[k]=true}a=null}}},global:{},remove:function(a,b,d,f){if(!(a.nodeType===3||a.nodeType===8)){var e,j=0,i,o,k,n,r,u,z=c.data(a),
C=z&&z.events;if(z&&C){if(b&&b.type){d=b.handler;b=b.type}if(!b||typeof b==="string"&&b.charAt(0)==="."){b=b||"";for(e in C)c.event.remove(a,e+b)}else{for(b=b.split(" ");e=b[j++];){n=e;i=e.indexOf(".")<0;o=[];if(!i){o=e.split(".");e=o.shift();k=new RegExp("(^|\\.)"+c.map(o.slice(0).sort(),db).join("\\.(?:.*\\.)?")+"(\\.|$)")}if(r=C[e])if(d){n=c.event.special[e]||{};for(B=f||0;B<r.length;B++){u=r[B];if(d.guid===u.guid){if(i||k.test(u.namespace)){f==null&&r.splice(B--,1);n.remove&&n.remove.call(a,u)}if(f!=
null)break}}if(r.length===0||f!=null&&r.length===1){if(!n.teardown||n.teardown.call(a,o)===false)Ca(a,e,z.handle);delete C[e]}}else for(var B=0;B<r.length;B++){u=r[B];if(i||k.test(u.namespace)){c.event.remove(a,n,u.handler,B);r.splice(B--,1)}}}if(c.isEmptyObject(C)){if(b=z.handle)b.elem=null;delete z.events;delete z.handle;c.isEmptyObject(z)&&c.removeData(a)}}}}},trigger:function(a,b,d,f){var e=a.type||a;if(!f){a=typeof a==="object"?a[G]?a:c.extend(c.Event(e),a):c.Event(e);if(e.indexOf("!")>=0){a.type=
e=e.slice(0,-1);a.exclusive=true}if(!d){a.stopPropagation();c.event.global[e]&&c.each(c.cache,function(){this.events&&this.events[e]&&c.event.trigger(a,b,this.handle.elem)})}if(!d||d.nodeType===3||d.nodeType===8)return w;a.result=w;a.target=d;b=c.makeArray(b);b.unshift(a)}a.currentTarget=d;(f=c.data(d,"handle"))&&f.apply(d,b);f=d.parentNode||d.ownerDocument;try{if(!(d&&d.nodeName&&c.noData[d.nodeName.toLowerCase()]))if(d["on"+e]&&d["on"+e].apply(d,b)===false)a.result=false}catch(j){}if(!a.isPropagationStopped()&&
f)c.event.trigger(a,b,f,true);else if(!a.isDefaultPrevented()){f=a.target;var i,o=c.nodeName(f,"a")&&e==="click",k=c.event.special[e]||{};if((!k._default||k._default.call(d,a)===false)&&!o&&!(f&&f.nodeName&&c.noData[f.nodeName.toLowerCase()])){try{if(f[e]){if(i=f["on"+e])f["on"+e]=null;c.event.triggered=true;f[e]()}}catch(n){}if(i)f["on"+e]=i;c.event.triggered=false}}},handle:function(a){var b,d,f,e;a=arguments[0]=c.event.fix(a||A.event);a.currentTarget=this;b=a.type.indexOf(".")<0&&!a.exclusive;
if(!b){d=a.type.split(".");a.type=d.shift();f=new RegExp("(^|\\.)"+d.slice(0).sort().join("\\.(?:.*\\.)?")+"(\\.|$)")}e=c.data(this,"events");d=e[a.type];if(e&&d){d=d.slice(0);e=0;for(var j=d.length;e<j;e++){var i=d[e];if(b||f.test(i.namespace)){a.handler=i.handler;a.data=i.data;a.handleObj=i;i=i.handler.apply(this,arguments);if(i!==w){a.result=i;if(i===false){a.preventDefault();a.stopPropagation()}}if(a.isImmediatePropagationStopped())break}}}return a.result},props:"altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),
fix:function(a){if(a[G])return a;var b=a;a=c.Event(b);for(var d=this.props.length,f;d;){f=this.props[--d];a[f]=b[f]}if(!a.target)a.target=a.srcElement||s;if(a.target.nodeType===3)a.target=a.target.parentNode;if(!a.relatedTarget&&a.fromElement)a.relatedTarget=a.fromElement===a.target?a.toElement:a.fromElement;if(a.pageX==null&&a.clientX!=null){b=s.documentElement;d=s.body;a.pageX=a.clientX+(b&&b.scrollLeft||d&&d.scrollLeft||0)-(b&&b.clientLeft||d&&d.clientLeft||0);a.pageY=a.clientY+(b&&b.scrollTop||
d&&d.scrollTop||0)-(b&&b.clientTop||d&&d.clientTop||0)}if(!a.which&&(a.charCode||a.charCode===0?a.charCode:a.keyCode))a.which=a.charCode||a.keyCode;if(!a.metaKey&&a.ctrlKey)a.metaKey=a.ctrlKey;if(!a.which&&a.button!==w)a.which=a.button&1?1:a.button&2?3:a.button&4?2:0;return a},guid:1E8,proxy:c.proxy,special:{ready:{setup:c.bindReady,teardown:c.noop},live:{add:function(a){c.event.add(this,a.origType,c.extend({},a,{handler:oa}))},remove:function(a){var b=true,d=a.origType.replace(O,"");c.each(c.data(this,
"events").live||[],function(){if(d===this.origType.replace(O,""))return b=false});b&&c.event.remove(this,a.origType,oa)}},beforeunload:{setup:function(a,b,d){if(this.setInterval)this.onbeforeunload=d;return false},teardown:function(a,b){if(this.onbeforeunload===b)this.onbeforeunload=null}}}};var Ca=s.removeEventListener?function(a,b,d){a.removeEventListener(b,d,false)}:function(a,b,d){a.detachEvent("on"+b,d)};c.Event=function(a){if(!this.preventDefault)return new c.Event(a);if(a&&a.type){this.originalEvent=
a;this.type=a.type}else this.type=a;this.timeStamp=J();this[G]=true};c.Event.prototype={preventDefault:function(){this.isDefaultPrevented=Z;var a=this.originalEvent;if(a){a.preventDefault&&a.preventDefault();a.returnValue=false}},stopPropagation:function(){this.isPropagationStopped=Z;var a=this.originalEvent;if(a){a.stopPropagation&&a.stopPropagation();a.cancelBubble=true}},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=Z;this.stopPropagation()},isDefaultPrevented:Y,isPropagationStopped:Y,
isImmediatePropagationStopped:Y};var Da=function(a){var b=a.relatedTarget;try{for(;b&&b!==this;)b=b.parentNode;if(b!==this){a.type=a.data;c.event.handle.apply(this,arguments)}}catch(d){}},Ea=function(a){a.type=a.data;c.event.handle.apply(this,arguments)};c.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){c.event.special[a]={setup:function(d){c.event.add(this,b,d&&d.selector?Ea:Da,a)},teardown:function(d){c.event.remove(this,b,d&&d.selector?Ea:Da)}}});if(!c.support.submitBubbles)c.event.special.submit=
{setup:function(){if(this.nodeName.toLowerCase()!=="form"){c.event.add(this,"click.specialSubmit",function(a){var b=a.target,d=b.type;if((d==="submit"||d==="image")&&c(b).closest("form").length)return na("submit",this,arguments)});c.event.add(this,"keypress.specialSubmit",function(a){var b=a.target,d=b.type;if((d==="text"||d==="password")&&c(b).closest("form").length&&a.keyCode===13)return na("submit",this,arguments)})}else return false},teardown:function(){c.event.remove(this,".specialSubmit")}};
if(!c.support.changeBubbles){var da=/textarea|input|select/i,ea,Fa=function(a){var b=a.type,d=a.value;if(b==="radio"||b==="checkbox")d=a.checked;else if(b==="select-multiple")d=a.selectedIndex>-1?c.map(a.options,function(f){return f.selected}).join("-"):"";else if(a.nodeName.toLowerCase()==="select")d=a.selectedIndex;return d},fa=function(a,b){var d=a.target,f,e;if(!(!da.test(d.nodeName)||d.readOnly)){f=c.data(d,"_change_data");e=Fa(d);if(a.type!=="focusout"||d.type!=="radio")c.data(d,"_change_data",
e);if(!(f===w||e===f))if(f!=null||e){a.type="change";return c.event.trigger(a,b,d)}}};c.event.special.change={filters:{focusout:fa,click:function(a){var b=a.target,d=b.type;if(d==="radio"||d==="checkbox"||b.nodeName.toLowerCase()==="select")return fa.call(this,a)},keydown:function(a){var b=a.target,d=b.type;if(a.keyCode===13&&b.nodeName.toLowerCase()!=="textarea"||a.keyCode===32&&(d==="checkbox"||d==="radio")||d==="select-multiple")return fa.call(this,a)},beforeactivate:function(a){a=a.target;c.data(a,
"_change_data",Fa(a))}},setup:function(){if(this.type==="file")return false;for(var a in ea)c.event.add(this,a+".specialChange",ea[a]);return da.test(this.nodeName)},teardown:function(){c.event.remove(this,".specialChange");return da.test(this.nodeName)}};ea=c.event.special.change.filters}s.addEventListener&&c.each({focus:"focusin",blur:"focusout"},function(a,b){function d(f){f=c.event.fix(f);f.type=b;return c.event.handle.call(this,f)}c.event.special[b]={setup:function(){this.addEventListener(a,
d,true)},teardown:function(){this.removeEventListener(a,d,true)}}});c.each(["bind","one"],function(a,b){c.fn[b]=function(d,f,e){if(typeof d==="object"){for(var j in d)this[b](j,f,d[j],e);return this}if(c.isFunction(f)){e=f;f=w}var i=b==="one"?c.proxy(e,function(k){c(this).unbind(k,i);return e.apply(this,arguments)}):e;if(d==="unload"&&b!=="one")this.one(d,f,e);else{j=0;for(var o=this.length;j<o;j++)c.event.add(this[j],d,i,f)}return this}});c.fn.extend({unbind:function(a,b){if(typeof a==="object"&&
!a.preventDefault)for(var d in a)this.unbind(d,a[d]);else{d=0;for(var f=this.length;d<f;d++)c.event.remove(this[d],a,b)}return this},delegate:function(a,b,d,f){return this.live(b,d,f,a)},undelegate:function(a,b,d){return arguments.length===0?this.unbind("live"):this.die(b,null,d,a)},trigger:function(a,b){return this.each(function(){c.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0]){a=c.Event(a);a.preventDefault();a.stopPropagation();c.event.trigger(a,b,this[0]);return a.result}},
toggle:function(a){for(var b=arguments,d=1;d<b.length;)c.proxy(a,b[d++]);return this.click(c.proxy(a,function(f){var e=(c.data(this,"lastToggle"+a.guid)||0)%d;c.data(this,"lastToggle"+a.guid,e+1);f.preventDefault();return b[e].apply(this,arguments)||false}))},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}});var Ga={focus:"focusin",blur:"focusout",mouseenter:"mouseover",mouseleave:"mouseout"};c.each(["live","die"],function(a,b){c.fn[b]=function(d,f,e,j){var i,o=0,k,n,r=j||this.selector,
u=j?this:c(this.context);if(c.isFunction(f)){e=f;f=w}for(d=(d||"").split(" ");(i=d[o++])!=null;){j=O.exec(i);k="";if(j){k=j[0];i=i.replace(O,"")}if(i==="hover")d.push("mouseenter"+k,"mouseleave"+k);else{n=i;if(i==="focus"||i==="blur"){d.push(Ga[i]+k);i+=k}else i=(Ga[i]||i)+k;b==="live"?u.each(function(){c.event.add(this,pa(i,r),{data:f,selector:r,handler:e,origType:i,origHandler:e,preType:n})}):u.unbind(pa(i,r),e)}}return this}});c.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error".split(" "),
function(a,b){c.fn[b]=function(d){return d?this.bind(b,d):this.trigger(b)};if(c.attrFn)c.attrFn[b]=true});A.attachEvent&&!A.addEventListener&&A.attachEvent("onunload",function(){for(var a in c.cache)if(c.cache[a].handle)try{c.event.remove(c.cache[a].handle.elem)}catch(b){}});(function(){function a(g){for(var h="",l,m=0;g[m];m++){l=g[m];if(l.nodeType===3||l.nodeType===4)h+=l.nodeValue;else if(l.nodeType!==8)h+=a(l.childNodes)}return h}function b(g,h,l,m,q,p){q=0;for(var v=m.length;q<v;q++){var t=m[q];
if(t){t=t[g];for(var y=false;t;){if(t.sizcache===l){y=m[t.sizset];break}if(t.nodeType===1&&!p){t.sizcache=l;t.sizset=q}if(t.nodeName.toLowerCase()===h){y=t;break}t=t[g]}m[q]=y}}}function d(g,h,l,m,q,p){q=0;for(var v=m.length;q<v;q++){var t=m[q];if(t){t=t[g];for(var y=false;t;){if(t.sizcache===l){y=m[t.sizset];break}if(t.nodeType===1){if(!p){t.sizcache=l;t.sizset=q}if(typeof h!=="string"){if(t===h){y=true;break}}else if(k.filter(h,[t]).length>0){y=t;break}}t=t[g]}m[q]=y}}}var f=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
e=0,j=Object.prototype.toString,i=false,o=true;[0,0].sort(function(){o=false;return 0});var k=function(g,h,l,m){l=l||[];var q=h=h||s;if(h.nodeType!==1&&h.nodeType!==9)return[];if(!g||typeof g!=="string")return l;for(var p=[],v,t,y,S,H=true,M=x(h),I=g;(f.exec(""),v=f.exec(I))!==null;){I=v[3];p.push(v[1]);if(v[2]){S=v[3];break}}if(p.length>1&&r.exec(g))if(p.length===2&&n.relative[p[0]])t=ga(p[0]+p[1],h);else for(t=n.relative[p[0]]?[h]:k(p.shift(),h);p.length;){g=p.shift();if(n.relative[g])g+=p.shift();
t=ga(g,t)}else{if(!m&&p.length>1&&h.nodeType===9&&!M&&n.match.ID.test(p[0])&&!n.match.ID.test(p[p.length-1])){v=k.find(p.shift(),h,M);h=v.expr?k.filter(v.expr,v.set)[0]:v.set[0]}if(h){v=m?{expr:p.pop(),set:z(m)}:k.find(p.pop(),p.length===1&&(p[0]==="~"||p[0]==="+")&&h.parentNode?h.parentNode:h,M);t=v.expr?k.filter(v.expr,v.set):v.set;if(p.length>0)y=z(t);else H=false;for(;p.length;){var D=p.pop();v=D;if(n.relative[D])v=p.pop();else D="";if(v==null)v=h;n.relative[D](y,v,M)}}else y=[]}y||(y=t);y||k.error(D||
g);if(j.call(y)==="[object Array]")if(H)if(h&&h.nodeType===1)for(g=0;y[g]!=null;g++){if(y[g]&&(y[g]===true||y[g].nodeType===1&&E(h,y[g])))l.push(t[g])}else for(g=0;y[g]!=null;g++)y[g]&&y[g].nodeType===1&&l.push(t[g]);else l.push.apply(l,y);else z(y,l);if(S){k(S,q,l,m);k.uniqueSort(l)}return l};k.uniqueSort=function(g){if(B){i=o;g.sort(B);if(i)for(var h=1;h<g.length;h++)g[h]===g[h-1]&&g.splice(h--,1)}return g};k.matches=function(g,h){return k(g,null,null,h)};k.find=function(g,h,l){var m,q;if(!g)return[];
for(var p=0,v=n.order.length;p<v;p++){var t=n.order[p];if(q=n.leftMatch[t].exec(g)){var y=q[1];q.splice(1,1);if(y.substr(y.length-1)!=="\\"){q[1]=(q[1]||"").replace(/\\/g,"");m=n.find[t](q,h,l);if(m!=null){g=g.replace(n.match[t],"");break}}}}m||(m=h.getElementsByTagName("*"));return{set:m,expr:g}};k.filter=function(g,h,l,m){for(var q=g,p=[],v=h,t,y,S=h&&h[0]&&x(h[0]);g&&h.length;){for(var H in n.filter)if((t=n.leftMatch[H].exec(g))!=null&&t[2]){var M=n.filter[H],I,D;D=t[1];y=false;t.splice(1,1);if(D.substr(D.length-
1)!=="\\"){if(v===p)p=[];if(n.preFilter[H])if(t=n.preFilter[H](t,v,l,p,m,S)){if(t===true)continue}else y=I=true;if(t)for(var U=0;(D=v[U])!=null;U++)if(D){I=M(D,t,U,v);var Ha=m^!!I;if(l&&I!=null)if(Ha)y=true;else v[U]=false;else if(Ha){p.push(D);y=true}}if(I!==w){l||(v=p);g=g.replace(n.match[H],"");if(!y)return[];break}}}if(g===q)if(y==null)k.error(g);else break;q=g}return v};k.error=function(g){throw"Syntax error, unrecognized expression: "+g;};var n=k.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
CLASS:/\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(g){return g.getAttribute("href")}},
relative:{"+":function(g,h){var l=typeof h==="string",m=l&&!/\W/.test(h);l=l&&!m;if(m)h=h.toLowerCase();m=0;for(var q=g.length,p;m<q;m++)if(p=g[m]){for(;(p=p.previousSibling)&&p.nodeType!==1;);g[m]=l||p&&p.nodeName.toLowerCase()===h?p||false:p===h}l&&k.filter(h,g,true)},">":function(g,h){var l=typeof h==="string";if(l&&!/\W/.test(h)){h=h.toLowerCase();for(var m=0,q=g.length;m<q;m++){var p=g[m];if(p){l=p.parentNode;g[m]=l.nodeName.toLowerCase()===h?l:false}}}else{m=0;for(q=g.length;m<q;m++)if(p=g[m])g[m]=
l?p.parentNode:p.parentNode===h;l&&k.filter(h,g,true)}},"":function(g,h,l){var m=e++,q=d;if(typeof h==="string"&&!/\W/.test(h)){var p=h=h.toLowerCase();q=b}q("parentNode",h,m,g,p,l)},"~":function(g,h,l){var m=e++,q=d;if(typeof h==="string"&&!/\W/.test(h)){var p=h=h.toLowerCase();q=b}q("previousSibling",h,m,g,p,l)}},find:{ID:function(g,h,l){if(typeof h.getElementById!=="undefined"&&!l)return(g=h.getElementById(g[1]))?[g]:[]},NAME:function(g,h){if(typeof h.getElementsByName!=="undefined"){var l=[];
h=h.getElementsByName(g[1]);for(var m=0,q=h.length;m<q;m++)h[m].getAttribute("name")===g[1]&&l.push(h[m]);return l.length===0?null:l}},TAG:function(g,h){return h.getElementsByTagName(g[1])}},preFilter:{CLASS:function(g,h,l,m,q,p){g=" "+g[1].replace(/\\/g,"")+" ";if(p)return g;p=0;for(var v;(v=h[p])!=null;p++)if(v)if(q^(v.className&&(" "+v.className+" ").replace(/[\t\n]/g," ").indexOf(g)>=0))l||m.push(v);else if(l)h[p]=false;return false},ID:function(g){return g[1].replace(/\\/g,"")},TAG:function(g){return g[1].toLowerCase()},
CHILD:function(g){if(g[1]==="nth"){var h=/(-?)(\d*)n((?:\+|-)?\d*)/.exec(g[2]==="even"&&"2n"||g[2]==="odd"&&"2n+1"||!/\D/.test(g[2])&&"0n+"+g[2]||g[2]);g[2]=h[1]+(h[2]||1)-0;g[3]=h[3]-0}g[0]=e++;return g},ATTR:function(g,h,l,m,q,p){h=g[1].replace(/\\/g,"");if(!p&&n.attrMap[h])g[1]=n.attrMap[h];if(g[2]==="~=")g[4]=" "+g[4]+" ";return g},PSEUDO:function(g,h,l,m,q){if(g[1]==="not")if((f.exec(g[3])||"").length>1||/^\w/.test(g[3]))g[3]=k(g[3],null,null,h);else{g=k.filter(g[3],h,l,true^q);l||m.push.apply(m,
g);return false}else if(n.match.POS.test(g[0])||n.match.CHILD.test(g[0]))return true;return g},POS:function(g){g.unshift(true);return g}},filters:{enabled:function(g){return g.disabled===false&&g.type!=="hidden"},disabled:function(g){return g.disabled===true},checked:function(g){return g.checked===true},selected:function(g){return g.selected===true},parent:function(g){return!!g.firstChild},empty:function(g){return!g.firstChild},has:function(g,h,l){return!!k(l[3],g).length},header:function(g){return/h\d/i.test(g.nodeName)},
text:function(g){return"text"===g.type},radio:function(g){return"radio"===g.type},checkbox:function(g){return"checkbox"===g.type},file:function(g){return"file"===g.type},password:function(g){return"password"===g.type},submit:function(g){return"submit"===g.type},image:function(g){return"image"===g.type},reset:function(g){return"reset"===g.type},button:function(g){return"button"===g.type||g.nodeName.toLowerCase()==="button"},input:function(g){return/input|select|textarea|button/i.test(g.nodeName)}},
setFilters:{first:function(g,h){return h===0},last:function(g,h,l,m){return h===m.length-1},even:function(g,h){return h%2===0},odd:function(g,h){return h%2===1},lt:function(g,h,l){return h<l[3]-0},gt:function(g,h,l){return h>l[3]-0},nth:function(g,h,l){return l[3]-0===h},eq:function(g,h,l){return l[3]-0===h}},filter:{PSEUDO:function(g,h,l,m){var q=h[1],p=n.filters[q];if(p)return p(g,l,h,m);else if(q==="contains")return(g.textContent||g.innerText||a([g])||"").indexOf(h[3])>=0;else if(q==="not"){h=
h[3];l=0;for(m=h.length;l<m;l++)if(h[l]===g)return false;return true}else k.error("Syntax error, unrecognized expression: "+q)},CHILD:function(g,h){var l=h[1],m=g;switch(l){case "only":case "first":for(;m=m.previousSibling;)if(m.nodeType===1)return false;if(l==="first")return true;m=g;case "last":for(;m=m.nextSibling;)if(m.nodeType===1)return false;return true;case "nth":l=h[2];var q=h[3];if(l===1&&q===0)return true;h=h[0];var p=g.parentNode;if(p&&(p.sizcache!==h||!g.nodeIndex)){var v=0;for(m=p.firstChild;m;m=
m.nextSibling)if(m.nodeType===1)m.nodeIndex=++v;p.sizcache=h}g=g.nodeIndex-q;return l===0?g===0:g%l===0&&g/l>=0}},ID:function(g,h){return g.nodeType===1&&g.getAttribute("id")===h},TAG:function(g,h){return h==="*"&&g.nodeType===1||g.nodeName.toLowerCase()===h},CLASS:function(g,h){return(" "+(g.className||g.getAttribute("class"))+" ").indexOf(h)>-1},ATTR:function(g,h){var l=h[1];g=n.attrHandle[l]?n.attrHandle[l](g):g[l]!=null?g[l]:g.getAttribute(l);l=g+"";var m=h[2];h=h[4];return g==null?m==="!=":m===
"="?l===h:m==="*="?l.indexOf(h)>=0:m==="~="?(" "+l+" ").indexOf(h)>=0:!h?l&&g!==false:m==="!="?l!==h:m==="^="?l.indexOf(h)===0:m==="$="?l.substr(l.length-h.length)===h:m==="|="?l===h||l.substr(0,h.length+1)===h+"-":false},POS:function(g,h,l,m){var q=n.setFilters[h[2]];if(q)return q(g,l,h,m)}}},r=n.match.POS;for(var u in n.match){n.match[u]=new RegExp(n.match[u].source+/(?![^\[]*\])(?![^\(]*\))/.source);n.leftMatch[u]=new RegExp(/(^(?:.|\r|\n)*?)/.source+n.match[u].source.replace(/\\(\d+)/g,function(g,
h){return"\\"+(h-0+1)}))}var z=function(g,h){g=Array.prototype.slice.call(g,0);if(h){h.push.apply(h,g);return h}return g};try{Array.prototype.slice.call(s.documentElement.childNodes,0)}catch(C){z=function(g,h){h=h||[];if(j.call(g)==="[object Array]")Array.prototype.push.apply(h,g);else if(typeof g.length==="number")for(var l=0,m=g.length;l<m;l++)h.push(g[l]);else for(l=0;g[l];l++)h.push(g[l]);return h}}var B;if(s.documentElement.compareDocumentPosition)B=function(g,h){if(!g.compareDocumentPosition||
!h.compareDocumentPosition){if(g==h)i=true;return g.compareDocumentPosition?-1:1}g=g.compareDocumentPosition(h)&4?-1:g===h?0:1;if(g===0)i=true;return g};else if("sourceIndex"in s.documentElement)B=function(g,h){if(!g.sourceIndex||!h.sourceIndex){if(g==h)i=true;return g.sourceIndex?-1:1}g=g.sourceIndex-h.sourceIndex;if(g===0)i=true;return g};else if(s.createRange)B=function(g,h){if(!g.ownerDocument||!h.ownerDocument){if(g==h)i=true;return g.ownerDocument?-1:1}var l=g.ownerDocument.createRange(),m=
h.ownerDocument.createRange();l.setStart(g,0);l.setEnd(g,0);m.setStart(h,0);m.setEnd(h,0);g=l.compareBoundaryPoints(Range.START_TO_END,m);if(g===0)i=true;return g};(function(){var g=s.createElement("div"),h="script"+(new Date).getTime();g.innerHTML="<a name='"+h+"'/>";var l=s.documentElement;l.insertBefore(g,l.firstChild);if(s.getElementById(h)){n.find.ID=function(m,q,p){if(typeof q.getElementById!=="undefined"&&!p)return(q=q.getElementById(m[1]))?q.id===m[1]||typeof q.getAttributeNode!=="undefined"&&
q.getAttributeNode("id").nodeValue===m[1]?[q]:w:[]};n.filter.ID=function(m,q){var p=typeof m.getAttributeNode!=="undefined"&&m.getAttributeNode("id");return m.nodeType===1&&p&&p.nodeValue===q}}l.removeChild(g);l=g=null})();(function(){var g=s.createElement("div");g.appendChild(s.createComment(""));if(g.getElementsByTagName("*").length>0)n.find.TAG=function(h,l){l=l.getElementsByTagName(h[1]);if(h[1]==="*"){h=[];for(var m=0;l[m];m++)l[m].nodeType===1&&h.push(l[m]);l=h}return l};g.innerHTML="<a href='#'></a>";
if(g.firstChild&&typeof g.firstChild.getAttribute!=="undefined"&&g.firstChild.getAttribute("href")!=="#")n.attrHandle.href=function(h){return h.getAttribute("href",2)};g=null})();s.querySelectorAll&&function(){var g=k,h=s.createElement("div");h.innerHTML="<p class='TEST'></p>";if(!(h.querySelectorAll&&h.querySelectorAll(".TEST").length===0)){k=function(m,q,p,v){q=q||s;if(!v&&q.nodeType===9&&!x(q))try{return z(q.querySelectorAll(m),p)}catch(t){}return g(m,q,p,v)};for(var l in g)k[l]=g[l];h=null}}();
(function(){var g=s.createElement("div");g.innerHTML="<div class='test e'></div><div class='test'></div>";if(!(!g.getElementsByClassName||g.getElementsByClassName("e").length===0)){g.lastChild.className="e";if(g.getElementsByClassName("e").length!==1){n.order.splice(1,0,"CLASS");n.find.CLASS=function(h,l,m){if(typeof l.getElementsByClassName!=="undefined"&&!m)return l.getElementsByClassName(h[1])};g=null}}})();var E=s.compareDocumentPosition?function(g,h){return!!(g.compareDocumentPosition(h)&16)}:
function(g,h){return g!==h&&(g.contains?g.contains(h):true)},x=function(g){return(g=(g?g.ownerDocument||g:0).documentElement)?g.nodeName!=="HTML":false},ga=function(g,h){var l=[],m="",q;for(h=h.nodeType?[h]:h;q=n.match.PSEUDO.exec(g);){m+=q[0];g=g.replace(n.match.PSEUDO,"")}g=n.relative[g]?g+"*":g;q=0;for(var p=h.length;q<p;q++)k(g,h[q],l);return k.filter(m,l)};c.find=k;c.expr=k.selectors;c.expr[":"]=c.expr.filters;c.unique=k.uniqueSort;c.text=a;c.isXMLDoc=x;c.contains=E})();var eb=/Until$/,fb=/^(?:parents|prevUntil|prevAll)/,
gb=/,/;R=Array.prototype.slice;var Ia=function(a,b,d){if(c.isFunction(b))return c.grep(a,function(e,j){return!!b.call(e,j,e)===d});else if(b.nodeType)return c.grep(a,function(e){return e===b===d});else if(typeof b==="string"){var f=c.grep(a,function(e){return e.nodeType===1});if(Ua.test(b))return c.filter(b,f,!d);else b=c.filter(b,f)}return c.grep(a,function(e){return c.inArray(e,b)>=0===d})};c.fn.extend({find:function(a){for(var b=this.pushStack("","find",a),d=0,f=0,e=this.length;f<e;f++){d=b.length;
c.find(a,this[f],b);if(f>0)for(var j=d;j<b.length;j++)for(var i=0;i<d;i++)if(b[i]===b[j]){b.splice(j--,1);break}}return b},has:function(a){var b=c(a);return this.filter(function(){for(var d=0,f=b.length;d<f;d++)if(c.contains(this,b[d]))return true})},not:function(a){return this.pushStack(Ia(this,a,false),"not",a)},filter:function(a){return this.pushStack(Ia(this,a,true),"filter",a)},is:function(a){return!!a&&c.filter(a,this).length>0},closest:function(a,b){if(c.isArray(a)){var d=[],f=this[0],e,j=
{},i;if(f&&a.length){e=0;for(var o=a.length;e<o;e++){i=a[e];j[i]||(j[i]=c.expr.match.POS.test(i)?c(i,b||this.context):i)}for(;f&&f.ownerDocument&&f!==b;){for(i in j){e=j[i];if(e.jquery?e.index(f)>-1:c(f).is(e)){d.push({selector:i,elem:f});delete j[i]}}f=f.parentNode}}return d}var k=c.expr.match.POS.test(a)?c(a,b||this.context):null;return this.map(function(n,r){for(;r&&r.ownerDocument&&r!==b;){if(k?k.index(r)>-1:c(r).is(a))return r;r=r.parentNode}return null})},index:function(a){if(!a||typeof a===
"string")return c.inArray(this[0],a?c(a):this.parent().children());return c.inArray(a.jquery?a[0]:a,this)},add:function(a,b){a=typeof a==="string"?c(a,b||this.context):c.makeArray(a);b=c.merge(this.get(),a);return this.pushStack(qa(a[0])||qa(b[0])?b:c.unique(b))},andSelf:function(){return this.add(this.prevObject)}});c.each({parent:function(a){return(a=a.parentNode)&&a.nodeType!==11?a:null},parents:function(a){return c.dir(a,"parentNode")},parentsUntil:function(a,b,d){return c.dir(a,"parentNode",
d)},next:function(a){return c.nth(a,2,"nextSibling")},prev:function(a){return c.nth(a,2,"previousSibling")},nextAll:function(a){return c.dir(a,"nextSibling")},prevAll:function(a){return c.dir(a,"previousSibling")},nextUntil:function(a,b,d){return c.dir(a,"nextSibling",d)},prevUntil:function(a,b,d){return c.dir(a,"previousSibling",d)},siblings:function(a){return c.sibling(a.parentNode.firstChild,a)},children:function(a){return c.sibling(a.firstChild)},contents:function(a){return c.nodeName(a,"iframe")?
a.contentDocument||a.contentWindow.document:c.makeArray(a.childNodes)}},function(a,b){c.fn[a]=function(d,f){var e=c.map(this,b,d);eb.test(a)||(f=d);if(f&&typeof f==="string")e=c.filter(f,e);e=this.length>1?c.unique(e):e;if((this.length>1||gb.test(f))&&fb.test(a))e=e.reverse();return this.pushStack(e,a,R.call(arguments).join(","))}});c.extend({filter:function(a,b,d){if(d)a=":not("+a+")";return c.find.matches(a,b)},dir:function(a,b,d){var f=[];for(a=a[b];a&&a.nodeType!==9&&(d===w||a.nodeType!==1||!c(a).is(d));){a.nodeType===
1&&f.push(a);a=a[b]}return f},nth:function(a,b,d){b=b||1;for(var f=0;a;a=a[d])if(a.nodeType===1&&++f===b)break;return a},sibling:function(a,b){for(var d=[];a;a=a.nextSibling)a.nodeType===1&&a!==b&&d.push(a);return d}});var Ja=/ jQuery\d+="(?:\d+|null)"/g,V=/^\s+/,Ka=/(<([\w:]+)[^>]*?)\/>/g,hb=/^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i,La=/<([\w:]+)/,ib=/<tbody/i,jb=/<|&#?\w+;/,ta=/<script|<object|<embed|<option|<style/i,ua=/checked\s*(?:[^=]|=\s*.checked.)/i,Ma=function(a,b,d){return hb.test(d)?
a:b+"></"+d+">"},F={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]};F.optgroup=F.option;F.tbody=F.tfoot=F.colgroup=F.caption=F.thead;F.th=F.td;if(!c.support.htmlSerialize)F._default=[1,"div<div>","</div>"];c.fn.extend({text:function(a){if(c.isFunction(a))return this.each(function(b){var d=
c(this);d.text(a.call(this,b,d.text()))});if(typeof a!=="object"&&a!==w)return this.empty().append((this[0]&&this[0].ownerDocument||s).createTextNode(a));return c.text(this)},wrapAll:function(a){if(c.isFunction(a))return this.each(function(d){c(this).wrapAll(a.call(this,d))});if(this[0]){var b=c(a,this[0].ownerDocument).eq(0).clone(true);this[0].parentNode&&b.insertBefore(this[0]);b.map(function(){for(var d=this;d.firstChild&&d.firstChild.nodeType===1;)d=d.firstChild;return d}).append(this)}return this},
wrapInner:function(a){if(c.isFunction(a))return this.each(function(b){c(this).wrapInner(a.call(this,b))});return this.each(function(){var b=c(this),d=b.contents();d.length?d.wrapAll(a):b.append(a)})},wrap:function(a){return this.each(function(){c(this).wrapAll(a)})},unwrap:function(){return this.parent().each(function(){c.nodeName(this,"body")||c(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,true,function(a){this.nodeType===1&&this.appendChild(a)})},
prepend:function(){return this.domManip(arguments,true,function(a){this.nodeType===1&&this.insertBefore(a,this.firstChild)})},before:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,false,function(b){this.parentNode.insertBefore(b,this)});else if(arguments.length){var a=c(arguments[0]);a.push.apply(a,this.toArray());return this.pushStack(a,"before",arguments)}},after:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,false,function(b){this.parentNode.insertBefore(b,
this.nextSibling)});else if(arguments.length){var a=this.pushStack(this,"after",arguments);a.push.apply(a,c(arguments[0]).toArray());return a}},remove:function(a,b){for(var d=0,f;(f=this[d])!=null;d++)if(!a||c.filter(a,[f]).length){if(!b&&f.nodeType===1){c.cleanData(f.getElementsByTagName("*"));c.cleanData([f])}f.parentNode&&f.parentNode.removeChild(f)}return this},empty:function(){for(var a=0,b;(b=this[a])!=null;a++)for(b.nodeType===1&&c.cleanData(b.getElementsByTagName("*"));b.firstChild;)b.removeChild(b.firstChild);
return this},clone:function(a){var b=this.map(function(){if(!c.support.noCloneEvent&&!c.isXMLDoc(this)){var d=this.outerHTML,f=this.ownerDocument;if(!d){d=f.createElement("div");d.appendChild(this.cloneNode(true));d=d.innerHTML}return c.clean([d.replace(Ja,"").replace(/=([^="'>\s]+\/)>/g,'="$1">').replace(V,"")],f)[0]}else return this.cloneNode(true)});if(a===true){ra(this,b);ra(this.find("*"),b.find("*"))}return b},html:function(a){if(a===w)return this[0]&&this[0].nodeType===1?this[0].innerHTML.replace(Ja,
""):null;else if(typeof a==="string"&&!ta.test(a)&&(c.support.leadingWhitespace||!V.test(a))&&!F[(La.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(Ka,Ma);try{for(var b=0,d=this.length;b<d;b++)if(this[b].nodeType===1){c.cleanData(this[b].getElementsByTagName("*"));this[b].innerHTML=a}}catch(f){this.empty().append(a)}}else c.isFunction(a)?this.each(function(e){var j=c(this),i=j.html();j.empty().append(function(){return a.call(this,e,i)})}):this.empty().append(a);return this},replaceWith:function(a){if(this[0]&&
this[0].parentNode){if(c.isFunction(a))return this.each(function(b){var d=c(this),f=d.html();d.replaceWith(a.call(this,b,f))});if(typeof a!=="string")a=c(a).detach();return this.each(function(){var b=this.nextSibling,d=this.parentNode;c(this).remove();b?c(b).before(a):c(d).append(a)})}else return this.pushStack(c(c.isFunction(a)?a():a),"replaceWith",a)},detach:function(a){return this.remove(a,true)},domManip:function(a,b,d){function f(u){return c.nodeName(u,"table")?u.getElementsByTagName("tbody")[0]||
u.appendChild(u.ownerDocument.createElement("tbody")):u}var e,j,i=a[0],o=[],k;if(!c.support.checkClone&&arguments.length===3&&typeof i==="string"&&ua.test(i))return this.each(function(){c(this).domManip(a,b,d,true)});if(c.isFunction(i))return this.each(function(u){var z=c(this);a[0]=i.call(this,u,b?z.html():w);z.domManip(a,b,d)});if(this[0]){e=i&&i.parentNode;e=c.support.parentNode&&e&&e.nodeType===11&&e.childNodes.length===this.length?{fragment:e}:sa(a,this,o);k=e.fragment;if(j=k.childNodes.length===
1?(k=k.firstChild):k.firstChild){b=b&&c.nodeName(j,"tr");for(var n=0,r=this.length;n<r;n++)d.call(b?f(this[n],j):this[n],n>0||e.cacheable||this.length>1?k.cloneNode(true):k)}o.length&&c.each(o,Qa)}return this}});c.fragments={};c.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){c.fn[a]=function(d){var f=[];d=c(d);var e=this.length===1&&this[0].parentNode;if(e&&e.nodeType===11&&e.childNodes.length===1&&d.length===1){d[b](this[0]);
return this}else{e=0;for(var j=d.length;e<j;e++){var i=(e>0?this.clone(true):this).get();c.fn[b].apply(c(d[e]),i);f=f.concat(i)}return this.pushStack(f,a,d.selector)}}});c.extend({clean:function(a,b,d,f){b=b||s;if(typeof b.createElement==="undefined")b=b.ownerDocument||b[0]&&b[0].ownerDocument||s;for(var e=[],j=0,i;(i=a[j])!=null;j++){if(typeof i==="number")i+="";if(i){if(typeof i==="string"&&!jb.test(i))i=b.createTextNode(i);else if(typeof i==="string"){i=i.replace(Ka,Ma);var o=(La.exec(i)||["",
""])[1].toLowerCase(),k=F[o]||F._default,n=k[0],r=b.createElement("div");for(r.innerHTML=k[1]+i+k[2];n--;)r=r.lastChild;if(!c.support.tbody){n=ib.test(i);o=o==="table"&&!n?r.firstChild&&r.firstChild.childNodes:k[1]==="<table>"&&!n?r.childNodes:[];for(k=o.length-1;k>=0;--k)c.nodeName(o[k],"tbody")&&!o[k].childNodes.length&&o[k].parentNode.removeChild(o[k])}!c.support.leadingWhitespace&&V.test(i)&&r.insertBefore(b.createTextNode(V.exec(i)[0]),r.firstChild);i=r.childNodes}if(i.nodeType)e.push(i);else e=
c.merge(e,i)}}if(d)for(j=0;e[j];j++)if(f&&c.nodeName(e[j],"script")&&(!e[j].type||e[j].type.toLowerCase()==="text/javascript"))f.push(e[j].parentNode?e[j].parentNode.removeChild(e[j]):e[j]);else{e[j].nodeType===1&&e.splice.apply(e,[j+1,0].concat(c.makeArray(e[j].getElementsByTagName("script"))));d.appendChild(e[j])}return e},cleanData:function(a){for(var b,d,f=c.cache,e=c.event.special,j=c.support.deleteExpando,i=0,o;(o=a[i])!=null;i++)if(d=o[c.expando]){b=f[d];if(b.events)for(var k in b.events)e[k]?
c.event.remove(o,k):Ca(o,k,b.handle);if(j)delete o[c.expando];else o.removeAttribute&&o.removeAttribute(c.expando);delete f[d]}}});var kb=/z-?index|font-?weight|opacity|zoom|line-?height/i,Na=/alpha\([^)]*\)/,Oa=/opacity=([^)]*)/,ha=/float/i,ia=/-([a-z])/ig,lb=/([A-Z])/g,mb=/^-?\d+(?:px)?$/i,nb=/^-?\d/,ob={position:"absolute",visibility:"hidden",display:"block"},pb=["Left","Right"],qb=["Top","Bottom"],rb=s.defaultView&&s.defaultView.getComputedStyle,Pa=c.support.cssFloat?"cssFloat":"styleFloat",ja=
function(a,b){return b.toUpperCase()};c.fn.css=function(a,b){return X(this,a,b,true,function(d,f,e){if(e===w)return c.curCSS(d,f);if(typeof e==="number"&&!kb.test(f))e+="px";c.style(d,f,e)})};c.extend({style:function(a,b,d){if(!a||a.nodeType===3||a.nodeType===8)return w;if((b==="width"||b==="height")&&parseFloat(d)<0)d=w;var f=a.style||a,e=d!==w;if(!c.support.opacity&&b==="opacity"){if(e){f.zoom=1;b=parseInt(d,10)+""==="NaN"?"":"alpha(opacity="+d*100+")";a=f.filter||c.curCSS(a,"filter")||"";f.filter=
Na.test(a)?a.replace(Na,b):b}return f.filter&&f.filter.indexOf("opacity=")>=0?parseFloat(Oa.exec(f.filter)[1])/100+"":""}if(ha.test(b))b=Pa;b=b.replace(ia,ja);if(e)f[b]=d;return f[b]},css:function(a,b,d,f){if(b==="width"||b==="height"){var e,j=b==="width"?pb:qb;function i(){e=b==="width"?a.offsetWidth:a.offsetHeight;f!=="border"&&c.each(j,function(){f||(e-=parseFloat(c.curCSS(a,"padding"+this,true))||0);if(f==="margin")e+=parseFloat(c.curCSS(a,"margin"+this,true))||0;else e-=parseFloat(c.curCSS(a,
"border"+this+"Width",true))||0})}a.offsetWidth!==0?i():c.swap(a,ob,i);return Math.max(0,Math.round(e))}return c.curCSS(a,b,d)},curCSS:function(a,b,d){var f,e=a.style;if(!c.support.opacity&&b==="opacity"&&a.currentStyle){f=Oa.test(a.currentStyle.filter||"")?parseFloat(RegExp.$1)/100+"":"";return f===""?"1":f}if(ha.test(b))b=Pa;if(!d&&e&&e[b])f=e[b];else if(rb){if(ha.test(b))b="float";b=b.replace(lb,"-$1").toLowerCase();e=a.ownerDocument.defaultView;if(!e)return null;if(a=e.getComputedStyle(a,null))f=
a.getPropertyValue(b);if(b==="opacity"&&f==="")f="1"}else if(a.currentStyle){d=b.replace(ia,ja);f=a.currentStyle[b]||a.currentStyle[d];if(!mb.test(f)&&nb.test(f)){b=e.left;var j=a.runtimeStyle.left;a.runtimeStyle.left=a.currentStyle.left;e.left=d==="fontSize"?"1em":f||0;f=e.pixelLeft+"px";e.left=b;a.runtimeStyle.left=j}}return f},swap:function(a,b,d){var f={};for(var e in b){f[e]=a.style[e];a.style[e]=b[e]}d.call(a);for(e in b)a.style[e]=f[e]}});if(c.expr&&c.expr.filters){c.expr.filters.hidden=function(a){var b=
a.offsetWidth,d=a.offsetHeight,f=a.nodeName.toLowerCase()==="tr";return b===0&&d===0&&!f?true:b>0&&d>0&&!f?false:c.curCSS(a,"display")==="none"};c.expr.filters.visible=function(a){return!c.expr.filters.hidden(a)}}var sb=J(),tb=/<script(.|\s)*?\/script>/gi,ub=/select|textarea/i,vb=/color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week/i,N=/=\?(&|$)/,ka=/\?/,wb=/(\?|&)_=.*?(&|$)/,xb=/^(\w+:)?\/\/([^\/?#]+)/,yb=/%20/g,zb=c.fn.load;c.fn.extend({load:function(a,b,d){if(typeof a!==
"string")return zb.call(this,a);else if(!this.length)return this;var f=a.indexOf(" ");if(f>=0){var e=a.slice(f,a.length);a=a.slice(0,f)}f="GET";if(b)if(c.isFunction(b)){d=b;b=null}else if(typeof b==="object"){b=c.param(b,c.ajaxSettings.traditional);f="POST"}var j=this;c.ajax({url:a,type:f,dataType:"html",data:b,complete:function(i,o){if(o==="success"||o==="notmodified")j.html(e?c("<div />").append(i.responseText.replace(tb,"")).find(e):i.responseText);d&&j.each(d,[i.responseText,o,i])}});return this},
serialize:function(){return c.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?c.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||ub.test(this.nodeName)||vb.test(this.type))}).map(function(a,b){a=c(this).val();return a==null?null:c.isArray(a)?c.map(a,function(d){return{name:b.name,value:d}}):{name:b.name,value:a}}).get()}});c.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),
function(a,b){c.fn[b]=function(d){return this.bind(b,d)}});c.extend({get:function(a,b,d,f){if(c.isFunction(b)){f=f||d;d=b;b=null}return c.ajax({type:"GET",url:a,data:b,success:d,dataType:f})},getScript:function(a,b){return c.get(a,null,b,"script")},getJSON:function(a,b,d){return c.get(a,b,d,"json")},post:function(a,b,d,f){if(c.isFunction(b)){f=f||d;d=b;b={}}return c.ajax({type:"POST",url:a,data:b,success:d,dataType:f})},ajaxSetup:function(a){c.extend(c.ajaxSettings,a)},ajaxSettings:{url:location.href,
global:true,type:"GET",contentType:"application/x-www-form-urlencoded",processData:true,async:true,xhr:A.XMLHttpRequest&&(A.location.protocol!=="file:"||!A.ActiveXObject)?function(){return new A.XMLHttpRequest}:function(){try{return new A.ActiveXObject("Microsoft.XMLHTTP")}catch(a){}},accepts:{xml:"application/xml, text/xml",html:"text/html",script:"text/javascript, application/javascript",json:"application/json, text/javascript",text:"text/plain",_default:"*/*"}},lastModified:{},etag:{},ajax:function(a){function b(){e.success&&
e.success.call(k,o,i,x);e.global&&f("ajaxSuccess",[x,e])}function d(){e.complete&&e.complete.call(k,x,i);e.global&&f("ajaxComplete",[x,e]);e.global&&!--c.active&&c.event.trigger("ajaxStop")}function f(q,p){(e.context?c(e.context):c.event).trigger(q,p)}var e=c.extend(true,{},c.ajaxSettings,a),j,i,o,k=a&&a.context||e,n=e.type.toUpperCase();if(e.data&&e.processData&&typeof e.data!=="string")e.data=c.param(e.data,e.traditional);if(e.dataType==="jsonp"){if(n==="GET")N.test(e.url)||(e.url+=(ka.test(e.url)?
"&":"?")+(e.jsonp||"callback")+"=?");else if(!e.data||!N.test(e.data))e.data=(e.data?e.data+"&":"")+(e.jsonp||"callback")+"=?";e.dataType="json"}if(e.dataType==="json"&&(e.data&&N.test(e.data)||N.test(e.url))){j=e.jsonpCallback||"jsonp"+sb++;if(e.data)e.data=(e.data+"").replace(N,"="+j+"$1");e.url=e.url.replace(N,"="+j+"$1");e.dataType="script";A[j]=A[j]||function(q){o=q;b();d();A[j]=w;try{delete A[j]}catch(p){}z&&z.removeChild(C)}}if(e.dataType==="script"&&e.cache===null)e.cache=false;if(e.cache===
false&&n==="GET"){var r=J(),u=e.url.replace(wb,"$1_="+r+"$2");e.url=u+(u===e.url?(ka.test(e.url)?"&":"?")+"_="+r:"")}if(e.data&&n==="GET")e.url+=(ka.test(e.url)?"&":"?")+e.data;e.global&&!c.active++&&c.event.trigger("ajaxStart");r=(r=xb.exec(e.url))&&(r[1]&&r[1]!==location.protocol||r[2]!==location.host);if(e.dataType==="script"&&n==="GET"&&r){var z=s.getElementsByTagName("head")[0]||s.documentElement,C=s.createElement("script");C.src=e.url;if(e.scriptCharset)C.charset=e.scriptCharset;if(!j){var B=
false;C.onload=C.onreadystatechange=function(){if(!B&&(!this.readyState||this.readyState==="loaded"||this.readyState==="complete")){B=true;b();d();C.onload=C.onreadystatechange=null;z&&C.parentNode&&z.removeChild(C)}}}z.insertBefore(C,z.firstChild);return w}var E=false,x=e.xhr();if(x){e.username?x.open(n,e.url,e.async,e.username,e.password):x.open(n,e.url,e.async);try{if(e.data||a&&a.contentType)x.setRequestHeader("Content-Type",e.contentType);if(e.ifModified){c.lastModified[e.url]&&x.setRequestHeader("If-Modified-Since",
c.lastModified[e.url]);c.etag[e.url]&&x.setRequestHeader("If-None-Match",c.etag[e.url])}r||x.setRequestHeader("X-Requested-With","XMLHttpRequest");x.setRequestHeader("Accept",e.dataType&&e.accepts[e.dataType]?e.accepts[e.dataType]+", */*":e.accepts._default)}catch(ga){}if(e.beforeSend&&e.beforeSend.call(k,x,e)===false){e.global&&!--c.active&&c.event.trigger("ajaxStop");x.abort();return false}e.global&&f("ajaxSend",[x,e]);var g=x.onreadystatechange=function(q){if(!x||x.readyState===0||q==="abort"){E||
d();E=true;if(x)x.onreadystatechange=c.noop}else if(!E&&x&&(x.readyState===4||q==="timeout")){E=true;x.onreadystatechange=c.noop;i=q==="timeout"?"timeout":!c.httpSuccess(x)?"error":e.ifModified&&c.httpNotModified(x,e.url)?"notmodified":"success";var p;if(i==="success")try{o=c.httpData(x,e.dataType,e)}catch(v){i="parsererror";p=v}if(i==="success"||i==="notmodified")j||b();else c.handleError(e,x,i,p);d();q==="timeout"&&x.abort();if(e.async)x=null}};try{var h=x.abort;x.abort=function(){x&&h.call(x);
g("abort")}}catch(l){}e.async&&e.timeout>0&&setTimeout(function(){x&&!E&&g("timeout")},e.timeout);try{x.send(n==="POST"||n==="PUT"||n==="DELETE"?e.data:null)}catch(m){c.handleError(e,x,null,m);d()}e.async||g();return x}},handleError:function(a,b,d,f){if(a.error)a.error.call(a.context||a,b,d,f);if(a.global)(a.context?c(a.context):c.event).trigger("ajaxError",[b,a,f])},active:0,httpSuccess:function(a){try{return!a.status&&location.protocol==="file:"||a.status>=200&&a.status<300||a.status===304||a.status===
1223||a.status===0}catch(b){}return false},httpNotModified:function(a,b){var d=a.getResponseHeader("Last-Modified"),f=a.getResponseHeader("Etag");if(d)c.lastModified[b]=d;if(f)c.etag[b]=f;return a.status===304||a.status===0},httpData:function(a,b,d){var f=a.getResponseHeader("content-type")||"",e=b==="xml"||!b&&f.indexOf("xml")>=0;a=e?a.responseXML:a.responseText;e&&a.documentElement.nodeName==="parsererror"&&c.error("parsererror");if(d&&d.dataFilter)a=d.dataFilter(a,b);if(typeof a==="string")if(b===
"json"||!b&&f.indexOf("json")>=0)a=c.parseJSON(a);else if(b==="script"||!b&&f.indexOf("javascript")>=0)c.globalEval(a);return a},param:function(a,b){function d(i,o){if(c.isArray(o))c.each(o,function(k,n){b||/\[\]$/.test(i)?f(i,n):d(i+"["+(typeof n==="object"||c.isArray(n)?k:"")+"]",n)});else!b&&o!=null&&typeof o==="object"?c.each(o,function(k,n){d(i+"["+k+"]",n)}):f(i,o)}function f(i,o){o=c.isFunction(o)?o():o;e[e.length]=encodeURIComponent(i)+"="+encodeURIComponent(o)}var e=[];if(b===w)b=c.ajaxSettings.traditional;
if(c.isArray(a)||a.jquery)c.each(a,function(){f(this.name,this.value)});else for(var j in a)d(j,a[j]);return e.join("&").replace(yb,"+")}});var la={},Ab=/toggle|show|hide/,Bb=/^([+-]=)?([\d+-.]+)(.*)$/,W,va=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]];c.fn.extend({show:function(a,b){if(a||a===0)return this.animate(K("show",3),a,b);else{a=0;for(b=this.length;a<b;a++){var d=c.data(this[a],"olddisplay");
this[a].style.display=d||"";if(c.css(this[a],"display")==="none"){d=this[a].nodeName;var f;if(la[d])f=la[d];else{var e=c("<"+d+" />").appendTo("body");f=e.css("display");if(f==="none")f="block";e.remove();la[d]=f}c.data(this[a],"olddisplay",f)}}a=0;for(b=this.length;a<b;a++)this[a].style.display=c.data(this[a],"olddisplay")||"";return this}},hide:function(a,b){if(a||a===0)return this.animate(K("hide",3),a,b);else{a=0;for(b=this.length;a<b;a++){var d=c.data(this[a],"olddisplay");!d&&d!=="none"&&c.data(this[a],
"olddisplay",c.css(this[a],"display"))}a=0;for(b=this.length;a<b;a++)this[a].style.display="none";return this}},_toggle:c.fn.toggle,toggle:function(a,b){var d=typeof a==="boolean";if(c.isFunction(a)&&c.isFunction(b))this._toggle.apply(this,arguments);else a==null||d?this.each(function(){var f=d?a:c(this).is(":hidden");c(this)[f?"show":"hide"]()}):this.animate(K("toggle",3),a,b);return this},fadeTo:function(a,b,d){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:b},a,d)},
animate:function(a,b,d,f){var e=c.speed(b,d,f);if(c.isEmptyObject(a))return this.each(e.complete);return this[e.queue===false?"each":"queue"](function(){var j=c.extend({},e),i,o=this.nodeType===1&&c(this).is(":hidden"),k=this;for(i in a){var n=i.replace(ia,ja);if(i!==n){a[n]=a[i];delete a[i];i=n}if(a[i]==="hide"&&o||a[i]==="show"&&!o)return j.complete.call(this);if((i==="height"||i==="width")&&this.style){j.display=c.css(this,"display");j.overflow=this.style.overflow}if(c.isArray(a[i])){(j.specialEasing=
j.specialEasing||{})[i]=a[i][1];a[i]=a[i][0]}}if(j.overflow!=null)this.style.overflow="hidden";j.curAnim=c.extend({},a);c.each(a,function(r,u){var z=new c.fx(k,j,r);if(Ab.test(u))z[u==="toggle"?o?"show":"hide":u](a);else{var C=Bb.exec(u),B=z.cur(true)||0;if(C){u=parseFloat(C[2]);var E=C[3]||"px";if(E!=="px"){k.style[r]=(u||1)+E;B=(u||1)/z.cur(true)*B;k.style[r]=B+E}if(C[1])u=(C[1]==="-="?-1:1)*u+B;z.custom(B,u,E)}else z.custom(B,u,"")}});return true})},stop:function(a,b){var d=c.timers;a&&this.queue([]);
this.each(function(){for(var f=d.length-1;f>=0;f--)if(d[f].elem===this){b&&d[f](true);d.splice(f,1)}});b||this.dequeue();return this}});c.each({slideDown:K("show",1),slideUp:K("hide",1),slideToggle:K("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"}},function(a,b){c.fn[a]=function(d,f){return this.animate(b,d,f)}});c.extend({speed:function(a,b,d){var f=a&&typeof a==="object"?a:{complete:d||!d&&b||c.isFunction(a)&&a,duration:a,easing:d&&b||b&&!c.isFunction(b)&&b};f.duration=c.fx.off?0:typeof f.duration===
"number"?f.duration:c.fx.speeds[f.duration]||c.fx.speeds._default;f.old=f.complete;f.complete=function(){f.queue!==false&&c(this).dequeue();c.isFunction(f.old)&&f.old.call(this)};return f},easing:{linear:function(a,b,d,f){return d+f*a},swing:function(a,b,d,f){return(-Math.cos(a*Math.PI)/2+0.5)*f+d}},timers:[],fx:function(a,b,d){this.options=b;this.elem=a;this.prop=d;if(!b.orig)b.orig={}}});c.fx.prototype={update:function(){this.options.step&&this.options.step.call(this.elem,this.now,this);(c.fx.step[this.prop]||
c.fx.step._default)(this);if((this.prop==="height"||this.prop==="width")&&this.elem.style)this.elem.style.display="block"},cur:function(a){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null))return this.elem[this.prop];return(a=parseFloat(c.css(this.elem,this.prop,a)))&&a>-10000?a:parseFloat(c.curCSS(this.elem,this.prop))||0},custom:function(a,b,d){function f(j){return e.step(j)}this.startTime=J();this.start=a;this.end=b;this.unit=d||this.unit||"px";this.now=this.start;
this.pos=this.state=0;var e=this;f.elem=this.elem;if(f()&&c.timers.push(f)&&!W)W=setInterval(c.fx.tick,13)},show:function(){this.options.orig[this.prop]=c.style(this.elem,this.prop);this.options.show=true;this.custom(this.prop==="width"||this.prop==="height"?1:0,this.cur());c(this.elem).show()},hide:function(){this.options.orig[this.prop]=c.style(this.elem,this.prop);this.options.hide=true;this.custom(this.cur(),0)},step:function(a){var b=J(),d=true;if(a||b>=this.options.duration+this.startTime){this.now=
this.end;this.pos=this.state=1;this.update();this.options.curAnim[this.prop]=true;for(var f in this.options.curAnim)if(this.options.curAnim[f]!==true)d=false;if(d){if(this.options.display!=null){this.elem.style.overflow=this.options.overflow;a=c.data(this.elem,"olddisplay");this.elem.style.display=a?a:this.options.display;if(c.css(this.elem,"display")==="none")this.elem.style.display="block"}this.options.hide&&c(this.elem).hide();if(this.options.hide||this.options.show)for(var e in this.options.curAnim)c.style(this.elem,
e,this.options.orig[e]);this.options.complete.call(this.elem)}return false}else{e=b-this.startTime;this.state=e/this.options.duration;a=this.options.easing||(c.easing.swing?"swing":"linear");this.pos=c.easing[this.options.specialEasing&&this.options.specialEasing[this.prop]||a](this.state,e,0,1,this.options.duration);this.now=this.start+(this.end-this.start)*this.pos;this.update()}return true}};c.extend(c.fx,{tick:function(){for(var a=c.timers,b=0;b<a.length;b++)a[b]()||a.splice(b--,1);a.length||
c.fx.stop()},stop:function(){clearInterval(W);W=null},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(a){c.style(a.elem,"opacity",a.now)},_default:function(a){if(a.elem.style&&a.elem.style[a.prop]!=null)a.elem.style[a.prop]=(a.prop==="width"||a.prop==="height"?Math.max(0,a.now):a.now)+a.unit;else a.elem[a.prop]=a.now}}});if(c.expr&&c.expr.filters)c.expr.filters.animated=function(a){return c.grep(c.timers,function(b){return a===b.elem}).length};c.fn.offset="getBoundingClientRect"in s.documentElement?
function(a){var b=this[0];if(a)return this.each(function(e){c.offset.setOffset(this,a,e)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return c.offset.bodyOffset(b);var d=b.getBoundingClientRect(),f=b.ownerDocument;b=f.body;f=f.documentElement;return{top:d.top+(self.pageYOffset||c.support.boxModel&&f.scrollTop||b.scrollTop)-(f.clientTop||b.clientTop||0),left:d.left+(self.pageXOffset||c.support.boxModel&&f.scrollLeft||b.scrollLeft)-(f.clientLeft||b.clientLeft||0)}}:function(a){var b=
this[0];if(a)return this.each(function(r){c.offset.setOffset(this,a,r)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return c.offset.bodyOffset(b);c.offset.initialize();var d=b.offsetParent,f=b,e=b.ownerDocument,j,i=e.documentElement,o=e.body;f=(e=e.defaultView)?e.getComputedStyle(b,null):b.currentStyle;for(var k=b.offsetTop,n=b.offsetLeft;(b=b.parentNode)&&b!==o&&b!==i;){if(c.offset.supportsFixedPosition&&f.position==="fixed")break;j=e?e.getComputedStyle(b,null):b.currentStyle;
k-=b.scrollTop;n-=b.scrollLeft;if(b===d){k+=b.offsetTop;n+=b.offsetLeft;if(c.offset.doesNotAddBorder&&!(c.offset.doesAddBorderForTableAndCells&&/^t(able|d|h)$/i.test(b.nodeName))){k+=parseFloat(j.borderTopWidth)||0;n+=parseFloat(j.borderLeftWidth)||0}f=d;d=b.offsetParent}if(c.offset.subtractsBorderForOverflowNotVisible&&j.overflow!=="visible"){k+=parseFloat(j.borderTopWidth)||0;n+=parseFloat(j.borderLeftWidth)||0}f=j}if(f.position==="relative"||f.position==="static"){k+=o.offsetTop;n+=o.offsetLeft}if(c.offset.supportsFixedPosition&&
f.position==="fixed"){k+=Math.max(i.scrollTop,o.scrollTop);n+=Math.max(i.scrollLeft,o.scrollLeft)}return{top:k,left:n}};c.offset={initialize:function(){var a=s.body,b=s.createElement("div"),d,f,e,j=parseFloat(c.curCSS(a,"marginTop",true))||0;c.extend(b.style,{position:"absolute",top:0,left:0,margin:0,border:0,width:"1px",height:"1px",visibility:"hidden"});b.innerHTML="<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";
a.insertBefore(b,a.firstChild);d=b.firstChild;f=d.firstChild;e=d.nextSibling.firstChild.firstChild;this.doesNotAddBorder=f.offsetTop!==5;this.doesAddBorderForTableAndCells=e.offsetTop===5;f.style.position="fixed";f.style.top="20px";this.supportsFixedPosition=f.offsetTop===20||f.offsetTop===15;f.style.position=f.style.top="";d.style.overflow="hidden";d.style.position="relative";this.subtractsBorderForOverflowNotVisible=f.offsetTop===-5;this.doesNotIncludeMarginInBodyOffset=a.offsetTop!==j;a.removeChild(b);
c.offset.initialize=c.noop},bodyOffset:function(a){var b=a.offsetTop,d=a.offsetLeft;c.offset.initialize();if(c.offset.doesNotIncludeMarginInBodyOffset){b+=parseFloat(c.curCSS(a,"marginTop",true))||0;d+=parseFloat(c.curCSS(a,"marginLeft",true))||0}return{top:b,left:d}},setOffset:function(a,b,d){if(/static/.test(c.curCSS(a,"position")))a.style.position="relative";var f=c(a),e=f.offset(),j=parseInt(c.curCSS(a,"top",true),10)||0,i=parseInt(c.curCSS(a,"left",true),10)||0;if(c.isFunction(b))b=b.call(a,
d,e);d={top:b.top-e.top+j,left:b.left-e.left+i};"using"in b?b.using.call(a,d):f.css(d)}};c.fn.extend({position:function(){if(!this[0])return null;var a=this[0],b=this.offsetParent(),d=this.offset(),f=/^body|html$/i.test(b[0].nodeName)?{top:0,left:0}:b.offset();d.top-=parseFloat(c.curCSS(a,"marginTop",true))||0;d.left-=parseFloat(c.curCSS(a,"marginLeft",true))||0;f.top+=parseFloat(c.curCSS(b[0],"borderTopWidth",true))||0;f.left+=parseFloat(c.curCSS(b[0],"borderLeftWidth",true))||0;return{top:d.top-
f.top,left:d.left-f.left}},offsetParent:function(){return this.map(function(){for(var a=this.offsetParent||s.body;a&&!/^body|html$/i.test(a.nodeName)&&c.css(a,"position")==="static";)a=a.offsetParent;return a})}});c.each(["Left","Top"],function(a,b){var d="scroll"+b;c.fn[d]=function(f){var e=this[0],j;if(!e)return null;if(f!==w)return this.each(function(){if(j=wa(this))j.scrollTo(!a?f:c(j).scrollLeft(),a?f:c(j).scrollTop());else this[d]=f});else return(j=wa(e))?"pageXOffset"in j?j[a?"pageYOffset":
"pageXOffset"]:c.support.boxModel&&j.document.documentElement[d]||j.document.body[d]:e[d]}});c.each(["Height","Width"],function(a,b){var d=b.toLowerCase();c.fn["inner"+b]=function(){return this[0]?c.css(this[0],d,false,"padding"):null};c.fn["outer"+b]=function(f){return this[0]?c.css(this[0],d,false,f?"margin":"border"):null};c.fn[d]=function(f){var e=this[0];if(!e)return f==null?null:this;if(c.isFunction(f))return this.each(function(j){var i=c(this);i[d](f.call(this,j,i[d]()))});return"scrollTo"in
e&&e.document?e.document.compatMode==="CSS1Compat"&&e.document.documentElement["client"+b]||e.document.body["client"+b]:e.nodeType===9?Math.max(e.documentElement["client"+b],e.body["scroll"+b],e.documentElement["scroll"+b],e.body["offset"+b],e.documentElement["offset"+b]):f===w?c.css(e,d):this.css(d,typeof f==="string"?f:f+"px")}});A.jQuery=A.$=c})(window);
/*!
 * jQuery UI 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI
 *//*
 * jQuery UI 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI
 */
jQuery.ui||(function(b){var a=b.browser.mozilla&&(parseFloat(b.browser.version)<1.9);b.ui={version:"1.8rc1",plugin:{add:function(d,e,g){var f=b.ui[d].prototype;for(var c in g){f.plugins[c]=f.plugins[c]||[];f.plugins[c].push([e,g[c]])}},call:function(c,e,d){var g=c.plugins[e];if(!g||!c.element[0].parentNode){return}for(var f=0;f<g.length;f++){if(c.options[g[f][0]]){g[f][1].apply(c.element,d)}}}},contains:function(d,c){return document.compareDocumentPosition?d.compareDocumentPosition(c)&16:d!==c&&d.contains(c)},hasScroll:function(f,d){if(b(f).css("overflow")=="hidden"){return false}var c=(d&&d=="left")?"scrollLeft":"scrollTop",e=false;if(f[c]>0){return true}f[c]=1;e=(f[c]>0);f[c]=0;return e},isOverAxis:function(d,c,e){return(d>c)&&(d<(c+e))},isOver:function(h,d,g,f,c,e){return b.ui.isOverAxis(h,g,c)&&b.ui.isOverAxis(d,f,e)},keyCode:{BACKSPACE:8,CAPS_LOCK:20,COMMA:188,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38}};b.fn.extend({_focus:b.fn.focus,focus:function(c,d){return typeof c==="number"?this.each(function(){var e=this;setTimeout(function(){b(e).focus();(d&&d.call(e))},c)}):this._focus.apply(this,arguments)},enableSelection:function(){return this.attr("unselectable","off").css("MozUserSelect","").unbind("selectstart.ui")},disableSelection:function(){return this.attr("unselectable","on").css("MozUserSelect","none").bind("selectstart.ui",function(){return false})},scrollParent:function(){var c;if((b.browser.msie&&(/(static|relative)/).test(this.css("position")))||(/absolute/).test(this.css("position"))){c=this.parents().filter(function(){return(/(relative|absolute|fixed)/).test(b.curCSS(this,"position",1))&&(/(auto|scroll)/).test(b.curCSS(this,"overflow",1)+b.curCSS(this,"overflow-y",1)+b.curCSS(this,"overflow-x",1))}).eq(0)}else{c=this.parents().filter(function(){return(/(auto|scroll)/).test(b.curCSS(this,"overflow",1)+b.curCSS(this,"overflow-y",1)+b.curCSS(this,"overflow-x",1))}).eq(0)}return(/fixed/).test(this.css("position"))||!c.length?b(document):c},zIndex:function(d){if(d!==undefined){return this.css("zIndex",d)}var c=this[0];while(c&&c.style){if(c.style.zIndex!==""&&c.style.zIndex!==0){return +c.style.zIndex}c=c.parentNode}return 0}});b.extend(b.expr[":"],{data:function(e,d,c){return !!b.data(e,c[3])},focusable:function(d){var e=d.nodeName.toLowerCase(),c=b.attr(d,"tabindex");return(/input|select|textarea|button|object/.test(e)?!d.disabled:"a"==e||"area"==e?d.href||!isNaN(c):!isNaN(c))&&!b(d)["area"==e?"parents":"closest"](":hidden").length},tabbable:function(d){var c=b.attr(d,"tabindex");return(isNaN(c)||c>=0)&&b(d).is(":focusable")}})})(jQuery);;/*!
 * jQuery UI Widget 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Widget
 *//*
 * jQuery UI Widget 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Widget
 */
(function(b){var a=b.fn.remove;b.fn.remove=function(c,d){if(!d){b("*",this).add(this).each(function(){b(this).triggerHandler("remove")})}return a.apply(this,arguments)};b.widget=function(d,f,c){var e=d.split(".")[0],h;d=d.split(".")[1];h=e+"-"+d;if(!c){c=f;f=b.Widget}b.expr[":"][h]=function(i){return !!b.data(i,d)};b[e]=b[e]||{};b[e][d]=function(i,j){if(arguments.length){this._createWidget(i,j)}};var g=new f();g.options=b.extend({},g.options);b[e][d].prototype=b.extend(true,g,{namespace:e,widgetName:d,widgetEventPrefix:b[e][d].prototype.widgetEventPrefix||d,widgetBaseClass:h},c);b.widget.bridge(d,b[e][d])};b.widget.bridge=function(d,c){b.fn[d]=function(g){var e=typeof g==="string",f=Array.prototype.slice.call(arguments,1),h=this;g=!e&&f.length?b.extend.apply(null,[true,g].concat(f)):g;if(e&&g.substring(0,1)==="_"){return h}if(e){this.each(function(){var i=b.data(this,d),j=i&&b.isFunction(i[g])?i[g].apply(i,f):i;if(j!==i&&j!==undefined){h=j;return false}})}else{this.each(function(){var i=b.data(this,d);if(i){if(g){i.option(g)}i._init()}else{b.data(this,d,new c(g,this))}})}return h}};b.Widget=function(c,d){if(arguments.length){this._createWidget(c,d)}};b.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",options:{disabled:false},_createWidget:function(d,e){this.element=b(e).data(this.widgetName,this);this.options=b.extend(true,{},this.options,b.metadata&&b.metadata.get(e)[this.widgetName],d);var c=this;this.element.bind("remove."+this.widgetName,function(){c.destroy()});this._create();this._init()},_create:function(){},_init:function(){},destroy:function(){this.element.unbind("."+this.widgetName).removeData(this.widgetName);this.widget().unbind("."+this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass+"-disabled "+this.namespace+"-state-disabled")},widget:function(){return this.element},option:function(e,f){var d=e,c=this;if(arguments.length===0){return b.extend({},c.options)}if(typeof e==="string"){if(f===undefined){return this.options[e]}d={};d[e]=f}b.each(d,function(g,h){c._setOption(g,h)});return c},_setOption:function(c,d){this.options[c]=d;if(c==="disabled"){this.widget()[d?"addClass":"removeClass"](this.widgetBaseClass+"-disabled "+this.namespace+"-state-disabled").attr("aria-disabled",d)}return this},enable:function(){return this._setOption("disabled",false)},disable:function(){return this._setOption("disabled",true)},_trigger:function(d,e,f){var h=this.options[d];e=b.Event(e);e.type=(d===this.widgetEventPrefix?d:this.widgetEventPrefix+d).toLowerCase();f=f||{};if(e.originalEvent){for(var c=b.event.props.length,g;c;){g=b.event.props[--c];e[g]=e.originalEvent[g]}}this.element.trigger(e,f);return !(b.isFunction(h)&&h.call(this.element[0],e,f)===false||e.isDefaultPrevented())}}})(jQuery);;/*!
 * jQuery UI Mouse 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *	jquery.ui.widget.js
 *//*
 * jQuery UI Mouse 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *	jquery.ui.widget.js
 */
(function(a){a.widget("ui.mouse",{options:{cancel:":input,option",distance:1,delay:0},_mouseInit:function(){var b=this;this.element.bind("mousedown."+this.widgetName,function(c){return b._mouseDown(c)}).bind("click."+this.widgetName,function(c){if(b._preventClickEvent){b._preventClickEvent=false;c.stopImmediatePropagation();return false}});this.started=false},_mouseDestroy:function(){this.element.unbind("."+this.widgetName)},_mouseDown:function(d){d.originalEvent=d.originalEvent||{};if(d.originalEvent.mouseHandled){return}(this._mouseStarted&&this._mouseUp(d));this._mouseDownEvent=d;var c=this,e=(d.which==1),b=(typeof this.options.cancel=="string"?a(d.target).parents().add(d.target).filter(this.options.cancel).length:false);if(!e||b||!this._mouseCapture(d)){return true}this.mouseDelayMet=!this.options.delay;if(!this.mouseDelayMet){this._mouseDelayTimer=setTimeout(function(){c.mouseDelayMet=true},this.options.delay)}if(this._mouseDistanceMet(d)&&this._mouseDelayMet(d)){this._mouseStarted=(this._mouseStart(d)!==false);if(!this._mouseStarted){d.preventDefault();return true}}this._mouseMoveDelegate=function(f){return c._mouseMove(f)};this._mouseUpDelegate=function(f){return c._mouseUp(f)};a(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate);(a.browser.safari||d.preventDefault());d.originalEvent.mouseHandled=true;return true},_mouseMove:function(b){if(a.browser.msie&&!b.button){return this._mouseUp(b)}if(this._mouseStarted){this._mouseDrag(b);return b.preventDefault()}if(this._mouseDistanceMet(b)&&this._mouseDelayMet(b)){this._mouseStarted=(this._mouseStart(this._mouseDownEvent,b)!==false);(this._mouseStarted?this._mouseDrag(b):this._mouseUp(b))}return !this._mouseStarted},_mouseUp:function(b){a(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate);if(this._mouseStarted){this._mouseStarted=false;this._preventClickEvent=(b.target==this._mouseDownEvent.target);this._mouseStop(b)}return false},_mouseDistanceMet:function(b){return(Math.max(Math.abs(this._mouseDownEvent.pageX-b.pageX),Math.abs(this._mouseDownEvent.pageY-b.pageY))>=this.options.distance)},_mouseDelayMet:function(b){return this.mouseDelayMet},_mouseStart:function(b){},_mouseDrag:function(b){},_mouseStop:function(b){},_mouseCapture:function(b){return true}})})(jQuery);;/*
 * jQuery UI Position 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Position
 */(function(f){f.ui=f.ui||{};var c=/left|center|right/,e="center",d=/top|center|bottom/,g="center",a=f.fn.position;f.fn.position=function(i){if(!i||!i.of){return a.apply(this,arguments)}i=f.extend({},i);var l=f(i.of),n=(i.collision||"flip").split(" "),m=i.offset?i.offset.split(" "):[0,0],k,h,j;if(i.of.nodeType===9){k=l.width();h=l.height();j={top:0,left:0}}else{if(i.of.scrollTo&&i.of.document){k=l.width();h=l.height();j={top:l.scrollTop(),left:l.scrollLeft()}}else{if(i.of.preventDefault){i.at="left top";k=h=0;j={top:i.of.pageY,left:i.of.pageX}}else{k=l.outerWidth();h=l.outerHeight();j=l.offset()}}}f.each(["my","at"],function(){var o=(i[this]||"").split(" ");o=o.length==1?c.test(o[0])?o.concat([g]):d.test(o[0])?[e].concat(o):[e,g]:o;o[0]=c.test(o[0])?o[0]:e;o[1]=d.test(o[1])?o[1]:g;i[this]=o});if(n.length==1){n[1]=n[0]}m[0]=parseInt(m[0],10)||0;if(m.length==1){m[1]=m[0]}m[1]=parseInt(m[1],10)||0;switch(i.at[0]){case"right":j.left+=k;break;case e:j.left+=k/2;break}switch(i.at[1]){case"bottom":j.top+=h;break;case g:j.top+=h/2;break}j.left+=m[0];j.top+=m[1];return this.each(function(){var t=f(this),s=t.outerWidth(),r=t.outerHeight(),p=f.extend({},j),u,o,q;switch(i.my[0]){case"right":p.left-=s;break;case e:p.left-=s/2;break}switch(i.my[1]){case"bottom":p.top-=r;break;case g:p.top-=r/2;break}f.each(["left","top"],function(w,v){(f.ui.position[n[w]]&&f.ui.position[n[w]][v](p,{targetWidth:k,targetHeight:h,elemWidth:s,elemHeight:r,offset:m,my:i.my,at:i.at}))});(f.fn.bgiframe&&t.bgiframe());t.offset(f.extend(p,{using:i.using}))})};f.ui.position={fit:{left:function(h,i){var j=h.left+i.elemWidth-f(window).width()-f(window).scrollLeft();h.left=j>0?h.left-j:Math.max(0,h.left)},top:function(h,i){var j=h.top+i.elemHeight-f(window).height()-f(window).scrollTop();h.top=j>0?h.top-j:Math.max(0,h.top)}},flip:{left:function(i,j){if(j.at[0]=="center"){return}var k=i.left+j.elemWidth-f(window).width()-f(window).scrollLeft(),h=j.my[0]=="left"?-j.elemWidth:j.my[0]=="right"?j.elemWidth:0,l=-2*j.offset[0];i.left+=i.left<0?h+j.targetWidth+l:k>0?h-j.targetWidth+l:0},top:function(i,k){if(k.at[1]=="center"){return}var l=i.top+k.elemHeight-f(window).height()-f(window).scrollTop(),h=k.my[1]=="top"?-k.elemHeight:k.my[1]=="bottom"?k.elemHeight:0,j=k.at[1]=="top"?k.targetHeight:-k.targetHeight,m=-2*k.offset[1];i.top+=i.top<0?h+k.targetHeight+m:l>0?h+j+m:0}}};if(!f.offset.setOffset){f.offset.setOffset=function(l,i){if(/static/.test(jQuery.curCSS(l,"position"))){l.style.position="relative"}var k=jQuery(l),n=k.offset(),h=parseInt(jQuery.curCSS(l,"top",true),10)||0,m=parseInt(jQuery.curCSS(l,"left",true),10)||0,j={top:(i.top-n.top)+h,left:(i.left-n.left)+m};if("using" in i){i.using.call(l,j)}else{k.css(j)}};var b=f.fn.offset;f.fn.offset=function(h){var i=this[0];if(!i||!i.ownerDocument){return null}if(h){return this.each(function(){f.offset.setOffset(this,h)})}return b.call(this)}}})(jQuery);;/*
 * jQuery UI Draggable 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Draggables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */(function(a){a.widget("ui.draggable",a.ui.mouse,{options:{addClasses:true,appendTo:"parent",axis:false,connectToSortable:false,containment:false,cursor:"auto",cursorAt:false,grid:false,handle:false,helper:"original",iframeFix:false,opacity:false,refreshPositions:false,revert:false,revertDuration:500,scope:"default",scroll:true,scrollSensitivity:20,scrollSpeed:20,snap:false,snapMode:"both",snapTolerance:20,stack:false,zIndex:false},_create:function(){if(this.options.helper=="original"&&!(/^(?:r|a|f)/).test(this.element.css("position"))){this.element[0].style.position="relative"}(this.options.addClasses&&this.element.addClass("ui-draggable"));(this.options.disabled&&this.element.addClass("ui-draggable-disabled"));this._mouseInit()},destroy:function(){if(!this.element.data("draggable")){return}this.element.removeData("draggable").unbind(".draggable").removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled");this._mouseDestroy();return this},_mouseCapture:function(b){var c=this.options;if(this.helper||c.disabled||a(b.target).is(".ui-resizable-handle")){return false}this.handle=this._getHandle(b);if(!this.handle){return false}return true},_mouseStart:function(b){var c=this.options;this.helper=this._createHelper(b);this._cacheHelperProportions();if(a.ui.ddmanager){a.ui.ddmanager.current=this}this._cacheMargins();this.cssPosition=this.helper.css("position");this.scrollParent=this.helper.scrollParent();this.offset=this.positionAbs=this.element.offset();this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left};a.extend(this.offset,{click:{left:b.pageX-this.offset.left,top:b.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()});this.originalPosition=this.position=this._generatePosition(b);this.originalPageX=b.pageX;this.originalPageY=b.pageY;(c.cursorAt&&this._adjustOffsetFromHelper(c.cursorAt));if(c.containment){this._setContainment()}this._trigger("start",b);this._cacheHelperProportions();if(a.ui.ddmanager&&!c.dropBehaviour){a.ui.ddmanager.prepareOffsets(this,b)}this.helper.addClass("ui-draggable-dragging");this._mouseDrag(b,true);return true},_mouseDrag:function(b,d){this.position=this._generatePosition(b);this.positionAbs=this._convertPositionTo("absolute");if(!d){var c=this._uiHash();this._trigger("drag",b,c);this.position=c.position}if(!this.options.axis||this.options.axis!="y"){this.helper[0].style.left=this.position.left+"px"}if(!this.options.axis||this.options.axis!="x"){this.helper[0].style.top=this.position.top+"px"}if(a.ui.ddmanager){a.ui.ddmanager.drag(this,b)}return false},_mouseStop:function(c){var d=false;if(a.ui.ddmanager&&!this.options.dropBehaviour){d=a.ui.ddmanager.drop(this,c)}if(this.dropped){d=this.dropped;this.dropped=false}if(!this.element[0]||!this.element[0].parentNode){return false}if((this.options.revert=="invalid"&&!d)||(this.options.revert=="valid"&&d)||this.options.revert===true||(a.isFunction(this.options.revert)&&this.options.revert.call(this.element,d))){var b=this;a(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){b._trigger("stop",c);b._clear()})}else{this._trigger("stop",c);this._clear()}return false},_getHandle:function(b){var c=!this.options.handle||!a(this.options.handle,this.element).length?true:false;a(this.options.handle,this.element).find("*").andSelf().each(function(){if(this==b.target){c=true}});return c},_createHelper:function(c){var d=this.options;var b=a.isFunction(d.helper)?a(d.helper.apply(this.element[0],[c])):(d.helper=="clone"?this.element.clone():this.element);if(!b.parents("body").length){b.appendTo((d.appendTo=="parent"?this.element[0].parentNode:d.appendTo))}if(b[0]!=this.element[0]&&!(/(fixed|absolute)/).test(b.css("position"))){b.css("position","absolute")}return b},_adjustOffsetFromHelper:function(b){if(typeof b=="string"){b=b.split(" ")}if(a.isArray(b)){b={left:+b[0],top:+b[1]||0}}if("left" in b){this.offset.click.left=b.left+this.margins.left}if("right" in b){this.offset.click.left=this.helperProportions.width-b.right+this.margins.left}if("top" in b){this.offset.click.top=b.top+this.margins.top}if("bottom" in b){this.offset.click.top=this.helperProportions.height-b.bottom+this.margins.top}},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var b=this.offsetParent.offset();if(this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&a.ui.contains(this.scrollParent[0],this.offsetParent[0])){b.left+=this.scrollParent.scrollLeft();b.top+=this.scrollParent.scrollTop()}if((this.offsetParent[0]==document.body)||(this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&a.browser.msie)){b={top:0,left:0}}return{top:b.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:b.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var b=this.element.position();return{top:b.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:b.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}else{return{top:0,left:0}}},_cacheMargins:function(){this.margins={left:(parseInt(this.element.css("marginLeft"),10)||0),top:(parseInt(this.element.css("marginTop"),10)||0)}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e=this.options;if(e.containment=="parent"){e.containment=this.helper[0].parentNode}if(e.containment=="document"||e.containment=="window"){this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,a(e.containment=="document"?document:window).width()-this.helperProportions.width-this.margins.left,(a(e.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top]}if(!(/^(document|window|parent)$/).test(e.containment)&&e.containment.constructor!=Array){var c=a(e.containment)[0];if(!c){return}var d=a(e.containment).offset();var b=(a(c).css("overflow")!="hidden");this.containment=[d.left+(parseInt(a(c).css("borderLeftWidth"),10)||0)+(parseInt(a(c).css("paddingLeft"),10)||0)-this.margins.left,d.top+(parseInt(a(c).css("borderTopWidth"),10)||0)+(parseInt(a(c).css("paddingTop"),10)||0)-this.margins.top,d.left+(b?Math.max(c.scrollWidth,c.offsetWidth):c.offsetWidth)-(parseInt(a(c).css("borderLeftWidth"),10)||0)-(parseInt(a(c).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left,d.top+(b?Math.max(c.scrollHeight,c.offsetHeight):c.offsetHeight)-(parseInt(a(c).css("borderTopWidth"),10)||0)-(parseInt(a(c).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top]}else{if(e.containment.constructor==Array){this.containment=e.containment}}},_convertPositionTo:function(f,h){if(!h){h=this.position}var c=f=="absolute"?1:-1;var e=this.options,b=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&a.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,g=(/(html|body)/i).test(b[0].tagName);return{top:(h.top+this.offset.relative.top*c+this.offset.parent.top*c-(a.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():(g?0:b.scrollTop()))*c)),left:(h.left+this.offset.relative.left*c+this.offset.parent.left*c-(a.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():g?0:b.scrollLeft())*c))}},_generatePosition:function(e){var h=this.options,b=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&a.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,i=(/(html|body)/i).test(b[0].tagName);if(this.cssPosition=="relative"&&!(this.scrollParent[0]!=document&&this.scrollParent[0]!=this.offsetParent[0])){this.offset.relative=this._getRelativeOffset()}var d=e.pageX;var c=e.pageY;if(this.originalPosition){if(this.containment){if(e.pageX-this.offset.click.left<this.containment[0]){d=this.containment[0]+this.offset.click.left}if(e.pageY-this.offset.click.top<this.containment[1]){c=this.containment[1]+this.offset.click.top}if(e.pageX-this.offset.click.left>this.containment[2]){d=this.containment[2]+this.offset.click.left}if(e.pageY-this.offset.click.top>this.containment[3]){c=this.containment[3]+this.offset.click.top}}if(h.grid){var g=this.originalPageY+Math.round((c-this.originalPageY)/h.grid[1])*h.grid[1];c=this.containment?(!(g-this.offset.click.top<this.containment[1]||g-this.offset.click.top>this.containment[3])?g:(!(g-this.offset.click.top<this.containment[1])?g-h.grid[1]:g+h.grid[1])):g;var f=this.originalPageX+Math.round((d-this.originalPageX)/h.grid[0])*h.grid[0];d=this.containment?(!(f-this.offset.click.left<this.containment[0]||f-this.offset.click.left>this.containment[2])?f:(!(f-this.offset.click.left<this.containment[0])?f-h.grid[0]:f+h.grid[0])):f}}return{top:(c-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(a.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():(i?0:b.scrollTop())))),left:(d-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(a.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():i?0:b.scrollLeft())))}},_clear:function(){this.helper.removeClass("ui-draggable-dragging");if(this.helper[0]!=this.element[0]&&!this.cancelHelperRemoval){this.helper.remove()}this.helper=null;this.cancelHelperRemoval=false},_trigger:function(b,c,d){d=d||this._uiHash();a.ui.plugin.call(this,b,[c,d]);if(b=="drag"){this.positionAbs=this._convertPositionTo("absolute")}return a.Widget.prototype._trigger.call(this,b,c,d)},plugins:{},_uiHash:function(b){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}});a.extend(a.ui.draggable,{version:"1.8rc1",eventPrefix:"drag"});a.ui.plugin.add("draggable","connectToSortable",{start:function(c,e){var d=a(this).data("draggable"),f=d.options,b=a.extend({},e,{item:d.element});d.sortables=[];a(f.connectToSortable).each(function(){var g=a.data(this,"sortable");if(g&&!g.options.disabled){d.sortables.push({instance:g,shouldRevert:g.options.revert});g._refreshItems();g._trigger("activate",c,b)}})},stop:function(c,e){var d=a(this).data("draggable"),b=a.extend({},e,{item:d.element});a.each(d.sortables,function(){if(this.instance.isOver){this.instance.isOver=0;d.cancelHelperRemoval=true;this.instance.cancelHelperRemoval=false;if(this.shouldRevert){this.instance.options.revert=true}this.instance._mouseStop(c);this.instance.options.helper=this.instance.options._helper;if(d.options.helper=="original"){this.instance.currentItem.css({top:"auto",left:"auto"})}}else{this.instance.cancelHelperRemoval=false;this.instance._trigger("deactivate",c,b)}})},drag:function(c,f){var e=a(this).data("draggable"),b=this;var d=function(i){var n=this.offset.click.top,m=this.offset.click.left;var g=this.positionAbs.top,k=this.positionAbs.left;var j=i.height,l=i.width;var p=i.top,h=i.left;return a.ui.isOver(g+n,k+m,p,h,j,l)};a.each(e.sortables,function(g){this.instance.positionAbs=e.positionAbs;this.instance.helperProportions=e.helperProportions;this.instance.offset.click=e.offset.click;if(this.instance._intersectsWith(this.instance.containerCache)){if(!this.instance.isOver){this.instance.isOver=1;this.instance.currentItem=a(b).clone().appendTo(this.instance.element).data("sortable-item",true);this.instance.options._helper=this.instance.options.helper;this.instance.options.helper=function(){return f.helper[0]};c.target=this.instance.currentItem[0];this.instance._mouseCapture(c,true);this.instance._mouseStart(c,true,true);this.instance.offset.click.top=e.offset.click.top;this.instance.offset.click.left=e.offset.click.left;this.instance.offset.parent.left-=e.offset.parent.left-this.instance.offset.parent.left;this.instance.offset.parent.top-=e.offset.parent.top-this.instance.offset.parent.top;e._trigger("toSortable",c);e.dropped=this.instance.element;e.currentItem=e.element;this.instance.fromOutside=e}if(this.instance.currentItem){this.instance._mouseDrag(c)}}else{if(this.instance.isOver){this.instance.isOver=0;this.instance.cancelHelperRemoval=true;this.instance.options.revert=false;this.instance._trigger("out",c,this.instance._uiHash(this.instance));this.instance._mouseStop(c,true);this.instance.options.helper=this.instance.options._helper;this.instance.currentItem.remove();if(this.instance.placeholder){this.instance.placeholder.remove()}e._trigger("fromSortable",c);e.dropped=false}}})}});a.ui.plugin.add("draggable","cursor",{start:function(c,d){var b=a("body"),e=a(this).data("draggable").options;if(b.css("cursor")){e._cursor=b.css("cursor")}b.css("cursor",e.cursor)},stop:function(b,c){var d=a(this).data("draggable").options;if(d._cursor){a("body").css("cursor",d._cursor)}}});a.ui.plugin.add("draggable","iframeFix",{start:function(b,c){var d=a(this).data("draggable").options;a(d.iframeFix===true?"iframe":d.iframeFix).each(function(){a('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>').css({width:this.offsetWidth+"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1000}).css(a(this).offset()).appendTo("body")})},stop:function(b,c){a("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)})}});a.ui.plugin.add("draggable","opacity",{start:function(c,d){var b=a(d.helper),e=a(this).data("draggable").options;if(b.css("opacity")){e._opacity=b.css("opacity")}b.css("opacity",e.opacity)},stop:function(b,c){var d=a(this).data("draggable").options;if(d._opacity){a(c.helper).css("opacity",d._opacity)}}});a.ui.plugin.add("draggable","scroll",{start:function(c,d){var b=a(this).data("draggable");if(b.scrollParent[0]!=document&&b.scrollParent[0].tagName!="HTML"){b.overflowOffset=b.scrollParent.offset()}},drag:function(d,e){var c=a(this).data("draggable"),f=c.options,b=false;if(c.scrollParent[0]!=document&&c.scrollParent[0].tagName!="HTML"){if(!f.axis||f.axis!="x"){if((c.overflowOffset.top+c.scrollParent[0].offsetHeight)-d.pageY<f.scrollSensitivity){c.scrollParent[0].scrollTop=b=c.scrollParent[0].scrollTop+f.scrollSpeed}else{if(d.pageY-c.overflowOffset.top<f.scrollSensitivity){c.scrollParent[0].scrollTop=b=c.scrollParent[0].scrollTop-f.scrollSpeed}}}if(!f.axis||f.axis!="y"){if((c.overflowOffset.left+c.scrollParent[0].offsetWidth)-d.pageX<f.scrollSensitivity){c.scrollParent[0].scrollLeft=b=c.scrollParent[0].scrollLeft+f.scrollSpeed}else{if(d.pageX-c.overflowOffset.left<f.scrollSensitivity){c.scrollParent[0].scrollLeft=b=c.scrollParent[0].scrollLeft-f.scrollSpeed}}}}else{if(!f.axis||f.axis!="x"){if(d.pageY-a(document).scrollTop()<f.scrollSensitivity){b=a(document).scrollTop(a(document).scrollTop()-f.scrollSpeed)}else{if(a(window).height()-(d.pageY-a(document).scrollTop())<f.scrollSensitivity){b=a(document).scrollTop(a(document).scrollTop()+f.scrollSpeed)}}}if(!f.axis||f.axis!="y"){if(d.pageX-a(document).scrollLeft()<f.scrollSensitivity){b=a(document).scrollLeft(a(document).scrollLeft()-f.scrollSpeed)}else{if(a(window).width()-(d.pageX-a(document).scrollLeft())<f.scrollSensitivity){b=a(document).scrollLeft(a(document).scrollLeft()+f.scrollSpeed)}}}}if(b!==false&&a.ui.ddmanager&&!f.dropBehaviour){a.ui.ddmanager.prepareOffsets(c,d)}}});a.ui.plugin.add("draggable","snap",{start:function(c,d){var b=a(this).data("draggable"),e=b.options;b.snapElements=[];a(e.snap.constructor!=String?(e.snap.items||":data(draggable)"):e.snap).each(function(){var g=a(this);var f=g.offset();if(this!=b.element[0]){b.snapElements.push({item:this,width:g.outerWidth(),height:g.outerHeight(),top:f.top,left:f.left})}})},drag:function(u,p){var g=a(this).data("draggable"),q=g.options;var y=q.snapTolerance;var x=p.offset.left,w=x+g.helperProportions.width,f=p.offset.top,e=f+g.helperProportions.height;for(var v=g.snapElements.length-1;v>=0;v--){var s=g.snapElements[v].left,n=s+g.snapElements[v].width,m=g.snapElements[v].top,A=m+g.snapElements[v].height;if(!((s-y<x&&x<n+y&&m-y<f&&f<A+y)||(s-y<x&&x<n+y&&m-y<e&&e<A+y)||(s-y<w&&w<n+y&&m-y<f&&f<A+y)||(s-y<w&&w<n+y&&m-y<e&&e<A+y))){if(g.snapElements[v].snapping){(g.options.snap.release&&g.options.snap.release.call(g.element,u,a.extend(g._uiHash(),{snapItem:g.snapElements[v].item})))}g.snapElements[v].snapping=false;continue}if(q.snapMode!="inner"){var c=Math.abs(m-e)<=y;var z=Math.abs(A-f)<=y;var j=Math.abs(s-w)<=y;var k=Math.abs(n-x)<=y;if(c){p.position.top=g._convertPositionTo("relative",{top:m-g.helperProportions.height,left:0}).top-g.margins.top}if(z){p.position.top=g._convertPositionTo("relative",{top:A,left:0}).top-g.margins.top}if(j){p.position.left=g._convertPositionTo("relative",{top:0,left:s-g.helperProportions.width}).left-g.margins.left}if(k){p.position.left=g._convertPositionTo("relative",{top:0,left:n}).left-g.margins.left}}var h=(c||z||j||k);if(q.snapMode!="outer"){var c=Math.abs(m-f)<=y;var z=Math.abs(A-e)<=y;var j=Math.abs(s-x)<=y;var k=Math.abs(n-w)<=y;if(c){p.position.top=g._convertPositionTo("relative",{top:m,left:0}).top-g.margins.top}if(z){p.position.top=g._convertPositionTo("relative",{top:A-g.helperProportions.height,left:0}).top-g.margins.top}if(j){p.position.left=g._convertPositionTo("relative",{top:0,left:s}).left-g.margins.left}if(k){p.position.left=g._convertPositionTo("relative",{top:0,left:n-g.helperProportions.width}).left-g.margins.left}}if(!g.snapElements[v].snapping&&(c||z||j||k||h)){(g.options.snap.snap&&g.options.snap.snap.call(g.element,u,a.extend(g._uiHash(),{snapItem:g.snapElements[v].item})))}g.snapElements[v].snapping=(c||z||j||k||h)}}});a.ui.plugin.add("draggable","stack",{start:function(c,d){var f=a(this).data("draggable").options;var e=a.makeArray(a(f.stack)).sort(function(h,g){return(parseInt(a(h).css("zIndex"),10)||0)-(parseInt(a(g).css("zIndex"),10)||0)});var b=parseInt(e[0].style.zIndex)||0;a(e).each(function(g){this.style.zIndex=b+g});this[0].style.zIndex=b+e.length}});a.ui.plugin.add("draggable","zIndex",{start:function(c,d){var b=a(d.helper),e=a(this).data("draggable").options;if(b.css("zIndex")){e._zIndex=b.css("zIndex")}b.css("zIndex",e.zIndex)},stop:function(b,c){var d=a(this).data("draggable").options;if(d._zIndex){a(c.helper).css("zIndex",d._zIndex)}}})})(jQuery);;/*
 * jQuery UI Droppable 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Droppables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.draggable.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */(function(a){a.widget("ui.droppable",{options:{accept:"*",activeClass:false,addClasses:true,greedy:false,hoverClass:false,scope:"default",tolerance:"intersect"},_create:function(){var c=this.options,b=c.accept;this.isover=0;this.isout=1;this.accept=a.isFunction(b)?b:function(e){return e.is(b)};this.proportions={width:this.element[0].offsetWidth,height:this.element[0].offsetHeight};a.ui.ddmanager.droppables[c.scope]=a.ui.ddmanager.droppables[c.scope]||[];a.ui.ddmanager.droppables[c.scope].push(this);(c.addClasses&&this.element.addClass("ui-droppable"))},destroy:function(){var b=a.ui.ddmanager.droppables[this.options.scope];for(var c=0;c<b.length;c++){if(b[c]==this){b.splice(c,1)}}this.element.removeClass("ui-droppable ui-droppable-disabled").removeData("droppable").unbind(".droppable");return this},_setOption:function(b,c){if(b=="accept"){this.accept=a.isFunction(c)?c:function(e){return e.is(c)}}a.Widget.prototype._setOption.apply(this,arguments)},_activate:function(c){var b=a.ui.ddmanager.current;if(this.options.activeClass){this.element.addClass(this.options.activeClass)}(b&&this._trigger("activate",c,this.ui(b)))},_deactivate:function(c){var b=a.ui.ddmanager.current;if(this.options.activeClass){this.element.removeClass(this.options.activeClass)}(b&&this._trigger("deactivate",c,this.ui(b)))},_over:function(c){var b=a.ui.ddmanager.current;if(!b||(b.currentItem||b.element)[0]==this.element[0]){return}if(this.accept.call(this.element[0],(b.currentItem||b.element))){if(this.options.hoverClass){this.element.addClass(this.options.hoverClass)}this._trigger("over",c,this.ui(b))}},_out:function(c){var b=a.ui.ddmanager.current;if(!b||(b.currentItem||b.element)[0]==this.element[0]){return}if(this.accept.call(this.element[0],(b.currentItem||b.element))){if(this.options.hoverClass){this.element.removeClass(this.options.hoverClass)}this._trigger("out",c,this.ui(b))}},_drop:function(c,d){var b=d||a.ui.ddmanager.current;if(!b||(b.currentItem||b.element)[0]==this.element[0]){return false}var e=false;this.element.find(":data(droppable)").not(".ui-draggable-dragging").each(function(){var f=a.data(this,"droppable");if(f.options.greedy&&!f.options.disabled&&f.options.scope==b.options.scope&&f.accept.call(f.element[0],(b.currentItem||b.element))&&a.ui.intersect(b,a.extend(f,{offset:f.element.offset()}),f.options.tolerance)){e=true;return false}});if(e){return false}if(this.accept.call(this.element[0],(b.currentItem||b.element))){if(this.options.activeClass){this.element.removeClass(this.options.activeClass)}if(this.options.hoverClass){this.element.removeClass(this.options.hoverClass)}this._trigger("drop",c,this.ui(b));return this.element}return false},ui:function(b){return{draggable:(b.currentItem||b.element),helper:b.helper,position:b.position,offset:b.positionAbs}}});a.extend(a.ui.droppable,{version:"1.8rc1",eventPrefix:"drop"});a.ui.intersect=function(q,j,o){if(!j.offset){return false}var e=(q.positionAbs||q.position.absolute).left,d=e+q.helperProportions.width,n=(q.positionAbs||q.position.absolute).top,m=n+q.helperProportions.height;var g=j.offset.left,c=g+j.proportions.width,p=j.offset.top,k=p+j.proportions.height;switch(o){case"fit":return(g<e&&d<c&&p<n&&m<k);break;case"intersect":return(g<e+(q.helperProportions.width/2)&&d-(q.helperProportions.width/2)<c&&p<n+(q.helperProportions.height/2)&&m-(q.helperProportions.height/2)<k);break;case"pointer":var h=((q.positionAbs||q.position.absolute).left+(q.clickOffset||q.offset.click).left),i=((q.positionAbs||q.position.absolute).top+(q.clickOffset||q.offset.click).top),f=a.ui.isOver(i,h,p,g,j.proportions.height,j.proportions.width);return f;break;case"touch":return((n>=p&&n<=k)||(m>=p&&m<=k)||(n<p&&m>k))&&((e>=g&&e<=c)||(d>=g&&d<=c)||(e<g&&d>c));break;default:return false;break}};a.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function(e,g){var b=a.ui.ddmanager.droppables[e.options.scope]||[];var f=g?g.type:null;var h=(e.currentItem||e.element).find(":data(droppable)").andSelf();droppablesLoop:for(var d=0;d<b.length;d++){if(b[d].options.disabled||(e&&!b[d].accept.call(b[d].element[0],(e.currentItem||e.element)))){continue}for(var c=0;c<h.length;c++){if(h[c]==b[d].element[0]){b[d].proportions.height=0;continue droppablesLoop}}b[d].visible=b[d].element.css("display")!="none";if(!b[d].visible){continue}b[d].offset=b[d].element.offset();b[d].proportions={width:b[d].element[0].offsetWidth,height:b[d].element[0].offsetHeight};if(f=="mousedown"){b[d]._activate.call(b[d],g)}}},drop:function(b,c){var d=false;a.each(a.ui.ddmanager.droppables[b.options.scope]||[],function(){if(!this.options){return}if(!this.options.disabled&&this.visible&&a.ui.intersect(b,this,this.options.tolerance)){d=d||this._drop.call(this,c)}if(!this.options.disabled&&this.visible&&this.accept.call(this.element[0],(b.currentItem||b.element))){this.isout=1;this.isover=0;this._deactivate.call(this,c)}});return d},drag:function(b,c){if(b.options.refreshPositions){a.ui.ddmanager.prepareOffsets(b,c)}a.each(a.ui.ddmanager.droppables[b.options.scope]||[],function(){if(this.options.disabled||this.greedyChild||!this.visible){return}var e=a.ui.intersect(b,this,this.options.tolerance);var g=!e&&this.isover==1?"isout":(e&&this.isover==0?"isover":null);if(!g){return}var f;if(this.options.greedy){var d=this.element.parents(":data(droppable):eq(0)");if(d.length){f=a.data(d[0],"droppable");f.greedyChild=(g=="isover"?1:0)}}if(f&&g=="isover"){f.isover=0;f.isout=1;f._out.call(f,c)}this[g]=1;this[g=="isout"?"isover":"isout"]=0;this[g=="isover"?"_over":"_out"].call(this,c);if(f&&g=="isout"){f.isout=0;f.isover=1;f._over.call(f,c)}})}}})(jQuery);;/*
 * jQuery UI Resizable 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Resizables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */(function(c){c.widget("ui.resizable",c.ui.mouse,{options:{alsoResize:false,animate:false,animateDuration:"slow",animateEasing:"swing",aspectRatio:false,autoHide:false,containment:false,ghost:false,grid:false,handles:"e,s,se",helper:false,maxHeight:null,maxWidth:null,minHeight:10,minWidth:10,zIndex:1000},_create:function(){var e=this,j=this.options;this.element.addClass("ui-resizable");c.extend(this,{_aspectRatio:!!(j.aspectRatio),aspectRatio:j.aspectRatio,originalElement:this.element,_proportionallyResizeElements:[],_helper:j.helper||j.ghost||j.animate?j.helper||"ui-resizable-helper":null});if(this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)){if(/relative/.test(this.element.css("position"))&&c.browser.opera){this.element.css({position:"relative",top:"auto",left:"auto"})}this.element.wrap(c('<div class="ui-wrapper" style="overflow: hidden;"></div>').css({position:this.element.css("position"),width:this.element.outerWidth(),height:this.element.outerHeight(),top:this.element.css("top"),left:this.element.css("left")}));this.element=this.element.parent().data("resizable",this.element.data("resizable"));this.elementIsWrapper=true;this.element.css({marginLeft:this.originalElement.css("marginLeft"),marginTop:this.originalElement.css("marginTop"),marginRight:this.originalElement.css("marginRight"),marginBottom:this.originalElement.css("marginBottom")});this.originalElement.css({marginLeft:0,marginTop:0,marginRight:0,marginBottom:0});this.originalResizeStyle=this.originalElement.css("resize");this.originalElement.css("resize","none");this._proportionallyResizeElements.push(this.originalElement.css({position:"static",zoom:1,display:"block"}));this.originalElement.css({margin:this.originalElement.css("margin")});this._proportionallyResize()}this.handles=j.handles||(!c(".ui-resizable-handle",this.element).length?"e,s,se":{n:".ui-resizable-n",e:".ui-resizable-e",s:".ui-resizable-s",w:".ui-resizable-w",se:".ui-resizable-se",sw:".ui-resizable-sw",ne:".ui-resizable-ne",nw:".ui-resizable-nw"});if(this.handles.constructor==String){if(this.handles=="all"){this.handles="n,e,s,w,se,sw,ne,nw"}var k=this.handles.split(",");this.handles={};for(var f=0;f<k.length;f++){var h=c.trim(k[f]),d="ui-resizable-"+h;var g=c('<div class="ui-resizable-handle '+d+'"></div>');if(/sw|se|ne|nw/.test(h)){g.css({zIndex:++j.zIndex})}if("se"==h){g.addClass("ui-icon ui-icon-gripsmall-diagonal-se")}this.handles[h]=".ui-resizable-"+h;this.element.append(g)}}this._renderAxis=function(p){p=p||this.element;for(var m in this.handles){if(this.handles[m].constructor==String){this.handles[m]=c(this.handles[m],this.element).show()}if(this.elementIsWrapper&&this.originalElement[0].nodeName.match(/textarea|input|select|button/i)){var n=c(this.handles[m],this.element),o=0;o=/sw|ne|nw|se|n|s/.test(m)?n.outerHeight():n.outerWidth();var l=["padding",/ne|nw|n/.test(m)?"Top":/se|sw|s/.test(m)?"Bottom":/^e$/.test(m)?"Right":"Left"].join("");p.css(l,o);this._proportionallyResize()}if(!c(this.handles[m]).length){continue}}};this._renderAxis(this.element);this._handles=c(".ui-resizable-handle",this.element).disableSelection();this._handles.mouseover(function(){if(!e.resizing){if(this.className){var i=this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i)}e.axis=i&&i[1]?i[1]:"se"}});if(j.autoHide){this._handles.hide();c(this.element).addClass("ui-resizable-autohide").hover(function(){c(this).removeClass("ui-resizable-autohide");e._handles.show()},function(){if(!e.resizing){c(this).addClass("ui-resizable-autohide");e._handles.hide()}})}this._mouseInit()},destroy:function(){this._mouseDestroy();var d=function(f){c(f).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").unbind(".resizable").find(".ui-resizable-handle").remove()};if(this.elementIsWrapper){d(this.element);var e=this.element;e.parent().append(this.originalElement.css({position:e.css("position"),width:e.outerWidth(),height:e.outerHeight(),top:e.css("top"),left:e.css("left")})).end().remove()}this.originalElement.css("resize",this.originalResizeStyle);d(this.originalElement);return this},_mouseCapture:function(e){var f=false;for(var d in this.handles){if(c(this.handles[d])[0]==e.target){f=true}}return !this.options.disabled&&f},_mouseStart:function(f){var i=this.options,e=this.element.position(),d=this.element;this.resizing=true;this.documentScroll={top:c(document).scrollTop(),left:c(document).scrollLeft()};if(d.is(".ui-draggable")||(/absolute/).test(d.css("position"))){d.css({position:"absolute",top:e.top,left:e.left})}if(c.browser.opera&&(/relative/).test(d.css("position"))){d.css({position:"relative",top:"auto",left:"auto"})}this._renderProxy();var j=b(this.helper.css("left")),g=b(this.helper.css("top"));if(i.containment){j+=c(i.containment).scrollLeft()||0;g+=c(i.containment).scrollTop()||0}this.offset=this.helper.offset();this.position={left:j,top:g};this.size=this._helper?{width:d.outerWidth(),height:d.outerHeight()}:{width:d.width(),height:d.height()};this.originalSize=this._helper?{width:d.outerWidth(),height:d.outerHeight()}:{width:d.width(),height:d.height()};this.originalPosition={left:j,top:g};this.sizeDiff={width:d.outerWidth()-d.width(),height:d.outerHeight()-d.height()};this.originalMousePosition={left:f.pageX,top:f.pageY};this.aspectRatio=(typeof i.aspectRatio=="number")?i.aspectRatio:((this.originalSize.width/this.originalSize.height)||1);var h=c(".ui-resizable-"+this.axis).css("cursor");c("body").css("cursor",h=="auto"?this.axis+"-resize":h);d.addClass("ui-resizable-resizing");this._propagate("start",f);return true},_mouseDrag:function(d){var g=this.helper,f=this.options,l={},p=this,i=this.originalMousePosition,m=this.axis;var q=(d.pageX-i.left)||0,n=(d.pageY-i.top)||0;var h=this._change[m];if(!h){return false}var k=h.apply(this,[d,q,n]),j=c.browser.msie&&c.browser.version<7,e=this.sizeDiff;if(this._aspectRatio||d.shiftKey){k=this._updateRatio(k,d)}k=this._respectSize(k,d);this._propagate("resize",d);g.css({top:this.position.top+"px",left:this.position.left+"px",width:this.size.width+"px",height:this.size.height+"px"});if(!this._helper&&this._proportionallyResizeElements.length){this._proportionallyResize()}this._updateCache(k);this._trigger("resize",d,this.ui());return false},_mouseStop:function(g){this.resizing=false;var h=this.options,l=this;if(this._helper){var f=this._proportionallyResizeElements,d=f.length&&(/textarea/i).test(f[0].nodeName),e=d&&c.ui.hasScroll(f[0],"left")?0:l.sizeDiff.height,j=d?0:l.sizeDiff.width;var m={width:(l.size.width-j),height:(l.size.height-e)},i=(parseInt(l.element.css("left"),10)+(l.position.left-l.originalPosition.left))||null,k=(parseInt(l.element.css("top"),10)+(l.position.top-l.originalPosition.top))||null;if(!h.animate){this.element.css(c.extend(m,{top:k,left:i}))}l.helper.height(l.size.height);l.helper.width(l.size.width);if(this._helper&&!h.animate){this._proportionallyResize()}}c("body").css("cursor","auto");this.element.removeClass("ui-resizable-resizing");this._propagate("stop",g);if(this._helper){this.helper.remove()}return false},_updateCache:function(d){var e=this.options;this.offset=this.helper.offset();if(a(d.left)){this.position.left=d.left}if(a(d.top)){this.position.top=d.top}if(a(d.height)){this.size.height=d.height}if(a(d.width)){this.size.width=d.width}},_updateRatio:function(g,f){var h=this.options,i=this.position,e=this.size,d=this.axis;if(g.height){g.width=(e.height*this.aspectRatio)}else{if(g.width){g.height=(e.width/this.aspectRatio)}}if(d=="sw"){g.left=i.left+(e.width-g.width);g.top=null}if(d=="nw"){g.top=i.top+(e.height-g.height);g.left=i.left+(e.width-g.width)}return g},_respectSize:function(k,f){var i=this.helper,h=this.options,q=this._aspectRatio||f.shiftKey,p=this.axis,s=a(k.width)&&h.maxWidth&&(h.maxWidth<k.width),l=a(k.height)&&h.maxHeight&&(h.maxHeight<k.height),g=a(k.width)&&h.minWidth&&(h.minWidth>k.width),r=a(k.height)&&h.minHeight&&(h.minHeight>k.height);if(g){k.width=h.minWidth}if(r){k.height=h.minHeight}if(s){k.width=h.maxWidth}if(l){k.height=h.maxHeight}var e=this.originalPosition.left+this.originalSize.width,n=this.position.top+this.size.height;var j=/sw|nw|w/.test(p),d=/nw|ne|n/.test(p);if(g&&j){k.left=e-h.minWidth}if(s&&j){k.left=e-h.maxWidth}if(r&&d){k.top=n-h.minHeight}if(l&&d){k.top=n-h.maxHeight}var m=!k.width&&!k.height;if(m&&!k.left&&k.top){k.top=null}else{if(m&&!k.top&&k.left){k.left=null}}return k},_proportionallyResize:function(){var j=this.options;if(!this._proportionallyResizeElements.length){return}var f=this.helper||this.element;for(var e=0;e<this._proportionallyResizeElements.length;e++){var g=this._proportionallyResizeElements[e];if(!this.borderDif){var d=[g.css("borderTopWidth"),g.css("borderRightWidth"),g.css("borderBottomWidth"),g.css("borderLeftWidth")],h=[g.css("paddingTop"),g.css("paddingRight"),g.css("paddingBottom"),g.css("paddingLeft")];this.borderDif=c.map(d,function(k,m){var l=parseInt(k,10)||0,n=parseInt(h[m],10)||0;return l+n})}if(c.browser.msie&&!(!(c(f).is(":hidden")||c(f).parents(":hidden").length))){continue}g.css({height:(f.height()-this.borderDif[0]-this.borderDif[2])||0,width:(f.width()-this.borderDif[1]-this.borderDif[3])||0})}},_renderProxy:function(){var e=this.element,h=this.options;this.elementOffset=e.offset();if(this._helper){this.helper=this.helper||c('<div style="overflow:hidden;"></div>');var d=c.browser.msie&&c.browser.version<7,f=(d?1:0),g=(d?2:-1);this.helper.addClass(this._helper).css({width:this.element.outerWidth()+g,height:this.element.outerHeight()+g,position:"absolute",left:this.elementOffset.left-f+"px",top:this.elementOffset.top-f+"px",zIndex:++h.zIndex});this.helper.appendTo("body").disableSelection()}else{this.helper=this.element}},_change:{e:function(f,e,d){return{width:this.originalSize.width+e}},w:function(g,e,d){var i=this.options,f=this.originalSize,h=this.originalPosition;return{left:h.left+e,width:f.width-e}},n:function(g,e,d){var i=this.options,f=this.originalSize,h=this.originalPosition;return{top:h.top+d,height:f.height-d}},s:function(f,e,d){return{height:this.originalSize.height+d}},se:function(f,e,d){return c.extend(this._change.s.apply(this,arguments),this._change.e.apply(this,[f,e,d]))},sw:function(f,e,d){return c.extend(this._change.s.apply(this,arguments),this._change.w.apply(this,[f,e,d]))},ne:function(f,e,d){return c.extend(this._change.n.apply(this,arguments),this._change.e.apply(this,[f,e,d]))},nw:function(f,e,d){return c.extend(this._change.n.apply(this,arguments),this._change.w.apply(this,[f,e,d]))}},_propagate:function(e,d){c.ui.plugin.call(this,e,[d,this.ui()]);(e!="resize"&&this._trigger(e,d,this.ui()))},plugins:{},ui:function(){return{originalElement:this.originalElement,element:this.element,helper:this.helper,position:this.position,size:this.size,originalSize:this.originalSize,originalPosition:this.originalPosition}}});c.extend(c.ui.resizable,{version:"1.8rc1",eventPrefix:"resize"});c.ui.plugin.add("resizable","alsoResize",{start:function(e,f){var d=c(this).data("resizable"),h=d.options;var g=function(i){c(i).each(function(){c(this).data("resizable-alsoresize",{width:parseInt(c(this).width(),10),height:parseInt(c(this).height(),10),left:parseInt(c(this).css("left"),10),top:parseInt(c(this).css("top"),10)})})};if(typeof(h.alsoResize)=="object"&&!h.alsoResize.parentNode){if(h.alsoResize.length){h.alsoResize=h.alsoResize[0];g(h.alsoResize)}else{c.each(h.alsoResize,function(i,j){g(i)})}}else{g(h.alsoResize)}},resize:function(f,h){var e=c(this).data("resizable"),i=e.options,g=e.originalSize,k=e.originalPosition;var j={height:(e.size.height-g.height)||0,width:(e.size.width-g.width)||0,top:(e.position.top-k.top)||0,left:(e.position.left-k.left)||0},d=function(l,m){c(l).each(function(){var p=c(this),q=c(this).data("resizable-alsoresize"),o={},n=m&&m.length?m:["width","height","top","left"];c.each(n||["width","height","top","left"],function(r,t){var s=(q[t]||0)+(j[t]||0);if(s&&s>=0){o[t]=s||null}});if(/relative/.test(p.css("position"))&&c.browser.opera){e._revertToRelativePosition=true;p.css({position:"absolute",top:"auto",left:"auto"})}p.css(o)})};if(typeof(i.alsoResize)=="object"&&!i.alsoResize.nodeType){c.each(i.alsoResize,function(l,m){d(l,m)})}else{d(i.alsoResize)}},stop:function(e,f){var d=c(this).data("resizable");if(d._revertToRelativePosition&&c.browser.opera){d._revertToRelativePosition=false;el.css({position:"relative"})}c(this).removeData("resizable-alsoresize-start")}});c.ui.plugin.add("resizable","animate",{stop:function(h,m){var n=c(this).data("resizable"),i=n.options;var g=n._proportionallyResizeElements,d=g.length&&(/textarea/i).test(g[0].nodeName),e=d&&c.ui.hasScroll(g[0],"left")?0:n.sizeDiff.height,k=d?0:n.sizeDiff.width;var f={width:(n.size.width-k),height:(n.size.height-e)},j=(parseInt(n.element.css("left"),10)+(n.position.left-n.originalPosition.left))||null,l=(parseInt(n.element.css("top"),10)+(n.position.top-n.originalPosition.top))||null;n.element.animate(c.extend(f,l&&j?{top:l,left:j}:{}),{duration:i.animateDuration,easing:i.animateEasing,step:function(){var o={width:parseInt(n.element.css("width"),10),height:parseInt(n.element.css("height"),10),top:parseInt(n.element.css("top"),10),left:parseInt(n.element.css("left"),10)};if(g&&g.length){c(g[0]).css({width:o.width,height:o.height})}n._updateCache(o);n._propagate("resize",h)}})}});c.ui.plugin.add("resizable","containment",{start:function(e,q){var s=c(this).data("resizable"),i=s.options,k=s.element;var f=i.containment,j=(f instanceof c)?f.get(0):(/parent/.test(f))?k.parent().get(0):f;if(!j){return}s.containerElement=c(j);if(/document/.test(f)||f==document){s.containerOffset={left:0,top:0};s.containerPosition={left:0,top:0};s.parentData={element:c(document),left:0,top:0,width:c(document).width(),height:c(document).height()||document.body.parentNode.scrollHeight}}else{var m=c(j),h=[];c(["Top","Right","Left","Bottom"]).each(function(p,o){h[p]=b(m.css("padding"+o))});s.containerOffset=m.offset();s.containerPosition=m.position();s.containerSize={height:(m.innerHeight()-h[3]),width:(m.innerWidth()-h[1])};var n=s.containerOffset,d=s.containerSize.height,l=s.containerSize.width,g=(c.ui.hasScroll(j,"left")?j.scrollWidth:l),r=(c.ui.hasScroll(j)?j.scrollHeight:d);s.parentData={element:j,left:n.left,top:n.top,width:g,height:r}}},resize:function(f,p){var s=c(this).data("resizable"),h=s.options,e=s.containerSize,n=s.containerOffset,l=s.size,m=s.position,q=s._aspectRatio||f.shiftKey,d={top:0,left:0},g=s.containerElement;if(g[0]!=document&&(/static/).test(g.css("position"))){d=n}if(m.left<(s._helper?n.left:0)){s.size.width=s.size.width+(s._helper?(s.position.left-n.left):(s.position.left-d.left));if(q){s.size.height=s.size.width/h.aspectRatio}s.position.left=h.helper?n.left:0}if(m.top<(s._helper?n.top:0)){s.size.height=s.size.height+(s._helper?(s.position.top-n.top):s.position.top);if(q){s.size.width=s.size.height*h.aspectRatio}s.position.top=s._helper?n.top:0}s.offset.left=s.parentData.left+s.position.left;s.offset.top=s.parentData.top+s.position.top;var k=Math.abs((s._helper?s.offset.left-d.left:(s.offset.left-d.left))+s.sizeDiff.width),r=Math.abs((s._helper?s.offset.top-d.top:(s.offset.top-n.top))+s.sizeDiff.height);var j=s.containerElement.get(0)==s.element.parent().get(0),i=/relative|absolute/.test(s.containerElement.css("position"));if(j&&i){k-=s.parentData.left}if(k+s.size.width>=s.parentData.width){s.size.width=s.parentData.width-k;if(q){s.size.height=s.size.width/s.aspectRatio}}if(r+s.size.height>=s.parentData.height){s.size.height=s.parentData.height-r;if(q){s.size.width=s.size.height*s.aspectRatio}}},stop:function(e,m){var p=c(this).data("resizable"),f=p.options,k=p.position,l=p.containerOffset,d=p.containerPosition,g=p.containerElement;var i=c(p.helper),q=i.offset(),n=i.outerWidth()-p.sizeDiff.width,j=i.outerHeight()-p.sizeDiff.height;if(p._helper&&!f.animate&&(/relative/).test(g.css("position"))){c(this).css({left:q.left-d.left-l.left,width:n,height:j})}if(p._helper&&!f.animate&&(/static/).test(g.css("position"))){c(this).css({left:q.left-d.left-l.left,width:n,height:j})}}});c.ui.plugin.add("resizable","ghost",{start:function(f,g){var d=c(this).data("resizable"),h=d.options,e=d.size;d.ghost=d.originalElement.clone();d.ghost.css({opacity:0.25,display:"block",position:"relative",height:e.height,width:e.width,margin:0,left:0,top:0}).addClass("ui-resizable-ghost").addClass(typeof h.ghost=="string"?h.ghost:"");d.ghost.appendTo(d.helper)},resize:function(e,f){var d=c(this).data("resizable"),g=d.options;if(d.ghost){d.ghost.css({position:"relative",height:d.size.height,width:d.size.width})}},stop:function(e,f){var d=c(this).data("resizable"),g=d.options;if(d.ghost&&d.helper){d.helper.get(0).removeChild(d.ghost.get(0))}}});c.ui.plugin.add("resizable","grid",{resize:function(d,l){var n=c(this).data("resizable"),g=n.options,j=n.size,h=n.originalSize,i=n.originalPosition,m=n.axis,k=g._aspectRatio||d.shiftKey;g.grid=typeof g.grid=="number"?[g.grid,g.grid]:g.grid;var f=Math.round((j.width-h.width)/(g.grid[0]||1))*(g.grid[0]||1),e=Math.round((j.height-h.height)/(g.grid[1]||1))*(g.grid[1]||1);if(/^(se|s|e)$/.test(m)){n.size.width=h.width+f;n.size.height=h.height+e}else{if(/^(ne)$/.test(m)){n.size.width=h.width+f;n.size.height=h.height+e;n.position.top=i.top-e}else{if(/^(sw)$/.test(m)){n.size.width=h.width+f;n.size.height=h.height+e;n.position.left=i.left-f}else{n.size.width=h.width+f;n.size.height=h.height+e;n.position.top=i.top-e;n.position.left=i.left-f}}}}});var b=function(d){return parseInt(d,10)||0};var a=function(d){return !isNaN(parseInt(d,10))}})(jQuery);;/*
 * jQuery UI Selectable 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Selectables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */(function(a){a.widget("ui.selectable",a.ui.mouse,{options:{appendTo:"body",autoRefresh:true,distance:0,filter:"*",tolerance:"touch"},_create:function(){var b=this;this.element.addClass("ui-selectable");this.dragged=false;var c;this.refresh=function(){c=a(b.options.filter,b.element[0]);c.each(function(){var d=a(this);var e=d.offset();a.data(this,"selectable-item",{element:this,$element:d,left:e.left,top:e.top,right:e.left+d.outerWidth(),bottom:e.top+d.outerHeight(),startselected:false,selected:d.hasClass("ui-selected"),selecting:d.hasClass("ui-selecting"),unselecting:d.hasClass("ui-unselecting")})})};this.refresh();this.selectees=c.addClass("ui-selectee");this._mouseInit();this.helper=a(document.createElement("div")).css({border:"1px dotted black"}).addClass("ui-selectable-helper")},destroy:function(){this.selectees.removeClass("ui-selectee").removeData("selectable-item");this.element.removeClass("ui-selectable ui-selectable-disabled").removeData("selectable").unbind(".selectable");this._mouseDestroy();return this},_mouseStart:function(d){var b=this;this.opos=[d.pageX,d.pageY];if(this.options.disabled){return}var c=this.options;this.selectees=a(c.filter,this.element[0]);this._trigger("start",d);a(c.appendTo).append(this.helper);this.helper.css({"z-index":100,position:"absolute",left:d.clientX,top:d.clientY,width:0,height:0});if(c.autoRefresh){this.refresh()}this.selectees.filter(".ui-selected").each(function(){var e=a.data(this,"selectable-item");e.startselected=true;if(!d.metaKey){e.$element.removeClass("ui-selected");e.selected=false;e.$element.addClass("ui-unselecting");e.unselecting=true;b._trigger("unselecting",d,{unselecting:e.element})}});a(d.target).parents().andSelf().each(function(){var e=a.data(this,"selectable-item");if(e){e.$element.removeClass("ui-unselecting").addClass("ui-selecting");e.unselecting=false;e.selecting=true;e.selected=true;b._trigger("selecting",d,{selecting:e.element});return false}})},_mouseDrag:function(i){var c=this;this.dragged=true;if(this.options.disabled){return}var e=this.options;var d=this.opos[0],h=this.opos[1],b=i.pageX,g=i.pageY;if(d>b){var f=b;b=d;d=f}if(h>g){var f=g;g=h;h=f}this.helper.css({left:d,top:h,width:b-d,height:g-h});this.selectees.each(function(){var j=a.data(this,"selectable-item");if(!j||j.element==c.element[0]){return}var k=false;if(e.tolerance=="touch"){k=(!(j.left>b||j.right<d||j.top>g||j.bottom<h))}else{if(e.tolerance=="fit"){k=(j.left>d&&j.right<b&&j.top>h&&j.bottom<g)}}if(k){if(j.selected){j.$element.removeClass("ui-selected");j.selected=false}if(j.unselecting){j.$element.removeClass("ui-unselecting");j.unselecting=false}if(!j.selecting){j.$element.addClass("ui-selecting");j.selecting=true;c._trigger("selecting",i,{selecting:j.element})}}else{if(j.selecting){if(i.metaKey&&j.startselected){j.$element.removeClass("ui-selecting");j.selecting=false;j.$element.addClass("ui-selected");j.selected=true}else{j.$element.removeClass("ui-selecting");j.selecting=false;if(j.startselected){j.$element.addClass("ui-unselecting");j.unselecting=true}c._trigger("unselecting",i,{unselecting:j.element})}}if(j.selected){if(!i.metaKey&&!j.startselected){j.$element.removeClass("ui-selected");j.selected=false;j.$element.addClass("ui-unselecting");j.unselecting=true;c._trigger("unselecting",i,{unselecting:j.element})}}}});return false},_mouseStop:function(d){var b=this;this.dragged=false;var c=this.options;a(".ui-unselecting",this.element[0]).each(function(){var e=a.data(this,"selectable-item");e.$element.removeClass("ui-unselecting");e.unselecting=false;e.startselected=false;b._trigger("unselected",d,{unselected:e.element})});a(".ui-selecting",this.element[0]).each(function(){var e=a.data(this,"selectable-item");e.$element.removeClass("ui-selecting").addClass("ui-selected");e.selecting=false;e.selected=true;e.startselected=true;b._trigger("selected",d,{selected:e.element})});this._trigger("stop",d);this.helper.remove();return false}});a.extend(a.ui.selectable,{version:"1.8rc1"})})(jQuery);;/*
 * jQuery UI Sortable 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Sortables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */(function(a){a.widget("ui.sortable",a.ui.mouse,{options:{appendTo:"parent",axis:false,connectWith:false,containment:false,cursor:"auto",cursorAt:false,dropOnEmpty:true,forcePlaceholderSize:false,forceHelperSize:false,grid:false,handle:false,helper:"original",items:"> *",opacity:false,placeholder:false,revert:false,scroll:true,scrollSensitivity:20,scrollSpeed:20,scope:"default",tolerance:"intersect",zIndex:1000},_create:function(){var b=this.options;this.containerCache={};this.element.addClass("ui-sortable");this.refresh();this.floating=this.items.length?(/left|right/).test(this.items[0].item.css("float")):false;this.offset=this.element.offset();this._mouseInit()},destroy:function(){this.element.removeClass("ui-sortable ui-sortable-disabled").removeData("sortable").unbind(".sortable");this._mouseDestroy();for(var b=this.items.length-1;b>=0;b--){this.items[b].item.removeData("sortable-item")}return this},_mouseCapture:function(e,f){if(this.reverting){return false}if(this.options.disabled||this.options.type=="static"){return false}this._refreshItems(e);var d=null,c=this,b=a(e.target).parents().each(function(){if(a.data(this,"sortable-item")==c){d=a(this);return false}});if(a.data(e.target,"sortable-item")==c){d=a(e.target)}if(!d){return false}if(this.options.handle&&!f){var g=false;a(this.options.handle,d).find("*").andSelf().each(function(){if(this==e.target){g=true}});if(!g){return false}}this.currentItem=d;this._removeCurrentsFromItems();return true},_mouseStart:function(e,f,b){var g=this.options,c=this;this.currentContainer=this;this.refreshPositions();this.helper=this._createHelper(e);this._cacheHelperProportions();this._cacheMargins();this.scrollParent=this.helper.scrollParent();this.offset=this.currentItem.offset();this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left};this.helper.css("position","absolute");this.cssPosition=this.helper.css("position");a.extend(this.offset,{click:{left:e.pageX-this.offset.left,top:e.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()});this.originalPosition=this._generatePosition(e);this.originalPageX=e.pageX;this.originalPageY=e.pageY;(g.cursorAt&&this._adjustOffsetFromHelper(g.cursorAt));this.domPosition={prev:this.currentItem.prev()[0],parent:this.currentItem.parent()[0]};if(this.helper[0]!=this.currentItem[0]){this.currentItem.hide()}this._createPlaceholder();if(g.containment){this._setContainment()}if(g.cursor){if(a("body").css("cursor")){this._storedCursor=a("body").css("cursor")}a("body").css("cursor",g.cursor)}if(g.opacity){if(this.helper.css("opacity")){this._storedOpacity=this.helper.css("opacity")}this.helper.css("opacity",g.opacity)}if(g.zIndex){if(this.helper.css("zIndex")){this._storedZIndex=this.helper.css("zIndex")}this.helper.css("zIndex",g.zIndex)}if(this.scrollParent[0]!=document&&this.scrollParent[0].tagName!="HTML"){this.overflowOffset=this.scrollParent.offset()}this._trigger("start",e,this._uiHash());if(!this._preserveHelperProportions){this._cacheHelperProportions()}if(!b){for(var d=this.containers.length-1;d>=0;d--){this.containers[d]._trigger("activate",e,c._uiHash(this))}}if(a.ui.ddmanager){a.ui.ddmanager.current=this}if(a.ui.ddmanager&&!g.dropBehaviour){a.ui.ddmanager.prepareOffsets(this,e)}this.dragging=true;this.helper.addClass("ui-sortable-helper");this._mouseDrag(e);return true},_mouseDrag:function(f){this.position=this._generatePosition(f);this.positionAbs=this._convertPositionTo("absolute");if(!this.lastPositionAbs){this.lastPositionAbs=this.positionAbs}if(this.options.scroll){var g=this.options,b=false;if(this.scrollParent[0]!=document&&this.scrollParent[0].tagName!="HTML"){if((this.overflowOffset.top+this.scrollParent[0].offsetHeight)-f.pageY<g.scrollSensitivity){this.scrollParent[0].scrollTop=b=this.scrollParent[0].scrollTop+g.scrollSpeed}else{if(f.pageY-this.overflowOffset.top<g.scrollSensitivity){this.scrollParent[0].scrollTop=b=this.scrollParent[0].scrollTop-g.scrollSpeed}}if((this.overflowOffset.left+this.scrollParent[0].offsetWidth)-f.pageX<g.scrollSensitivity){this.scrollParent[0].scrollLeft=b=this.scrollParent[0].scrollLeft+g.scrollSpeed}else{if(f.pageX-this.overflowOffset.left<g.scrollSensitivity){this.scrollParent[0].scrollLeft=b=this.scrollParent[0].scrollLeft-g.scrollSpeed}}}else{if(f.pageY-a(document).scrollTop()<g.scrollSensitivity){b=a(document).scrollTop(a(document).scrollTop()-g.scrollSpeed)}else{if(a(window).height()-(f.pageY-a(document).scrollTop())<g.scrollSensitivity){b=a(document).scrollTop(a(document).scrollTop()+g.scrollSpeed)}}if(f.pageX-a(document).scrollLeft()<g.scrollSensitivity){b=a(document).scrollLeft(a(document).scrollLeft()-g.scrollSpeed)}else{if(a(window).width()-(f.pageX-a(document).scrollLeft())<g.scrollSensitivity){b=a(document).scrollLeft(a(document).scrollLeft()+g.scrollSpeed)}}}if(b!==false&&a.ui.ddmanager&&!g.dropBehaviour){a.ui.ddmanager.prepareOffsets(this,f)}}this.positionAbs=this._convertPositionTo("absolute");if(!this.options.axis||this.options.axis!="y"){this.helper[0].style.left=this.position.left+"px"}if(!this.options.axis||this.options.axis!="x"){this.helper[0].style.top=this.position.top+"px"}for(var d=this.items.length-1;d>=0;d--){var e=this.items[d],c=e.item[0],h=this._intersectsWithPointer(e);if(!h){continue}if(c!=this.currentItem[0]&&this.placeholder[h==1?"next":"prev"]()[0]!=c&&!a.ui.contains(this.placeholder[0],c)&&(this.options.type=="semi-dynamic"?!a.ui.contains(this.element[0],c):true)){this.direction=h==1?"down":"up";if(this.options.tolerance=="pointer"||this._intersectsWithSides(e)){this._rearrange(f,e)}else{break}this._trigger("change",f,this._uiHash());break}}this._contactContainers(f);if(a.ui.ddmanager){a.ui.ddmanager.drag(this,f)}this._trigger("sort",f,this._uiHash());this.lastPositionAbs=this.positionAbs;return false},_mouseStop:function(c,d){if(!c){return}if(a.ui.ddmanager&&!this.options.dropBehaviour){a.ui.ddmanager.drop(this,c)}if(this.options.revert){var b=this;var e=b.placeholder.offset();b.reverting=true;a(this.helper).animate({left:e.left-this.offset.parent.left-b.margins.left+(this.offsetParent[0]==document.body?0:this.offsetParent[0].scrollLeft),top:e.top-this.offset.parent.top-b.margins.top+(this.offsetParent[0]==document.body?0:this.offsetParent[0].scrollTop)},parseInt(this.options.revert,10)||500,function(){b._clear(c)})}else{this._clear(c,d)}return false},cancel:function(){var b=this;if(this.dragging){this._mouseUp();if(this.options.helper=="original"){this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")}else{this.currentItem.show()}for(var c=this.containers.length-1;c>=0;c--){this.containers[c]._trigger("deactivate",null,b._uiHash(this));if(this.containers[c].containerCache.over){this.containers[c]._trigger("out",null,b._uiHash(this));this.containers[c].containerCache.over=0}}}if(this.placeholder[0].parentNode){this.placeholder[0].parentNode.removeChild(this.placeholder[0])}if(this.options.helper!="original"&&this.helper&&this.helper[0].parentNode){this.helper.remove()}a.extend(this,{helper:null,dragging:false,reverting:false,_noFinalSort:null});if(this.domPosition.prev){a(this.domPosition.prev).after(this.currentItem)}else{a(this.domPosition.parent).prepend(this.currentItem)}return this},serialize:function(d){var b=this._getItemsAsjQuery(d&&d.connected);var c=[];d=d||{};a(b).each(function(){var e=(a(d.item||this).attr(d.attribute||"id")||"").match(d.expression||(/(.+)[-=_](.+)/));if(e){c.push((d.key||e[1]+"[]")+"="+(d.key&&d.expression?e[1]:e[2]))}});return c.join("&")},toArray:function(d){var b=this._getItemsAsjQuery(d&&d.connected);var c=[];d=d||{};b.each(function(){c.push(a(d.item||this).attr(d.attribute||"id")||"")});return c},_intersectsWith:function(m){var e=this.positionAbs.left,d=e+this.helperProportions.width,k=this.positionAbs.top,j=k+this.helperProportions.height;var f=m.left,c=f+m.width,n=m.top,i=n+m.height;var o=this.offset.click.top,h=this.offset.click.left;var g=(k+o)>n&&(k+o)<i&&(e+h)>f&&(e+h)<c;if(this.options.tolerance=="pointer"||this.options.forcePointerForContainers||(this.options.tolerance!="pointer"&&this.helperProportions[this.floating?"width":"height"]>m[this.floating?"width":"height"])){return g}else{return(f<e+(this.helperProportions.width/2)&&d-(this.helperProportions.width/2)<c&&n<k+(this.helperProportions.height/2)&&j-(this.helperProportions.height/2)<i)}},_intersectsWithPointer:function(d){var e=a.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,d.top,d.height),c=a.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,d.left,d.width),g=e&&c,b=this._getDragVerticalDirection(),f=this._getDragHorizontalDirection();if(!g){return false}return this.floating?(((f&&f=="right")||b=="down")?2:1):(b&&(b=="down"?2:1))},_intersectsWithSides:function(e){var c=a.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,e.top+(e.height/2),e.height),d=a.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,e.left+(e.width/2),e.width),b=this._getDragVerticalDirection(),f=this._getDragHorizontalDirection();if(this.floating&&f){return((f=="right"&&d)||(f=="left"&&!d))}else{return b&&((b=="down"&&c)||(b=="up"&&!c))}},_getDragVerticalDirection:function(){var b=this.positionAbs.top-this.lastPositionAbs.top;return b!=0&&(b>0?"down":"up")},_getDragHorizontalDirection:function(){var b=this.positionAbs.left-this.lastPositionAbs.left;return b!=0&&(b>0?"right":"left")},refresh:function(b){this._refreshItems(b);this.refreshPositions();return this},_connectWith:function(){var b=this.options;return b.connectWith.constructor==String?[b.connectWith]:b.connectWith},_getItemsAsjQuery:function(b){var l=this;var g=[];var e=[];var h=this._connectWith();if(h&&b){for(var d=h.length-1;d>=0;d--){var k=a(h[d]);for(var c=k.length-1;c>=0;c--){var f=a.data(k[c],"sortable");if(f&&f!=this&&!f.options.disabled){e.push([a.isFunction(f.options.items)?f.options.items.call(f.element):a(f.options.items,f.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),f])}}}}e.push([a.isFunction(this.options.items)?this.options.items.call(this.element,null,{options:this.options,item:this.currentItem}):a(this.options.items,this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),this]);for(var d=e.length-1;d>=0;d--){e[d][0].each(function(){g.push(this)})}return a(g)},_removeCurrentsFromItems:function(){var d=this.currentItem.find(":data(sortable-item)");for(var c=0;c<this.items.length;c++){for(var b=0;b<d.length;b++){if(d[b]==this.items[c].item[0]){this.items.splice(c,1)}}}},_refreshItems:function(b){this.items=[];this.containers=[this];var h=this.items;var p=this;var f=[[a.isFunction(this.options.items)?this.options.items.call(this.element[0],b,{item:this.currentItem}):a(this.options.items,this.element),this]];var l=this._connectWith();if(l){for(var e=l.length-1;e>=0;e--){var m=a(l[e]);for(var d=m.length-1;d>=0;d--){var g=a.data(m[d],"sortable");if(g&&g!=this&&!g.options.disabled){f.push([a.isFunction(g.options.items)?g.options.items.call(g.element[0],b,{item:this.currentItem}):a(g.options.items,g.element),g]);this.containers.push(g)}}}}for(var e=f.length-1;e>=0;e--){var k=f[e][1];var c=f[e][0];for(var d=0,n=c.length;d<n;d++){var o=a(c[d]);o.data("sortable-item",k);h.push({item:o,instance:k,width:0,height:0,left:0,top:0})}}},refreshPositions:function(b){if(this.offsetParent&&this.helper){this.offset.parent=this._getParentOffset()}for(var d=this.items.length-1;d>=0;d--){var e=this.items[d];var c=this.options.toleranceElement?a(this.options.toleranceElement,e.item):e.item;if(!b){e.width=c.outerWidth();e.height=c.outerHeight()}var f=c.offset();e.left=f.left;e.top=f.top}if(this.options.custom&&this.options.custom.refreshContainers){this.options.custom.refreshContainers.call(this)}else{for(var d=this.containers.length-1;d>=0;d--){var f=this.containers[d].element.offset();this.containers[d].containerCache.left=f.left;this.containers[d].containerCache.top=f.top;this.containers[d].containerCache.width=this.containers[d].element.outerWidth();this.containers[d].containerCache.height=this.containers[d].element.outerHeight()}}return this},_createPlaceholder:function(d){var b=d||this,e=b.options;if(!e.placeholder||e.placeholder.constructor==String){var c=e.placeholder;e.placeholder={element:function(){var f=a(document.createElement(b.currentItem[0].nodeName)).addClass(c||b.currentItem[0].className+" ui-sortable-placeholder").removeClass("ui-sortable-helper")[0];if(!c){f.style.visibility="hidden"}return f},update:function(f,g){if(c&&!e.forcePlaceholderSize){return}if(!g.height()){g.height(b.currentItem.innerHeight()-parseInt(b.currentItem.css("paddingTop")||0,10)-parseInt(b.currentItem.css("paddingBottom")||0,10))}if(!g.width()){g.width(b.currentItem.innerWidth()-parseInt(b.currentItem.css("paddingLeft")||0,10)-parseInt(b.currentItem.css("paddingRight")||0,10))}}}}b.placeholder=a(e.placeholder.element.call(b.element,b.currentItem));b.currentItem.after(b.placeholder);e.placeholder.update(b,b.placeholder)},_contactContainers:function(b){var d=null,k=null;for(var f=this.containers.length-1;f>=0;f--){if(a.ui.contains(this.currentItem[0],this.containers[f].element[0])){continue}if(this._intersectsWith(this.containers[f].containerCache)){if(d&&a.ui.contains(this.containers[f].element[0],d.element[0])){continue}d=this.containers[f];k=f}else{if(this.containers[f].containerCache.over){this.containers[f]._trigger("out",b,this._uiHash(this));this.containers[f].containerCache.over=0}}}if(!d){return}if(this.currentContainer!=this.containers[k]){var h=10000;var g=null;var c=this.positionAbs[this.containers[k].floating?"left":"top"];for(var e=this.items.length-1;e>=0;e--){if(!a.ui.contains(this.containers[k].element[0],this.items[e].item[0])){continue}var l=this.items[e][this.containers[k].floating?"left":"top"];if(Math.abs(l-c)<h){h=Math.abs(l-c);g=this.items[e]}}if(!g&&!this.options.dropOnEmpty){return}this.currentContainer=this.containers[k];g?this._rearrange(b,g,null,true):this._rearrange(b,null,this.containers[k].element,true);this._trigger("change",b,this._uiHash());this.containers[k]._trigger("change",b,this._uiHash(this));this.options.placeholder.update(this.currentContainer,this.placeholder)}this.containers[k]._trigger("over",b,this._uiHash(this));this.containers[k].containerCache.over=1},_createHelper:function(c){var d=this.options;var b=a.isFunction(d.helper)?a(d.helper.apply(this.element[0],[c,this.currentItem])):(d.helper=="clone"?this.currentItem.clone():this.currentItem);if(!b.parents("body").length){a(d.appendTo!="parent"?d.appendTo:this.currentItem[0].parentNode)[0].appendChild(b[0])}if(b[0]==this.currentItem[0]){this._storedCSS={width:this.currentItem[0].style.width,height:this.currentItem[0].style.height,position:this.currentItem.css("position"),top:this.currentItem.css("top"),left:this.currentItem.css("left")}}if(b[0].style.width==""||d.forceHelperSize){b.width(this.currentItem.width())}if(b[0].style.height==""||d.forceHelperSize){b.height(this.currentItem.height())}return b},_adjustOffsetFromHelper:function(b){if(typeof b=="string"){b=b.split(" ")}if(a.isArray(b)){b={left:+b[0],top:+b[1]||0}}if("left" in b){this.offset.click.left=b.left+this.margins.left}if("right" in b){this.offset.click.left=this.helperProportions.width-b.right+this.margins.left}if("top" in b){this.offset.click.top=b.top+this.margins.top}if("bottom" in b){this.offset.click.top=this.helperProportions.height-b.bottom+this.margins.top}},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var b=this.offsetParent.offset();if(this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&a.ui.contains(this.scrollParent[0],this.offsetParent[0])){b.left+=this.scrollParent.scrollLeft();b.top+=this.scrollParent.scrollTop()}if((this.offsetParent[0]==document.body)||(this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&a.browser.msie)){b={top:0,left:0}}return{top:b.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:b.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var b=this.currentItem.position();return{top:b.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:b.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}else{return{top:0,left:0}}},_cacheMargins:function(){this.margins={left:(parseInt(this.currentItem.css("marginLeft"),10)||0),top:(parseInt(this.currentItem.css("marginTop"),10)||0)}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e=this.options;if(e.containment=="parent"){e.containment=this.helper[0].parentNode}if(e.containment=="document"||e.containment=="window"){this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,a(e.containment=="document"?document:window).width()-this.helperProportions.width-this.margins.left,(a(e.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top]}if(!(/^(document|window|parent)$/).test(e.containment)){var c=a(e.containment)[0];var d=a(e.containment).offset();var b=(a(c).css("overflow")!="hidden");this.containment=[d.left+(parseInt(a(c).css("borderLeftWidth"),10)||0)+(parseInt(a(c).css("paddingLeft"),10)||0)-this.margins.left,d.top+(parseInt(a(c).css("borderTopWidth"),10)||0)+(parseInt(a(c).css("paddingTop"),10)||0)-this.margins.top,d.left+(b?Math.max(c.scrollWidth,c.offsetWidth):c.offsetWidth)-(parseInt(a(c).css("borderLeftWidth"),10)||0)-(parseInt(a(c).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left,d.top+(b?Math.max(c.scrollHeight,c.offsetHeight):c.offsetHeight)-(parseInt(a(c).css("borderTopWidth"),10)||0)-(parseInt(a(c).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top]}},_convertPositionTo:function(f,h){if(!h){h=this.position}var c=f=="absolute"?1:-1;var e=this.options,b=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&a.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,g=(/(html|body)/i).test(b[0].tagName);return{top:(h.top+this.offset.relative.top*c+this.offset.parent.top*c-(a.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():(g?0:b.scrollTop()))*c)),left:(h.left+this.offset.relative.left*c+this.offset.parent.left*c-(a.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():g?0:b.scrollLeft())*c))}},_generatePosition:function(e){var h=this.options,b=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&a.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,i=(/(html|body)/i).test(b[0].tagName);if(this.cssPosition=="relative"&&!(this.scrollParent[0]!=document&&this.scrollParent[0]!=this.offsetParent[0])){this.offset.relative=this._getRelativeOffset()}var d=e.pageX;var c=e.pageY;if(this.originalPosition){if(this.containment){if(e.pageX-this.offset.click.left<this.containment[0]){d=this.containment[0]+this.offset.click.left}if(e.pageY-this.offset.click.top<this.containment[1]){c=this.containment[1]+this.offset.click.top}if(e.pageX-this.offset.click.left>this.containment[2]){d=this.containment[2]+this.offset.click.left}if(e.pageY-this.offset.click.top>this.containment[3]){c=this.containment[3]+this.offset.click.top}}if(h.grid){var g=this.originalPageY+Math.round((c-this.originalPageY)/h.grid[1])*h.grid[1];c=this.containment?(!(g-this.offset.click.top<this.containment[1]||g-this.offset.click.top>this.containment[3])?g:(!(g-this.offset.click.top<this.containment[1])?g-h.grid[1]:g+h.grid[1])):g;var f=this.originalPageX+Math.round((d-this.originalPageX)/h.grid[0])*h.grid[0];d=this.containment?(!(f-this.offset.click.left<this.containment[0]||f-this.offset.click.left>this.containment[2])?f:(!(f-this.offset.click.left<this.containment[0])?f-h.grid[0]:f+h.grid[0])):f}}return{top:(c-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(a.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():(i?0:b.scrollTop())))),left:(d-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(a.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():i?0:b.scrollLeft())))}},_rearrange:function(g,f,c,e){c?c[0].appendChild(this.placeholder[0]):f.item[0].parentNode.insertBefore(this.placeholder[0],(this.direction=="down"?f.item[0]:f.item[0].nextSibling));this.counter=this.counter?++this.counter:1;var d=this,b=this.counter;window.setTimeout(function(){if(b==d.counter){d.refreshPositions(!e)}},0)},_clear:function(d,e){this.reverting=false;var f=[],b=this;if(!this._noFinalSort&&this.currentItem[0].parentNode){this.placeholder.before(this.currentItem)}this._noFinalSort=null;if(this.helper[0]==this.currentItem[0]){for(var c in this._storedCSS){if(this._storedCSS[c]=="auto"||this._storedCSS[c]=="static"){this._storedCSS[c]=""}}this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")}else{this.currentItem.show()}if(this.fromOutside&&!e){f.push(function(g){this._trigger("receive",g,this._uiHash(this.fromOutside))})}if((this.fromOutside||this.domPosition.prev!=this.currentItem.prev().not(".ui-sortable-helper")[0]||this.domPosition.parent!=this.currentItem.parent()[0])&&!e){f.push(function(g){this._trigger("update",g,this._uiHash())})}if(!a.ui.contains(this.element[0],this.currentItem[0])){if(!e){f.push(function(g){this._trigger("remove",g,this._uiHash())})}for(var c=this.containers.length-1;c>=0;c--){if(a.ui.contains(this.containers[c].element[0],this.currentItem[0])&&!e){f.push((function(g){return function(h){g._trigger("receive",h,this._uiHash(this))}}).call(this,this.containers[c]));f.push((function(g){return function(h){g._trigger("update",h,this._uiHash(this))}}).call(this,this.containers[c]))}}}for(var c=this.containers.length-1;c>=0;c--){if(!e){f.push((function(g){return function(h){g._trigger("deactivate",h,this._uiHash(this))}}).call(this,this.containers[c]))}if(this.containers[c].containerCache.over){f.push((function(g){return function(h){g._trigger("out",h,this._uiHash(this))}}).call(this,this.containers[c]));this.containers[c].containerCache.over=0}}if(this._storedCursor){a("body").css("cursor",this._storedCursor)}if(this._storedOpacity){this.helper.css("opacity",this._storedOpacity)}if(this._storedZIndex){this.helper.css("zIndex",this._storedZIndex=="auto"?"":this._storedZIndex)}this.dragging=false;if(this.cancelHelperRemoval){if(!e){this._trigger("beforeStop",d,this._uiHash());for(var c=0;c<f.length;c++){f[c].call(this,d)}this._trigger("stop",d,this._uiHash())}return false}if(!e){this._trigger("beforeStop",d,this._uiHash())}this.placeholder[0].parentNode.removeChild(this.placeholder[0]);if(this.helper[0]!=this.currentItem[0]){this.helper.remove()}this.helper=null;if(!e){for(var c=0;c<f.length;c++){f[c].call(this,d)}this._trigger("stop",d,this._uiHash())}this.fromOutside=false;return true},_trigger:function(){if(a.Widget.prototype._trigger.apply(this,arguments)===false){this.cancel()}},_uiHash:function(c){var b=c||this;return{helper:b.helper,placeholder:b.placeholder||a([]),position:b.position,originalPosition:b.originalPosition,offset:b.positionAbs,item:b.currentItem,sender:c?c.element:null}}});a.extend(a.ui.sortable,{version:"1.8rc1",eventPrefix:"sort"})})(jQuery);;/*
 * jQuery UI Accordion 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Accordion
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */(function(a){a.widget("ui.accordion",{options:{active:0,animated:"slide",autoHeight:true,clearStyle:false,collapsible:false,event:"click",fillSpace:false,header:"> li > :first-child,> :not(li):even",icons:{header:"ui-icon-triangle-1-e",headerSelected:"ui-icon-triangle-1-s"},navigation:false,navigationFilter:function(){return this.href.toLowerCase()==location.href.toLowerCase()}},_create:function(){var d=this.options,b=this;this.running=0;this.element.addClass("ui-accordion ui-widget ui-helper-reset");if(this.element[0].nodeName=="UL"){this.element.children("li").addClass("ui-accordion-li-fix")}this.headers=this.element.find(d.header).addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-all").bind("mouseenter.accordion",function(){a(this).addClass("ui-state-hover")}).bind("mouseleave.accordion",function(){a(this).removeClass("ui-state-hover")}).bind("focus.accordion",function(){a(this).addClass("ui-state-focus")}).bind("blur.accordion",function(){a(this).removeClass("ui-state-focus")});this.headers.next().addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom");if(d.navigation){var c=this.element.find("a").filter(d.navigationFilter);if(c.length){var e=c.closest(".ui-accordion-header");if(e.length){this.active=e}else{this.active=c.closest(".ui-accordion-content").prev()}}}this.active=this._findActive(this.active||d.active).toggleClass("ui-state-default").toggleClass("ui-state-active").toggleClass("ui-corner-all").toggleClass("ui-corner-top");this.active.next().addClass("ui-accordion-content-active");this._createIcons();if(a.browser.msie){this.element.find("a").css("zoom","1")}this.resize();this.element.attr("role","tablist");this.headers.attr("role","tab").bind("keydown",function(f){return b._keydown(f)}).next().attr("role","tabpanel");this.headers.not(this.active||"").attr("aria-expanded","false").attr("tabIndex","-1").next().hide();if(!this.active.length){this.headers.eq(0).attr("tabIndex","0")}else{this.active.attr("aria-expanded","true").attr("tabIndex","0")}if(!a.browser.safari){this.headers.find("a").attr("tabIndex","-1")}if(d.event){this.headers.bind((d.event)+".accordion",function(f){b._clickHandler.call(b,f,this);f.preventDefault()})}},_createIcons:function(){var b=this.options;if(b.icons){a("<span/>").addClass("ui-icon "+b.icons.header).prependTo(this.headers);this.active.find(".ui-icon").toggleClass(b.icons.header).toggleClass(b.icons.headerSelected);this.element.addClass("ui-accordion-icons")}},_destroyIcons:function(){this.headers.children(".ui-icon").remove();this.element.removeClass("ui-accordion-icons")},destroy:function(){var c=this.options;this.element.removeClass("ui-accordion ui-widget ui-helper-reset").removeAttr("role").unbind(".accordion").removeData("accordion");this.headers.unbind(".accordion").removeClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-all ui-state-active ui-corner-top").removeAttr("role").removeAttr("aria-expanded").removeAttr("tabindex");this.headers.find("a").removeAttr("tabindex");this._destroyIcons();var b=this.headers.next().css("display","").removeAttr("role").removeClass("ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content ui-accordion-content-active");if(c.autoHeight||c.fillHeight){b.css("height","")}return this},_setOption:function(b,c){a.Widget.prototype._setOption.apply(this,arguments);if(b=="active"){this.activate(c)}if(b=="icons"){this._destroyIcons();if(c){this._createIcons()}}},_keydown:function(e){var g=this.options,f=a.ui.keyCode;if(g.disabled||e.altKey||e.ctrlKey){return}var d=this.headers.length;var b=this.headers.index(e.target);var c=false;switch(e.keyCode){case f.RIGHT:case f.DOWN:c=this.headers[(b+1)%d];break;case f.LEFT:case f.UP:c=this.headers[(b-1+d)%d];break;case f.SPACE:case f.ENTER:this._clickHandler({target:e.target},e.target);e.preventDefault()}if(c){a(e.target).attr("tabIndex","-1");a(c).attr("tabIndex","0");c.focus();return false}return true},resize:function(){var d=this.options,c;if(d.fillSpace){if(a.browser.msie){var b=this.element.parent().css("overflow");this.element.parent().css("overflow","hidden")}c=this.element.parent().height();if(a.browser.msie){this.element.parent().css("overflow",b)}this.headers.each(function(){c-=a(this).outerHeight(true)});this.headers.next().each(function(){a(this).height(Math.max(0,c-a(this).innerHeight()+a(this).height()))}).css("overflow","auto")}else{if(d.autoHeight){c=0;this.headers.next().each(function(){c=Math.max(c,a(this).height())}).height(c)}}return this},activate:function(b){this.options.active=b;var c=this._findActive(b)[0];this._clickHandler({target:c},c);return this},_findActive:function(b){return b?typeof b=="number"?this.headers.filter(":eq("+b+")"):this.headers.not(this.headers.not(b)):b===false?a([]):this.headers.filter(":eq(0)")},_clickHandler:function(b,f){var d=this.options;if(d.disabled){return}if(!b.target){if(!d.collapsible){return}this.active.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all").find(".ui-icon").removeClass(d.icons.headerSelected).addClass(d.icons.header);this.active.next().addClass("ui-accordion-content-active");var h=this.active.next(),e={options:d,newHeader:a([]),oldHeader:d.active,newContent:a([]),oldContent:h},c=(this.active=a([]));this._toggle(c,h,e);return}var g=a(b.currentTarget||f);var i=g[0]==this.active[0];d.active=d.collapsible&&i?false:a(".ui-accordion-header",this.element).index(g);if(this.running||(!d.collapsible&&i)){return}this.active.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all").find(".ui-icon").removeClass(d.icons.headerSelected).addClass(d.icons.header);if(!i){g.removeClass("ui-state-default ui-corner-all").addClass("ui-state-active ui-corner-top").find(".ui-icon").removeClass(d.icons.header).addClass(d.icons.headerSelected);g.next().addClass("ui-accordion-content-active")}var c=g.next(),h=this.active.next(),e={options:d,newHeader:i&&d.collapsible?a([]):g,oldHeader:this.active,newContent:i&&d.collapsible?a([]):c.find("> *"),oldContent:h.find("> *")},j=this.headers.index(this.active[0])>this.headers.index(g[0]);this.active=i?a([]):g;this._toggle(c,h,e,i,j);return},_toggle:function(b,i,g,j,k){var d=this.options,m=this;this.toShow=b;this.toHide=i;this.data=g;var c=function(){if(!m){return}return m._completed.apply(m,arguments)};this._trigger("changestart",null,this.data);this.running=i.size()===0?b.size():i.size();if(d.animated){var f={};if(d.collapsible&&j){f={toShow:a([]),toHide:i,complete:c,down:k,autoHeight:d.autoHeight||d.fillSpace}}else{f={toShow:b,toHide:i,complete:c,down:k,autoHeight:d.autoHeight||d.fillSpace}}if(!d.proxied){d.proxied=d.animated}if(!d.proxiedDuration){d.proxiedDuration=d.duration}d.animated=a.isFunction(d.proxied)?d.proxied(f):d.proxied;d.duration=a.isFunction(d.proxiedDuration)?d.proxiedDuration(f):d.proxiedDuration;var l=a.ui.accordion.animations,e=d.duration,h=d.animated;if(h&&!l[h]&&!a.easing[h]){h="slide"}if(!l[h]){l[h]=function(n){this.slide(n,{easing:h,duration:e||700})}}l[h](f)}else{if(d.collapsible&&j){b.toggle()}else{i.hide();b.show()}c(true)}i.prev().attr("aria-expanded","false").attr("tabIndex","-1").blur();b.prev().attr("aria-expanded","true").attr("tabIndex","0").focus()},_completed:function(b){var c=this.options;this.running=b?0:--this.running;if(this.running){return}if(c.clearStyle){this.toShow.add(this.toHide).css({height:"",overflow:""})}this.toHide.removeClass("ui-accordion-content-active");this._trigger("change",null,this.data)}});a.extend(a.ui.accordion,{version:"1.8rc1",animations:{slide:function(j,h){j=a.extend({easing:"swing",duration:300},j,h);if(!j.toHide.size()){j.toShow.animate({height:"show"},j);return}if(!j.toShow.size()){j.toHide.animate({height:"hide"},j);return}var c=j.toShow.css("overflow"),g=0,d={},f={},e=["height","paddingTop","paddingBottom"],b;var i=j.toShow;b=i[0].style.width;i.width(parseInt(i.parent().width(),10)-parseInt(i.css("paddingLeft"),10)-parseInt(i.css("paddingRight"),10)-(parseInt(i.css("borderLeftWidth"),10)||0)-(parseInt(i.css("borderRightWidth"),10)||0));a.each(e,function(k,m){f[m]="hide";var l=(""+a.css(j.toShow[0],m)).match(/^([\d+-.]+)(.*)$/);d[m]={value:l[1],unit:l[2]||"px"}});j.toShow.css({height:0,overflow:"hidden"}).show();j.toHide.filter(":hidden").each(j.complete).end().filter(":visible").animate(f,{step:function(k,l){if(l.prop=="height"){g=(l.end-l.start===0)?0:(l.now-l.start)/(l.end-l.start)}j.toShow[0].style[l.prop]=(g*d[l.prop].value)+d[l.prop].unit},duration:j.duration,easing:j.easing,complete:function(){if(!j.autoHeight){j.toShow.css("height","")}j.toShow.css("width",b);j.toShow.css({overflow:c});j.complete()}})},bounceslide:function(b){this.slide(b,{easing:b.down?"easeOutBounce":"swing",duration:b.down?1000:200})}}})})(jQuery);;/*
 * jQuery UI Autocomplete 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Autocomplete
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */(function(a){a.widget("ui.autocomplete",{options:{minLength:1,delay:300},_create:function(){var b=this;this.element.addClass("ui-autocomplete").attr("autocomplete","off").attr({role:"textbox","aria-autocomplete":"list","aria-haspopup":"true"}).bind("keydown.autocomplete",function(c){var d=a.ui.keyCode;switch(c.keyCode){case d.PAGE_UP:b._move("previousPage",c);break;case d.PAGE_DOWN:b._move("nextPage",c);break;case d.UP:b._move("previous",c);c.preventDefault();break;case d.DOWN:b._move("next",c);c.preventDefault();break;case d.ENTER:if(b.menu&&b.menu.active){c.preventDefault()}case d.TAB:if(!b.menu||!b.menu.active){return}b.menu.select();break;case d.ESCAPE:b.element.val(b.term);b.close(c);break;case 16:case 17:case 18:break;default:clearTimeout(b.searching);b.searching=setTimeout(function(){b.search(null,c)},b.options.delay);break}}).bind("focus.autocomplete",function(){b.previous=b.element.val()}).bind("blur.autocomplete",function(c){clearTimeout(b.searching);b.closing=setTimeout(function(){b.close(c)},150)});this._initSource();this.response=function(){return b._response.apply(b,arguments)}},destroy:function(){this.element.removeClass("ui-autocomplete ui-widget ui-widget-content ui-corner-all").removeAttr("autocomplete").removeAttr("role").removeAttr("aria-autocomplete").removeAttr("aria-haspopup");if(this.menu){this.menu.element.remove()}a.Widget.prototype.destroy.call(this)},_setOption:function(b){a.Widget.prototype._setOption.apply(this,arguments);if(b=="source"){this._initSource()}},_initSource:function(){if(a.isArray(this.options.source)){var c=this.options.source;this.source=function(e,d){var f=new RegExp(a.ui.autocomplete.escapeRegex(e.term),"i");d(a.grep(c,function(g){return f.test(g.value||g.label||g)}))}}else{if(typeof this.options.source=="string"){var b=this.options.source;this.source=function(e,d){a.getJSON(b,e,d)}}else{this.source=this.options.source}}},search:function(c,b){c=c!=null?c:this.element.val();if(c.length<this.options.minLength){return this.close(b)}clearTimeout(this.closing);if(this._trigger("search")===false){return}return this._search(c)},_search:function(b){this.term=this.element.addClass("ui-autocomplete-loading").val();this.source({term:b},this.response)},_response:function(b){if(b.length){b=this._normalize(b);this._trigger("open");this._suggest(b)}else{this.close()}this.element.removeClass("ui-autocomplete-loading")},close:function(b){clearTimeout(this.closing);if(this.menu){this._trigger("close",b);this.menu.element.remove();this.menu=null}if(this.previous!=this.element.val()){this._trigger("change",b)}},_normalize:function(b){if(b.length&&b[0].label&&b[0].value){return b}return a.map(b,function(c){if(typeof c=="string"){return{label:c,value:c}}return a.extend({label:c.label||c.value,value:c.value||c.label},c)})},_suggest:function(c){if(this.menu){this.menu.element.remove()}var b=this,d=a("<ul></ul>"),e=this.element.parent();a.each(c,function(f,g){a("<li></li>").data("item.autocomplete",g).append("<a>"+g.label+"</a>").appendTo(d)});this.menu=d.addClass("ui-autocomplete-menu").appendTo(e).menu({focus:function(g,h){var f=h.item.data("item.autocomplete");if(false!==b._trigger("focus",null,{item:f})){b.element.val(f.value)}},selected:function(g,h){var f=h.item.data("item.autocomplete");if(false!==b._trigger("select",g,{item:f})){b.element.val(f.value)}b.close(g);b.previous=b.element.val();if(b.element[0]!=document.activeElement){b.element.focus()}}}).zIndex(this.element.zIndex()+1).css({top:0,left:0}).position({my:"left top",at:"left bottom",of:this.element}).data("menu");if(d.width()<=this.element.width()){d.width(this.element.width())}if(a.fn.bgiframe){d.bgiframe()}},_move:function(c,b){if(!this.menu){this.search(null,b);return}if(this.menu.first()&&/^previous/.test(c)||this.menu.last()&&/^next/.test(c)){this.element.val(this.term);this.menu.deactivate();return}this.menu[c]()},widget:function(){return this.menu?this.menu.element:a([])}});a.extend(a.ui.autocomplete,{escapeRegex:function(b){return b.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi,"\\$1")}})})(jQuery);(function(a){a.widget("ui.menu",{_create:function(){var c=this;this.element.addClass("ui-menu ui-widget ui-widget-content ui-corner-all").attr({role:"menu","aria-activedescendant":"ui-active-menuitem"}).click(function(d){d.preventDefault();c.select()});var b=this.element.children("li").addClass("ui-menu-item").attr("role","menuitem");b.children("a").addClass("ui-corner-all").attr("tabindex",-1).mouseenter(function(){c.activate(a(this).parent())})},activate:function(d){this.deactivate();this.active=d.eq(0).children("a").addClass("ui-state-hover").attr("id","ui-active-menuitem").end();this._trigger("focus",null,{item:d});if(this.hasScroll()){var e=d.offset().top-this.element.offset().top,b=this.element.attr("scrollTop"),c=this.element.height();if(e<0){this.element.attr("scrollTop",b+e)}else{if(e>c){this.element.attr("scrollTop",b+e-c+d.height())}}}},deactivate:function(){if(!this.active){return}this.active.children("a").removeClass("ui-state-hover").removeAttr("id");this.active=null},next:function(){this.move("next","li:first")},previous:function(){this.move("prev","li:last")},first:function(){return this.active&&!this.active.prev().length},last:function(){return this.active&&!this.active.next().length},move:function(d,c){if(!this.active){this.activate(this.element.children(c));return}var b=this.active[d]();if(b.length){this.activate(b)}else{this.activate(this.element.children(c))}},nextPage:function(){if(this.hasScroll()){if(!this.active||this.last()){this.activate(this.element.children(":first"));return}var d=this.active.offset().top,c=this.element.height(),b=this.element.children("li").filter(function(){var e=a(this).offset().top-d-c+a(this).height();return e<10&&e>-10});if(!b.length){b=this.element.children(":last")}this.activate(b)}else{this.activate(this.element.children(!this.active||this.last()?":first":":last"))}},previousPage:function(){if(this.hasScroll()){if(!this.active||this.first()){this.activate(this.element.children(":last"));return}var c=this.active.offset().top,b=this.element.height();result=this.element.children("li").filter(function(){var d=a(this).offset().top-c+b-a(this).height();return d<10&&d>-10});if(!result.length){result=this.element.children(":first")}this.activate(result)}else{this.activate(this.element.children(!this.active||this.first()?":last":":first"))}},hasScroll:function(){return this.element.height()<this.element.attr("scrollHeight")},select:function(){this._trigger("selected",null,{item:this.active})}})})(jQuery);;/*
 * jQuery UI Button 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Button
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */(function(d){var c,b="ui-button ui-widget ui-state-default ui-corner-all",a="ui-state-hover ui-state-active ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon ui-button-text-only";d.widget("ui.button",{options:{text:true,label:null,icons:{primary:null,secondary:null}},_create:function(){this._determineButtonType();this.hasTitle=!!this.buttonElement.attr("title");var e=this,g=this.options,h=this.type==="checkbox"||this.type==="radio",i="ui-state-hover"+(!h?" ui-state-active":""),f="ui-state-focus";if(g.label===null){g.label=this.buttonElement.html()}this.buttonElement.addClass(b).attr("role","button").bind("mouseenter.button",function(){if(g.disabled){return}d(this).addClass("ui-state-hover");if(this===c){d(this).addClass("ui-state-active")}}).bind("mouseleave.button",function(){if(g.disabled){return}d(this).removeClass(i)}).bind("focus.button",function(){d(this).addClass(f)}).bind("blur.button",function(){d(this).removeClass(f)});if(this.type==="checkbox"){this.buttonElement.bind("click.button",function(){if(g.disabled){return}d(this).toggleClass("ui-state-active");e.element.attr("checked",!e.element[0].checked).click();e.buttonElement.attr("aria-pressed",e.element[0].checked)})}else{if(this.type==="radio"){this.buttonElement.bind("click.button",function(){if(g.disabled){return}d(this).addClass("ui-state-active");e.element.attr("checked",true).click();e.buttonElement.attr("aria-pressed",true);var k=e.element[0],j=k.name,l=k.form,m;if(j){if(l){m=d(l).find("[name="+j+"]")}else{m=d("[name="+j+"]",k.ownerDocument).filter(function(){return !this.form})}m.not(k).map(function(){return d(this).button("widget")[0]}).removeClass("ui-state-active").attr("aria-pressed",false)}})}else{this.buttonElement.bind("mousedown.button",function(){if(g.disabled){return}d(this).addClass("ui-state-active");c=this;d(document).one("mouseup",function(){c=null})}).bind("mouseup.button",function(){if(g.disabled){return}d(this).removeClass("ui-state-active")}).bind("keydown.button",function(j){if(j.keyCode==d.ui.keyCode.SPACE||j.keyCode==d.ui.keyCode.ENTER){d(this).addClass("ui-state-active")}}).bind("keyup.button",function(){d(this).removeClass("ui-state-active")});if(this.buttonElement.is("a")){this.buttonElement.keyup(function(j){if(j.keyCode==d.ui.keyCode.SPACE){d(this).trigger("click")}})}}}this._resetButton()},_determineButtonType:function(){this.type=this.element.is(":checkbox")?"checkbox":this.element.is(":radio")?"radio":this.element.is("input")?"input":"button";if(this.type==="checkbox"||this.type==="radio"){this.buttonElement=d("[for="+this.element.attr("id")+"]");this.element.hide();var e=this.element.is(":checked");if(e){this.buttonElement.addClass("ui-state-active")}this.buttonElement.attr("aria-pressed",e)}else{this.buttonElement=this.element}},widget:function(){return this.buttonElement},destroy:function(){this.buttonElement.removeClass(b+" "+a).removeAttr("role").removeAttr("aria-pressed").html(this.buttonElement.find(".ui-button-text").html());if(!this.hasTitle){this.buttonElement.removeAttr("title")}if(this.type==="checkbox"||this.type==="radio"){this.element.show()}d.Widget.prototype.destroy.call(this)},_setOption:function(e,f){d.Widget.prototype._setOption.apply(this,arguments);this._resetButton()},_resetButton:function(){if(this.type==="input"){if(this.options.label){this.element.val(this.options.label)}return}var h=this.buttonElement,g=d("<span></span>").addClass("ui-button-text").html(this.options.label).appendTo(h.empty()).text();var f=this.options.icons,e=f.primary&&f.secondary;if(f.primary||f.secondary){h.addClass("ui-button-text-icon"+(e?"s":""));if(f.primary){h.prepend("<span class='ui-button-icon-primary ui-icon "+f.primary+"'></span>")}if(f.secondary){h.append("<span class='ui-button-icon-secondary ui-icon "+f.secondary+"'></span>")}if(!this.options.text){h.addClass(e?"ui-button-icons-only":"ui-button-icon-only").removeClass("ui-button-text-icons ui-button-text-icon");if(!this.hasTitle){h.attr("title",g)}}}else{h.addClass("ui-button-text-only")}}});d.widget("ui.buttonset",{_create:function(){this.element.addClass("ui-button-set");this.buttons=this.element.find(":button, :submit, :reset, :checkbox, :radio, a, .ui-button").button().map(function(){return d(this).button("widget")[0]}).removeClass("ui-corner-all").filter(":first").addClass("ui-corner-left").end().filter(":last").addClass("ui-corner-right").end().end()},_setOption:function(e,f){if(e==="disabled"){this.buttons.button("option",e,f)}d.Widget.prototype._setOption.apply(this,arguments)},destroy:function(){this.element.removeClass("ui-button-set");this.buttons.button("destroy").removeClass("ui-corner-left ui-corner-right");d.Widget.prototype.destroy.call(this)}})})(jQuery);;/*
 * jQuery UI Dialog 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Dialog
 *
 * Depends:
 *  jquery.ui.button.js
 *	jquery.ui.core.js
 *	jquery.ui.draggable.js
 *	jquery.ui.mouse.js
 *	jquery.ui.position.js
 *	jquery.ui.resizable.js
 *	jquery.ui.widget.js
 */(function(b){var a="ui-dialog ui-widget ui-widget-content ui-corner-all ";b.widget("ui.dialog",{options:{autoOpen:true,buttons:{},closeOnEscape:true,closeText:"close",dialogClass:"",draggable:true,hide:null,height:"auto",maxHeight:false,maxWidth:false,minHeight:150,minWidth:150,modal:false,position:"center",resizable:true,show:null,stack:true,title:"",width:300,zIndex:1000},_create:function(){this.originalTitle=this.element.attr("title");var k=this,l=k.options,i=l.title||k.originalTitle||"&#160;",d=b.ui.dialog.getTitleId(k.element),j=(k.uiDialog=b("<div></div>")).appendTo(document.body).hide().addClass(a+l.dialogClass).css({zIndex:l.zIndex}).attr("tabIndex",-1).css("outline",0).keydown(function(m){(l.closeOnEscape&&m.keyCode&&m.keyCode==b.ui.keyCode.ESCAPE&&k.close(m))}).attr({role:"dialog","aria-labelledby":d}).mousedown(function(m){k.moveToTop(false,m)}),f=k.element.show().removeAttr("title").addClass("ui-dialog-content ui-widget-content").appendTo(j),e=(k.uiDialogTitlebar=b("<div></div>")).addClass("ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix").prependTo(j),h=b('<a href="#"></a>').addClass("ui-dialog-titlebar-close ui-corner-all").attr("role","button").hover(function(){h.addClass("ui-state-hover")},function(){h.removeClass("ui-state-hover")}).focus(function(){h.addClass("ui-state-focus")}).blur(function(){h.removeClass("ui-state-focus")}).mousedown(function(m){m.stopPropagation()}).click(function(m){k.close(m);return false}).appendTo(e),g=(k.uiDialogTitlebarCloseText=b("<span></span>")).addClass("ui-icon ui-icon-closethick").text(l.closeText).appendTo(h),c=b("<span></span>").addClass("ui-dialog-title").attr("id",d).html(i).prependTo(e);if(b.isFunction(l.beforeclose)&&!b.isFunction(l.beforeClose)){l.beforeClose=l.beforeclose}e.find("*").add(e).disableSelection();(l.draggable&&b.fn.draggable&&k._makeDraggable());(l.resizable&&b.fn.resizable&&k._makeResizable());k._createButtons(l.buttons);k._isOpen=false;(b.fn.bgiframe&&j.bgiframe())},_init:function(){if(this.options.autoOpen){this.open()}},destroy:function(){var c=this;(c.overlay&&c.overlay.destroy());c.uiDialog.hide();c.element.unbind(".dialog").removeData("dialog").removeClass("ui-dialog-content ui-widget-content").hide().appendTo("body");c.uiDialog.remove();(c.originalTitle&&c.element.attr("title",c.originalTitle));return c},widget:function(){return this.uiDialog},close:function(e){var c=this;if(false===c._trigger("beforeClose",e)){return}(c.overlay&&c.overlay.destroy());c.uiDialog.unbind("keypress.ui-dialog");(c.options.hide?c.uiDialog.hide(c.options.hide,function(){c._trigger("close",e)}):c.uiDialog.hide()&&c._trigger("close",e));b.ui.dialog.overlay.resize();c._isOpen=false;if(c.options.modal){var d=0;b(".ui-dialog").each(function(){if(this!=c.uiDialog[0]){d=Math.max(d,b(this).css("z-index"))}});b.ui.dialog.maxZ=d}return c},isOpen:function(){return this._isOpen},moveToTop:function(g,f){var c=this,e=c.options;if((e.modal&&!g)||(!e.stack&&!e.modal)){return c._trigger("focus",f)}if(e.zIndex>b.ui.dialog.maxZ){b.ui.dialog.maxZ=e.zIndex}(c.overlay&&c.overlay.$el.css("z-index",b.ui.dialog.overlay.maxZ=++b.ui.dialog.maxZ));var d={scrollTop:c.element.attr("scrollTop"),scrollLeft:c.element.attr("scrollLeft")};c.uiDialog.css("z-index",++b.ui.dialog.maxZ);c.element.attr(d);c._trigger("focus",f);return c},open:function(){if(this._isOpen){return}var d=this,e=d.options,c=d.uiDialog;d.overlay=e.modal?new b.ui.dialog.overlay(d):null;(c.next().length&&c.appendTo("body"));d._size();d._position(e.position);c.show(e.show);d.moveToTop(true);(e.modal&&c.bind("keypress.ui-dialog",function(h){if(h.keyCode!=b.ui.keyCode.TAB){return}var g=b(":tabbable",this),i=g.filter(":first"),f=g.filter(":last");if(h.target==f[0]&&!h.shiftKey){i.focus(1);return false}else{if(h.target==i[0]&&h.shiftKey){f.focus(1);return false}}}));b([]).add(c.find(".ui-dialog-content :tabbable:first")).add(c.find(".ui-dialog-buttonpane :tabbable:first")).add(c).filter(":first").focus();d._trigger("open");d._isOpen=true;return d},_createButtons:function(f){var e=this,c=false,d=b("<div></div>").addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix");e.uiDialog.find(".ui-dialog-buttonpane").remove();(typeof f=="object"&&f!==null&&b.each(f,function(){return !(c=true)}));if(c){b.each(f,function(g,i){var h=b('<button type="button"></button>').text(g).click(function(){i.apply(e.element[0],arguments)}).appendTo(d);(b.fn.button&&h.button())});d.appendTo(e.uiDialog)}},_makeDraggable:function(){var c=this,e=c.options,f=b(document),d;c.uiDialog.draggable({cancel:".ui-dialog-content",handle:".ui-dialog-titlebar",containment:"document",start:function(g){d=e.height;b(this).height(b(this).height()).addClass("ui-dialog-dragging");c._trigger("dragStart",g)},drag:function(g){c._trigger("drag",g)},stop:function(g,h){e.position=[h.position.left-f.scrollLeft(),h.position.top-f.scrollTop()];b(this).removeClass("ui-dialog-dragging").height(d);c._trigger("dragStop",g);b.ui.dialog.overlay.resize()}})},_makeResizable:function(g){g=(g===undefined?this.options.resizable:g);var d=this,f=d.options,c=d.uiDialog.css("position"),e=typeof g=="string"?g:"n,e,s,w,se,sw,ne,nw";d.uiDialog.resizable({cancel:".ui-dialog-content",containment:"document",alsoResize:d.element,maxWidth:f.maxWidth,maxHeight:f.maxHeight,minWidth:f.minWidth,minHeight:d._minHeight(),handles:e,start:function(h){b(this).addClass("ui-dialog-resizing");d._trigger("resizeStart",h)},resize:function(h){d._trigger("resize",h)},stop:function(h){b(this).removeClass("ui-dialog-resizing");f.height=b(this).height();f.width=b(this).width();d._trigger("resizeStop",h);b.ui.dialog.overlay.resize()}}).css("position",c).find(".ui-resizable-se").addClass("ui-icon ui-icon-grip-diagonal-se")},_minHeight:function(){var c=this.options;return(c.height=="auto"?c.minHeight:Math.min(c.minHeight,c.height))},_position:function(d){var e=[],f=[0,0];d=d||b.ui.dialog.prototype.options.position;if(typeof d=="string"||(typeof d=="object"&&"0" in d)){e=d.split?d.split(" "):[d[0],d[1]];if(e.length==1){e[1]=e[0]}b.each(["left","top"],function(h,g){if(+e[h]==e[h]){f[h]=e[h];e[h]=g}})}else{if(typeof d=="object"){if("left" in d){e[0]="left";f[0]=d.left}else{if("right" in d){e[0]="right";f[0]=-d.right}}if("top" in d){e[1]="top";f[1]=d.top}else{if("bottom" in d){e[1]="bottom";f[1]=-d.bottom}}}}var c=this.uiDialog.is(":visible");if(!c){this.uiDialog.show()}this.uiDialog.css({top:0,left:0}).position({my:e.join(" "),at:e.join(" "),offset:f.join(" "),of:window,collision:"fit"});if(!c){this.uiDialog.hide()}},_setOption:function(f,g){var d=this,c=d.uiDialog,h=c.is(":data(resizable)"),e=false;switch(f){case"beforeclose":f="beforeClose";break;case"buttons":d._createButtons(g);break;case"closeText":d.uiDialogTitlebarCloseText.text(""+g);break;case"dialogClass":c.removeClass(d.options.dialogClass).addClass(a+g);break;case"disabled":(g?c.addClass("ui-dialog-disabled"):c.removeClass("ui-dialog-disabled"));break;case"draggable":(g?d._makeDraggable():c.draggable("destroy"));break;case"height":e=true;break;case"maxHeight":(h&&c.resizable("option","maxHeight",g));e=true;break;case"maxWidth":(h&&c.resizable("option","maxWidth",g));e=true;break;case"minHeight":(h&&c.resizable("option","minHeight",g));e=true;break;case"minWidth":(h&&c.resizable("option","minWidth",g));e=true;break;case"position":d._position(g);break;case"resizable":(h&&!g&&c.resizable("destroy"));(h&&typeof g=="string"&&c.resizable("option","handles",g));(h||(g!==false&&d._makeResizable(g)));break;case"title":b(".ui-dialog-title",d.uiDialogTitlebar).html(""+(g||"&#160;"));break;case"width":e=true;break}b.Widget.prototype._setOption.apply(d,arguments);(e&&d._size())},_size:function(){var d=this.options;this.element.css({height:0,minHeight:0,width:"auto"});var c=this.uiDialog.css({height:"auto",width:d.width}).height();this.element.css(d.height=="auto"?{minHeight:Math.max(d.minHeight-c,0),height:"auto"}:{height:Math.max(d.height-c,0)});(this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option","minHeight",this._minHeight()))}});b.extend(b.ui.dialog,{version:"1.8rc1",uuid:0,maxZ:0,getTitleId:function(c){return"ui-dialog-title-"+(c.attr("id")||++this.uuid)},overlay:function(c){this.$el=b.ui.dialog.overlay.create(c)}});b.extend(b.ui.dialog.overlay,{instances:[],maxZ:0,events:b.map("focus,mousedown,mouseup,keydown,keypress,click".split(","),function(c){return c+".dialog-overlay"}).join(" "),create:function(d){if(this.instances.length===0){setTimeout(function(){if(b.ui.dialog.overlay.instances.length){b(document).bind(b.ui.dialog.overlay.events,function(e){var f=b(e.target).parents(".ui-dialog").css("zIndex")||0;return(f>b.ui.dialog.overlay.maxZ)})}},1);b(document).bind("keydown.dialog-overlay",function(e){(d.options.closeOnEscape&&e.keyCode&&e.keyCode==b.ui.keyCode.ESCAPE&&d.close(e))});b(window).bind("resize.dialog-overlay",b.ui.dialog.overlay.resize)}var c=b("<div></div>").appendTo(document.body).addClass("ui-widget-overlay").css({width:this.width(),height:this.height()});(b.fn.bgiframe&&c.bgiframe());this.instances.push(c);return c},destroy:function(c){this.instances.splice(b.inArray(this.instances,c),1);if(this.instances.length===0){b([document,window]).unbind(".dialog-overlay")}c.remove();var d=0;b.each(this.instances,function(){d=Math.max(d,this.css("z-index"))});this.maxZ=d},height:function(){if(b.browser.msie&&b.browser.version<7){var d=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight);var c=Math.max(document.documentElement.offsetHeight,document.body.offsetHeight);if(d<c){return b(window).height()+"px"}else{return d+"px"}}else{return b(document).height()+"px"}},width:function(){if(b.browser.msie&&b.browser.version<7){var c=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth);var d=Math.max(document.documentElement.offsetWidth,document.body.offsetWidth);if(c<d){return b(window).width()+"px"}else{return c+"px"}}else{return b(document).width()+"px"}},resize:function(){var c=b([]);b.each(b.ui.dialog.overlay.instances,function(){c=c.add(this)});c.css({width:0,height:0}).css({width:b.ui.dialog.overlay.width(),height:b.ui.dialog.overlay.height()})}});b.extend(b.ui.dialog.overlay.prototype,{destroy:function(){b.ui.dialog.overlay.destroy(this.$el)}})})(jQuery);;/*
 * jQuery UI Datepicker 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Datepicker
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */(function($){$.extend($.ui,{datepicker:{version:"1.8rc1"}});var PROP_NAME="datepicker";var dpuuid=new Date().getTime();function Datepicker(){this.debug=false;this._curInst=null;this._keyEvent=false;this._disabledInputs=[];this._datepickerShowing=false;this._inDialog=false;this._mainDivId="ui-datepicker-div";this._inlineClass="ui-datepicker-inline";this._appendClass="ui-datepicker-append";this._triggerClass="ui-datepicker-trigger";this._dialogClass="ui-datepicker-dialog";this._disableClass="ui-datepicker-disabled";this._unselectableClass="ui-datepicker-unselectable";this._currentClass="ui-datepicker-current-day";this._dayOverClass="ui-datepicker-days-cell-over";this.regional=[];this.regional[""]={closeText:"Done",prevText:"Prev",nextText:"Next",currentText:"Today",monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayNamesMin:["Su","Mo","Tu","We","Th","Fr","Sa"],weekHeader:"Wk",dateFormat:"mm/dd/yy",firstDay:0,isRTL:false,showMonthAfterYear:false,yearSuffix:""};this._defaults={showOn:"focus",showAnim:"show",showOptions:{},defaultDate:null,appendText:"",buttonText:"...",buttonImage:"",buttonImageOnly:false,hideIfNoPrevNext:false,navigationAsDateFormat:false,gotoCurrent:false,changeMonth:false,changeYear:false,yearRange:"c-10:c+10",showOtherMonths:false,selectOtherMonths:false,showWeek:false,calculateWeek:this.iso8601Week,shortYearCutoff:"+10",minDate:null,maxDate:null,duration:"_default",beforeShowDay:null,beforeShow:null,onSelect:null,onChangeMonthYear:null,onClose:null,numberOfMonths:1,showCurrentAtPos:0,stepMonths:1,stepBigMonths:12,altField:"",altFormat:"",constrainInput:true,showButtonPanel:false,autoSize:false};$.extend(this._defaults,this.regional[""]);this.dpDiv=$('<div id="'+this._mainDivId+'" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all ui-helper-hidden-accessible"></div>')}$.extend(Datepicker.prototype,{markerClassName:"hasDatepicker",log:function(){if(this.debug){console.log.apply("",arguments)}},_widgetDatepicker:function(){return this.dpDiv},setDefaults:function(settings){extendRemove(this._defaults,settings||{});return this},_attachDatepicker:function(target,settings){var inlineSettings=null;for(var attrName in this._defaults){var attrValue=target.getAttribute("date:"+attrName);if(attrValue){inlineSettings=inlineSettings||{};try{inlineSettings[attrName]=eval(attrValue)}catch(err){inlineSettings[attrName]=attrValue}}}var nodeName=target.nodeName.toLowerCase();var inline=(nodeName=="div"||nodeName=="span");if(!target.id){target.id="dp"+(++this.uuid)}var inst=this._newInst($(target),inline);inst.settings=$.extend({},settings||{},inlineSettings||{});if(nodeName=="input"){this._connectDatepicker(target,inst)}else{if(inline){this._inlineDatepicker(target,inst)}}},_newInst:function(target,inline){var id=target[0].id.replace(/([^A-Za-z0-9_])/g,"\\\\$1");return{id:id,input:target,selectedDay:0,selectedMonth:0,selectedYear:0,drawMonth:0,drawYear:0,inline:inline,dpDiv:(!inline?this.dpDiv:$('<div class="'+this._inlineClass+' ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>'))}},_connectDatepicker:function(target,inst){var input=$(target);inst.append=$([]);inst.trigger=$([]);if(input.hasClass(this.markerClassName)){return}this._attachments(input,inst);input.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress).keyup(this._doKeyUp).bind("setData.datepicker",function(event,key,value){inst.settings[key]=value}).bind("getData.datepicker",function(event,key){return this._get(inst,key)});this._autoSize(inst);$.data(target,PROP_NAME,inst)},_attachments:function(input,inst){var appendText=this._get(inst,"appendText");var isRTL=this._get(inst,"isRTL");if(inst.append){inst.append.remove()}if(appendText){inst.append=$('<span class="'+this._appendClass+'">'+appendText+"</span>");input[isRTL?"before":"after"](inst.append)}input.unbind("focus",this._showDatepicker);if(inst.trigger){inst.trigger.remove()}var showOn=this._get(inst,"showOn");if(showOn=="focus"||showOn=="both"){input.focus(this._showDatepicker)}if(showOn=="button"||showOn=="both"){var buttonText=this._get(inst,"buttonText");var buttonImage=this._get(inst,"buttonImage");inst.trigger=$(this._get(inst,"buttonImageOnly")?$("<img/>").addClass(this._triggerClass).attr({src:buttonImage,alt:buttonText,title:buttonText}):$('<button type="button"></button>').addClass(this._triggerClass).html(buttonImage==""?buttonText:$("<img/>").attr({src:buttonImage,alt:buttonText,title:buttonText})));input[isRTL?"before":"after"](inst.trigger);inst.trigger.click(function(){if($.datepicker._datepickerShowing&&$.datepicker._lastInput==input[0]){$.datepicker._hideDatepicker()}else{$.datepicker._showDatepicker(input[0])}return false})}},_autoSize:function(inst){if(this._get(inst,"autoSize")&&!inst.inline){var date=new Date(2009,12-1,20);var dateFormat=this._get(inst,"dateFormat");if(dateFormat.match(/[DM]/)){var findMax=function(names){var max=0;var maxI=0;for(var i=0;i<names.length;i++){if(names[i].length>max){max=names[i].length;maxI=i}}return maxI};date.setMonth(findMax(this._get(inst,(dateFormat.match(/MM/)?"monthNames":"monthNamesShort"))));date.setDate(findMax(this._get(inst,(dateFormat.match(/DD/)?"dayNames":"dayNamesShort")))+20-date.getDay())}inst.input.attr("size",this._formatDate(inst,date).length)}},_inlineDatepicker:function(target,inst){var divSpan=$(target);if(divSpan.hasClass(this.markerClassName)){return}divSpan.addClass(this.markerClassName).append(inst.dpDiv).bind("setData.datepicker",function(event,key,value){inst.settings[key]=value}).bind("getData.datepicker",function(event,key){return this._get(inst,key)});$.data(target,PROP_NAME,inst);this._setDate(inst,this._getDefaultDate(inst),true);this._updateDatepicker(inst);this._updateAlternate(inst)},_dialogDatepicker:function(input,date,onSelect,settings,pos){var inst=this._dialogInst;if(!inst){var id="dp"+(++this.uuid);this._dialogInput=$('<input type="text" id="'+id+'" style="position: absolute; top: -100px; width: 0px; z-index: -10;"/>');this._dialogInput.keydown(this._doKeyDown);$("body").append(this._dialogInput);inst=this._dialogInst=this._newInst(this._dialogInput,false);inst.settings={};$.data(this._dialogInput[0],PROP_NAME,inst)}extendRemove(inst.settings,settings||{});date=(date&&date.constructor==Date?this._formatDate(inst,date):date);this._dialogInput.val(date);this._pos=(pos?(pos.length?pos:[pos.pageX,pos.pageY]):null);if(!this._pos){var browserWidth=document.documentElement.clientWidth;var browserHeight=document.documentElement.clientHeight;var scrollX=document.documentElement.scrollLeft||document.body.scrollLeft;var scrollY=document.documentElement.scrollTop||document.body.scrollTop;this._pos=[(browserWidth/2)-100+scrollX,(browserHeight/2)-150+scrollY]}this._dialogInput.css("left",(this._pos[0]+20)+"px").css("top",this._pos[1]+"px");inst.settings.onSelect=onSelect;this._inDialog=true;this.dpDiv.addClass(this._dialogClass);this._showDatepicker(this._dialogInput[0]);if($.blockUI){$.blockUI(this.dpDiv)}$.data(this._dialogInput[0],PROP_NAME,inst);return this},_destroyDatepicker:function(target){var $target=$(target);var inst=$.data(target,PROP_NAME);if(!$target.hasClass(this.markerClassName)){return}var nodeName=target.nodeName.toLowerCase();$.removeData(target,PROP_NAME);if(nodeName=="input"){inst.append.remove();inst.trigger.remove();$target.removeClass(this.markerClassName).unbind("focus",this._showDatepicker).unbind("keydown",this._doKeyDown).unbind("keypress",this._doKeyPress).unbind("keyup",this._doKeyUp)}else{if(nodeName=="div"||nodeName=="span"){$target.removeClass(this.markerClassName).empty()}}},_enableDatepicker:function(target){var $target=$(target);var inst=$.data(target,PROP_NAME);if(!$target.hasClass(this.markerClassName)){return}var nodeName=target.nodeName.toLowerCase();if(nodeName=="input"){target.disabled=false;inst.trigger.filter("button").each(function(){this.disabled=false}).end().filter("img").css({opacity:"1.0",cursor:""})}else{if(nodeName=="div"||nodeName=="span"){var inline=$target.children("."+this._inlineClass);inline.children().removeClass("ui-state-disabled")}}this._disabledInputs=$.map(this._disabledInputs,function(value){return(value==target?null:value)})},_disableDatepicker:function(target){var $target=$(target);var inst=$.data(target,PROP_NAME);if(!$target.hasClass(this.markerClassName)){return}var nodeName=target.nodeName.toLowerCase();if(nodeName=="input"){target.disabled=true;inst.trigger.filter("button").each(function(){this.disabled=true}).end().filter("img").css({opacity:"0.5",cursor:"default"})}else{if(nodeName=="div"||nodeName=="span"){var inline=$target.children("."+this._inlineClass);inline.children().addClass("ui-state-disabled")}}this._disabledInputs=$.map(this._disabledInputs,function(value){return(value==target?null:value)});this._disabledInputs[this._disabledInputs.length]=target},_isDisabledDatepicker:function(target){if(!target){return false}for(var i=0;i<this._disabledInputs.length;i++){if(this._disabledInputs[i]==target){return true}}return false},_getInst:function(target){try{return $.data(target,PROP_NAME)}catch(err){throw"Missing instance data for this datepicker"}},_optionDatepicker:function(target,name,value){var inst=this._getInst(target);if(arguments.length==2&&typeof name=="string"){return(name=="defaults"?$.extend({},$.datepicker._defaults):(inst?(name=="all"?$.extend({},inst.settings):this._get(inst,name)):null))}var settings=name||{};if(typeof name=="string"){settings={};settings[name]=value}if(inst){if(this._curInst==inst){this._hideDatepicker()}var date=this._getDateDatepicker(target,true);extendRemove(inst.settings,settings);this._attachments($(target),inst);this._autoSize(inst);this._setDateDatepicker(target,date);this._updateDatepicker(inst)}},_changeDatepicker:function(target,name,value){this._optionDatepicker(target,name,value)},_refreshDatepicker:function(target){var inst=this._getInst(target);if(inst){this._updateDatepicker(inst)}},_setDateDatepicker:function(target,date){var inst=this._getInst(target);if(inst){this._setDate(inst,date);this._updateDatepicker(inst);this._updateAlternate(inst)}},_getDateDatepicker:function(target,noDefault){var inst=this._getInst(target);if(inst&&!inst.inline){this._setDateFromField(inst,noDefault)}return(inst?this._getDate(inst):null)},_doKeyDown:function(event){var inst=$.datepicker._getInst(event.target);var handled=true;var isRTL=inst.dpDiv.is(".ui-datepicker-rtl");inst._keyEvent=true;if($.datepicker._datepickerShowing){switch(event.keyCode){case 9:$.datepicker._hideDatepicker();handled=false;break;case 13:var sel=$("td."+$.datepicker._dayOverClass,inst.dpDiv).add($("td."+$.datepicker._currentClass,inst.dpDiv));if(sel[0]){$.datepicker._selectDay(event.target,inst.selectedMonth,inst.selectedYear,sel[0])}else{$.datepicker._hideDatepicker()}return false;break;case 27:$.datepicker._hideDatepicker();break;case 33:$.datepicker._adjustDate(event.target,(event.ctrlKey?-$.datepicker._get(inst,"stepBigMonths"):-$.datepicker._get(inst,"stepMonths")),"M");break;case 34:$.datepicker._adjustDate(event.target,(event.ctrlKey?+$.datepicker._get(inst,"stepBigMonths"):+$.datepicker._get(inst,"stepMonths")),"M");break;case 35:if(event.ctrlKey||event.metaKey){$.datepicker._clearDate(event.target)}handled=event.ctrlKey||event.metaKey;break;case 36:if(event.ctrlKey||event.metaKey){$.datepicker._gotoToday(event.target)}handled=event.ctrlKey||event.metaKey;break;case 37:if(event.ctrlKey||event.metaKey){$.datepicker._adjustDate(event.target,(isRTL?+1:-1),"D")}handled=event.ctrlKey||event.metaKey;if(event.originalEvent.altKey){$.datepicker._adjustDate(event.target,(event.ctrlKey?-$.datepicker._get(inst,"stepBigMonths"):-$.datepicker._get(inst,"stepMonths")),"M")}break;case 38:if(event.ctrlKey||event.metaKey){$.datepicker._adjustDate(event.target,-7,"D")}handled=event.ctrlKey||event.metaKey;break;case 39:if(event.ctrlKey||event.metaKey){$.datepicker._adjustDate(event.target,(isRTL?-1:+1),"D")}handled=event.ctrlKey||event.metaKey;if(event.originalEvent.altKey){$.datepicker._adjustDate(event.target,(event.ctrlKey?+$.datepicker._get(inst,"stepBigMonths"):+$.datepicker._get(inst,"stepMonths")),"M")}break;case 40:if(event.ctrlKey||event.metaKey){$.datepicker._adjustDate(event.target,+7,"D")}handled=event.ctrlKey||event.metaKey;break;default:handled=false}}else{if(event.keyCode==36&&event.ctrlKey){$.datepicker._showDatepicker(this)}else{handled=false}}if(handled){event.preventDefault();event.stopPropagation()}},_doKeyPress:function(event){var inst=$.datepicker._getInst(event.target);if($.datepicker._get(inst,"constrainInput")){var chars=$.datepicker._possibleChars($.datepicker._get(inst,"dateFormat"));var chr=String.fromCharCode(event.charCode==undefined?event.keyCode:event.charCode);return event.ctrlKey||(chr<" "||!chars||chars.indexOf(chr)>-1)}},_doKeyUp:function(event){var inst=$.datepicker._getInst(event.target);if(inst.input.val()!=inst.lastVal){try{var date=$.datepicker.parseDate($.datepicker._get(inst,"dateFormat"),(inst.input?inst.input.val():null),$.datepicker._getFormatConfig(inst));if(date){$.datepicker._setDateFromField(inst);$.datepicker._updateAlternate(inst);$.datepicker._updateDatepicker(inst)}}catch(event){$.datepicker.log(event)}}return true},_showDatepicker:function(input){input=input.target||input;if(input.nodeName.toLowerCase()!="input"){input=$("input",input.parentNode)[0]}if($.datepicker._isDisabledDatepicker(input)||$.datepicker._lastInput==input){return}var inst=$.datepicker._getInst(input);if($.datepicker._curInst&&$.datepicker._curInst!=inst){$.datepicker._curInst.dpDiv.stop(true,true)}var beforeShow=$.datepicker._get(inst,"beforeShow");extendRemove(inst.settings,(beforeShow?beforeShow.apply(input,[input,inst]):{}));$.datepicker._lastInput=input;$.datepicker._setDateFromField(inst);if($.datepicker._inDialog){input.value=""}if(!$.datepicker._pos){$.datepicker._pos=$.datepicker._findPos(input);$.datepicker._pos[1]+=input.offsetHeight}var isFixed=false;$(input).parents().each(function(){isFixed|=$(this).css("position")=="fixed";return !isFixed});if(isFixed&&$.browser.opera){$.datepicker._pos[0]-=document.documentElement.scrollLeft;$.datepicker._pos[1]-=document.documentElement.scrollTop}var offset={left:$.datepicker._pos[0],top:$.datepicker._pos[1]};$.datepicker._pos=null;inst.dpDiv.css({position:"absolute",display:"block",top:"-1000px"});$.datepicker._updateDatepicker(inst);offset=$.datepicker._checkOffset(inst,offset,isFixed);inst.dpDiv.css({position:($.datepicker._inDialog&&$.blockUI?"static":(isFixed?"fixed":"absolute")),display:"none",left:offset.left+"px",top:offset.top+"px"});if(!inst.inline){var showAnim=$.datepicker._get(inst,"showAnim");var duration=$.datepicker._get(inst,"duration");var postProcess=function(){$.datepicker._datepickerShowing=true;var borders=$.datepicker._getBorders(inst.dpDiv);inst.dpDiv.find("iframe.ui-datepicker-cover").css({left:-borders[0],top:-borders[1],width:inst.dpDiv.outerWidth(),height:inst.dpDiv.outerHeight()})};if($.effects&&$.effects[showAnim]){inst.dpDiv.show(showAnim,$.datepicker._get(inst,"showOptions"),duration,postProcess)}else{inst.dpDiv[showAnim||"show"]((showAnim?duration:null),postProcess)}if(!showAnim){postProcess()}if(inst.input.is(":visible")&&!inst.input.is(":disabled")){inst.input[0].focus()}$.datepicker._curInst=inst}},_updateDatepicker:function(inst){var self=this;var borders=$.datepicker._getBorders(inst.dpDiv);inst.dpDiv.empty().append(this._generateHTML(inst)).find("iframe.ui-datepicker-cover").css({left:-borders[0],top:-borders[1],width:inst.dpDiv.outerWidth(),height:inst.dpDiv.outerHeight()}).end().find("button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a").bind("mouseout",function(){$(this).removeClass("ui-state-hover");if(this.className.indexOf("ui-datepicker-prev")!=-1){$(this).removeClass("ui-datepicker-prev-hover")}if(this.className.indexOf("ui-datepicker-next")!=-1){$(this).removeClass("ui-datepicker-next-hover")}}).bind("mouseover",function(){if(!self._isDisabledDatepicker(inst.inline?inst.dpDiv.parent()[0]:inst.input[0])){$(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover");$(this).addClass("ui-state-hover");if(this.className.indexOf("ui-datepicker-prev")!=-1){$(this).addClass("ui-datepicker-prev-hover")}if(this.className.indexOf("ui-datepicker-next")!=-1){$(this).addClass("ui-datepicker-next-hover")}}}).end().find("."+this._dayOverClass+" a").trigger("mouseover").end();var numMonths=this._getNumberOfMonths(inst);var cols=numMonths[1];var width=17;if(cols>1){inst.dpDiv.addClass("ui-datepicker-multi-"+cols).css("width",(width*cols)+"em")}else{inst.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width("")}inst.dpDiv[(numMonths[0]!=1||numMonths[1]!=1?"add":"remove")+"Class"]("ui-datepicker-multi");inst.dpDiv[(this._get(inst,"isRTL")?"add":"remove")+"Class"]("ui-datepicker-rtl");if(inst==$.datepicker._curInst&&inst.input&&inst.input.is(":visible")&&!inst.input.is(":disabled")){$(inst.input[0]).focus()}},_getBorders:function(elem){var convert=function(value){return{thin:1,medium:2,thick:3}[value]||value};return[parseFloat(convert(elem.css("border-left-width"))),parseFloat(convert(elem.css("border-top-width")))]},_checkOffset:function(inst,offset,isFixed){var dpWidth=inst.dpDiv.outerWidth();var dpHeight=inst.dpDiv.outerHeight();var inputWidth=inst.input?inst.input.outerWidth():0;var inputHeight=inst.input?inst.input.outerHeight():0;var viewWidth=document.documentElement.clientWidth+$(document).scrollLeft();var viewHeight=document.documentElement.clientHeight+$(document).scrollTop();offset.left-=(this._get(inst,"isRTL")?(dpWidth-inputWidth):0);offset.left-=(isFixed&&offset.left==inst.input.offset().left)?$(document).scrollLeft():0;offset.top-=(isFixed&&offset.top==(inst.input.offset().top+inputHeight))?$(document).scrollTop():0;offset.left-=Math.min(offset.left,(offset.left+dpWidth>viewWidth&&viewWidth>dpWidth)?Math.abs(offset.left+dpWidth-viewWidth):0);offset.top-=Math.min(offset.top,(offset.top+dpHeight>viewHeight&&viewHeight>dpHeight)?Math.abs(offset.top+dpHeight+inputHeight*2-viewHeight):0);return offset},_findPos:function(obj){var inst=this._getInst(obj);var isRTL=this._get(inst,"isRTL");while(obj&&(obj.type=="hidden"||obj.nodeType!=1)){obj=obj[isRTL?"previousSibling":"nextSibling"]}var position=$(obj).offset();return[position.left,position.top]},_hideDatepicker:function(input){var inst=this._curInst;if(!inst||(input&&inst!=$.data(input,PROP_NAME))){return}if(this._datepickerShowing){var showAnim=this._get(inst,"showAnim");var duration=this._get(inst,"duration");var postProcess=function(){$.datepicker._tidyDialog(inst);this._curInst=null};if($.effects&&$.effects[showAnim]){inst.dpDiv.hide(showAnim,$.datepicker._get(inst,"showOptions"),duration,postProcess)}else{inst.dpDiv[(showAnim=="slideDown"?"slideUp":(showAnim=="fadeIn"?"fadeOut":"hide"))]((showAnim?duration:null),postProcess)}if(!showAnim){postProcess()}var onClose=this._get(inst,"onClose");if(onClose){onClose.apply((inst.input?inst.input[0]:null),[(inst.input?inst.input.val():""),inst])}this._datepickerShowing=false;this._lastInput=null;if(this._inDialog){this._dialogInput.css({position:"absolute",left:"0",top:"-100px"});if($.blockUI){$.unblockUI();$("body").append(this.dpDiv)}}this._inDialog=false}},_tidyDialog:function(inst){inst.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar")},_checkExternalClick:function(event){if(!$.datepicker._curInst){return}var $target=$(event.target);if($target[0].id!=$.datepicker._mainDivId&&$target.parents("#"+$.datepicker._mainDivId).length==0&&!$target.hasClass($.datepicker.markerClassName)&&!$target.hasClass($.datepicker._triggerClass)&&$.datepicker._datepickerShowing&&!($.datepicker._inDialog&&$.blockUI)){$.datepicker._hideDatepicker()}},_adjustDate:function(id,offset,period){var target=$(id);var inst=this._getInst(target[0]);if(this._isDisabledDatepicker(target[0])){return}this._adjustInstDate(inst,offset+(period=="M"?this._get(inst,"showCurrentAtPos"):0),period);this._updateDatepicker(inst)},_gotoToday:function(id){var target=$(id);var inst=this._getInst(target[0]);if(this._get(inst,"gotoCurrent")&&inst.currentDay){inst.selectedDay=inst.currentDay;inst.drawMonth=inst.selectedMonth=inst.currentMonth;inst.drawYear=inst.selectedYear=inst.currentYear}else{var date=new Date();inst.selectedDay=date.getDate();inst.drawMonth=inst.selectedMonth=date.getMonth();inst.drawYear=inst.selectedYear=date.getFullYear()}this._notifyChange(inst);this._adjustDate(target)},_selectMonthYear:function(id,select,period){var target=$(id);var inst=this._getInst(target[0]);inst._selectingMonthYear=false;inst["selected"+(period=="M"?"Month":"Year")]=inst["draw"+(period=="M"?"Month":"Year")]=parseInt(select.options[select.selectedIndex].value,10);this._notifyChange(inst);this._adjustDate(target)},_clickMonthYear:function(id){var target=$(id);var inst=this._getInst(target[0]);if(inst.input&&inst._selectingMonthYear&&!$.browser.msie){inst.input[0].focus()}inst._selectingMonthYear=!inst._selectingMonthYear},_selectDay:function(id,month,year,td){var target=$(id);if($(td).hasClass(this._unselectableClass)||this._isDisabledDatepicker(target[0])){return}var inst=this._getInst(target[0]);inst.selectedDay=inst.currentDay=$("a",td).html();inst.selectedMonth=inst.currentMonth=month;inst.selectedYear=inst.currentYear=year;this._selectDate(id,this._formatDate(inst,inst.currentDay,inst.currentMonth,inst.currentYear))},_clearDate:function(id){var target=$(id);var inst=this._getInst(target[0]);this._selectDate(target,"")},_selectDate:function(id,dateStr){var target=$(id);var inst=this._getInst(target[0]);dateStr=(dateStr!=null?dateStr:this._formatDate(inst));if(inst.input){inst.input.val(dateStr)}this._updateAlternate(inst);var onSelect=this._get(inst,"onSelect");if(onSelect){onSelect.apply((inst.input?inst.input[0]:null),[dateStr,inst])}else{if(inst.input){inst.input.trigger("change")}}if(inst.inline){this._updateDatepicker(inst)}else{this._hideDatepicker();this._lastInput=inst.input[0];if(typeof(inst.input[0])!="object"){inst.input[0].focus()}this._lastInput=null}},_updateAlternate:function(inst){var altField=this._get(inst,"altField");if(altField){var altFormat=this._get(inst,"altFormat")||this._get(inst,"dateFormat");var date=this._getDate(inst);var dateStr=this.formatDate(altFormat,date,this._getFormatConfig(inst));$(altField).each(function(){$(this).val(dateStr)})}},noWeekends:function(date){var day=date.getDay();return[(day>0&&day<6),""]},iso8601Week:function(date){var checkDate=new Date(date.getTime());checkDate.setDate(checkDate.getDate()+4-(checkDate.getDay()||7));var time=checkDate.getTime();checkDate.setMonth(0);checkDate.setDate(1);return Math.floor(Math.round((time-checkDate)/86400000)/7)+1},parseDate:function(format,value,settings){if(format==null||value==null){throw"Invalid arguments"}value=(typeof value=="object"?value.toString():value+"");if(value==""){return null}var shortYearCutoff=(settings?settings.shortYearCutoff:null)||this._defaults.shortYearCutoff;var dayNamesShort=(settings?settings.dayNamesShort:null)||this._defaults.dayNamesShort;var dayNames=(settings?settings.dayNames:null)||this._defaults.dayNames;var monthNamesShort=(settings?settings.monthNamesShort:null)||this._defaults.monthNamesShort;var monthNames=(settings?settings.monthNames:null)||this._defaults.monthNames;var year=-1;var month=-1;var day=-1;var doy=-1;var literal=false;var lookAhead=function(match){var matches=(iFormat+1<format.length&&format.charAt(iFormat+1)==match);if(matches){iFormat++}return matches};var getNumber=function(match){lookAhead(match);var size=(match=="@"?14:(match=="!"?20:(match=="y"?4:(match=="o"?3:2))));var digits=new RegExp("^\\d{1,"+size+"}");var num=value.substring(iValue).match(digits);if(!num){throw"Missing number at position "+iValue}iValue+=num[0].length;return parseInt(num[0],10)};var getName=function(match,shortNames,longNames){var names=(lookAhead(match)?longNames:shortNames);for(var i=0;i<names.length;i++){if(value.substr(iValue,names[i].length)==names[i]){iValue+=names[i].length;return i+1}}throw"Unknown name at position "+iValue};var checkLiteral=function(){if(value.charAt(iValue)!=format.charAt(iFormat)){throw"Unexpected literal at position "+iValue}iValue++};var iValue=0;for(var iFormat=0;iFormat<format.length;iFormat++){if(literal){if(format.charAt(iFormat)=="'"&&!lookAhead("'")){literal=false}else{checkLiteral()}}else{switch(format.charAt(iFormat)){case"d":day=getNumber("d");break;case"D":getName("D",dayNamesShort,dayNames);break;case"o":doy=getNumber("o");break;case"m":month=getNumber("m");break;case"M":month=getName("M",monthNamesShort,monthNames);break;case"y":year=getNumber("y");break;case"@":var date=new Date(getNumber("@"));year=date.getFullYear();month=date.getMonth()+1;day=date.getDate();break;case"!":var date=new Date((getNumber("!")-this._ticksTo1970)/10000);year=date.getFullYear();month=date.getMonth()+1;day=date.getDate();break;case"'":if(lookAhead("'")){checkLiteral()}else{literal=true}break;default:checkLiteral()}}}if(year==-1){year=new Date().getFullYear()}else{if(year<100){year+=new Date().getFullYear()-new Date().getFullYear()%100+(year<=shortYearCutoff?0:-100)}}if(doy>-1){month=1;day=doy;do{var dim=this._getDaysInMonth(year,month-1);if(day<=dim){break}month++;day-=dim}while(true)}var date=this._daylightSavingAdjust(new Date(year,month-1,day));if(date.getFullYear()!=year||date.getMonth()+1!=month||date.getDate()!=day){throw"Invalid date"}return date},ATOM:"yy-mm-dd",COOKIE:"D, dd M yy",ISO_8601:"yy-mm-dd",RFC_822:"D, d M y",RFC_850:"DD, dd-M-y",RFC_1036:"D, d M y",RFC_1123:"D, d M yy",RFC_2822:"D, d M yy",RSS:"D, d M y",TICKS:"!",TIMESTAMP:"@",W3C:"yy-mm-dd",_ticksTo1970:(((1970-1)*365+Math.floor(1970/4)-Math.floor(1970/100)+Math.floor(1970/400))*24*60*60*10000000),formatDate:function(format,date,settings){if(!date){return""}var dayNamesShort=(settings?settings.dayNamesShort:null)||this._defaults.dayNamesShort;var dayNames=(settings?settings.dayNames:null)||this._defaults.dayNames;var monthNamesShort=(settings?settings.monthNamesShort:null)||this._defaults.monthNamesShort;var monthNames=(settings?settings.monthNames:null)||this._defaults.monthNames;var lookAhead=function(match){var matches=(iFormat+1<format.length&&format.charAt(iFormat+1)==match);if(matches){iFormat++}return matches};var formatNumber=function(match,value,len){var num=""+value;if(lookAhead(match)){while(num.length<len){num="0"+num}}return num};var formatName=function(match,value,shortNames,longNames){return(lookAhead(match)?longNames[value]:shortNames[value])};var output="";var literal=false;if(date){for(var iFormat=0;iFormat<format.length;iFormat++){if(literal){if(format.charAt(iFormat)=="'"&&!lookAhead("'")){literal=false}else{output+=format.charAt(iFormat)}}else{switch(format.charAt(iFormat)){case"d":output+=formatNumber("d",date.getDate(),2);break;case"D":output+=formatName("D",date.getDay(),dayNamesShort,dayNames);break;case"o":output+=formatNumber("o",(date.getTime()-new Date(date.getFullYear(),0,0).getTime())/86400000,3);break;case"m":output+=formatNumber("m",date.getMonth()+1,2);break;case"M":output+=formatName("M",date.getMonth(),monthNamesShort,monthNames);break;case"y":output+=(lookAhead("y")?date.getFullYear():(date.getYear()%100<10?"0":"")+date.getYear()%100);break;case"@":output+=date.getTime();break;case"!":output+=date.getTime()*10000+this._ticksTo1970;break;case"'":if(lookAhead("'")){output+="'"}else{literal=true}break;default:output+=format.charAt(iFormat)}}}}return output},_possibleChars:function(format){var chars="";var literal=false;var lookAhead=function(match){var matches=(iFormat+1<format.length&&format.charAt(iFormat+1)==match);if(matches){iFormat++}return matches};for(var iFormat=0;iFormat<format.length;iFormat++){if(literal){if(format.charAt(iFormat)=="'"&&!lookAhead("'")){literal=false}else{chars+=format.charAt(iFormat)}}else{switch(format.charAt(iFormat)){case"d":case"m":case"y":case"@":chars+="0123456789";break;case"D":case"M":return null;case"'":if(lookAhead("'")){chars+="'"}else{literal=true}break;default:chars+=format.charAt(iFormat)}}}return chars},_get:function(inst,name){return inst.settings[name]!==undefined?inst.settings[name]:this._defaults[name]},_setDateFromField:function(inst,noDefault){var dateFormat=this._get(inst,"dateFormat");inst.lastVal=inst.input?inst.input.val():null;var dates=inst.lastVal;var date,defaultDate;date=defaultDate=this._getDefaultDate(inst);var settings=this._getFormatConfig(inst);try{date=this.parseDate(dateFormat,dates,settings)||defaultDate}catch(event){this.log(event);dates=(noDefault?"":dates)}inst.selectedDay=date.getDate();inst.drawMonth=inst.selectedMonth=date.getMonth();inst.drawYear=inst.selectedYear=date.getFullYear();inst.currentDay=(dates?date.getDate():0);inst.currentMonth=(dates?date.getMonth():0);inst.currentYear=(dates?date.getFullYear():0);this._adjustInstDate(inst)},_getDefaultDate:function(inst){return this._restrictMinMax(inst,this._determineDate(inst,this._get(inst,"defaultDate"),new Date()))},_determineDate:function(inst,date,defaultDate){var offsetNumeric=function(offset){var date=new Date();date.setDate(date.getDate()+offset);return date};var offsetString=function(offset){try{return $.datepicker.parseDate($.datepicker._get(inst,"dateFormat"),offset,$.datepicker._getFormatConfig(inst))}catch(e){}var date=(offset.toLowerCase().match(/^c/)?$.datepicker._getDate(inst):null)||new Date();var year=date.getFullYear();var month=date.getMonth();var day=date.getDate();var pattern=/([+-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g;var matches=pattern.exec(offset);while(matches){switch(matches[2]||"d"){case"d":case"D":day+=parseInt(matches[1],10);break;case"w":case"W":day+=parseInt(matches[1],10)*7;break;case"m":case"M":month+=parseInt(matches[1],10);day=Math.min(day,$.datepicker._getDaysInMonth(year,month));break;case"y":case"Y":year+=parseInt(matches[1],10);day=Math.min(day,$.datepicker._getDaysInMonth(year,month));break}matches=pattern.exec(offset)}return new Date(year,month,day)};date=(date==null?defaultDate:(typeof date=="string"?offsetString(date):(typeof date=="number"?(isNaN(date)?defaultDate:offsetNumeric(date)):date)));date=(date&&date.toString()=="Invalid Date"?defaultDate:date);if(date){date.setHours(0);date.setMinutes(0);date.setSeconds(0);date.setMilliseconds(0)}return this._daylightSavingAdjust(date)},_daylightSavingAdjust:function(date){if(!date){return null}date.setHours(date.getHours()>12?date.getHours()+2:0);return date},_setDate:function(inst,date,noChange){var clear=!(date);var origMonth=inst.selectedMonth;var origYear=inst.selectedYear;date=this._restrictMinMax(inst,this._determineDate(inst,date,new Date()));inst.selectedDay=inst.currentDay=date.getDate();inst.drawMonth=inst.selectedMonth=inst.currentMonth=date.getMonth();inst.drawYear=inst.selectedYear=inst.currentYear=date.getFullYear();if((origMonth!=inst.selectedMonth||origYear!=inst.selectedYear)&&!noChange){this._notifyChange(inst)}this._adjustInstDate(inst);if(inst.input){inst.input.val(clear?"":this._formatDate(inst))}},_getDate:function(inst){var startDate=(!inst.currentYear||(inst.input&&inst.input.val()=="")?null:this._daylightSavingAdjust(new Date(inst.currentYear,inst.currentMonth,inst.currentDay)));return startDate},_generateHTML:function(inst){var today=new Date();today=this._daylightSavingAdjust(new Date(today.getFullYear(),today.getMonth(),today.getDate()));var isRTL=this._get(inst,"isRTL");var showButtonPanel=this._get(inst,"showButtonPanel");var hideIfNoPrevNext=this._get(inst,"hideIfNoPrevNext");var navigationAsDateFormat=this._get(inst,"navigationAsDateFormat");var numMonths=this._getNumberOfMonths(inst);var showCurrentAtPos=this._get(inst,"showCurrentAtPos");var stepMonths=this._get(inst,"stepMonths");var isMultiMonth=(numMonths[0]!=1||numMonths[1]!=1);var currentDate=this._daylightSavingAdjust((!inst.currentDay?new Date(9999,9,9):new Date(inst.currentYear,inst.currentMonth,inst.currentDay)));var minDate=this._getMinMaxDate(inst,"min");var maxDate=this._getMinMaxDate(inst,"max");var drawMonth=inst.drawMonth-showCurrentAtPos;var drawYear=inst.drawYear;if(drawMonth<0){drawMonth+=12;drawYear--}if(maxDate){var maxDraw=this._daylightSavingAdjust(new Date(maxDate.getFullYear(),maxDate.getMonth()-(numMonths[0]*numMonths[1])+1,maxDate.getDate()));maxDraw=(minDate&&maxDraw<minDate?minDate:maxDraw);while(this._daylightSavingAdjust(new Date(drawYear,drawMonth,1))>maxDraw){drawMonth--;if(drawMonth<0){drawMonth=11;drawYear--}}}inst.drawMonth=drawMonth;inst.drawYear=drawYear;var prevText=this._get(inst,"prevText");prevText=(!navigationAsDateFormat?prevText:this.formatDate(prevText,this._daylightSavingAdjust(new Date(drawYear,drawMonth-stepMonths,1)),this._getFormatConfig(inst)));var prev=(this._canAdjustMonth(inst,-1,drawYear,drawMonth)?'<a class="ui-datepicker-prev ui-corner-all" onclick="DP_jQuery_'+dpuuid+".datepicker._adjustDate('#"+inst.id+"', -"+stepMonths+", 'M');\" title=\""+prevText+'"><span class="ui-icon ui-icon-circle-triangle-'+(isRTL?"e":"w")+'">'+prevText+"</span></a>":(hideIfNoPrevNext?"":'<a class="ui-datepicker-prev ui-corner-all ui-state-disabled" title="'+prevText+'"><span class="ui-icon ui-icon-circle-triangle-'+(isRTL?"e":"w")+'">'+prevText+"</span></a>"));var nextText=this._get(inst,"nextText");nextText=(!navigationAsDateFormat?nextText:this.formatDate(nextText,this._daylightSavingAdjust(new Date(drawYear,drawMonth+stepMonths,1)),this._getFormatConfig(inst)));var next=(this._canAdjustMonth(inst,+1,drawYear,drawMonth)?'<a class="ui-datepicker-next ui-corner-all" onclick="DP_jQuery_'+dpuuid+".datepicker._adjustDate('#"+inst.id+"', +"+stepMonths+", 'M');\" title=\""+nextText+'"><span class="ui-icon ui-icon-circle-triangle-'+(isRTL?"w":"e")+'">'+nextText+"</span></a>":(hideIfNoPrevNext?"":'<a class="ui-datepicker-next ui-corner-all ui-state-disabled" title="'+nextText+'"><span class="ui-icon ui-icon-circle-triangle-'+(isRTL?"w":"e")+'">'+nextText+"</span></a>"));var currentText=this._get(inst,"currentText");var gotoDate=(this._get(inst,"gotoCurrent")&&inst.currentDay?currentDate:today);currentText=(!navigationAsDateFormat?currentText:this.formatDate(currentText,gotoDate,this._getFormatConfig(inst)));var controls=(!inst.inline?'<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" onclick="DP_jQuery_'+dpuuid+'.datepicker._hideDatepicker();">'+this._get(inst,"closeText")+"</button>":"");var buttonPanel=(showButtonPanel)?'<div class="ui-datepicker-buttonpane ui-widget-content">'+(isRTL?controls:"")+(this._isInRange(inst,gotoDate)?'<button type="button" class="ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all" onclick="DP_jQuery_'+dpuuid+".datepicker._gotoToday('#"+inst.id+"');\">"+currentText+"</button>":"")+(isRTL?"":controls)+"</div>":"";var firstDay=parseInt(this._get(inst,"firstDay"),10);firstDay=(isNaN(firstDay)?0:firstDay);var showWeek=this._get(inst,"showWeek");var dayNames=this._get(inst,"dayNames");var dayNamesShort=this._get(inst,"dayNamesShort");var dayNamesMin=this._get(inst,"dayNamesMin");var monthNames=this._get(inst,"monthNames");var monthNamesShort=this._get(inst,"monthNamesShort");var beforeShowDay=this._get(inst,"beforeShowDay");var showOtherMonths=this._get(inst,"showOtherMonths");var selectOtherMonths=this._get(inst,"selectOtherMonths");var calculateWeek=this._get(inst,"calculateWeek")||this.iso8601Week;var defaultDate=this._getDefaultDate(inst);var html="";for(var row=0;row<numMonths[0];row++){var group="";for(var col=0;col<numMonths[1];col++){var selectedDate=this._daylightSavingAdjust(new Date(drawYear,drawMonth,inst.selectedDay));var cornerClass=" ui-corner-all";var calender="";if(isMultiMonth){calender+='<div class="ui-datepicker-group';if(numMonths[1]>1){switch(col){case 0:calender+=" ui-datepicker-group-first";cornerClass=" ui-corner-"+(isRTL?"right":"left");break;case numMonths[1]-1:calender+=" ui-datepicker-group-last";cornerClass=" ui-corner-"+(isRTL?"left":"right");break;default:calender+=" ui-datepicker-group-middle";cornerClass="";break}}calender+='">'}calender+='<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix'+cornerClass+'">'+(/all|left/.test(cornerClass)&&row==0?(isRTL?next:prev):"")+(/all|right/.test(cornerClass)&&row==0?(isRTL?prev:next):"")+this._generateMonthYearHeader(inst,drawMonth,drawYear,minDate,maxDate,row>0||col>0,monthNames,monthNamesShort)+'</div><table class="ui-datepicker-calendar"><thead><tr>';var thead=(showWeek?'<th class="ui-datepicker-week-col">'+this._get(inst,"weekHeader")+"</th>":"");for(var dow=0;dow<7;dow++){var day=(dow+firstDay)%7;thead+="<th"+((dow+firstDay+6)%7>=5?' class="ui-datepicker-week-end"':"")+'><span title="'+dayNames[day]+'">'+dayNamesMin[day]+"</span></th>"}calender+=thead+"</tr></thead><tbody>";var daysInMonth=this._getDaysInMonth(drawYear,drawMonth);if(drawYear==inst.selectedYear&&drawMonth==inst.selectedMonth){inst.selectedDay=Math.min(inst.selectedDay,daysInMonth)}var leadDays=(this._getFirstDayOfMonth(drawYear,drawMonth)-firstDay+7)%7;var numRows=(isMultiMonth?6:Math.ceil((leadDays+daysInMonth)/7));var printDate=this._daylightSavingAdjust(new Date(drawYear,drawMonth,1-leadDays));for(var dRow=0;dRow<numRows;dRow++){calender+="<tr>";var tbody=(!showWeek?"":'<td class="ui-datepicker-week-col">'+this._get(inst,"calculateWeek")(printDate)+"</td>");for(var dow=0;dow<7;dow++){var daySettings=(beforeShowDay?beforeShowDay.apply((inst.input?inst.input[0]:null),[printDate]):[true,""]);var otherMonth=(printDate.getMonth()!=drawMonth);var unselectable=(otherMonth&&!selectOtherMonths)||!daySettings[0]||(minDate&&printDate<minDate)||(maxDate&&printDate>maxDate);tbody+='<td class="'+((dow+firstDay+6)%7>=5?" ui-datepicker-week-end":"")+(otherMonth?" ui-datepicker-other-month":"")+((printDate.getTime()==selectedDate.getTime()&&drawMonth==inst.selectedMonth&&inst._keyEvent)||(defaultDate.getTime()==printDate.getTime()&&defaultDate.getTime()==selectedDate.getTime())?" "+this._dayOverClass:"")+(unselectable?" "+this._unselectableClass+" ui-state-disabled":"")+(otherMonth&&!showOtherMonths?"":" "+daySettings[1]+(printDate.getTime()==currentDate.getTime()?" "+this._currentClass:"")+(printDate.getTime()==today.getTime()?" ui-datepicker-today":""))+'"'+((!otherMonth||showOtherMonths)&&daySettings[2]?' title="'+daySettings[2]+'"':"")+(unselectable?"":' onclick="DP_jQuery_'+dpuuid+".datepicker._selectDay('#"+inst.id+"',"+printDate.getMonth()+","+printDate.getFullYear()+', this);return false;"')+">"+(otherMonth&&!showOtherMonths?"&#xa0;":(unselectable?'<span class="ui-state-default">'+printDate.getDate()+"</span>":'<a class="ui-state-default'+(printDate.getTime()==today.getTime()?" ui-state-highlight":"")+(printDate.getTime()==currentDate.getTime()?" ui-state-active":"")+(otherMonth?" ui-priority-secondary":"")+'" href="#">'+printDate.getDate()+"</a>"))+"</td>";printDate.setDate(printDate.getDate()+1);printDate=this._daylightSavingAdjust(printDate)}calender+=tbody+"</tr>"}drawMonth++;if(drawMonth>11){drawMonth=0;drawYear++}calender+="</tbody></table>"+(isMultiMonth?"</div>"+((numMonths[0]>0&&col==numMonths[1]-1)?'<div class="ui-datepicker-row-break"></div>':""):"");group+=calender}html+=group}html+=buttonPanel+($.browser.msie&&parseInt($.browser.version,10)<7&&!inst.inline?'<iframe src="javascript:false;" class="ui-datepicker-cover" frameborder="0"></iframe>':"");inst._keyEvent=false;return html},_generateMonthYearHeader:function(inst,drawMonth,drawYear,minDate,maxDate,secondary,monthNames,monthNamesShort){var changeMonth=this._get(inst,"changeMonth");var changeYear=this._get(inst,"changeYear");var showMonthAfterYear=this._get(inst,"showMonthAfterYear");var html='<div class="ui-datepicker-title">';var monthHtml="";if(secondary||!changeMonth){monthHtml+='<span class="ui-datepicker-month">'+monthNames[drawMonth]+"</span> "}else{var inMinYear=(minDate&&minDate.getFullYear()==drawYear);var inMaxYear=(maxDate&&maxDate.getFullYear()==drawYear);monthHtml+='<select class="ui-datepicker-month" onchange="DP_jQuery_'+dpuuid+".datepicker._selectMonthYear('#"+inst.id+"', this, 'M');\" onclick=\"DP_jQuery_"+dpuuid+".datepicker._clickMonthYear('#"+inst.id+"');\">";for(var month=0;month<12;month++){if((!inMinYear||month>=minDate.getMonth())&&(!inMaxYear||month<=maxDate.getMonth())){monthHtml+='<option value="'+month+'"'+(month==drawMonth?' selected="selected"':"")+">"+monthNamesShort[month]+"</option>"}}monthHtml+="</select>"}if(!showMonthAfterYear){html+=monthHtml+((secondary||changeMonth||changeYear)&&(!(changeMonth&&changeYear))?"&#xa0;":"")}if(secondary||!changeYear){html+='<span class="ui-datepicker-year">'+drawYear+"</span>"}else{var years=this._get(inst,"yearRange").split(":");var thisYear=new Date().getFullYear();var determineYear=function(value){var year=(value.match(/c[+-].*/)?drawYear+parseInt(value.substring(1),10):(value.match(/[+-].*/)?thisYear+parseInt(value,10):parseInt(value,10)));return(isNaN(year)?thisYear:year)};var year=determineYear(years[0]);var endYear=Math.max(year,determineYear(years[1]||""));year=(minDate?Math.max(year,minDate.getFullYear()):year);endYear=(maxDate?Math.min(endYear,maxDate.getFullYear()):endYear);html+='<select class="ui-datepicker-year" onchange="DP_jQuery_'+dpuuid+".datepicker._selectMonthYear('#"+inst.id+"', this, 'Y');\" onclick=\"DP_jQuery_"+dpuuid+".datepicker._clickMonthYear('#"+inst.id+"');\">";for(;year<=endYear;year++){html+='<option value="'+year+'"'+(year==drawYear?' selected="selected"':"")+">"+year+"</option>"}html+="</select>"}html+=this._get(inst,"yearSuffix");if(showMonthAfterYear){html+=((secondary||changeMonth||changeYear)&&(!(changeMonth&&changeYear))?"&#xa0;":"")+monthHtml}html+="</div>";return html},_adjustInstDate:function(inst,offset,period){var year=inst.drawYear+(period=="Y"?offset:0);var month=inst.drawMonth+(period=="M"?offset:0);var day=Math.min(inst.selectedDay,this._getDaysInMonth(year,month))+(period=="D"?offset:0);var date=this._restrictMinMax(inst,this._daylightSavingAdjust(new Date(year,month,day)));inst.selectedDay=date.getDate();inst.drawMonth=inst.selectedMonth=date.getMonth();inst.drawYear=inst.selectedYear=date.getFullYear();if(period=="M"||period=="Y"){this._notifyChange(inst)}},_restrictMinMax:function(inst,date){var minDate=this._getMinMaxDate(inst,"min");var maxDate=this._getMinMaxDate(inst,"max");date=(minDate&&date<minDate?minDate:date);date=(maxDate&&date>maxDate?maxDate:date);return date},_notifyChange:function(inst){var onChange=this._get(inst,"onChangeMonthYear");if(onChange){onChange.apply((inst.input?inst.input[0]:null),[inst.selectedYear,inst.selectedMonth+1,inst])}},_getNumberOfMonths:function(inst){var numMonths=this._get(inst,"numberOfMonths");return(numMonths==null?[1,1]:(typeof numMonths=="number"?[1,numMonths]:numMonths))},_getMinMaxDate:function(inst,minMax){return this._determineDate(inst,this._get(inst,minMax+"Date"),null)},_getDaysInMonth:function(year,month){return 32-new Date(year,month,32).getDate()},_getFirstDayOfMonth:function(year,month){return new Date(year,month,1).getDay()},_canAdjustMonth:function(inst,offset,curYear,curMonth){var numMonths=this._getNumberOfMonths(inst);var date=this._daylightSavingAdjust(new Date(curYear,curMonth+(offset<0?offset:numMonths[0]*numMonths[1]),1));if(offset<0){date.setDate(this._getDaysInMonth(date.getFullYear(),date.getMonth()))}return this._isInRange(inst,date)},_isInRange:function(inst,date){var minDate=this._getMinMaxDate(inst,"min");var maxDate=this._getMinMaxDate(inst,"max");return((!minDate||date.getTime()>=minDate.getTime())&&(!maxDate||date.getTime()<=maxDate.getTime()))},_getFormatConfig:function(inst){var shortYearCutoff=this._get(inst,"shortYearCutoff");shortYearCutoff=(typeof shortYearCutoff!="string"?shortYearCutoff:new Date().getFullYear()%100+parseInt(shortYearCutoff,10));return{shortYearCutoff:shortYearCutoff,dayNamesShort:this._get(inst,"dayNamesShort"),dayNames:this._get(inst,"dayNames"),monthNamesShort:this._get(inst,"monthNamesShort"),monthNames:this._get(inst,"monthNames")}},_formatDate:function(inst,day,month,year){if(!day){inst.currentDay=inst.selectedDay;inst.currentMonth=inst.selectedMonth;inst.currentYear=inst.selectedYear}var date=(day?(typeof day=="object"?day:this._daylightSavingAdjust(new Date(year,month,day))):this._daylightSavingAdjust(new Date(inst.currentYear,inst.currentMonth,inst.currentDay)));return this.formatDate(this._get(inst,"dateFormat"),date,this._getFormatConfig(inst))}});function extendRemove(target,props){$.extend(target,props);for(var name in props){if(props[name]==null||props[name]==undefined){target[name]=props[name]}}return target}function isArray(a){return(a&&(($.browser.safari&&typeof a=="object"&&a.length)||(a.constructor&&a.constructor.toString().match(/\Array\(\)/))))}$.fn.datepicker=function(options){if(!$.datepicker.initialized){$(document).mousedown($.datepicker._checkExternalClick).find("body").append($.datepicker.dpDiv);$.datepicker.initialized=true}var otherArgs=Array.prototype.slice.call(arguments,1);if(typeof options=="string"&&(options=="isDisabled"||options=="getDate"||options=="widget")){return $.datepicker["_"+options+"Datepicker"].apply($.datepicker,[this[0]].concat(otherArgs))}if(options=="option"&&arguments.length==2&&typeof arguments[1]=="string"){return $.datepicker["_"+options+"Datepicker"].apply($.datepicker,[this[0]].concat(otherArgs))}return this.each(function(){typeof options=="string"?$.datepicker["_"+options+"Datepicker"].apply($.datepicker,[this].concat(otherArgs)):$.datepicker._attachDatepicker(this,options)})};$.datepicker=new Datepicker();$.datepicker.initialized=false;$.datepicker.uuid=new Date().getTime();$.datepicker.version="1.8rc1";window["DP_jQuery_"+dpuuid]=$})(jQuery);;/*
 * jQuery UI Progressbar 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Progressbar
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */(function(a){a.widget("ui.progressbar",{options:{value:0},_create:function(){this.element.addClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").attr({role:"progressbar","aria-valuemin":this._valueMin(),"aria-valuemax":this._valueMax(),"aria-valuenow":this._value()});this.valueDiv=a('<div class="ui-progressbar-value ui-widget-header ui-corner-left"></div>').appendTo(this.element);this._refreshValue()},destroy:function(){this.element.removeClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").removeAttr("role").removeAttr("aria-valuemin").removeAttr("aria-valuemax").removeAttr("aria-valuenow").removeData("progressbar").unbind(".progressbar");this.valueDiv.remove();a.Widget.prototype.destroy.apply(this,arguments);return this},value:function(b){if(b===undefined){return this._value()}this._setOption("value",b);return this},_setOption:function(b,c){switch(b){case"value":this.options.value=c;this._refreshValue();this._trigger("change",null,{});break}a.Widget.prototype._setOption.apply(this,arguments)},_value:function(){var b=this.options.value;if(typeof b!="number"){b=0}if(b<this._valueMin()){b=this._valueMin()}if(b>this._valueMax()){b=this._valueMax()}return b},_valueMin:function(){var b=0;return b},_valueMax:function(){var b=100;return b},_refreshValue:function(){var b=this.value();this.valueDiv[b==this._valueMax()?"addClass":"removeClass"]("ui-corner-right");this.valueDiv.width(b+"%");this.element.attr("aria-valuenow",b)}});a.extend(a.ui.progressbar,{version:"1.8rc1"})})(jQuery);;/*
 * jQuery UI Slider 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Slider
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */(function(b){var a=5;b.widget("ui.slider",b.ui.mouse,{options:{animate:false,distance:0,max:100,min:0,orientation:"horizontal",range:false,step:1,value:0,values:null},_create:function(){var c=this,d=this.options;this._keySliding=false;this._animateOff=true;this._handleIndex=null;this._detectOrientation();this._mouseInit();this.element.addClass("ui-slider ui-slider-"+this.orientation+" ui-widget ui-widget-content ui-corner-all");if(d.disabled){this.element.addClass("ui-slider-disabled ui-disabled")}this.range=b([]);if(d.range){if(d.range===true){this.range=b("<div></div>");if(!d.values){d.values=[this._valueMin(),this._valueMin()]}if(d.values.length&&d.values.length!=2){d.values=[d.values[0],d.values[0]]}}else{this.range=b("<div></div>")}this.range.appendTo(this.element).addClass("ui-slider-range");if(d.range=="min"||d.range=="max"){this.range.addClass("ui-slider-range-"+d.range)}this.range.addClass("ui-widget-header")}if(b(".ui-slider-handle",this.element).length==0){b('<a href="#"></a>').appendTo(this.element).addClass("ui-slider-handle")}if(d.values&&d.values.length){while(b(".ui-slider-handle",this.element).length<d.values.length){b('<a href="#"></a>').appendTo(this.element).addClass("ui-slider-handle")}}this.handles=b(".ui-slider-handle",this.element).addClass("ui-state-default ui-corner-all");this.handle=this.handles.eq(0);this.handles.add(this.range).filter("a").click(function(e){e.preventDefault()}).hover(function(){if(!d.disabled){b(this).addClass("ui-state-hover")}},function(){b(this).removeClass("ui-state-hover")}).focus(function(){if(!d.disabled){b(".ui-slider .ui-state-focus").removeClass("ui-state-focus");b(this).addClass("ui-state-focus")}else{b(this).blur()}}).blur(function(){b(this).removeClass("ui-state-focus")});this.handles.each(function(e){b(this).data("index.ui-slider-handle",e)});this.handles.keydown(function(j){var g=true;var f=b(this).data("index.ui-slider-handle");if(c.options.disabled){return}switch(j.keyCode){case b.ui.keyCode.HOME:case b.ui.keyCode.END:case b.ui.keyCode.PAGE_UP:case b.ui.keyCode.PAGE_DOWN:case b.ui.keyCode.UP:case b.ui.keyCode.RIGHT:case b.ui.keyCode.DOWN:case b.ui.keyCode.LEFT:g=false;if(!c._keySliding){c._keySliding=true;b(this).addClass("ui-state-active");c._start(j,f)}break}var h,e,i=c._step();if(c.options.values&&c.options.values.length){h=e=c.values(f)}else{h=e=c.value()}switch(j.keyCode){case b.ui.keyCode.HOME:e=c._valueMin();break;case b.ui.keyCode.END:e=c._valueMax();break;case b.ui.keyCode.PAGE_UP:e=h+((c._valueMax()-c._valueMin())/a);break;case b.ui.keyCode.PAGE_DOWN:e=h-((c._valueMax()-c._valueMin())/a);break;case b.ui.keyCode.UP:case b.ui.keyCode.RIGHT:if(h==c._valueMax()){return}e=h+i;break;case b.ui.keyCode.DOWN:case b.ui.keyCode.LEFT:if(h==c._valueMin()){return}e=h-i;break}c._slide(j,f,e);return g}).keyup(function(f){var e=b(this).data("index.ui-slider-handle");if(c._keySliding){c._stop(f,e);c._change(f,e);c._keySliding=false;b(this).removeClass("ui-state-active")}});this._refreshValue();this._animateOff=false},destroy:function(){this.handles.remove();this.range.remove();this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-slider-disabled ui-widget ui-widget-content ui-corner-all").removeData("slider").unbind(".slider");this._mouseDestroy();return this},_mouseCapture:function(e){var f=this.options;if(f.disabled){return false}this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()};this.elementOffset=this.element.offset();var i={x:e.pageX,y:e.pageY};var k=this._normValueFromMouse(i);var d=this._valueMax()-this._valueMin()+1,g;var l=this,j;this.handles.each(function(m){var n=Math.abs(k-l.values(m));if(d>n){d=n;g=b(this);j=m}});if(f.range==true&&this.values(1)==f.min){g=b(this.handles[++j])}this._start(e,j);l._handleIndex=j;g.addClass("ui-state-active").focus();var h=g.offset();var c=!b(e.target).parents().andSelf().is(".ui-slider-handle");this._clickOffset=c?{left:0,top:0}:{left:e.pageX-h.left-(g.width()/2),top:e.pageY-h.top-(g.height()/2)-(parseInt(g.css("borderTopWidth"),10)||0)-(parseInt(g.css("borderBottomWidth"),10)||0)+(parseInt(g.css("marginTop"),10)||0)};k=this._normValueFromMouse(i);this._slide(e,j,k);this._animateOff=true;return true},_mouseStart:function(c){return true},_mouseDrag:function(e){var c={x:e.pageX,y:e.pageY};var d=this._normValueFromMouse(c);this._slide(e,this._handleIndex,d);return false},_mouseStop:function(c){this.handles.removeClass("ui-state-active");this._stop(c,this._handleIndex);this._change(c,this._handleIndex);this._handleIndex=null;this._clickOffset=null;this._animateOff=false;return false},_detectOrientation:function(){this.orientation=this.options.orientation=="vertical"?"vertical":"horizontal"},_normValueFromMouse:function(e){var d,i;if("horizontal"==this.orientation){d=this.elementSize.width;i=e.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)}else{d=this.elementSize.height;i=e.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)}var g=(i/d);if(g>1){g=1}if(g<0){g=0}if("vertical"==this.orientation){g=1-g}var f=this._valueMax()-this._valueMin(),j=g*f,c=j%this.options.step,h=this._valueMin()+j-c;if(c>(this.options.step/2)){h+=this.options.step}return parseFloat(h.toFixed(5))},_start:function(e,d){var c={handle:this.handles[d],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(d);c.values=this.values()}this._trigger("start",e,c)},_slide:function(g,f,e){var h=this.handles[f];if(this.options.values&&this.options.values.length){var c=this.values(f?0:1);if((this.options.values.length==2&&this.options.range===true)&&((f==0&&e>c)||(f==1&&e<c))){e=c}if(e!=this.values(f)){var d=this.values();d[f]=e;var i=this._trigger("slide",g,{handle:this.handles[f],value:e,values:d});var c=this.values(f?0:1);if(i!==false){this.values(f,e,true)}}}else{if(e!=this.value()){var i=this._trigger("slide",g,{handle:this.handles[f],value:e});if(i!==false){this.value(e)}}}},_stop:function(e,d){var c={handle:this.handles[d],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(d);c.values=this.values()}this._trigger("stop",e,c)},_change:function(e,d){var c={handle:this.handles[d],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(d);c.values=this.values()}this._trigger("change",e,c)},value:function(c){if(arguments.length){this.options.value=this._trimValue(c);this._refreshValue();this._change(null,0)}return this._value()},values:function(e,h){if(arguments.length>1){this.options.values[e]=this._trimValue(h);this._refreshValue();this._change(null,e)}if(arguments.length){if(b.isArray(arguments[0])){var g=this.options.values,d=arguments[0];for(var f=0,c=g.length;f<c;f++){g[f]=this._trimValue(d[f]);this._change(null,f)}this._refreshValue()}else{if(this.options.values&&this.options.values.length){return this._values(e)}else{return this.value()}}}else{return this._values()}},_setOption:function(c,d){b.Widget.prototype._setOption.apply(this,arguments);switch(c){case"disabled":if(d){this.handles.filter(".ui-state-focus").blur();this.handles.removeClass("ui-state-hover");this.handles.attr("disabled","disabled");this.element.addClass("ui-disabled")}else{this.handles.removeAttr("disabled");this.element.removeClass("ui-disabled")}case"orientation":this._detectOrientation();this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation);this._refreshValue();break;case"value":this._animateOff=true;this._refreshValue();this._animateOff=false;break;case"values":this._animateOff=true;this._refreshValue();this._animateOff=false;break}},_step:function(){var c=this.options.step;return c},_value:function(){var c=this.options.value;c=this._trimValue(c);return c},_values:function(d){if(arguments.length){var g=this.options.values[d];g=this._trimValue(g);return g}else{var f=this.options.values.slice();for(var e=0,c=f.length;e<c;e++){f[e]=this._trimValue(f[e])}return f}},_trimValue:function(c){if(c<this._valueMin()){c=this._valueMin()}if(c>this._valueMax()){c=this._valueMax()}return c},_valueMin:function(){var c=this.options.min;return c},_valueMax:function(){var c=this.options.max;return c},_refreshValue:function(){var g=this.options.range,e=this.options,m=this;var d=(!this._animateOff)?e.animate:false;if(this.options.values&&this.options.values.length){var j,i;this.handles.each(function(q,o){var p=(m.values(q)-m._valueMin())/(m._valueMax()-m._valueMin())*100;var n={};n[m.orientation=="horizontal"?"left":"bottom"]=p+"%";b(this).stop(1,1)[d?"animate":"css"](n,e.animate);if(m.options.range===true){if(m.orientation=="horizontal"){(q==0)&&m.range.stop(1,1)[d?"animate":"css"]({left:p+"%"},e.animate);(q==1)&&m.range[d?"animate":"css"]({width:(p-lastValPercent)+"%"},{queue:false,duration:e.animate})}else{(q==0)&&m.range.stop(1,1)[d?"animate":"css"]({bottom:(p)+"%"},e.animate);(q==1)&&m.range[d?"animate":"css"]({height:(p-lastValPercent)+"%"},{queue:false,duration:e.animate})}}lastValPercent=p})}else{var k=this.value(),h=this._valueMin(),l=this._valueMax(),f=l!=h?(k-h)/(l-h)*100:0;var c={};c[m.orientation=="horizontal"?"left":"bottom"]=f+"%";this.handle.stop(1,1)[d?"animate":"css"](c,e.animate);(g=="min")&&(this.orientation=="horizontal")&&this.range.stop(1,1)[d?"animate":"css"]({width:f+"%"},e.animate);(g=="max")&&(this.orientation=="horizontal")&&this.range[d?"animate":"css"]({width:(100-f)+"%"},{queue:false,duration:e.animate});(g=="min")&&(this.orientation=="vertical")&&this.range.stop(1,1)[d?"animate":"css"]({height:f+"%"},e.animate);(g=="max")&&(this.orientation=="vertical")&&this.range[d?"animate":"css"]({height:(100-f)+"%"},{queue:false,duration:e.animate})}}});b.extend(b.ui.slider,{version:"1.8rc1",eventPrefix:"slide"})})(jQuery);;/*
 * jQuery UI Tabs 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Tabs
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */(function(b){var a=0;b.widget("ui.tabs",{options:{add:null,ajaxOptions:null,cache:false,cookie:null,collapsible:false,disable:null,disabled:[],enable:null,event:"click",fx:null,idPrefix:"ui-tabs-",load:null,panelTemplate:"<div></div>",remove:null,select:null,show:null,spinner:"<em>Loading&#8230;</em>",tabTemplate:'<li><a href="#{href}"><span>#{label}</span></a></li>'},_create:function(){this._tabify(true)},_setOption:function(c,d){if(c=="selected"){if(this.options.collapsible&&d==this.options.selected){return}this.select(d)}else{this.options[c]=d;this._tabify()}},_tabId:function(c){return c.title&&c.title.replace(/\s/g,"_").replace(/[^A-Za-z0-9\-_:\.]/g,"")||this.options.idPrefix+(++a)},_sanitizeSelector:function(c){return c.replace(/:/g,"\\:")},_cookie:function(){var c=this.cookie||(this.cookie=this.options.cookie.name||"ui-tabs-"+b.data(this.list[0]));return b.cookie.apply(null,[c].concat(b.makeArray(arguments)))},_ui:function(d,c){return{tab:d,panel:c,index:this.anchors.index(d)}},_cleanup:function(){this.lis.filter(".ui-state-processing").removeClass("ui-state-processing").find("span:data(label.tabs)").each(function(){var c=b(this);c.html(c.data("label.tabs")).removeData("label.tabs")})},_tabify:function(p){this.list=this.element.find("ol,ul").eq(0);this.lis=b("li:has(a[href])",this.list);this.anchors=this.lis.map(function(){return b("a",this)[0]});this.panels=b([]);var q=this,e=this.options;var d=/^#.+/;this.anchors.each(function(s,o){var r=b(o).attr("href");var u=r.split("#")[0],v;if(u&&(u===location.toString().split("#")[0]||(v=b("base")[0])&&u===v.href)){r=o.hash;o.href=r}if(d.test(r)){q.panels=q.panels.add(q._sanitizeSelector(r))}else{if(r!="#"){b.data(o,"href.tabs",r);b.data(o,"load.tabs",r.replace(/#.*$/,""));var x=q._tabId(o);o.href="#"+x;var w=b("#"+x);if(!w.length){w=b(e.panelTemplate).attr("id",x).addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").insertAfter(q.panels[s-1]||q.list);w.data("destroy.tabs",true)}q.panels=q.panels.add(w)}else{e.disabled.push(s)}}});if(p){this.element.addClass("ui-tabs ui-widget ui-widget-content ui-corner-all");this.list.addClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all");this.lis.addClass("ui-state-default ui-corner-top");this.panels.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom");if(e.selected===undefined){if(location.hash){this.anchors.each(function(r,o){if(o.hash==location.hash){e.selected=r;return false}})}if(typeof e.selected!="number"&&e.cookie){e.selected=parseInt(q._cookie(),10)}if(typeof e.selected!="number"&&this.lis.filter(".ui-tabs-selected").length){e.selected=this.lis.index(this.lis.filter(".ui-tabs-selected"))}e.selected=e.selected||this.lis.length?0:-1}else{if(e.selected===null){e.selected=-1}}e.selected=((e.selected>=0&&this.anchors[e.selected])||e.selected<0)?e.selected:0;e.disabled=b.unique(e.disabled.concat(b.map(this.lis.filter(".ui-state-disabled"),function(r,o){return q.lis.index(r)}))).sort();if(b.inArray(e.selected,e.disabled)!=-1){e.disabled.splice(b.inArray(e.selected,e.disabled),1)}this.panels.addClass("ui-tabs-hide");this.lis.removeClass("ui-tabs-selected ui-state-active");if(e.selected>=0&&this.anchors.length){this.panels.eq(e.selected).removeClass("ui-tabs-hide");this.lis.eq(e.selected).addClass("ui-tabs-selected ui-state-active");q.element.queue("tabs",function(){q._trigger("show",null,q._ui(q.anchors[e.selected],q.panels[e.selected]))});this.load(e.selected)}b(window).bind("unload",function(){q.lis.add(q.anchors).unbind(".tabs");q.lis=q.anchors=q.panels=null})}else{e.selected=this.lis.index(this.lis.filter(".ui-tabs-selected"))}this.element[e.collapsible?"addClass":"removeClass"]("ui-tabs-collapsible");if(e.cookie){this._cookie(e.selected,e.cookie)}for(var h=0,n;(n=this.lis[h]);h++){b(n)[b.inArray(h,e.disabled)!=-1&&!b(n).hasClass("ui-tabs-selected")?"addClass":"removeClass"]("ui-state-disabled")}if(e.cache===false){this.anchors.removeData("cache.tabs")}this.lis.add(this.anchors).unbind(".tabs");if(e.event!="mouseover"){var g=function(o,i){if(i.is(":not(.ui-state-disabled)")){i.addClass("ui-state-"+o)}};var k=function(o,i){i.removeClass("ui-state-"+o)};this.lis.bind("mouseover.tabs",function(){g("hover",b(this))});this.lis.bind("mouseout.tabs",function(){k("hover",b(this))});this.anchors.bind("focus.tabs",function(){g("focus",b(this).closest("li"))});this.anchors.bind("blur.tabs",function(){k("focus",b(this).closest("li"))})}var c,j;if(e.fx){if(b.isArray(e.fx)){c=e.fx[0];j=e.fx[1]}else{c=j=e.fx}}function f(i,o){i.css({display:""});if(!b.support.opacity&&o.opacity){i[0].style.removeAttribute("filter")}}var l=j?function(i,o){b(i).closest("li").addClass("ui-tabs-selected ui-state-active");o.hide().removeClass("ui-tabs-hide").animate(j,j.duration||"normal",function(){f(o,j);q._trigger("show",null,q._ui(i,o[0]))})}:function(i,o){b(i).closest("li").addClass("ui-tabs-selected ui-state-active");o.removeClass("ui-tabs-hide");q._trigger("show",null,q._ui(i,o[0]))};var m=c?function(o,i){i.animate(c,c.duration||"normal",function(){q.lis.removeClass("ui-tabs-selected ui-state-active");i.addClass("ui-tabs-hide");f(i,c);q.element.dequeue("tabs")})}:function(o,i,r){q.lis.removeClass("ui-tabs-selected ui-state-active");i.addClass("ui-tabs-hide");q.element.dequeue("tabs")};this.anchors.bind(e.event+".tabs",function(){var o=this,s=b(this).closest("li"),i=q.panels.filter(":not(.ui-tabs-hide)"),r=b(q._sanitizeSelector(this.hash));if((s.hasClass("ui-tabs-selected")&&!e.collapsible)||s.hasClass("ui-state-disabled")||s.hasClass("ui-state-processing")||q._trigger("select",null,q._ui(this,r[0]))===false){this.blur();return false}e.selected=q.anchors.index(this);q.abort();if(e.collapsible){if(s.hasClass("ui-tabs-selected")){e.selected=-1;if(e.cookie){q._cookie(e.selected,e.cookie)}q.element.queue("tabs",function(){m(o,i)}).dequeue("tabs");this.blur();return false}else{if(!i.length){if(e.cookie){q._cookie(e.selected,e.cookie)}q.element.queue("tabs",function(){l(o,r)});q.load(q.anchors.index(this));this.blur();return false}}}if(e.cookie){q._cookie(e.selected,e.cookie)}if(r.length){if(i.length){q.element.queue("tabs",function(){m(o,i)})}q.element.queue("tabs",function(){l(o,r)});q.load(q.anchors.index(this))}else{throw"jQuery UI Tabs: Mismatching fragment identifier."}if(b.browser.msie){this.blur()}});this.anchors.bind("click.tabs",function(){return false})},destroy:function(){var c=this.options;this.abort();this.element.unbind(".tabs").removeClass("ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible").removeData("tabs");this.list.removeClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all");this.anchors.each(function(){var d=b.data(this,"href.tabs");if(d){this.href=d}var e=b(this).unbind(".tabs");b.each(["href","load","cache"],function(f,g){e.removeData(g+".tabs")})});this.lis.unbind(".tabs").add(this.panels).each(function(){if(b.data(this,"destroy.tabs")){b(this).remove()}else{b(this).removeClass(["ui-state-default","ui-corner-top","ui-tabs-selected","ui-state-active","ui-state-hover","ui-state-focus","ui-state-disabled","ui-tabs-panel","ui-widget-content","ui-corner-bottom","ui-tabs-hide"].join(" "))}});if(c.cookie){this._cookie(null,c.cookie)}return this},add:function(f,e,d){if(d===undefined){d=this.anchors.length}var c=this,h=this.options,j=b(h.tabTemplate.replace(/#\{href\}/g,f).replace(/#\{label\}/g,e)),i=!f.indexOf("#")?f.replace("#",""):this._tabId(b("a",j)[0]);j.addClass("ui-state-default ui-corner-top").data("destroy.tabs",true);var g=b("#"+i);if(!g.length){g=b(h.panelTemplate).attr("id",i).data("destroy.tabs",true)}g.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide");if(d>=this.lis.length){j.appendTo(this.list);g.appendTo(this.list[0].parentNode)}else{j.insertBefore(this.lis[d]);g.insertBefore(this.panels[d])}h.disabled=b.map(h.disabled,function(l,k){return l>=d?++l:l});this._tabify();if(this.anchors.length==1){h.selected=0;j.addClass("ui-tabs-selected ui-state-active");g.removeClass("ui-tabs-hide");this.element.queue("tabs",function(){c._trigger("show",null,c._ui(c.anchors[0],c.panels[0]))});this.load(0)}this._trigger("add",null,this._ui(this.anchors[d],this.panels[d]));return this},remove:function(c){var e=this.options,f=this.lis.eq(c).remove(),d=this.panels.eq(c).remove();if(f.hasClass("ui-tabs-selected")&&this.anchors.length>1){this.select(c+(c+1<this.anchors.length?1:-1))}e.disabled=b.map(b.grep(e.disabled,function(h,g){return h!=c}),function(h,g){return h>=c?--h:h});this._tabify();this._trigger("remove",null,this._ui(f.find("a")[0],d[0]));return this},enable:function(c){var d=this.options;if(b.inArray(c,d.disabled)==-1){return}this.lis.eq(c).removeClass("ui-state-disabled");d.disabled=b.grep(d.disabled,function(f,e){return f!=c});this._trigger("enable",null,this._ui(this.anchors[c],this.panels[c]));return this},disable:function(d){var c=this,e=this.options;if(d!=e.selected){this.lis.eq(d).addClass("ui-state-disabled");e.disabled.push(d);e.disabled.sort();this._trigger("disable",null,this._ui(this.anchors[d],this.panels[d]))}return this},select:function(c){if(typeof c=="string"){c=this.anchors.index(this.anchors.filter("[href$="+c+"]"))}else{if(c===null){c=-1}}if(c==-1&&this.options.collapsible){c=this.options.selected}this.anchors.eq(c).trigger(this.options.event+".tabs");return this},load:function(f){var d=this,h=this.options,c=this.anchors.eq(f)[0],e=b.data(c,"load.tabs");this.abort();if(!e||this.element.queue("tabs").length!==0&&b.data(c,"cache.tabs")){this.element.dequeue("tabs");return}this.lis.eq(f).addClass("ui-state-processing");if(h.spinner){var g=b("span",c);g.data("label.tabs",g.html()).html(h.spinner)}this.xhr=b.ajax(b.extend({},h.ajaxOptions,{url:e,success:function(j,i){b(d._sanitizeSelector(c.hash)).html(j);d._cleanup();if(h.cache){b.data(c,"cache.tabs",true)}d._trigger("load",null,d._ui(d.anchors[f],d.panels[f]));try{h.ajaxOptions.success(j,i)}catch(k){}d.element.dequeue("tabs")}}));return this},abort:function(){this.element.queue([]);this.panels.stop(false,true);this.element.queue("tabs",this.element.queue("tabs").splice(-2,2));if(this.xhr){this.xhr.abort();delete this.xhr}this._cleanup();return this},url:function(d,c){this.anchors.eq(d).removeData("cache.tabs").data("load.tabs",c);return this},length:function(){return this.anchors.length}});b.extend(b.ui.tabs,{version:"1.8rc1"});b.extend(b.ui.tabs.prototype,{rotation:null,rotate:function(e,g){var c=this,h=this.options;var d=c._rotate||(c._rotate=function(i){clearTimeout(c.rotation);c.rotation=setTimeout(function(){var j=h.selected;c.select(++j<c.anchors.length?j:0)},e);if(i){i.stopPropagation()}});var f=c._unrotate||(c._unrotate=!g?function(i){if(i.clientX){c.rotate(null)}}:function(i){t=h.selected;d()});if(e){this.element.bind("tabsshow",d);this.anchors.bind(h.event+".tabs",f);d()}else{clearTimeout(c.rotation);this.element.unbind("tabsshow",d);this.anchors.unbind(h.event+".tabs",f);delete this._rotate;delete this._unrotate}return this}})})(jQuery);;/*
 * jQuery UI Effects 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/
 */jQuery.effects||(function(g){g.effects={};g.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","color","outlineColor"],function(l,k){g.fx.step[k]=function(m){if(!m.colorInit){m.start=j(m.elem,k);m.end=i(m.end);m.colorInit=true}m.elem.style[k]="rgb("+Math.max(Math.min(parseInt((m.pos*(m.end[0]-m.start[0]))+m.start[0],10),255),0)+","+Math.max(Math.min(parseInt((m.pos*(m.end[1]-m.start[1]))+m.start[1],10),255),0)+","+Math.max(Math.min(parseInt((m.pos*(m.end[2]-m.start[2]))+m.start[2],10),255),0)+")"}});function i(l){var k;if(l&&l.constructor==Array&&l.length==3){return l}if(k=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(l)){return[parseInt(k[1],10),parseInt(k[2],10),parseInt(k[3],10)]}if(k=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(l)){return[parseFloat(k[1])*2.55,parseFloat(k[2])*2.55,parseFloat(k[3])*2.55]}if(k=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(l)){return[parseInt(k[1],16),parseInt(k[2],16),parseInt(k[3],16)]}if(k=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(l)){return[parseInt(k[1]+k[1],16),parseInt(k[2]+k[2],16),parseInt(k[3]+k[3],16)]}if(k=/rgba\(0, 0, 0, 0\)/.exec(l)){return a.transparent}return a[g.trim(l).toLowerCase()]}function j(m,k){var l;do{l=g.curCSS(m,k);if(l!=""&&l!="transparent"||g.nodeName(m,"body")){break}k="backgroundColor"}while(m=m.parentNode);return i(l)}var a={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]};var e=["add","remove","toggle"],c={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};function f(){var n=document.defaultView?document.defaultView.getComputedStyle(this,null):this.currentStyle,o={},l,m;if(n&&n.length&&n[0]&&n[n[0]]){var k=n.length;while(k--){l=n[k];if(typeof n[l]=="string"){m=l.replace(/\-(\w)/g,function(p,q){return q.toUpperCase()});o[m]=n[l]}}}else{for(l in n){if(typeof n[l]==="string"){o[l]=n[l]}}}return o}function b(l){var k,m;for(k in l){m=l[k];if(m==null||g.isFunction(m)||k in c||(/scrollbar/).test(k)||(!(/color/i).test(k)&&isNaN(parseFloat(m)))){delete l[k]}}return l}function h(k,m){var n={_:0},l;for(l in m){if(k[l]!=m[l]){n[l]=m[l]}}return n}g.effects.animateClass=function(k,l,n,m){if(g.isFunction(n)){m=n;n=null}return this.each(function(){var r=g(this),o=r.attr("style")||" ",s=b(f.call(this)),q,p=r.attr("className");g.each(e,function(t,u){if(k[u]){r[u+"Class"](k[u])}});q=b(f.call(this));r.attr("className",p);r.animate(h(s,q),l,n,function(){g.each(e,function(t,u){if(k[u]){r[u+"Class"](k[u])}});if(typeof r.attr("style")=="object"){r.attr("style").cssText="";r.attr("style").cssText=o}else{r.attr("style",o)}if(m){m.apply(this,arguments)}})})};g.fn.extend({_addClass:g.fn.addClass,addClass:function(l,k,n,m){return k?g.effects.animateClass.apply(this,[{add:l},k,n,m]):this._addClass(l)},_removeClass:g.fn.removeClass,removeClass:function(l,k,n,m){return k?g.effects.animateClass.apply(this,[{remove:l},k,n,m]):this._removeClass(l)},_toggleClass:g.fn.toggleClass,toggleClass:function(m,l,k,o,n){if(typeof l=="boolean"||l===undefined){if(!k){return this._toggleClass(m,l)}else{return g.effects.animateClass.apply(this,[(l?{add:m}:{remove:m}),k,o,n])}}else{return g.effects.animateClass.apply(this,[{toggle:m},l,k,o])}},switchClass:function(k,m,l,o,n){return g.effects.animateClass.apply(this,[{add:m,remove:k},l,o,n])}});g.extend(g.effects,{version:"1.8rc1",save:function(l,m){for(var k=0;k<m.length;k++){if(m[k]!==null){l.data("ec.storage."+m[k],l[0].style[m[k]])}}},restore:function(l,m){for(var k=0;k<m.length;k++){if(m[k]!==null){l.css(m[k],l.data("ec.storage."+m[k]))}}},setMode:function(k,l){if(l=="toggle"){l=k.is(":hidden")?"show":"hide"}return l},getBaseline:function(l,m){var n,k;switch(l[0]){case"top":n=0;break;case"middle":n=0.5;break;case"bottom":n=1;break;default:n=l[0]/m.height}switch(l[1]){case"left":k=0;break;case"center":k=0.5;break;case"right":k=1;break;default:k=l[1]/m.width}return{x:k,y:n}},createWrapper:function(k){if(k.parent().is(".ui-effects-wrapper")){return k.parent()}var l={width:k.outerWidth(true),height:k.outerHeight(true),"float":k.css("float")},m=g("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",border:"none",margin:0,padding:0});k.wrap(m);if(k.css("position")=="static"){m.css({position:"relative"});k.css({position:"relative"})}else{g.extend(l,{position:k.css("position"),zIndex:k.css("z-index")});g.each(["top","left","bottom","right"],function(n,o){l[o]=k.css(o);if(isNaN(parseInt(l[o],10))){l[o]="auto"}});k.css({position:"relative",top:0,left:0})}return m.css(l).show()},removeWrapper:function(k){if(k.parent().is(".ui-effects-wrapper")){return k.parent().replaceWith(k)}return k},setTransition:function(l,n,k,m){m=m||{};g.each(n,function(p,o){unit=l.cssUnit(o);if(unit[0]>0){m[o]=unit[0]*k+unit[1]}});return m}});function d(l,k,m,n){if(typeof l=="object"){n=k;m=null;k=l;l=k.effect}if(g.isFunction(k)){n=k;m=null;k={}}if(typeof k=="number"){n=m;m=k;k={}}k=k||{};m=m||k.duration;m=g.fx.off?0:typeof m=="number"?m:g.fx.speeds[m]||g.fx.speeds._default;n=n||k.complete;return[l,k,m,n]}g.fn.extend({effect:function(n,m,p,q){var l=d.apply(this,arguments),o={options:l[1],duration:l[2],callback:l[3]},k=g.effects[n];return k&&!g.fx.off?k.call(this,o):this},_show:g.fn.show,show:function(l){if(!l||typeof l=="number"||g.fx.speeds[l]){return this._show.apply(this,arguments)}else{var k=d.apply(this,arguments);k[1].mode="show";return this.effect.apply(this,k)}},_hide:g.fn.hide,hide:function(l){if(!l||typeof l=="number"||g.fx.speeds[l]){return this._hide.apply(this,arguments)}else{var k=d.apply(this,arguments);k[1].mode="hide";return this.effect.apply(this,k)}},__toggle:g.fn.toggle,toggle:function(l){if(!l||typeof l=="number"||g.fx.speeds[l]||typeof l=="boolean"||g.isFunction(l)){return this.__toggle.apply(this,arguments)}else{var k=d.apply(this,arguments);k[1].mode="toggle";return this.effect.apply(this,k)}},cssUnit:function(k){var l=this.css(k),m=[];g.each(["em","px","%","pt"],function(n,o){if(l.indexOf(o)>0){m=[parseFloat(l),o]}});return m}});g.easing.jswing=g.easing.swing;g.extend(g.easing,{def:"easeOutQuad",swing:function(l,m,k,o,n){return g.easing[g.easing.def](l,m,k,o,n)},easeInQuad:function(l,m,k,o,n){return o*(m/=n)*m+k},easeOutQuad:function(l,m,k,o,n){return -o*(m/=n)*(m-2)+k},easeInOutQuad:function(l,m,k,o,n){if((m/=n/2)<1){return o/2*m*m+k}return -o/2*((--m)*(m-2)-1)+k},easeInCubic:function(l,m,k,o,n){return o*(m/=n)*m*m+k},easeOutCubic:function(l,m,k,o,n){return o*((m=m/n-1)*m*m+1)+k},easeInOutCubic:function(l,m,k,o,n){if((m/=n/2)<1){return o/2*m*m*m+k}return o/2*((m-=2)*m*m+2)+k},easeInQuart:function(l,m,k,o,n){return o*(m/=n)*m*m*m+k},easeOutQuart:function(l,m,k,o,n){return -o*((m=m/n-1)*m*m*m-1)+k},easeInOutQuart:function(l,m,k,o,n){if((m/=n/2)<1){return o/2*m*m*m*m+k}return -o/2*((m-=2)*m*m*m-2)+k},easeInQuint:function(l,m,k,o,n){return o*(m/=n)*m*m*m*m+k},easeOutQuint:function(l,m,k,o,n){return o*((m=m/n-1)*m*m*m*m+1)+k},easeInOutQuint:function(l,m,k,o,n){if((m/=n/2)<1){return o/2*m*m*m*m*m+k}return o/2*((m-=2)*m*m*m*m+2)+k},easeInSine:function(l,m,k,o,n){return -o*Math.cos(m/n*(Math.PI/2))+o+k},easeOutSine:function(l,m,k,o,n){return o*Math.sin(m/n*(Math.PI/2))+k},easeInOutSine:function(l,m,k,o,n){return -o/2*(Math.cos(Math.PI*m/n)-1)+k},easeInExpo:function(l,m,k,o,n){return(m==0)?k:o*Math.pow(2,10*(m/n-1))+k},easeOutExpo:function(l,m,k,o,n){return(m==n)?k+o:o*(-Math.pow(2,-10*m/n)+1)+k},easeInOutExpo:function(l,m,k,o,n){if(m==0){return k}if(m==n){return k+o}if((m/=n/2)<1){return o/2*Math.pow(2,10*(m-1))+k}return o/2*(-Math.pow(2,-10*--m)+2)+k},easeInCirc:function(l,m,k,o,n){return -o*(Math.sqrt(1-(m/=n)*m)-1)+k},easeOutCirc:function(l,m,k,o,n){return o*Math.sqrt(1-(m=m/n-1)*m)+k},easeInOutCirc:function(l,m,k,o,n){if((m/=n/2)<1){return -o/2*(Math.sqrt(1-m*m)-1)+k}return o/2*(Math.sqrt(1-(m-=2)*m)+1)+k},easeInElastic:function(l,n,k,u,r){var o=1.70158;var q=0;var m=u;if(n==0){return k}if((n/=r)==1){return k+u}if(!q){q=r*0.3}if(m<Math.abs(u)){m=u;var o=q/4}else{var o=q/(2*Math.PI)*Math.asin(u/m)}return -(m*Math.pow(2,10*(n-=1))*Math.sin((n*r-o)*(2*Math.PI)/q))+k},easeOutElastic:function(l,n,k,u,r){var o=1.70158;var q=0;var m=u;if(n==0){return k}if((n/=r)==1){return k+u}if(!q){q=r*0.3}if(m<Math.abs(u)){m=u;var o=q/4}else{var o=q/(2*Math.PI)*Math.asin(u/m)}return m*Math.pow(2,-10*n)*Math.sin((n*r-o)*(2*Math.PI)/q)+u+k},easeInOutElastic:function(l,n,k,u,r){var o=1.70158;var q=0;var m=u;if(n==0){return k}if((n/=r/2)==2){return k+u}if(!q){q=r*(0.3*1.5)}if(m<Math.abs(u)){m=u;var o=q/4}else{var o=q/(2*Math.PI)*Math.asin(u/m)}if(n<1){return -0.5*(m*Math.pow(2,10*(n-=1))*Math.sin((n*r-o)*(2*Math.PI)/q))+k}return m*Math.pow(2,-10*(n-=1))*Math.sin((n*r-o)*(2*Math.PI)/q)*0.5+u+k},easeInBack:function(l,m,k,p,o,n){if(n==undefined){n=1.70158}return p*(m/=o)*m*((n+1)*m-n)+k},easeOutBack:function(l,m,k,p,o,n){if(n==undefined){n=1.70158}return p*((m=m/o-1)*m*((n+1)*m+n)+1)+k},easeInOutBack:function(l,m,k,p,o,n){if(n==undefined){n=1.70158}if((m/=o/2)<1){return p/2*(m*m*(((n*=(1.525))+1)*m-n))+k}return p/2*((m-=2)*m*(((n*=(1.525))+1)*m+n)+2)+k},easeInBounce:function(l,m,k,o,n){return o-g.easing.easeOutBounce(l,n-m,0,o,n)+k},easeOutBounce:function(l,m,k,o,n){if((m/=n)<(1/2.75)){return o*(7.5625*m*m)+k}else{if(m<(2/2.75)){return o*(7.5625*(m-=(1.5/2.75))*m+0.75)+k}else{if(m<(2.5/2.75)){return o*(7.5625*(m-=(2.25/2.75))*m+0.9375)+k}else{return o*(7.5625*(m-=(2.625/2.75))*m+0.984375)+k}}}},easeInOutBounce:function(l,m,k,o,n){if(m<n/2){return g.easing.easeInBounce(l,m*2,0,o,n)*0.5+k}return g.easing.easeOutBounce(l,m*2-n,0,o,n)*0.5+o*0.5+k}})})(jQuery);;/*
 * jQuery UI Effects Blind 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Blind
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.blind=function(b){return this.queue(function(){var d=a(this),c=["position","top","left"];var h=a.effects.setMode(d,b.options.mode||"hide");var g=b.options.direction||"vertical";a.effects.save(d,c);d.show();var j=a.effects.createWrapper(d).css({overflow:"hidden"});var e=(g=="vertical")?"height":"width";var i=(g=="vertical")?j.height():j.width();if(h=="show"){j.css(e,0)}var f={};f[e]=h=="show"?i:0;j.animate(f,b.duration,b.options.easing,function(){if(h=="hide"){d.hide()}a.effects.restore(d,c);a.effects.removeWrapper(d);if(b.callback){b.callback.apply(d[0],arguments)}d.dequeue()})})}})(jQuery);;/*
 * jQuery UI Effects Bounce 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Bounce
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.bounce=function(b){return this.queue(function(){var e=a(this),l=["position","top","left"];var k=a.effects.setMode(e,b.options.mode||"effect");var n=b.options.direction||"up";var c=b.options.distance||20;var d=b.options.times||5;var g=b.duration||250;if(/show|hide/.test(k)){l.push("opacity")}a.effects.save(e,l);e.show();a.effects.createWrapper(e);var f=(n=="up"||n=="down")?"top":"left";var p=(n=="up"||n=="left")?"pos":"neg";var c=b.options.distance||(f=="top"?e.outerHeight({margin:true})/3:e.outerWidth({margin:true})/3);if(k=="show"){e.css("opacity",0).css(f,p=="pos"?-c:c)}if(k=="hide"){c=c/(d*2)}if(k!="hide"){d--}if(k=="show"){var h={opacity:1};h[f]=(p=="pos"?"+=":"-=")+c;e.animate(h,g/2,b.options.easing);c=c/2;d--}for(var j=0;j<d;j++){var o={},m={};o[f]=(p=="pos"?"-=":"+=")+c;m[f]=(p=="pos"?"+=":"-=")+c;e.animate(o,g/2,b.options.easing).animate(m,g/2,b.options.easing);c=(k=="hide")?c*2:c/2}if(k=="hide"){var h={opacity:0};h[f]=(p=="pos"?"-=":"+=")+c;e.animate(h,g/2,b.options.easing,function(){e.hide();a.effects.restore(e,l);a.effects.removeWrapper(e);if(b.callback){b.callback.apply(this,arguments)}})}else{var o={},m={};o[f]=(p=="pos"?"-=":"+=")+c;m[f]=(p=="pos"?"+=":"-=")+c;e.animate(o,g/2,b.options.easing).animate(m,g/2,b.options.easing,function(){a.effects.restore(e,l);a.effects.removeWrapper(e);if(b.callback){b.callback.apply(this,arguments)}})}e.queue("fx",function(){e.dequeue()});e.dequeue()})}})(jQuery);;/*
 * jQuery UI Effects Clip 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Clip
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.clip=function(b){return this.queue(function(){var f=a(this),j=["position","top","left","height","width"];var i=a.effects.setMode(f,b.options.mode||"hide");var k=b.options.direction||"vertical";a.effects.save(f,j);f.show();var c=a.effects.createWrapper(f).css({overflow:"hidden"});var e=f[0].tagName=="IMG"?c:f;var g={size:(k=="vertical")?"height":"width",position:(k=="vertical")?"top":"left"};var d=(k=="vertical")?e.height():e.width();if(i=="show"){e.css(g.size,0);e.css(g.position,d/2)}var h={};h[g.size]=i=="show"?d:0;h[g.position]=i=="show"?0:d/2;e.animate(h,{queue:false,duration:b.duration,easing:b.options.easing,complete:function(){if(i=="hide"){f.hide()}a.effects.restore(f,j);a.effects.removeWrapper(f);if(b.callback){b.callback.apply(f[0],arguments)}f.dequeue()}})})}})(jQuery);;/*
 * jQuery UI Effects Drop 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Drop
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.drop=function(b){return this.queue(function(){var e=a(this),d=["position","top","left","opacity"];var i=a.effects.setMode(e,b.options.mode||"hide");var h=b.options.direction||"left";a.effects.save(e,d);e.show();a.effects.createWrapper(e);var f=(h=="up"||h=="down")?"top":"left";var c=(h=="up"||h=="left")?"pos":"neg";var j=b.options.distance||(f=="top"?e.outerHeight({margin:true})/2:e.outerWidth({margin:true})/2);if(i=="show"){e.css("opacity",0).css(f,c=="pos"?-j:j)}var g={opacity:i=="show"?1:0};g[f]=(i=="show"?(c=="pos"?"+=":"-="):(c=="pos"?"-=":"+="))+j;e.animate(g,{queue:false,duration:b.duration,easing:b.options.easing,complete:function(){if(i=="hide"){e.hide()}a.effects.restore(e,d);a.effects.removeWrapper(e);if(b.callback){b.callback.apply(this,arguments)}e.dequeue()}})})}})(jQuery);;/*
 * jQuery UI Effects Explode 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Explode
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.explode=function(b){return this.queue(function(){var k=b.options.pieces?Math.round(Math.sqrt(b.options.pieces)):3;var e=b.options.pieces?Math.round(Math.sqrt(b.options.pieces)):3;b.options.mode=b.options.mode=="toggle"?(a(this).is(":visible")?"hide":"show"):b.options.mode;var h=a(this).show().css("visibility","hidden");var l=h.offset();l.top-=parseInt(h.css("marginTop"),10)||0;l.left-=parseInt(h.css("marginLeft"),10)||0;var g=h.outerWidth(true);var c=h.outerHeight(true);for(var f=0;f<k;f++){for(var d=0;d<e;d++){h.clone().appendTo("body").wrap("<div></div>").css({position:"absolute",visibility:"visible",left:-d*(g/e),top:-f*(c/k)}).parent().addClass("ui-effects-explode").css({position:"absolute",overflow:"hidden",width:g/e,height:c/k,left:l.left+d*(g/e)+(b.options.mode=="show"?(d-Math.floor(e/2))*(g/e):0),top:l.top+f*(c/k)+(b.options.mode=="show"?(f-Math.floor(k/2))*(c/k):0),opacity:b.options.mode=="show"?0:1}).animate({left:l.left+d*(g/e)+(b.options.mode=="show"?0:(d-Math.floor(e/2))*(g/e)),top:l.top+f*(c/k)+(b.options.mode=="show"?0:(f-Math.floor(k/2))*(c/k)),opacity:b.options.mode=="show"?1:0},b.duration||500)}}setTimeout(function(){b.options.mode=="show"?h.css({visibility:"visible"}):h.css({visibility:"visible"}).hide();if(b.callback){b.callback.apply(h[0])}h.dequeue();a("div.ui-effects-explode").remove()},b.duration||500)})}})(jQuery);;/*
 * jQuery UI Effects Fold 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Fold
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.fold=function(b){return this.queue(function(){var e=a(this),k=["position","top","left"];var h=a.effects.setMode(e,b.options.mode||"hide");var o=b.options.size||15;var n=!(!b.options.horizFirst);var g=b.duration?b.duration/2:a.fx.speeds._default/2;a.effects.save(e,k);e.show();var d=a.effects.createWrapper(e).css({overflow:"hidden"});var i=((h=="show")!=n);var f=i?["width","height"]:["height","width"];var c=i?[d.width(),d.height()]:[d.height(),d.width()];var j=/([0-9]+)%/.exec(o);if(j){o=parseInt(j[1],10)/100*c[h=="hide"?0:1]}if(h=="show"){d.css(n?{height:0,width:o}:{height:o,width:0})}var m={},l={};m[f[0]]=h=="show"?c[0]:o;l[f[1]]=h=="show"?c[1]:0;d.animate(m,g,b.options.easing).animate(l,g,b.options.easing,function(){if(h=="hide"){e.hide()}a.effects.restore(e,k);a.effects.removeWrapper(e);if(b.callback){b.callback.apply(e[0],arguments)}e.dequeue()})})}})(jQuery);;/*
 * jQuery UI Effects Highlight 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Highlight
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.highlight=function(b){return this.queue(function(){var d=a(this),c=["backgroundImage","backgroundColor","opacity"],f=a.effects.setMode(d,b.options.mode||"show"),e={backgroundColor:d.css("backgroundColor")};if(f=="hide"){e.opacity=0}a.effects.save(d,c);d.show().css({backgroundImage:"none",backgroundColor:b.options.color||"#ffff99"}).animate(e,{queue:false,duration:b.duration,easing:b.options.easing,complete:function(){(f=="hide"&&d.hide());a.effects.restore(d,c);(f=="show"&&!a.support.opacity&&this.style.removeAttribute("filter"));(b.callback&&b.callback.apply(this,arguments));d.dequeue()}})})}})(jQuery);;/*
 * jQuery UI Effects Pulsate 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Pulsate
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.pulsate=function(b){return this.queue(function(){var d=a(this),e=a.effects.setMode(d,b.options.mode||"show");times=((b.options.times||5)*2)-1;duration=b.duration?b.duration/2:a.fx.speeds._default/2,isVisible=d.is(":visible"),animateTo=0;if(!isVisible){d.css("opacity",0).show();animateTo=1}if((e=="hide"&&isVisible)||(e=="show"&&!isVisible)){times--}for(var c=0;c<times;c++){d.animate({opacity:animateTo},duration,b.options.easing);animateTo=(animateTo+1)%2}d.animate({opacity:animateTo},duration,b.options.easing,function(){if(animateTo==0){d.hide()}(b.callback&&b.callback.apply(this,arguments))});d.queue("fx",function(){d.dequeue()}).dequeue()})}})(jQuery);;/*
 * jQuery UI Effects Scale 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Scale
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.puff=function(b){return this.queue(function(){var f=a(this),g=a.effects.setMode(f,b.options.mode||"hide"),e=parseInt(b.options.percent,10)||150,d=e/100,c={height:f.height(),width:f.width()};a.extend(b.options,{fade:true,mode:g,percent:g=="hide"?e:100,from:g=="hide"?c:{height:c.height*d,width:c.width*d}});f.effect("scale",b.options,b.duration,b.callback);f.dequeue()})};a.effects.scale=function(b){return this.queue(function(){var g=a(this);var d=a.extend(true,{},b.options);var j=a.effects.setMode(g,b.options.mode||"effect");var h=parseInt(b.options.percent,10)||(parseInt(b.options.percent,10)==0?0:(j=="hide"?0:100));var i=b.options.direction||"both";var c=b.options.origin;if(j!="effect"){d.origin=c||["middle","center"];d.restore=true}var f={height:g.height(),width:g.width()};g.from=b.options.from||(j=="show"?{height:0,width:0}:f);var e={y:i!="horizontal"?(h/100):1,x:i!="vertical"?(h/100):1};g.to={height:f.height*e.y,width:f.width*e.x};if(b.options.fade){if(j=="show"){g.from.opacity=0;g.to.opacity=1}if(j=="hide"){g.from.opacity=1;g.to.opacity=0}}d.from=g.from;d.to=g.to;d.mode=j;g.effect("size",d,b.duration,b.callback);g.dequeue()})};a.effects.size=function(b){return this.queue(function(){var c=a(this),n=["position","top","left","width","height","overflow","opacity"];var m=["position","top","left","overflow","opacity"];var j=["width","height","overflow"];var p=["fontSize"];var k=["borderTopWidth","borderBottomWidth","paddingTop","paddingBottom"];var f=["borderLeftWidth","borderRightWidth","paddingLeft","paddingRight"];var g=a.effects.setMode(c,b.options.mode||"effect");var i=b.options.restore||false;var e=b.options.scale||"both";var o=b.options.origin;var d={height:c.height(),width:c.width()};c.from=b.options.from||d;c.to=b.options.to||d;if(o){var h=a.effects.getBaseline(o,d);c.from.top=(d.height-c.from.height)*h.y;c.from.left=(d.width-c.from.width)*h.x;c.to.top=(d.height-c.to.height)*h.y;c.to.left=(d.width-c.to.width)*h.x}var l={from:{y:c.from.height/d.height,x:c.from.width/d.width},to:{y:c.to.height/d.height,x:c.to.width/d.width}};if(e=="box"||e=="both"){if(l.from.y!=l.to.y){n=n.concat(k);c.from=a.effects.setTransition(c,k,l.from.y,c.from);c.to=a.effects.setTransition(c,k,l.to.y,c.to)}if(l.from.x!=l.to.x){n=n.concat(f);c.from=a.effects.setTransition(c,f,l.from.x,c.from);c.to=a.effects.setTransition(c,f,l.to.x,c.to)}}if(e=="content"||e=="both"){if(l.from.y!=l.to.y){n=n.concat(p);c.from=a.effects.setTransition(c,p,l.from.y,c.from);c.to=a.effects.setTransition(c,p,l.to.y,c.to)}}a.effects.save(c,i?n:m);c.show();a.effects.createWrapper(c);c.css("overflow","hidden").css(c.from);if(e=="content"||e=="both"){k=k.concat(["marginTop","marginBottom"]).concat(p);f=f.concat(["marginLeft","marginRight"]);j=n.concat(k).concat(f);c.find("*[width]").each(function(){child=a(this);if(i){a.effects.save(child,j)}var q={height:child.height(),width:child.width()};child.from={height:q.height*l.from.y,width:q.width*l.from.x};child.to={height:q.height*l.to.y,width:q.width*l.to.x};if(l.from.y!=l.to.y){child.from=a.effects.setTransition(child,k,l.from.y,child.from);child.to=a.effects.setTransition(child,k,l.to.y,child.to)}if(l.from.x!=l.to.x){child.from=a.effects.setTransition(child,f,l.from.x,child.from);child.to=a.effects.setTransition(child,f,l.to.x,child.to)}child.css(child.from);child.animate(child.to,b.duration,b.options.easing,function(){if(i){a.effects.restore(child,j)}})})}c.animate(c.to,{queue:false,duration:b.duration,easing:b.options.easing,complete:function(){if(c.to.opacity===0){c.css("opacity",c.from.opacity)}if(g=="hide"){c.hide()}a.effects.restore(c,i?n:m);a.effects.removeWrapper(c);if(b.callback){b.callback.apply(this,arguments)}c.dequeue()}})})}})(jQuery);;/*
 * jQuery UI Effects Shake 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Shake
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.shake=function(b){return this.queue(function(){var e=a(this),l=["position","top","left"];var k=a.effects.setMode(e,b.options.mode||"effect");var n=b.options.direction||"left";var c=b.options.distance||20;var d=b.options.times||3;var g=b.duration||b.options.duration||140;a.effects.save(e,l);e.show();a.effects.createWrapper(e);var f=(n=="up"||n=="down")?"top":"left";var p=(n=="up"||n=="left")?"pos":"neg";var h={},o={},m={};h[f]=(p=="pos"?"-=":"+=")+c;o[f]=(p=="pos"?"+=":"-=")+c*2;m[f]=(p=="pos"?"-=":"+=")+c*2;e.animate(h,g,b.options.easing);for(var j=1;j<d;j++){e.animate(o,g,b.options.easing).animate(m,g,b.options.easing)}e.animate(o,g,b.options.easing).animate(h,g/2,b.options.easing,function(){a.effects.restore(e,l);a.effects.removeWrapper(e);if(b.callback){b.callback.apply(this,arguments)}});e.queue("fx",function(){e.dequeue()});e.dequeue()})}})(jQuery);;/*
 * jQuery UI Effects Slide 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Slide
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.slide=function(b){return this.queue(function(){var e=a(this),d=["position","top","left"];var i=a.effects.setMode(e,b.options.mode||"show");var h=b.options.direction||"left";a.effects.save(e,d);e.show();a.effects.createWrapper(e).css({overflow:"hidden"});var f=(h=="up"||h=="down")?"top":"left";var c=(h=="up"||h=="left")?"pos":"neg";var j=b.options.distance||(f=="top"?e.outerHeight({margin:true}):e.outerWidth({margin:true}));if(i=="show"){e.css(f,c=="pos"?-j:j)}var g={};g[f]=(i=="show"?(c=="pos"?"+=":"-="):(c=="pos"?"-=":"+="))+j;e.animate(g,{queue:false,duration:b.duration,easing:b.options.easing,complete:function(){if(i=="hide"){e.hide()}a.effects.restore(e,d);a.effects.removeWrapper(e);if(b.callback){b.callback.apply(this,arguments)}e.dequeue()}})})}})(jQuery);;/*
 * jQuery UI Effects Transfer 1.8rc1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Transfer
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.transfer=function(b){return this.queue(function(){var f=a(this),h=a(b.options.to),e=h.offset(),g={top:e.top,left:e.left,height:h.innerHeight(),width:h.innerWidth()},d=f.offset(),c=a('<div class="ui-effects-transfer"></div>').appendTo(document.body).addClass(b.options.className).css({top:d.top,left:d.left,height:f.innerHeight(),width:f.innerWidth(),position:"absolute"}).animate(g,b.duration,b.options.easing,function(){c.remove();(b.callback&&b.callback.apply(f[0],arguments));f.dequeue()})})}})(jQuery);;$rdf = function() {
/**
* Utility functions for $rdf
 */

if (typeof isExtension == 'undefined') isExtension = false; // stand-alone library

if( typeof $rdf == 'undefined' ) {
    $rdf = {};
}

/**
* @class A utility class
 */

$rdf.log = {
    'debug':function(x) {return;},
    'warn':function(x) {return;},
    'info':function(x) {return;},
    'error':function(x) {return;},
    'success':function(x) {return;},
    'msg':function(x) {return;}
}

$rdf.Util = {
    /** A simple debugging function */         
    'output': function (o) {
	    var k = document.createElement('div')
	    k.textContent = o
	    document.body.appendChild(k)
	},
    /**
    * A standard way to add callback functionality to an object
     **
     ** Callback functions are indexed by a 'hook' string.
     **
     ** They return true if they want to be called again.
     **
     */
    'callbackify': function (obj,callbacks) {
	    obj.callbacks = {}
	    for (var x=callbacks.length-1; x>=0; x--) {
            obj.callbacks[callbacks[x]] = []
	    }
	    
	    obj.addHook = function (hook) {
            if (!obj.callbacks[hook]) { obj.callbacks[hook] = [] }
	    }
        
	    obj.addCallback = function (hook, func) {
            obj.callbacks[hook].push(func)
	    }
        
        obj.removeCallback = function (hook, funcName) {
            for (var i=0;i<obj.callbacks[hook].length;i++){
                //alert(obj.callbacks[hook][i].name);
                if (obj.callbacks[hook][i].name==funcName){
                    
                    obj.callbacks[hook].splice(i,1);
                    return true;
                }
            }
            return false; 
        }
        obj.insertCallback=function (hook,func){
            obj.callbacks[hook].unshift(func);
        }
	    obj.fireCallbacks = function (hook, args) {
            var newCallbacks = []
            var replaceCallbacks = []
            var len = obj.callbacks[hook].length
            //	    $rdf.log.info('!@$ Firing '+hook+' call back with length'+len);
            for (var x=len-1; x>=0; x--) {
                //		    $rdf.log.info('@@ Firing '+hook+' callback '+ obj.callbacks[hook][x])
                if (obj.callbacks[hook][x].apply(obj,args)) {
                    newCallbacks.push(obj.callbacks[hook][x])
                }
            }
            
            for (var x=newCallbacks.length-1; x>=0; x--) {
                replaceCallbacks.push(newCallbacks[x])
            }
            
            for (var x=len; x<obj.callbacks[hook].length; x++) {
                replaceCallbacks.push(obj.callbacks[hook][x])
            }
            
            obj.callbacks[hook] = replaceCallbacks
	    }
	},
    
    /**
    * A standard way to create XMLHttpRequest objects
     */
	'XMLHTTPFactory': function () {
        if (isExtension) {
            return Components.
            classes["@mozilla.org/xmlextras/xmlhttprequest;1"].
            createInstance().QueryInterface(Components.interfaces.nsIXMLHttpRequest);
        } else if (window.XMLHttpRequest) {
            try {
                return new XMLHttpRequest()
            } catch (e) {
                return false
            }
	    }
	    else if (window.ActiveXObject) {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP")
            } catch (e) {
                try {
                    return new ActiveXObject("Microsoft.XMLHTTP")
                } catch (e) {
                    return false
                }
            }
	    }
	    else {
            return false
	    }
	},

	'DOMParserFactory': function () {
        if(isExtension) {
            return Components.classes["@mozilla.org/xmlextras/domparser;1"]
            .getService(Components.interfaces.nsIDOMParser);
        } else if ( window.DOMParser ){
		    return new DOMParser();
        } else if ( window.ActiveXObject ) {
            return new ActiveXObject( "Microsoft.XMLDOM" );
        } else {
            return false;
	    }
	},
    /**
    * Returns a hash of headers and values
     */
	'getHTTPHeaders': function (xhr) {
	    var lines = xhr.getAllResponseHeaders().split("\n")
	    var headers = {}
	    var last = undefined
	    for (var x=0; x<lines.length; x++) {
            if (lines[x].length > 0) {
                var pair = lines[x].split(': ')
                if (typeof pair[1] == "undefined") { // continuation
                    headers[last] += "\n"+pair[0]
                } else {
                    last = pair[0].toLowerCase()
                    headers[last] = pair[1]
                }
            }
	    }
	    return headers
	},
    
    'dtstamp': function () {
	    var now = new Date();
	    var year  = now.getYear() + 1900;
	    var month = now.getMonth() + 1;
	    var day  = now.getDate() + 1;
	    var hour = now.getUTCHours();
	    var minute = now.getUTCMinutes();
	    var second = now.getSeconds();
	    if (month < 10) month = "0" + month;
	    if (day < 10) day = "0" + day;
	    if (hour < 10) hour = "0" + hour;
	    if (minute < 10) minute = "0" + minute;
	    if (second < 10) second = "0" + second;
	    return year + "-" + month + "-" + day + "T"
            + hour + ":" + minute + ":" + second + "Z";
	},
    
    'enablePrivilege': ((typeof netscape != 'undefined') && netscape.security.PrivilegeManager.enablePrivilege) || function() { return; },
    'disablePrivilege': ((typeof netscape != 'undefined') && netscape.security.PrivilegeManager.disablePrivilege) || function() { return; },



    'RDFArrayRemove': function(a, x) {  //removes all elements equal to x from a
        for(var i=0; i<a.length; i++) {
            //TODO: This used to be the following, which didnt always work..why
            //if(a[i] == x)
            if (a[i].subject.sameTerm( x.subject ) && 
                a[i].predicate.sameTerm( x.predicate ) && 
                a[i].object.sameTerm( x.object ) &&
                a[i].why.sameTerm( x.why )) {
                a.splice(i,1);
                return;
            }
        }
        throw "RDFArrayRemove: Array did not contain " + x;
    },

    'string_startswith': function(str, pref) { // missing library routines
        return (str.slice(0, pref.length) == pref);
    },

    'AJAR_handleNewTerm': function(kb, p, requestedBy) {
        var sf = null;
        if( typeof tabulator != 'undefined' ) {
            sf = tabulator.sf;
        } else {
            return;
        }
        if (p.termType != 'symbol') return;
        var docuri = $rdf.Util.uri.docpart(p.uri);
        var fixuri;
        if (p.uri.indexOf('#') < 0) { // No hash
            
            // @@ major hack for dbpedia Categories, which spred indefinitely
            if ($rdf.Util.string_startswith(p.uri, 'http://dbpedia.org/resource/Category:')) return;  
            
            /*
              if (string_startswith(p.uri, 'http://xmlns.com/foaf/0.1/')) {
              fixuri = "http://dig.csail.mit.edu/2005/ajar/ajaw/test/foaf"
              // should give HTTP 303 to ontology -- now is :-)
              } else
            */
            if ($rdf.Util.string_startswith(p.uri, 'http://purl.org/dc/elements/1.1/')
                || $rdf.Util.string_startswith(p.uri, 'http://purl.org/dc/terms/')) {
                fixuri = "http://dublincore.org/2005/06/13/dcq";
                //dc fetched multiple times
            } else if ($rdf.Util.string_startswith(p.uri, 'http://xmlns.com/wot/0.1/')) {
            fixuri = "http://xmlns.com/wot/0.1/index.rdf";
            } else if ($rdf.Util.string_startswith(p.uri, 'http://web.resource.org/cc/')) {
                //            $rdf.log.warn("creative commons links to html instead of rdf. doesn't seem to content-negotiate.");
                fixuri = "http://web.resource.org/cc/schema.rdf";
            }
        }
        if (fixuri) {
            docuri = fixuri
        }
        if (sf && sf.getState(docuri) != 'unrequested') return;
        
        if (fixuri) {   // only give warning once: else happens too often
            $rdf.log.warn("Assuming server still broken, faking redirect of <" + p.uri +
                               "> to <" + docuri + ">")	
                }
        sf.requestURI(docuri, requestedBy);
    }, //AJAR_handleNewTerm
    'ArrayIndexOf': function(arr, item, i) {
        i || (i = 0);
        var length = arr.length;
        if (i < 0) i = length + i;
        for (; i < length; i++)
            if (arr[i] === item) return i;
        return -1;
    }
    
};

//////////////////////String Utility
$rdf.Util.string = {
    //C++, python style %s -> subs
    'template': function(base, subs){
        var baseA = base.split("%s");
        var result = "";
        for (var i=0;i<subs.length;i++){
            subs[i] += '';
            result += baseA[i] + subs[i];
        }
        return result + baseA.slice(subs.length).join(); 
    }
};



//  Implementing URI-specific functions
//
//	See RFC 2386
//
// This is or was   http://www.w3.org/2005/10/ajaw/uri.js
// 2005 W3C open source licence
//
//
//  Take a URI given in relative or absolute form and a base
//  URI, and return an absolute URI
//
//  See also http://www.w3.org/2000/10/swap/uripath.py
//

if (typeof $rdf.Util.uri == "undefined") { $rdf.Util.uri = {}; };

$rdf.Util.uri.join = function (given, base) {
    // if (typeof $rdf.log.debug != 'undefined') $rdf.log.debug("   URI given="+given+" base="+base)
    var baseHash = base.indexOf('#')
    if (baseHash > 0) base = base.slice(0, baseHash)
    if (given.length==0) return base // before chopping its filename off
    if (given.indexOf('#')==0) return base + given
    var colon = given.indexOf(':')
    if (colon >= 0) return given	// Absolute URI form overrides base URI
    var baseColon = base.indexOf(':')
    if (base == "") return given;
    if (baseColon < 0) {
        alert("Invalid base: "+ base + ' in join with ' +given);
        return given
    }
    var baseScheme = base.slice(0,baseColon+1)  // eg http:
    if (given.indexOf("//") == 0)     // Starts with //
	return baseScheme + given;
    if (base.indexOf('//', baseColon)==baseColon+1) {  // Any hostpart?
	    var baseSingle = base.indexOf("/", baseColon+3)
	if (baseSingle < 0) {
	    if (base.length-baseColon-3 > 0) {
		return base + "/" + given
	    } else {
		return baseScheme + given
	    }
	}
    } else {
	var baseSingle = base.indexOf("/", baseColon+1)
	if (baseSingle < 0) {
	    if (base.length-baseColon-1 > 0) {
		return base + "/" + given
	    } else {
		return baseScheme + given
	    }
	}
    }

    if (given.indexOf('/') == 0)	// starts with / but not //
	return base.slice(0, baseSingle) + given
    
    var path = base.slice(baseSingle)
    var lastSlash = path.lastIndexOf("/")
    if (lastSlash <0) return baseScheme + given
    if ((lastSlash >=0) && (lastSlash < (path.length-1)))
	path = path.slice(0, lastSlash+1) // Chop trailing filename from base
    
    path = path + given
    while (path.match(/[^\/]*\/\.\.\//)) // must apply to result of prev
	path = path.replace( /[^\/]*\/\.\.\//, '') // ECMAscript spec 7.8.5
    path = path.replace( /\.\//g, '') // spec vague on escaping
    path = path.replace( /\/\.$/, '/' )
    return base.slice(0, baseSingle) + path
}

if (isExtension) {
    $rdf.Util.uri.join2 = function (given, base){
        var tIOService = Components.classes['@mozilla.org/network/io-service;1']
                        .getService(Components.interfaces.nsIIOService);

        var baseURI = tIOService.newURI(base, null, null);
        return tIOService.newURI(baseURI.resolve(given), null, null).spec;
    }
} else
    $rdf.Util.uri.join2 = $rdf.Util.uri.join;
    
//  refTo:    Make a URI relative to a given base
//
// based on code in http://www.w3.org/2000/10/swap/uripath.py
//
$rdf.Util.uri.commonHost = new RegExp("^[-_a-zA-Z0-9.]+:(//[^/]*)?/[^/]*$");
$rdf.Util.uri.refTo = function(base, uri) {
    if (!base) return uri;
    if (base == uri) return "";
    var i =0; // How much are they identical?
    while (i<uri.length && i < base.length)
        if (uri[i] == base[i]) i++;
        else break;
    if (base.slice(0,i).match($rdf.Util.uri.commonHost)) {
        var k = uri.indexOf('//');
        if (k<0) k=-2; // no host
        var l = uri.indexOf('/', k+2);   // First *single* slash
        if (uri.slice(l+1, l+2) != '/' && base.slice(l+1, l+2) != '/'
                           && uri.slice(0,l) == base.slice(0,l)) // common path to single slash
            return uri.slice(l); // but no other common path segments
    }
     // fragment of base?
    if (uri.slice(i, i+1) == '#' && base.length == i) return uri.slice(i);
    while (i>0 && uri[i-1] != '/') i--;

    if (i<3) return uri; // No way
    if ((base.indexOf('//', i-2) > 0) || uri.indexOf('//', i-2) > 0)
        return uri; // an unshared '//'
    if (base.indexOf(':', i) >0) return uri; // unshared ':'
    var n = 0;
    for (var j=i; j<base.length; j++) if (base[j]=='/') n++;
    if (n==0 && i < uri.length && uri[i] =='#') return './' + uri.slice(i);
    if (n==0 && i == uri.length) return './';
    var str = '';
    for (var j=0; j<n; j++) str+= '../';
    return str + uri.slice(i);
}


/** returns URI without the frag **/
$rdf.Util.uri.docpart = function (uri) {
    var i = uri.indexOf("#")
    if (i < 0) return uri
    return uri.slice(0,i)
} 

/** return the protocol of a uri **/
/** return null if there isn't one **/
$rdf.Util.uri.protocol = function (uri) {
    var index = uri.indexOf(':');
    if (index >= 0)
        return uri.slice(0, index);
    else
        return null;
} //protocol

//ends
// These are the classes corresponding to the RDF and N3 data models
//
// Designed to look like rdflib and cwm designs.
//
// Issues: Should the names start with RDF to make them
//      unique as program-wide symbols?
//
// W3C open source licence 2005.
//

//	Symbol

$rdf.Empty = function() {
	return this;
};

$rdf.Empty.prototype.termType = 'empty';
$rdf.Empty.prototype.toString = function () { return "()" };
$rdf.Empty.prototype.toNT = function () { return "@@" };

$rdf.Symbol = function( uri ) {
    this.uri = uri;
    this.value = uri;
    return this;
}

$rdf.Symbol.prototype.termType = 'symbol';
$rdf.Symbol.prototype.toString = function () { return ("<" + this.uri + ">"); };
$rdf.Symbol.prototype.toNT = $rdf.Symbol.prototype.toString;

//  Some precalculated symbols
$rdf.Symbol.prototype.XSDboolean = new $rdf.Symbol('http://www.w3.org/2001/XMLSchema#boolean');
$rdf.Symbol.prototype.integer = new $rdf.Symbol('http://www.w3.org/2001/XMLSchema#integer');

//	Blank Node

$rdf.NextId = 0;  // Global genid
$rdf.NTAnonymousNodePrefix = "_:n";

$rdf.BlankNode = function ( id ) {
    /*if (id)
    	this.id = id;
    else*/
    this.id = $rdf.NextId++
    this.value = id ? id : this.id.toString();
    return this
};

$rdf.BlankNode.prototype.termType = 'bnode';
$rdf.BlankNode.prototype.toNT = function() {
    return $rdf.NTAnonymousNodePrefix + this.id
};
$rdf.BlankNode.prototype.toString = $rdf.BlankNode.prototype.toNT;

//	Literal

$rdf.Literal= function (value, lang, datatype) {
    this.value = value
    this.lang=lang;	  // string
    this.datatype=datatype;  // term
    return this;
}

$rdf.Literal.prototype.termType = 'literal'    
$rdf.Literal.prototype.toString = function() {
    return ''+this.value;
};
$rdf.Literal.prototype.toNT = function() {
    var str = this.value
    if (typeof str != 'string') {
        if (typeof str == 'number') return ''+str;
	throw Error("Value of RDF literal is not string: "+str)
    }
    str = str.replace(/\\/g, '\\\\');  // escape
    str = str.replace(/\"/g, '\\"');
    str = '"' + str + '"'  //';

    if (this.datatype){
        str = str + '^^' + this.datatype;//.toNT()
    }
    if (this.lang) {
        str = str + "@" + this.lang;
    }
    return str;
};

$rdf.Collection = function() {
    this.id = $rdf.NextId++;
    this.elements = [];
    this.closed = false;
};

$rdf.Collection.prototype.termType = 'collection';

$rdf.Collection.prototype.toNT = function() {
    return $rdf.NTAnonymousNodePrefix + this.id
};

$rdf.Collection.prototype.toString = $rdf.Collection.prototype.toNT ;

$rdf.Collection.prototype.append = function (el) {
    this.elements.push(el)
}
$rdf.Collection.prototype.unshift=function(el){
    this.elements.unshift(el);
}
$rdf.Collection.prototype.shift=function(){
    return this.elements.shift();
}
        
$rdf.Collection.prototype.close = function () {
    this.closed = true
}

//	Statement
//
//  This is a triple with an optional reason.
//
//   The reason can point to provenece or inference
//

$rdf.Statement = function(subject, predicate, object, why) {

//takes in an object and makes it an object if it's a literal
    var makeTerm = function makeTerm(val) {
        //  $rdf.log.debug("Making term from " + val)
        if (typeof val == 'object') return val;
        if (typeof val == 'string') return new $rdf.Literal(val);
        if (typeof val == 'number') return new $rdf.Literal(val); // @@ differet types
        if (typeof val == 'boolean') return new $rdf.Literal(val?"1":"0", undefined, 
                                                           $rdf.Symbol.prototype.XSDboolean);
        if (typeof val == 'undefined') return undefined;
        alert("Can't make term from " + val + " of type " + typeof val);
    }

    this.subject = makeTerm(subject)
    this.predicate = makeTerm(predicate)
    this.object = makeTerm(object)
    if (typeof why !='undefined') {
        this.why = why;
    }
    return this;
}

$rdf.Statement.prototype.toNT = function() {
    return (this.subject.toNT() + " "
            + this.predicate.toNT() + " "
            +  this.object.toNT() +" .");
};

$rdf.Statement.prototype.toString = $rdf.Statement.prototype.toNT;

//	Formula
//
//	Set of statements.

$rdf.Formula = function() {
    this.statements = []
    this.constraints = []
    this.initBindings = []
    this.optional = []
    this.superFormula = null;
    return this;
};


$rdf.Formula.prototype.termType = 'formula';
$rdf.Formula.prototype.toNT = function() {
    return "{" + this.statements.join('\n') + "}"
};
$rdf.Formula.prototype.toString = $rdf.Formula.prototype.toNT;

$rdf.Formula.prototype.add = function(subj, pred, obj, why) {
    this.statements.push(new $rdf.Statement(subj, pred, obj, why))
}

// Convenience methods on a formula allow the creation of new RDF terms:

$rdf.Formula.prototype.sym = function(uri,name) {
    if (name != null) {
        if (!$rdf.ns[uri]) throw 'The prefix "'+uri+'" is not set in the API';
        uri = $rdf.ns[uri] + name
    }
    return new $rdf.Symbol(uri)
}

$rdf.Formula.prototype.literal = function(val, lang, dt) {
    return new $rdf.Literal(val.toString(), lang, dt)
}

$rdf.Formula.prototype.bnode = function(id) {
    return new $rdf.BlankNode(id)
}

$rdf.Formula.prototype.formula = function() {
    return new $rdf.Formula()
}

$rdf.Formula.prototype.collection = function () { // obsolete
    return new $rdf.Collection()
}

$rdf.Formula.prototype.list = function (values) {
    li = new $rdf.Collection();
    if (values) {
        for(var i = 0; i<values.length; i++) {
            li.append(values[i]);
        }
    }
    return li;
}

$rdf.Formula.instances={};
$rdf.Formula.prototype.registerFormula = function(accesskey){
    var superFormula = this.superFormula || this;
    $rdf.Formula.instances[accesskey] = this;
    var formulaTerm = superFormula.bnode();
    superFormula.add(formulaTerm, this.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),superFormula.sym("http://www.w3.org/2000/10/swap/log#Formula"));
    superFormula.add(formulaTerm, this.sym("http://xmlns.com/foaf/0.1/name"), superFormula.literal(accesskey));
    superFormula.add(formulaTerm, this.sym("http://www.w3.org/2007/ont/link#accesskey"), superFormula.literal(accesskey));
}


/*  Variable
**
** Variables are placeholders used in patterns to be matched.
** In cwm they are symbols which are the formula's list of quantified variables.
** In sparl they are not visibily URIs.  Here we compromise, by having
** a common special base URI for variables.
*/

$rdf.Variable = function(rel) {
    this.base = "varid:"; // We deem variabe x to be the symbol varid:x 
    this.uri = $rdf.Util.uri.join(rel, this.base);
    return this;
}

$rdf.Variable.prototype.termType = 'variable';
$rdf.Variable.prototype.toNT = function() {
    if (this.uri.slice(0, this.base.length) == this.base) {
	return '?'+ this.uri.slice(this.base.length);} // @@ poor man's refTo
    return '?' + this.uri;
};

$rdf.Variable.prototype.toString = $rdf.Variable.prototype.toNT;
$rdf.Variable.prototype.classOrder = 7;

$rdf.Formula.prototype.variable = function(name) {
    return new $rdf.Variable(name);
};

$rdf.Variable.prototype.hashString = $rdf.Variable.prototype.toNT;


// The namespace function generator 

$rdf.Namespace = function (nsuri) {
    return function(ln) { return new $rdf.Symbol(nsuri+(ln===undefined?'':ln)) }
}

$rdf.Formula.prototype.ns = function(nsuri) {
    return function(ln) { return new $rdf.Symbol(nsuri+(ln===undefined?'':ln)) }
}


// Parse a single token
//
// The bnode bit should not be used on program-external values; designed
// for internal work such as storing a bnode id in an HTML attribute.
// Not coded for literals.

$rdf.Formula.prototype.fromNT = function(str) {
    var len = str.length
    var ch = str.slice(0,1)
    if (ch == '<') return this.sym(str.slice(1,len-1))
    if (ch == '_') {
	var x = new $rdf.BlankNode();
	x.id = parseInt(str.slice(3));
	$rdf.NextId--
	return x
    }
    throw "Can't convert from NT"+str;
    
}

// ends
// Matching a statement against a formula
//
//
// W3C open source licence 2005.
//
// We retpresent a set as an associative array whose value for
// each member is set to true.


$rdf.Symbol.prototype.sameTerm = function(other) {
    if (!other) { return false }
    return ((this.termType == other.termType) && (this.uri == other.uri))
}

$rdf.BlankNode.prototype.sameTerm = function(other) {
    if (!other) { return false }
    return ((this.termType == other.termType) && (this.id == other.id))
}

$rdf.Literal.prototype.sameTerm = function(other) {
    if (!other) { return false }
    return ((this.termType == other.termType)
	    && (this.value == other.value)
	    && (this.lang == other.lang) &&
	    ((!this.datatype && !other.datatype)
	     || (this.datatype && this.datatype.sameTerm(other.datatype))))
}

$rdf.Variable.prototype.sameTerm = function (other) {
    if (!other) { return false }
    return((this.termType == other.termType) && (this.uri == other.uri))
}

$rdf.Collection.prototype.sameTerm = $rdf.BlankNode.prototype.sameTerm

$rdf.Formula.prototype.sameTerm = function (other) {
    return this.hashString() == other.hashString();
}
//  Comparison for ordering
//
// These compare with ANY term
//
//
// When we smush nodes we take the lowest value. This is not
// arbitrary: we want the value actually used to be the literal
// (or list or formula). 

$rdf.Literal.prototype.classOrder = 1
$rdf.Collection.prototype.classOrder = 3
$rdf.Formula.prototype.classOrder = 4
$rdf.Symbol.prototype.classOrder = 5
$rdf.BlankNode.prototype.classOrder = 6

//  Compaisons return  sign(self - other)
//  Literals must come out before terms for smushing

$rdf.Literal.prototype.compareTerm = function(other) {
    if (this.classOrder < other.classOrder) return -1
    if (this.classOrder > other.classOrder) return +1
    if (this.value < other.value) return -1
    if (this.value > other.value) return +1
    return 0
} 

$rdf.Symbol.prototype.compareTerm = function(other) {
    if (this.classOrder < other.classOrder) return -1
    if (this.classOrder > other.classOrder) return +1
    if (this.uri < other.uri) return -1
    if (this.uri > other.uri) return +1
    return 0
} 

$rdf.BlankNode.prototype.compareTerm = function(other) {
    if (this.classOrder < other.classOrder) return -1
    if (this.classOrder > other.classOrder) return +1
    if (this.id < other.id) return -1
    if (this.id > other.id) return +1
    return 0
} 

$rdf.Collection.prototype.compareTerm = $rdf.BlankNode.prototype.compareTerm

//  Convenience routines

// Only one of s p o can be undefined, and w is optional.
$rdf.Formula.prototype.each = function(s,p,o,w) {
    var results = []
    var st, sts = this.statementsMatching(s,p,o,w,false)
    var i, n=sts.length
    if (typeof s == 'undefined') {
	for (i=0; i<n; i++) {st=sts[i]; results.push(st.subject)}
    } else if (typeof p == 'undefined') {
	for (i=0; i<n; i++) {st=sts[i]; results.push(st.predicate)}
    } else if (typeof o == 'undefined') {
	for (i=0; i<n; i++) {st=sts[i]; results.push(st.object)}
    } else if (typeof w == 'undefined') {
	for (i=0; i<n; i++) {st=sts[i]; results.push(st.why)}
    }
    return results
}

$rdf.Formula.prototype.any = function(s,p,o,w) {
    var st = this.anyStatementMatching(s,p,o,w)
    if (typeof st == 'undefined') return undefined;
    
    if (typeof s == 'undefined') return st.subject;
    if (typeof p == 'undefined') return st.predicate;
    if (typeof o == 'undefined') return st.object;

    return undefined
}

$rdf.Formula.prototype.the = function(s,p,o,w) {
    // the() should contain a check there is only one
    var x = this.any(s,p,o,w)
    if (typeof x == 'undefined')
	$rdf.log.error("No value found for the(){" + s + " " + p + " " + o + "}.")
    return x
}

$rdf.Formula.prototype.whether = function(s,p,o,w) {
    return this.statementsMatching(s,p,o,w,false).length;
}
/**
 * @fileoverview
 * TABULATOR RDF PARSER
 *
 * Version 0.1
 *  Parser believed to be in full positive RDF/XML parsing compliance
 *  with the possible exception of handling deprecated RDF attributes
 *  appropriately. Parser is believed to comply fully with other W3C
 *  and industry standards where appropriate (DOM, ECMAScript, &c.)
 *
 *  Author: David Sheets <dsheets@mit.edu>
 *  SVN ID: $Id$
 *
 * W3C® SOFTWARE NOTICE AND LICENSE
 * http://www.w3.org/Consortium/Legal/2002/copyright-software-20021231
 * This work (and included software, documentation such as READMEs, or
 * other related items) is being provided by the copyright holders under
 * the following license. By obtaining, using and/or copying this work,
 * you (the licensee) agree that you have read, understood, and will
 * comply with the following terms and conditions.
 * 
 * Permission to copy, modify, and distribute this software and its
 * documentation, with or without modification, for any purpose and
 * without fee or royalty is hereby granted, provided that you include
 * the following on ALL copies of the software and documentation or
 * portions thereof, including modifications:
 * 
 * 1. The full text of this NOTICE in a location viewable to users of
 * the redistributed or derivative work.
 * 2. Any pre-existing intellectual property disclaimers, notices, or terms and
 * conditions. If none exist, the W3C Software Short Notice should be
 * included (hypertext is preferred, text is permitted) within the body
 * of any redistributed or derivative code.
 * 3. Notice of any changes or modifications to the files, including the
 * date changes were made. (We recommend you provide URIs to the location
 * from which the code is derived.)
 * 
 * THIS SOFTWARE AND DOCUMENTATION IS PROVIDED "AS IS," AND COPYRIGHT
 * HOLDERS MAKE NO REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO, WARRANTIES OF MERCHANTABILITY OR FITNESS
 * FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE SOFTWARE OR
 * DOCUMENTATION WILL NOT INFRINGE ANY THIRD PARTY PATENTS, COPYRIGHTS,
 * TRADEMARKS OR OTHER RIGHTS.
 * 
 * COPYRIGHT HOLDERS WILL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL
 * OR CONSEQUENTIAL DAMAGES ARISING OUT OF ANY USE OF THE SOFTWARE OR
 * DOCUMENTATION.
 * 
 * The name and trademarks of copyright holders may NOT be used in
 * advertising or publicity pertaining to the software without specific,
 * written prior permission. Title to copyright in this software and any
 * associated documentation will at all times remain with copyright
 * holders.
 */
/**
 * @class Class defining an RDFParser resource object tied to an RDFStore
 *  
 * @author David Sheets <dsheets@mit.edu>
 * @version 0.1
 * 
 * @constructor
 * @param {RDFStore} store An RDFStore object
 */
$rdf.RDFParser = function (store) {
    var RDFParser = {};

    /** Standard namespaces that we know how to handle @final
     *  @member RDFParser
     */
    RDFParser['ns'] = {'RDF':
		       "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
		       'RDFS':
		       "http://www.w3.org/2000/01/rdf-schema#"}
    /** DOM Level 2 node type magic numbers @final
     *  @member RDFParser
     */
    RDFParser['nodeType'] = {'ELEMENT': 1, 'ATTRIBUTE': 2, 'TEXT': 3,
			     'CDATA_SECTION': 4, 'ENTITY_REFERENCE': 5,
			     'ENTITY': 6, 'PROCESSING_INSTRUCTION': 7,
			     'COMMENT': 8, 'DOCUMENT': 9, 'DOCUMENT_TYPE': 10,
			     'DOCUMENT_FRAGMENT': 11, 'NOTATION': 12}

    /**
     * Frame class for namespace and base URI lookups
     * Base lookups will always resolve because the parser knows
     * the default base.
     *
     * @private
     */
    this['frameFactory'] = function (parser, parent, element) {
	return {'NODE': 1,
		'ARC': 2,
		'parent': parent,
		'parser': parser,
		'store': parser['store'],
		'element': element,
		'lastChild': 0,
		'base': null,
		'lang': null,
		'node': null,
		'nodeType': null,
		'listIndex': 1,
		'rdfid': null,
		'datatype': null,
		'collection': false,

	/** Terminate the frame and notify the store that we're done */
		'terminateFrame': function () {
		    if (this['collection']) {
			this['node']['close']()
		    }
		},
	
	/** Add a symbol of a certain type to the this frame */
		'addSymbol': function (type, uri) {
		    uri = $rdf.Util.uri.join(uri, this['base'])
		    this['node'] = this['store']['sym'](uri)
		    this['nodeType'] = type
		},
	
	/** Load any constructed triples into the store */
		'loadTriple': function () {
		    if (this['parent']['parent']['collection']) {
			this['parent']['parent']['node']['append'](this['node'])
		    }
		    else {
			this['store']['add'](this['parent']['parent']['node'],
				       this['parent']['node'],
				       this['node'],
				       this['parser']['why'])
		    }
		    if (this['parent']['rdfid'] != null) { // reify
			var triple = this['store']['sym'](
			    $rdf.Util.uri.join("#"+this['parent']['rdfid'],
					  this['base']))
			this['store']['add'](triple,
					     this['store']['sym'](
						 RDFParser['ns']['RDF']
						     +"type"),
					     this['store']['sym'](
						 RDFParser['ns']['RDF']
						     +"Statement"),
					     this['parser']['why'])
			this['store']['add'](triple,
					     this['store']['sym'](
						 RDFParser['ns']['RDF']
						     +"subject"),
					     this['parent']['parent']['node'],
					     this['parser']['why'])
			this['store']['add'](triple,
					     this['store']['sym'](
						 RDFParser['ns']['RDF']
						     +"predicate"),
					     this['parent']['node'],
					     this['parser']['why'])
			this['store']['add'](triple,
					     this['store']['sym'](
						 RDFParser['ns']['RDF']
						     +"object"),
					     this['node'],
					     this['parser']['why'])
		    }
		},

	/** Check if it's OK to load a triple */
		'isTripleToLoad': function () {
		    return (this['parent'] != null
			    && this['parent']['parent'] != null
			    && this['nodeType'] == this['NODE']
			    && this['parent']['nodeType'] == this['ARC']
			    && this['parent']['parent']['nodeType']
			    == this['NODE'])
		},

	/** Add a symbolic node to this frame */
		'addNode': function (uri) {
		    this['addSymbol'](this['NODE'],uri)
		    if (this['isTripleToLoad']()) {
			this['loadTriple']()
		    }
		},

	/** Add a collection node to this frame */
		'addCollection': function () {
		    this['nodeType'] = this['NODE']
		    this['node'] = this['store']['collection']()
		    this['collection'] = true
		    if (this['isTripleToLoad']()) {
			this['loadTriple']()
		    }
		},

	/** Add a collection arc to this frame */
		'addCollectionArc': function () {
		    this['nodeType'] = this['ARC']
		},

	/** Add a bnode to this frame */
		'addBNode': function (id) {
		    if (id != null) {
			if (this['parser']['bnodes'][id] != null) {
			    this['node'] = this['parser']['bnodes'][id]
			} else {
			    this['node'] = this['parser']['bnodes'][id] = this['store']['bnode']()
			}
		    } else { this['node'] = this['store']['bnode']() }
		    
		    this['nodeType'] = this['NODE']
		    if (this['isTripleToLoad']()) {
			this['loadTriple']()
		    }
		},

	/** Add an arc or property to this frame */
		'addArc': function (uri) {
		    if (uri == RDFParser['ns']['RDF']+"li") {
			uri = RDFParser['ns']['RDF']+"_"+this['parent']['listIndex']++
		    }
		    this['addSymbol'](this['ARC'], uri)
		},

	/** Add a literal to this frame */
		'addLiteral': function (value) {
		    if (this['parent']['datatype']) {
			this['node'] = this['store']['literal'](
			    value, "", this['store']['sym'](
				this['parent']['datatype']))
		    }
		    else {
			this['node'] = this['store']['literal'](
			    value, this['lang'])
		    }
		    this['nodeType'] = this['NODE']
		    if (this['isTripleToLoad']()) {
			this['loadTriple']()
		    }
		}
	       }
    }

    //from the OpenLayers source .. needed to get around IE problems.
    this['getAttributeNodeNS'] = function(node, uri, name) {
        var attributeNode = null;
        if(node.getAttributeNodeNS) {
            attributeNode = node.getAttributeNodeNS(uri, name);
        } else {
            var attributes = node.attributes;
            var potentialNode, fullName;
            for(var i=0; i<attributes.length; ++i) {
                potentialNode = attributes[i];
                if(potentialNode.namespaceURI == uri) {
                    fullName = (potentialNode.prefix) ?
                               (potentialNode.prefix + ":" + name) : name;
                    if(fullName == potentialNode.nodeName) {
                        attributeNode = potentialNode;
                        break;
                    }
                }
            }
        }
        return attributeNode;
    }

    /** Our triple store reference @private */
    this['store'] = store
    /** Our identified blank nodes @private */
    this['bnodes'] = {}
    /** A context for context-aware stores @private */
    this['why'] = null
    /** Reification flag */
    this['reify'] = false

    /**
     * Build our initial scope frame and parse the DOM into triples
     * @param {DOMTree} document The DOM to parse
     * @param {String} base The base URL to use 
     * @param {Object} why The context to which this resource belongs
     */
    this['parse'] = function (document, base, why) {
        // alert('parse base:'+base);
	var children = document['childNodes']

	// clean up for the next run
	this['cleanParser']()

	// figure out the root element
	//var root = document.documentElement; //this is faster, I think, cross-browser issue? well, DOM 2
	if (document['nodeType'] == RDFParser['nodeType']['DOCUMENT']) {
	    for (var c=0; c<children['length']; c++) {
		if (children[c]['nodeType']
		    == RDFParser['nodeType']['ELEMENT']) {
		    var root = children[c]
		    break
		}
	    }	    
	}
	else if (document['nodeType'] == RDFParser['nodeType']['ELEMENT']) {
	    var root = document
	}
	else {
	    throw new Error("RDFParser: can't find root in " + base
			    + ". Halting. ")
	    return false
	}
	
	this['why'] = why
        

	// our topmost frame

	var f = this['frameFactory'](this)
        this['base'] = base
	f['base'] = base
	f['lang'] = ''
	
	this['parseDOM'](this['buildFrame'](f,root))
	return true
    }
    this['parseDOM'] = function (frame) {
	// a DOM utility function used in parsing
	var elementURI = function (el) {
        var result = "";
            if (el['namespaceURI'] == null) {
                throw new Error("RDF/XML syntax error: No namespace for "
                            +el['localName']+" in "+this.base)
            }
        if( el['namespaceURI'] ) {
            result = result + el['namespaceURI'];
        }
        if( el['localName'] ) {
            result = result + el['localName'];
        } else if( el['nodeName'] ) {
            if(el['nodeName'].indexOf(":")>=0)
                result = result + el['nodeName'].split(":")[1];
            else
                result = result + el['nodeName'];
        }
	    return result;
	}
	var dig = true // if we'll dig down in the tree on the next iter

	while (frame['parent']) {
	    var dom = frame['element']
	    var attrs = dom['attributes']

	    if (dom['nodeType']
		== RDFParser['nodeType']['TEXT']
		|| dom['nodeType']
		== RDFParser['nodeType']['CDATA_SECTION']) {//we have a literal
		frame['addLiteral'](dom['nodeValue'])
	    }
	    else if (elementURI(dom)
		     != RDFParser['ns']['RDF']+"RDF") { // not root
		if (frame['parent'] && frame['parent']['collection']) {
		    // we're a collection element
		    frame['addCollectionArc']()
		    frame = this['buildFrame'](frame,frame['element'])
		    frame['parent']['element'] = null
		}
                if (!frame['parent'] || !frame['parent']['nodeType']
		    || frame['parent']['nodeType'] == frame['ARC']) {
		    // we need a node
            var about =this['getAttributeNodeNS'](dom,
			RDFParser['ns']['RDF'],"about")
		    var rdfid =this['getAttributeNodeNS'](dom,
			RDFParser['ns']['RDF'],"ID")
		    if (about && rdfid) {
			throw new Error("RDFParser: " + dom['nodeName']
					+ " has both rdf:id and rdf:about."
					+ " Halting. Only one of these"
					+ " properties may be specified on a"
					+ " node.");
		    }
		    if (about == null && rdfid) {
			frame['addNode']("#"+rdfid['nodeValue'])
			dom['removeAttributeNode'](rdfid)
		    }
		    else if (about == null && rdfid == null) {
                var bnid = this['getAttributeNodeNS'](dom,
			    RDFParser['ns']['RDF'],"nodeID")
			if (bnid) {
			    frame['addBNode'](bnid['nodeValue'])
			    dom['removeAttributeNode'](bnid)
			} else { frame['addBNode']() }
		    }
		    else {
			frame['addNode'](about['nodeValue'])
			dom['removeAttributeNode'](about)
		    }
		
		    // Typed nodes
		    var rdftype = this['getAttributeNodeNS'](dom,
			RDFParser['ns']['RDF'],"type")
		    if (RDFParser['ns']['RDF']+"Description"
			!= elementURI(dom)) {
			rdftype = {'nodeValue': elementURI(dom)}
		    }
		    if (rdftype != null) {
			this['store']['add'](frame['node'],
					     this['store']['sym'](
						 RDFParser['ns']['RDF']+"type"),
					     this['store']['sym'](
						 $rdf.Util.uri.join(
						     rdftype['nodeValue'],
						     frame['base'])),
					     this['why'])
			if (rdftype['nodeName']){
			    dom['removeAttributeNode'](rdftype)
			}
		    }
		    
		    // Property Attributes
		    for (var x = attrs['length']-1; x >= 0; x--) {
			this['store']['add'](frame['node'],
					     this['store']['sym'](
						 elementURI(attrs[x])),
					     this['store']['literal'](
						 attrs[x]['nodeValue'],
						 frame['lang']),
					     this['why'])
		    }
		}
		else { // we should add an arc (or implicit bnode+arc)
		    frame['addArc'](elementURI(dom))

		    // save the arc's rdf:ID if it has one
		    if (this['reify']) {
            var rdfid = this['getAttributeNodeNS'](dom,
			    RDFParser['ns']['RDF'],"ID")
			if (rdfid) {
			    frame['rdfid'] = rdfid['nodeValue']
			    dom['removeAttributeNode'](rdfid)
			}
		    }

		    var parsetype = this['getAttributeNodeNS'](dom,
			RDFParser['ns']['RDF'],"parseType")
		    var datatype = this['getAttributeNodeNS'](dom,
			RDFParser['ns']['RDF'],"datatype")
		    if (datatype) {
			frame['datatype'] = datatype['nodeValue']
			dom['removeAttributeNode'](datatype)
		    }

		    if (parsetype) {
			var nv = parsetype['nodeValue']
			if (nv == "Literal") {
			    frame['datatype']
				= RDFParser['ns']['RDF']+"XMLLiteral"
			    // (this.buildFrame(frame)).addLiteral(dom)
			    // should work but doesn't
			    frame = this['buildFrame'](frame)
			    frame['addLiteral'](dom)
			    dig = false
			}
			else if (nv == "Resource") {
			    frame = this['buildFrame'](frame,frame['element'])
			    frame['parent']['element'] = null
			    frame['addBNode']()
			}
			else if (nv == "Collection") {
			    frame = this['buildFrame'](frame,frame['element'])
			    frame['parent']['element'] = null
			    frame['addCollection']()
			}
			dom['removeAttributeNode'](parsetype)
		    }

		    if (attrs['length'] != 0) {
            var resource = this['getAttributeNodeNS'](dom,
			    RDFParser['ns']['RDF'],"resource")
			var bnid = this['getAttributeNodeNS'](dom,
			    RDFParser['ns']['RDF'],"nodeID")

			frame = this['buildFrame'](frame)
			if (resource) {
			    frame['addNode'](resource['nodeValue'])
			    dom['removeAttributeNode'](resource)
			} else {
			    if (bnid) {
				frame['addBNode'](bnid['nodeValue'])
				dom['removeAttributeNode'](bnid)
			    } else { frame['addBNode']() }
			}

			for (var x = attrs['length']-1; x >= 0; x--) {
			    var f = this['buildFrame'](frame)
			    f['addArc'](elementURI(attrs[x]))
			    if (elementURI(attrs[x])
				==RDFParser['ns']['RDF']+"type"){
				(this['buildFrame'](f))['addNode'](
				    attrs[x]['nodeValue'])
			    } else {
				(this['buildFrame'](f))['addLiteral'](
				    attrs[x]['nodeValue'])
			    }
			}
		    }
		    else if (dom['childNodes']['length'] == 0) {
			(this['buildFrame'](frame))['addLiteral']("")
		    }
		}
	    } // rdf:RDF

	    // dig dug
	    dom = frame['element']
	    while (frame['parent']) {
		var pframe = frame
		while (dom == null) {
		    frame = frame['parent']
		    dom = frame['element']
		}
		var candidate = dom['childNodes'][frame['lastChild']]
		if (candidate == null || !dig) {
		    frame['terminateFrame']()
		    if (!(frame = frame['parent'])) { break } // done
		    dom = frame['element']
		    dig = true
		}
		else if ((candidate['nodeType']
			  != RDFParser['nodeType']['ELEMENT']
			  && candidate['nodeType']
			  != RDFParser['nodeType']['TEXT']
			  && candidate['nodeType']
			  != RDFParser['nodeType']['CDATA_SECTION'])
			 || ((candidate['nodeType']
			      == RDFParser['nodeType']['TEXT']
			      || candidate['nodeType']
			      == RDFParser['nodeType']['CDATA_SECTION'])
			     && dom['childNodes']['length'] != 1)) {
		    frame['lastChild']++
		}
		else { // not a leaf
		    frame['lastChild']++
		    frame = this['buildFrame'](pframe,
					       dom['childNodes'][frame['lastChild']-1])
		    break
		}
	    }
	} // while
    }

    /**
     * Cleans out state from a previous parse run
     * @private
     */
    this['cleanParser'] = function () {
	this['bnodes'] = {}
	this['why'] = null
    }

    /**
     * Builds scope frame 
     * @private
     */
    this['buildFrame'] = function (parent, element) {
	var frame = this['frameFactory'](this,parent,element)
	if (parent) {
	    frame['base'] = parent['base']
	    frame['lang'] = parent['lang']
	}
	if (element == null
	    || element['nodeType'] == RDFParser['nodeType']['TEXT']
	    || element['nodeType'] == RDFParser['nodeType']['CDATA_SECTION']) {
	    return frame
	}

	var attrs = element['attributes']

	var base = element['getAttributeNode']("xml:base")
	if (base != null) {
	    frame['base'] = base['nodeValue']
	    element['removeAttribute']("xml:base")
	}
	var lang = element['getAttributeNode']("xml:lang")
	if (lang != null) {
	    frame['lang'] = lang['nodeValue']
	    element['removeAttribute']("xml:lang")
	}

	// remove all extraneous xml and xmlns attributes
	for (var x = attrs['length']-1; x >= 0; x--) {
	    if (attrs[x]['nodeName']['substr'](0,3) == "xml") {
                if (attrs[x].name.slice(0,6)=='xmlns:') {
                    var uri = attrs[x].nodeValue;
                    // alert('base for namespac attr:'+this.base);
                    if (this.base) uri = $rdf.Util.uri.join(uri, this.base);
                    this.store.setPrefixForURI(attrs[x].name.slice(6),
                                                uri);
                }
//		alert('rdfparser: xml atribute: '+attrs[x].name) //@@
		element['removeAttributeNode'](attrs[x])
	    }
	}
	return frame
    }
}
/**
*
*  UTF-8 data encode / decode
*  http://www.webtoolkit.info/
*
**/

$rdf.N3Parser = function () {

function hexify(str) { // also used in parser
  return encodeURI(str);
}

var Utf8 = {

    // public method for url encoding
    encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                    utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // public method for url decoding
    decode : function (utftext) {
        var string = "";
        var i = 0;

        while ( i < utftext.length ) {

                var c = utftext.charCodeAt(i);
                if (c < 128) {
                        string += String.fromCharCode(c);
                        i++;
                }
                else if((c > 191) && (c < 224)) {
                        string += String.fromCharCode(((c & 31) << 6)
                            | (utftext.charCodeAt(i+1) & 63));
                        i += 2;
                }
                else {
                        string += String.fromCharCode(((c & 15) << 12)
                            | ((utftext.charCodeAt(i+1) & 63) << 6)
                            | (utftext.charCodeAt(i+2) & 63));
                        i += 3;
                }
        }
        return string;
    }

}// Things we need to define to make converted pythn code work in js
// environment of $rdf

var RDFSink_forSomeSym = "http://www.w3.org/2000/10/swap/log#forSome";
var RDFSink_forAllSym = "http://www.w3.org/2000/10/swap/log#forAll";
var Logic_NS = "http://www.w3.org/2000/10/swap/log#";

//  pyjs seems to reference runtime library which I didn't find

var pyjslib_Tuple = function(theList) { return theList };

var pyjslib_List = function(theList) { return theList };

var pyjslib_Dict = function(listOfPairs) {
    if (listOfPairs.length > 0)
	throw "missing.js: oops nnonempty dict not imp";
    return [];
}

var pyjslib_len = function(s) { return s.length }

var pyjslib_slice = function(str, i, j) {
    if (typeof str.slice == 'undefined')
        throw '@@ mising.js: No .slice function for '+str+' of type '+(typeof str) 
    if ((typeof j == 'undefined') || (j ==null)) return str.slice(i);
    return str.slice(i, j) // @ exactly the same spec?
}
var StopIteration = Error('dummy error stop iteration');

var pyjslib_Iterator = function(theList) {
    this.last = 0;
    this.li = theList;
    this.next = function() {
	if (this.last == this.li.length) throw StopIteration;
	return this.li[this.last++];
    }
    return this;
};

var ord = function(str) {
    return str.charCodeAt(0)
}

var string_find = function(str, s) {
    return str.indexOf(s)
}

var assertFudge = function(condition, desc) {
    if (condition) return;
    if (desc) throw "python Assertion failed: "+desc;
    throw "(python) Assertion failed.";  
}


var stringFromCharCode = function(uesc) {
    return String.fromCharCode(uesc);
}


String.prototype.encode = function(encoding) {
    if (encoding != 'utf-8') throw "UTF8_converter: can only do utf-8"
    return Utf8.encode(this);
}
String.prototype.decode = function(encoding) {
    if (encoding != 'utf-8') throw "UTF8_converter: can only do utf-8"
    //return Utf8.decode(this);
    return this;
}



var uripath_join = function(base, given) {
    return $rdf.Util.uri.join(given, base)  // sad but true
}

var becauseSubexpression = null; // No reason needed
var diag_tracking = 0;
var diag_chatty_flag = 0;
var diag_progress = function(str) { /*$rdf.log.debug(str);*/ }

// why_BecauseOfData = function(doc, reason) { return doc };


var RDF_type_URI = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
var DAML_sameAs_URI = "http://www.w3.org/2002/07/owl#sameAs";

/*
function SyntaxError(details) {
    return new __SyntaxError(details);
}
*/

function __SyntaxError(details) {
    this.details = details
}

/*

$Id: n3parser.js 14561 2008-02-23 06:37:26Z kennyluck $

HAND EDITED FOR CONVERSION TO JAVASCRIPT

This module implements a Nptation3 parser, and the final
part of a notation3 serializer.

See also:

Notation 3
http://www.w3.org/DesignIssues/Notation3

Closed World Machine - and RDF Processor
http://www.w3.org/2000/10/swap/cwm

To DO: See also "@@" in comments

- Clean up interfaces
______________________________________________

Module originally by Dan Connolly, includeing notation3
parser and RDF generator. TimBL added RDF stream model
and N3 generation, replaced stream model with use
of common store/formula API.  Yosi Scharf developped
the module, including tests and test harness.

*/

var ADDED_HASH = "#";
var LOG_implies_URI = "http://www.w3.org/2000/10/swap/log#implies";
var INTEGER_DATATYPE = "http://www.w3.org/2001/XMLSchema#integer";
var FLOAT_DATATYPE = "http://www.w3.org/2001/XMLSchema#double";
var DECIMAL_DATATYPE = "http://www.w3.org/2001/XMLSchema#decimal";
var BOOLEAN_DATATYPE = "http://www.w3.org/2001/XMLSchema#boolean";
var option_noregen = 0;
var _notQNameChars = "\t\r\n !\"#$%&'()*.,+/;<=>?@[\\]^`{|}~";
var _notNameChars =  ( _notQNameChars + ":" ) ;
var _rdfns = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
var N3CommentCharacter = "#";
var eol = new RegExp("^[ \\t]*(#[^\\n]*)?\\r?\\n", 'g');
var eof = new RegExp("^[ \\t]*(#[^\\n]*)?$", 'g');
var ws = new RegExp("^[ \\t]*", 'g');
var signed_integer = new RegExp("^[-+]?[0-9]+", 'g');
var number_syntax = new RegExp("^([-+]?[0-9]+)(\\.[0-9]+)?(e[-+]?[0-9]+)?", 'g');
var digitstring = new RegExp("^[0-9]+", 'g');
var interesting = new RegExp("[\\\\\\r\\n\\\"]", 'g');
var langcode = new RegExp("^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)?", 'g');
function SinkParser(store, openFormula, thisDoc, baseURI, genPrefix, metaURI, flags, why) {
    return new __SinkParser(store, openFormula, thisDoc, baseURI, genPrefix, metaURI, flags, why);
}
function __SinkParser(store, openFormula, thisDoc, baseURI, genPrefix, metaURI, flags, why) {
    if (typeof openFormula == 'undefined') openFormula=null;
    if (typeof thisDoc == 'undefined') thisDoc="";
    if (typeof baseURI == 'undefined') baseURI=null;
    if (typeof genPrefix == 'undefined') genPrefix="";
    if (typeof metaURI == 'undefined') metaURI=null;
    if (typeof flags == 'undefined') flags="";
    if (typeof why == 'undefined') why=null;
    /*
    note: namespace names should *not* end in #;
    the # will get added during qname processing */
    
    this._bindings = new pyjslib_Dict([]);
    this._flags = flags;
    if ((thisDoc != "")) {
        assertFudge((thisDoc.indexOf(":") >= 0),  ( "Document URI not absolute: " + thisDoc ) );
        this._bindings[""] = (  ( thisDoc + "#" ) );
    }
    this._store = store;
    if (genPrefix) {
        store.setGenPrefix(genPrefix);
    }
    this._thisDoc = thisDoc;
    this.source = store.sym(thisDoc);
    this.lines = 0;
    this.statementCount = 0;
    this.startOfLine = 0;
    this.previousLine = 0;
    this._genPrefix = genPrefix;
    this.keywords = new pyjslib_List(["a", "this", "bind", "has", "is", "of", "true", "false"]);
    this.keywordsSet = 0;
    this._anonymousNodes = new pyjslib_Dict([]);
    this._variables = new pyjslib_Dict([]);
    this._parentVariables = new pyjslib_Dict([]);
    this._reason = why;
    this._reason2 = null;
    if (diag_tracking) {
        this._reason2 = why_BecauseOfData(store.sym(thisDoc), this._reason);
    }
    if (baseURI) {
        this._baseURI = baseURI;
    }
    else {
        if (thisDoc) {
            this._baseURI = thisDoc;
        }
        else {
            this._baseURI = null;
        }
    }
    assertFudge(!(this._baseURI) || (this._baseURI.indexOf(":") >= 0));
    if (!(this._genPrefix)) {
        if (this._thisDoc) {
            this._genPrefix =  ( this._thisDoc + "#_g" ) ;
        }
        else {
            this._genPrefix = RDFSink_uniqueURI();
        }
    }
    if ((openFormula == null)) {
        if (this._thisDoc) {
            this._formula = store.formula( ( thisDoc + "#_formula" ) );
        }
        else {
            this._formula = store.formula();
        }
    }
    else {
        this._formula = openFormula;
    }
    this._context = this._formula;
    this._parentContext = null;
}
__SinkParser.prototype.here = function(i) {
    return  (  (  (  ( this._genPrefix + "_L" )  + this.lines )  + "C" )  +  (  ( i - this.startOfLine )  + 1 )  ) ;
};
__SinkParser.prototype.formula = function() {
    return this._formula;
};
__SinkParser.prototype.loadStream = function(stream) {
    return this.loadBuf(stream.read());
};
__SinkParser.prototype.loadBuf = function(buf) {
    /*
    Parses a buffer and returns its top level formula*/
    
    this.startDoc();
    this.feed(buf);
    return this.endDoc();
};
__SinkParser.prototype.feed = function(octets) {
    /*
    Feed an octet stream tothe parser
    
    if BadSyntax is raised, the string
    passed in the exception object is the
    remainder after any statements have been parsed.
    So if there is more data to feed to the
    parser, it should be straightforward to recover.*/
    
    var str = octets.decode("utf-8");
    var i = 0;
    while ((i >= 0)) {
        var j = this.skipSpace(str, i);
        if ((j < 0)) {
            return;
        }
        var i = this.directiveOrStatement(str, j);
        if ((i < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, j, "expected directive or statement");
        }
    }
};
__SinkParser.prototype.directiveOrStatement = function(str, h) {
    var i = this.skipSpace(str, h);
    if ((i < 0)) {
        return i;
    }
    var j = this.directive(str, i);
    if ((j >= 0)) {
        return this.checkDot(str, j);
    }
    var j = this.statement(str, i);
    if ((j >= 0)) {
        return this.checkDot(str, j);
    }
    return j;
};
__SinkParser.prototype.tok = function(tok, str, i) {
    /*
    Check for keyword.  Space must have been stripped on entry and
    we must not be at end of file.*/
    var whitespace = "\t\n\v\f\r ";
    if ((pyjslib_slice(str, i,  ( i + 1 ) ) == "@")) {
        var i =  ( i + 1 ) ;
    }
    else {
        if (($rdf.Util.ArrayIndexOf(this.keywords,tok) < 0)) {
            return -1;
        }
    }
    var k =  ( i + pyjslib_len(tok) ) ;
    if ((pyjslib_slice(str, i, k) == tok) && (_notQNameChars.indexOf(str.charAt(k)) >= 0)) {
        return k;
    }
    else {
        return -1;
    }
};
__SinkParser.prototype.directive = function(str, i) {
    var j = this.skipSpace(str, i);
    if ((j < 0)) {
        return j;
    }
    var res = new pyjslib_List([]);
    var j = this.tok("bind", str, i);
    if ((j > 0)) {
        throw BadSyntax(this._thisDoc, this.lines, str, i, "keyword bind is obsolete: use @prefix");
    }
    var j = this.tok("keywords", str, i);
    if ((j > 0)) {
        var i = this.commaSeparatedList(str, j, res, false);
        if ((i < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, i, "'@keywords' needs comma separated list of words");
        }
        this.setKeywords(pyjslib_slice(res, null, null));
        if ((diag_chatty_flag > 80)) {
            diag_progress("Keywords ", this.keywords);
        }
        return i;
    }
    var j = this.tok("forAll", str, i);
    if ((j > 0)) {
        var i = this.commaSeparatedList(str, j, res, true);
        if ((i < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, i, "Bad variable list after @forAll");
        }
        
        var __x = new pyjslib_Iterator(res);
        try {
            while (true) {
                var x = __x.next();
                
                
                if ($rdf.Util.ArrayIndexOf(this._variables,x) < 0 || ($rdf.Util.ArrayIndexOf(this._parentVariables,x) >= 0)) {
                    this._variables[x] = ( this._context.newUniversal(x));
                }
                
            }
        } catch (e) {
            if (e != StopIteration) {
                throw e;
            }
        }
        
        return i;
    }
    var j = this.tok("forSome", str, i);
    if ((j > 0)) {
        var i = this.commaSeparatedList(str, j, res, this.uri_ref2);
        if ((i < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, i, "Bad variable list after @forSome");
        }
        
        var __x = new pyjslib_Iterator(res);
        try {
            while (true) {
                var x = __x.next();
                
                
                this._context.declareExistential(x);
                
            }
        } catch (e) {
            if (e != StopIteration) {
                throw e;
            }
        }
        
        return i;
    }
    var j = this.tok("prefix", str, i);
    if ((j >= 0)) {
        var t = new pyjslib_List([]);
        var i = this.qname(str, j, t);
        if ((i < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, j, "expected qname after @prefix");
        }
        var j = this.uri_ref2(str, i, t);
        if ((j < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, i, "expected <uriref> after @prefix _qname_");
        }
        var ns = t[1].uri;
        if (this._baseURI) {
            var ns = uripath_join(this._baseURI, ns);
        }
        else {
            assertFudge((ns.indexOf(":") >= 0), "With no base URI, cannot handle relative URI for NS");
        }
        assertFudge((ns.indexOf(":") >= 0));
        this._bindings[t[0][0]] = ( ns);
        
        this.bind(t[0][0], hexify(ns));
        return j;
    }
    var j = this.tok("base", str, i);
    if ((j >= 0)) {
        var t = new pyjslib_List([]);
        var i = this.uri_ref2(str, j, t);
        if ((i < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, j, "expected <uri> after @base ");
        }
        var ns = t[0].uri;
        if (this._baseURI) {
            var ns = uripath_join(this._baseURI, ns);
        }
        else {
            throw BadSyntax(this._thisDoc, this.lines, str, j,  (  ( "With no previous base URI, cannot use relative URI in @base  <" + ns )  + ">" ) );
        }
        assertFudge((ns.indexOf(":") >= 0));
        this._baseURI = ns;
        return i;
    }
    return -1;
};
__SinkParser.prototype.bind = function(qn, uri) {
    if ((qn == "")) {
    }
    else {
        this._store.setPrefixForURI(qn, uri);
    }
};
__SinkParser.prototype.setKeywords = function(k) {
    /*
    Takes a list of strings*/
    
    if ((k == null)) {
        this.keywordsSet = 0;
    }
    else {
        this.keywords = k;
        this.keywordsSet = 1;
    }
};
__SinkParser.prototype.startDoc = function() {
};
__SinkParser.prototype.endDoc = function() {
    /*
    Signal end of document and stop parsing. returns formula*/
    
    return this._formula;
};
__SinkParser.prototype.makeStatement = function(quad) {
    quad[0].add(quad[2], quad[1], quad[3], this.source);
    this.statementCount += 1;
};
__SinkParser.prototype.statement = function(str, i) {
    var r = new pyjslib_List([]);
    var i = this.object(str, i, r);
    if ((i < 0)) {
        return i;
    }
    var j = this.property_list(str, i, r[0]);
    if ((j < 0)) {
        throw BadSyntax(this._thisDoc, this.lines, str, i, "expected propertylist");
    }
    return j;
};
__SinkParser.prototype.subject = function(str, i, res) {
    return this.item(str, i, res);
};
__SinkParser.prototype.verb = function(str, i, res) {
    /*
    has _prop_
    is _prop_ of
    a
    =
    _prop_
    >- prop ->
    <- prop -<
    _operator_*/
    
    var j = this.skipSpace(str, i);
    if ((j < 0)) {
        return j;
    }
    var r = new pyjslib_List([]);
    var j = this.tok("has", str, i);
    if ((j >= 0)) {
        var i = this.prop(str, j, r);
        if ((i < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, j, "expected property after 'has'");
        }
        res.push(new pyjslib_Tuple(["->", r[0]]));
        return i;
    }
    var j = this.tok("is", str, i);
    if ((j >= 0)) {
        var i = this.prop(str, j, r);
        if ((i < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, j, "expected <property> after 'is'");
        }
        var j = this.skipSpace(str, i);
        if ((j < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, i, "End of file found, expected property after 'is'");
            return j;
        }
        var i = j;
        var j = this.tok("of", str, i);
        if ((j < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, i, "expected 'of' after 'is' <prop>");
        }
        res.push(new pyjslib_Tuple(["<-", r[0]]));
        return j;
    }
    var j = this.tok("a", str, i);
    if ((j >= 0)) {
        res.push(new pyjslib_Tuple(["->", this._store.sym(RDF_type_URI)]));
        return j;
    }
    if ((pyjslib_slice(str, i,  ( i + 2 ) ) == "<=")) {
        res.push(new pyjslib_Tuple(["<-", this._store.sym( ( Logic_NS + "implies" ) )]));
        return  ( i + 2 ) ;
    }
    if ((pyjslib_slice(str, i,  ( i + 1 ) ) == "=")) {
        if ((pyjslib_slice(str,  ( i + 1 ) ,  ( i + 2 ) ) == ">")) {
            res.push(new pyjslib_Tuple(["->", this._store.sym( ( Logic_NS + "implies" ) )]));
            return  ( i + 2 ) ;
        }
        res.push(new pyjslib_Tuple(["->", this._store.sym(DAML_sameAs_URI)]));
        return  ( i + 1 ) ;
    }
    if ((pyjslib_slice(str, i,  ( i + 2 ) ) == ":=")) {
        res.push(new pyjslib_Tuple(["->",  ( Logic_NS + "becomes" ) ]));
        return  ( i + 2 ) ;
    }
    var j = this.prop(str, i, r);
    if ((j >= 0)) {
        res.push(new pyjslib_Tuple(["->", r[0]]));
        return j;
    }
    if ((pyjslib_slice(str, i,  ( i + 2 ) ) == ">-") || (pyjslib_slice(str, i,  ( i + 2 ) ) == "<-")) {
        throw BadSyntax(this._thisDoc, this.lines, str, j, ">- ... -> syntax is obsolete.");
    }
    return -1;
};
__SinkParser.prototype.prop = function(str, i, res) {
    return this.item(str, i, res);
};
__SinkParser.prototype.item = function(str, i, res) {
    return this.path(str, i, res);
};
__SinkParser.prototype.blankNode = function(uri) {
    return this._context.bnode(uri, this._reason2);
};
__SinkParser.prototype.path = function(str, i, res) {
    /*
    Parse the path production.
    */
    
    var j = this.nodeOrLiteral(str, i, res);
    if ((j < 0)) {
        return j;
    }
    while (("!^.".indexOf(pyjslib_slice(str, j,  ( j + 1 ) )) >= 0)) {
        var ch = pyjslib_slice(str, j,  ( j + 1 ) );
        if ((ch == ".")) {
            var ahead = pyjslib_slice(str,  ( j + 1 ) ,  ( j + 2 ) );
            if (!(ahead) || (_notNameChars.indexOf(ahead) >= 0) && (":?<[{(".indexOf(ahead) < 0)) {
                break;
            }
        }
        var subj = res.pop();
        var obj = this.blankNode(this.here(j));
        var j = this.node(str,  ( j + 1 ) , res);
        if ((j < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, j, "EOF found in middle of path syntax");
        }
        var pred = res.pop();
        if ((ch == "^")) {
            this.makeStatement(new pyjslib_Tuple([this._context, pred, obj, subj]));
        }
        else {
            this.makeStatement(new pyjslib_Tuple([this._context, pred, subj, obj]));
        }
        res.push(obj);
    }
    return j;
};
__SinkParser.prototype.anonymousNode = function(ln) {
    /*
    Remember or generate a term for one of these _: anonymous nodes*/
    
    var term = this._anonymousNodes[ln];
    if (term) {
        return term;
    }
    var term = this._store.bnode(this._context, this._reason2);
    this._anonymousNodes[ln] = ( term);
    return term;
};
__SinkParser.prototype.node = function(str, i, res, subjectAlready) {
    if (typeof subjectAlready == 'undefined') subjectAlready=null;
    /*
    Parse the <node> production.
    Space is now skipped once at the beginning
    instead of in multipe calls to self.skipSpace().
    */
    
    var subj = subjectAlready;
    var j = this.skipSpace(str, i);
    if ((j < 0)) {
        return j;
    }
    var i = j;
    var ch = pyjslib_slice(str, i,  ( i + 1 ) );
    if ((ch == "[")) {
        var bnodeID = this.here(i);
        var j = this.skipSpace(str,  ( i + 1 ) );
        if ((j < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, i, "EOF after '['");
        }
        if ((pyjslib_slice(str, j,  ( j + 1 ) ) == "=")) {
            var i =  ( j + 1 ) ;
            var objs = new pyjslib_List([]);
            var j = this.objectList(str, i, objs);
            
            if ((j >= 0)) {
                var subj = objs[0];
                if ((pyjslib_len(objs) > 1)) {
                    
                    var __obj = new pyjslib_Iterator(objs);
                    try {
                        while (true) {
                            var obj = __obj.next();
                            
                            
                            this.makeStatement(new pyjslib_Tuple([this._context, this._store.sym(DAML_sameAs_URI), subj, obj]));
                            
                        }
                    } catch (e) {
                        if (e != StopIteration) {
                            throw e;
                        }
                    }
                    
                }
                var j = this.skipSpace(str, j);
                if ((j < 0)) {
                    throw BadSyntax(this._thisDoc, this.lines, str, i, "EOF when objectList expected after [ = ");
                }
                if ((pyjslib_slice(str, j,  ( j + 1 ) ) == ";")) {
                    var j =  ( j + 1 ) ;
                }
            }
            else {
                throw BadSyntax(this._thisDoc, this.lines, str, i, "objectList expected after [= ");
            }
        }
        if ((subj == null)) {
            var subj = this.blankNode(bnodeID);
        }
        var i = this.property_list(str, j, subj);
        if ((i < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, j, "property_list expected");
        }
        var j = this.skipSpace(str, i);
        if ((j < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, i, "EOF when ']' expected after [ <propertyList>");
        }
        if ((pyjslib_slice(str, j,  ( j + 1 ) ) != "]")) {
            throw BadSyntax(this._thisDoc, this.lines, str, j, "']' expected");
        }
        res.push(subj);
        return  ( j + 1 ) ;
    }
    if ((ch == "{")) {
        var ch2 = pyjslib_slice(str,  ( i + 1 ) ,  ( i + 2 ) );
        if ((ch2 == "$")) {
            i += 1;
            var j =  ( i + 1 ) ;
            var mylist = new pyjslib_List([]);
            var first_run = true;
            while (1) {
                var i = this.skipSpace(str, j);
                if ((i < 0)) {
                    throw BadSyntax(this._thisDoc, this.lines, str, i, "needed '$}', found end.");
                }
                if ((pyjslib_slice(str, i,  ( i + 2 ) ) == "$}")) {
                    var j =  ( i + 2 ) ;
                    break;
                }
                if (!(first_run)) {
                    if ((pyjslib_slice(str, i,  ( i + 1 ) ) == ",")) {
                        i += 1;
                    }
                    else {
                        throw BadSyntax(this._thisDoc, this.lines, str, i, "expected: ','");
                    }
                }
                else {
                    var first_run = false;
                }
                var item = new pyjslib_List([]);
                var j = this.item(str, i, item);
                if ((j < 0)) {
                    throw BadSyntax(this._thisDoc, this.lines, str, i, "expected item in set or '$}'");
                }
                mylist.push(item[0]);
            }
            res.push(this._store.newSet(mylist, this._context));
            return j;
        }
        else {
            var j =  ( i + 1 ) ;
            var oldParentContext = this._parentContext;
            this._parentContext = this._context;
            var parentAnonymousNodes = this._anonymousNodes;
            var grandParentVariables = this._parentVariables;
            this._parentVariables = this._variables;
            this._anonymousNodes = new pyjslib_Dict([]);
            this._variables = this._variables.slice();
            var reason2 = this._reason2;
            this._reason2 = becauseSubexpression;
            if ((subj == null)) {
                var subj = this._store.formula();
            }
            this._context = subj;
            while (1) {
                var i = this.skipSpace(str, j);
                if ((i < 0)) {
                    throw BadSyntax(this._thisDoc, this.lines, str, i, "needed '}', found end.");
                }
                if ((pyjslib_slice(str, i,  ( i + 1 ) ) == "}")) {
                    var j =  ( i + 1 ) ;
                    break;
                }
                var j = this.directiveOrStatement(str, i);
                if ((j < 0)) {
                    throw BadSyntax(this._thisDoc, this.lines, str, i, "expected statement or '}'");
                }
            }
            this._anonymousNodes = parentAnonymousNodes;
            this._variables = this._parentVariables;
            this._parentVariables = grandParentVariables;
            this._context = this._parentContext;
            this._reason2 = reason2;
            this._parentContext = oldParentContext;
            res.push(subj.close());
            return j;
        }
    }
    if ((ch == "(")) {
        var thing_type = this._store.list;
        var ch2 = pyjslib_slice(str,  ( i + 1 ) ,  ( i + 2 ) );
        if ((ch2 == "$")) {
            var thing_type = this._store.newSet;
            i += 1;
        }
        var j =  ( i + 1 ) ;
        var mylist = new pyjslib_List([]);
        while (1) {
            var i = this.skipSpace(str, j);
            if ((i < 0)) {
                throw BadSyntax(this._thisDoc, this.lines, str, i, "needed ')', found end.");
            }
            if ((pyjslib_slice(str, i,  ( i + 1 ) ) == ")")) {
                var j =  ( i + 1 ) ;
                break;
            }
            var item = new pyjslib_List([]);
            var j = this.item(str, i, item);
            if ((j < 0)) {
                throw BadSyntax(this._thisDoc, this.lines, str, i, "expected item in list or ')'");
            }
            mylist.push(item[0]);
        }
        res.push(thing_type(mylist, this._context));
        return j;
    }
    var j = this.tok("this", str, i);
    if ((j >= 0)) {
        throw BadSyntax(this._thisDoc, this.lines, str, i, "Keyword 'this' was ancient N3. Now use @forSome and @forAll keywords.");
        res.push(this._context);
        return j;
    }
    var j = this.tok("true", str, i);
    if ((j >= 0)) {
        res.push(true);
        return j;
    }
    var j = this.tok("false", str, i);
    if ((j >= 0)) {
        res.push(false);
        return j;
    }
    if ((subj == null)) {
        var j = this.uri_ref2(str, i, res);
        if ((j >= 0)) {
            return j;
        }
    }
    return -1;
};
__SinkParser.prototype.property_list = function(str, i, subj) {
    /*
    Parse property list
    Leaves the terminating punctuation in the buffer
    */
    
    while (1) {
        var j = this.skipSpace(str, i);
        if ((j < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, i, "EOF found when expected verb in property list");
            return j;
        }
        if ((pyjslib_slice(str, j,  ( j + 2 ) ) == ":-")) {
            var i =  ( j + 2 ) ;
            var res = new pyjslib_List([]);
            var j = this.node(str, i, res, subj);
            if ((j < 0)) {
                throw BadSyntax(this._thisDoc, this.lines, str, i, "bad {} or () or [] node after :- ");
            }
            var i = j;
            continue;
        }
        var i = j;
        var v = new pyjslib_List([]);
        var j = this.verb(str, i, v);
        if ((j <= 0)) {
            return i;
        }
        var objs = new pyjslib_List([]);
        var i = this.objectList(str, j, objs);
        if ((i < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, j, "objectList expected");
        }
        
        var __obj = new pyjslib_Iterator(objs);
        try {
            while (true) {
                var obj = __obj.next();
                
                
                var pairFudge = v[0];
                var dir = pairFudge[0];
                var sym = pairFudge[1];
                if ((dir == "->")) {
                    this.makeStatement(new pyjslib_Tuple([this._context, sym, subj, obj]));
                }
                else {
                    this.makeStatement(new pyjslib_Tuple([this._context, sym, obj, subj]));
                }
                
            }
        } catch (e) {
            if (e != StopIteration) {
                throw e;
            }
        }
        
        var j = this.skipSpace(str, i);
        if ((j < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, j, "EOF found in list of objects");
            return j;
        }
        if ((pyjslib_slice(str, i,  ( i + 1 ) ) != ";")) {
            return i;
        }
        var i =  ( i + 1 ) ;
    }
};
__SinkParser.prototype.commaSeparatedList = function(str, j, res, ofUris) {
    /*
    return value: -1 bad syntax; >1 new position in str
    res has things found appended
    
    Used to use a final value of the function to be called, e.g. this.bareWord
    but passing the function didn't work fo js converion pyjs
    */
    
    var i = this.skipSpace(str, j);
    if ((i < 0)) {
        throw BadSyntax(this._thisDoc, this.lines, str, i, "EOF found expecting comma sep list");
        return i;
    }
    if ((str.charAt(i) == ".")) {
        return j;
    }
    if (ofUris) {
        var i = this.uri_ref2(str, i, res);
    }
    else {
        var i = this.bareWord(str, i, res);
    }
    if ((i < 0)) {
        return -1;
    }
    while (1) {
        var j = this.skipSpace(str, i);
        if ((j < 0)) {
            return j;
        }
        var ch = pyjslib_slice(str, j,  ( j + 1 ) );
        if ((ch != ",")) {
            if ((ch != ".")) {
                return -1;
            }
            return j;
        }
        if (ofUris) {
            var i = this.uri_ref2(str,  ( j + 1 ) , res);
        }
        else {
            var i = this.bareWord(str,  ( j + 1 ) , res);
        }
        if ((i < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, i, "bad list content");
            return i;
        }
    }
};
__SinkParser.prototype.objectList = function(str, i, res) {
    var i = this.object(str, i, res);
    if ((i < 0)) {
        return -1;
    }
    while (1) {
        var j = this.skipSpace(str, i);
        if ((j < 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, j, "EOF found after object");
            return j;
        }
        if ((pyjslib_slice(str, j,  ( j + 1 ) ) != ",")) {
            return j;
        }
        var i = this.object(str,  ( j + 1 ) , res);
        if ((i < 0)) {
            return i;
        }
    }
};
__SinkParser.prototype.checkDot = function(str, i) {
    var j = this.skipSpace(str, i);
    if ((j < 0)) {
        return j;
    }
    if ((pyjslib_slice(str, j,  ( j + 1 ) ) == ".")) {
        return  ( j + 1 ) ;
    }
    if ((pyjslib_slice(str, j,  ( j + 1 ) ) == "}")) {
        return j;
    }
    if ((pyjslib_slice(str, j,  ( j + 1 ) ) == "]")) {
        return j;
    }
    throw BadSyntax(this._thisDoc, this.lines, str, j, "expected '.' or '}' or ']' at end of statement");
    return i;
};
__SinkParser.prototype.uri_ref2 = function(str, i, res) {
    /*
    Generate uri from n3 representation.
    
    Note that the RDF convention of directly concatenating
    NS and local name is now used though I prefer inserting a '#'
    to make the namesapces look more like what XML folks expect.
    */
    
    var qn = new pyjslib_List([]);
    var j = this.qname(str, i, qn);
    if ((j >= 0)) {
        var pairFudge = qn[0];
        var pfx = pairFudge[0];
        var ln = pairFudge[1];
        if ((pfx == null)) {
            assertFudge(0, "not used?");
            var ns =  ( this._baseURI + ADDED_HASH ) ;
        }
        else {
            var ns = this._bindings[pfx];
            if (!(ns)) {
                if ((pfx == "_")) {
                    res.push(this.anonymousNode(ln));
                    return j;
                }
                throw BadSyntax(this._thisDoc, this.lines, str, i,  (  ( "Prefix " + pfx )  + " not bound." ) );
            }
        }
        var symb = this._store.sym( ( ns + ln ) );
        if (($rdf.Util.ArrayIndexOf(this._variables, symb) >= 0)) {
            res.push(this._variables[symb]);
        }
        else {
            res.push(symb);
        }
        return j;
    }
    var i = this.skipSpace(str, i);
    if ((i < 0)) {
        return -1;
    }
    if ((str.charAt(i) == "?")) {
        var v = new pyjslib_List([]);
        var j = this.variable(str, i, v);
        if ((j > 0)) {
            res.push(v[0]);
            return j;
        }
        return -1;
    }
    else if ((str.charAt(i) == "<")) {
        var i =  ( i + 1 ) ;
        var st = i;
        while ((i < pyjslib_len(str))) {
            if ((str.charAt(i) == ">")) {
                var uref = pyjslib_slice(str, st, i);
                if (this._baseURI) {
                    var uref = uripath_join(this._baseURI, uref);
                }
                else {
                    assertFudge((uref.indexOf(":") >= 0), "With no base URI, cannot deal with relative URIs");
                }
                if ((pyjslib_slice(str,  ( i - 1 ) , i) == "#") && !((pyjslib_slice(uref, -1, null) == "#"))) {
                    var uref =  ( uref + "#" ) ;
                }
                var symb = this._store.sym(uref);
                if (($rdf.Util.ArrayIndexOf(this._variables,symb) >= 0)) {
                    res.push(this._variables[symb]);
                }
                else {
                    res.push(symb);
                }
                return  ( i + 1 ) ;
            }
            var i =  ( i + 1 ) ;
        }
        throw BadSyntax(this._thisDoc, this.lines, str, j, "unterminated URI reference");
    }
    else if (this.keywordsSet) {
        var v = new pyjslib_List([]);
        var j = this.bareWord(str, i, v);
        if ((j < 0)) {
            return -1;
        }
        if (($rdf.Util.ArrayIndexOf(this.keywords, v[0]) >= 0)) {
            throw BadSyntax(this._thisDoc, this.lines, str, i,  (  ( "Keyword \"" + v[0] )  + "\" not allowed here." ) );
        }
        res.push(this._store.sym( ( this._bindings[""] + v[0] ) ));
        return j;
    }
    else {
        return -1;
    }
};
__SinkParser.prototype.skipSpace = function(str, i) {
    /*
    Skip white space, newlines and comments.
    return -1 if EOF, else position of first non-ws character*/
    var tmp = str;
    var whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
    for (var j = (i ? i : 0); j < str.length; j++) {
        if (whitespace.indexOf(str.charAt(j)) === -1) {
            if( str.charAt(j)==='#' ) {
                str = str.slice(i).replace(/^[^\n]*\n/,"");
                i=0;
                j=-1;
            } else {
                break;
            }
        }
    }
    val = (tmp.length - str.length) + j;
    if( val === tmp.length ) {
        return -1;
    }
    return val;
};
__SinkParser.prototype.variable = function(str, i, res) {
    /*
    ?abc -> variable(:abc)
    */
    
    var j = this.skipSpace(str, i);
    if ((j < 0)) {
        return -1;
    }
    if ((pyjslib_slice(str, j,  ( j + 1 ) ) != "?")) {
        return -1;
    }
    var j =  ( j + 1 ) ;
    var i = j;
    if (("0123456789-".indexOf(str.charAt(j)) >= 0)) {
        throw BadSyntax(this._thisDoc, this.lines, str, j,  (  ( "Varible name can't start with '" + str.charAt(j) )  + "s'" ) );
        return -1;
    }
    while ((i < pyjslib_len(str)) && (_notNameChars.indexOf(str.charAt(i)) < 0)) {
        var i =  ( i + 1 ) ;
    }
    if ((this._parentContext == null)) {
        throw BadSyntax(this._thisDoc, this.lines, str, j,  ( "Can't use ?xxx syntax for variable in outermost level: " + pyjslib_slice(str,  ( j - 1 ) , i) ) );
    }
    res.push(this._store.variable(pyjslib_slice(str, j, i)));
    return i;
};
__SinkParser.prototype.bareWord = function(str, i, res) {
    /*
    abc -> :abc
    */
    
    var j = this.skipSpace(str, i);
    if ((j < 0)) {
        return -1;
    }
    var ch = str.charAt(j);
    if (("0123456789-".indexOf(ch) >= 0)) {
        return -1;
    }
    if ((_notNameChars.indexOf(ch) >= 0)) {
        return -1;
    }
    var i = j;
    while ((i < pyjslib_len(str)) && (_notNameChars.indexOf(str.charAt(i)) < 0)) {
        var i =  ( i + 1 ) ;
    }
    res.push(pyjslib_slice(str, j, i));
    return i;
};
__SinkParser.prototype.qname = function(str, i, res) {
    /*
    
    xyz:def -> ('xyz', 'def')
    If not in keywords and keywordsSet: def -> ('', 'def')
    :def -> ('', 'def')    
    */
    
    var i = this.skipSpace(str, i);
    if ((i < 0)) {
        return -1;
    }
    var c = str.charAt(i);
    if (("0123456789-+".indexOf(c) >= 0)) {
        return -1;
    }
    if ((_notNameChars.indexOf(c) < 0)) {
        var ln = c;
        var i =  ( i + 1 ) ;
        while ((i < pyjslib_len(str))) {
            var c = str.charAt(i);
            if ((_notNameChars.indexOf(c) < 0)) {
                var ln =  ( ln + c ) ;
                var i =  ( i + 1 ) ;
            }
            else {
                break;
            }
        }
    }
    else {
        var ln = "";
    }
    if ((i < pyjslib_len(str)) && (str.charAt(i) == ":")) {
        var pfx = ln;
        var i =  ( i + 1 ) ;
        var ln = "";
        while ((i < pyjslib_len(str))) {
            var c = str.charAt(i);
            if ((_notNameChars.indexOf(c) < 0)) {
                var ln =  ( ln + c ) ;
                var i =  ( i + 1 ) ;
            }
            else {
                break;
            }
        }
        res.push(new pyjslib_Tuple([pfx, ln]));
        return i;
    }
    else {
        if (ln && this.keywordsSet && ($rdf.Util.ArrayIndexOf(this.keywords, ln) < 0)) {
            res.push(new pyjslib_Tuple(["", ln]));
            return i;
        }
        return -1;
    }
};
__SinkParser.prototype.object = function(str, i, res) {
    var j = this.subject(str, i, res);
    if ((j >= 0)) {
        return j;
    }
    else {
        var j = this.skipSpace(str, i);
        if ((j < 0)) {
            return -1;
        }
        else {
            var i = j;
        }
        if ((str.charAt(i) == "\"")) {
            if ((pyjslib_slice(str, i,  ( i + 3 ) ) == "\"\"\"")) {
                var delim = "\"\"\"";
            }
            else {
                var delim = "\"";
            }
            var i =  ( i + pyjslib_len(delim) ) ;
            var pairFudge = this.strconst(str, i, delim);
            var j = pairFudge[0];
            var s = pairFudge[1];
            res.push(this._store.literal(s));
            diag_progress("New string const ", s, j);
            return j;
        }
        else {
            return -1;
        }
    }
};
__SinkParser.prototype.nodeOrLiteral = function(str, i, res) {
    var j = this.node(str, i, res);
    if ((j >= 0)) {
        return j;
    }
    else {
        var j = this.skipSpace(str, i);
        if ((j < 0)) {
            return -1;
        }
        else {
            var i = j;
        }
        var ch = str.charAt(i);
        if (("-+0987654321".indexOf(ch) >= 0)) {
            number_syntax.lastIndex = 0;
            var m = number_syntax.exec(str.slice(i));
            if ((m == null)) {
                throw BadSyntax(this._thisDoc, this.lines, str, i, "Bad number syntax");
            }
            var j =  ( i + number_syntax.lastIndex ) ;
            var val = pyjslib_slice(str, i, j);
            if ((val.indexOf("e") >= 0)) {
                res.push(this._store.literal(parseFloat(val), undefined, kb.sym(FLOAT_DATATYPE)));
            }
            else if ((pyjslib_slice(str, i, j).indexOf(".") >= 0)) {
                res.push(this._store.literal(parseFloat(val), undefined, kb.sym(DECIMAL_DATATYPE)));
            }
            else {
                res.push(this._store.literal(parseInt(val), undefined, kb.sym(INTEGER_DATATYPE)));
            }
            return j;
        }
        if ((str.charAt(i) == "\"")) {
            if ((pyjslib_slice(str, i,  ( i + 3 ) ) == "\"\"\"")) {
                var delim = "\"\"\"";
            }
            else {
                var delim = "\"";
            }
            var i =  ( i + pyjslib_len(delim) ) ;
            var dt = null;
            var pairFudge = this.strconst(str, i, delim);
            var j = pairFudge[0];
            var s = pairFudge[1];
            var lang = null;
            if ((pyjslib_slice(str, j,  ( j + 1 ) ) == "@")) {
                langcode.lastIndex = 0;
                
                var m = langcode.exec(str.slice( ( j + 1 ) ));
                if ((m == null)) {
                    throw BadSyntax(this._thisDoc, startline, str, i, "Bad language code syntax on string literal, after @");
                }
                var i =  (  ( langcode.lastIndex + j )  + 1 ) ;
                
                var lang = pyjslib_slice(str,  ( j + 1 ) , i);
                var j = i;
            }
            if ((pyjslib_slice(str, j,  ( j + 2 ) ) == "^^")) {
                var res2 = new pyjslib_List([]);
                var j = this.uri_ref2(str,  ( j + 2 ) , res2);
                var dt = res2[0];
            }
            res.push(this._store.literal(s, lang, dt));
            return j;
        }
        else {
            return -1;
        }
    }
};
__SinkParser.prototype.strconst = function(str, i, delim) {
    /*
    parse an N3 string constant delimited by delim.
    return index, val
    */
    
    var j = i;
    var ustr = "";
    var startline = this.lines;
    while ((j < pyjslib_len(str))) {
        var i =  ( j + pyjslib_len(delim) ) ;
        if ((pyjslib_slice(str, j, i) == delim)) {
            return new pyjslib_Tuple([i, ustr]);
        }
        if ((str.charAt(j) == "\"")) {
            var ustr =  ( ustr + "\"" ) ;
            var j =  ( j + 1 ) ;
            continue;
        }
        interesting.lastIndex = 0;
        var m = interesting.exec(str.slice(j));
        if (!(m)) {
            throw BadSyntax(this._thisDoc, startline, str, j,  (  (  ( "Closing quote missing in string at ^ in " + pyjslib_slice(str,  ( j - 20 ) , j) )  + "^" )  + pyjslib_slice(str, j,  ( j + 20 ) ) ) );
        }
        var i =  (  ( j + interesting.lastIndex )  - 1 ) ;
        var ustr =  ( ustr + pyjslib_slice(str, j, i) ) ;
        var ch = str.charAt(i);
        if ((ch == "\"")) {
            var j = i;
            continue;
        }
        else if ((ch == "\r")) {
            var j =  ( i + 1 ) ;
            continue;
        }
        else if ((ch == "\n")) {
            if ((delim == "\"")) {
                throw BadSyntax(this._thisDoc, startline, str, i, "newline found in string literal");
            }
            this.lines =  ( this.lines + 1 ) ;
            var ustr =  ( ustr + ch ) ;
            var j =  ( i + 1 ) ;
            this.previousLine = this.startOfLine;
            this.startOfLine = j;
        }
        else if ((ch == "\\")) {
            var j =  ( i + 1 ) ;
            var ch = pyjslib_slice(str, j,  ( j + 1 ) );
            if (!(ch)) {
                throw BadSyntax(this._thisDoc, startline, str, i, "unterminated string literal (2)");
            }
            var k = string_find("abfrtvn\\\"", ch);
            if ((k >= 0)) {
                var uch = "\a\b\f\r\t\v\n\\\"".charAt(k);
                var ustr =  ( ustr + uch ) ;
                var j =  ( j + 1 ) ;
            }
            else if ((ch == "u")) {
                var pairFudge = this.uEscape(str,  ( j + 1 ) , startline);
                var j = pairFudge[0];
                var ch = pairFudge[1];
                var ustr =  ( ustr + ch ) ;
            }
            else if ((ch == "U")) {
                var pairFudge = this.UEscape(str,  ( j + 1 ) , startline);
                var j = pairFudge[0];
                var ch = pairFudge[1];
                var ustr =  ( ustr + ch ) ;
            }
            else {
                throw BadSyntax(this._thisDoc, this.lines, str, i, "bad escape");
            }
        }
    }
    throw BadSyntax(this._thisDoc, this.lines, str, i, "unterminated string literal");
};
__SinkParser.prototype.uEscape = function(str, i, startline) {
    var j = i;
    var count = 0;
    var value = 0;
    while ((count < 4)) {
        var chFudge = pyjslib_slice(str, j,  ( j + 1 ) );
        var ch = chFudge.toLowerCase();
        var j =  ( j + 1 ) ;
        if ((ch == "")) {
            throw BadSyntax(this._thisDoc, startline, str, i, "unterminated string literal(3)");
        }
        var k = string_find("0123456789abcdef", ch);
        if ((k < 0)) {
            throw BadSyntax(this._thisDoc, startline, str, i, "bad string literal hex escape");
        }
        var value =  (  ( value * 16 )  + k ) ;
        var count =  ( count + 1 ) ;
    }
    var uch = String.fromCharCode(value);
    return new pyjslib_Tuple([j, uch]);
};
__SinkParser.prototype.UEscape = function(str, i, startline) {
    var j = i;
    var count = 0;
    var value = "\\U";
    while ((count < 8)) {
        var chFudge = pyjslib_slice(str, j,  ( j + 1 ) );
        var ch = chFudge.toLowerCase();
        var j =  ( j + 1 ) ;
        if ((ch == "")) {
            throw BadSyntax(this._thisDoc, startline, str, i, "unterminated string literal(3)");
        }
        var k = string_find("0123456789abcdef", ch);
        if ((k < 0)) {
            throw BadSyntax(this._thisDoc, startline, str, i, "bad string literal hex escape");
        }
        var value =  ( value + ch ) ;
        var count =  ( count + 1 ) ;
    }
    var uch = stringFromCharCode( (  ( "0x" + pyjslib_slice(value, 2, 10) )  - 0 ) );
    return new pyjslib_Tuple([j, uch]);
};
function OLD_BadSyntax(uri, lines, str, i, why) {
    return new __OLD_BadSyntax(uri, lines, str, i, why);
}
function __OLD_BadSyntax(uri, lines, str, i, why) {
    this._str = str.encode("utf-8");
    this._str = str;
    this._i = i;
    this._why = why;
    this.lines = lines;
    this._uri = uri;
}
__OLD_BadSyntax.prototype.toString = function() {
    var str = this._str;
    var i = this._i;
    var st = 0;
    if ((i > 60)) {
        var pre = "...";
        var st =  ( i - 60 ) ;
    }
    else {
        var pre = "";
    }
    if (( ( pyjslib_len(str) - i )  > 60)) {
        var post = "...";
    }
    else {
        var post = "";
    }
    return "Line %i of <%s>: Bad syntax (%s) at ^ in:\n\"%s%s^%s%s\"" % new pyjslib_Tuple([ ( this.lines + 1 ) , this._uri, this._why, pre, pyjslib_slice(str, st, i), pyjslib_slice(str, i,  ( i + 60 ) ), post]);
};
function BadSyntax(uri, lines, str, i, why) {
    return  (  (  (  (  (  (  (  ( "Line " +  ( lines + 1 )  )  + " of <" )  + uri )  + ">: Bad syntax: " )  + why )  + "\nat: \"" )  + pyjslib_slice(str, i,  ( i + 30 ) ) )  + "\"" ) ;
}


function stripCR(str) {
    var res = "";
    
    var __ch = new pyjslib_Iterator(str);
    try {
        while (true) {
            var ch = __ch.next();
            
            
            if ((ch != "\r")) {
                var res =  ( res + ch ) ;
            }
            
        }
    } catch (e) {
        if (e != StopIteration) {
            throw e;
        }
    }
    
    return res;
}


function dummyWrite(x) {
}

return SinkParser;

}();
//  Identity management and indexing for RDF
//
// This file provides  IndexedFormula a formula (set of triples) which
// indexed by predicate, subject and object.
//
// It "smushes"  (merges into a single node) things which are identical 
// according to owl:sameAs or an owl:InverseFunctionalProperty
// or an owl:FunctionalProperty
//
//
//  2005-10 Written Tim Berners-Lee
//  2007    Changed so as not to munge statements from documents when smushing
//
// 

/*jsl:option explicit*/ // Turn on JavaScriptLint variable declaration checking

$rdf.IndexedFormula = function() {

var owl_ns = "http://www.w3.org/2002/07/owl#";
var link_ns = "http://www.w3.org/2006/link#";

/* hashString functions are used as array indeces. This is done to avoid
** conflict with existing properties of arrays such as length and map.
** See issue 139.
*/
$rdf.Literal.prototype.hashString = $rdf.Literal.prototype.toNT;
$rdf.Symbol.prototype.hashString = $rdf.Symbol.prototype.toNT;
$rdf.BlankNode.prototype.hashString = $rdf.BlankNode.prototype.toNT;
$rdf.Collection.prototype.hashString = $rdf.Collection.prototype.toNT;


//Stores an associative array that maps URIs to functions
$rdf.IndexedFormula = function(features) {
    this.statements = [];    // As in Formula
    this.optional = [];
    this.propertyActions = []; // Array of functions to call when getting statement with {s X o}
    //maps <uri> to [f(F,s,p,o),...]
    this.classActions = [];   // Array of functions to call when adding { s type X }
    this.redirections = [];   // redirect to lexically smaller equivalent symbol
    this.aliases = [];   // reverse mapping to redirection: aliases for this
    this.HTTPRedirects = []; // redirections we got from HTTP
    this.subjectIndex = [];  // Array of statements with this X as subject
    this.predicateIndex = [];  // Array of statements with this X as subject
    this.objectIndex = [];  // Array of statements with this X as object
    this.whyIndex = [];     // Array of statements with X as provenance
    this.index = [ this.subjectIndex, this.predicateIndex, this.objectIndex, this.whyIndex ];
    this.namespaces = {} // Dictionary of namespace prefixes
    if (features === undefined) features = ["sameAs",
                    "InverseFunctionalProperty", "FunctionalProperty"];
//    this.features = features
    // Callbackify?
    function handleRDFType(formula, subj, pred, obj, why) {
        if (formula.typeCallback != undefined)
            formula.typeCallback(formula, obj, why);

        var x = formula.classActions[obj.hashString()];
        var done = false;
        if (x) {
            for (var i=0; i<x.length; i++) {                
                done = done || x[i](formula, subj, pred, obj, why);
            }
        }
        return done; // statement given is not needed if true
    } //handleRDFType

    //If the predicate is #type, use handleRDFType to create a typeCallback on the object
    this.propertyActions[
	'<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>'] = [ handleRDFType ];

    // Assumption: these terms are not redirected @@fixme
    if ($rdf.Util.ArrayIndexOf(features,"sameAs") >= 0)
        this.propertyActions['<http://www.w3.org/2002/07/owl#sameAs>'] = [
	function(formula, subj, pred, obj, why) {
            formula.equate(subj,obj);
            return true; // true if statement given is NOT needed in the store
	}]; //sameAs -> equate & don't add to index

    if ($rdf.Util.ArrayIndexOf(features,"InverseFunctionalProperty") >= 0)
        this.classActions["<"+owl_ns+"InverseFunctionalProperty>"] = [
            function(formula, subj, pred, obj, addFn) {
                return formula.newPropertyAction(subj, handle_IFP); // yes subj not pred!
            }]; //IFP -> handle_IFP, do add to index

    if ($rdf.Util.ArrayIndexOf(features,"FunctionalProperty") >= 0)
        this.classActions["<"+owl_ns+"FunctionalProperty>"] = [
            function(formula, subj, proj, obj, addFn) {
                return formula.newPropertyAction(subj, handle_FP);
            }]; //FP => handleFP, do add to index

    function handle_IFP(formula, subj, pred, obj)  {
        var s1 = formula.any(undefined, pred, obj);
        if (s1 == undefined) return false; // First time with this value
        formula.equate(s1, subj);
        return true;
    } //handle_IFP

    function handle_FP(formula, subj, pred, obj)  {
        var o1 = formula.any(subj, pred, undefined);
        if (o1 == undefined) return false; // First time with this value
        formula.equate(o1, obj);
        return true ;
    } //handle_FP

} /* end IndexedFormula */

$rdf.IndexedFormula.prototype = new $rdf.Formula();
$rdf.IndexedFormula.prototype.constructor = $rdf.IndexedFormula;
$rdf.IndexedFormula.SuperClass = $rdf.Formula;

$rdf.IndexedFormula.prototype.newPropertyAction = function newPropertyAction(pred, action) {
    //$rdf.log.debug("newPropertyAction:  "+pred);
    var hash = pred.hashString();
    if (this.propertyActions[hash] == undefined)
        this.propertyActions[hash] = [];
    this.propertyActions[hash].push(action);
    // Now apply the function to to statements already in the store
    var toBeFixed = this.statementsMatching(undefined, pred, undefined);
    done = false;
    for (var i=0; i<toBeFixed.length; i++) { // NOT optimized - sort toBeFixed etc
        done = done || action(this, toBeFixed[i].subject, pred, toBeFixed[i].object);
    }
    return done;
}

$rdf.IndexedFormula.prototype.setPrefixForURI = function(prefix, nsuri) {
    //TODO:This is a hack for our own issues, which ought to be fixed post-release
    //See http://dig.csail.mit.edu/cgi-bin/roundup.cgi/$rdf/issue227
    if(prefix=="tab" && this.namespaces["tab"]) {
        return;
    }
    this.namespaces[prefix] = nsuri
}

// Deprocated ... name too generic
$rdf.IndexedFormula.prototype.register = function(prefix, nsuri) {
    this.namespaces[prefix] = nsuri
}


/** simplify graph in store when we realize two identifiers are equal

We replace the bigger with the smaller.

*/
$rdf.IndexedFormula.prototype.equate = function(u1, u2) {
    //$rdf.log.info("Equating "+u1+" and "+u2)
    //@@JAMBO Must canonicalize the uris to prevent errors from a=b=c
    //03-21-2010
    u1 = this.canon( u1 );
    u2 = this.canon( u2 );
    var d = u1.compareTerm(u2);
    if (!d) return true; // No information in {a = a}
    var big, small;
    if (d < 0)  {  // u1 less than u2
	    return this.replaceWith(u2, u1);
    } else {
	    return this.replaceWith(u1, u2);
    }
}

// Replace big with small, obsoleted with obsoleting.
//
$rdf.IndexedFormula.prototype.replaceWith = function(big, small) {
    //$rdf.log.debug("Replacing "+big+" with "+small) // @@
    var oldhash = big.hashString();
    var newhash = small.hashString();

    var moveIndex = function(ix) {
        var oldlist = ix[oldhash];
        if (oldlist == undefined) return; // none to move
        var newlist = ix[newhash];
        if (newlist == undefined) {
            ix[newhash] = oldlist;
        } else {
            ix[newhash] = oldlist.concat(newlist);
        }
        delete ix[oldhash];    
    }
    
    // the canonical one carries all the indexes
    for (var i=0; i<4; i++) {
        moveIndex(this.index[i]);
    }

    this.redirections[oldhash] = small;
    if (big.uri) {
        //@@JAMBO: must update redirections,aliases from sub-items, too.
	    if (this.aliases[newhash] == undefined)
	        this.aliases[newhash] = [];
	    this.aliases[newhash].push(big); // Back link
        
        if( this.aliases[oldhash] ) {
            for( var i = 0; i < this.aliases[oldhash].length; i++ ) {
                this.redirections[this.aliases[oldhash][i].hashString()] = small;
                this.aliases[newhash].push(this.aliases[oldhash][i]);
            }            
        }
        
	    this.add(small, this.sym('http://www.w3.org/2006/link#uri'), big.uri)
        
	    // If two things are equal, and one is requested, we should request the other.
	    if (this.sf) {
	        this.sf.nowKnownAs(big, small)
	    }    
    }
    
    moveIndex(this.classActions);
    moveIndex(this.propertyActions);

    //$rdf.log.debug("Equate done. "+big+" to be known as "+small)    
    return true;  // true means the statement does not need to be put in
};

// Return the symbol with canonical URI as smushed
$rdf.IndexedFormula.prototype.canon = function(term) {
    if (term == undefined) return term;
    var y = this.redirections[term.hashString()];
    if (y == undefined) return term;
    return y;
}

// Compare by canonical URI as smushed
$rdf.IndexedFormula.prototype.sameThings = function(x, y) {
    if (x.sameTerm(y)) return true;
    var x1 = this.canon(x);
//    alert('x1='+x1);
    if (x1 == undefined) return false;
    var y1 = this.canon(y);
//    alert('y1='+y1); //@@
    if (y1 == undefined) return false;
    return (x1.uri == y1.uri);
}

// A list of all the URIs by which this thing is known
$rdf.IndexedFormula.prototype.uris = function(term) {
    var cterm = this.canon(term)
    var terms = this.aliases[cterm.hashString()];
    if (!cterm.uri) return []
    var res = [ cterm.uri ]
    if (terms != undefined) {
	for (var i=0; i<terms.length; i++) {
	    res.push(terms[i].uri)
	}
    }
    return res
}

// On input parameters, convert constants to terms
// 
function RDFMakeTerm(formula,val, canonicalize) {
    if (typeof val != 'object') {   
	    if (typeof val == 'string')
	        return new $rdf.Literal(val);
        if (typeof val == 'number')
            return new $rdf.Literal(val); // @@ differet types
        if (typeof val == 'boolean')
            return new $rdf.Literal(val?"1":"0", undefined, 
                                    $rdf.Symbol.prototype.XSDboolean);
	    else if (typeof val == 'number')
	        return new $rdf.Literal(''+val);   // @@ datatypes
	    else if (typeof val == 'undefined')
	        return undefined;
	    else    // @@ add converting of dates and numbers
	        throw "Can't make Term from " + val + " of type " + typeof val; 
    }
    return val;
}

// add a triple to the store
$rdf.IndexedFormula.prototype.add = function(subj, pred, obj, why) {
    var actions, st;
    if (why == undefined) why = this.fetcher ? this.fetcher.appNode: this.sym("chrome:theSession"); //system generated
                               //defined in source.js, is this OK with identity.js only user?
    subj = RDFMakeTerm(this, subj);
    pred = RDFMakeTerm(this, pred);
    obj = RDFMakeTerm(this, obj);
    why = RDFMakeTerm(this, why);
    
    var hash = [ this.canon(subj).hashString(), this.canon(pred).hashString(),
            this.canon(obj).hashString(), this.canon(why).hashString()];


    if (this.predicateCallback != undefined)
	this.predicateCallback(this, pred, why);
	
    // Action return true if the statement does not need to be added
    var actions = this.propertyActions[hash[1]]; // Predicate hash
    var done = false;
    if (actions) {
        // alert('type: '+typeof actions +' @@ actions='+actions);
        for (var i=0; i<actions.length; i++) {
            done = done || actions[i](this, subj, pred, obj, why);
        }
    }
    
    //If we are tracking provenanance, every thing should be loaded into the store
    //if (done) return new Statement(subj, pred, obj, why); // Don't put it in the store
                                                             // still return this statement for owl:sameAs input
    var st = new $rdf.Statement(subj, pred, obj, why);
    for (var i=0; i<4; i++) {
        var ix = this.index[i];
        var h = hash[i];
        if (ix[h] == undefined) ix[h] = [];
        ix[h].push(st); // Set of things with this as subject
    }
    
    //$rdf.log.debug("ADDING    {"+subj+" "+pred+" "+obj+"} "+why);
    this.statements.push(st);
    return st;
}; //add


// Find out whether a given URI is used as symbol in the formula
$rdf.IndexedFormula.prototype.mentionsURI = function(uri) {
    var hash = '<' + uri + '>';
    return (!!this.subjectIndex[hash] || !!this.objectIndex[hash]
            || !!this.predicateIndex[hash]);
}

// Find an unused id for a file being edited: return a symbol
// (Note: Slow iff a lot of them -- could be O(log(k)) )
$rdf.IndexedFormula.prototype.nextSymbol = function(doc) {
    for(var i=0;;i++) {
        var uri = doc.uri + '#n' + i;
        if (!this.mentionsURI(uri)) return this.sym(uri);
    }
}


$rdf.IndexedFormula.prototype.anyStatementMatching = function(subj,pred,obj,why) {
    var x = this.statementsMatching(subj,pred,obj,why,true);
    if (!x || x == []) return undefined;
    return x[0];
};


// Return statements matching a pattern
// ALL CONVENIENCE LOOKUP FUNCTIONS RELY ON THIS!
$rdf.IndexedFormula.prototype.statementsMatching = function(subj,pred,obj,why,justOne) {
    //$rdf.log.debug("Matching {"+subj+" "+pred+" "+obj+"}");
    
    var pat = [ subj, pred, obj, why ];
    var pattern = [];
    var hash = [];
    var wild = []; // wildcards
    var given = []; // Not wild
    for (var p=0; p<4; p++) {
        pattern[p] = this.canon(RDFMakeTerm(this, pat[p]));
        if (pattern[p] == undefined) {
            wild.push(p);
        } else {
            given.push(p);
            hash[p] = pattern[p].hashString();
        }
    }
    if (given.length == 0) {
        return this.statements;
    }
    if (given.length == 1) {  // Easy too, we have an index for that
        var p = given[0];
        var list = this.index[p][hash[p]];
        if(list && justOne) {
            if(list.length>1)
                list = list.slice(0,1);
        }
        return list == undefined ? [] : list;
    }
    
    // Now given.length is 2, 3 or 4.
    // We hope that the scale-free nature of the data will mean we tend to get
    // a short index in there somewhere!
    
    var best = 1e10; // really bad
    var best_i;
    for (var i=0; i<given.length; i++) {
        var p = given[i]; // Which part we are dealing with
        var list = this.index[p][hash[p]];
        if (list == undefined) return []; // No occurrences
        if (list.length < best) {
            best = list.length;
            best_i = i;  // (not p!)
        }
    }
    
    // Ok, we have picked the shortest index but now we have to filter it
    var best_p = given[best_i];
    var possibles = this.index[best_p][hash[best_p]];
    var check = given.slice(0, best_i).concat(given.slice(best_i+1)) // remove best_i
    var results = [];
    var parts = [ 'subject', 'predicate', 'object', 'why'];
    for (var j=0; j<possibles.length; j++) {
        var st = possibles[j];
        for (var i=0; i <check.length; i++) { // for each position to be checked
            var p = check[i];
            if (!this.canon(st[parts[p]]).sameTerm(pattern[p])) {
                st = null; 
                break;
            }
        }
        if (st != null) results.push(st);
    }

    if(justOne) {
        if(results.length>1)
            results = results.slice(0,1);
    }
    return results;
}; // statementsMatching

/** remove a particular statement from the bank **/
$rdf.IndexedFormula.prototype.remove = function (st) {
    //$rdf.log.debug("entering remove w/ st=" + st);
    var term = [ st.subject, st.predicate, st.object, st.why];
    for (var p=0; p<4; p++) {
        var c = this.canon(term[p]);
        var h = c.hashString();
        if (this.index[p][h] == undefined) {
            //$rdf.log.warn ("Statement removal: no index '+p+': "+st);
        } else {
            $rdf.Util.RDFArrayRemove(this.index[p][h], st);
        }
    }
    $rdf.Util.RDFArrayRemove(this.statements, st);
}; //remove

/** remove all statements matching args (within limit) **/
$rdf.IndexedFormula.prototype.removeMany = function (subj, pred, obj, why, limit) {
    //$rdf.log.debug("entering removeMany w/ subj,pred,obj,why,limit = " + subj +", "+ pred+", " + obj+", " + why+", " + limit);
    var sts = this.statementsMatching (subj, pred, obj, why, false);
    //This is a subtle bug that occcured in updateCenter.js too.
    //The fact is, this.statementsMatching returns this.whyIndex instead of a copy of it
    //but for perfromance consideration, it's better to just do that
    //so make a copy here.
    var statements = [];
    for (var i=0;i<sts.length;i++) statements.push(sts[i]);
    if (limit) statements = statements.slice(0, limit);
    for (var i=0;i<statements.length;i++) this.remove(statements[i]);
}; //removeMany

/** Utility**/

/*  @method: copyTo
    @discription: replace @template with @target and add appropriate triples (no triple removed)
                  one-direction replication 
*/ 
$rdf.IndexedFormula.prototype.copyTo = function(template,target,flags){
    if (!flags) flags=[];
    var statList=this.statementsMatching(template);
    if ($rdf.Util.ArrayIndexOf(flags,'two-direction')!=-1) 
        statList.concat(this.statementsMatching(undefined,undefined,template));
    for (var i=0;i<statList.length;i++){
        var st=statList[i];
        switch (st.object.termType){
            case 'symbol':
                this.add(target,st.predicate,st.object);
                break;
            case 'literal':
            case 'bnode':
            case 'collection':
                this.add(target,st.predicate,st.object.copy(this));
        }
        if ($rdf.Util.ArrayIndexOf(flags,'delete')!=-1) this.remove(st);
    }
};
//for the case when you alter this.value (text modified in userinput.js)
$rdf.Literal.prototype.copy = function(){ 
    return new $rdf.Literal(this.value,this.lang,this.datatype);
};
$rdf.BlankNode.prototype.copy = function(formula){ //depends on the formula
    var bnodeNew=new $rdf.BlankNode();
    formula.copyTo(this,bnodeNew);
    return bnodeNew;
}
/**  Full N3 bits  -- placeholders only to allow parsing, no functionality! **/

$rdf.IndexedFormula.prototype.newUniversal = function(uri) {
    var x = this.sym(uri);
    if (!this._universalVariables) this._universalVariables = [];
    this._universalVariables.push(x);
    return x;
}

$rdf.IndexedFormula.prototype.newExistential = function(uri) {
    if (!uri) return this.bnode();
    var x = this.sym(uri);
    return this.declareExistential(x);
}

$rdf.IndexedFormula.prototype.declareExistential = function(x) {
    if (!this._existentialVariables) this._existentialVariables = [];
    this._existentialVariables.push(x);
    return x;
}

$rdf.IndexedFormula.prototype.formula = function(features) {
    return new $rdf.IndexedFormula(features);
}

$rdf.IndexedFormula.prototype.close = function() {
    return this;
}

$rdf.IndexedFormula.prototype.hashString = $rdf.IndexedFormula.prototype.toNT;

return $rdf.IndexedFormula;

}();
// ends
// Matching a formula against another formula
//
//
// W3C open source licence 2005.
//
// This builds on term.js, match.js (and identity.js?)
// to allow a query of a formula.
// Here we introduce for the first time a subclass of term: variable.
//
// SVN ID: $Id: query.js 25116 2008-11-15 16:13:48Z timbl $

//  Variable
//
// Compare with BlankNode.  They are similar, but a variable
// stands for something whose value is to be returned.
// Also, users name variables and want the same name back when stuff is printed

/*jsl:option explicit*/ // Turn on JavaScriptLint variable declaration checking


//The Query object.  Should be very straightforward.
$rdf.Query = function (name, id) {
    this.pat = new $rdf.IndexedFormula();
    this.vars = [];
    this.orderBy = [];
    this.name=name;
    this.id=id;
}

/**The QuerySource object stores a set of listeners and a set of queries.
 * It keeps the listeners aware of those queries that the source currently
 * contains, and it is then up to the listeners to decide what to do with
 * those queries in terms of displays.
 * @constructor
 * @author jambo
 */
$rdf.QuerySource = function() {
    /**stores all of the queries currently held by this source, indexed by ID number.
     */
    this.queries=[];
    /**stores the listeners for a query object.
     * @see TabbedContainer
     */
    this.listeners=[];

    /**add a Query object to the query source--It will be given an ID number
     * and a name, if it doesn't already have one. This subsequently adds the
     * query to all of the listeners the QuerySource knows about.
     */
    this.addQuery = function(q) {
        var i;
        if(q.name==null || q.name=="")
				    q.name="Query #"+(this.queries.length+1);
        q.id=this.queries.length;
        this.queries.push(q);
        for(i=0; i<this.listeners.length; i++) {
            if(this.listeners[i]!=null)
                this.listeners[i].addQuery(q);
        }
    };

    /**Remove a Query object from the source.  Tells all listeners to also
     * remove the query.
     */
    this.removeQuery = function(q) {
        var i;
        for(i=0; i<this.listeners.length; i++) {
            if(this.listeners[i]!=null)
                this.listeners[i].removeQuery(q);
        }
        if(this.queries[q.id]!=null)
            delete this.queries[q.id];
    };

    /**adds a "Listener" to this QuerySource - that is, an object
     * which is capable of both adding and removing queries.
     * Currently, only the TabbedContainer class is added.
     * also puts all current queries into the listener to be used.
     */
    this.addListener = function(listener) {
        var i;
        this.listeners.push(listener);
        for(i=0; i<this.queries.length; i++) {
            if(this.queries[i]!=null)
                listener.addQuery(this.queries[i]);
        }
    };
    /**removes listener from the array of listeners, if it exists! Also takes
     * all of the queries from this source out of the listener.
     */
    this.removeListener = function(listener) {
        var i;
        for(i=0; i<this.queries.length; i++) {
            if(this.queries[i]!=null)
                listener.removeQuery(this.queries[i]);
        }

        for(i=0; i<this.listeners.length; i++) {
            if(this.listeners[i]===listener) {
                delete this.listeners[i];
            }
        } 
    };
}

$rdf.Variable.prototype.isVar = 1;
$rdf.BlankNode.prototype.isVar = 1;
$rdf.BlankNode.prototype.isBlank = 1;
$rdf.Symbol.prototype.isVar = 0;
$rdf.Literal.prototype.isVar = 0;
$rdf.Formula.prototype.isVar = 0;
$rdf.Collection.prototype.isVar = 0;

// fetcher returns > 0 if it has requested a URI to be looked up
// fetcher() waits for all the requested URIs to come in
$rdf.IndexedFormula.prototype.query = function(foodog, callback, fetcher) {
    var kb = this;
    //FUNCTIONS!! 
    //TODO:  Do these work here?


// Unification: see also 
//  http://www.w3.org/2000/10/swap/term.py
// for similar things in python
//
// Unification finds all bindings such that when the binding is applied
// to one term it is equal to the other.


function RDFUnifyTerm(self, other, bindings, formula) {
    var actual = bindings[self];
    if (typeof actual == 'undefined') { // Not mapped
        if (self.isVar) {
        	/*if (self.isBlank)  //bnodes are existential variables
        	{
        		if (self.toString() == other.toString()) return [[ [], null]];
        		else return [];
        	}*/
            var b = [];
            b[self] = other;
            return [[  b, null ]]; // Match
        }
        actual = self;
    }
    if (!actual.complexType) {
        if (formula.redirections[actual]) actual = formula.redirections[actual];
        if (formula.redirections[other])  other  = formula.redirections[other];
        if (actual.sameTerm(other)) return [[ [], null]];
        return [];
    }
    if (self instanceof Array) {
        if (!(other instanceof Array)) return [];
        return RDFArrayUnifyContents(self, other, bindings)
    };
    alert('oops - code not written yet');
    return undefined;  // for lint 
//    return actual.unifyContents(other, bindings)
}; //RDFUnifyTerm



function RDFArrayUnifyContents(self, other, bindings, formula) {
    if (self.length != other.length) return []; // no way
    if (!self.length) return [[ [], null ]]; // Success
    var nbs = RDFUnifyTerm(self[0], other[0], bindings, formula);
    if (nbs == []) return nbs;
    var res = [];
    var i, n=nbs.length, nb, b2, j, m, v, nb2;
    for (i=0; i<n; i++) { // for each possibility from the first term
        nb = nbs[i][0]; // new bindings
        var bindings2 = [];
        for (v in nb) {
            bindings2[v] = nb[v]; // copy
        }
        for (v in bindings) bindings2[v] = bindings[v]; // copy
        var nbs2 = RDFArrayUnifyContents(self.slice(1), other.slice(1), bindings2, formula);
        m = nbs2.length;
        for (j=0; j<m; j++) {
            var nb2 = nbs2[j][0];   //@@@@ no idea whether this is used or right
            for (v in nb) nb2[v]=nb[v];
            res.push([nb2, null]);
        }
    }
    return res;
} //RDFArrayUnifyContents



//  Matching
//
// Matching finds all bindings such that when the binding is applied
// to one term it is equal to the other term.  We only match formulae.

/** if x is not in the bindings array, return the var; otherwise, return the bindings **/
function RDFBind(x, binding) {
    var y = binding[x];
    if (typeof y == 'undefined') return x;
    return y;
}



/** prepare -- sets the index of the item to the possible matches
    * @param f - formula
    * @param item - an Statement, possibly w/ vars in it
    * @param bindings - 
* @returns true if the query fails -- there are no items that match **/
function prepare(f, item, bindings) {
    item.nvars = 0;
    item.index = null;
    if (!f.statements) $rdf.log.warn("@@@ prepare: f is "+f);
//    $rdf.log.debug("Prepare: f has "+ f.statements.length);
    $rdf.log.debug("Prepare: Kb size "+f.statements.length+" Preparing "+item);
    
    var t,c,terms = [item.subject,item.predicate,item.object],ind = [f.subjectIndex,f.predicateIndex,f.objectIndex];
    for (i=0;i<3;i++)
    {
    	//alert("Prepare "+terms[i]+" "+(terms[i] in bindings));
    	if (terms[i].isVar && !(terms[i] in bindings)) {
        	item.nvars++;
    	} else {
        	var t = RDFBind(terms[i], bindings); //returns the RDF binding if bound, otherwise itself
        	//if (terms[i]!=RDFBind(terms[i],bindings) alert("Term: "+terms[i]+"Binding: "+RDFBind(terms[i], bindings));
        	if (f.redirections[t.hashString()]) t = f.redirections[t.hashString()]; //redirect
        	termIndex=ind[i]
        	item.index = termIndex[t.hashString()];
        	if (typeof item.index == 'undefined') {
            	$rdf.log.debug("prepare: no occurrence [yet?] of term: "+ t);
            	item.index = [];
        	}
    	}
    }
    	
    if (item.index == null) item.index = f.statements;
    // $rdf.log.debug("Prep: index length="+item.index.length+" for "+item)
    $rdf.log.debug("prepare: index length "+item.index.length +" for "+ item);
    return false;
} //prepare
    
/** sorting function -- negative if self is easier **/
// We always prefer to start with a URI to be able to browse a graph
// this is why we put off items with more variables till later.
function easiestQuery(self, other) {
    if (self.nvars != other.nvars) return self.nvars - other.nvars;
    return self.index.length - other.index.length;
}

var match_index = 0; //index
/** matches a pattern formula against the knowledge base, e.g. to find matches for table-view
* @param f - knowledge base formula
* @param g - pattern formula (may have vars)
* @param bindingsSoFar  - bindings accumulated in matching to date
* @param level - spaces to indent stuff also lets you know what level of recursion you're at
* @param fetcher - function (term, requestedBy) - myFetcher / AJAR_handleNewTerm / the sort
* @returns nothing **/
function match(f, g, bindingsSoFar, level, fetcher, callback, branchCount) {
    var sf = null;
    if( typeof tabulator != 'undefined' ) {
        sf = tabulator.sf;
    }
    $rdf.log.debug("match: f has "+f.statements.length+", g has "+g.statements.length)
    var pattern = g.statements;
    if (pattern.length == 0) { //when it's satisfied all the pattern triples
        $rdf.log.msg("REACHED CALLBACK WITH BINDINGS:")
        for (var b in bindingsSoFar) {
	    $rdf.log.msg("b=" + b + ", bindingsSoFar[b]=" + bindingsSoFar[b])
	}
        if (callback) callback(bindingsSoFar,g)
        branchCount.count--
        branchCount.success=true
        $rdf.log.debug("Branch Count at end: "+branchCount.count)
        return [[ [], null ]]; // Success
    }
    var item, i, n=pattern.length;
    //$rdf.log.debug(level + "Match "+n+" left, bs so far:"+bindingDebug(bindingsSoFar))

    // Follow links from variables in query
    if (fetcher) {   //Fetcher is used to fetch URIs, function first term is a URI term, second is the requester
        var id = "match" + match_index++;
	var fetchResource = function (requestedTerm, id) {
      var path = requestedTerm.uri;
      if(path.indexOf("#")!=-1) {
          path=path.split("#")[0];
      }
      if( sf ) {
	    sf.addCallback('done', function(uri) {
			       if ((kb.canon(kb.sym(uri)).uri != path) && (uri != kb.canon(kb.sym(path)))) {
				   return true
			       }

			       match(f, g, bindingsSoFar, level, fetcher, // @@tbl was match2
				      callback, branchCount)
			       return false
			   })
      }
            fetcher(requestedTerm, id)	    
	}
    for (i=0; i<n; i++) {
            item = pattern[i];  //for each of the triples in the query
            if (item.subject in bindingsSoFar 
		&& bindingsSoFar[item.subject].uri
		&& sf && sf.getState($rdf.Util.uri.docpart(bindingsSoFar[item.subject].uri)) == "unrequested") {
		//fetch the subject info and return to id
		fetchResource(bindingsSoFar[item.subject],id)
		return; //@@tbl
            } else if (item.object in bindingsSoFar
		       && bindingsSoFar[item.object].uri
		       && sf && sf.getState($rdf.Util.uri.docpart(bindingsSoFar[item.object].uri)) == "unrequested") {
                fetchResource(bindingsSoFar[item.object], id)
		return; //@@tbl
//            } else {
//		match2(f, g, bindingsSoFar, level, fetcher, callback,
//		       branchCount)
	    }
        }
//    } else {
        match2(f, g, bindingsSoFar, level, fetcher, callback, branchCount)
    }
    return; //when the sources have been fetched, match2 will be called
}
/** match2 -- stuff after the fetch **/
function match2(f, g, bindingsSoFar, level, fetcher, callback, branchCount) //post-fetch
{
    var pattern = g.statements, n = pattern.length, i;
    for (i=0; i<n; i++) {  //For each statement left in the query, run prepare
        item = pattern[i];
        $rdf.log.info("match2: item=" + item + ", bindingsSoFar=" + bindingDebug(bindingsSoFar));
        prepare(f, item, bindingsSoFar);
    }
    pattern.sort(easiestQuery);
    // $rdf.log.debug("Sorted pattern:\n"+pattern)
    var item = pattern[0];
    var rest = f.formula();
    rest.optional = g.optional;
    rest.constraints = g.constraints;
    rest.statements = pattern.slice(1); // No indexes: we will not query g. 
    $rdf.log.debug(level + "Match2 searching "+item.index.length+ " for "+item+
            "; bindings so far="+bindingDebug(bindingsSoFar));
    //var results = [];
    var c, nc=item.index.length, nbs1, x;
    for (c=0; c<nc; c++) {   // For each candidate statement
        var st = item.index[c]; //for each statement in the item's index, spawn a new match with that binding 
        nbs1 = RDFArrayUnifyContents(
                [item.subject, item.predicate, item.object],
        [st.subject, st.predicate, st.object], bindingsSoFar, f);
        $rdf.log.info(level+" From first: "+nbs1.length+": "+bindingsDebug(nbs1))
        var k, nk=nbs1.length, nb1, v;
        branchCount.count+=nk;
        for (k=0; k<nk; k++) {  // For each way that statement binds
            var bindings2 = [];
            var newBindings1 = nbs1[k][0]; 
            if (!constraintsSatisfied(newBindings1,g.constraints)) {branchCount--; continue;}
            for (v in newBindings1){
                bindings2[v] = newBindings1[v]; // copy
            }
            for (v in bindingsSoFar) {
                bindings2[v] = bindingsSoFar[v]; // copy
            }
            match(f, rest, bindings2, level+ '  ', fetcher, callback, branchCount); //call match
        }
    }
    branchCount.count--;
    $rdf.log.debug("BranchCount: "+branchCount.count);
    if (branchCount.count == 0 && !branchCount.success)
    {
    	branchCount.numTasks.val--;
    	//alert(branchCount.numTasks.val)
    	$rdf.log.debug("Branch finished. Tasks remaining: "+branchCount.numTasks.val+" Optional array length: "+g.optional.length);
    	if (branchCount.numTasks.val==0) branchCount.onFail();
    	//if (g.optional.length == 0 && branchCount.numTasks.val < 1) { branchCount.onComplete();}
    	//if (!branchCount.optional && branchCount.numTasks.val == -1) branchCount.onComplete();
    }
    //return results;
} //match

function constraintsSatisfied(bindings,constraints)
{
	var res=true;
	for (x in bindings) {
		if (constraints[x]) {
			var test = constraints[x].test;
			if (test && !test(bindings[x]))
				res=false;
    	}
	}
	return res;
}

///////////// Debug strings

function bindingsDebug(nbs) {
    var str = "Bindings:\n";
    var i, n=nbs.length;
    for (i=0; i<n; i++) {
        str+= bindingDebug(nbs[i][0])+'\n';
    };
    return str;
} //bindingsDebug

function bindingDebug(b) {
        var str = "", v;
        for (v in b) {
	    str += "    "+v+" -> "+b[v];
        }
        return str;
}


    if(!fetcher) {
        fetcher=function (x, requestedBy) {
            if (x == null) {
                return;
            } else {
                $rdf.Util.AJAR_handleNewTerm(kb, x, requestedBy);
            }
        };
    } 
    //prepare, oncallback: match1
    //match1: fetcher, oncallback: match2
    //match2, oncallback: populatetable
    //    $rdf.log.debug("Query F length"+this.statements.length+" G="+foodog)
    var f = this;
    $rdf.log.debug("Query on "+this.statements.length)
//    if (kb != this) alert("@@@@??? this="+ this)
	
	//kb.remoteQuery(foodog,'http://jena.hpl.hp.com:3040/backstage',callback);
	//return;
	function branchCount ()
	{
		this.count = 1;
		var tcount = function () { this.val = 1; return this }
		this.numTasks = tcount();
		this.success = false;
		this.onFail = function(){};
		//this.onComplete = callback({foodog.vars[0]:new $rdf.Literal("Done")})
		return this;
	}
	
	function optionalCallback (bindings,pat)
	{
		if (pat.optional.length==0) callback(bindings);
		//alert("OPTIONAL: "+pat.optional)
		var tcount = function () { this.val = pat.optional.length; return this};
		var tc = new tcount();
		for (x in pat.optional)
		{
			var bc = new branchCount();
			bc.onFail = function(){ callback(bindings); }
			bc.numTasks = tc;
			match(f,pat.optional[x],bindings,'',fetcher,optionalCallback,bc)
		}
		return this;
	}
	//alert("INIT OPT: "+foodog.pat.optional);
    setTimeout(function() { match(f, foodog.pat, foodog.pat.initBindings, '', fetcher, optionalCallback, new branchCount()); }, 0);
    //match(this, foodog, [], '', fetcher, callback);
    //    $rdf.log.debug("Returning from query length="+res.length+" bindings: "+bindingsDebug(res))
    /*var r, nr=res.length, b, v;
    for (r=0; r<nr; r++) {
        b = res[r][0];
        for (v in b) {
            if (v[0] == '_') { // bnodes' bindings are not to be returned
                delete res[r][0][v];
            }
        }
    }
    $rdf.log.debug("Returning from query length="+res.length+" bindings: "+bindingsDebug(res));
        
    return res;
    */
    return; //returns nothing; callback does the work
}; //query
//Converting between SPARQL queries and the $rdf query API

/*

function SQuery ()
{
	this.terms = [];
	return this;
}
	
STerm.prototype.toString = STerm.val;
SQuery.prototype.add = function (str) {this.terms.push()}*/

$rdf.queryToSPARQL = function(query)
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
			$rdf.log.debug("Found statement: "+st)
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
			$rdf.log.debug("Found optional query")
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
 
$rdf.SPARQLToQuery = function(SPARQL, testMode, kb)
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
	function isBnode(term) { return (typeof term == 'string' && (term.match(/^_:/)||term.match(/^$/))) }
	function isPrefix(term) { return (typeof term == 'string' && term.match(/:$/)) }
	function isPrefixedSymbol(term) { return (typeof term == 'string' && term.match(/^:|^[^_][^:]*:/)) } 
	function getPrefix(term) { var a = term.split(":"); return a[0] }
	function getSuffix(term) { var a = term.split(":"); return a[1] }
	function removeBrackets(term) { if (isSymbol(term)) {return term.slice(1,term.length-1)} else return term }	
	//takes a string and returns an array of strings and Literals in the place of literals
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
		else {$rdf.log.error ("SQARQL QUERY OOPS!"); return res}
		res[0] = str.slice(0,ind);
		var end = str.slice(ind+1).indexOf(br);
		if (end==-1) 
		{
			$rdf.log.error("SPARQL parsing error: no matching parentheses in literal "+str);
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
		$rdf.log.info("Literal found: "+res[1]);
		res = res.concat(parseLiterals(str.slice(end+ind+2))); //finds any other literals
		}
		return res;
	}
	
	
	function spaceDelimit (str)
	{
		var str = str.replace(/\(/g," ( ").replace(/\)/g," ) ").replace(/</g," <").replace(/>/g,"> ").replace(/{/g," { ").replace(/}/g," } ").replace(/[\t\n\r]/g," ").replace(/; /g," ; ").replace(/\. /g," . ").replace(/, /g," , ");
		$rdf.log.info("New str into spaceDelimit: \n"+str)
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
		for (var x=0;x<strarr.length;x++)
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
		for (var x=0;x<input.length;x++)
		{
			if (typeof input[x] != 'string') { res[x]=input[x]; continue }
			input[x]=fixSymbolBrackets(input[x])
			if (isVar(input[x]))
				res[x] = makeVar(input[x].slice(1));
			else if (isBnode(input[x]))
			{
				$rdf.log.info(input[x]+" was identified as a bnode.")
				res[x] = kb.bnode();
			}
			else if (isSymbol(input[x]))
			{
				$rdf.log.info(input[x]+" was identified as a symbol.");
				res[x] = kb.sym(removeBrackets(input[x]));
			}
			else if (isPrefixedSymbol(input[x]))
			{
				$rdf.log.info(input[x]+" was identified as a prefixed symbol");
				if (prefixes[getPrefix(input[x])])
					res[x] = kb.sym(input[x] = prefixes[getPrefix(input[x])]+getSuffix(input[x]));
				else
				{
					$rdf.log.error("SPARQL error: "+input[x]+" with prefix "+getPrefix(input[x])+" does not have a correct prefix entry.")
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
	$rdf.log.info("SPARQL Tokens: "+token2);
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
		//$rdf.log.warn("No instance of "+str+" in array "+arr);
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
		$rdf.log.info("SPARQL vars: "+input);
		for (x in input)
		{
			if (isVar(input[x]))
			{
				$rdf.log.info("Added "+input[x]+" to query variables from SPARQL");
				var v = makeVar(input[x].slice(1));
				query.vars.push(v);
				v.label=input[x].slice(1);

			}
			else
				$rdf.log.warn("Incorrect SPARQL variable in SELECT: "+input[x]);
		}
	}
	

	function getPrefixDeclarations (input)
	{
		
		var prefInd = arrayIndicesOf ("PREFIX",input), res = [];
		for (i in prefInd)
		{
			var a = input[prefInd[i]+1], b = input[prefInd[i]+2];
			if (!isPrefix(a))
				$rdf.log.error("Invalid SPARQL prefix: "+a);
			else if (!isSymbol(b))
				$rdf.log.error("Invalid SPARQL symbol: "+b);
			else
			{
				$rdf.log.info("Prefix found: "+a+" -> "+b);
				var pref = getPrefix(a), symbol = removeBrackets(b);
				res[pref]=symbol;
			}
		}
		return res;
	}
	
	function getMatchingBracket(arr,open,close)
	{
		$rdf.log.info("Looking for a close bracket of type "+close+" in "+arr);
		var index = 0
		for (i=0;i<arr.length;i++)
		{
			if (arr[i]==open) index++;
			if (arr[i]==close) index--;
			if (index<0) return i;
		}
		$rdf.log.error("Statement had no close parenthesis in SPARQL query");
		return 0;
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
	

	function setConstraint(input,pat)
	{
		if (input.length == 3 && input[0].termType=="variable" && (input[2].termType=="symbol" || input[2].termType=="literal"))
		{
			if (input[1]=="=")
			{
				$rdf.log.debug("Constraint added: "+input)
				pat.constraints[input[0]]=new constraintEqualTo(input[2])
			}
			else if (input[1]==">")
			{
				$rdf.log.debug("Constraint added: "+input)
				pat.constraints[input[0]]=new constraintGreaterThan(input[2])
			}
			else if (input[1]=="<")
			{
				$rdf.log.debug("Constraint added: "+input)
				pat.constraints[input[0]]=new constraintLessThan(input[2])
			}
			else
				$rdf.log.warn("I don't know how to handle the constraint: "+input);
		}
		else if (input.length == 6 && typeof input[0] == 'string' && input[0].toLowerCase() == 'regexp' 
					&& input[1] == '(' && input[5] == ')' && input[3] == ',' && input[4].termType == 'variable'
					&& input[2].termType == 'literal')
					{
						$rdf.log.debug("Constraint added: "+input)
						pat.constraints[input[4]]=new constraintRegexp(input[2].value)
					}
		
			//$rdf.log.warn("I don't know how to handle the constraint: "+input);
		
		//alert("length: "+input.length+" input 0 type: "+input[0].termType+" input 1: "+input[1]+" input[2] type: "+input[2].termType);
	}
	

	
	function setOptional (terms, pat)
	{
		$rdf.log.debug("Optional query: "+terms+" not yet implemented.");
		var opt = kb.formula();
		setWhere (terms, opt)
		pat.optional.push(opt);
	}
	
	function setWhere (input,pat)
	{
		var terms = toTerms(input)
		$rdf.log.debug("WHERE: "+terms)
		//var opt = arrayIndicesOf("OPTIONAL",terms);
		while (arrayIndexOf("OPTIONAL",terms))
		{
			opt = arrayIndexOf("OPTIONAL",terms)
			$rdf.log.debug("OPT: "+opt+" "+terms[opt]+" in "+terms);
			if (terms[opt+1]!="{") $rdf.log.warn("Bad optional opening bracket in word "+opt)
			var end = getMatchingBracket(terms.slice(opt+2),"{","}")
			if (end == -1) $rdf.log.error("No matching bracket in word "+opt)
			else
			{
				setOptional(terms.slice(opt+2,opt+2+end),pat);
				//alert(pat.statements[0].toNT())
				opt = arrayIndexOf("OPTIONAL",terms)
				end = getMatchingBracket(terms.slice(opt+2),"{","}")
				terms.splice(opt,end+3)
			}
		}
		$rdf.log.debug("WHERE after optionals: "+terms)
		while (arrayIndexOf("FILTER",terms))
		{
			var filt = arrayIndexOf("FILTER",terms);
			if (terms[filt+1]!="(") $rdf.log.warn("Bad filter opening bracket in word "+filt);
			var end = getMatchingBracket(terms.slice(filt+2),"(",")")
			if (end == -1) $rdf.log.error("No matching bracket in word "+filt)
			else
			{
				setConstraint(terms.slice(filt+2,filt+2+end),pat);
				filt = arrayIndexOf("FILTER",terms)
				end = getMatchingBracket(terms.slice(filt+2),"(",")")
				terms.splice(filt,end+3)
			}
		}
		$rdf.log.debug("WHERE after filters and optionals: "+terms)
		extractStatements (terms,pat)	
	}
	
	function extractStatements (terms, formula)
	{
		var arrayZero = new Array(1); arrayZero[0]=-1;  //this is just to add the beginning of the where to the periods index.
		var per = arrayZero.concat(arrayIndicesOf(".",terms));
		var stat = []
		for (var x=0;x<per.length-1;x++)
			stat[x]=terms.slice(per[x]+1,per[x+1])
		//Now it's in an array of statements
		for (x in stat)                             //THIS MUST BE CHANGED FOR COMMA, SEMICOLON
		{
			$rdf.log.info("s+p+o "+x+" = "+stat[x])
			var subj = stat[x][0]
			stat[x].splice(0,1)
			var sem = arrayZero.concat(arrayIndicesOf(";",stat[x]))
			sem.push(stat[x].length);
			var stat2 = []
			for (y=0;y<sem.length-1;y++)
				stat2[y]=stat[x].slice(sem[y]+1,sem[y+1])
			for (x in stat2)
			{
				$rdf.log.info("p+o "+x+" = "+stat[x])
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
					$rdf.log.info("Subj="+subj+" Pred="+pred+" Obj="+obj)
					formula.add(subj,pred,obj)
				}
			}
		}
	}
		
	//*******************************THE ACTUAL CODE***************************//	
	$rdf.log.info("SPARQL input: \n"+SPARQL);
	var q = new $rdf.Query();
	var sp = tokenize (SPARQL); //first tokenize everything
	var prefixes = getPrefixDeclarations(sp);
	if (!prefixes["rdf"]) prefixes["rdf"]="http://www.w3.org/1999/02/22-rdf-syntax-ns#";
	if (!prefixes["rdfs"]) prefixes["rdfs"]="http://www.w3.org/2000/01/rdf-schema#";
	var selectLoc = arrayIndexOf("SELECT", sp), whereLoc = arrayIndexOf("WHERE", sp);
	if (selectLoc<0 || whereLoc<0 || selectLoc>whereLoc)
	{
		$rdf.log.error("Invalid or nonexistent SELECT and WHERE tags in SPARQL query");
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
	    //sf.requestURI(st.subject.uri,"sparql:"+st.subject) Kenny: I remove these two
	    if($rdf.sf) $rdf.sf.lookUpThing(st.subject,"sparql:"+st.subject);
	}
	if (st.object.termType == 'symbol'
	    /*&& sf.isPending(st.object.uri)*/) {
	    //sf.requestURI(st.object.uri,"sparql:"+st.object)
	    if($rdf.sf) $rdf.sf.lookUpThing(st.object,"sparql:"+st.object);
	}
    }
    //alert(q.pat);
    return q;
    //checkVars()
    
    //*******************************************************************//
}

$rdf.SPARQLResultsInterpreter = function (xml, callback, doneCallback)
{

	function isVar(term) { return (typeof term == 'string' && term.match(/^[\?\$]/)) }
	function fixSymbolBrackets(term) { if (typeof term == 'string') return term.replace(/^&lt;/,"<").replace(/&gt;$/,">"); else return term }
	function isSymbol(term) { return (typeof term == 'string' && term.match(/^<[^>]*>$/)) }
	function isBnode(term) { return (typeof term == 'string' && (term.match(/^_:/)||term.match(/^$/))) }
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
		$rdf.log.info("Prefix: "+pref+"\nValue: "+attribute.value);
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
			$rdf.log.error("Incorrect SPARQL results - bad prefix");
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
		
		else $rdf.log.warn("Don't know how to handle xml binding term "+node);
		return false
	}
	function handleResult (result)
	{
		var resultBindings = [],bound=false;
		for (var x=0;x<result.childNodes.length;x++)
		{
			//alert(result[x].nodeName);
			if (result.childNodes[x].nodeType != 1) continue;
			if (handleP(result.childNodes[x].nodeName) != spns+"binding") {$rdf.log.warn("Bad binding node inside result"); continue;}
			var bind = result.childNodes[x];
			var bindVar = makeVar(bind.getAttribute('name'));
			var binding = null
			for (var y=0;y<bind.childNodes.length;y++)
				if (bind.childNodes[y].nodeType == 1) { binding = xmlMakeTerm(bind.childNodes[y]); break }
			if (!binding) { $rdf.log.warn("Bad binding"); return false }
			$rdf.log.info("var: "+bindVar+" binding: "+binding);
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
	
	if (sparql.nodeName != 'sparql') { $rdf.log.error("Bad SPARQL results XML"); return }
	
	for (var x=0;x<sparql.attributes.length;x++)  //deals with all the prefixes beforehand
		parsePrefix(sparql.attributes[x]);
		
	for (var x=0;x<sparql.childNodes.length;x++) //looks for the head and results childNodes
	{
		$rdf.log.info("Type: "+sparql.childNodes[x].nodeType+"\nName: "+sparql.childNodes[x].nodeName+"\nValue: "+sparql.childNodes[x].nodeValue);
		
		if (sparql.childNodes[x].nodeType==1 && handleP(sparql.childNodes[x].nodeName)== spns+"head")
			head = sparql.childNodes[x];
		else if (sparql.childNodes[x].nodeType==1 && handleP(sparql.childNodes[x].nodeName)==spns+"results")
			results = sparql.childNodes[x];
	}
	
	if (!results && !head) { $rdf.log.error("Bad SPARQL results XML"); return }
	
	for (var x=0;x<head.childNodes.length;x++) //@@does anything need to be done with these? Should we check against query vars?
	{
		if (head.childNodes[x].nodeType == 1 && handleP(head.childNodes[x].nodeName) == spns+"variable")
			$rdf.log.info("Var: "+head.childNodes[x].getAttribute('name'))
	}
	
	for (var x=0;x<results.childNodes.length;x++)
	{
		if (handleP(results.childNodes[x].nodeName)==spns+"result")
		{
			$rdf.log.info("Result # "+x);
			handleResult(results.childNodes[x]);
		}
	}
	
	if (doneCallback) doneCallback();
	return bindingList;
	//****END OF MAIN CODE*****
}
// Joe Presbrey <presbrey@mit.edu>
// 2007-07-15

$rdf.sparqlUpdate = function() {

var anonymize = function (obj) {
    return (obj.toNT().substr(0,2) == "_:")
    ? "?" + obj.toNT().substr(2)
    : obj.toNT();
}

var anonymizeNT = function(stmt) {
    return anonymize(stmt.subject) + " " +
    anonymize(stmt.predicate) + " " +
    anonymize(stmt.object) + " .";
}

var sparql = function(store) {
    this.store = store;
    this.ifps = {};
    this.fps = {};
}

sparql.prototype.editable = function(uri, kb) {
    var link = $rdf.Namespace("http://www.w3.org/2007/ont/link#");
    var httph = $rdf.Namespace("http://www.w3.org/2007/ont/httph#");
    var http = $rdf.Namespace("http://www.w3.org/2007/ont/http#");
    if (!kb) kb = this.store;
    if (!uri) return false; // Eg subject is bnode, no knowm doc to write to
    var request = kb.any(kb.sym($rdf.Util.uri.docpart(uri)), link("request"));
    if (request !== undefined) {
        var author_via = kb.each(request, httph("ms-author-via"));
        if (author_via.length)
            for (var i = 0; i < author_via.length; i++) {
                if (author_via[i] == "SPARQL" || author_via[i] == "DAV")
                    return true;
            }
        var status = kb.each(request, http("status"));
        if (status.length)
            for (var i = 0; i < status.length; i++) {
                if (status[i] == 200)
                    return false;
            }
    }
}

///////////  The identification of bnodes

sparql.prototype._statement_bnodes = function(st) {
    return [st.subject, st.predicate, st.object].filter(function(x){return x.isBlank});
}

sparql.prototype._cache_ifps = function() {
    // Make a cached list of [Inverse-]Functional properties
    // Call this once before calling context_statements
    var rdf = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    var owl = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
    this.ifps = {};
    var a = this.store.each(undefined, rdf('type'), owl('InverseFunctionalProperty'))
    for (var i=0; i<a.length; i++) {
        this.ifps[a[i].uri] = true;
    }
    this.fps = {};
    var a = this.store.each(undefined, rdf('type'), owl('FunctionalProperty'))
    for (var i=0; i<a.length; i++) {
        this.fps[a[i].uri] = true;
    }
}

sparql.prototype._bnode_context2 = function(x, source, depth) {
    // Return a list of statements which indirectly identify a node
    //  Depth > 1 if try further indirection.
    //  Return array of statements (possibly empty), or null if failure
    var sts = this.store.statementsMatching(undefined, undefined, x, source); // incoming links
    for (var i=0; i<sts.length; i++) {
        if (this.fps[sts[i].predicate.uri]) {
            var y = sts[i].subject;
            if (!y.isBlank)
                return [ sts[i] ];
            if (depth) {
                var res = this._bnode_context2(y, source, depth-1);
                if (res != null)
                    return res.concat([ sts[i] ]);
            }
        }        
    }
    var sts = this.store.statementsMatching(x, undefined, undefined, source); // outgoing links
    for (var i=0; i<sts.length; i++) {
        if (this.ifps[sts[i].predicate.uri]) {
            var y = sts[i].object;
            if (!y.isBlank)
                return [ sts[i] ];
            if (depth) {
                var res = this._bnode_context2(y, source, depth-1);
                if (res != undefined)
                    return res.concat([ sts[i] ]);
            }
        }        
    }
    return null; // Failure
}


sparql.prototype._bnode_context = function(x, source) {
    // Return a list of statements which indirectly identify a node
    //   Breadth-first
    for (var depth = 0; depth < 3; depth++) { // Try simple first 
        var con = this._bnode_context2(x, source, depth);
        if (con != null) return con;
    }
    throw ('Unable to uniquely identify bnode: '+ x.toNT());
}

sparql.prototype._statement_context = function(st) {
    var bnodes = this._statement_bnodes(st);
    var context = [];
    if (bnodes.length) {
        if (this.store.statementsMatching(st.subject.isBlank?undefined:st.subject,
                                  st.predicate.isBlank?undefined:st.predicate,
                                  st.object.isBlank?undefined:st.object,
                                  st.why).length <= 1) {
            context = context.concat(st);
        } else {
            this._cache_ifps();
            for (x in bnodes) {
                context = context.concat(this._bnode_context(bnodes[x], st.why));
            }
        }
    }
    return context;
}

sparql.prototype._context_where = function(context) {
        return (context == undefined || context.length == 0)
        ? ""
        : "WHERE { " + context.map(anonymizeNT).join("\n") + " }\n";
}

sparql.prototype._fire = function(uri, query, callback) {
    if (!uri) throw "No URI given for remote editing operation: "+query;
    var xhr = $rdf.Util.XMLHTTPFactory();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var success = (!xhr.status || (xhr.status >= 200 && xhr.status < 300));
            callback(uri, success, xhr.responseText);
        }
    }

    if(!isExtension) {
        try {
            $rdf.Util.enablePrivilege("UniversalBrowserRead")
        } catch(e) {
            alert("Failed to get privileges: " + e)
        }
    }
    
    xhr.open('POST', uri);
    xhr.setRequestHeader('Content-type', 'application/sparql-query');
    xhr.send(query);
}

sparql.prototype.update_statement = function(statement) {
    if (statement && statement.why == undefined) return;

    var sparql = this;
    var context = this._statement_context(statement);

    return {
        statement: statement?[statement.subject, statement.predicate, statement.object, statement.why]:undefined,
        statementNT: statement?anonymizeNT(statement):undefined,
        where: sparql._context_where(context),

        set_object: function(obj, callback) {
            query = this.where;
            query += "DELETE { " + this.statementNT + " }\n";
            query += "INSERT { " +
                anonymize(this.statement[0]) + " " +
                anonymize(this.statement[1]) + " " +
                anonymize(obj) + " " + " . }\n";
 
            sparql._fire(this.statement[3].uri, query, callback);
        }
    }
}

sparql.prototype.insert_statement = function(st, callback) {
    var st0 = st instanceof Array ? st[0] : st;
    var query = this._context_where(this._statement_context(st0));
    
    if (st instanceof Array) {
        var stText="";
        for (var i=0;i<st.length;i++) stText+=st[i]+'\n';
        //query += "INSERT { "+st.map(RDFStatement.prototype.toNT.call).join('\n')+" }\n";
        //the above should work, but gives an error "called on imcompatible XUL...scope..."
        query += "INSERT { " + stText + " }\n";
    } else {
        query += "INSERT { " +
            anonymize(st.subject) + " " +
            anonymize(st.predicate) + " " +
            anonymize(st.object) + " " + " . }\n";
    }
    
    this._fire(st0.why.uri, query, callback);
}

sparql.prototype.delete_statement = function(st, callback) {
    var query = this._context_where(this._statement_context(st));
    
    query += "DELETE { " + anonymizeNT(st) + " }\n";
    
    this._fire(st instanceof Array?st[0].why.uri:st.why.uri, query, callback);
}

return sparql;

}();
$rdf.jsonParser = function() {

    return {
        parseJSON: function( data, source, store ) {
            var subject, predicate, object;
            var bnodes = {};
            var why = store.sym(source);
            for (x in data) {
                if( x.indexOf( "_:") === 0 ) {
                    if( bnodes[x] ) {
                        subject = bnodes[x];
                    } else {
                        subject = store.bnode(x);
                        bnodes[x]=subject;
                    }
                } else {
                    subject = store.sym(x);
                }
                var preds = data[x];
                for (y in preds) {
                    var objects = preds[y];
                    predicate = store.sym(y);
                    for( z in objects ) {
                        var obj = objects[z];
                        if( obj.type === "uri" ) {
                            object = store.sym(obj.value);
                            store.add( subject, predicate, object, why );                            
                        } else if( obj.type === "bnode" ) {
                            if( bnodes[obj.value] ) {
                                object = bnodes[obj.value];
                            } else {
                                object = store.bnode(obj.value);
                                bnodes[obj.value] = object;
                            }
                            store.add( subject, predicate, object, why );
                        } else if( obj.type === "literal" ) {
                            var datatype;
                            if( obj.datatype ) {
                                object = store.literal(obj.value, undefined, store.sym(obj.datatype));
                            } else if ( obj.lang ) {
                                object = store.literal(obj.value, obj.lang);                                
                            } else {
                                object = store.literal(obj.value);
                            }
                            store.add( subject, predicate, object, why );
                        } else {
                            throw "error: unexpected termtype: "+z.type;
                        }
                    }
                }
            }
        }
    }
}();
/*      Serialization of RDF Graphs
**
** Tim Berners-Lee 2006
** This is or was http://dig.csail.mit.edu/2005/ajar/ajaw/js/rdf/serialize.js
**
** Bug: can't serialize  http://data.semanticweb.org/person/abraham-bernstein/rdf 
** in XML (from mhausenblas)
*/
$rdf.Serializer = function() {

var __Serializer = function( store ){
    this.flags = "";
    this.base = null;
    this.prefixes = [];
    this.keywords = ['a']; // The only one we generate at the moment
    this.prefixchars = "abcdefghijklmnopqustuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.incoming = null;  // Array not calculated yet
    this.formulas = [];  // remebering original formulae from hashes 
    this.store = store;

    /* pass */
}

var Serializer = function( store ) {return new __Serializer( store )}; 

__Serializer.prototype.setBase = function(base)
    { this.base = base };

__Serializer.prototype.setFlags = function(flags)
    { this.flags = flags?flags: '' };


__Serializer.prototype.toStr = function(x) {
        var s = x.toNT();
        if (x.termType == 'formula') {
            this.formulas[s] = x; // remember as reverse does not work
        }
        return s;
};
    
__Serializer.prototype.fromStr = function(s) {
        if (s[0] == '{') {
            var x = this.formulas[s];
            if (!x) alert('No formula object for '+s)
            return x;
        }
        return this.store.fromNT(s);
};
    




/* Accumulate Namespaces
** 
** These are only hints.  If two overlap, only one gets used
** There is therefore no guarantee in general.
*/

__Serializer.prototype.suggestPrefix = function(prefix, uri) {
    this.prefixes[uri] = prefix;
}

// Takes a namespace -> prefix map
__Serializer.prototype.suggestNamespaces = function(namespaces) {
    for (var px in namespaces) {
        this.prefixes[namespaces[px]] = px;
    }
}

// Make up an unused prefix for a random namespace
__Serializer.prototype.makeUpPrefix = function(uri) {
    var p = uri;
    var namespaces = [];
    var pok;
    var sz = this;
    
    function canUse(pp) {
        if (namespaces[pp]) return false; // already used

        sz.prefixes[uri] = pp;
        pok = pp;
        return true
    }
    for (var ns in sz.prefixes) {
        namespaces[sz.prefixes[ns]] = ns; // reverse index
    }
    if ('#/'.indexOf(p[p.length-1]) >= 0) p = p.slice(0, -1);
    var slash = p.lastIndexOf('/');
    if (slash >= 0) p = p.slice(slash+1);
    var i = 0;
    while (i < p.length)
        if (sz.prefixchars.indexOf(p[i])) i++; else break;
    p = p.slice(0,i);
    if (p.length < 6 && canUse(p)) return pok; // exact i sbest
    if (canUse(p.slice(0,3))) return pok;
    if (canUse(p.slice(0,2))) return pok;
    if (canUse(p.slice(0,4))) return pok;
    if (canUse(p.slice(0,1))) return pok;
    if (canUse(p.slice(0,5))) return pok;
    for (var i=0;; i++) if (canUse(p.slice(0,3)+i)) return pok; 
}


/* The scan is to find out which nodes will have to be the roots of trees
** in the serialized form. This will be any symbols, and any bnodes
** which hve more or less than one incoming arc, and any bnodes which have
** one incoming arc but it is an uninterrupted loop of such nodes back to itself.
** This should be kept linear time with repect to the number of statements.
** Note it does not use any indexing.
*/


// Todo:
//  - Sort the statements by subject, pred, object
//  - do stuff about the docu first and then (or first) about its primary topic.

__Serializer.prototype.rootSubjects = function(sts) {
    var incoming = [];
    var subjects = [];
    var sz = this;

    for (var i = 0; i<sts.length; i++) {
        var x = sts[i].object;
        if (!incoming[x]) incoming[x] = [];
        incoming[x].push(sts[i].subject) // List of things which will cause this to be printed
        var ss =  subjects[sz.toStr(sts[i].subject)]; // Statements with this as subject
        if (!ss) ss = [];
        ss.push(sts[i]);
        subjects[this.toStr(sts[i].subject)] = ss; // Make hash. @@ too slow for formula?
        //$rdf.log.debug(' sz potential subject: '+sts[i].subject)
    }

    var roots = [];
    var loopBreakers = [];
    
    function accountedFor(x, start) {
        if (x.termType != 'bnode') return true; // will be subject
        var zz = incoming[x];
        if (!zz || zz.length != 1) return true;
        if (loopBreakers[x]) return true;
        if (zz[0] == start) return false;
        return accountedFor(zz[0], start);
    }
    for (var xNT in subjects) {
        var x = sz.fromStr(xNT);
        if ((x.termType != 'bnode') || !incoming[x] || (incoming[x].length != 1)){
            roots.push(x);
            //$rdf.log.debug(' sz actual subject -: ' + x)
            continue;
        }
        if (accountedFor(incoming[x][0]), x) {
            continue;
        }
        roots.push(x);
        //$rdf.log.debug(' sz potential subject *: '+sts[i].subject)
        loopBreakers[x] = 1;
    }
    this.incoming = incoming; // Keep for serializing
    return [roots, subjects];
}

////////////////////////////////////////////////////////

__Serializer.prototype.toN3 = function(f) {
    return this.statementsToN3(f.statements);
}

__Serializer.prototype._notQNameChars = "\t\r\n !\"#$%&'()*.,+/;<=>?@[\\]^`{|}~";
__Serializer.prototype._notNameChars = 
                    ( __Serializer.prototype._notQNameChars + ":" ) ;

    
__Serializer.prototype.statementsToN3 = function(sts) {
    var indent = 4;
    var width = 80;
    // var subjects = null; // set later
    var sz = this;

    var namespaceCounts = []; // which have been used

    predMap = {
        'http://www.w3.org/2002/07/owl#sameAs': '=',
        'http://www.w3.org/2000/10/swap/log#implies': '=>',
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'a'
    }
    

    
    
    ////////////////////////// Arrange the bits of text 

    var spaces=function(n) {
        var s='';
        for(var i=0; i<n; i++) s+=' ';
        return s
    }

    treeToLine = function(tree) {
        var str = '';
        for (var i=0; i<tree.length; i++) {
            var branch = tree[i];
            var s2 = (typeof branch == 'string') ? branch : treeToLine(branch);
            if (i!=0 && s2 != ',' && s2 != ';' && s2 != '.') str += ' ';
            str += s2;
        }
        return str;
    }
    
    // Convert a nested tree of lists and strings to a string
    treeToString = function(tree, level) {
        var str = '';
        var lastLength = 100000;
        if (!level) level = 0;
        for (var i=0; i<tree.length; i++) {
            var branch = tree[i];
            if (typeof branch != 'string') {
                var substr = treeToString(branch, level +1);
                if (
                    substr.length < 10*(width-indent*level)
                    && substr.indexOf('"""') < 0) {// Don't mess up multiline strings
                    var line = treeToLine(branch);
                    if (line.length < (width-indent*level)) {
                        branch = '   '+line; //   @@ Hack: treat as string below
                        substr = ''
                    }
                }
                if (substr) lastLength = 10000;
                str += substr;
            }
            if (typeof branch == 'string') {
                if (branch.length == '1' && str.slice(-1) == '\n') {
                    if (",.;".indexOf(branch) >=0) {
                        str = str.slice(0,-1) + branch + '\n'; //  slip punct'n on end
                        lastLength += 1;
                        continue;
                    } else if ("])}".indexOf(branch) >=0) {
                        str = str.slice(0,-1) + ' ' + branch + '\n';
                        lastLength += 2;
                        continue;
                    }
                }
                if (lastLength < (indent*level+4)) { // continue
                    str = str.slice(0,-1) + ' ' + branch + '\n';
                    lastLength += branch.length + 1;
                } else {
                    var line = spaces(indent*level) +branch;
                    str += line +'\n'; 
                    lastLength = line.length;
                }
 
            } else { // not string
            }
        }
        return str;
    };

    ////////////////////////////////////////////// Structure for N3
    
    
    function statementListToTree(statements) {
        // print('Statement tree for '+statements.length);
        var res = [];
        var pair = sz.rootSubjects(statements);
        var roots = pair[0];
        // print('Roots: '+roots)
        var subjects = pair[1];
        var results = []
        for (var i=0; i<roots.length; i++) {
            var root = roots[i];
            results.push(subjectTree(root, subjects))
        }
        return results;
    }
    
    // The tree for a subject
    function subjectTree(subject, subjects) {
        if (subject.termType == 'bnode' && !sz.incoming[subject])
            return objectTree(subject, subjects).concat(["."]); // Anonymous bnode subject
        return [ termToN3(subject, subjects) ].concat([propertyTree(subject, subjects)]).concat(["."]);
    }
    

    // The property tree for a single subject or anonymous node
    function propertyTree(subject, subjects) {
        // print('Proprty tree for '+subject);
        var results = []
        var lastPred = null;
        var sts = subjects[sz.toStr(subject)]; // relevant statements
        if (typeof sts == 'undefined') {
            alert('Cant find statements for '+subject);
        }
        sts.sort();
        var objects = [];
        for (var i=0; i<sts.length; i++) {
            var st = sts[i];
            if (st.predicate.uri == lastPred) {
                objects.push(',');
            } else {
                if (lastPred) {
                    results=results.concat([objects]).concat([';']);
                    objects = [];
                }
                results.push(predMap[st.predicate.uri] ?
                            predMap[st.predicate.uri] : termToN3(st.predicate, subjects));
            }
            lastPred = st.predicate.uri;
            objects.push(objectTree(st.object, subjects));
        }
        results=results.concat([objects]);
        return results;
    }

    // Convert a set of statements into a nested tree of lists and strings
    function objectTree(obj, subjects) {
        if (obj.termType == 'bnode' && subjects[sz.toStr(obj)] /* && !sz.incoming[st.object]*/) // and there are statements
            return  ['['].concat(propertyTree(obj, subjects)).concat([']']);
        return termToN3(obj, subjects);
    }
    
    ////////////////////////////////////////////// Atomic Terms
    
    //  Deal with term level things and nesting with no bnode structure
    
    function termToN3(expr, subjects) {
        switch(expr.termType) {
            case 'bnode':
            case 'variable':  return expr.toNT();
            case 'literal':
                var str = stringToN3(expr.value);
                if (expr.lang) str+= '@' + expr.lang;
                if (expr.datatype) str+= '^^' + termToN3(expr.datatype, subjects);
                return str;
            case 'symbol':
                return symbolToN3(expr.uri);
            case 'formula':
                var res = ['{'];
                res = res.concat(statementListToTree(expr.statements));
                return  res.concat(['}']);
            case 'collection':
                var res = ['('];
                for (i=0; i<expr.elements.length; i++) {
                    res.push(   [ objectTree(expr.elements[i], subjects) ]);
                }
                res.push(')');
                return res;
                
           default:
                throw "Internal: termToN3 cannot handle "+expr+" of termType+"+expr.termType
                return ''+expr;
        }
    }
    
    function symbolToN3(uri) {  // c.f. symbolString() in notation3.py
        var j = uri.indexOf('#');
        if (j<0 && sz.flags.indexOf('/') < 0) {
            j = uri.lastIndexOf('/');
        }
        if (j >= 0 && sz.flags.indexOf('p') < 0)  { // Can split at namespace
            var canSplit = true;
            for (var k=j+1; k<uri.length; k++) {
                if (__Serializer.prototype._notNameChars.indexOf(uri[k]) >=0) {
                    canSplit = false; break;
                }
            }
            if (canSplit) {
                var localid = uri.slice(j+1);
                var namesp = uri.slice(0,j+1);
                if (sz.defaultNamespace && sz.defaultNamespace == namesp
                    && sz.flags.indexOf('d') < 0) {// d -> suppress default
                    if (sz.flags.indexOf('k') >= 0 &&
                        sz.keyords.indexOf(localid) <0)
                        return localid; 
                    return ':' + localid;
                }
                var prefix = sz.prefixes[namesp];
                if (prefix) {
                    namespaceCounts[namesp] = true;
                    return prefix + ':' + localid;
                }
                if (uri.slice(0, j) == sz.base)
                    return '<#' + localid + '>';
                // Fall though if can't do qname
            }
        }
        if (sz.flags.indexOf('r') < 0 && sz.base)
            uri = $rdf.Util.uri.refTo(sz.base, uri);
        else if (sz.flags.indexOf('u') >= 0)
            uri = backslashUify(uri);
        else uri = hexify(uri);
        return '<'+uri+'>';
    }
    
    function prefixDirectives() {
        str = '';
	if (sz.defaultNamespace)
	  str += '@prefix : <'+sz.defaultNamespace+'>.\n';
        for (var ns in namespaceCounts) {
            str += '@prefix ' + sz.prefixes[ns] + ': <'+ns+'>.\n';
        }
        return str + '\n';
    }
    
    //  stringToN3:  String escaping for N3
    //
    var forbidden1 = new RegExp(/[\\"\b\f\r\v\t\n\u0080-\uffff]/gm);
    var forbidden3 = new RegExp(/[\\"\b\f\r\v\u0080-\uffff]/gm);
    function stringToN3(str, flags) {
        if (!flags) flags = "e";
        var res = '', i=0, j=0;
        var delim;
        var forbidden;
        if (str.length > 20 // Long enough to make sense
                && str.slice(-1) != '"'  // corner case'
                && flags.indexOf('n') <0  // Force single line
                && (str.indexOf('\n') >0 || str.indexOf('"') > 0)) {
            delim = '"""';
            forbidden =  forbidden3;
        } else {
            delim = '"';
            forbidden = forbidden1;
        }
        for(i=0; i<str.length;) {
            forbidden.lastIndex = 0;
            var m = forbidden.exec(str.slice(i));
            if (m == null) break;
            j = i + forbidden.lastIndex -1;
            res += str.slice(i,j);
            var ch = str[j];
            if (ch=='"' && delim == '"""' &&  str.slice(j,j+3) != '"""') {
                res += ch;
            } else {
                var k = '\b\f\r\t\v\n\\"'.indexOf(ch); // No escaping of bell (7)?
                if (k >= 0) {
                    res += "\\" + 'bfrtvn\\"'[k];
                } else  {
                    if (flags.indexOf('e')>=0) {
                        res += '\\u' + ('000'+
                         ch.charCodeAt(0).toString(16).toLowerCase()).slice(-4)
                    } else { // no 'e' flag
                        res += ch;
                    }
                }
            }
            i = j+1;
        }
        return delim + res + str.slice(i) + delim
    }

    // Body of toN3:
    
    var tree = statementListToTree(sts);
    return prefixDirectives() + treeToString(tree, -1);
    
}

// String ecaping utilities 

function hexify(str) { // also used in parser
//     var res = '';
//     for (var i=0; i<str.length; i++) {
//         k = str.charCodeAt(i);
//         if (k>126 || k<33)
//             res += '%' + ('0'+n.toString(16)).slice(-2); // convert to upper?
//         else
//             res += str[i];
//     }
//     return res;
  return encodeURI(str);
}


function backslashUify(str) {
    var res = '';
    for (var i=0; i<str.length; i++) {
        k = str.charCodeAt(i);
        if (k>65535)
            res += '\\U' + ('00000000'+n.toString(16)).slice(-8); // convert to upper?
        else if (k>126) 
            res += '\\u' + ('0000'+n.toString(16)).slice(-4);
        else
            res += str[i];
    }
    return res;
}






//////////////////////////////////////////////// XML serialization

__Serializer.prototype.statementsToXML = function(sts) {
    var indent = 4;
    var width = 80;
    // var subjects = null; // set later
    var sz = this;

    var namespaceCounts = []; // which have been used
    namespaceCounts['http://www.w3.org/1999/02/22-rdf-syntax-ns#'] = true;

    ////////////////////////// Arrange the bits of XML text 

    var spaces=function(n) {
        var s='';
        for(var i=0; i<n; i++) s+=' ';
        return s
    }

    XMLtreeToLine = function(tree) {
        var str = '';
        for (var i=0; i<tree.length; i++) {
            var branch = tree[i];
            var s2 = (typeof branch == 'string') ? branch : XMLtreeToLine(branch);
            str += s2;
        }
        return str;
    }
    
    // Convert a nested tree of lists and strings to a string
    XMLtreeToString = function(tree, level) {
        var str = '';
        var lastLength = 100000;
        if (!level) level = 0;
        for (var i=0; i<tree.length; i++) {
            var branch = tree[i];
            if (typeof branch != 'string') {
                var substr = XMLtreeToString(branch, level +1);
                if (
                    substr.length < 10*(width-indent*level)
                    && substr.indexOf('"""') < 0) {// Don't mess up multiline strings
                    var line = XMLtreeToLine(branch);
                    if (line.length < (width-indent*level)) {
                        branch = '   '+line; //   @@ Hack: treat as string below
                        substr = ''
                    }
                }
                if (substr) lastLength = 10000;
                str += substr;
            }
            if (typeof branch == 'string') {
                if (lastLength < (indent*level+4)) { // continue
                    str = str.slice(0,-1) + ' ' + branch + '\n';
                    lastLength += branch.length + 1;
                } else {
                    var line = spaces(indent*level) +branch;
                    str += line +'\n'; 
                    lastLength = line.length;
                }
 
            } else { // not string
            }
        }
        return str;
    };

    function statementListToXMLTree(statements) {
        sz.suggestPrefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');
        var res = [];
        var pair = sz.rootSubjects(statements);
        var roots = pair[0];
        var subjects = pair[1];
        results = []
        for (var i=0; i<roots.length; i++) {
            root = roots[i];
            results.push(subjectXMLTree(root, subjects))
        }
        return results;
    }
    
    function escapeForXML(str) {
        if (typeof str == 'undefined') return '@@@undefined@@@@';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    }

    function relURI(term) {
        return escapeForXML((sz.base) ? $rdf.Util.uri.refTo(this.base, term.uri) : term.uri);
    }

    // The tree for a subject
    function subjectXMLTree(subject, subjects) {
        var start
        if (subject.termType == 'bnode') {
            if (!sz.incoming[subject]) { // anonymous bnode
                var start = '<rdf:Description>';
            } else {
                var start = '<rdf:Description rdf:ID="'+subject.toNT().slice(2)+'">';
            }
        } else {
            var start = '<rdf:Description rdf:about="'+ relURI(subject)+'">';
        }

        return [ start ].concat(
                [propertyXMLTree(subject, subjects)]).concat(["</rdf:Description>"]);
    }
    function collectionXMLTree(subject, subjects) {
        res = []
        for (var i=0; i< subject.elements.length; i++) {
            res.push(subjectXMLTree(subject.elements[i], subjects));
         }
         return res;
    }   

    // The property tree for a single subject or anonymos node
    function propertyXMLTree(subject, subjects) {
        var results = []
        var sts = subjects[sz.toStr(subject)]; // relevant statements
        sts.sort();
        for (var i=0; i<sts.length; i++) {
            var st = sts[i];
            switch (st.object.termType) {
                case 'bnode':
                    /*if(!sz.incoming[st.object]) {
                    results = results.concat(['<'+qname(st.predicate)+' rdf:parseType="Resource">', 
                        propertyXMLTree(st.object, subjects),
                        '</'+qname(st.predicate)+'>']);
                    } else {
                        results = results.concat(['<'+qname(st.predicate)+' rdf:resource="#'+st.object.toNT().slice(2)+'">',
                        propertyXMLTree(st.object, subjects),
                        '</'+qname(st.predicate)+'>']);

                    }
                    break;*/
                    results = results.concat(['<'+qname(st.predicate)+' rdf:parseType="Resource">', 
                        propertyXMLTree(st.object, subjects),
                        '</'+qname(st.predicate)+'>']);
                    break;
                case 'symbol':
                    results = results.concat(['<'+qname(st.predicate)+' rdf:resource="'
                            + relURI(st.object)+'"/>']); 
                    break;
                case 'literal':
                    results = results.concat(['<'+qname(st.predicate)
                        + (st.object.datatype ? ' rdf:datatype="'+escapeForXML(st.object.datatype.uri)+'"' : '') 
                        + (st.object.lang ? ' xml:lang="'+st.object.lang+'"' : '') 
                        + '>' + escapeForXML(st.object.value)
                        + '</'+qname(st.predicate)+'>']);
                    break;
                case 'collection':
                    results = results.concat(['<'+qname(st.predicate)+' rdf:parseType="Collection">', 
                        collectionXMLTree(st.object, subjects),
                        '</'+qname(st.predicate)+'>']);
                    break;
                default:
                    throw "Can't serialize object of type "+st.object.termType +" into XML";
                
            } // switch
        }
        return results;
    }

    function qname(term) {
        var uri = term.uri;

        var j = uri.indexOf('#');
        if (j<0 && sz.flags.indexOf('/') < 0) {
            j = uri.lastIndexOf('/');
        }
        if (j < 0) throw ("Cannot make qname out of <"+uri+">")

        var canSplit = true;
        for (var k=j+1; k<uri.length; k++) {
            if (__Serializer.prototype._notNameChars.indexOf(uri[k]) >=0) {
                throw ('Invalid character "'+uri[k] +'" cannot be in XML qname for URI: '+uri); 
            }
        }
        var localid = uri.slice(j+1);
        var namesp = uri.slice(0,j+1);
        if (sz.defaultNamespace && sz.defaultNamespace == namesp
            && sz.flags.indexOf('d') < 0) {// d -> suppress default
            return localid;
        }
        var prefix = sz.prefixes[namesp];
        if (!prefix) prefix = sz.makeUpPrefix(namesp);
        namespaceCounts[namesp] = true;
        return prefix + ':' + localid;
//        throw ('No prefix for namespace "'+namesp +'" for XML qname for '+uri+', namespaces: '+sz.prefixes+' sz='+sz); 
    }

    // Body of toXML:
    
    var tree = statementListToXMLTree(sts);
    var str = '<rdf:RDF';
    if (sz.defaultNamespace)
      str += ' xmlns="'+escapeForXML(sz.defaultNamespace)+'"';
    for (var ns in namespaceCounts) {
        str += '\n xmlns:' + sz.prefixes[ns] + '="'+escapeForXML(ns)+'"';
    }
    str += '>';

    var tree2 = [str, tree, '</rdf:RDF>'];  //@@ namespace declrations
    return XMLtreeToString(tree2, -1);


} // End @@ body

return Serializer;

}();
return $rdf;}()
/**
 * @fileOverview Semantic Web Widget Library
 * @author <a href="mailto:jambo@mit.edu">Jim Hollenbach</a>
 * @license MIT License
 * @license GPL v2
 */

/**
 * @exports $ as jQuery
 */

/**
 * @name jQuery
 * @namespace The jQuery Javascript toolkit.
 */

/**
 * @name jQuery.rdfwidgets
 * @namespace Library functions for the widget library.
 */
jQuery.rdfwidgets = function($) {

    var CONVERT_BASE = "http://feelings.xvm.mit.edu/"

    var langs = {
        "en": true,
        "en-US":true
    };

    var widgets = {};
    var matchers = [];
    var loadFilters = [];
    var pendingSources = [];
    /**
     * @description Define a new widget for use in the library.
     * @param {String} name the namespaced name of the widget, eg. ui.mywidgetname
     * @param {Object} prototype the prototype class of the new widget.
     */
    $.rdfwidget = function( name, prototype ) {
        var namespace = name.split( "." )[ 0 ], fullName;
        var sname = name.split( "." )[ 1 ];
        fullName = namespace + "-" + sname;
        widgets[fullName] = {s:(':'+fullName),n:sname};

        var w = $.extend({}, $.RdfWidget.prototype, prototype);
        $.widget(name,w);
    };

    /**
     * @class
     * @description The base class for all SW Widgets.
     */
    $.RdfWidget = function(options, element) {


    };


    $.RdfWidget.prototype = {

        /**
         * @description Get a valid term given a string input by the user, according to the options the user provided to the widget such as prefixes.
         * @param {String | Object} term The string or Term object provided by the user.
         * @returns {Object} A Literal or Symbol that matches the term supplied by the user.
         */
        _resource: function( term ) {
            return processResource( term, this.options );
        },

        /**
         * @description A function that is called whenever new data is loaded into the local store.
         * @param {Array} trips The new $rdf.Triples that were added to the store.
         */
        insertData: function( trips ) {
            if( !this.options.ignoreupdates ) {
                this.refresh();
            }
        },

        /**
         * @description Redraw the widget.
         */
        refresh: function() {},

        /**
         * @description A function that is called whenever new data is removed from the local store.
         * @param {Array} trips The new $rdf.Triples that were removed from the store.
         */
        deleteData: function( trips ) {
            if( !this.options.ignoreupdates ) {
                this.refresh();
            }
        },

        /**
         * @description Get a Matcher for the provided element.
         * @param {String | Object} [element=this.element] The element to draw into. Can be any valid argument to a jQuery constructor.
         * @param {Boolean} [norefresh=false] If true, this matcher will not refresh when new data is loaded.
         */
        _matcher: function( element, norefresh ) {
            return Matcher( (element ? element : this.element) , this.options, norefresh );
        }
    };

    /**
     * @class
     * @description a class for matching items.
     */
    var Matcher = function( element, opts, norefresh ) {
        var bindings = [{}]; // {"varname":somesymbol, "varname2":someliteral}
        var elt = $(element);
        var history = [];
        var cstring = "";
        var wstring = "";
        function processVar( s ) {
            if( (typeof s) === "string" ) {
                if( s.length > 0 && s.charAt(0) == "?" ) {
                    if( s.length > 1 ) {
                        return s.substring(1);
                    }
                    throw "invalid variable name: "+str;
                }
            }
            return null;
        }
        var m = /** @lends jQuery.rdfwidgets-Matcher.prototype */{
            /**
             * @description foobarbaz
             */
            match: function( s,p,o,optional ) {
                var s_v = processVar( s );
                var p_v = processVar( p );
                var o_v = processVar( o );
                
                var newBindings = [];
                var matches;
                for( var i=0; i < bindings.length; i++ ) {
                    var b = bindings[i]
                    matches = $.rdfwidgets.statementsMatching( s_v ? (b[s_v] ? b[s_v] : undefined) : processResource( s, opts ),
                                                               p_v ? (b[p_v] ? b[p_v] : undefined) : processResource( p, opts ),
                                                               o_v ? (b[o_v] ? b[o_v] : undefined) : processObject( o, opts ),
                                                               undefined, false, opts );
                    if( opts.filterduplicates ) {
                        matches = filterDuplicates( matches );
                    }
                    if( (!matches || (matches && matches.length === 0)) && optional ) {
                        var newvals = {};
                        if( s_v && !b[s_v] ) { newvals[s_v] = null }
                        if( p_v && !b[p_v] ) { newvals[p_v] = null }
                        if( o_v && !b[o_v] ) { newvals[o_v] = null }
                        newBindings.push( $.extend( {}, b, newvals ) );
                    } else {
                        for( var j=0; j < matches.length; j++ ) {
                            //use extend..
                            var newvals = {};
                            if( s_v && !b[s_v] ) { newvals[s_v] = matches[j].subject; }
                            if( p_v && !b[p_v] ) { newvals[p_v] = matches[j].predicate; }
                            if( o_v && !b[o_v] ) { newvals[o_v] = matches[j].object; }
                            newBindings.push( $.extend( {}, b, newvals ) );
                        }
                    }
                }
                bindings = newBindings;

                //build up query string..
                var pat = ""
                if( optional ) {
                    pat += " optional { ";
                }
                if( s_v ) {
                    pat += " " + s + " ";
                } else { pat += " " + processResource( s, opts ).toNT() + " ";
                }
                if( p_v ) {
                    pat += " " + p + " ";
                } else { pat += " " + processResource( p, opts ).toNT() + " ";
                }
                if( o_v ) {
                    pat += " " + o + " . ";
                } else {
                    pat += " " + processObject( o, opts ).toNT() + " . ";
                }
                if( optional ) {
                    pat += " } ";
                }
                if( !optional ) {
                    cstring += pat;
                }
                wstring += pat;
                history.push({f:this.match, args:[s,p,o,optional]});
                return this;
            },
            
            optional: function( s,p,o ) {
                return this.match( s,p,o,true );
            },

            filter: function( f ) {
                bindings = $.grep( bindings, f );
                history.push({f:this.filter, args:[f]});
                return this;
            },
            
            draw: function( template, element, justOne ) {
                var target = element ? $(element) : elt;
                var output = "";
                var temp;
                for( var i = 0; i < bindings.length && (!justOne || (justOne && i < 1 ) ); i++ ) {
                    temp = template;
                    for( x in bindings[i] ) {
                        temp = temp.replace( new RegExp("\\?"+x,"g"), (bindings[i][x] ? bindings[i][x].value : "None" ));
                        temp = temp.replace( new RegExp("\\@"+x,"g"), (bindings[i][x] ? doLabel( bindings[i][x] , opts ) : "None" )); 
                    }
                    output += temp;
                }
                target.html( output );
                processHTMLWidgets( target );
                history.push({f:this.draw, args:[template, element, justOne]});
                return this;
            },
            
            page: function( template, perPage, element ) {
                //split bindings into ceil(bindings.length/perPage) pages.
                if( !perPage ) { perPage = 10 }
                //draw the first page, put listeners.
                var target = element ? $(element) : elt;
                var currentPage = 0;
                var area = $('<div class="rdfpagearea"></div>');
                var page = $('<div class="rdfpage"></div>');
                var left = $('<div style="float:left"><a href="#">&lt; Previous</a></div>');
                var center = $('<div style="clear:both"> </div>');
                var right = $('<div style="float:right"><a href="#">Next &gt;</a></div>');
                
                left.click( function( e ) {
                    e.preventDefault();
                    if( currentPage > 0 ) {
                        currentPage--;
                        drawPage( currentPage );
                    }
                });
                
                right.click( function( e ) { 
                    e.preventDefault();
                    if( (currentPage+1)*perPage < bindings.length ) {
                        currentPage++;
                        drawPage( currentPage );
                    }
                });
                
                area.append( page );
                area.append( left );
                area.append( right );
                area.append( center );
                var drawPage = function( pnumber ) {
                    
                    if( pnumber === 0 ) {
                        left.hide();
                        if( (pnumber+1)*perPage < bindings.length ) {
                            right.show();
                        } else {
                            right.hide();
                        }
                    } else if ( (pnumber+1)*perPage >= bindings.length ) {
                        left.show();
                        right.hide();
                    } else {
                        left.show();
                        right.show();
                    }
                    
                    var output = "";
                    for( var i = pnumber * perPage; ( i < (pnumber+1)*perPage && (i < bindings.length) ); i++ ) {
                        temp = template;
                        for( x in bindings[i] ) {
                            temp = temp.replace( new RegExp("\\?"+x,"g"), (bindings[i][x] ? bindings[i][x].value : "None" ));
                            temp = temp.replace( new RegExp("\\@"+x,"g"), (bindings[i][x] ? doLabel( bindings[i][x] , opts ) : "None" )); 
                        }
                        output += temp;
                    }
                    page.html( output );
                    processHTMLWidgets( target );                    
                }
                drawPage( currentPage );
                target.empty().append(area);
                history.push({f:this.page, args:[template, perPage, element]});
                return this;
            },
            
            replay: function() {
                bindings = [{}];
                cstring = "";
                wstring = "";
                var len = history.length;
                for( var i = 0; i < len; i++ ) {
                    history[i].f.apply( this, history[i].args );
                }
                if( len > 0 ) {
                    history = history.slice( len );
                }
            },

            reset: function() {
                elt.empty();
                bindings = [{}];
                history = [];
                cstring = "";
                wstring = "";
                return this;
            },

            query: function( uri ) {
                var q = "construct { " + cstring + " } where { "+ wstring +" }";
                q = escape( q );
                var u;
                if( uri.indexOf( "?" ) !== -1 ) {
                    u = uri + "&query="+q;
                } else {
                    u = uri + "?query="+q;
                }
                $.rdfwidgets.load( u );
            },

            bindings: function() {
                return $.extend( true, [], bindings );
            }
        };
        if( !norefresh ) {
            matchers.push( m );
        }
        return m;
    };

    function allSubClasses( uri, o ) {
        var s = processResource( uri, o );
        var c = {uri : s}
        var q = [ s ];
        while( q.length > 0 ) {
            var more = $.rdfwidgets.each( undefined, db.sym("http://www.w3.org/2000/01/rdf-schema#subClassOf"), q[0] );
            for( var i = 0; i < more.length; i++ ) {
                if( !c[more[i].uri] ) {
                    c[more[i].uri] = more[i];
                    q.push( more[i] );
                }
            }
            q = q.slice(1);
        }
        return c;
    }

    function allSubProperties( uri, o ) {
        var s = processResource( uri, o );
        var c = {uri : s}
        var q = [ s ];
        while( q.length > 0 ) {
            var more = $.rdfwidgets.each( undefined, db.sym("http://www.w3.org/2000/01/rdf-schema#subPropertyOf"), q[0] );
            for( var i = 0; i < more.length; i++ ) {
                if( !c[more[i].uri] ) {
                    c[more[i].uri] = more[i];
                    q.push( more[i] );
                }
            }
            q = q.slice(1);
        }
        return c;
    }

    function filterDuplicates( trips ) {
        var result = [];
        var used = {};
        for( var i = 0; i < trips.length; i++ ) {
            var hash = db.canon(trips[i].subject).toNT()+db.canon(trips[i].predicate).toNT()+(trips[i].object.termType==="literal" ? trips[i].object.value : db.canon(trips[i].object).toNT() );
            if( !used[hash] ) {
                result.push( trips[i] );
            }
            used[hash] = true;
        }
        return result;
    }

    function deleteData( trips ) {
        labelCache = {};
        imageCache = {};
        var w;
        for( x in widgets ) {
            w = widgets[x];
            //w holds two fields:
            //w.s, a jquery selector for the widget, eg ":ui-rdflabel"
            //w.n, the name of the widget, eg "rdflabel"
            $(w.s)[w.n]("deleteData", trips);
        }
        for( var i = 0; i < matchers.length; i++ ) {
            matchers[i].replay();
        }
    }

    function insertData( trips ) {
        labelCache = {};
        imageCache = {};
        var w;
        for( x in widgets ) {
            w = widgets[x];
            //the following line is explained in deleteData, above.
            $(w.s)[w.n]("insertData", trips);
        }
        for( var i = 0; i < matchers.length; i++ ) {
            matchers[i].replay();
        }
    }

    function refreshAll() {
        labelCache = {};
        imageCache = {};
        var w;
        for( x in widgets ) {
            w = widgets[x];
            $(w.s)[w.n]("refresh");
        }
        for( var i = 0; i < matchers.length; i++ ) {
            matchers[i].replay();
        }
    }

    var uriRegex = /^(https?):\/\/((?:[a-z0-9.-]|%[0-9A-F]{2}){3,})(?::(\d+))?((?:\/(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})*)*)(?:\?((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?(?:#((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?$/i;
    //var uriRegex = /^(([a-z][\-a-z0-9+\.]*):)?(\/\/([^\/?#]+))?([^?#]*)?(\?([^#]*))?(#(.*))?$/i;

    function validURI( str ) {
        m = str.match(uriRegex);
        if( m === null ) {
            return false;
        }
        return true;
    }

    var docpart = $rdf.Util.uri.docpart
    var join = $rdf.Util.uri.join

    function randomID() {
        return "rdfwidget"+Math.floor(Math.random()*100000000).toString();
    }

    var SW_PREFIX = "http://dig.csail.mit.edu/2009/swjs#";

    var db = new $rdf.IndexedFormula();

    var requestedURIs = {};
    var endpoints = {};
    var selectedElement = null;
    var labelCache = {};
    var defaultEndpoint = window.location;
    var defaultUser = null;
    var defaultFriend = null;
    var sourceNames = {};
    var loadedSources = {};
    function finishLoads() {
        $.each( db.statementsMatching( undefined, db.sym( SW_PREFIX+"data" ), undefined ), function() {
            if( !requestedURIs[this.object.uri] ) {
                loadDataSource( this.object.uri, undefined, finishLoads );
            }
        });
    }

    function doneLoading( uri ) {
        pendingSources = $.grep(pendingSources, function( element ) {
            return element !== uri;
        });
        if( pendingSources.length === 0 ) {
            $(document).trigger('rdfloaded');
        }
    }

    function loadDataSource( uri, t, callback, originalURI ) {
        if( uri && !originalURI ) {
            pendingSources.push(docpart( uri ) );
        }
        var refresh = false;
        var decrement = false;
        if( (originalURI && requestedURIs[originalURI]) || (!originalURI && requestedURIs[docpart( uri )]) ) {
            refresh = true;
        }

        if(originalURI && originalURI.indexOf('https') === 0 ) {
            doneLoading( docpart( originalURI ) );
            return;
        }
        var format = (t === "application/json" ? "json" :
                      (t === "application/jsonp" ? "jsonp" : 
                       (t === "application/rdf+xml" ? "xml" :
                        ((t === "text/n3" || t === "text/rdf+n3") ? "text" : 
                         "text") ) ) );
        try {
            requestedURIs[docpart( uri )] = true;
            if( originalURI ) { requestedURIs[docpart( originalURI )] = true; }
            $.ajax({
                url: uri, 
                beforeSend: function( xhr ) {
                    if( xhr.withCredentials !== undefined ) {
                        xhr.withCredentials = true;
                    }
                },
                timeout:5000,
                success: function( data, text, xhr ) {
                    var contenttype = t;
                    if( xhr ) {
                        contenttype = xhr.getResponseHeader("Content-Type").split(";")[0];
                        if( !contenttype ) {
                            contenttype = t;
                        }
                        format = (contenttype === "application/json" ? "json" :
                                  (contenttype === "application/jsonp" ? "jsonp" : 
                                   (contenttype === "application/rdf+xml" ? "xml" :
                                    ((contenttype === "text/n3" || contenttype === "text/rdf+n3") ? "text" : 
                                     null) ) ) );
                    }
                    if( xhr && xhr.status >= 400  || ( !xhr && format !== "jsonp" ) ) {
                        doneLoading( originalURI ? docpart( originalURI ) : docpart( uri ) );
                        return;
                    }
                    if( (xhr && xhr.status === 0) || !format || ( !text && !originalURI ) || (!contenttype && !originalURI ) ) {
                        var converturi = CONVERT_BASE+"?data-uri[]="+escape(uri)+"&input=&output=jsonp";
                        loadDataSource(converturi, "application/jsonp", callback, uri);
                        return;
                    }
                    var source = originalURI ? originalURI : uri;
                    if( refresh ) {
                        db.removeMany( undefined, undefined, undefined, db.sym( source ) );
                    }
                    var triples = [];
                    if( format === "json" || format === "jsonp" ) {
                        var parser = $rdf.jsonParser;
                        triples = parser.parseJSON( data, source, db );
                        if( originalURI ) {
                            loadedSources[originalURI] = originalURI;
                        } else {
                            loadedSources[uri] = uri;
                        }
                        if( !decrement ) { decrement = true; if( callback ) { callback(source, true); } }
                    } else if ( format === "xml" ) {
                        var p = new $rdf.RDFParser( db );
                        triples = p.parse( xhr.responseXML, source, source );
                        if( originalURI ) {
                            loadedSources[originalURI] = originalURI;
                        } else {
                            loadedSources[uri] = uri;
                        }
                        if( !decrement ) { decrement = true; if( callback ) { callback(source, true); } }
                    } else if ( format === "text" ) {
                        var u = originalURI ? originalURI : uri;
                        var p = new $rdf.N3Parser(db,db,u,u,null,null,"",null);
                        p.loadBuf( xhr.responseText );
                        loadedSources[u] = u;
                    }
                    doneLoading( originalURI ? docpart( originalURI ) : docpart( uri ) );
                    insertData( triples );
                },
                error: function(xhr) {
                    requestedURIs[docpart( uri )] = false;
                    if( !originalURI ) {
                        var converturi = CONVERT_BASE+"?data-uri[]="+escape(uri)+"&input=&output=jsonp";
                        loadDataSource(converturi, "application/jsonp", callback, uri);
                    } else {
                        if( callback ) { callback( originalURI, false ); }
                        doneLoading( docpart( originalURI ) );
                    }
                },
                dataType: format
            });
        } catch(e) {
            /*                if (jQuery.browser.msie && window.XDomainRequest && !originalURI && uri.indexOf('https://') === 0 && "xml" === format ) {
            // Use Microsoft XDR
            var xdr = new XDomainRequest();
            xdr.open("get", uri);
            xdr.onload = function() {
            var source = originalURI ? originalURI : uri;
            var p = new $rdf.RDFParser( db );
            var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async="false";
            xmlDoc.loadXML(this.responseText);
            triples = p.parse( xmlDoc, source, source );
            if( originalURI ) {
            loadedSources[originalURI] = originalURI;
            } else {
            loadedSources[uri] = uri;
            }
            return;
            };
            xdr.send();
            return;
            } */
            if( !decrement ) { decrement = true; }
            if( !originalURI ) {
                requestedURIs[docpart( uri )] = false;
                var converturi = CONVERT_BASE+"?data-uri[]="+escape(uri)+"&input=&output=jsonp";
                loadDataSource(converturi, "application/jsonp", callback, uri);
            } else {
                callback( originalURI, false );
                doneLoading( docpart( originalURI ) );
            }
        }
    }

    function loadDataSources() {
        $('link').each( function() {
            if(this.href && "sw:data" === this.getAttribute("rel") ) {
                var uri = docpart( this.href );
                var name = this.getAttribute("name");
                if( name ) { sourceNames[name] = uri; }
                var endpoint = this.getAttribute("sw:endpoint");
                endpoints[uri] = endpoint;
                loadDataSource( uri, this.getAttribute("type"), finishLoads );
            } else if( this.href && "sw:endpoint" === this.getAttribute("rel") ) {
                var name = this.getAttribute("name");
                if( name ) { sourceNames[name] = uri; }
                defaultEndpoint = docpart( this.href );
            } else if( this.href && "sw:user" === this.getAttribute("rel") ) {
                defaultUser = this.href;
            }
        });
        return true;
    }

    //====================================
    // Widgets.
    //====================================

    var namespaces = {'foaf':'http://xmlns.com/foaf/0.1/',
                      'sioc':'http://rdfs.org/sioc/ns#',
                      'dc'  :'http://purl.org/dc/terms/',
                      'rdf' :'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                      'rdfs':'http://www.w3.org/2000/01/rdf-schema#',
                      ''    :window.location};

    function processResource( v, o ) {
        if( v === null || v === undefined ) { return null; }
        if( typeof( v ) === "object" && v.termType ) {
            return v;
        }
        if( typeof( v ) === "string" && v.indexOf( '<' ) === 0 && v.lastIndexOf( '<' ) === 0 && v.indexOf( '>' ) === (v.length-1) ) {
            return db.sym( v.substr( 1, v.length-2 ) );
        }
        var index = v.indexOf( ':' );
        if( index !== -1 && v.indexOf( "://" ) !== index ) {
            var pfx = v.substr( 0, index );
            var base = o.namespaces ? ( (o.namespaces[pfx] !== undefined) ? o.namespaces[pfx] : namespaces[pfx] ) : namespaces[pfx];
            if( base ) {
                return db.sym( base + v.substr(index+1) );
            }
        }
        var sym = db.sym(v);
        return sym;
    }

    function processSourceFilter( f, o ) {
        if( !f ) { return null; }
        var r = {};
        for( var i = 0; i < f.length; i++ ) {
            var n = sourceNames[f[i]];
            r[ ( n ? n : processResource( f[i], o ).uri ) ] = true;
        }
        return r;
    }

    function processLiteral( v, o ) {
        if( v === null || v === undefined ) { return null; }
        if( typeof( v ) === "object" && "literal" === v.termType) {
            return v;
        }
        var lit = db.literal( v );
        return lit;
    }
    
    function processObject( v, o ) {
        if( v === null || v === undefined ) { return null; }
        if( typeof( v ) === "object" && v.termType ) {
            return v;
        }
        var object;
        if( validURI ( v ) || (v.indexOf('"') !== 0 && v.indexOf(':') !== -1) ) {
            object = processResource( v, o );
        } else {
            object = processLiteral( v, o );
        }
        return object;
    }

    function processEditTerm( o ) {
        if( o.editTerm ) {
            return o.editTerm;
        }
        if( o.subject && o.predicate && o.object ) {
            o.editTerm = "object";
            return o.editTerm;
        } else if ( o.object && o.predicate ) {
            o.editTerm = "subject";
            return o.editTerm;
        }  else if ( o.subject && o.object ) {
            o.editTerm = "predicate";
            return o.editTerm;
        }  else if ( o.subject && o.predicate ) { 
            o.editTerm = "object";
            return o.editTerm;
        }
        throw "Insufficient information provided to edit or view "+ o.editTerm +" term. S:"+o.subject+" P:"+o.predicate+" O:"+o.object;
    }

    function processGraph( o, subject ) {
        return o.graph ? o.graph : ( (o.acl && o.acl.graph) ? o.acl.graph : (subject ? subject : null ) );
    }

    function processACL( o, subject ) {
        var a = o.acl;
        var ACL_URI_BASE = "http://jambo.xvm.mit.edu/acl/";

        if( "string" === typeof(a) && validURI( a ) ) {
            return a;
        }
        if( "object" === typeof(a) ) {
            var graph = processGraph( o, subject );
            var user = a.user ? a.user : defaultUser;
            var friend = a.friend ? a.friend : defaultFriend;
            if( !graph ) { throw( "could not determine target graph for ACL." ); }
            if( !a.type ) {
                throw "no acl type provided:"+a;
            } else if( a.type === "permanent" ) {
                return ACL_URI_BASE+"permanent.n3?r="+escape(graph);
            } else if( a.type === "private-readonly" ) {
                if( !user ) { throw ("could not determine user for ACL"); }
                if( !friend ) { throw ("could not determine friend or group to be given read access for ACL"); }
                return ACL_URI_BASE+"private-readonly.n3?r="+escape(graph)+"&u="+escape(user)+"&f="+escape(friend);
            } else if( a.type === "private-editable" ) {
                if( !user ) { throw ("could not determine user for ACL"); }
                if( !friend ) { throw ("could not determine friend or group to be given read-write access for ACL"); }
                return ACL_URI_BASE+"private.n3?r="+escape(graph)+"&u="+escape(user)+"&f="+escape(friend);
            } else if( a.type === "public-editable" ) {
                return ACL_URI_BASE+"public.n3?r="+escape(graph);
            } else if( a.type === "public-readonly" ) {
                return ACL_URI_BASE+"public-readonly.n3?r="+escape(graph)+"&u="+escape(user);
            }
        }
        throw "unrecognized acl format:"+a;
    }

    function getMenuPredicateOptions( o ) {
        var props = $.rdfwidgets.each( undefined, db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"), undefined, o );
        var uriToValue = {};
        var valueToURI = {};
        var bindings = [];
        for( x in props ) {
            var binding = {};
            bindings.push( binding );
            var prop = props[x];
            var comment = $.rdfwidgets.any( prop, db.sym("http://www.w3.org/2000/01/rdf-schema#comment"), undefined, undefined, o );
            binding.uri = prop.uri;
            binding.value = doLabel( prop, o );

            if( comment ) {
                binding.comment = comment.value;
            } else  {
                binding.comment = prop.value;
            }

            binding.label = "<span title='"+binding.comment+" "+binding.uri+"'>"+binding.value+"</span>";
            valueToURI[binding.value] = prop;
            uriToValue[prop] = binding.value;
        }
        return {bindings:bindings, valueToURI:valueToURI, uriToValue:uriToValue};
    }

    function getMenuNoOptions() {
        return {bindings:[],valueToURI:{},uriToValue:{}};
    }

    function getMenuUsedOptions( o ) {
        var used = new Array();
        used = $.rdfwidgets.statementsMatching( undefined ,  db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), o.type ? processObject(o.type) : undefined, undefined, false, o);

        used = filterDuplicates( used );

        var uriToValue = {};
        var valueToURI = {};
        var bindings = [];

        for( x in used ) {
            var st = used[x];
            var prop;
            if( o.editTerm ) {
                prop = st[o.editTerm];
            }else if( !o.subject ) {
                prop = st.subject;
            } else if( !o.object ) {
                prop = st.object;
            } else if( !o.predicate ) {
                prop = st.predicate;
            }
            if( uriToValue[prop] || prop.termType === "bnode" ) {
                continue;
            }
            var binding = {};
            bindings.push( binding );
            var comment = $.rdfwidgets.any( prop, db.sym("http://www.w3.org/2000/01/rdf-schema#comment"), undefined, undefined, o );
            binding.uri = prop.uri;
            binding.value = doLabel( prop, o );

            if( comment ) {
                binding.comment = comment.value;
            } else  {
                binding.comment = prop.value;
            }

            binding.label = "<span title='"+binding.comment+" "+binding.uri+"'>"+binding.value+"</span>";
            valueToURI[binding.value] = prop;
            uriToValue[prop] = binding.value;
        }

        return {bindings:bindings, valueToURI:valueToURI, uriToValue:uriToValue};
    }

    function getMenuInstanceOptions( o ) {
        var used = [];
        var ranges = [];

        if( o.predicate ) {
            if( $.rdfwidgets.whether(processResource( o.predicate, o ), db.sym("http://www.w3.org/2000/01/rdf-schema#range" ), db.sym("http://www.w3.org/2000/01/rdf-schema#Literal"), undefined, o ) ) {
                return {bindings:[],valueToURI:{},uriToValue:{}};
            }
            var p = allSubProperties( o.predicate, o );
            for( x in p ) {
                used = used.concat( $.rdfwidgets.statementsMatching( undefined, p[x], undefined, undefined, false, o ) );
                if( o.editTerm === "subject" ) {
                    ranges = ranges.concat($.rdfwidgets.each( p[x], db.sym("http://www.w3.org/2000/01/rdf-schema#domain"), undefined, undefined, o ));
                }else if( o.editTerm === "object" ) {
                    ranges = ranges.concat($.rdfwidgets.each( p[x], db.sym("http://www.w3.org/2000/01/rdf-schema#range"), undefined, undefined, o ));
                }
            }
        }
        
        var props = [];
        if( ranges.length > 0 ) {
            for( var i = 0; i < ranges.length; i++ ) {
                var r = allSubClasses( ranges[i], o );
                for( x in r ) {
                    props = props.concat( $.rdfwidgets.statementsMatching( undefined, db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), r[x], undefined, false, o) );
                }
            }
        } else {
            props = $.rdfwidgets.statementsMatching( undefined, db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), undefined, undefined, false, o );
        }


        var uriToValue = {};
        var valueToURI = {};
        var bindings = [];
        for( x in props ) {
            var st = props[x];
            var prop = st.subject;
            if( $.rdfwidgets.whether( st.subject, db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#Property" ), undefined, o ) || uriToValue[st.subject] || st.subject.termType === "bnode") {
                continue;
            }
            var binding = {};
            bindings.push( binding );
            var comment = $.rdfwidgets.any( prop, db.sym("http://www.w3.org/2000/01/rdf-schema#comment"), undefined, undefined, o );
            binding.uri = prop.uri;
            binding.value = doLabel( prop, o );

            if( comment ) {
                binding.comment = comment.value;
            } else  {
                binding.comment = prop.value;
            }

            binding.label = "<span title='"+binding.comment+" "+binding.uri+"'>"+binding.value+"</span>";
            valueToURI[binding.value] = prop;
            uriToValue[prop] = binding.value;
        }


        for( x in used ) {
            var st = used[x];
            var prop;
            if( o.editTerm === "subject" ) {
                prop = st.subject;
            } else {
                prop = st.object;
            }
            if( uriToValue[prop] || prop.termType === "bnode" ) {
                continue;
            }
            var binding = {};
            bindings.push( binding );
            var comment = $.rdfwidgets.any( prop, db.sym("http://www.w3.org/2000/01/rdf-schema#comment"), undefined, undefined, o );
            binding.uri = prop.uri;
            binding.value = doLabel( prop, o );

            if( comment ) {
                binding.comment = comment.value;
            } else  {
                binding.comment = prop.value;
            }

            binding.label = "<span title='"+binding.comment+" "+binding.uri+"'>"+binding.value+"</span>";
            valueToURI[binding.value] = prop;
            uriToValue[prop] = binding.value;
        }

        return {bindings:bindings, valueToURI:valueToURI, uriToValue:uriToValue};
    }


    /* find the endpoint that you should write to for a given data source */
    function getEndpoint( why, o ) {
        if( o.endpoint ) {
            return o.endpoint;
        } else if ( why && why.uri && endpoints[why] ) {
            return endpoints[why];
        } else if ( defaultEndpoint ) {
            return defaultEndpoint;
        } else {
            return window.location;
        }
    }

    function doInsert( triples, callback, o ){ 
        if( !triples || triples.length == 0 ) { callback( true, triples, null );return; }
        var endpoint = getEndpoint( triples[0], o );
        var queryString = "INSERT ";
        var postData = {};

        var graph;
        if( o.acl ) {
            postData['acl'] = processACL( o, triples[0].why.uri );
            graph = processGraph( o, triples[0].why.uri );
        } else {
            graph = processGraph( o );
        }
        if( graph ) {
            queryString += "INTO <" + graph + "> ";
        }

        queryString += " { ";
        for( x in triples ) { queryString += triples[x].toString(); }
        queryString += " } ";
        postData['query']=queryString;
        $.ajax({
            type:"POST",
            data:postData,
            url :endpoint,
            beforeSend: function( xhr ) {
                if( xhr.withCredentials !== undefined ) {
                    xhr.withCredentials = true;
                }
                if( o.beforeSubmit ) {
                    o.beforeSubmit( triples, xhr );
                }
            },
            success: function(data, stat, xhr) {
                var sp, d;
                if( ! data.childNodes ) {
                    callback( false, triples, xhr );
                }
                for( var i = 0; i < data.childNodes.length; i++ ) {
                    var sp = data.childNodes[i];
                    if( sp.nodeName === "sparql" ) {
                        for( var j = 0; j < sp.childNodes.length; j++ ) {
                            var d = sp.childNodes[j];
                            if( d.nodeName === "inserted" ) {
                                var val =$(d).text();
                                for( var t = 0; t < triples.length; t++ ) {
                                    db.add( triples[t].subject, triples[t].predicate, triples[t].object, triples[t].why );
                                }
                                callback( true, triples, xhr );
                                insertData( triples );
                                if( o.afterSubmit ) {
                                    o.afterSubmit( true, triples, xhr );
                                }
                                return;
                            }
                        }
                    }
                }
                callback( false, triples, xhr );
                if( o.afterSubmit ) {
                    o.afterSubmit( false, triples, xhr );
                }
            },
            error: function(xhr, t, err) {
                callback( false, triples, xhr );
                if( o.afterSubmit ) {
                    o.afterSubmit( false, null, xhr );
                }
            }
            //dataType:"xml"
        });
    }

    function doDelete( triples, callback, o ){ 
        if( !triples || triples.length == 0 ) { callback( true, triples, null );return; }
        var endpoint = getEndpoint( triples[0], o );
        var queryString = "DELETE ";
        var postData = {};
        var graph;
        if( o.acl ) {
            postData['acl'] = processACL( o, triples[0].why.uri );
            graph = processGraph( o, triples[0].why.uri );
        } else {
            graph = processGraph( o );
        }
        if( graph ) {
            queryString += "FROM <" + graph + "> ";
        }

        queryString += " { ";
        for( x in triples ) { queryString += triples[x].toString(); }
        queryString += " } ";
        postData['query']=queryString;

        $.ajax({
            type:"POST",
            data:postData,
            url :endpoint,
            beforeSend: function( xhr ) {
                if( xhr.withCredentials !== undefined ) {
                    xhr.withCredentials = true;
                }
                if( o.beforeSubmit ) {
                    o.beforeSubmit( triples, xhr );
                }
            },
            success: function(data, stat, xhr) {
                var sp, d;
                if( ! data.childNodes ) {
                    callback( false, triples, xhr );
                }
                for( var i = 0; i < data.childNodes.length; i++ ) {
                    var sp = data.childNodes[i];
                    if( sp.nodeName === "sparql" ) {
                        for( var j = 0; j < sp.childNodes.length; j++ ) {
                            var d = sp.childNodes[j];
                            if( d.nodeName === "deleted" ) {
                                var val =$(d).text();
                                for( var t = 0; t < triples.length; t++ ) {
                                    db.remove( triples[t] );
                                }
                                callback( true, triples, xhr );
                                deleteData( triples );
                                if( o.afterSubmit ) {
                                    o.afterSubmit( true, triples, xhr );
                                }
                                return;
                            }
                        }
                    }
                }
                callback( false, triples, xhr );
                if( o.afterSubmit ) {
                    o.afterSubmit( false, triples, xhr );
                }
            },
            error: function(xhr, stat, err) {
                callback( false, triples, xhr );
                if( o.afterSubmit ) {
                    o.afterSubmit( false, null, xhr );
                }
            }
            //dataType:"xml"
        });
    }
    
    //when i feel confident that its being implemented, this will use the w3c spec which allows multiple update actions in one query
    function doUpdate( triples, callback,  o ) {
        doDelete( triples['delete_triples'], function( success, t, xhr ) {
                if( success ) {
                    doInsert( triples['insert_triples'], callback, o );
                } else {
                    callback( false, t, xhr );
                }
            }, o );
    }

    function doLabel( term, o ) {
        if( labelCache[term] ) {
            return labelCache[term];
        }
        if( term.termType === "literal" ) {
            return term.value;
        }
        var label = null;
        var t = term.value;
        if( !t ) { return ""; }
        var p = db.sym( "http://www.w3.org/2000/01/rdf-schema#label" );
        //var pat = $.rdf.pattern( s,p,o );
        var r = $.rdfwidgets.statementsMatching( term, p, undefined, undefined, false );
        if( r.length > 0 ) {
            for( var i = 0; i < r.length; i++ ) {
                if( !r[i].lang || (r[i].lang && langs[r[i].lang]) ) {
                    label = r[i].object.toString();
                    break;
                }
            }
        }
        if( !label ) {
            p = db.sym("http://purl.org/dc/terms/title");
            r = $.rdfwidgets.statementsMatching( term, p, undefined, undefined, false );
            if( r.length > 0 ) {
                for( var i = 0; i < r.length; i++ ) {
                    if( !r[i].lang || (r[i].lang && langs[r[i].lang]) ) {
                        label = r[i].object.toString();
                        break;
                    }
                }
            }
        }
        if( !label ) {
            p = db.sym("http://xmlns.com/foaf/0.1/name");
            r = $.rdfwidgets.statementsMatching( term, p, undefined, undefined, false );
            if( r.length > 0 ) {
                for( var i = 0; i < r.length; i++ ) {
                    if( !r[i].lang || (r[i].lang && langs[r[i].lang]) ) {
                        label = r[i].object.toString();
                        break;
                    }
                }
            }
        }
        if( !label ) {
            var li = t.lastIndexOf( "#" );
            if( li !== -1 && li < t.length-2 ) {
                    label = t.substr(li+1);
            } else {
                li = t.lastIndexOf( "/" );
                if( (li > 0 && t[li-1] !== "/") && li < t.length-2 ) {
                    label = t.substr(li+1);
                } else {
                    label = t;
                }
            }
        }
        labelCache[term]=label;
        return label;
    }

    var imageProperties = null;
    var imageCache = {};

    function findImageProperties() {
        q = [db.sym("http://xmlns.com/foaf/0.1/depiction"),db.sym("http://dbpedia.org/property/img")/*,db.sym("http://xmlns.com/foaf/0.1/img")*/];
        imageProperties = {};
        var current = null;
        var sp = db.sym( "http://www.w3.org/2000/01/rdf-schema#subPropertyOf" );
        while( q.length > 0 ) {
            current = q[0];
            q = q.slice(1);
            if( imageProperties[current.value] ) {
                continue;
            } else {
                var extras = $.rdfwidgets.each( undefined, sp, current );
                for( var i = 0; i < extras.length; i++ ) {
                    if( !imageProperties[extras[i].value] ) {
                        q.push( extras[i] );
                    }
                }
                imageProperties[current.value] = 1;
            }
        }
    }



    function doImage( term, o ) {
        if( !imageProperties ) {
            findImageProperties();
        }

        var sts = $.rdfwidgets.statementsMatching( term,undefined,undefined,undefined,false,o );
        for( var i = 0; i < sts.length; i++ ) {
            if( imageProperties[sts[i].predicate.value] && sts[i].object.termType === "symbol" ) {
                imageCache[term.value] = sts[i].object;
                return sts[i].object;
            }
        }
        return null;
    }

    function isImage( term, o ) {
        if( !imageProperties ) {
            findImageProperties();
        }

        if( $.rdfwidgets.anyStatementMatching( term, db.sym( "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" ), db.sym( "http://xmlns.com/foaf/0.1/Image" ), undefined, o ) ) {
            return term;
        }

        var sts = $.rdfwidgets.statementsMatching( undefined, undefined, term, undefined, false, o );
        for( var i = 0; i < sts.length; i++ ) {
            if( imageProperties[sts[i].predicate.value] ) {
                return sts[i].object;
            }
        }
        return null;
    }

    function doAutocomplete( jq, o ) {
        var options;
        
        if( o.menuOptions !== null && o.menuOptions !== undefined ) {
            options = o.menuOptions;
        } else if( o.editTerm === "object" && $.rdfwidgets.whether(processResource( o.predicate, o ), db.sym("http://www.w3.org/2000/01/rdf-schema#range" ), db.sym("http://www.w3.org/2000/01/rdf-schema#Literal"), undefined, o ) ) {
            jq.bind("blur", function() { jq.trigger("autocompletechoice") } );
            return;
        } else if ( (o.editTerm === "object" || o.editTerm === "subject") ) {
            options = getMenuInstanceOptions( o );
        } else if ( o.editTerm === "predicate" ) {
            options = getMenuPredicateOptions( o );
        }  else {
            options = {bindings:[],valueToURI:{},uriToValue:{}};
        }
        var preds = options.bindings;
        var open = false;
        var passedUp = false;
        var selected = false;
        var lastSelect = null;

        function getEvent( val ) {
            //perform label-> uri OR uri -> label.
            if( lastSelect && lastSelect.value === jq.val() ) {
                return { type: "autocompletechoice", uri:lastSelect.uri,  input: jq.val(), label:lastSelect.value };                
            } else if ( validURI( jq.val() ) ) {
                return { type: "autocompletechoice", uri:jq.val(), input: jq.val(), label:( options.uriToValue[ jq.val() ] ? options.uriToValue[ jq.val() ] : jq.val() ) };
            } else if ( options.valueToURI[jq.val()] ) {
                return { type: "autocompletechoice", uri: options.valueToURI[jq.val()],input: jq.val(),  label:jq.val() };
            } else if ( validURI( jq.val() ) ){
                return { type: "autocompletechoice", uri: jq.val(),input: jq.val(),  label:jq.val() };
            } else {
                return { type: "autocompletechoice", uri: null,input: jq.val(),  label:jq.val() };
            }
        }

        return jq.autocomplete("destroy").autocomplete({
                    source: preds,
                    open: function() {
                      open = true; 
                      passedUp = false;
                      selected = false;
                    },
                    close: function() { 
                      open = false;
                      if( passedUp && !selected ) {
                          var evt = getEvent( jq.val() );
                          if( evt.uri ) {
                              jq.data( "uri", evt.uri );
                              jq.data( "val", evt.input );
                          } else {
                              jq.data( "uri", null );
                              jq.data( "val", evt.input );
                          }
                          $(this).trigger( evt ); 
                      }
                    },
                    focus: function( e, ui ) {
                      lastSelect = ui.item;
                    },
                    select: function( e, ui ) {
                      selected = true;
                      lastSelect = ui.item;
                    }
               }).blur( function() { 
                    if( !open ) {
                        var evt = getEvent( jq.val() );
                        if( evt.uri ) {
                            jq.data( "uri", evt.uri );
                            jq.data( "val", evt.input );
                        } else {
                            jq.data( "uri", null );
                            jq.data( "val", evt.input );
                        }
                        $(this).trigger( evt ); 
                    } else {
                        passedUp = true; 
                    } 
               });
    }

    function processTripleUpdate( term, original, o ) {
        var delete_triples = null;
        var insert_triples = null;
        if( o.editTerm === "subject" ) {
            var pred = processResource( o.predicate, o );
            var obj = processObject( o.object, o );
            if( original ) { delete_triples = $.rdfwidgets.statementsMatching( original, pred, obj,undefined,false,o ); }
            if( term ) {
                insert_triples = [ new $rdf.Statement( term, pred, obj ) ];
                if( delete_triples && delete_triples[0] && delete_triples[0].why ) { insert_triples[0].why = delete_triples[0].why; }
            }
        } else if ( o.editTerm === "predicate" ) {
            var subj = processResource( o.subject, o );
            var obj = processObject( o.object, o );
            if( original ) { delete_triples = $.rdfwidgets.statementsMatching( subj, original, obj,undefined,false,o ); }
            if( term ) {
                insert_triples = [ new $rdf.Statement( subj, term, obj ) ]; 
                if( delete_triples && delete_triples[0] && delete_triples[0].why ) { insert_triples[0].why = delete_triples[0].why; }
            }
        } else if ( o.editTerm === "object" ) {
            var subj = processResource( o.subject, o );
            var pred = processResource( o.predicate, o );
            if( original ) { delete_triples = $.rdfwidgets.statementsMatching( subj, pred, original,undefined,false,o ); }
            if( term ) {
                insert_triples = [ new $rdf.Statement( subj, pred, term ) ];
                if( delete_triples && delete_triples[0] && delete_triples[0].why ) { insert_triples[0].why = delete_triples[0].why; }
            }
        }
        if( !delete_triples ) { delete_triples = new Array(); }
        if( !insert_triples ) { insert_triples = new Array(); }
        return { delete_triples: delete_triples, insert_triples:insert_triples }
    }

    function setUnselected( element ) {
        if( element && element === selectedElement ) {
            selectedElement = null;
            element.removeClass( 'selected' );
        }
    }

    function setSelected( element, term ) {
        setUnselected( selectedElement );
        if( element ) {
            selectedElement = element;
            element.addClass( 'selected' );
            if( term ) {
                element.trigger( 'rdfselect', [term] );
            }
        }
    }

    function checkSelected( element ) {
        return element === selectedElement;
    }



    function addDelayedClickEvent( element  ) {
        var waiting = false;
        function firstClick( e ) {
            e.stopPropagation();
            if( !waiting ) {
                waiting = true;
                setSelected( element, element.label('getRDFValue'));
                setTimeout( function() {
                        waiting = false;
                        element.unbind( "click", firstClick );
                        element.bind( "click", secondClick );
                    }, 1000);
            }
        }
        function secondClick( e ) {
            e.stopPropagation();
            if( checkSelected( element ) ) {
                element.trigger( "delayedclick" );
            } else {
                element.bind( "click", firstClick );
                element.unbind( "click", secondClick );
                firstClick( e );
            }
        }
        element.bind( "click", firstClick );
    }
                                                                                                                                                                                                  /*    function addDelayedClickEvent( element  ) {
        function firstClick( e ) {
            e.stopPropagation();
            setSelected( element);
            element.trigger( "rdfselect",[element.rdflabel('getRDFValue')] );
            setTimeout( function() {
                    element.one( "click", secondClick );
                }, 1000);
        }
        function secondClick( e ) {
            e.stopPropagation();
            if( checkSelected( element ) ) {
                element.one( "click", firstClick );
                element.trigger( "delayedclick" );
            } else {
                firstClick( e );
            }
        }
        element.one( "click", firstClick );
        }*/


    /**
     * @name jQuery.prototype.edit
     * @description Draw a label that, when clicked twice, transforms into an editable text box for modifying a value in a triple.
     * @function
     * @param {String | Object} [options.subject] The resource to display an edit for OR if predicate or object is defined, the subject of a statement to be matched.
     * @param {String | Object} [options.predicate] The predicate of a statement to be matched.
     * @param {String | Object} [options.object] The object of a statement to be matched.
     * @param {Boolean} [options.autocomplete=true] If false, no autocomplete menu will be displayed when the user is editing.
     * @param {Object} [options] @see CommonOptions
     */
    $.rdfwidget("ui.edit", {
        options: {
            namespaces:namespaces,
            showlinks:false,
            autocomplete:true,
            usetextarea:false,
            editable:"delayedclick"
        },
        _create: function() {
            this.originalSubject = this.options.subject;
            this.originalPredicate = this.options.predicate;
            this.originalObject = this.options.object;
            this.refresh();
        },
        reset: function() {
            this.element.edit('option','subject',this.originalSubject);
            this.element.edit('option','predicate',this.originalPredicate);
            this.element.edit('option','object',this.originalObject);
            refresh();
        },
        getTriple: function() {
            var o = this.options;
            var t = this.element.label( "getTriple" );
            if( t ) {
                return t;
            }
            if( o.subject && o.predicate && o.object ) {
                var trip = $.rdfwidgets.anyStatementMatching( processResource(o.subject,o),processResource(o.predicate,o),processObject(o.object,o), undefined, o );
                return trip ? trip : null;
            }
            return null;
        },

        refresh: function() {
            var acdone = false;
            var o = this.options;
            var element = this.element;
            processEditTerm( o );
            element.label(o);
            addDelayedClickEvent( element );
            if( false !== o.editable && "never" !== o.editable ) {
                var original = element.label("getRDFValue");
                var inputbox;
                function insertAC( e ) {
                    if( !inputbox ) {
                        if( o.usetextarea ) {
                            inputbox = $("<textarea class='rdfedit'></textarea>");
                        } else {
                            inputbox = $("<input style='margin:0; padding:0; border: 1px solid black;' class='rdfedit' type='text'></input>");
                        }
                    }
                    if( !acdone ) {
                        doAutocomplete( inputbox, o );
                    }
                    inputbox.width( element.width()-2 );
//                    if( o.usetextarea ) {
                    inputbox.height( element.height()-2 );
//                    }
                    if( element.edit('option','disabled')) {
                        element.one('delayedclick', insertAC );
                        return;
                    }
                    var oldText;
                    if( original ) {
                        inputbox.val(element.text());
                        oldText = element.text();
                    } else {
                        oldText = "";
                    }
                    element.empty().append( inputbox );
                    inputbox.select();
                    function insertLabel(e) {
                        var i = inputbox.val();
                        var choice;
                        var label;
                        if( i === "" || i === oldText ) {
                            element.empty().label(o).one('delayedclick', insertAC );
                            return;
                        }
                        if( !e.uri ) {
                            if( !o.autocomplete ) {
                                if( validURI( i ) ) {
                                    choice = processResource( i, o );
                                } else if ( o.editTerm === "object" ) {
                                    choice = processLiteral( i, o );
                                }
                            } else if (o.editTerm === "object" ) {
                                choice = processLiteral( i, o );
                            }
                            label = i;
                        } else {
                            label = e.label;
                            choice = processResource( e.uri, o );
                        }
                        if( choice ) {
                            var data = processTripleUpdate( choice, original, o );
                            doUpdate( data, function( success, foobar, xhr ) {
                                    if( success ) {
                                        element.edit("option",o.editTerm,choice.value);
                                        element.empty().label(o).one('delayedclick', insertAC );
                                        original = choice;
                                    } else {
                                        alert( "Sorry, the server responded to your edit request with an error: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                                        element.empty().label(o).one('delayedclick', insertAC );
                                    }
                                }, o);
                        } else {
                            alert( "Sorry, the input you provided was not valid. Please choose a menu option or enter a valid URL.");
                            inputbox.one("autocompletechoice", insertLabel );
                            inputbox.focus();
                        }
                    }
                    inputbox.one("autocompletechoice", insertLabel );
                    if( !o.autocomplete ) {
                        o.menuOptions = [];
                    }
                    inputbox.focus();
                }
                element.one('delayedclick', insertAC );
            }
        }
    });

    $.ui.edit.getter = "getTriple";

    /**
     * @name jQuery.prototype.tripleedit
     * @description Draw a series of editable boxes for editing each term in a single triple.
     * @function
     * @param {String | Object} [options.subject] The subject of a statement to be matched.
     * @param {String | Object} [options.predicate] The predicate of a statement to be matched.
     * @param {String | Object} [options.object] The object of a statement to be matched.
     * @param {Boolean} [options.autocomplete=true] If false, no autocomplete menu will be displayed.
     * @param {Object} [options] @see CommonOptions
     */
    $.rdfwidget("ui.tripleedit", {
        options: {
            namespaces:namespaces,
            showlinks:false,
            autocomplete:true
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
            var o = this.options;
            if( o.subjectElement ) {
                $(o.subjectElement).edit('disable');
            }
            if( o.predicateElement ) {
                $(o.predicateElement).edit('disable');
            }
            if( o.objectElement ) {
                $(o.objectElement).edit('disable');
            }
        },

        enable: function() {
            var o = this.options;
            if( o.subjectElement ) {
                $(o.subjectElement).edit('enable');
            }
            if( o.predicateElement ) {
                $(o.predicateElement).edit('enable');
            }
            if( o.objectElement ) {
                $(o.objectElement).edit('enable');
            }
        },
        getTriple: function() {
            var o = this.options;
            if( o.subjectElement ) {
                return $(o.subjectElement).edit('getTriple');
            } else if( o.predicateElement ) {
                return $(o.predicateElement).edit('getTriple');
            } else if( o.objectElement) {
                return $(o.objectElement).edit('getTriple');                
            }
            return null;
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            if( ! (o.subjectElement || o.predicateElement || o.objectElement)) {
                element.empty();
            }

            var beforeSubmit = function(data, xhr) {
                that.disable();
                if( o.beforeSubmit ) {
                    o.beforeSubmit( data, xhr );
                }
            }

            var afterSubmit = function(success, data, xhr) {
                if( success && data.insert_triples && data.insert_triples[0] ) {
                    element.tripleedit('option','subject',data.insert_triples[0].subject);
                    element.tripleedit('option','predicate',data.insert_triples[0].predicate);
                    element.tripleedit('option','object',data.insert_triples[0].object);
                }
                if( o.afterSubmit ) {
                    o.afterSubmit( success, data, xhr );
                }
                that.enable();
            }

            var subjectopts = {};
            var newopts = {editTerm:'subject',beforeSubmit:beforeSubmit, afterSubmit:afterSubmit}
            $.extend( subjectopts, o, newopts );
            if( o.subjectElement === undefined ) {
                element.tripleedit('option','subjectElement',$('<div class="rdftripleedit"></div>'));
                element.append( o.subjectElement );
            }

            var predopts = {};
            newopts = {editTerm:'predicate',beforeSubmit:beforeSubmit, afterSubmit:afterSubmit}
            $.extend( predopts, o, newopts );
            if( o.predicateElement === undefined ) {
                element.tripleedit('option','predicateElement',$('<div class="rdftripleedit"></div>'));
                element.append( o.predicateElement );
            }
            var objectopts = {};
            newopts = {editTerm:'object',beforeSubmit:beforeSubmit, afterSubmit:afterSubmit}
            $.extend( objectopts, o, newopts );
            if( o.objectElement === undefined ) {
                element.tripleedit('option','objectElement',$('<div class="rdftripleedit"></div>'));
                element.append( o.objectElement );
            }
            if( o.subjectElement ) {
                $(o.subjectElement).edit(subjectopts);
            }
            if( o.predicateElement ) {
                $(o.predicateElement).edit(predopts);
            }
            if( o.objectElement ) {
                $(o.objectElement).edit(objectopts);
            }

        }

    });

    $.ui.tripleedit.getter = "getTriple";

    /**
     * @name jQuery.prototype.selecttable
     * @description Perform a SPARQL SELECT query with a set of properties and display the results in a table.
     * @function
     * @param {String | Object} [options.type] If specified, the required rdf:type of each result in the list.
     * @param {Array} [options.properties] If specified, the set of properties to be SELECTed for.
     * @param {Array} [options.requireall=true] If false, matches that bind at least one item in options.properties will be displayed.
     * @param {Object} [options] @see CommonOptions
     */
    $.rdfwidget("ui.selecttable", {
        options: {
            namespaces:namespaces,
            showlinks:false,
            editable:true,
            autocomplete:true,
            subject:window.location,
            requireall:true,
            properties:[]
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
        },

        enable: function() {
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;

            var optsArray = {};
            var properties = [];
            for( var i = 0; i < o.properties.length; i++ ) {
                properties.push( processResource( o.properties[i], o ) );
            }

            function doHeader( ) {
                var str = "<thead><tr class='rdfeditheader'><th></th>";
                for( var i = 0; i < properties.length; i++ ) {
                    var id = randomID();
                    var cell = "<div class='rdfeditheader' id='"+id+"'></div>";
                    var cellopts = {};
                    var tripopts = {subject: properties[i], predicate:null, object:null, selectable:false, editable:false};
                    $.extend( cellopts, o, tripopts );
                    optsArray[id]= cellopts;
                    td+=cell;
                    str += "<th class='rdfeditheader'>"+cell+"</th>";
                }
                str += "</tr></thead>";
                return str;
            }

            var html = "<table class='rdfselecttable'><tbody>";
            html += doHeader();
            if( o.type ) {
                var t = processResource( o.type, o );
                var subjects = $.rdfwidgets.each( undefined, db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), t,undefined, o );
                for( var i = 0; i < subjects.length; i++ ) {
                    var row = "<tr>";
                    var subject = subjects[i];
                    //todo: row header.
                    var id = randomID();
                    var td = "<td class='rdfeditheader'>";
                    var cell = "<div  class='rdfeditheader' id='"+id+"'></div>";
                    var cellopts = {};
                    var tripopts = {subject: subject, predicate:null, object:null, selectable:false, editable:false};
                    $.extend( cellopts, o, tripopts );
                    optsArray[id]= cellopts;
                    td += cell + "</td>";
                    row += td;
                    var fail = false;
                    for( var j = 0; j < properties.length; j++ ) {
                        td = "<td>";
                        var objects = $.rdfwidgets.each( subject, properties[j],undefined,undefined,o );
                        if( (!objects || objects.length == 0)) {
                            if( o.requireall ) {
                                fail = true;
                                break;
                            } else {
                                id = randomID();
                                cell = "<div id='"+id+"'></div>";
                                cellopts = {};
                                tripopts = {subject: subject, predicate:properties[j]};
                                $.extend( cellopts, o, tripopts );
                                optsArray[id] = cellopts;
                                td += cell;
                            }
                        }
                        for( var k = 0; k < objects.length; k++ ) {
                            id = randomID();
                            cell = "<div id='"+id+"'></div>";
                            cellopts = {};
                            tripopts = {subject: subject, predicate:properties[j], object:objects[k]};
                            $.extend( cellopts, o, tripopts );
                            optsArray[id] = cellopts;
                            td += cell;
                        }
                        td+="</td>";
                        row += td;
                    }
                    if( !o.requireall || !fail ) {
                        row += "</tr>";
                        html += row;
                    }
                }
            } else {
                var done = {};
                var total = 0;
                for( var h = 0; ((h < properties.length && !o.requireall) || (o.requireall && h < 1)) ; h++ ) {
                    var tempsubjects = $.rdfwidgets.statementsMatching( undefined, properties[h],undefined,undefined,false,o);
                    var subjects = [];
                    var count = total;
                    for( var y= 0; y < tempsubjects.length; y++ ) {
                        if( !done[tempsubjects[y].subject] ) {
                            subjects.push(tempsubjects[y].subject);
                            done[tempsubjects[y].subject]=true;
                            total++;
                        }
                    }
                    for( var i = 0; i < subjects.length; i++ ) {
                        var fail = false;
                        var row = "<tr>";
                        var subject = subjects[i];
                        //todo: row header.
                        var id = randomID();
                        var td = "<td class='rdfeditheader'>";
                        var cell = "<div class='rdfeditheader' id='"+id+"'></div>";
                        var cellopts = {};
                        var tripopts = {subject: subject, predicate:null, object:null, selectable:false, editable:false};
                        $.extend( cellopts, o, tripopts );
                        optsArray[id]= cellopts;
                        td += cell + "</td>";
                        row += td;
                        for( var j = 0; j < h; j++ ) {
                            row += "<td>";
                            id = randomID();
                            cell = "<div id='"+id+"'></div>";
                            cellopts = {};
                            tripopts = {subject: subject, predicate:properties[j]};
                            $.extend( cellopts, o, tripopts );
                            row+=cell+ "</td>";
                            optsArray[id] = cellopts;
                        }
                        for( var j = h; j < properties.length; j++ ) {
                            td = "<td>";
                            var objects = $.rdfwidgets.each( subject, properties[j],undefined,undefined,o );
                            if( (!objects || objects.length == 0)) {
                                if( o.requireall ) {
                                    fail = true;
                                    break;
                                } else {
                                    id = randomID();
                                    cell = "<div id='"+id+"'></div>";
                                    cellopts = {};
                                    tripopts = {subject: subject, predicate:properties[j]};
                                    $.extend( cellopts, o, tripopts );
                                    optsArray[id] = cellopts;
                                    td += cell;
                                }
                            }
                            for( var k = 0; k < objects.length; k++ ) {
                                id = randomID();
                                cell = "<div id='"+id+"'></div>";
                                cellopts = {};
                                tripopts = {subject: subject, predicate:properties[j], object:objects[k]};
                                $.extend( cellopts, o, tripopts );
                                optsArray[id] = cellopts;
                                td += cell;
                            }
                            td+="</td>";
                            row += td;
                        }
                        if( !o.requireall || !fail ) {
                            row += "</tr>";
                            html += row;
                        }
                    }
                }
            }
            html+= "</tbody></table>";
            element.bind( "rdfdelete", function( e ) {
                var triple = $(e.target).edit("getTriple");
                
                if( triple ) {
                    doDelete( [ triple ] , function( success, foobar, xhr ) { 
                        if( success ) {
                            var parent = $(e.target).parent();
                            $(e.target).remove();
                            if( parent.children().size() == 0 ) {
                                if( !o.requireall ) {
                                            id = randomID();
                                    cell = "<div id='"+id+"'></div>";
                                    cellopts = {};
                                    tripopts = {subject: triple.subject, predicate:triple.predicate};
                                    $.extend( cellopts, o, tripopts );
                                    optsArray[id] = cellopts;
                                    $(parent).append(cell);
                                    $('#'+id).edit( cellopts );
                                } else {
                                    parent.parent().remove();
                                }
                            }
                        } else {
                            alert( "Sorry, the triple could not be deleted. Server response: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                        }
                    }, o );
                } else {
                    alert( "Sorry, the deletion of information related to blanknodes is not yet supported." );
                }
            });
            element.html(html);
            
            $(element).find('div').each( function() {
                    var p = optsArray[this.id]
                        if( p ) {
                            if( p.editable ) {
                                $(this).edit( optsArray[this.id] );
                            } else {
                                $(this).label( optsArray[this.id] );
                            }
                        }
                });           
            }
        });

    /**
     * @name jQuery.prototype.instancedropdown
     * @description Provide an autocomplete input that contains all instances of a given type.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {String | Object} [options.type] If provided, only instances of the given type will be displayed in the dropdown.  Otherwise, all instances in the local store are options.
     */
    $.rdfwidget("ui.instancedropdown", {
        options: {
            namespaces:namespaces,
            showlinks:false,
            autocomplete:true
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
        },

        enable: function() {
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            var t = processResource( o.type, o );
            this.triples = $.rdfwidgets.statementsMatching( undefined, db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), t, undefined, false, o );
            if( o.filterduplicates ) {
                this.triples = filterDuplicates( this.triples );
            }
            var input = $("<input type='text'></input>");
            doAutocomplete( input, {menuOptions: getMenuUsedOptions( { type: o.type, sources:o.sources } ) } );
            input.bind( "autocompletechoice", function(e) {
                if( e.uri ) {
                    element.trigger( "rdfselect", [db.sym(e.uri)] ); 
                } else {
                    alert( "Please enter a valid menu selection." );
                }
            });
            element.empty().append( input );
        }
    });

    /**
     * @name jQuery.prototype.instancelist
     * @description Provide an list that contains all instances of a given type.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {String | Object} [options.type] The rdf:type to filter instances by.
     */
    $.rdfwidget("ui.instancelist", {
        options: {
            namespaces:namespaces,
            showlinks:false,
            autocomplete:true,
            subject:window.location
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
        },

        enable: function() {
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            var t = processResource( o.type, o );
            this.triples = $.rdfwidgets.statementsMatching( undefined, db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), t, undefined, false, o);
            if( o.filterduplicates ) {
                this.triples = filterDuplicates( this.triples );
            }
            var html = "<table class='rdfinstancelist'><tbody>";
            var ids = [];
            var id;
            for( var i = 0; i < this.triples.length; i++ ) {
                id = randomID();
                ids.push( id );
                html += "<tr><td id='"+id+"'></td></tr>";
            }
            html += "</tbody></table>";
            element.html(html);
            var opts,tripopts;
            for( var i = 0; i < ids.length; i++ ) {
                opts = {};
                tripopts = {subject: that.triples[i].subject, selectable:true};
                $.extend( opts, o, tripopts );
                $('#'+ids[i]).label(opts);
            }
        }
    });

    /**
     * @name jQuery.prototype.checkbox
     * @description Let the user edit a triple by selecting which value(s) it takes on from a set of checkboxes.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {Array} [options.choices] The set of Terms that are made available to choose from as checkboxes.
     * @param {String | Object} [options.subject] The subject of a statement to be matched.
     * @param {String | Object} [options.predicate] The predicate of a statement to be matched.
     * @param {String | Object} [options.object] The object of a statement to be matched.
     */
    $.rdfwidget("ui.checkbox", {
        options: {
            namespaces:namespaces,
            showlinks:true,
            choices:[]
        },
        _create: function() {
            this.groupname = randomID();
            this.refresh();
        },

        disable: function() {
            this.element.find('input').attr('disabled','disabled');
        },

        enable: function() {
            this.element.find('input').attr('disabled',false);
        },

        _setOption: function( key ) {
            $.Widget.prototype._setOption.apply( this, arguments );
            if ( key === "subject" || key === "predicate" || key === "object") {
                this.refresh();
            }
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            processEditTerm( o );
            var choices = [];
            var used = {};
            var useda = [];
            var span = $('<span class="rdfcheckbox"></span>');
            if( o.editTerm === "object" ) {
                for( var i = 0; i < o.choices.length; i++ ) { choices.push( processObject( o.choices[i], o ) ); }
            } else {
                for( var i = 0; i < o.choices.length; i++ ) { choices.push( processResource( o.choices[i], o ) ); }
            }
            var exist = $.rdfwidgets.each( (o.editTerm!=="subject" ? processResource(o.subject,o) : undefined ), (o.editTerm!=="predicate" ? processResource(o.predicate,o) : undefined ), (o.editTerm!=="object" ? processObject(o.object,o) : undefined ), undefined, o );
            for( var i = 0; i < exist.length; i++ ) {
                choices.push( exist[i] );
            }
            function handleCheck(e) {
                e.preventDefault();
                var t = $(e.target);
                var selection = choices[Number($(this).val())];
                t.attr("disabled","disabled");
                var update = {insert_triples:[],delete_triples:[]};
                if( !t.attr("checked") ) {
                    var st = new $rdf.Statement( o.subject ? processResource( o.subject,o ) : undefined,
                                                 o.predicate ? processResource( o.predicate,o ) : undefined,
                                                 o.object ? processObject( o.object,o ) : undefined );
                    st[o.editTerm] = selection;
                    var st2 = $.rdfwidgets.anyStatementMatching( st.subject, st.predicate, st.object,undefined,o );
                    st = st2 ? st2 : st;
                    update.delete_triples.push( st );
                } else {
                    var st = new $rdf.Statement( o.subject ? processResource( o.subject,o ) : undefined,
                                                 o.predicate ? processResource( o.predicate,o ) : undefined,
                                                 o.object ? processObject( o.object,o ) : undefined );
                    st[o.editTerm] = selection;
                    update.insert_triples.push( st );
                }
                doUpdate( update, function( success, foobar, xhr ) {
                        if( success ) {
                            t.attr("checked",!t.attr("checked"));
                            t.attr("disabled",false);
                        } else {
                            t.attr("disabled",false);
                            alert( "Sorry, the server responded to your request with an error: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                        }
                    }, o);
            }

            element.empty();
            for( var i = 0; i < choices.length; i++ ) {
                if( !used[choices[i].value] ) {
                    var id = randomID();
                    var div = $('<div class="rdfcheckbox" ></div>');
                    var cb = $('<input type="checkbox" name="'+this.groupname+'" id="'+id+'" value="'+useda.length+'"></input>');
                    var label = $('<label for="'+id+'">'+doLabel(choices[i],o)+'</label>');
                    span.append(div);
                    div.append(cb);
                    div.append(label);
                    var st = new $rdf.Statement( o.subject ? processResource( o.subject,o ) : undefined,
                                                 o.predicate ? processResource( o.predicate,o ) : undefined,
                                                 o.object ? processObject( o.object,o ) : undefined );
                    st[o.editTerm] = choices[i];
                    if( $.rdfwidgets.anyStatementMatching( st.subject, st.predicate, st.object, undefined, o ) ) {
                        cb.attr( "checked", "checked" );
                    }
                    cb.bind("click", handleCheck);
                    used[choices[i].value] = true;
                    useda.push(choices[i].value);
                }
            }
            element.append(span);
        }

    });

    /**
     * @name jQuery.prototype.radio
     * @description Let the user edit a triple by selecting which single value it takes on from a set of radio buttons.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {Array} [options.choices] The set of choices the user may choose from as a set of radio buttons.
     * @param {String | Object} [options.subject] The subject of a statement to be matched.
     * @param {String | Object} [options.predicate] The predicate of a statement to be matched.
     * @param {String | Object} [options.object] The object of a statement to be matched.
     */
    $.rdfwidget("ui.radio", {
        options: {
            namespaces:namespaces,

            showlinks:true,
            choices:[]
        },
        _create: function() {
            this.groupname = randomID();
            this.refresh();
        },

        disable: function() {
            this.element.find('input').attr('disabled','disabled');
        },

        enable: function() {
            this.element.find('input').attr('disabled',false);
        },

        _setOption: function( key ) {
            $.Widget.prototype._setOption.apply( this, arguments );
            if ( key === "subject" || key === "predicate" || key === "object") {
                this.refresh();
            }
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            that.currentChoice = null;
            processEditTerm( o );
            var initialValue;
            var choices = [];
            var used = {};
            var useda = [];
            var span = $('<span class="rdfradio"></span>');
            var temp = $.rdfwidgets.each( o.subject ? processResource( o.subject,o ) : undefined,
                                          o.predicate ? processResource( o.predicate,o ) : undefined,
                                          o.object ? processObject( o.object,o ) : undefined, undefined, o );
            if( temp && temp.length > 1 ) {
                element.checkbox( o );
                return;
            }
            if( o.editTerm === "object" ) {
                for( var i = 0; i < o.choices.length; i++ ) { choices.push( processObject( o.choices[i], o ) ); }
            } else {
                for( var i = 0; i < o.choices.length; i++ ) { choices.push( processResource( o.choices[i], o ) ); }
            }

            if( temp && temp.length === 1 ) {
                initialValue = temp[0];
                that.currentChoice = initialValue;
                choices.push( temp[0] );
            } else {
                initialValue = null;
            }

            function handleCheck(e) {
                e.preventDefault();
                var selection = choices[Number($(this).val())];
                if( that.currentChoice && selection.value === that.currentChoice.value ) {
                    return;
                }
                element.find( "input" ).attr("disabled","disabled");
                var update = {insert_triples:[],delete_triples:[]};
                if( that.currentChoice ) {
                    var st = new $rdf.Statement( o.subject ? processResource( o.subject,o ) : undefined,
                                                 o.predicate ? processResource( o.predicate,o ) : undefined,
                                                 o.object ? processObject( o.object,o ) : undefined );
                    st[o.editTerm] = that.currentChoice;
                    var st2 = $.rdfwidgets.anyStatementMatching( st.subject, st.predicate, st.object, undefined, o );
                    st = st2 ? st2 : st;
                    update.delete_triples.push( st );
                }
                var st = new $rdf.Statement( o.subject ? processResource( o.subject,o ) : undefined,
                                             o.predicate ? processResource( o.predicate,o ) : undefined,
                                             o.object ? processObject( o.object,o ) : undefined );
                st[o.editTerm] = selection;
                update.insert_triples.push( st );
                doUpdate( update, function( success, foobar, xhr ) {
                        if( success ) {
                            $(e.target).attr("checked","checked");
                            that.currentChoice = selection;
                            element.find( "input" ).attr("disabled",false);
                        } else {
                            element.find( "input" ).attr("disabled",false);
                            alert( "Sorry, the server responded to your request with an error: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                        }
                    }, o);
            }

            element.empty();
            for( var i = 0; i < choices.length; i++ ) {
                if( !used[choices[i].value]) {
                    var id = randomID();
                    var div = $('<div class="rdfradio"></div>');
                    var radio = $('<input class="rdfradio" type="radio" name="'+this.groupname+'" id="'+id+'" value="'+useda.length+'"></input>');
                    var label = $('<label for="'+id+'">'+doLabel(choices[i],o)+'</label>');
                    span.append(div);
                    div.append(radio);
                    div.append(label);
                    if( initialValue && choices[i].value === initialValue.value ) {
                        radio.attr("checked","checked");
                    }
                    used[choices[i].value] = true;
                    useda.push( choices[i].value );
                    radio.bind("click", handleCheck);
                }
            }
            element.append(span);
        },
        getTriple: function() {
            var o = this.options;
            if( this.currentChoice ) {
                var st = new $rdf.Statement( o.subject ? processResource( o.subject,o ) : undefined,
                                             o.predicate ? processResource( o.predicate,o ) : undefined,
                                             o.object ? processObject( o.object,o ) : undefined );
                st[o.editTerm] = this.currentChoice;
                return $.rdfwidgets.anyStatementMatching( st.subject, st.predicate, st.object, undefined, o );
            }
        }

    });

    $.ui.radio.getter = "getTriple";

    /**
     * @name jQuery.prototype.combobox
     * @description Let the user edit a triple by selecting which single value it takes on from a combobox.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {Array} [options.choices] The set of choices the user may choose from as dropdown items in a combo box.
     * @param {String | Object} [options.subject] The subject of a statement to be matched.
     * @param {String | Object} [options.predicate] The predicate of a statement to be matched.
     * @param {String | Object} [options.object] The object of a statement to be matched.
     */
    $.rdfwidget("ui.combobox", {
        options: {
            namespaces:namespaces,
            choices:[]
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
            this.combo.attr( "disabled", "disabled" );
        },

        enable: function() {
            this.combo.attr( "disabled", false );
        },

        getTriple: function() {
            var o = this.options;
            var term = this.ids[this.current.val()];
            if( term && o.editTerm ) {
                var st = new $rdf.Statement( o.subject ? processResource( o.subject,o ) : undefined,
                                             o.predicate ? processResource( o.predicate,o ) : undefined,
                                             o.object ? processObject( o.object,o ) : undefined );
                st[o.editTerm] = term;
                return $.rdfwidgets.anyStatementMatching( st.subject, st.predicate, st.object, undefined, o );
            }
        },

        _setOption: function( key ) {
            $.Widget.prototype._setOption.apply( this, arguments );
            if ( key === "subject" || key === "predicate" || key === "object" || key === "editTerm" ) {
                this.refresh();
            }
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            processEditTerm( o );
            var ids = {};
            var opt, term, id;
            var process = (o.editTerm === "object") ? processObject : processResource;
            var combo = $('<select class="rdfcombobox"></select>');
            this.combo = combo;
            var initial = null;
            this.current = null;
            function addOption( str,hidden ) {
                term = process( str,o );
                id = randomID();
                if( !hidden ) {
                    ids[id] = term;
                }
                opt = $('<option value="'+id+'" title="'+term.value.toString()+'"'+(hidden?' style="display:none"':'')+'>'+doLabel(term, o)+'</option>');
                combo.append( opt );
                return opt;
            }
            this.current = addOption( "", true );
            var subject = ((o.editTerm === "subject") ? undefined : processResource(o.subject,o));
            var predicate = ((o.editTerm === "predicate") ? undefined : processResource(o.predicate,o));
            var object = ((o.editTerm === "object") ? undefined : processObject(o.object,o));
            var existing = $.rdfwidgets.each( subject,predicate,object,undefined,o );

            var used = {};
            var choices = [];
            for( var i = 0; i < o.choices.length; i++ ) {
                choices.push( process( o.choices[i], o ) );
            }

            if( existing ) {
                if( existing.length === 1 ) {
                    initial = existing[0].value;
                    choices.push( existing[0] );
                } else if (existing.length > 1) {
                    throw "Combobox functionality is only provided for patterns with a single value right now:"+existing;
                }
            }
            for( var i = 0; i < choices.length; i++ ) {
                if( !used[ choices[i].value ] ) {
                    used[choices[i].value] = true;
                    var opt = addOption( choices[i] );
                    if( choices[i].value === initial ) {
                        opt.attr("selected","selected");
                        this.current = opt;
                    }
                }
            }

            element.empty().append(combo);
            combo.change( function( e ) {
                old = ids[that.current.val()];
                var term = ids[e.target.value];
                var d = processTripleUpdate( term, old, o );
                combo.attr("disabled","disabled");
                doUpdate( d, function( success, foobar, xhr ) {
                    if( success ) {
                        that.current = $(e.target).find(":selected");
                    } else {
                        alert( "Sorry, the server responded to your request with an error: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                        that.current.attr("selected","selected");
                    }
                    combo.attr( "disabled", false );
                }, o );
            });
            this.ids = ids;
        }
    });

    $.ui.combobox.getter = "getTriple";

    /**
     * @name jQuery.prototype.triplelist
     * @description Display the list of triples that match a given pattern.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {String | Object} [options.subject] The subject of the statements to be matched.
     * @param {String | Object} [options.predicate] The predicate of the statements to be matched.
     * @param {String | Object} [options.object] The object of the statements to be matched.
     * @param {String | Object} [options.filterduplicates=false] Remove duplicate statements from multiple different data sources.
     */
    $.rdfwidget("ui.triplelist", {
        options: {
            namespaces:namespaces,
            showlinks:false,
            autocomplete:true,
            filterduplicates:false
        },
        _create: function() {
            this.refresh();
        },

        _setOption: function( key ) {
            $.Widget.prototype._setOption.apply( this, arguments );
            if ( key === "subject" || key === "predicate" || key === "object" ) {
                this.refresh();
            }
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            var table = $('<table class="triplelist"></table>');
            table.bind( "rdfdelete", function( e ) {
                var row = $(e.target).parent();
                var triple = row.tripleedit( "getTriple" );
                if( triple ) {
                    doDelete( [ triple ] , function( success, foobar, xhr ) { 
                        if( success ) {
                            row.remove();
                        } else {
                            alert( "Sorry, the server responded to your edit request with an error: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                        }
                    }, o );
                } else {
                    alert( "Sorry, the deletion of information related to blank nodes is not yet supported." );
                }
            });
            element.empty().append(table);
            var subject = o.subject ? processResource( o.subject,o ) : undefined;
            var predicate = o.predicate ? processResource( o.predicate,o) : undefined;
            var object = o.object ? processObject( o.object, o) : undefined;
            this.triples = $.rdfwidgets.statementsMatching( subject,predicate,object, undefined, false, o );
            if( o.filterduplicates ) {
                this.triples = filterDuplicates( this.triples );
            }
            var rows = [];
            var html= "<tbody>";
            for( var i = 0; i < this.triples.length; i++ ) {
                var t = this.triples[i];
                var rid = randomID(), sid = null, pid = null, oid = null;
                html += "<tr id='"+rid+"'>";
                if( !o.subject ) {
                    sid = randomID();
                    html += "<td id='"+sid+"'></td>";
                }
                if( !o.predicate ) {
                    pid = randomID();
                    html += "<td id='"+pid+"'></td>";
                }
                if( !o.object ) {
                    oid = randomID();
                    html += "<td id='"+oid+"'></td>";
                }
                html += "</tr>";
                var opts = {};
                var tripopts = {subject: t.subject, predicate: t.predicate, object: t.object, subjectElement: '#'+sid, predicateElement: '#'+pid, objectElement: '#'+oid};
                $.extend( opts, o, tripopts );
                rows.push({r:rid,o:opts});
            }
            html += "</tbody>";
            table.append( html );

            for( var i = 0; i < rows.length; i++ ) {
                $('#'+rows[i].r).tripleedit(rows[i].o);
            }
        }
    });

    /**
     * @name jQuery.prototype.toolbar
     * @description Display an image for each resource of a certain type in a toolbar layout.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {String | Object} [options.type] The rdf:type that should be used to decide which resources will appear in the toolbar.
     */
    $.rdfwidget("ui.toolbar", {
        options: {
            namespaces:namespaces,
            width:32,
            height:32
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
            element.find( "td" ).each( function() { 
                $(this).image("disable");
            });
        },

        enable: function() {
            element.find( "td" ).each( function() { 
                $(this).image("enable");
            });
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            var t = processResource( o.type, o );

            if( o.choices ) {
                this.choices = o.choices;
            } else {
                this.choices = $.rdfwidgets.each( undefined, db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), t, undefined, o );
            }
            var html = "<table class='rdftoolbar'><tr>";
            var actual = [];

            for( var i = 0; i < this.choices.length; i++ ) {
                if( (o.mappings && o.mappings[this.choices[i]]) || doImage( processResource(this.choices[i],o),o) ) {
                    actual.push( this.choices[i] );
                    html += "<td width="+o.width+" height="+o.height+" class='rdftoolbar' style='margin:1px'></td>";
                }
            }
            html += "</tr></table>";
            element.html(html);
            element.find( "td" ).each( function(i) { 
                    var opts = {};
                    var tripopts = {subject: actual[i], selectable:true};
                    $.extend( opts, o, tripopts );
                    $(this).image(opts);
                });
        }
    });

    /**
     * @name jQuery.prototype.resource
     * @description Display a table containing all of the properties of a given resource.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {String | Object} [options.subject] the URI of the resource to be described.
     */
    $.rdfwidget("ui.resource", {
        options: {
            namespaces:namespaces,
            showlinks:false,
            autocomplete:true,
            subject:window.location
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
        },

        enable: function() {
        },

        _setOption: function( key ) {
            $.Widget.prototype._setOption.apply( this, arguments );
            if ( key === "subject" ) {
                this.refresh();
            }
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            var div = $('<div></div>');
            var table = $('<table class="rdfresourceedit"></table>');
            table.bind( "rdfdelete", function( e ) {
                var row = $(e.target).parent();
                var triple = row.tripleedit( "getTriple" );
                if( triple ) {
                    doDelete( [ triple ] , function( success, foobar, xhr ) { 
                        if( success ) {
                            row.remove();
                        } else {
                            alert( "Sorry, the triple could not be deleted. Server response: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                        }
                    }, o );
                } else {
                    alert( "Sorry, the deletion of information related to blanknodes is not yet supported." );
                }
            });
            div.append(table);
            element.empty().append(div);
            var subject = processResource( o.subject,o );
            this.triples = $.rdfwidgets.statementsMatching( subject,undefined,undefined,undefined,false,o );
            var hid = randomID();
            var thead = "<thead><tr class='rdfeditheader'><td id='"+hid+"' colspan=2></td></tr></thead>";
            table.append(thead);
            $('#'+hid).label( {showlinks:o.showlinks,subject:o.subject, selectable:true } );
            var tbody = "<tbody>";
            var id, ids = [], opts, tripopts;
            var sopts = [];
            for( var i = 0; i < this.triples.length; i++ ) {
                id = { p:randomID(),r:randomID(),o:randomID() };
                ids.push(id);
                var tr = '<tr id="'+id.r+'"><td id="'+id.p+'"></td><td id="'+id.o+'"></td></tr>';
                var opts = {};
                var tripopts = {subject: this.triples[i].subject, predicate: this.triples[i].predicate, object: this.triples[i].object, subjectElement: null, predicateElement: '#'+id.p, objectElement: '#'+id.o };
                $.extend( opts, o, tripopts );
                sopts.push( opts );
                tbody+=tr;
            }
            tbody += "</tbody>";
            table.append( tbody );
            
            for( var i = 0; i < this.triples.length; i++ ) {
                $('#'+ids[i].r).tripleedit( sopts[i] );
            }
            var addButton = $('<input type="button" value="Add..."></input>');
            div.append(addButton);
            addButton.click( function() {
                var addTable = $('<table class="rdfaddtriple"></table');
                addTable.append('<tr><th colspan="2">Add Data</th></tr>');
                var rowid1 = randomID();
                var rowid2 = randomID();
                var firstRow = $('<tr><td><label for="'+rowid1+'">Property: </label></td></tr>');
                var secondRow = $('<tr><td><label for="'+rowid2+'">Value: </label></td></tr>');
                var firstInput = $('<input name="'+rowid1+'" type="text"></input>');
                var secondInput = $('<input name="'+rowid2+'" type="text"></input>');
                
                doAutocomplete( firstInput, { menuOptions:getMenuPredicateOptions( {} ) } );
                doAutocomplete( secondInput, { menuOptions:getMenuInstanceOptions( {} ) } );
                
                var lastPred, lastPredInput, lastObj, lastObjInput;
                
                firstInput.bind( "autocompletechoice", function(e) {
                    lastPred = e.uri;
                    lastPredInput = e.input;
                });
                
                secondInput.bind( "autocompletechoice", function(e) {
                    lastObj = e.uri;
                    lastObjInput = e.input;
                });
                secondInput.focus( function() {
                    doAutocomplete( secondInput, { menuOptions:getMenuInstanceOptions( {subject:o.subject, predicate:lastPred, editTerm:"object"} ) } );
                })
                firstRow.append(firstInput);
                secondRow.append(secondInput);
                addTable.append(firstRow).append(secondRow);
                var addPopup = $('<div style="position:absolute; display:none" class="rdfaddpropertypopup"></div>');
                var closeButton = $('<a style="position:absolute" href="#">X</a>');
                var submitButton = $('<input type="button" value="Submit"></input>');
                submitButton.click( function() {
                    if( !lastPred ) {
                        alert( "You must enter a valid property.");
                        return;
                    }else if( !lastObjInput ) {
                        alert( "You must enter a value." );
                        return;
                    } else {
                        var pred = processResource( lastPred, o );
                        var obj;
                        if( lastObj ) {
                            obj = processResource( lastObj, o );
                        } else {
                            obj = processObject( lastObjInput, o );
                        }
                        var triple = new $rdf.Statement( subject, pred, obj );
                        if( !$.rdfwidgets.anyStatementMatching( subject, pred, obj,undefined, o ) ) {
                            doInsert( [ triple ], function( success, foobar, xhr ) {
                                if( success ) {
                                    var predicateTD = $('<td class="'+((2%2===0) ? 'rdfediteven' : 'rdfeditodd')+'"></td>');
                                    var objectTD = $('<td class="'+((2%2===0) ? 'rdfediteven' : 'rdfeditodd')+'"></td>');
                                    var TR = $('<tr class="'+((2%2===0) ? 'rdfediteven' : 'rdfeditodd')+'"></tr>');
                                    
                                    table.append(TR);
                                    TR.append(predicateTD);
                                    TR.append(objectTD);
                                    var opts = {};
                                    var tripopts = {subject: subject, predicate: pred, object: obj, subjectElement: null, predicateElement: predicateTD, objectElement: objectTD };
                                    $.extend( opts, o, tripopts );
                                    TR.tripleedit(opts);
                                    addPopup.hide("fast");
                                } else {
                                    alert( "Sorry, the triple could not be inserted at this time.  Server response: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                                }
                            }, o );
                        } else {
                            alert( "Good news: the triple you created already exists!" );
                        }
                    }
                });
                closeButton.click( function() {
                    addPopup.hide("fast");
                });
                addPopup.append(closeButton);
                addPopup.append( addTable );
                addPopup.append( submitButton );
                var pos = addButton.offset();
                var width = addButton.outerWidth();
                var height = addButton.outerHeight();
                div.append( addPopup );
                closeButton.css( { "right": "2px", "top": "2px" } );
                addPopup.css( {"left": (pos.left + width) + "px", "top":(pos.top+height) + "px" } );
                
                addPopup.show("fast");
            });
        }
    });

    /**
     * @name jQuery.prototype.createinstance
     * @description Create a form for creating new information about an as-yet undescribed object.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {Object} [options.properties] An array of create instance options.  Each object must at least have a property field, which defines which predicate the form input will obtain an object for. More coming soon.
     */
    $.rdfwidget("ui.createinstance", {
        options: {
            namespaces:namespaces,
            showlinks:false,
            autocomplete:true
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
            element.find("input").attr("disabled","disabled");
            element.find("textarea").attr("disabled","disabled");
        },

        enable: function() {
            element.find("input").attr("disabled",false);
            element.find("textarea").attr("disabled",false);
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            var items = o.items;
            var itemIDs = [];
            var map = {};
            var form = $('<form class="rdfcreateinstance"></form>');
            var table = $('<table class="rdfcreateinstance"></table>');
            var staticTriples = [];
            var why = db.sym(getEndpoint( null, o ));
            o.editTerm="object";

            if( o.items ) {
                for( var i=0; i < items.length; i++ ) {
                    var item = items[i];
                    if ( item.type == "hidden" ) {
                        if( item.predicate && item.object ) {
                            staticTriples.push(item);
                        }
                        continue;
                    }

                    var id = randomID();
                    if( !item.predicate ) {
                        continue;
                    }
                    itemIDs.push( id );
                    map[id] = item;
                    var row = $("<tr></tr>");
                    var p = processResource( item.predicate, o );
                    if( !item.type || item.type == "text" ) {
                        var td = $("<td></td>");
                        var label = $("<td><label for='"+id+"'>"+doLabel( p, o )+"</label></td>");
                        var input = $("<input id='"+id+"' name='"+id+"' type='text'></input>");
                        td.append(input);
                        row.append(label).append(td);
                        var opts = {};
                        //todo: inputopts used to be {predicate:p}
                        var inputopts = item;
                        $.extend( opts, o, item, inputopts );
                        doAutocomplete( input, opts );
                        table.append(row);
                    } else if ( item.type == "textarea" ) {
                        var td = $("<td></td>");
                        var label = $("<td><label for='"+id+"'>"+doLabel( p, o )+"</label></td>");
                        var input = $("<textarea id='"+id+"' name='"+id+"' ></textarea>");
                        td.append(input);
                        row.append(label).append(td);
                        var opts = {};
                        var inputopts = {subject:(o.subject ? processResource(o.subject) : (o.baseURI ? db.sym(o.baseURI + '#' + randomID()) : db.sym( window.location + '#' + randomID() ) ) ), predicate: p };
                        $.extend( opts, o, item, inputopts );
                        doAutocomplete( input, opts );
                        table.append(row);
                    }
                }
            }

            form.append(table);
            var submit = $('<input type="submit" value="Submit"></input>');
            form.append(submit);
            var disableAll = function() {
                for( var i=0; i<itemIDs.length; i++ ) { $('#'+itemIDs[i]).attr("disabled","disabled"); }
                submit.attr("disabled","disabled");
            };
            var enableAll = function() {
                for( var i=0; i<itemIDs.length; i++ ) { $('#'+itemIDs[i]).attr("disabled",false); }
                submit.attr("disabled",false);
            };
            form.submit( function(e) { 
                e.preventDefault();
                disableAll();
                var subject = o.subject ? processResource(o.subject) : (o.baseURI ? db.sym(docpart(o.baseURI) + '#' + randomID()) : db.sym( docpart(window.location.toString()) + '#' + randomID() ) );
                var triples = [];
                for( var i=0; i<itemIDs.length; i++ ) {
                    var id = itemIDs[i];
                    var item = map[id];
                    var elt = $('#'+id);
                    var uri = elt.data("uri");
                    var lastAC = elt.data("val");
                    var val = elt.val();
                    if( val === lastAC ) {
                        if( uri ) {
                            triples.push( new $rdf.Statement( subject, processResource( item.predicate ), processResource( uri ), subject ) );
                        } else {
                            triples.push( new $rdf.Statement( subject, processResource( item.predicate ), processLiteral( val ), subject ) );
                        }
                    } else {
                        triples.push( new $rdf.Statement( subject, processResource( item.predicate ), processLiteral( val ), subject ) );
                    }
                }
                for( var i = 0; i < staticTriples.length; i++ ) {
                    triples.push( new $rdf.Statement( subject, processResource( staticTriples[i].predicate ), processObject( staticTriples[i].object ), subject ) );
                }

                doInsert( triples , function(success, foobar, xhr) { 
                    if( success ) {
                    } else {
                        alert( "Sorry, an error occurred during the submission of your information.  Server Response: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                    }
                    enableAll();
                },o);
                return false;
            });
            element.empty().append(form);
        }
    });


    /**
     * @name jQuery.prototype.sourcelist
     * @description Display a list of all sources currently in use by the widget library.
     * @function
     */
    $.rdfwidget("ui.sourcelist", {
        options: {
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
        },

        enable: function() {
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            element.empty();
            var span = $('<span class="rdfsourcelist"></span>');

            var html = "<div class='rdfsourcelisttitle'>Sources</div>";
            for( var x in loadedSources ) {
                html += "<div class='rdfsourcelist'><a href='"+x+"' title='"+doLabel(db.sym(x),o)+"'>"+x+"</a></div>";
            }
            span.html(html);
            element.append(span);
        },

        insertData: function(d) {
            this.refresh();
        },

        deleteData: function(d) {
            this.refresh();
        }
    });


    getNodeSubject = function( node ) {
        var current = $(node);
        var subject;
        while( current.length > 0 ) {
            about = current.attr("about");
            var nn = current.get(0).nodeName;
            if( nn && nn.toLowerCase() === "a" ) {
                subject = join( current.get(0).href, window.location.toString() );
                break;
            }
            if( about ) {
                if( about.indexOf("[") === 0 ) {
                    //TODO: support safe curies..
                    continue;
                } else {
                    subject = join( about, window.location.toString() );
                    break;
                }
            }
            current = current.parent();
        }
        if( !subject ) {
            subject = window.location.toString();
        }
        return subject;
    }

    /**
     * @name jQuery.prototype.annotator
     * @description Display an annotation box when any element inside of a certain element is shift+clicked.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {String | Object} [options.displayElement] A valid jQuery constructor argument that determines where the annotations will be displayed when an item is selected.  If not provided, the annotations will be displayed in a floating popup.
     */
    $.rdfwidget("ui.annotator", {
        options: {
        },

        _findSubject: function( current ) {
            var subject;
            while( current.length > 0 ) {
                about = current.attr("about");
                var nn = current.get(0).nodeName;
                if( nn && nn.toLowerCase() === "a" ) {
                    subject = join( current.get(0).href, window.location.toString() );
                    break;
                }
                if( about ) {
                    if( about.indexOf("[") === 0 ) {
                        //TODO: support safe curies..
                        continue;
                    } else {
                        subject =  join( about, window.location.toString() );
                        break;
                    }
                }
                current = current.parent();
            }
            if( !subject ) {
                subject = window.location.toString();
            }
            return subject;
        },

        _create: function() {
            var annotator;
            var o = this.options;
            if( o.displayElement ) {
                annotator = $("<div class='rdfannotator'></div>");
            } else {
                annotator = $("<div class='rdfannotator' style='display:none; position:absolute'></div>");
            }
            var that=this;
            function doCommentBox( e ) {
                if( !e.target || !e.shiftKey ) {
                    return;
                }
                if( e.stopPropagation ) {
                    e.stopPropagation();
                    e.preventDefault();
                }
                var current = $(e.target);
                that.current = current;
                var about;
                var subject = that._findSubject( current );
                annotator.empty();
                var listdiv = $("<div class='rdfannotatorlist'></div>");
                that.listdiv = listdiv;
                that._matcher( listdiv )
                    .match( "?comment", "http://rdfs.org/sioc/ns#topic", processResource( subject ) )
                    .match( "?comment", "http://rdfs.org/sioc/ns#content", "?content" )
                    .match( "?comment", "http://rdfs.org/sioc/ns#has_creator", "?user" )
                    .page("<div class='rdfannotatorcomment'><div><a href='?user'>@user</a> wrote...</div><div><p>?content</p></div></div>", 4);

                var user = $.rdfwidgets.getDefaultUser();
                if( !user ) { user = SW_PREFIX + "Anonymous"; }
                annotator.append(listdiv);
                var lid = randomID();
                annotator.append( "<div class='rdfannotatortitle'>Add a comment about <span id='"+lid+"' title='"+subject+"'>"+subject+"</span></div>" );
                $('#'+lid).label({subject: db.sym(subject), selectable:false})
                var formdiv = $("<div class='rdfannotatorform'></div>");
                var opts = $.extend({},that.options,{afterSubmit:function(s) { if(s && !o.displayElement) { annotator.hide("fast"); } },
                                                     items:[{type:"textarea",
                                                             predicate:"http://rdfs.org/sioc/ns#content",
                                                             menuOptions:getMenuNoOptions()},
                                                            {type:"hidden",
                                                             predicate:"http://rdfs.org/sioc/ns#has_creator",
                                                             object:db.sym( user )
                                                            },
                                                            {type:"hidden",
                                                             predicate:"http://rdfs.org/sioc/ns#topic",
                                                             object:subject
                                                            },
                                                            {type:"hidden",
                                                             predicate:"http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                                                             object:"http://rdfs.org/sioc/types#Comment"
                                                            }],
                                                     acl:( o.acl ? o.acl : {
                                                         type:"permanent"
                                                     } )});
                formdiv.createinstance(opts);
                annotator.append(formdiv);
                if( !o.displayElement ) {
                    var closeButton = $('<a style="position:absolute" href="#">X</a>');
                    annotator.css({left:e.pageX+"px", top:e.pageY+"px"});
                    closeButton.click( function() {
                        annotator.hide("fast");
                    });
                    closeButton.css( { "right": "2px", "top": "2px" } );
                    annotator.append( closeButton );
                    annotator.show("fast");
                }
            }

            this.element.bind( "click", doCommentBox );
            if( o.displayElement ) {
                $(o.displayElement).append( annotator );
                doCommentBox({target:this.element, shiftKey:true});
            } else {
                $(document.body).append(annotator);
            }
        },

        disable: function() {
        },

        enable: function() {
        },

        refresh: function() {
            if( this.current ) {
                this._matcher( this.listdiv )
                    .match( "?comment", "http://rdfs.org/sioc/ns#topic", processResource( this._findSubject( this.current ) ) )
                    .match( "?comment", "http://rdfs.org/sioc/ns#content", "?content" )
                    .match( "?comment", "http://rdfs.org/sioc/ns#has_creator", "?user" )
                    .page("<div class='rdfannotatorcomment'><div><a href='?user'>@user</a> wrote...</div><div><p>?content</p></div></div>", 4);
            }
        }
    });

    /**
     * @name jQuery.prototype.sourceview
     * @description Serialize the entire local store as N3 and display it in a text box.
     * @function
     */
    $.rdfwidget("ui.sourceview", {
        options: {
          format:"n3"
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
        },

        enable: function() {
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            element.empty();
            var pre = $('<pre class="rdfsourceview"></pre>');
            var s = $rdf.Serializer( data );

            var text;
            if( o.format === "xml" ) {
                text = s.statementsToXML( db.statements );
            } else {
                text = s.toN3( db );
            }
            
            pre.text( text );
            element.append(pre);
        }
    });

    /**
     * @name jQuery.prototype.image
     * @description Search for a valid image depicting a given resource and display it.  Currently, bases this search off of the foaf:depiction property, dbpedia img property, and their subproperties.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {String | Object} [options.subject] The resource to display an image of OR if predicate or object is defined, the subject of a statement to be matched.
     * @param {String | Object} [options.predicate] The predicate of a statement to be matched.
     * @param {String | Object} [options.object] The object of a statement to be matched.
     * @param {String | Number} [options.width] The width, in pixels, that the image should be displayed with (height will be scaled).
     * @param {String | Number} [options.height] The height, in pixels, that the image should be displayed with (width will be scaled).
     */
    $.rdfwidget("ui.image", {
        options: {
            namespaces:namespaces,
            selectable:true
        },
        _create: function() {
            this.originalEditTerm = this.options.editTerm;
            this.rdfvalue = null;
            this.refresh();
        },
        refresh: function() {
            var element = this.element;
            var o = this.options;
            var that = this;
            o.editTerm = this.originalEditTerm;
            
            if( !( o.subject && !o.predicate && !o.object ) ) {
                processEditTerm( o );
            } else {
                o.editTerm = "subject";
            }

            var subject, predicate, object;
            if( o.subject ) { subject = processResource(o.subject, o); }
            if( o.predicate ) { predicate = processResource(o.predicate, o); }
            if( o.object ) { object = processObject( o.object, o ); }
            
            var temp;
            var output = null;
            var type;
            if( o.subject && !o.object && !o.predicate ) {
                output = subject;
            } else if( o.editTerm==="object" || !o.editTerm ) {
                if( object ) { output = object; }
                else {
                    temp = $.rdfwidgets.any( (subject ? subject : undefined), (predicate ? predicate : undefined), undefined, undefined, o);
                    if( temp ) { output = temp; }
                }
            } else if( o.editTerm==="predicate" ) {
                if( predicate ) { output = predicate; }
                else {
                    temp = $.rdfwidgets.any( (subject ? subject : undefined), undefined,(object ? object : undefined), undefined, o );
                    if( temp ) { output = temp; }
                }
            } else if( o.editTerm==="subject" ) {
                o.editTerm="subject";
                if( subject ) { output = subject; }
                else {
                    temp = $.rdfwidgets.any( undefined, (predicate ? predicate : undefined),(object ? object : undefined), undefined, o );
                    if( temp ) { output = temp; }
                }
            }
            var stringLabel;
            if( !output ) {
                return;
            } else if( output.termType === "symbol" ) {
                stringLabel = doLabel(output, o);
                this.rdfvalue = output;
            } else {
                stringLabel = output.value;
                this.rdfvalue = output;
            }

            if( o.selectable ) {
                element.click( function(e) { 
                        e.stopPropagation();
                        setSelected( element, that.rdfvalue );
                    } );
            }
            var imageuri = null;
            if( o.mappings ) {
                imageuri = o.mappings[output.value];
            }
            if( !imageuri && "symbol" === output.termType && o.editTerm !== "predicate" ) {
                var im = isImage( output, o );
                if( im ) {
                    imageuri = im.value;
                }
            }
            if( !imageuri && "symbol" === output.termType ) {
                var im = doImage( output, o );
                if( im ) {
                    imageuri = im.value;
                }
            }
            if( imageuri ) {
                output = "<span class='rdfimage'><img class='rdfimage' style='display:none' "+"src='"+imageuri+"' title='"+doLabel(output,o)+" "+output.value+"'></img></span>";
                this.element.empty().html(output);
                $(element).find( "img" ).one( "load", function() { 
                    var im = $(this).show(0);
                    var width = im.width();    // Current image width
                    var height = im.height();  // Current image height

                    var maxWidth = o.width?o.width:width; // Max width for the image
                    var maxHeight = o.height?o.height:height;    // Max height for the image
                    var ratio = 0;  // Used for aspect ratio
                    
                    // Check if the current width is larger than the max
                    if(width > maxWidth){
                        ratio = maxWidth / width;   // get ratio for scaling image
                        height = height * ratio;    // Reset height to match scaled image
                        width = width * ratio;    // Reset width to match scaled image
                    }
                    
                    // Check if current height is larger than max
                    if(height > maxHeight){
                        ratio = maxHeight / height; // get ratio for scaling image
                        width = width * ratio;    // Reset width to match scaled image
                        height = height * ratio;
                    }
                    im.css("width", width); // Set new width
                    im.css("height", height);  // Scale height based on ratio

                });
            }
        },
        _setOption: function( key ) {
            $.Widget.prototype._setOption.apply( this, arguments );
            if ( key === "subject" || key === "predicate" || key === "object" || key === "editTerm" ) {
                this.refresh();
            }
        },
        getRDFValue: function() {
            return this.rdfvalue;
        },
        getTriple: function() {
            var o = this.options;
            if( this.rdfvalue && o.editTerm ) {
                var st = new $rdf.Statement( o.subject ? processResource( o.subject,o ) : undefined,
                                             o.predicate ? processResource( o.predicate,o ) : undefined,
                                             o.object ? processObject( o.object,o ) : undefined );
                st[o.editTerm] = this.rdfvalue;
                return $.rdfwidgets.anyStatementMatching( st.subject, st.predicate, st.object, undefined, o );
            }
            return null;
        }
    });

    $.ui.image.getter = "getRDFValue getTriple";

    /**
     * @name jQuery.prototype.label
     * @description Display a simple text label for a given resource or implied resource.
     * @param {String | Object} [options.subject] The resource to display a label for OR if predicate or object is defined, the subject of a statement to be matched.
     * @param {String | Object} [options.predicate] The predicate of a statement to be matched.
     * @param {String | Object} [options.object] The object of a statement to be matched.
     * @param {Boolean} [options.showlinks=true] If false, labels for Symbols will not contain hyperlinks.
     * @param {Boolean} [options.selectable=true] If false, the item will not be selectable and will not fire the rdfselect event.
     * @function
     * @param {Object} [options] @see CommonOptions
     */
    $.rdfwidget("ui.label", {
        options: {
            namespaces:namespaces,
            selectable:false,
            showlinks:true
        },
        _create: function() {
            this.originalEditTerm = this.options.editTerm;
            this.rdfvalue = null;
            this.refresh();
        },
        refresh: function() {
            var element = this.element;
            var o = this.options;
            var that = this;
            o.editTerm = this.originalEditTerm;
            

            if( !( o.subject && !o.predicate && !o.object ) ) {
                processEditTerm( o );
            } else {
                o.editTerm = "subject";
            }


            var subject, predicate, object;
            if( o.subject ) { subject = that._resource(o.subject); }
            if( o.predicate ) { predicate = that._resource(o.predicate); }
            if( o.object ) { object = processObject( o.object, o ); }
            var temp;
            var output = "<span class='rdflabel rdflabelempty'>None</span>";
            var type;

            if( o.subject && !o.object && !o.predicate ) {
                output = subject;
            } else if( o.editTerm==="object" ) {
                if( object ) {
                    output = object;
                }
                else {
                    temp = $.rdfwidgets.any( (subject ? subject : undefined), (predicate ? predicate : undefined), undefined, undefined, o);
                    if( temp ) { o.object = temp; output = temp; }
                }
                
            } else if( o.editTerm==="predicate" ) {
                if( predicate ) {
                    output = predicate;
                }
                else {
                    temp = $.rdfwidgets.any( (subject ? subject : undefined), undefined,(object ? object : undefined), undefined, o );
                    if( temp ) { o.predicate = temp; output = temp; }
                }
            } else if( o.editTerm==="subject" ) {
                if( subject ) {
                    output = subject;
                }
                else {
                    temp = $.rdfwidgets.any( undefined, (predicate ? predicate : undefined),(object ? object : undefined), undefined, o );
                    if( temp ) { o.subject = temp; output = temp; }
                }
            }

            var stringLabel;
            if( typeof( output ) === "string" ) {
                stringLabel = output;
            } else if( o.label ) {
                stringLabel = o.label;
                this.rdfvalue = output;
            } else if( output.termType === "symbol" ) {
                stringLabel = doLabel(output, o);
                this.rdfvalue = output;
            } else {
                stringLabel = output.value;
                this.rdfvalue = output;
            }

            if( o.selectable ) {
                element.click( function(e) {
                        e.stopPropagation();
                        setSelected( element, that.rdfvalue );
                    } );
            }

            if( true === o.showlinks && output.termType === "symbol" ) {
                output = "<span class='rdflabel'><a href='"+output.value+"'>"+(o.linkText ? o.linkText : stringLabel)+"</a></span>";
            } else if( typeof(output) !== "string" ){
                output = "<span class='rdflabel' title='"+(output.value ? output.value : stringLabel)+"'>"+stringLabel+"</span>";
            }
            this.element.html(output);
        },
        _setOption: function( key ) {
            $.Widget.prototype._setOption.apply( this, arguments );
            if ( key === "subject" || key === "predicate" || key === "object" || key === "editTerm" ) {
                this.refresh();
            }
        },
        getRDFValue: function() {
            return this.rdfvalue;
        },
        getTriple: function() {
            var o = this.options;
            if( o.subject && o.predicate && o.object ) {
                var trip = $.rdfwidgets.anyStatementMatching( this._resource(o.subject),this._resource(o.predicate),processObject(o.object,o), undefined, o );
                return trip ? trip : null;
            }
            return null;
        }
    });

    $.ui.label.getter = "getRDFValue getTriple";

    $(document).ready( function() {
        loadDataSources();
        $(document).click( function(e) {
            setUnselected( selectedElement );
        });
        $(document).keyup( function( e ) {
            if( (!e.originalTarget || (e.originalTarget && e.originalTarget.nodeName.toLowerCase() !== "input" && e.originalTarget.nodeName.toLowerCase() !== "textarea") )
                && e.which === 46 ) {
                if( selectedElement ) {
                    selectedElement.trigger( "rdfdelete" );
                }
            }
        });
        processHTMLWidgets();
    });

    function processHTMLWidgets ( element ) {
        element = element ? $(element).get(0) : document.body;
        $("[sw\\:widget]").closest( "*", element ).each( function( i, elt ) {
            var widget = null;
            var opts = {};
            for( var i = 0; i < this.attributes.length; i++ ) {
                var a = this.attributes[i];
                if( a.nodeName.indexOf("sw:") === 0 ) {
                    if( a.nodeValue === "false" ) {
                        opts[a.nodeName.substr(3)] = false;
                    } else if( a.nodeValue.length>2  &&
                               ( ( a.nodeValue[0] === "[" &&
                                   a.nodeValue[a.nodeValue.length-1] === "]") ||
                                 ( a.nodeValue[0] === "{" &&
                                   a.nodeValue[a.nodeValue.length-1] === "}") ) ) {
                        opts[a.nodeName.substr(3)] = $.parseJSON( a.nodeValue );
                    } else {
                        opts[a.nodeName.substr(3)] = a.nodeValue;
                    }
                }
                if( a.nodeName === "sw:widget" ) {
                    widget = a.nodeValue;
                }
            }
            $(this)[widget](opts);
        });
    }

    return {

        /**
         * @description Set the default SPARUL endpoint to be used for user-generated content.
         * @memberOf jQuery.rdfwidgets
         * @param {String | $rdf.Symbol} uri The URI of the new default endpoint.
         */
        setDefaultEndpoint: function( uri ) {
            if( typeof(uri) === "object" && "symbol" === object.termType ) {
                defaultEndpoint = uri.value;
            } else if( uri && uri.toString ) {
                defaultEndpoint = uri.toString();
            }
        },

        /**
         * @description Get the default SPARUL endpoint to be used for user-generated content.
         * @memberOf jQuery.rdfwidgets
         * @returns {String} The current endpoint URI.
         */
        getDefaultEndpoint: function() {
            return defaultEndpoint;
        },

        /**
         * @description Get the current default user used when generating ACL for new data.
         * @memberOf jQuery.rdfwidgets
         * @returns {String} The current default user URI.
         */
        getDefaultUser: function() {
            return defaultUser;
        },

        /**
         * @description Get the Tabulator RDF Store backing the library.
         * @memberOf jQuery.rdfwidgets
         * @returns {$rdf.IndexedFormula} The data store.
         */
        getStore: function() {
            return db;
        },

        setStore: function( newdb ) {
            db = newdb;
        },

        /**
         * @description Load all of the RDF data from a given URI into the local store.
         * @memberOf jQuery.rdfwidgets
         * @param {String} uri The URI of the new default endpoint.
         * @param {Object} [o]
         * @param {String} [o.endpoint] The endpoint to be used when data from this source is edited.
         * @param {String} [o.name] The shorthand name of this data source.
         * @param {Function} [o.callback] A function to be called after the data source has loaded, of the form f(uri, success).
         */
        load: function( uri, o ) {
            for( var i = 0; i < loadFilters.length; i++ ) {
                var t = loadFilters[i](uri);
                if( t && t !== uri ) {
                    uri = t;
                    break;
                }
            }
            if( !requestedURIs[ docpart( uri ) ] ) {
                var u = docpart( uri );
                if( !o ) { o = {}; }
                if( o.name ) {
                    sourceNames[u] = o.name;
                }
                if( o.endpoint ) {
                    endpoints[u] = sourceNames[o.endpoint] ? sourceNames[o.endpoint] : processResource( o.endpoint );
                }
                loadDataSource( u, o.format, o.callback );
            }
        },
        /**
         * @description Remove all data associated with a given URI from the local store.
         * @memberOf jQuery.rdfwidgets
         * @param {String} uri The data source for which to remove all data.
         */
        remove: function( uri ) {
            var really = docpart( uri );
            delete loadedSources[really];
            db.removeMany( undefined, undefined, undefined, db.sym( really ) );
            deleteData( null );
            requestedURIs[ really ] = false;
        },

        match: function( o ) {
            if( !o ) { o = {}; }
            return $.rdfwidgets.statementsMatching(processResource( o.subject, o ), processResource( o.predicate, o ), processObject( o.object, o ), undefined, false, o );
        },

        loadSameAs: function( uri, o ) {
            var uris = db.uris( processResource( uri, {} ) );
            o = o ? o : {};
            for( var i = 0; i < uris.length; i++ ) {
                if( !requestedURIs[ docpart( uris[i] ) ] ) {
                    $.rdfwidgets.load( uris[i] , o );
                }
            }
        },

        /**
         * @description Get a Matcher instance that draws into a given element.
         * @memberOf jQuery.rdfwidgets
         * @param {String | Object} element The element to be drawn into.  Can be any valid jQuery constructor argument--a selector, a DOM element, or even another jQuery object.
         * @param {Object} [options] @see CommonOptions
         * @param {Boolean} [options.filterduplicates] Ignore identical matches that originate from different data sources.
         * @param {Boolean} [norefresh] If true, this matcher will not refresh itself automatically when new data is loaded.
         * @returns {Matcher} The new matcher instance
         */
        matcher: function( element, options, norefresh ) {
            return Matcher( element, options ? options : {}, norefresh );
        },

        /**
         * @description Process the DOM starting from a given element in search of HTML-encoded widgets.
         * @memberOf jQuery.rdfwidgets
         * @param {String | Object} [element="document.body"] The element to search in. Any valid jQuery constructor argument--only the first result of a selector will be searched.
         */
        processHTML: function( element ) {
            processHTMLWidgets( element );
        },

        /**
         * @description Ascend up the DOM looking for an RDFa "about" tag.
         * @memberOf jQuery.rdfwidgets
         * @param {String | Object} node The element to search in. Any valid jQuery constructor argument--only the first result of a selector will be searched. Currently does not support safe CURIEs.
         * @returns {String} the URI of the first "about" tag found, or the "href" of the first anchor tag found.
         */
        getNodeSubject: function( node ) {
            return getNodeSubject( node );
        },

        /**
         * @description Add a function that has a chance to override a source loading.  If the function returns false, the provided URI will not be loaded.
         * @memberOf jQuery.rdfwidgets
         * @param {Function} f The filter function.  If the function returns false, the data source will not be loaded.  The function should have the signature f(uri).
         */
        addLoadFilter: function( f ) {
            loadFilters.push( f );
        },

        /**
         * @description Get the set of data sources pending.
         * @memberOf jQuery.rdfwidgets
         * @returns {Array} The list of URIs which are still loading.
         */
        sourcesPending: function() {
            return $.extend( [], pendingSources );
        },

        /**
         * @description See if a specific URI is in the process of loading.
         * @memberOf jQuery.rdfwidgets
         * @param {String} uri The URI to check.
         * @returns {Boolean} true if the data source is pending, false otherwise.
         */
        sourcePending: function( uri ) {
            var u = docpart( uri );
            for( var i = 0; i < pendingSources.length; i++ ) {
                if( pendingSources[i] === u ) {
                    return true;
                }
            }
            return false;
        },

        /**
         * @description Remove a given load filter.
         * @memberOf jQuery.rdfwidgets
         * @param {Function} f a reference to the filter to be removed.
         */
        removeLoadFilter: function( f ) {
            for( var i = 0; i < loadFilters.length; i++ ) {
                if( loadFilters[i] === f ) {
                    loadFilters.splice(i,1);
                    return;
                }
            }
        },

        /**
         * @description Get all statements matching a given triple pattern.
         * @memberOf jQuery.rdfwidgets
         * @param {String | Object} [s] Subject. A URI, prefixed name, or Symbol.
         * @param {String | Object} [p] Predicate. A URI, prefixed name, or Symbol.
         * @param {String | Object} [o] Object. A URI, prefixed name, Symbol, or Literal.
         * @param {String | Object} [w] Data Source. A URI, prefixed name, or Symbol.
         * @param {Boolean} [justOne] If true, only return the first result (still in an Array).
         * @param {Object} [opts] @see CommonOptions
         * @returns {Array} An Array of $rdf.Statement objects that match the provided pattern.
         */
        statementsMatching: function( s, p, o, w, justOne, opts ) {
            var f = null;
            if( opts ) { 
                f = processSourceFilter( opts.sources, opts );
            }
            var sts = db.statementsMatching( s, p, o, w, justOne );
            if( f ) {
                sts = $.map(sts, function(st) {
                    if( f[st.why.uri] ) {
                        return st;
                    }
                    return null;
                });
            }
            if( opts && opts.filter ) {
                sts = $.grep( sts, opts.filter );
            }
            return sts;
        },

        /**
         * @description Get a single statement matching a given triple pattern.
         * @memberOf jQuery.rdfwidgets
         * @param {String | Object} [s] Subject. A URI, prefixed name, or Symbol.
         * @param {String | Object} [p] Predicate. A URI, prefixed name, or Symbol.
         * @param {String | Object} [o] Object. A URI, prefixed name, Symbol, or Literal.
         * @param {String | Object} [w] Data Source. A URI, prefixed name, or Symbol.
         * @param {Object} [opts] @see CommonOptions
         * @returns {Array} An Array of $rdf.Statement objects that match the provided pattern.
         */
        anyStatementMatching: function( s, p, o, w, opts ) {
            var x = $.rdfwidgets.statementsMatching(s,p,o,w,true,opts);
            if (!x || x == []) return undefined;
            return x[0];            
        },

        /**
         * @description Given two of s, p, o, return any match for the missing term.
         * @memberOf jQuery.rdfwidgets
         * @param {String | Object} [s] Subject. A URI, prefixed name, or Symbol.
         * @param {String | Object} [p] Predicate. A URI, prefixed name, or Symbol.
         * @param {String | Object} [o] Object. A URI, prefixed name, Symbol, or Literal.
         * @param {String | Object} [w] Data Source. A URI, prefixed name, or Symbol.
         * @param {Object} [opts] @see CommonOptions
         * @returns {Object} A Symbol, Literal, or BlankNode representing a match for the missing term, or undefined if none was found.
         */
        any: function( s, p, o, w, opts ) {
            var st = $.rdfwidgets.anyStatementMatching(s,p,o,w,opts);
            if (typeof st == 'undefined') return undefined;
            if (typeof s == 'undefined') return st.subject;
            if (typeof p == 'undefined') return st.predicate;
            if (typeof o == 'undefined') return st.object;
            return undefined;
        },

        /**
         * @description Given two of s, p, o, return all matches for the missing term.
         * @memberOf jQuery.rdfwidgets
         * @param {String | Object} [s] Subject. A URI, prefixed name, or Symbol.
         * @param {String | Object} [p] Predicate. A URI, prefixed name, or Symbol.
         * @param {String | Object} [o] Object. A URI, prefixed name, Symbol, or Literal.
         * @param {String | Object} [w] Data Source. A URI, prefixed name, or Symbol.
         * @param {Object} [opts] @see CommonOptions
         * @returns {Array} An Array of Symbols, Literals, and/or BlankNodes representing matches for the missing term.
         */
        each: function( s, p, o, w, opts ) {
            var results = []
            var st, sts = $.rdfwidgets.statementsMatching(s,p,o,w,false,opts)
            var i, n=sts.length
            if (typeof s == 'undefined') {
	            for (i=0; i<n; i++) {st=sts[i]; results.push(st.subject);}
            } else if (typeof p == 'undefined') {
	            for (i=0; i<n; i++) {st=sts[i]; results.push(st.predicate);}
            } else if (typeof o == 'undefined') {
	            for (i=0; i<n; i++) {st=sts[i]; results.push(st.object);}
            } else if (typeof w == 'undefined') {
	            for (i=0; i<n; i++) {st=sts[i]; results.push(st.why);}
            }
            return results;
        },

        /**
         * @description Given any of s, p, o, and w, see if any valid match exists.
         * @memberOf jQuery.rdfwidgets
         * @param {String | Object} [s] Subject. A URI, prefixed name, or Symbol.
         * @param {String | Object} [p] Predicate. A URI, prefixed name, or Symbol.
         * @param {String | Object} [o] Object. A URI, prefixed name, Symbol, or Literal.
         * @param {String | Object} [w] Data Source. A URI, prefixed name, or Symbol.
         * @param {Object} [opts] @see CommonOptions
         * @returns {Boolean} True if a match exists, false otherwise.
         */
        whether: function( s, p, o, w, opts ) {
            return $.rdfwidgets.statementsMatching(s,p,o,w,false,opts).length;            
        }

    };

    /**
     * @name CommonOptions
     * @namespace Options commonly used by the widget library widgets.
     * @description Note that this isn't really a class, but is just meant as a reference to the options used by many widgets.
     */

    /**
     * @name sources
     * @type Array
     * @memberOf CommonOptions
     * @field
     * @description An array of URIs and shorthand names that define the set of sources that should be used when obtaining data for this widget.
     */

    /**
     * @name endpoint
     * @type String
     * @memberOf CommonOptions
     * @field
     * @description A URI indicating the SPARUL endpoint to which data created by this widget or edited at this data source should be written
     */


    /**
     * @name filter
     * @type Function
     * @memberOf CommonOptions
     * @field
     * @description A function with the signature f($rdf.Triple) that, given a triple, will return true if that triple should be used in the output of the widget.
     */

    /**
     * @name acl
     * @type Object | String
     * @memberOf CommonOptions
     * @field
     * @description An anonymous object representing the ACL to be used with any new resource description created by this widget. Can use any of the pre-defined ACL strings, or an absolute URI pointing to a policy to be used.
     */

    /**
     * @name selectable
     * @type Boolean
     * @memberOf CommonOptions
     * @field
     * @description If true, this item will be selectable.  When selected, the widget will fire an rdfselect event.
     */

    /**
     * @name editable
     * @type Boolean
     * @memberOf CommonOptions
     * @field
     * @description If true, this widget will be editable.
     */

    /**
     * @name beforeSubmit
     * @type Funtion
     * @memberOf CommonOptions
     * @field
     * @description A function with the signature f(data, xhr) to be called just prior to the submission of an update to a SPARUL server.
     */

    /**
     * @name afterSubmit
     * @type Function
     * @memberOf CommonOptions
     * @field
     * @description A function with the signature f(success, data, xhr) to be called following a SPARUL request's completion, regardless of success.
     */

    /**
     * @name namespaces
     * @type Object
     * @memberOf CommonOptions
     * @field
     * @description An anonymous object containing namespace->URI mappings, e.g. {"foaf":"http://xmlns.com/foaf/0.1/"}. 
     */

}(jQuery);