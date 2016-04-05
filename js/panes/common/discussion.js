//  Common code for a discussion are a of messages about something
//

tabulator.panes.utils.messageArea = function(dom, kb, subject, messageStore, options) {
    var kb = tabulator.kb;
    var ns = tabulator.ns;
    var WF = $rdf.Namespace('http://www.w3.org/2005/01/wf/flow#');
    var DC = $rdf.Namespace('http://purl.org/dc/elements/1.1/');
    var DCT = $rdf.Namespace('http://purl.org/dc/terms/');

    options = options || {};

    var newestFirst = !!options.newestFirst;

    var messageBodyStyle = 'width: 90%; font-size:100%; \
	    background-color: white; border: 0.07em solid gray; padding: 0.15em; margin: 0.1em 1em 0.1em 1em'
//	'font-size: 100%; margin: 0.1em 1em 0.1em 1em;  background-color: white; white-space: pre-wrap; padding: 0.1em;'

    var div = dom.createElement("div")
    var messageTable; // Shared by initial build and addMessageFromBindings

    var me_uri = tabulator.preferences.get('me');
    var me = me_uri? kb.sym(me_uri) : null;

    var updater = tabulator.updater || tabulator.updater || new tabulator.rdf.sparqlUpdate(kb);

    var anchor = function(text, term) {
        var a = dom.createElement('a');
        a.setAttribute('href', term.uri);
        a.addEventListener('click', tabulator.panes.utils.openHrefInOutlineMode, true);
        a.textContent = text;
        a.setAttribute('style', 'color: #3B5998; text-decoration: none; '); // font-weight: bold;
        return a;
    };

    var mention = function mention(message, style){
        var pre = dom.createElement("pre");
        pre.setAttribute('style', style ? style :'color: grey');
        div.appendChild(pre);
        pre.appendChild(dom.createTextNode(message));
        return pre
    }

    var console = {
        log: function(message) {mention(message, 'color: #111;')},
        warn: function(message) {mention(message, 'color: #880;')},
        error: function(message) {mention(message, 'color: #800;')}
    };


    //       Form for a new message
    //
    var newMessageForm = function() {
        var form = dom.createElement('tr');
        var lhs = dom.createElement('td');
        var middle = dom.createElement('td');
        var rhs = dom.createElement('td');
        form.appendChild(lhs);
        form.appendChild(middle);
        form.appendChild(rhs);
        form.AJAR_date = "9999-01-01T00:00:00Z"; // ISO format for field sort

        var sendMessage = function() {
            // titlefield.setAttribute('class','pendingedit');
            // titlefield.disabled = true;
            field.setAttribute('class','pendingedit');
            field.disabled = true;
            sts = [];

            var now = new Date();
            var timestamp = ''+ now.getTime();
            var dateStamp = $rdf.term(now);
            // http://www.w3schools.com/jsref/jsref_obj_date.asp
            var message = kb.sym(messageStore.uri + '#' + 'Msg'+timestamp);
            sts.push(new $rdf.Statement(subject, ns.wf('message'), message, messageStore));
            // sts.push(new $rdf.Statement(message, ns.dc('title'), kb.literal(titlefield.value), messageStore))
            sts.push(new $rdf.Statement(message, ns.sioc('content'), kb.literal(field.value), messageStore))
            sts.push(new $rdf.Statement(message, DCT('created'), dateStamp, messageStore));
            if (me) sts.push(new $rdf.Statement(message, ns.foaf('maker'), me, messageStore));

            var sendComplete = function(uri, success, body) {
                if (!success) {
                    form.appendChild(tabulator.panes.utils.errorMessageBlock(
                            dom, "Error writing message: "+ body));
                } else {
                    var bindings = { '?msg': message,
                                    '?content': kb.literal(field.value),
                                    '?date':  dateStamp,
                                    '?creator': me};
                    addMessage2(bindings);

                    field.value = ''; // clear from out for reuse
                    field.setAttribute('class','');
                    field.disabled = false;
                }
            }
            updater.update([], sts, sendComplete);
        }
        // form.addEventListener('submit', sendMessage, false)
        // form.setAttribute('onsubmit', "function xx(){return false;}");
        form.appendChild(dom.createElement('br'));

        var field = dom.createElement('textarea');
        middle.appendChild(field);
        field.rows = 3;
        // field.cols = 40;
        field.setAttribute('style', messageBodyStyle)

        submit = dom.createElement('button');
        //submit.disabled = true; // until the filled has been modified
        submit.textContent = "send"; //@@ I18n
        submit.setAttribute('style', 'float: right;');
        submit.addEventListener('click', sendMessage, false);
        rhs.appendChild(submit);

        return form;
    };

    var nick = function(person) {
        var s = tabulator.kb.any(person, tabulator.ns.foaf('nick'));
        if (s) return ''+s.value
        return ''+tabulator.Util.label(person);
    }

/////////////////////////////////////////////////////////////////////////

    var syncMessages = function(about, messageTable) {
        var displayed = {};
        for (var ele = messageTable.firstChild; ele ;ele = ele.nextSibling) {
            if (ele.AJAR_subject) {
                displayed[ele.AJAR_subject.uri] = true;
            };
        }
        var messages = kb.each(about, ns.wf('message'));
        var stored = {};
        messages.map(function(m){
            stored[m.uri] = true;
            if (!displayed[m.uri]) {
                addMessage(m);
            };
        });

        for (var ele = messageTable.firstChild; ele;) {
            var ele2 = ele.nextSibling;
            if (ele.AJAR_subject && !stored[ele.AJAR_subject.uri]) {
                messageTable.removeChild(ele);
            }
            ele = ele2;
        }


    }
/*
    var addMessageFromBindings = function(bindings) {
        return addMessage(bindings['?msg']);
    }
*/
    var deleteMessage = function(message) {
        deletions = kb.statementsMatching(message).concat(
                kb.statementsMatching(undefined, undefined, message));
        updater.update(deletions, [], function(uri, ok, body){
            if (!ok) {
                console.log("Cant delete messages:" + body);
            } else {
                syncMessages(subject, messageTable);
            };
        });
    };

    var addMessage = function(message) {
        var maker = kb.any(message, ns.foaf('maker'))
        var date = kb.any(message,  DCT('created'))
        var content = kb.any(message, ns.sioc('content'))
        var bindings = {
          msg: message,
          maker:  kb.any(message, ns.foaf('maker')),
          date: kb.any(message,  DCT('created')),
          content: kb.any(message, ns.sioc('content'))
        }
        addMessage2(bindings)
    }

    var addMessage2 = function(bindings) {

        var creator = bindings.maker
        var message = bindings.msg
        var date = bindings.date
        var content = bindings.content

        var dateString = date.value;
        var tr = dom.createElement('tr');
        tr.AJAR_date = dateString;
        tr.AJAR_subject = message;

        var done = false;
        for (var ele = messageTable.firstChild;;ele = ele.nextSibling) {
            if (!ele)  { // empty
                break;
            };
            if (((dateString > ele.AJAR_date) && newestFirst) ||
                        ((dateString < ele.AJAR_date) && !newestFirst)) {
                messageTable.insertBefore(tr, ele);
                done = true;
                break;
            }
        }
        if (!done) {
            messageTable.appendChild(tr);
        }

        var  td1 = dom.createElement('td');
        tr.appendChild(td1);

        var nickAnchor = td1.appendChild(anchor(nick(creator), creator));
        tabulator.fetcher.nowOrWhenFetched($rdf.uri.docpart(creator.uri), undefined, function(ok, body){
            nickAnchor.textContent = nick(creator);
        });
        td1.appendChild(dom.createElement('br'));
        td1.appendChild(anchor(tabulator.panes.utils.shortDate(dateString), message));

        var  td2 = dom.createElement('td');
        tr.appendChild(td2);
        var pre = dom.createElement('p')
        pre.setAttribute('style', messageBodyStyle)
        td2.appendChild(pre);
        pre.textContent = content.value;

        var td3 = dom.createElement('td');
        tr.appendChild(td3);

        var delButton = dom.createElement('button');
        td3.appendChild(delButton);
        delButton.textContent = "-";

        tr.setAttribute('class', 'hoverControl'); // See tabbedtab.css (sigh global CSS)
        delButton.setAttribute('class', 'hoverControlHide');
        delButton.setAttribute('style', 'color: red;');
        delButton.addEventListener('click', function(e) {
            td3.removeChild(delButton);  // Ask -- are you sure?
            var cancelButton = dom.createElement('button');
            cancelButton.textContent = "cancel";
            td3.appendChild(cancelButton).addEventListener('click', function(e) {
                td3.removeChild(sureButton);
                td3.removeChild(cancelButton);
                td3.appendChild(delButton);
            }, false);
            var sureButton = dom.createElement('button');
            sureButton.textContent = "Delete message";
            td3.appendChild(sureButton).addEventListener('click', function(e) {
                td3.removeChild(sureButton);
                td3.removeChild(cancelButton);
                deleteMessage(message);
            }, false);
        }, false);
    };


    // Messages with date, author etc

    messageTable = dom.createElement('table');
    div.appendChild(messageTable);
    messageTable.setAttribute('style', 'width: 100%;'); // fill that div!

    if (tabulator.preferences.get('me')) {
        var tr = newMessageForm();
        if (newestFirst) {
            messageTable.insertBefore(tr, messageTable.firstChild); // If newestFirst
        } else {
            messageTable.appendChild(tr); // not newestFirst
        }
    };

    var query
    // var msg = kb.any(subject, WF('message'));
    // Do this with a live query to pull in messages from web
    if (options.query){
      query = options.query
    } else {
      query = new $rdf.Query('Messages');
      var v = {};
      ['msg', 'date', 'creator', 'content'].map(function(x){
           query.vars.push(v[x]=$rdf.variable(x))});
      query.pat.add(subject, WF('message'), v['msg']);
      query.pat.add(v['msg'], ns.dct('created'), v['date']);
      query.pat.add(v['msg'], ns.foaf('maker'), v['creator']);
      query.pat.add(v['msg'], ns.sioc('content'), v['content']);
    }
    kb.query(query, addMessage2);
/*
    var refreshButton = dom.createElement('button');
    refreshButton.textContent = "refresh";
    refreshButton.addEventListener('click', function(e) {
        tabulator.fetcher.unload(messageStore);
        tabulator.fetcher.nowOrWhenFetched(messageStore.uri, undefined, function(ok, body){
            if (!ok) {
                console.log("Cant refresh messages" + body);
            } else {
                syncMessages(subject, messageTable);
            };
        });
    }, false);
    div.appendChild(refreshButton);
*/
    div.refresh = function() {
        syncMessages(subject, messageTable);
    };


    return div;
};
