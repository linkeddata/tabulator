/*
 * File: publicationPane.js
 * Purpose: Pane that contains publication data, such as author(s), publishing date, location, etc.
 * Author: cruz@mit.edu
 */


/*
    URI NS to use: http://purl.oclc.org/NET/nknouf/ns/bibtex
    Note: Mime-type is text/plain. Has funky issues when loaded by Firefox.
*/

tabulator.panes.register(tabulator.panes.publishingPane = {
    name: 'Publication'

    //icon: Icon.src.#something#,

    bibtexNS: new RDFNamespace('http://purl.oclc.org/NET/nknouf/ns/bibtex#'),
	
    label: function(subject) {
        if(tabulator.kb.whether(subject,tabulator.ns.owl('subClassOf'),this.bibtexNS('Entry')
           || tabulator.kb.whether(subject,tabulator.ns.owl('class'),this.bibtexNS('Entry')))
            return 'Publication';
        else
            return null;
    },

    render: function(subject, document) {
        kb = tabulator.kb;

        getAuthors = function(subject) {
            authors = kb.statementsMatching(subject,this.bibtexNS('hasAuthor'))
            if(authors == null) return false;
            else return authors;
        }

        
    }
}, true);

