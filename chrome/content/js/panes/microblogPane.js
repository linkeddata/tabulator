
tabulator.panes.register (tabulator.panes.microblogPane ={

    icon: Icon.src.icon_mb,
    
    name: 'microblogPane',
    
    label: function(subject) {
        SIOC = RDFNamespace("http://rdfs.org/sioc/ns#");
        if (!tabulator.kb.whether(
            subject, tabulator.ns.rdf( 'type'), SIOC('User'))) return null;

        return "Microblog";
    },

    render: function(s, doc) {
        
        /**
         *  makeURIFromSym
         *
         *  strips the angle brackets from the symbol (for providing links).
         *  @@get rid of this; .uri does the trick
         **/
        makeURIFromSym = function(uri){
            return uri.uri;
//            return String(uri).replace(/\<|\>/g,"");
        }
        
        
        /**
         *  getName
         *
         *  Get the name and handle of a user, or just provide the handle if 
         *  that is not available.
         **/
        var getName = function (user){
            var realName = kb.any(user, foaf("name"));
            if (realName == undefined){
                return user.uri;
            }else{ 
                return realName;
            }
        }
        
        var getAvatarURI=function(user){
            var avatar = kb.any(user, SIOC('avatar'))
            if (!avatar){
                avatar = kb.any(user, foaf('img'))
            }
            return avatar.uri
        }
            
            

        var foaf = tabulator.ns.foaf;
        var SIOC = RDFNamespace("http://rdfs.org/sioc/ns#");
        var RSS = RDFNamespace("http://purl.org/rss/1.0/");
        var kb = tabulator.kb;
        var loc =  kb.any(s, foaf("based_near"));
        
        
        //CARD------------
        var card     = doc.createElement("div");
        card.className = "ppane";

        //POSTS------------
        var posts = kb.each(undefined,SIOC("has_creator"));
        postHTML = "<h2>Updates<\/h2>";
        for(post in posts){
            //filter by current person
            if (String(kb.any(posts[post],SIOC('has_creator'))) == String(s)){
                postText = kb.any(posts[post], RSS('title'));
                postHTML += "<div class='post'>"+postText+"<\/div>";
            }
        }
        var cardPosts  = doc.createElement("div");
        cardPosts.innerHTML = postHTML;
        
        //AVATAR------------
        var av =  makeURIFromSym(kb.any(s, SIOC('avatar')));
        makeURIFromSym(kb.any(s, SIOC('avatar')));
        
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
        
        //FOLLOWING ------------
        var followContainer  = doc.createElement('div');
        var followTitle = doc.createElement('h2');
        followTitle.innerHTML = "Follows";
        followContainer.appendChild(followTitle);
        //@@ figure out why the duplicates occure here.
        var subscribesTo = paneUtils.unique(kb.each(s, foaf('knows')));

        //get the information for each person the user subscribes to.
        //these do not necessarily come back in order.
        for (user in subscribesTo){
            usersURI = doc.createTextNode(makeURIFromSym(subscribesTo[user]));
            usersDisplayContainer = doc.createElement('p')
            
            var get = {}
            get[user] = {
                info: function (){
                    var This = this;
                    var id = this.id 
                    if(sf.requested[subscribesTo[id].uri] == 'done'){
                        var access = kb.any(subscribesTo[id], kb.sym("http://www.w3.org/2007/ont/link#request"));
                        var redirected = kb.any(access,kb.sym("http://www.w3.org/2007/ont/http#redirectedTo"));
                        
                        //if the look up is not a redirect or if the redirect is
                        //finished, get the user's information.
                        if (!redirected || sf.requested[redirected.uri]=="done"){
                            var usersName =  getName(subscribesTo[id]);
                            var usersAvatarURI =  getAvatarURI(subscribesTo[id]);
                            usersAvatar = doc.createElement("img");
                            usersAvatar.setAttribute('src',usersAvatarURI);
                            usersAvatar.setAttribute('alt',usersName);
                            usersAvatar.className = "smallImg";
                            usersDisplayContainer.appendChild(usersAvatar);
                            usersDisplayContainer.innerHTML +=  usersName +"<br\/>";
                        
                        //Otherwise wait some more. 
                        }else{
                            
                            //this closure holds the state so that 'this' does
                            //not become the XUL Window. 
                            setTimeout(function(){This.info()},10);
                        }
                        
                    //if the lookup is not finish, wait some more.
                    }else{
                        //this closure holds the state so that 'this' does
                        //not become the XUL Window. 
                        setTimeout(function(){This.info()},10);
                    }
                }
            }
            //make a copy of the user id and store it in the get object.
            //we need this to be by value, and objects like to reference things.
            get[user].id = new Number(user); 
            
            //begin the process of getting the user information.
            get[user].info();
            sf.lookUpThing(subscribesTo[user]);
           
            followContainer.appendChild(usersDisplayContainer);
        }
        
//        //FOLLOWERS------------
//        var subscribers = paneUtils.unique(kb.each(s, foaf('knows_of')));
        
        //BUILD------------
        card.appendChild(cardName);
        card.appendChild(cardAvatar);
        card.appendChild(cardHome);
        card.appendChild(followContainer);
        card.appendChild(cardPosts);
        
        
        return card;
    }
}, false);

// ends

