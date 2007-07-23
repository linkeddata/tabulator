//ToDo: an RDF mechanism for autocomplete

const CLASS_ID = Components.ID("38359674-38b7-11dc-8314-0800200c9a66");
const CLASS_NAME = "Labeled Object Autocomplete";
const CONTRACT_ID = "@mozilla.org/autocomplete/search;1?name=labeler";

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

//This class is totally copied from nsSearchSuggestions.js
/**
 * SuggestAutoCompleteResult contains the results returned by the Suggest
 * service - it implements nsIAutoCompleteResult and is used by the auto-
 * complete controller to populate the front end.
 * @constructor
 */
function SuggestAutoCompleteResult(searchString,
                                   searchResult,
                                   defaultIndex,
                                   errorDescription,
                                   results,
                                   comments,
                                   formHistoryResult) {
  this._searchString = searchString;
  this._searchResult = searchResult;
  this._defaultIndex = defaultIndex;
  this._errorDescription = errorDescription;
  this._results = results;
  this._comments = comments;
  this._formHistoryResult = formHistoryResult;
}
SuggestAutoCompleteResult.prototype = {
  /**
   * The user's query string
   * @private
   */
  _searchString: "",

  /**
   * The result code of this result object, see |get searchResult| for possible
   * values.
   * @private
   */
  _searchResult: 0,

  /**
   * The default item that should be entered if none is selected
   * @private
   */
  _defaultIndex: 0,

  /**
   * The reason the search failed
   * @private
   */
  _errorDescription: "",

  /**
   * The list of words returned by the Suggest Service
   * @private
   */
  _results: [],

  /**
   * The list of Comments (number of results - or page titles) returned by the
   * Suggest Service.
   * @private
   */
  _comments: [],

  /**
   * A reference to the form history nsIAutocompleteResult that we're wrapping.
   * We use this to forward removeEntryAt calls as needed.
   */
  _formHistoryResult: null,

  /**
   * @return the user's query string
   */
  get searchString() {
    return this._searchString;
  },

  /**
   * @return the result code of this result object, either:
   *         RESULT_IGNORED   (invalid searchString)
   *         RESULT_FAILURE   (failure)
   *         RESULT_NOMATCH   (no matches found)
   *         RESULT_SUCCESS   (matches found)
   */
  get searchResult() {
    return this._searchResult;
  },

  /**
   * @return the default item that should be entered if none is selected
   */
  get defaultIndex() {
    return this._defaultIndex;
  },

  /**
   * @return the reason the search failed
   */
  get errorDescription() {
    return this._errorDescription;
  },

  /**
   * @return the number of results
   */
  get matchCount() {
    return this._results.length;
  },

  /**
   * Retrieves a result
   * @param  index    the index of the result requested
   * @return          the result at the specified index
   */
  getValueAt: function(index) {
    return this._results[index];
  },

  /**
   * Retrieves a comment (metadata instance)
   * @param  index    the index of the comment requested
   * @return          the comment at the specified index
   */
  getCommentAt: function(index) {
    return this._comments[index];
  },

  /**
   * Retrieves a style hint specific to a particular index.
   * @param  index    the index of the style hint requested
   * @return          the style hint at the specified index
   */
  getStyleAt: function(index) {
    if (!this._comments[index])
      return null;  // not a category label, so no special styling

    if (index == 0)
      return "suggestfirst";  // category label on first line of results

    return "suggesthint";   // category label on any other line of results
  },

  /**
   * Removes a result from the resultset
   * @param  index    the index of the result to remove
   */
  removeValueAt: function(index, removeFromDatabase) {
    // Forward the removeValueAt call to the underlying result if we have one
    // Note: this assumes that the form history results were added to the top
    // of our arrays.
    if (removeFromDatabase && this._formHistoryResult &&
        index < this._formHistoryResult.matchCount) {
      // Delete the history result from the DB
      this._formHistoryResult.removeValueAt(index, true);
    }
    this._results.splice(index, 1);
    this._comments.splice(index, 1);
  },

  /**
   * Part of nsISupports implementation.
   * @param   iid     requested interface identifier
   * @return  this object (XPConnect handles the magic of telling the caller that
   *                       we're the type it requested)
   */
  QueryInterface: function(iid) {
    if (!iid.equals(Ci.nsIAutoCompleteResult) &&
        !iid.equals(Ci.nsISupports))
      throw Cr.NS_ERROR_NO_INTERFACE;
    return this;
  }
};

