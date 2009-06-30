/*
 Microblog pane
 Charles McKenzie <charles2@mit.edu>
*/

//ISO 8601 DATE

Date.prototype.getISOdate = function (){
    var padZero = function(n){
        return (n<10)? "0"+n: n;
    }
    var ISOdate = this.getUTCFullYear()+"-"+
        padZero (this.getUTCMonth())+"-"+
        padZero (this.getUTCDate())+"T"+
        padZero (this.getUTCHours())+":"+
        padZero (this.getUTCMinutes())+":"+
        padZero (this.getUTCSeconds())+"Z";
    return ISOdate;
}

Date.prototype.parseISOdate= function(dateString){
    var arrDateTime = dateString.split("T");
    var theDate = arrDateTime[0].split("-");
    var theTime = arrDateTime[1].replace("Z","").split(":");
    
    this.setUTCDate(1);
    this.setUTCFullYear(theDate[0]);  
    this.setUTCMonth(theDate[1]);  
    this.setUTCDate(theDate[2]);  
    this.setUTCHours(theTime[0]);  
    this.setUTCMinutes(theTime[1]);  
    this.setUTCSeconds(theTime[2]);
    
    return this;
    
}

sparql.prototype.batch_delete_statement= function(st, callback){
    var query = this._context_where(this._statement_context(st[0]));
    for (var i=0; i < st.length; i++){
        query += "DELETE { " + anonymizeNT(st[i]) + " }\n";
    }
    this._fire(st[0].why.uri, query, callback);
}


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
        var FOAF = RDFNamespace('http://xmlns.com/foaf/0.1/');
        var terms = RDFNamespace("http://purl.org/dc/terms/");
        var RDF = tabulator.ns.rdf;
        var kb = tabulator.kb;
        var charCount = 140;
        var sparqlUpdater= new sparql(kb);
        
        /*
            FOLLOW LIST
            store the uri's of followed users for dereferencing the @replies
        */
        var FollowList = function(){
            this.userlist = {};
            this.uris = {};
        }
        FollowList.prototype.add = function(user,uri){
            if (followlist.userlist[user]){
                if (uri in followlist.uris){
                    //do nothing here, the user has already added the user
                    //at some point this session.
                }else{
                    this.userlist[user].push(uri);
                    this.uris[uri] = "";
                }
            }else{
                followlist.userlist[user] = [uri];
            }
        }
        FollowList.prototype.selectUser= function(user){
            if (this.userlist[user]){
                if (this.userlist[user].length == 1){
                    //user follows only one user with nick
                    return [true, this.userlist[user]];
                }else if (followlist.userlist[user].length > 1){
                    //user follows multiple users with this nick.
                    return [false, this.userlist[user]];
                }
            }else{
                //user does not follow any users with this nick
                return [false, []] ;
            }
        }
        var followlist = new FollowList();
        
        var gen_random_uri = function(base){
            //generate random uri
            var uri_nonce = base + "#n"+Math.floor(Math.random()*10e+7);
            return kb.sym(uri_nonce);
        }
        
        var statusUpdate = function(statusMsg, callback, replyTo, meta){
            var myUserURI = getMyUser();
            myUser = kb.sym(myUserURI.split("#")[0]);
            var newPost = gen_random_uri(myUser.uri);
            var micro = kb.any(kb.sym(myUserURI), SIOC('creator_of'));
            
            //generate new post 
           var batch =[
                new RDFStatement(newPost, RDF('type'),SIOCt('MicroblogPost'),myUser),
                new RDFStatement(newPost, SIOC('has_creator'),kb.sym(myUserURI),myUser),
                new RDFStatement(newPost, SIOC('content'),statusMsg,myUser),
                new RDFStatement(newPost, terms('created'), String(new Date().getISOdate()),myUser),
                new RDFStatement(micro,SIOC('container_of'),newPost,myUser)
            ];
            
            // message replies
            if (replyTo){
                batch.push(new RDFStatement(newPost, SIOC('reply_of'), kb.sym(replyTo),myUser));
            }
            
            // @replies, #hashtags, !groupReplies
            for (r in meta.recipients){
                batch.push(new RDFStatement(newPost, SIOC('topic'),kb.sym(meta.recipients[r]),myUser));
                batch.push(new RDFStatement(kb.any(), SIOC("container_of"), newPost, myUser))
            }
                
            sparqlUpdater.insert_statement(batch, function(a,b,c) {callback(a,b,c, batch)});
        }
        
        var notify = function(messageString){
            alert(messageString); //maybe something less obnoxious than an alert.
        };
        
        var getMyURI = function(){
            var me =  tabulator.preferences.get('me')
            var myMicroblog = kb.any(kb.sym(me), FOAF('holdsAccount'))
            return myMicroblog.uri;
        };
        var getMyUser = getMyURI; // fix this later         
        var Ifollow = kb.whether(kb.sym(getMyUser()),SIOC('follows'),
            kb.any(s,SIOC('has_creator')))
        var setMyURI = function(uri){
            var myself = new Array()
                myself[0]=doc.location
                myself[1]=kb.any(s,SIOC('has_creator')).uri
            tabulator.preferences.set('myMB',myself)
            while (postContainer.hasChildNodes()){
        	    postContainer.removeChild(postContainer.firstChild);
        	}
            thisIsMe = !thisIsMe;
            generatePostList()
            notify("Preference set.")
        };
        var thisIsMe;
        var resourceType = kb.any(kb.sym(doc.location), RDF('type'))
        if (resourceType.uri == SIOCt('Microblog').uri || resourceType.uri == SIOCt('MicroblogPost').uri){ 
            thisIsMe = (kb.any(kb.sym(doc.location), SIOC('has_creator')).uri == getMyURI())
        } else if(resourceType.uri == SIOC('User').uri){
            thisIsMe = (doc.location == getMyURI())
        } else{
            thisIsMe = false
        }

        //get follow data
        var myFollows = kb.each(kb.sym(getMyURI()),SIOC('follows'))
        for(f in myFollows){
            followlist.add(kb.any(myFollows[f],SIOC('id')),myFollows[f].uri)
        }
        var Ifollow;
        // EVENT LISTENERS
        //---submit a post---
        var mbSubmitPost = function(){
            var postDate = new Date()
            var meta ={
                recipients:[]
            }
            //user has selected a microblog to post to
            if(getMyURI()){
                myUser = kb.sym(getMyURI());
                //submission callback
                var mbconfirmSubmit = function(a,b,c,d){
                    if(b == true){
                        for (triple in d){
                            kb.add(d[triple].subject, d[triple].predicate, d[triple].object, d[triple].why)
                        }
                        notify("submitted.")
                        if (thisIsMe) doc.getElementById('postList').insertBefore(generatePost(username, d[0].subject,thisIsMe),doc.getElementById('postList').childNodes[0])
                        xupdateSubmit.disabled = false;
                        xupdateStatus.value=""
                        mbLetterCount();
                    }
                    //add update to list
                }
                var words = xupdateStatus.value.split(" ")
                for (word in words){
                    if (words[word].match(/\@\w+/)){
                        var atUser = words[word].replace(/\W/g,"")
                        var recipient = followlist.selectUser(atUser)
                        if (recipient[0] ==true){
                            meta.recipients.push(recipient[1][0])
                        }else if (recipient[1].length > 1) { // if  multiple users allow the user to choose
                          choice = 0
                          alert("insert choose interface here")
                          meta.recpieients.push(recipient[1][choice])
                        }else{ //no users known
                            notify("You do not follow "+atUser+". Try following "+atUser+" before mentioning them.")
                            return
                        }
                    } else if(words[word].match(/\#\w+/)){
                        //hashtag
                    } else if(words[word].match(/\!\w+/)){
                        //usergroup
                    }
                }
                xupdateSubmit.disabled = true;
                xupdateSubmit.value = "Updating..."
                statusUpdate(xupdateStatus.value,mbconfirmSubmit,xinReplyToContainer.value,meta)

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
                if (stat == true){
                    if (!Ifollow){
                        //prevent duplicate entries from being added to kb (because that was happening)
                        if (!kb.whether(followMe.subject, followMe.predicate, followMe.object, followMe.why)){
                            kb.add(followMe.subject, followMe.predicate, followMe.object, followMe.why)
                        }
                    }else{
                        kb.removeMany(followMe.subject, followMe.predicate, followMe.object, followMe.why)
                    }
                    Ifollow= !Ifollow
                    xfollowButton.disabled = false;
                    followButtonLabel = (Ifollow)? "Unfollow ":"Follow ";
                    xfollowButton.value = followButtonLabel+ username;
                    notify("Follow list updated.")
                }
            }
            followMe = new RDFStatement(myUser,SIOC('follows'),creator,myUser)
            xfollowButton.disabled= true;
            xfollowButton.value = "Updating..."
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
        
//        if (!thisIsMe){
//            var xsetMyMB = doc.createElement('input');
//                xsetMyMB.type = 'button';
//                xsetMyMB.value = 'This is my Microblog';
//                xsetMyMB.addEventListener('click', mbSetMyMB, false)
//        }
            
        xupdateContainer.appendChild (xinReplyToContainer);
        xupdateContainer.appendChild(xupdateStatusCounter);
        xupdateContainer.appendChild(xupdateStatus);
        xupdateContainer.appendChild(xupdateSubmit);
//        if (!thisIsMe) xupdateContainer.appendChild(xsetMyMB);
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
            postContainer.id = "postList";
        var mb_posts = kb.each(s, SIOC("container_of"));
        //---returns a microblog post---
        var generatePost = function (uname, post,me){
            //container for post
            var xpost = doc.createElement('li');
                xpost.className = "post"
                xpost.setAttribute("id", String(post.uri).split("#")[1])
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
                xpostLink.id = "post_"+String(post.uri).split("#")[1]
            var postLink = new Date()
            postLink = postLink.parseISOdate(String(kb.any(post,terms('created'))))
            postLink = doc.createTextNode((postLink)?postLink:"post date unknown");
            xpostLink.appendChild(postLink)
            
   
            //LINK META DATA (MENTIONS, HASHTAGS, GROUPS)
            var mentions =kb.each(post,SIOC("topic"))
            tags = new Object()

            for(mention in mentions){
                sf.lookUpThing(mentions[mention])
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
            // This has the potential to support a post that replies to many messages.
            var inReplyTo = kb.each(post,SIOC("reply_of"));
            var xreplyTo = doc.createElement("span");
            for (reply in inReplyTo){
                var theReply = new RDFNamespace()
                theReply =String(inReplyTo[reply]).replace(/\<|\>/g,"")

                xreplyTo.innerHTML = "<div><a href="+theReply+">[in reply to]</a><div> ";

            }
            //END LINK META DATA
            
            
            
            
            
            //add the reply to and delete buttons to the interface
            var mbReplyTo = function (){
                var id= kb.any(creator,SIOC("id"));
                xupdateStatus.value = "@"+id+" ";
                xupdateStatus.focus();
                xinReplyToContainer.value = post.uri
                xupdateSubmit.value = "Reply";
                mbLetterCount()
            }
            
            var mbDeletePost = function (evt){
                var reallyDelete = confirm("are you sure you wish to delete this post?")
                if (reallyDelete){
                    //callback after deletion
                    var mbconfirmDeletePost= function(a,success){
                        if (success){
                            notify("delete confirmed")
                            //update the ui to reflect model changes.
                            var deleteThisNode = evt.target.parentNode;
                            deleteThisNode.parentNode.removeChild(deleteThisNode);
                            kb.removeMany(deleteMe);
                        }else{
                            notify("Oops, there was a problem, please try again")
                            evt.target.disabled = true
                        }
                    }
                    //delete references to post
                    var deleteContainerOf= function(a,success){
                        if (success){
                            var deleteContainer = kb.statementsMatching(
                                undefined,SIOC('container_of'),kb.sym(doc.getElementById(
                                "post_"+evt.target.parentNode.id)))
                            sparqlUpdater.batch_delete_statement(deleteContainer, mbconfirmDeletePost)
                        } else{
                            notify("Oops, there was a problem, please try again")
                            evt.target.disabled = false
                        }
                    }
                    //delete attributes of post
                    evt.target.disabled = true
                    deleteMe = kb.statementsMatching(kb.sym(doc.getElementById(
                        "post_"+evt.target.parentNode.id)))
                    sparqlUpdater.batch_delete_statement(deleteMe, deleteContainerOf)
                }
            }
            
            if (!me){
                var xreplyButton = doc.createElement('input');
                    xreplyButton.type = "button";
                    xreplyButton.value = "reply";
                    xreplyButton.className = "reply"
                    xreplyButton.addEventListener('click', mbReplyTo, false);   
            }else{
                var xdeleteButton = doc.createElement('input');
                    xdeleteButton.type = 'button';
                    xdeleteButton.value = "delete";
                    xdeleteButton.className = "reply"
                    xdeleteButton.addEventListener('click', mbDeletePost, false);
            }
            
            
            
            //build
            xpost.appendChild(xpostContent);
            if (!me){xpost.appendChild(xreplyButton)}
            else{xpost.appendChild(xdeleteButton)}
            xpost.appendChild(xuname);
            if(inReplyTo != ""){xpost.appendChild(xreplyTo)}
            xpost.appendChild(xpostLink)
            
            
            return xpost;
        }
        
        /*
            generatePostList - Generate the posts as well as their and
            display their results on the interface.
        */
        var generatePostList =  function(){
            var postlist = new Object()
            var datelist = new Array()
            for (post in mb_posts){
                var postDate = kb.any(mb_posts[post],terms('created'));
                if (postDate){
                    datelist.push(postDate);
                    postlist[postDate] = generatePost(username, mb_posts[post],thisIsMe);
                }
            }
            datelist.sort().reverse()
            for (d in datelist){
                postContainer.appendChild (postlist[datelist[d]])
            }
        }
        generatePostList()
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
