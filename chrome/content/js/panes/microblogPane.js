
tabulator.panes.register (tabulator.panes.microblogPane ={

    icon: Icon.src.icon_mb,
    
    name: 'microblogPane',
    
    label: function(subject) {
        if (!tabulator.kb.whether(
            subject, tabulator.ns.rdf( 'type'), tabulator.ns.foaf('Person'))) return null;

        return "Microblog";
    },

    render: function(s, doc) {
        makeURIFromSym = function(uri){
            return String(uri).replace(/\<|\>/g,"");
        }
        

        var foaf = tabulator.ns.foaf;
        SIOC = RDFNamespace("http://rdfs.org/sioc/ns#");
        RSS = RDFNamespace("http://purl.org/rss/1.0/");
        var kb = tabulator.kb;
        var loc =  kb.any(s, foaf("based_near"));
        
        
        //CARD------------
        var card     = doc.createElement("div");
        card.className = "ppane";

        //POSTS------------
        var posts = kb.each(undefined,SIOC("has_creator"));
        postHTML = "<h2>Updates<\/h2>"
        for(post in posts){
            //filter by current person
            if (String(kb.any(posts[post],SIOC('has_creator'))) == String(s)){
                postText = kb.any(posts[post], RSS('title'));
                postHTML += "<div class='post'>"+postText+"<\/div>"
            }
        }
        var cardPosts  = doc.createElement("div");
        cardPosts.innerHTML = postHTML;
        
        //AVATAR------------
        var av =  makeURIFromSym(kb.any(s, SIOC('avatar')));
        makeURIFromSym(kb.any(s, SIOC('avatar')))
        
        var cardAvatar = doc.createElement("img");
        cardAvatar.setAttribute("src", av);
        cardAvatar.setAttribute("alt", fn+"'s avatar");
        cardAvatar.className = "avatar";
        
        //NAME------------
        var fn =  kb.any(s, foaf("name"));
        var fullName = doc.createTextNode(fn);
        var cardName = doc.createElement("h1");
        cardName.appendChild(fullName);
        
        //HOMEPAGE------------
        var hp =  makeURIFromSym(kb.any(s, foaf("homepage")));
        
        var homePage = doc.createTextNode(hp);
        var cardHome = doc.createElement("a");
        cardAvatar.className = "homepage"
        cardHome.setAttribute('href',hp);
        cardHome.appendChild(homePage);
        
        //FOLLOWS ------------


//        This does not work yet.


//        var subscribes = kb.each(s, foaf('knows'))
//        for (subsc in subscribes){
//            if (subsc <1){
//                alert(String(kb.statementsMatching(subscribes[subsc])).replace(/,/g,"\n\n"))
//            }
//            
//        }
        
        
        //BUILD------------
        card.appendChild(cardName);
        card.appendChild(cardAvatar);
        card.appendChild(cardHome);
        card.appendChild(cardPosts);
        
        
        return card;
    }
}, false);

// ends