function LabelerAutocomplete(){
}

LabelerAutocomplete.prototype={

/**
 * Initiates the search result gathering process. Part of
 * nsIAutoCompleteSearch implementation.
 *
 * @param searchString    the user's query string
 * @param searchParam     unused, "an extra parameter"; even though
 *                        this parameter and the next are unused, pass
 *                        them through in case the form history
 *                        service wants them
 * @param previousResult  unused, a client-cached store of the previous
 *                        generated resultset for faster searching.
 * @param listener        object implementing nsIAutoCompleteObserver which
 *                        we notify when results are ready. (Kenny: that is,
 *                        the listener passed by the autocomplete controller.)
 */  
startSearch: function(searchString, searchParam, previousResult, listener) {
    var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"]
                              .getService(Components.interfaces.nsISupports).wrappedJSObject;
    var lb=tabulator.lb;
    var searchReturns=lb.search(searchString);
    var results=searchReturns[0];
    //ToDo: PropertyToFunction, map-like functions??
    //ex aArray.property, lb.label[] -> lb.label()
    //in fact, can be achieved using RDF
    //ex: 2.define a function for each FunctionalProperty
    var comments=[];
    for (var i=0;i<searchReturns[1].length;i++){
        var type=searchReturns[1][i];
        if (!type) {
            comments[i]="";
            continue;
        } 
        comments[i]=lb.getLabel(searchReturns[1][i]);
    }
    var result = new SuggestAutoCompleteResult(
        searchString,
        Ci.nsIAutoCompleteResult.RESULT_SUCCESS,
        0,
        "",
        results,
        comments,
        null);
    listener.onSearchResult(this,result); 
},

stopSearch: function() {
    /*not implemented because no AJAX mechanism in here*/
},

QueryInterface: function(iid) {
  if (!iid.equals(Ci.nsIAutoCompleteSearch) &&
      !iid.equals(Ci.nsISupports))
    throw Cr.NS_ERROR_NO_INTERFACE;
  return this;
}

};



// nsIFactory
const kFactory = {
  createInstance: function (outer, iid) {
    if (outer != null)
      throw Cr.NS_ERROR_NO_AGGREGATION;
    return (new LabelerAutocomplete()).QueryInterface(iid);
  }
};

// nsIModule
const gModule = {
  registerSelf: function (componentManager, fileSpec, location, type) {
    componentManager.QueryInterface(Ci.nsIComponentRegistrar);
    componentManager.registerFactoryLocation(CLASS_ID,
                                             CLASS_NAME,
                                             CONTRACT_ID,
                                             fileSpec, location, type);
  },

  unregisterSelf: function(componentManager, fileSpec, location) {
    componentManager.QueryInterface(Ci.nsIComponentRegistrar);
    componentManager.unregisterFactoryLocation(CLASS_ID, fileSpec);
  },

  getClassObject: function (componentManager, cid, iid) {
    if (!cid.equals(CLASS_ID))
      throw Cr.NS_ERROR_NO_INTERFACE;
    if (!iid.equals(Ci.nsIFactory))
      throw Cr.NS_ERROR_NOT_IMPLEMENTED;
    return kFactory;
  },

  canUnload: function (componentManager) {
    return true;
  }
};

function NSGetModule(componentManager, fileSpec) {
  return gModule;
}
