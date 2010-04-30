/*
   Second generation social network functionality for foaf
*/
tabulator.panes.register(tabulator.panes.pane= {

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
      //namespaces
      var foaf = tabulator.rdf.Namespace("http://xmlns.com/foaf/0.1/");
      var kb = tabulator.kb;
      var sf = tabulator.sf;
      var socialpane = doc.createElement('div');
      socialpane.id = "social";
      
      function knows(person){
        var knows = kb.each(kb.sym(person), foaf('knows'));
        var acq={};
        for (i=0; i < knows.length; i++){
          acq[knows[i].uri] = kb.any(knows[i],foaf('name'))
            || kb.any(knows[i],foaf('givenname'))
            || kb.any(knows[i],foaf('nick')) 
            || knows[i].uri;
        }
        return acq
      }
      function getProfileData(person){
        var profile = {};
        var person = kb.sym(person);
        profile['name'] =(kb.whether(person, foaf('name'))) ?  kb.any(person, foaf('name')): kb.any(person, foaf('givenname'))+' '+ kb.any(person, foaf('family_name'));
        profile['phone'] = kb.each(person, foaf('phone'));
        profile['email'] = kb.each(person, foaf('mbox'));
        profile['website'] = kb.each(person, foaf('homepage'));
        profile['picture'] = (kb.whether(person, foaf("img")))?  kb.any(person, foaf('img')).uri: kb.any(person, foaf('depiction')).uri;
        profile['nick'] = kb.each(person, foaf('nick'));
        profile['aim'] = kb.each(person,foaf('aimChatID'));
        profile['skype'] = kb.each(person,foaf('skypeID'));
        profile['msn'] = kb.each(person,foaf('msnChatID'));
        profile['jabber'] = kb.each(person,foaf('jabberID'));
        profile['icq'] = kb.each(person,foaf('icqChatID'));
        profile['yahoo'] = kb.each(person,foaf('yahooChatID'));
        profile['status'] = kb.each(person,foaf('status'));

        return profile;
      }
      function newElement(tag, p){
        x=doc.createElement(tag);
        x['child']= function(tag){return newElement(tag, x)};
        if(!p){ socialpane.appendChild(x);}
        else{ p.appendChild(x);}
        return x;
      }
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
      function activateView(view, evt){
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

      p=doc.location;
      var profile = getProfileData(p);
      var acq = knows(p);
      var ui={};
      ui.newacc = newElement('input');
        ui.newacc.type='button';
        ui.newacc.value= 'Create a new WebID';
        ui.newacc.id= 'new_account_button';
      newElement('h1').innerHTML = profile.name;
           
      //CONTACT INFORMATION 
      ui.contact = newElement('div');
      ui.contact.id ="contact";
      if (profile.picture){
      ui.profileimg = newElement('img',ui.contact);
        ui.profileimg.src = profile.picture;
        ui.profileimg.id = "profile_img";
      }
      
      newElement('h3', ui.contact).innerHTML = "Contact Information";


      
      newElement('h4',ui.contact).innerHTML = "Nickname";
      ui.nicks = newElement('ul',ui.contact);
      for (i=0; i< profile['nick'].length; i++){
        newElement('li',ui.nicks).innerHTML = profile['nick'][i];
      }

      newElement('h4',ui.contact).innerHTML = "Phone";
      ui.phone = newElement('ul',ui.contact);
      for (i=0; i< profile['phone'].length; i++){
        newElement('li',ui.phone).innerHTML += profile['phone'][i].uri;
      }

      newElement('h4',ui.contact).innerHTML = "Email";
      ui.email = newElement('ul', ui.contact);
      for (i=0; i< profile['email'].length; i++){
        ui.mbox = newElement('li', ui.email).child('a');
        ui.mbox.innerHTML = profile['email'][i].uri.replace("mailto:","");
        ui.mbox.href = profile['email'][i].uri;
      }

      displayAcct('aim', profile , ui.contact );
      displayAcct('jabber', profile , ui.contact );
      displayAcct('skype', profile , ui.contact );
      displayAcct('yahoo', profile , ui.contact );
      displayAcct('icq', profile , ui.contact );
      displayAcct('msn', profile , ui.contact );

      //RIGHT PANEL
      ui.rp = newElement('div');
      ui.rp.id = "rightpanel";
      ui.views = newElement('ol',ui.rp);
        ui.views.id="viewtabs";
        ui.statusView = newElement('li', ui.views);
          ui.statusView.innerHTML = "Status";
          ui.statusView.className = "active";
          ui.statusView.addEventListener("click", function(evt){activateView("status",evt);},false)
        ui.photoView  = newElement('li', ui.views);
          ui.photoView.innerHTML = "Photos";
        ui.friendView = newElement('li', ui.views);
          ui.friendView.innerHTML = "Friends";
          ui.friendView.addEventListener("click", function(evt){activateView("friends",evt);},false)

      //STATUSES
      ui.statusbox = newElement('div', ui.rp);
        ui.statusbox.id = "status";
        ui.statusbox.className = "active";
      ui.postbox = newElement('form', ui.statusbox);
      newElement('p', ui.postbox).innerHTML = "What's up?";
      ui.post =  newElement('textarea',ui.postbox);
      ui.post = newElement('input',ui.postbox);
          ui.post.type = "submit";
          ui.post.value = "Send";
          ui.post.id = "post_button";
      ui.statuses = newElement('ol',ui.statusbox);
      for (var i=0; i < profile['status'].length; i++){
        newElement('li', ui.statuses).innerHTML = profile['status'][i];
      }
      
      //PHOTOS

      //ACCQUAINTANCES
      ui.knowsbox = newElement('div',ui.rp);
      ui.knowsbox.id = "friends";
      newElement('h3',ui.knowsbox).innerHTML="Accquaintances";
      ui.knows = newElement('ul', ui.knowsbox);
        ui.knows.id="knows_list";
      ui.knows.friend = new Array();
      for (var i in acq){
        ui.knows.friend=newElement('li',ui.knows).child('a');
        ui.knows.friend.innerHTML = acq[i];
        ui.knows.friend.href= i;
      }
      return socialpane;
    }
}, false);

