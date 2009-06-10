
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
        var foaf = tabulator.ns.foaf;
        var SIOC = RDFNamespace("http://rdfs.org/sioc/ns#");
        var RSS = RDFNamespace("http://purl.org/rss/1.0/");
        var RDF = tabulator.ns.rdf;
        var kb = tabulator.kb;
        var loc =  kb.any(s, foaf("based_near"));
        var terms = RDFNamespace("http://purl.org/dc/terms/")
        var charCount = 140;
        
        var getMyURI = function(){
            //@@ REMOVE LATER! for testing
            return "http://dig.csail.mit.edu/2007/wiki/sandbox/foaf#Michael"
        };
        var setMyURI = function(uri){
            
        };
        var thisIsMe = (doc.location == getMyURI());
        var Ifollow;
        // EVENT LISTENERS
        //---submit a post---
        var mbSubmitPost = function(){
            alert("mbSubmitPost not Implemented");
            if(getMyURI()){
                //@@ determine submission destination
                //@@ submit post
                //@@ group post
                //@@ reply post
            }else{
                //@@ does not have a URI. ask user.
            }
                
            
        };
        
        var mbLetterCount = function(){
            xupdateStatusCounter.innerHTML = charCount - xupdateStatus.value.length
        }
        
        //---follow a user--- 
        var mbFollowUser = function (){
            //@@ update follows list;
            alert("mbFollowUser not Implemented");
        };
        
        // HEADER INFORMATION
        var headerContainer = doc.createElement('div');
        headerContainer.className ="header-container";
        
        //---create status update box---
        var xupdateContainer = doc.createElement('form');
        xupdateContainer.className="update-container";
        xupdateContainer.innerHTML ="<h3>What are you up to?</h3>";
        var xupdateStatus = doc.createElement('textarea');
        var xupdateStatusCounter = doc.createElement('span');
        xupdateStatusCounter.appendChild(doc.createTextNode(charCount))
        xupdateStatus.cols= 30;
        var xupdateSubmit = doc.createElement('input');
        xupdateSubmit.type = "submit";
        xupdateSubmit.value = "Send";
        
        xupdateContainer.appendChild(xupdateStatusCounter);
        xupdateContainer.appendChild(xupdateStatus);
        xupdateContainer.appendChild(xupdateSubmit);
        headerContainer.appendChild(xupdateContainer);
        
        xupdateContainer.addEventListener('submit',mbSubmitPost,false)
        xupdateStatus.addEventListener('keyup',mbLetterCount,false)
        
        var subheaderContainer = doc.createElement('div');
        subheaderContainer.className ="subheader-container";
        //USER HEADER
        if (kb.whether(s,tabulator.ns.rdf( 'type'), SIOC('User'))){
            //---display avatar, if available ---
            var mb_avatar = kb.any(s,SIOC("avatar"));
            if (mb_avatar !=""){
                var avatar = doc.createElement('img');
                avatar.src = mb_avatar.uri;
                subheaderContainer.appendChild(avatar);
            }
                        
            //---generate name ---
            var userName = doc.createElement('h1');
            userName.className = "fn";
            var username = kb.any(s,SIOC("name"))
            userName.appendChild(doc.createTextNode(username));
            subheaderContainer.appendChild(userName);
            
            //---if not me, and not followed, display follow button---
            if (!thisIsMe && !Ifollow){
                var followButton = doc.createElement('input');
                followButton.setAttribute("type", "button");
                followButton.value = "Follow "+ username;
                //@@ Attach listeners for follow here.
                followButton.addEventListener('click', mbFollowUser, false);
                subheaderContainer.appendChild(followButton);
            }
        }
        //END USER HEADER
        
        
        
        //GROUP HEADER
        else if (kb.whether(s, tabulator.ns.rdf( 'type'), SIOC('Usergroup'))){
            kb.statementMatching(s,SIOC("follows"));
        }
        //END GROUP HEADER
        headerContainer.appendChild(subheaderContainer);
        
        // POST INFORMATION FOR USER
        var postContainer = doc.createElement('ul');
        var mb_posts = kb.each(s, SIOC("creator_of"));
        //---returns a microblog post---
        var generatePost = function (uname, post,me){
            //container for post
            var xpost = doc.createElement('li');
            xpost.className = "post"
            //username text 
            var xuname = doc.createElement('p');
            var xunameText = doc.createTextNode("-"+uname);
            xuname.appendChild (xunameText);
            //post content
            var xpostContent = doc.createElement('blockquote');
            var postText = String(kb.any(post,SIOC("content"))); 
            //post date
            var xpostLink= doc.createElement("a")
            xpostLink.setAttribute("href", post.uri)
            var postLink = kb.any(post,terms('date'))
            postLink = doc.createTextNode((postLink)?postLink:"post date unknown");
            xpostLink.appendChild(postLink)
            //post URI
            
            
            
            //LINK META DATA (MENTIONS, HASHTAGS, GROUPS)
            var mentions =kb.each(post,SIOC("topic"))
            tags = new Object()
            
            for(mention in mentions){
                id = kb.any(mentions[mention], SIOC('id'))
                tags["@"+id] = mentions[mention]
            }
            
            var postTags = postText.match(/(\@|\#|\!)\w+/g)
            var postFunction = function(){
                p = postTags.pop()
                return (tags[p])? tags[p].uri :p;
            }
            postText = postText.replace(/(\@|\!|\#)(\w+)/g, "$1<a href=\""+postFunction()+"\">$2</a>");
            xpostContent.innerHTML = postText
            
            //in reply to logic
            var inReplyTo = kb.each(post,SIOC("reply_of"));
            var xreplyTo = doc.createElement("span");
            for (reply in inReplyTo){
                if(kb.whether(inReplyTo[reply],RDF('type'),
                    kb.sym("http://rdfs.org/sioc/types#MicroblogPost"))){
                    xreplyTo.innerHTML = "<div><a href="+String(inReplyTo[reply].uri)+
                        ">[in reply to]</a><div> ";
                }
            }
            //END LINK META DATA
            
            
            
            
            
            //add the reply to button to the interface
            var mbReplyTo = function (){
                var id= kb.any(s,SIOC("id"));
                xupdateStatus.value = "@"+id+" ";
                xupdateStatus.focus();
                mbLetterCount()
            }
            if (!me){
                var xreplyButton = doc.createElement('input');
                xreplyButton.type = "button";
                xreplyButton.value = "reply";
                xreplyButton.className = "reply"
                xreplyButton.addEventListener('click', mbReplyTo, false);
                
            }   
            
            
            //build
            xpost.appendChild(xpostContent);
            if (!me){xpost.appendChild(xreplyButton)}
            xpost.appendChild(xuname);
            if(inReplyTo){xpost.appendChild(xreplyTo)}
            xpost.appendChild(xpostLink)
            
            
            return xpost;
        }
        //---if not me, generate post list ---
        for (post in mb_posts){
            postContainer.appendChild (generatePost(username, mb_posts[post],thisIsMe));
        }
        //END POST INFORMATION
        
                        
        
        //build
        var microblogPane  = doc.createElement("div");
        microblogPane.className = "ppane";
        microblogPane.appendChild(headerContainer);
        microblogPane.appendChild(postContainer);
        
        return microblogPane;
    }
}, false);

// ends

