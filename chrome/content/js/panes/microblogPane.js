/*
 Microblog pane
 Charles McKenzie <charles2@mit.edu>

 @@ Authentication?
 @@ support update/read of other microblogs (maybe incorporate PB?)
 @@ Flood control: prevent microblogpane from loading too many posts/followers
 @@ follower's stream on users mb view
*/


    
tabulator.panes.register (tabulator.panes.microblogPane ={

    icon: Icon.src.icon_mb,
    
    name: 'microblogPane',
    
    label: function(subject) {
        var SIOCt = RDFNamespace('http://rdfs.org/sioc/types#');
        if (tabulator.kb.whether(
            subject, tabulator.ns.rdf( 'type'), SIOCt('Microblog')) ||
            tabulator.kb.whether(
            subject, tabulator.ns.rdf( 'type'), SIOCt('MicroblogPost'))) return "Microblog";
            return null;
    
        
    },

    render: function(s, doc) {
        var SIOC = RDFNamespace("http://rdfs.org/sioc/ns#");
        var SIOCt = RDFNamespace('http://rdfs.org/sioc/types#');
        var RSS = RDFNamespace("http://purl.org/rss/1.0/");
        var RDF = tabulator.ns.rdf;
        var kb = tabulator.kb;
        var terms = RDFNamespace("http://purl.org/dc/terms/")
        var charCount = 140;
        var sparqlUpdater= new sparql(kb);
               
        var gen_random_uri = function(base){
            //generate random uri
            var uri_nonce = base + "#n"+Math.floor(Math.random()*10e+7);
            return kb.sym(uri_nonce)
        }
        
        var statusUpdate = function(statusMsg, callback, replyTo, meta){
            var myUserURI = getMyUser();
            myUser = kb.sym(myUserURI.split("#")[0])
            var newPost = gen_random_uri(myUser.uri)
            micro = kb.any(kb.sym(myUserURI), SIOC('creator_of'))
//            var micro = kb.any(,RDF('type'), SIOCt('Microblog'))
//            alert(micro)
            
            //generate new post 
           var batch =[
                new RDFStatement(newPost, RDF('type'),SIOCt('MicroblogPost'),myUser),
                new RDFStatement(newPost, SIOC('has_creator'),kb.sym(myUserURI),myUser),
                new RDFStatement(newPost, SIOC('content'),statusMsg,myUser),
                new RDFStatement(newPost, terms('date'), String(new Date()),myUser),
                new RDFStatement(micro,SIOC('container_of'),newPost)
            ];
            
            // message replies
            alert(replyTo)
            if (replyTo){
                batch.push(new RDFStatement(newPost, SIOC('reply_of'), replyTo,myUser))
            }
            
            // @replies, #hashtags, !groupReplies
//            if (meta){
//                var topics = []
//                for(topic in meta){
//                    topics.push(metas[topic])
//                }
//                batch.push(topics)
//            }
            sparqlUpdater.insert_statement(batch, callback)
        }
        
        var notify = function(messageString){
            alert(messageString) //maybe something less obnoxious than an alert.
        };
        
        var getMyURI = function(){
            var myMicroblog = tabulator.preferences.get('myMB').split(",")
            return myMicroblog[0];
        };
        var getMyUser = function(){
            var myUser = tabulator.preferences.get('myMB').split(",")
            return myUser[1];
        };
        
        var Ifollow = kb.whether(kb.sym(getMyUser()),SIOC('follows'),
            kb.any(s,SIOC('has_creator')))
        var setMyURI = function(uri){
            var myself = new Array()
                myself[0]=doc.location
                myself[1]=kb.any(s,SIOC('has_creator')).uri
            tabulator.preferences.set('myMB',myself)
            notify("Preference set.")
        };
        var thisIsMe = (doc.location == getMyURI());
        var Ifollow;
        // EVENT LISTENERS
        //---submit a post---
        var mbSubmitPost = function(){
            var postDate = new Date()
            notify(
                "Update: "+xupdateStatus.value+
                "\nto "+getMyURI()+
                "\nIn Reply to "+xinReplyToContainer.value+
                "\nat "+postDate
            );
            if(getMyURI()){
                myUser = kb.sym(getMyURI());
                var mbconfirmSubmit = function(a,b,c){
                    notify("submitted.\n"+a+"\n"+b+"\n"+c)
                    xupdateStatus.value=""
                }
                statusUpdate(xupdateStatus.value,mbconfirmSubmit,xinReplyToContainer.value)

            }else{
                notify("Please set your microblog first.");
            }
        };
        var mbSetMyMB =  function(){
            setMyURI()
            xfollowButton.style.display = 'none';
            xsetMyMB.style.display = 'none';
        }
        
        var mbLetterCount = function(){
            xupdateStatusCounter.innerHTML = charCount - xupdateStatus.value.length
            if (xupdateStatus.value.length == 0){
                xinReplyToContainer.value = "";
                xupdateSubmit.value = "Send";
            }
        }
        
        //---(un)follow a user--- 
        var mbFollowUser = function (){
            var myUser = kb.sym(getMyUser());
            var mbconfirmFollow = function(uri,stat,msg){
                Ifollow= !Ifollow
                followButtonLabel = (Ifollow)? "Unfollow ":"Follow ";
                xfollowButton.value = followButtonLabel+ username;
                notify("Follow list updated.")
            }
            var followMe = new RDFStatement(myUser,SIOC('follows'),creator,myUser)
            if (!Ifollow){
                sparqlUpdater.insert_statement(followMe, mbconfirmFollow)
            }else {
                sparqlUpdater.delete_statement(followMe, mbconfirmFollow)
            }
        };
        
        // HEADER INFORMATION
        var headerContainer = doc.createElement('div');
            headerContainer.className ="header-container";
        
        //---create status update box---
        var xupdateContainer = doc.createElement('form');
            xupdateContainer.className="update-container";
            xupdateContainer.innerHTML ="<h3>What are you up to?</h3>";

        var xinReplyToContainer = doc.createElement('input')
            xinReplyToContainer.type="hidden";
        
        var xupdateStatus = doc.createElement('textarea');
        
        var xupdateStatusCounter = doc.createElement('span');
            xupdateStatusCounter.appendChild(doc.createTextNode(charCount))
            xupdateStatus.cols= 30;
            
        var xupdateSubmit = doc.createElement('input');
            xupdateSubmit.type = "submit";
            xupdateSubmit.value = "Send";
        
        if (!thisIsMe){
            var xsetMyMB = doc.createElement('input');
                xsetMyMB.type = 'button';
                xsetMyMB.value = 'This is my Microblog';
                xsetMyMB.addEventListener('click', mbSetMyMB, false)
        }
            
        xupdateContainer.appendChild (xinReplyToContainer);
        xupdateContainer.appendChild(xupdateStatusCounter);
        xupdateContainer.appendChild(xupdateStatus);
        xupdateContainer.appendChild(xupdateSubmit);
        if (!thisIsMe) xupdateContainer.appendChild(xsetMyMB);
        headerContainer.appendChild(xupdateContainer);
        
        xupdateContainer.addEventListener('submit',mbSubmitPost,false)
        xupdateStatus.addEventListener('keyup',mbLetterCount,false)
        
        var subheaderContainer = doc.createElement('div');
        subheaderContainer.className ="subheader-container";
        //USER HEADER
        var creator = kb.any(s, SIOC('has_creator'))
        if (kb.whether(creator,tabulator.ns.rdf( 'type'), SIOC('User'))){
            //---display avatar, if available ---
            var mb_avatar = kb.any(creator,SIOC("avatar"));
            if (mb_avatar !=""){
                var avatar = doc.createElement('img');
                    avatar.src = mb_avatar.uri;
                subheaderContainer.appendChild(avatar);
            }
                        
            //---generate name ---
            var userName = doc.createElement('h1');
            userName.className = "fn";
            var username = kb.any(creator,SIOC("name"))
            userName.appendChild(doc.createTextNode(username+" ("+kb.any(creator,SIOC("id"))+")"));
            subheaderContainer.appendChild(userName);
            
            //---generate follows---
            var getFollowed = function(user){
                var userid = kb.any(user, SIOC('id'))
                var follow = doc.createElement('li')
                follow.className = "follow"
                userid = (userid)? userid : user.uri 
                follow.innerHTML = "<a href=\""+user.uri+"\">"+
                    userid+"</a>"
                return follow
            }
            if (kb.whether(creator, SIOC('follows'))){
                var creatorFollows = kb.each(creator, SIOC('follows'))
                var xfollows = doc.createElement('div')
                var xfollowsHead = doc.createElement('h3')
                var xfollowsList = doc.createElement('ul')
                for (thisPerson in creatorFollows){
                    xfollowsList.appendChild(getFollowed(creatorFollows[thisPerson]))
                }
                xfollowsHead.appendChild(doc.createTextNode('Follows:'))
                xfollows.appendChild(xfollowsHead)
                xfollows.appendChild(xfollowsList)
                
            }
            //---if not me, and not followed, display follow button---
            if (!thisIsMe){
                var xfollowButton = doc.createElement('input');
                    xfollowButton.setAttribute("type", "button");
                    followButtonLabel = (Ifollow)? "Unfollow ":"Follow ";
                    xfollowButton.value = followButtonLabel+ username;
                    xfollowButton.addEventListener('click', mbFollowUser, false);
        
                subheaderContainer.appendChild(xfollowButton);
            }
        }
        //END USER HEADER
        
        
        
        //GROUP HEADER
        else if (kb.whether(s, tabulator.ns.rdf( 'type'), SIOC('Usergroup'))){
            kb.statementMatching(s,SIOC("follows"));
        }
        //END GROUP HEADER
        headerContainer.appendChild(subheaderContainer);
        if (xfollows != undefined){
            headerContainer.appendChild(xfollows);
        }
        
        // POST INFORMATION FOR USER
        var postContainer = doc.createElement('ul');
        var mb_posts = kb.each(s, SIOC("container_of"));
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
   
            //LINK META DATA (MENTIONS, HASHTAGS, GROUPS)
            var mentions =kb.each(post,SIOC("topic"))
            tags = new Object()

            for(mention in mentions){
                sf.lookUpThing(mentions[mention]) //@@make this work properly
                id = kb.any(mentions[mention], SIOC('id'))
                tags["@"+id] = mentions[mention]
            }
            
            var postTags = postText.match(/(\@|\#|\!)\w+/g)
            var postFunction = function(){
                p = postTags.pop()
                return (tags[p])? tags[p].uri :p;
            }
            if (postTags){
                postText = postText.replace(/(\@|\!|\#)(\w+)/g, "$1<a href=\""+postFunction()+"\">$2</a>");
            }
            xpostContent.innerHTML = postText
            
            //in reply to logic
            var inReplyTo = kb.each(post,SIOC("reply_of"));
            var xreplyTo = doc.createElement("span");
            for (reply in inReplyTo){
                var theReply = new RDFNamespace()
                theReply =String(inReplyTo[reply]).replace(/\<|\>/g,"")

                xreplyTo.innerHTML = "<div><a href="+theReply+">[in reply to]</a><div> ";

            }
            //END LINK META DATA
            
            
            
            
            
            //add the reply to button to the interface
            var mbReplyTo = function (){
                var id= kb.any(creator,SIOC("id"));
                xupdateStatus.value = "@"+id+" ";
                xupdateStatus.focus();
                xinReplyToContainer.value = post
                xupdateSubmit.value = "Reply";
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
            if(inReplyTo != ""){xpost.appendChild(xreplyTo)}
            xpost.appendChild(xpostLink)
            
            
            return xpost;
        }
        //---if not me, generate post list ---
        var postlist = new Object()
        var datelist = new Array()
        for (post in mb_posts){
//            postContainer.appendChild (generatePost(username, mb_posts[post],thisIsMe));
            postDate = kb.any(mb_posts[post],terms('date'));
            datelist.push(postDate);
            postlist[postDate] = generatePost(username, mb_posts[post],thisIsMe);
        }
        datelist.sort().reverse()
        for (d in datelist){
            postContainer.appendChild (postlist[datelist[d]])
        }
        //END POST INFORMATION        
        
        //build
        var microblogPane  = doc.createElement("div");
            microblogPane.className = "ppane";
            microblogPane.appendChild(headerContainer);
            microblogPane.appendChild(postContainer);
        
        return microblogPane;
    }

}, true);

// ends

