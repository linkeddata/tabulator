/*
   Second generation social network functionality for foaf
*/
       
tabulator.panes.register(tabulator.panes.newsocialpane= {

    icon:tabulator.Icon.src.icon_social,
    name: 'social2',
    label: function(subject){
        if (tabulator.kb.whether(
            subject, tabulator.ns.rdf('type'),
            tabulator.ns.foaf('Person'))){
            return 'social2';
        } else {
            return null;
        }
    },
    render: function(s, doc){
      //custom event handler
      function CustomEvents(){
        this._events ={};
      } 
      CustomEvents.prototype.addEventListener = function(en,evt){
        e= this._events;
        e[en] = e[en]||[];
        e[en].push(evt);
      }
      CustomEvents.prototype.raiseEvent = function(en, args, context){
        dump("\n"+en+" event raised");        
        e = this._events;
        //throw an exception if there is no event en registered
        if (!e[en]){ throw("No event \""+en+"\" registered.")}

        for (var i = 0; i < e[en].length; i++){
          e[en][i].apply(context,args)
        }
      } 
      //----------------------------------------------
      //ISO 8601 DATE
      //----------------------------------------------
      Date.prototype.getISOdate = function (){
      var padZero = function(n){
      return (n<10)? "0"+n: n;
      };
      var ISOdate = this.getUTCFullYear()+"-"+
        padZero (this.getUTCMonth())+"-"+
        padZero (this.getUTCDate())+"T"+
        padZero (this.getUTCHours())+":"+
        padZero (this.getUTCMinutes())+":"+
        padZero (this.getUTCSeconds())+"Z";
      return ISOdate;
      };
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

      };

      //NAMESPACES
      var foaf = tabulator.rdf.Namespace("http://xmlns.com/foaf/0.1/");
      var sioc = tabulator.rdf.Namespace("http://rdfs.org/sioc/ns#");
      var sioct = tabulator.rdf.Namespace('http://rdfs.org/sioc/types#');
      var rdf= tabulator.ns.rdf;
      var dc = tabulator.rdf.Namespace('http://purl.org/dc/elements/1.1/');
      var rss = tabulator.rdf.Namespace("http://purl.org/rss/1.0/");
      var kb = tabulator.kb;
      var sf = tabulator.sf;
      var sparqlUpdater = new tabulator.rdf.sparqlUpdate(kb);
      var Events = new CustomEvents();

      var socialpane = doc.createElement('div');
      socialpane.id = "social";
      

      //GET RELATIONSHIP DATA
      var fin = kb.statementsMatching(null,foaf('knows'), s);
      var fout = kb.each(s, foaf('knows'));
      var acq ={
        "friends":[],
        "unconfirmed":[],
        "requests":[]
      };
      var checked = {};
      //Find friend matches
      for (var fo in Iterator(fout)){
        for(var i=0; i < fin.length; i++){
          if (friend = fin[i].subject.sameTerm(fo[1])){ break;}
        }
        if(friend){
          acq['friends'].push(fin[i].subject);
          checked[i] = true;              
        }
        else{ acq['unconfirmed'].push(fo[1]); }      
      }
      for (var fi in Iterator(fin)){
        if (!(fi[0] in checked)){
          for (var i = 0; i < fout.length; i++){
            if (friend = fout[i].sameTerm(fi)) break;
          }
          if(friend) acq['friends'].push(fi[1].subject);
          else acq['requests'].push(fi[1].subject);
        }
      }
      //GET THE CURRENT USER'S PROFILE
      function getProfileData(person){
        var profile = {};
        var cperson = kb.canon(kb.sym(person));
        var person = kb.sym(person);
        profile['name'] =(kb.whether(cperson, foaf('name'))) ?  kb.any(person, foaf('name')): kb.any(person, foaf('givenname'))+' '+ kb.any(person, foaf('family_name'));
        profile['phone'] = kb.each(cperson, foaf('phone'));
        profile['email'] = kb.each(cperson, foaf('mbox'));
        profile['websites'] = kb.each(cperson, foaf('homepage')).concat(kb.each(cperson,foaf('weblog')));
        profile['picture'] =  kb.any(person, foaf('depiction')) || kb.any(cperson, foaf('img')) ||  false;
        profile['nick'] = kb.each(cperson, foaf('nick'));
        profile['aim'] = kb.each(cperson,foaf('aimChatID'));
        profile['skype'] = kb.each(cperson,foaf('skypeID'));
        profile['msn'] = kb.each(cperson,foaf('msnChatID'));
        profile['jabber'] = kb.each(cperson,foaf('jabberID'));
        profile['icq'] = kb.each(cperson,foaf('icqChatID'));
        profile['yahoo'] = kb.each(cperson,foaf('yahooChatID'));
        profile['status']= new Array();
        profile['images'] = kb.each(cperson, foaf('img')).concat(kb.each(cperson, foaf('depiction')));
        var posts = Iterator(kb.statementsMatching(null,rdf('type'),sioct('MicroblogPost')));
        for(var post in posts){ profile['status'].push(post[1].subject); }
        //identica hack
        var posts = Iterator( kb.statementsMatching(null,rdf('type'),'http://rdfs.org/sioc/types#MicroblogPost'));
        for(var post in posts){
          if(kb.whether(post[1].subject, foaf('maker'),person)) profile['status'].push(post[1].subject); }
        profile['plan'] = kb.each(cperson,foaf('plan'));

        return profile;
      }
      //generate new elements
      function newElement(tag, p){
        x=doc.createElement(tag);
        x['child']= function(tag){return newElement(tag, x)};
        if(!p){ socialpane.appendChild(x);}
        else{ p.appendChild(x);}
        return x;
      }
      //display info from IM accounts
      function displayAcct(proto, profile , p ){
        if(profile[proto].length){
          newElement('h4',p).innerHTML = proto;
          accts = newElement('ul',p);
          accts.className = "contactlist";
          for (i=0; i< profile[proto].length; i++){
            newElement('li', accts).innerHTML = profile[proto][i];
          }
        }
      }


      //DISPLAY MICROBLOG POSTS FROM IDENTICA/PERSONAL MICROBLOG
      function getStatusUpdates(post){
        var content = kb.any(post,rss('modules/content/encoded')) || kb.any(post,sioc('content'));
        var theDate = kb.statementsMatching(post,dc('date'));
        return "<p>"+content+"</p><div>"+theDate +"</div>";
      }

      //LISTENERS-----------------------------------------------
      var friendListUpdate = function(that) //TODO  update users friends, send friend change event
      { 
        var batch =[
            
        ]
        sparqlUpdater.insert_statement(
          [new tabulator.rdf.Statement(I, foaf('knows'),s, I)],
          function(a,b,c) {
            sparqlUpdater.insert_statement(
              [new tabulator.rdf.Statement(I, foaf('knows'),s, s)],
              function(a,b,c){
                Events.raiseEvent("statusUpdate",[acc,statusMsg,person],this);
                Events.raiseEvent("friendListUpdate",[], that);
                callback(a, b, c, batch);              
            });
        });
      }
      var changeStatusList = function() //TODO update the status list in the ui
      {}
      var changeFriendList = function() //TODO update user's friends in the ui 
      {}
      var changeFriendButton= function()//TODO update the text of the friend button
      {
        if (kb.whether(I, foaf('knows'),s)){
          ui.addFriend.value = "Unlink "+(profile['nick'][0]||profile.name);
        }else{
          ui.addFriend.value = "I know "+(profile['nick'][0]||profile.name);
        }
        if(myProfile){ ui.addFriend.className = "hidden"}

      }
      function activateView(view, evt){ // click on a tab to show a view
        var v= doc.getElementById(view);
        var tab = evt.target.parentNode.getElementsByTagName('li');
        var views =v.parentNode.getElementsByTagName("div");
        for (var i =0; i < tab.length; i++){
          tab[i].className = tab[i].className.replace(/active/,'');
        }
        for (var i =0; i < views.length; i++){
          views[i].className = views[i].className.replace(/active/,'');
        }
        evt.target.className = "active";
        v.className = "active";
      }
      function showNewAccForm(){ // allow user to generate new webid
        var req =tabulator.rdf.Util.XMLHTTPFactory();
        req.open("POST","https://localhost/config/register.php",false);
        var nac =  doc.getElementById('newaccountform');
        req.send(null); 
        if(req.status == 200)  
          nac.innerHTML=req.responseText; 
        nac.className = (nac.className =="")? "active":"";
      }
      function statusUpdate(acc, statusMsg, person, su, callback){ //post a new status update to the server
        var date = String(new Date().getISOdate())
        var micro =  acc+"/status";
        var newPost =kb.sym( micro+"#"+date.replace(/:/g,''));
        var batch = [
          new tabulator.rdf.Statement(newPost, rdf('type'), sioct('MicroblogPost'),kb.sym(micro)),
          new tabulator.rdf.Statement(newPost, sioc('content'), statusMsg,kb.sym(micro)),
          new tabulator.rdf.Statement(newPost, dc('date'), statusMsg,kb.sym(micro)),
          new tabulator.rdf.Statement(kb.sym(micro), sioc('container_of'), newPost,kb.sym(micro)),
          new tabulator.rdf.Statement(newPost,foaf('maker'),person,kb.sym(micro))
          ];
        su.insert_statement(batch,
            function(a, b, c) {
              Events.raiseEvent("statusUpdate",[acc,statusMsg,person],this);
              callback(a, b, c, batch);
            });
      }
      function requestWebID(){
        var req =tabulator.rdf.Util.XMLHTTPFactory();
        req.open("POST","https://localhost/config/register.php",false);
        return false;
      }
      //END LISTENERS-----------------------------------------

      var p=s.uri;
      var myProfile = (tabulator.preferences.get('me') == p);
      var I = kb.sym(tabulator.preferences.get('me'));
      var profile = getProfileData(p);
      var ui={};
      sf.addCallback('done',function(){Events.raiseEvent("friendListUpdate",[],this);
          tabulator.panes.newsocialpane.render(s,doc);
          })
      if (!(kb.whether(I, rdf('type'),foaf('Person')))){
          sf.lookUpThing(I);
      }
      for (i in Iterator(kb.each(s, foaf('weblog')))){
          sf.lookUpThing(i);
      }
      ui.newacc = newElement('input');
        ui.newacc.type='button';
        ui.newacc.value= 'Create a new WebID';
        ui.newacc.addEventListener("click", function(evt){showNewAccForm()}, false);
        ui.newacc.id= 'new_account_button';
      ui.newaccForm = newElement('form');
        ui.newaccForm.action= "#";
        ui.newaccForm.addEventListener("submit",function(){return requestWebID()},false);
        ui.newaccForm.id = "newaccountform";
        ui.acc= newElement('dl',ui.newaccForm);
        /*newElement('dt',ui.acc).innerHTML="Nickname/Username:";
        ui.accemail = newElement('dd', ui.acc).child('input');
          ui.accemail.name="username";
        newElement('dt',ui.acc).innerHTML="Name:";
        ui.accname = newElement('dd', ui.acc).child('input');
          ui.accname.name="name";
        newElement('dt',ui.acc).innerHTML="Email:";
        ui.accemail = newElement('dd', ui.acc).child('input');
          ui.accemail.value ="email";
        newElement('dt',ui.acc).innerHTML="WebID Provider";
        ui.accprovider = newElement('dd',ui.acc).child('input');
          ui.accprovider.value ="default";
        ui.newacchelp = newElement('p',ui.newaccForm);
        ui.newacchelp.id="helptext"
        ui.newacchelp.innerHTML = "\
                                   A Web ID is a URL for you. It allows you to set up a public\
                                   profile, with friends, pictures and all kinds of things.\
                                   It works like having an account on a social networking site,\
                                   but it isn't restricted to just that site. It is very open\
                                   because the information can connect to other people, organizations\
                                   and projects and so on, without everyon having to join the same\
                                   social networking site. All you need is some place on the web\
                                   where you can save a file to."
                                   
      ui.makenewacc= newElement('input',ui.acc);
      ui.makenewacc.type='submit';
      ui.makenewacc.value='Create my WebID';
      */

      newElement('h1').innerHTML = profile.name;
       
      //CONTACT INFORMATION BOX ---------------------------------------
      ui.contact = newElement('div');
      ui.contact.id ="contact";
      if (profile.picture){
      ui.profileimg = newElement('img',ui.contact);
        ui.profileimg.src = profile.picture.uri;
        ui.profileimg.id = "profile_img";
      }
     
      ui.meform = newElement('form',ui.contact);
        ui.me = newElement('input',ui.meform);
        newElement('span',ui.meform).innerHTML ="This is me.";
        
        ui.me.type='checkbox';
        ui.me.checked = myProfile;
        ui.me.addEventListener('click', function(evt){
            if (evt.target.checked) tabulator.preferences.set('me',s.uri);
            else tabulator.preferences.set('me','');
        },false);


      ui.plan = newElement('div',ui.contact);
        ui.plan.id= "plan";
        ui.plan.className = (myProfile)? 'editable' : '';
      newElement('p', ui.plan).innerHTML = profile.plan;

      newElement('h3', ui.contact).innerHTML = "Contact Information";
      if (profile.websites){
        newElement('h4',ui.contact).innerHTML = "Websites";
        ui.sites= newElement('ul', ui.contact);
        sites={};
        for (var site in Iterator( profile['websites'])){
          site=site[1];
          si = site.uri.replace(/\/$/,'')
          if (!(si in sites)){
            ui.site = newElement('li', ui.sites).child('a');
            ui.site.innerHTML = tabulator.Util.label( site);
            ui.site.href = site.uri;
            sites[si] = true;
          }
        }
      }

      newElement('h4',ui.contact).innerHTML = "Nickname";
      ui.nicks = newElement('ul',ui.contact);
      var nick ={}
      for (i=0; i< profile['nick'].length; i++){
        if (!(profile.nick[i] in nick)){
          newElement('li',ui.nicks).innerHTML = profile['nick'][i];
          nick[profile.nick[i]] = true;
        }
      }
      if(profile.phone){
      newElement('h4',ui.contact).innerHTML = "Phone";
      ui.phone = newElement('ul',ui.contact);
      var phone = {}
      for (i=0; i< profile['phone'].length; i++){
        if (!(profile.phone[i] in phone)){
          ui.phonenumber = newElement('li',ui.phone).child('a');
          ui.phonenumber.innerHTML = profile['phone'][i].uri.replace(/tel:\+?/,'');
          ui.phonenumber.href = profile['phone'][i].uri;
          phone[profile.phone[i]]=true;
        }
      }
      }
      if (profile.email){
        newElement('h4',ui.contact).innerHTML = "Email";
        ui.email = newElement('ul', ui.contact);
        for (var email in Iterator( profile['email'])){
          email=email[1];
          ui.mbox = newElement('li', ui.email).child('a');
          ui.mbox.innerHTML = (email.uri) ? email.uri.replace("mailto:","") : email;
          ui.mbox.href =(email.uri) ? email.uri: "mailto:"+email;
        }
      }

      displayAcct('aim', profile , ui.contact );
      displayAcct('jabber', profile , ui.contact );
      displayAcct('skype', profile , ui.contact );
      displayAcct('yahoo', profile , ui.contact );
      displayAcct('icq', profile , ui.contact );
      displayAcct('msn', profile , ui.contact );
      //END CONTACT INFORMATION BOX -----------------------------------

      //RIGHT PANEL
      ui.rp = newElement('div');
      ui.rp.id = "rightpanel";
      //add friends
      ui.addFriend = newElement('input', ui.rp);
        ui.addFriend.type="button";
        ui.addFriend.id='addfriend';
        ui.addFriend.addEventListener("click",function(evt){friendListUpdate(this)}, false);
        Events.addEventListener("friendListUpdate",changeFriendButton); //TODO need to dispatch friendlistupdate event
        Events.raiseEvent("friendListUpdate",[],this);

        //tabs 
        ui.views = newElement('ol',ui.rp);
        ui.views.id="viewtabs";
        ui.statusView = newElement('li', ui.views);
          ui.statusView.innerHTML = "Status";
          ui.statusView.className = "active";
          ui.statusView.addEventListener("click", function(evt){activateView("status",evt);},false)
        ui.photoView  = newElement('li', ui.views);
          ui.photoView.innerHTML = "Photos";
          ui.photoView.addEventListener("click", function(evt){activateView("photos",evt);},false)
        ui.friendView = newElement('li', ui.views);
          ui.friendView.innerHTML = "Friends";
          ui.friendView.addEventListener("click", function(evt){activateView("friends",evt);},false)

      //STATUSES
      ui.statusbox = newElement('div', ui.rp);
        ui.statusbox.id = "status";
        ui.statusbox.className = "active";
      ui.postbox = newElement('form', ui.statusbox);
        ui.postbox.id = "postbox";
      newElement('p', ui.postbox).innerHTML = (myProfile)?"What's up?": "Message "+(profile['nick'][0]||profile.name)+":";
      ui.posttext =  newElement('textarea',ui.postbox);
        ui.posttext.id = "status_text";
      ui.post = newElement('input',ui.postbox);
          ui.post.type = "submit";
          ui.post.value = "Send";
          ui.postbox.addEventListener("submit",function(){
              statusUpdate("http://localhost/charles2",doc.getElementById("status_text").value,I,sparqlUpdater);
              },false)
          ui.post.id = "post_button";
      ui.statuses = newElement('ol',ui.statusbox);
      for (var status in Iterator(profile['status'])){
        newElement('li', ui.statuses).innerHTML =getStatusUpdates(status[1]);
      }
      
      //PHOTOS
      ui.photobox = newElement('div', ui.rp);
        ui.photobox.id ='photos';
        var photoStore ={}
        for (var img in Iterator(profile['images'])){
            img = img[1];
            photostore ={}
            if (!(img.uri in photostore)){
              ui.photo = newElement('img',ui.photobox);
              ui.photo.src = img.uri;
              photostore[img.uri] = true;
            }
        }


      //ACCQUAINTANCES
      ui.knowsbox = newElement('div',ui.rp);
      ui.knowsbox.id = "friends";
      newElement('h3',ui.knowsbox).innerHTML="Friends";
      ui.knows = newElement('ul', ui.knowsbox);
        ui.knows.id="knows_list";
      ui.knows.friend = new Array();
      for (var friend in Iterator(acq.friends)){

        ui.knows.friend=newElement('li',ui.knows).child('a');
        ui.knows.friend.innerHTML = tabulator.Util.label(friend[1]);
        ui.knows.friend.href= friend[1].uri;
        Events.addEventListener("updateFriendsList", updateFriendsList); //TODO need to dispatch updateFriendsList
      }
      newElement('h3',ui.knowsbox).innerHTML="Knows";
      ui.unconf = newElement('ul', ui.knowsbox);
        ui.unconf.id="unconf_list";
      ui.unconf.friend = new Array();
      for (var unconfirmed in Iterator(acq.unconfirmed)){
        ui.unconf.friend=newElement('li',ui.unconf).child('a');
        ui.unconf.friend.innerHTML = tabulator.Util.label(unconfirmed[1]);
        ui.unconf.friend.href= unconfirmed[1].uri;
      }
      newElement('h3',ui.knowsbox).innerHTML="Friend Requests";
      ui.knowsof = newElement('ul', ui.knowsbox);
        ui.knowsof.id="knowsof_list";
      ui.knowsof.friend = new Array();
      for (var request in Iterator(acq.requests)){
        ui.knowsof.friend=newElement('li',ui.knowsof).child('a');
        ui.knowsof.friend.innerHTML = tabulator.Util.label(request[1]);
        ui.knowsof.friend.href= request[1].uri;
      }
      return socialpane;
    }
}, true);

