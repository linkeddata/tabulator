/**The SampleView is a very simplistic sample single-query view that
 * really doesn't have any big functionality other than printing
 * out a query pattern, but it demonstrates the necessary functions
 * in a view class.
 * @constructor
 * @author jambo
 */
function SampleView(container) {
    /**queryStates holds the individual state of each query that the view can
     * currently display.  Values in queryStates should be indexed by query
     * id number.  The possible values for a query are 0=inactive, 1=active,
     * and 2=greyed out.
     */
    this.queryStates=[];
    
    /**container holds the div element that this view is meant to be displayed
     * in.  It is worth noting, for clarity's sake, that this should be used as
     * this.container, not just container, since it is a field in the view 
     * class.
     */
    this.container=container;
    
    /**this.name holds the name of this view.  Just give it a relevant name.*/
    this.name="Sample";
	
    /**this.drawQuery takes in a query and then draws that query into the
     * container in the proper way for this view.  It should also set
     * the query's value in queryStates[q.id] to reflect that it is now
     * displayed.
     */
    this.drawQuery = function(q) {
        var i;
        this.container.appendChild(document.createTextNode('Drawing query with id '+q.id+' and name '+q.name));
        this.container.appendChild(document.createElement('br'));
        this.container.appendChild(document.createTextNode('QUERY PATTERN========='));
        this.container.appendChild(document.createElement('br'));
        for(i=0; i<q.pat.statements.length; i++) {
            this.container.appendChild(document.createTextNode('-       '+q.pat.statements[i]));
            this.container.appendChild(document.createElement('br'));
        }
        this.container.appendChild(document.createTextNode('END QUERY PATTERN====='));
        this.container.appendChild(document.createElement('br'));
        this.queryStates[q.id]=1;
    }

    /**this.undrawQuery removes a query from the display.  It is up to the
     * view's author whether or not the data for the data should be discarded,
     * but I suggest that it be discarded, since this gives checking and
     * unchecking the effect of "refreshing" the query.
     */
    this.undrawQuery = function(q) {
        this.container.appendChild(document.createTextNode('Undrawing query with id '+q.id));
        this.container.appendChild(document.createElement('br'));
        this.queryStates[q.id]=0;
    }

    /**this.addQuery adds a query to the view's queryStates.  There may also
     * be some kind of preprocessing involved with this, but I would not
     * recommend it since too much preprocessing without the user requesting
     * a view to be displayed will cause unnecessary lag.
     */
    this.addQuery = function(q) {
        this.container.appendChild(document.createTextNode('Adding query with id '+q.id));
        this.container.appendChild(document.createElement('br'));
        this.queryStates[q.id]=0;
    }

    /**this.removeQuery should undraw the query (Or at least, I can't think of
     * a valid scenario where that wouldn't be the case), and then delete the
     * query's value from the queryStates array.
     */
    this.removeQuery = function(q) {
        this.container.appendChild(document.createTextNode('Removing query with id '+q.id));
        this.container.appendChild(document.createElement('br'));
        this.undrawQuery(q);
        delete this.queryStates[q.id];
    }

    return this;
}