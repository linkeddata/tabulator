
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
        var kb = tabulator.kb;
        var loc =  kb.any(s, foaf("based_near"));
        var terms = RDFNamespace("http://purl.org/dc/terms/")
        
        var getMyURI = function(){
            //@@ REMOVE for testing
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
        xupdateStatus.cols= 30;
        var xupdateSubmit = doc.createElement('input');
        xupdateSubmit.type = "submit";
        xupdateSubmit.value = "Send";
        
        xupdateContainer.appendChild(xupdateStatus);
        xupdateContainer.appendChild(xupdateSubmit);
        headerContainer.appendChild(xupdateContainer);
        xupdateContainer.addEventListener('submit',mbSubmitPost,false)
        
        // CONSTRUCT A HEADER FOR A USER
        if (kb.whether(s,tabulator.ns.rdf( 'type'), SIOC('User'))){
            //---display avatar, if available ---
            var mb_avatar = kb.any(s,SIOC("avatar"));
            if (mb_avatar !=""){
                var avatar = doc.createElement('img');
                avatar.src = mb_avatar.uri;
                headerContainer.appendChild(avatar);
            }
                        
            //---generate name ---
            var userName = doc.createElement('h1');
            userName.className = "fn";
            var username = kb.any(s,SIOC("name"))
            userName.appendChild(doc.createTextNode(username));
            headerContainer.appendChild(userName);
            
            //---if not me, and not followed, display follow button---
            if (!thisIsMe && !Ifollow){
                var followButton = doc.createElement('input');
                followButton.setAttribute("type", "button");
                followButton.value = "Follow "+ username;
                //@@ Attach listeners for follow here.
                followButton.addEventListener('click', mbFollowUser, false);
                headerContainer.appendChild(followButton);
            }

            
            

        }
        
        // CONSTRUCT A HEADER FOR A GROUP
        else if (kb.whether(s, tabulator.ns.rdf( 'type'), SIOC('Usergroup'))){
            kb.statementMatching(s,SIOC("follows"));
        }
        
        
        
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
            var postText = String(kb.any(post,terms("title")));              
            
            //@@ insert smarts here for groups and replies
            postText = postText.replace(/(\@|\!)(\w+)/, "$1<a>$2</a>");
            xpostContent.innerHTML = postText
            //in reply to logic
            var inReplyTo = kb.any(post,SIOC("reply_of"));
            if (inReplyTo != undefined){
                var xreplyTo = doc.createElement("span");
                var replyName = kb.any(inReplyTo, SIOC("has_creator"))
                xreplyTo.innerHTML = "<a href="+inReplyTo.uri+
                    ">in reply to</a>";
            }
            
            //reply
            var mbReplyTo = function (){
                var id= kb.any(s,SIOC("id"));
                xupdateStatus.value = "@"+id+" ";
                xupdateStatus.focus();
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
            
            
            return xpost;
        }
        //---if not me, generate post list ---
        for (post in mb_posts){
            postContainer.appendChild (generatePost(username, mb_posts[post],thisIsMe));
        }
                        
        
        
        var microblogPane  = doc.createElement("div");
        microblogPane.className = "ppane";
        microblogPane.appendChild(headerContainer);
        microblogPane.appendChild(postContainer);
        
        return microblogPane;
    }
}, false);

// ends

