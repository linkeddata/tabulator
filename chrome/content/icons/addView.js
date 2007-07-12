function AddView(container) {
    this.queryStates=[];
    this.container=container;

    container.appendChild(document.createTextNode("Tabulator has 5 main views:"+
    " Table (tableView), Map (mapView), Calendar (calView), Timeline"+
    " (timelineView) , and SPARQL (sparqlView)."));
    container.appendChild(document.createElement('br'));
    container.appendChild(document.createTextNode("This form allows you to add"+
    " a view to this container. For documentation on how to" +
    " create views, take a look at "));
    var a = document.createElement('a');
    a.href="http://dig.csail.mit.edu/2005/ajar/ajaw/doc/api/SampleView.html";
    a.appendChild(document.createTextNode("the sample view."));
    container.appendChild(a);
    var ol = document.createElement('ol');
    var li = document.createElement('li');
    li.appendChild(document.createTextNode("Load the files for the view you" +
    " want to add to the tabbed container, if it is not one of the views built"+
    " into Tabulator. To load a file, type the path of the file in the text"+
    " field immediately left of the \"Load Javascript\" button, and then hit" +
    " the \"Load Javascript\" button."));
    ol.appendChild(li);
    li = document.createElement('li');
    li.appendChild(document.createTextNode("Type the classname of the view (eg."+
    " for table view, the classname would be \"tableView\", not \"Table\".)"));
    ol.appendChild(li);
    li = document.createElement('li');
    li.appendChild(document.createTextNode("Check the checkbox"+
    " if the view you are adding to the tabbed container can handle showing" +
    " multiple queries at once."));
    ol.appendChild(li);
    li = document.createElement('li');
    li.appendChild(document.createTextNode("Click the \"Load View\" button."));
    ol.appendChild(li);
    container.appendChild(ol);

    container.appendChild(document.createTextNode("Javascript Path: "));
    var input = document.createElement('input');
    input.setAttribute('type','text');
    input.setAttribute('id','JSpath');
    input.setAttribute('title','Enter path for javascript file here');
    container.appendChild(input);

    container.appendChild(document.createTextNode("  "));
    input = document.createElement('input');
    input.setAttribute('type','button');
    input.setAttribute('value','Load Javascript'); //addJStoHead()
    input.onclick = function() {
        function f(){
	          var textfield = document.getElementById('JSpath');
	          var path = textfield.value;
	          include(path);
        }
        return f();
     }
    input.setAttribute('title','Load the javascript file at the specified path');
    container.appendChild(input);
    container.appendChild(document.createElement('br'));
    container.appendChild(document.createElement('br'));

    container.appendChild(document.createTextNode("View Class Name (function): "));
    input = document.createElement('input');
    input.setAttribute('type','text');
    input.setAttribute('id','ViewName');
    input.setAttribute('title','Name of View to be added (e.g. tableView)');
    container.appendChild(input);
    container.appendChild(document.createTextNode("  "));
    container.appendChild(document.createTextNode('Allow Multiple Queries:'));

    input = document.createElement('input');
    input.setAttribute('type','checkbox');
    input.setAttribute('id','multiQuery');
    input.setAttribute('title','Check if view can display multiple queries');
    container.appendChild(input);

    input = document.createElement('input');
    input.setAttribute('type','button');
    input.setAttribute('value','Load View'); //addViewToTC()
    var thisView = this;
    input.onclick = function() {
        return addViewToTC(thisView);
    }
    container.appendChild(input);

    /**this.name holds the name of this view.  Just give it a relevant name.*/
    this.name="New...";

    /**this.drawQuery takes in a query and then draws that query into the
     * container in the proper way for this view.  It should also set
     * the query's value in queryStates[q.id] to reflect that it is now
     * displayed.
     */
    this.drawQuery = function(q) {
    }

    /**this.undrawQuery removes a query from the display.  It is up to the
     * view's author whether or not the data for the data should be discarded,
     * but I suggest that it be discarded, since this gives checking and
     * unchecking the effect of "refreshing" the query.
     */
    this.undrawQuery = function(q) {
    }

    /**this.addQuery adds a query to the view's queryStates.  There may also
     * be some kind of preprocessing involved with this, but I would not
     * recommend it since too much preprocessing without the user requesting
     * a view to be displayed will cause unnecessary lag.
     */
    this.addQuery = function(q) {
        this.queryStates[q.id]=2;
    }

    /**this.removeQuery should undraw the query (Or at least, I can't think of
     * a valid scenario where that wouldn't be the case), and then delete the
     * query's value from the queryStates array.
     */
    this.removeQuery = function(q) {
        this.undrawQuery(q);
        delete this.queryStates[q.id];
    }

    return this;
}