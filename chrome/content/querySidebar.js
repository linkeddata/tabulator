/** The sidebar for the Tabulator extension**/
//doc is the document that the sidebar is embedded in.
function querySidebar(doc) {
  var mySidebar = this;  //for great justice
  var tabulator =
      Components.classes["@dig.csail.mit.edu/tabulator;1"]
        .getService(Components.interfaces.nsISupports).wrappedJSObject;

  var myQueries = [];
  var button = doc.getElementById("querySubmitButton");

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
    var ql = document.getElementById("queryList");
    var li = doc.createElement('listitem');
    var label = doc.createElement('label');
    label.setAttribute('value',q.name);
    li.appendChild(label);
    label.value=q.id;
    ql.appendChild(li);
  }

  this.removeQuery = function(q) {
    //TODO:Write all of this!
  }

  //and when it's all over
  function closeListener(e) {
    //cleanup
    tabulator.qs.removeListener(mySidebar);
  }

  var ql = document.getElementById("queryList");
  ql.addEventListener('select',listSelectionListener,true);
  ql.addEventListener('click',listClickListener,true);
  ql.addEventListener('keypress',listKeyListener,true);

  window.addEventListener('unload',closeListener,true);
  tabulator.qs.addListener(this);
}