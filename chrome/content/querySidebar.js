/** The sidebar for the Tabulator extension**/
//doc is the document that the sidebar is embedded in.
function querySidebar(doc) {
  var mySidebar = this;  //for great justice
  var tabulator =
      Components.classes["@dig.csail.mit.edu/tabulator;1"]
        .getService(Components.interfaces.nsISupports).wrappedJSObject;
  var toolbar = doc.getElementById("queryToolbar");
  var button = doc.getElementById("querySubmitButton");

  var myQueries = [];

  function listSelectionListener(e){
    return;
  }

  function listClickListener(e) {
    return;
  }

  function changeQueryName(item,oldId) {
    return function(e) {
      if(e.keyCode==0 || e.keyCode) {
        if(e.keyCode==KeyboardEvent.DOM_VK_ENTER || e.keyCode==KeyboardEvent.DOM_VK_RETURN) {
          var label = doc.createElement('label');
          label.className="label";
          if(e.target.value=="")
            label.setAttribute('value',e.target.getAttribute('value'));
          else
            label.setAttribute('value',e.target.value); 
          label.value=oldId; //id.
          item.replaceChild(label,e.target);
        }
      } else {
          var label = doc.createElement('label');
          label.className="label";
          if(e.target.value=="")
            label.setAttribute('value',e.target.getAttribute('value'));
          else
            label.setAttribute('value',e.target.value); 
          label.value=oldId; //id.
          item.replaceChild(label,e.target);
      }
    }
  }

  function listKeyListener(e) {
    var sidebar = e.target;
    if(sidebar.getItemAtIndex && (e.keyCode==KeyboardEvent.DOM_VK_ENTER || e.keyCode==KeyboardEvent.DOM_VK_RETURN)) {
       var item=sidebar.getItemAtIndex(sidebar.selectedIndex);
       var child = item.firstChild;
       var newChild;
       newChild = doc.createElement('textbox');
       newChild.setAttribute('value',child.getAttribute('value')); ///name
       item.replaceChild(/*new*/newChild,/*old*/child);
       newChild.focus();
       newChild.addEventListener('blur',changeQueryName(item,child.value),true);
       newChild.addEventListener('keypress',changeQueryName(item,child.value),true);
    }
    return;
  }
  this.addQuery = function(q) {
    var ql = doc.getElementById("queryList");
    var li = doc.createElement('listitem');
    var label = doc.createElement('label');
    label.setAttribute('value',q.name);
    li.appendChild(label);
    label.value=q.id;
    ql.appendChild(li);
    myQueries[q.id]=q;
    //TODO:Finish... updating mechanism!! (see tabviews.js)
  }

  this.removeQuery = function(q) {
    //TODO:Write all of this!
  }

  function createToolbarClickListener(view) {
    return function(e) {
      //TODO: Write code that will send off for new query draw.
      var ql = doc.getElementById("queryList");
      if(ql.selectedItem==null)
        alert("You must select a query to display before opening a view.");
      else {
        var q = myQueries[ql.selectedItem.firstChild.value]; //Find by ID.
        tabulator.drawInView(q,view,alert);
      }
    }
  }

  function createDisabledListener(view,button) {
    return function () {
      if(view.canDrawQuery(myQueries[ql.selectedItem.firstChild.value])) {
        button.disabled=false;
      }
      else {
        button.disabled=true;
      }
    }
  }
  function createToolbar() {
    var ql = doc.getElementById("queryList");
    var i;
    for(i=0;i<tabulator.views.length;i++) {
      var newButton = doc.createElement('toolbarbutton');
      newButton.setAttribute('image',tabulator.views[i].getIcon());
      newButton.label=tabulator.views[i].name;
      newButton.addEventListener('command',createToolbarClickListener(tabulator.views[i]),true);
      ql.addEventListener('select',createDisabledListener(tabulator.views[i],newButton),true);
      toolbar.appendChild(newButton);
    }
  }


  //and when it's all over
  function closeListener(e) {
    //cleanup
    tabulator.qs.removeListener(mySidebar);
  }
  createToolbar();
  var ql = doc.getElementById("queryList");
  ql.addEventListener('select',listSelectionListener,true);
  ql.addEventListener('click',listClickListener,true);
  ql.addEventListener('keypress',listKeyListener,true);
  window.addEventListener('unload',closeListener,true);
  tabulator.qs.addListener(this);
}