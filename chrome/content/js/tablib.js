function loadScript(inc) {
    var r='http://dig.csail.mit.edu/2005/ajar/release/tabulator/0.7/'
    var o='<'+'script src="'+r+inc+'"'+' type="text/javascript"><'+'/script>';
    document.write(o);
}

loadScript('util.js');
loadScript('rdf/uri.js');
loadScript('rdf/term.js');
loadScript('rdf/match.js');
loadScript('rdf/rdfparser.js');
loadScript('rdf/identity.js');
loadScript('rdf/query.js');
loadScript('rdf/sources.js');
loadScript('tabulate.js');
loadScript('sorttable.js');
loadScript('mapView.js');
loadScript('tabviews.js');
loadScript('rdf/sparql.js');
loadScript('sparqlView.js');
loadScript('calView.js');
loadScript('tableView.js');
loadScript('calView/calView.js');
