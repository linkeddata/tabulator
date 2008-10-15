     
    photoPane = {};
    photoPane.icon = Icon.src.icon_photoPane;
    
    // The bullet for the tags in the Tag Menu on the right
    var tag_bullet = Icon.src.icon_TinyTag;

    // Functions for formatting the tags and URLS of tags from the RDF statements
    function FormatTags(str) {
        str = str.substring(0,str.length-1);
        return str.substring(str.lastIndexOf('/')+1,str.length);
    }
    function FormatImageURLThumbnail(str) {
        return str.substring(1,str.length-5) + '_t.jpg';
    }
    function FormatImageURLMedium(str) {
        return str.substring(1,str.length-5) + '_m.jpg';
    }
    function FormatImageURLBig(str) {
        return str.substring(1,str.length-5) + '_b.jpg';
    }
    
    // namespace and shorthand for concepts in the tag ontology
    var RDF = RDFNamespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    var TAGS = RDFNamespace("http://www.holygoat.co.uk/owl/redwood/0.1/tags/");
    var T_Tagging = TAGS('Tagging');
    var T_associatedTag = TAGS('associatedTag');
    var T_taggedItem = TAGS('taggedItem');
    var T_taggingActivity = TAGS('taggingActivity');
    var PAC = RDFNamespace("http://people.csail.mit.edu/albert08/project/ont/pac.rdf#");
    var P_PhotoAlbum = PAC('PhotoAlbum');
    
    var checkedTags = new Array();
    var allPhotos = new Array();
    
    function CompareTags(photo,checked) {
        if (checked.length == 0) {
            return true;
        }
        var count = 0;
        for (var i = 0; i < photo.length; i++) {
            for (var j = 0; j < checked.length; j++) {
                if (photo[i] == checked[j]) {
                    count++;
                }
            }
        }
        if (count == checked.length)  {
            return true;
        } else {
            return false;
        }
    }
    
    photoPane.label = function(subject) {
        
        if (!kb.whether(subject, RDF('type'), P_PhotoAlbum)) {
            return null;
        }
        return "Photo Album";
    }

    // View the justification trace in an exploratory manner
    photoPane.render = function(subject, myDocument) {
        
        checkedTags = new Array();
        allPhotos = new Array();

        // Create the main panel
		var main_div = myDocument.createElement("div");
        main_div.setAttribute('class', 'PhotoContentPane');
        main_div.setAttribute('id', 'PhotoContentPane');        
        
        // Create the photo listing panel, add it to the main panel
        var photo_list_div = myDocument.createElement("div");
        photo_list_div.setAttribute('class', 'PhotoListPanel');
        photo_list_div.setAttribute('id', 'PhotoListPanel');
        main_div.appendChild(photo_list_div);
        
        // Create the tag menu panel, add it to the main panel
        var tag_menu_div = myDocument.createElement("div");
        tag_menu_div.setAttribute('class', 'TagMenu');
        tag_menu_div.setAttribute('id', 'TagMenu');
        main_div.appendChild(tag_menu_div);
        
        // Load photos URL and tags
        var tags = new Array();
        
        photoPane.render.LoadPhotoData = function() {
            
            // Identify tagging activities in the album
            var stsTaggings = kb.statementsMatching(subject, T_taggingActivity, undefined);
            for (var i = 0; i < stsTaggings.length; i++) {
            
                // Extract the photos and tags
                var stsPhotos = kb.statementsMatching(stsTaggings[i].object, T_taggedItem, undefined);
                var photo = new Object();
                photo.photo = FormatImageURLMedium(stsPhotos[0].object.toString());
                
                var stsTags = kb.statementsMatching(stsTaggings[i].object, T_associatedTag, undefined);
                photo.tags = new Array();
                for (var j = 0; j < stsTags.length; j++) {
                    var tag = FormatTags(stsTags[j].object.toString());
                    photo.tags.push(tag);
                    if (tags.indexOf(tag) == -1) {
                        tags.push(tag);
                    }
                }
                allPhotos.push(photo);
            }
            
            // Populate the Tag Menu on the right        
            for (var i = 0; i < tags.length; i++) {
                var tag = tags[i];
                
                // Each Tag is contained in a div
                var tagItem = myDocument.createElement("div");
                tagItem.setAttribute('class','TagMenu_tag');
                
                // Create and append the checkbox (default is checked), updated the list of checked tags
                var checkbox = myDocument.createElement("input");
                checkbox.setAttribute("type","checkbox");
                checkbox.setAttribute("id",tag);
                checkbox.setAttribute("name",tag);
                checkbox.addEventListener("click",photoPane.render.UpdateCheckedTags,false);
                tagItem.appendChild(checkbox);
                
                // Append the tag to the div
                tagItem.appendChild(myDocument.createTextNode(tag));
                tagItem.appendChild(myDocument.createElement('br'));
                tag_menu_div.appendChild(tagItem);
            }
        }
        
        // Populate the Photo List panel on the left
        // Check which tags are selected and display the corresponding photos accordingly
        photoPane.render.PopulatePhotoList = function() {
            photo_list_div.innerHTML = "";
            for (var i = 0; i < allPhotos.length; i++) {
                if (CompareTags(allPhotos[i].tags,checkedTags)) {
                    var img = myDocument.createElement("img");
                    img.setAttribute("src",allPhotos[i].photo);
                    img.setAttribute("class","PThumbnail");
                    photo_list_div.appendChild(img);
                }
            }
        }
        
        photoPane.render.UpdateCheckedTags = function(e) {
            tag = e.target.id;
            if (e.target.checked) {
                checkedTags.push(tag);
            } else {
                var temp = new Array();
                for (var i = 0; i < checkedTags.length; i++) {
                    if (checkedTags[i] != tag) {
                        temp.push(checkedTags[i])
                    }
                }
                checkedTags = temp;
            }
            photoPane.render.PopulatePhotoList();
        }
        
        photoPane.render.LoadPhotoData()
        photoPane.render.PopulatePhotoList()
        
        return main_div;
    }

    tabulator.panes.register(photoPane, false);

// ends

