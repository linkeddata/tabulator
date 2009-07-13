// ==UserScript==
// @name           XmlHttpRequest - Bypass Security
// @namespace      http://blog.monstuff.com/archives/cat_greasemonkey.html
// @description    Helps bypassing the "same domain" policy, during development.
// @include        file://*
// ==/UserScript==
//
// More information at http://blog.monstuff.com/archives/000262.html


/*
// note: unsafeXMLHttpRequest objects don't support all the methods normally 
//       available thru XMLHttpRequest (setRequestHeaders, data, ...).

// Here's a sample cross-browser code, where unsafeXMLHttpRequest can be 
// used to replace XMLHttpRequest transparently:

var req;
if(window.XMLHttpRequest) {
    req = new XMLHttpRequest();
} else if(window.ActiveXObject) {
    req = new ActiveXObject(...);
}
if(req) {
    req.onload = function() { ... use req.status, req.statusText, req.responseText and req.responseXML ... }
    req.onerror = function() { ... use req.status and req.statusText ... }
    req.open("GET", url, true);
    req.send(true);
}
*/

var unsafeWindow = unsafeWindow ? unsafeWindow : window;

document.title += " - with unsafe XMLHttpRequest";

function unsafeXMLHttpRequest() {
    var self = this;

    self.open = function(_method, _url) {
        self.method = _method;
        self.url = _url;
    }

    self.send = function() {
        var oldOnload = self.onload;
        var oldOnerror = self.onerror;
        var oldOnreadystatechange = self.onreadystatechange;

        self.onload = function(responseDetails) {
            self.copyValues(responseDetails);
            if (oldOnload) { oldOnload(); }
        }

        self.onerror = function(responseDetails) {
            self.copyValues(responseDetails);
            if (oldOnerror) { oldOnerror(); }
        }

        self.onreadystatechange = function(responseDetails) {
            self.copyValues(responseDetails);
            if (oldOnreadystatechange) { oldOnreadystatechange(); }
        }

        self.copyValues = function(responseDetails) {

            if (responseDetails.readyState) {
                self.readyState = responseDetails.readyState;
            }

            if (responseDetails.status) {
                self.status = responseDetails.status;
            }

            if (responseDetails.statusText) {
                self.statusText = responseDetails.statusText;
            }

            if (responseDetails.responseText) {
                self.responseText = responseDetails.responseText;
            }

            if (self.responseText) {
		try {
                    self.responseXML = new DOMParser().parseFromString(self.responseText, 'text/xml');
                } catch (ex) {}
            }

        }

        GM_xmlhttpRequest(self);
    }
}

unsafeWindow.XMLHttpRequest = unsafeXMLHttpRequest;

