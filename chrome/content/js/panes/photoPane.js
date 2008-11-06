     
    photoPane = {};
    photoPane.icon = Icon.src.icon_photoPane;
    photoPane.name = 'Photo';
    
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
    var PAC = RDFNamespace("http://people.csail.mit.edu/albert08/project/ont/pac.rdf#");
    
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
        
        if (!kb.whether(subject, RDF('type'), PAC("PhotoAlbum"))) {
            return null;
        }
        return "Photo Album";
    }

    
    photoPane.render = function(subject, myDocument) {
        
        checkedTags = new Array();
        allTags = new Array();
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
            
            // Retrieve the photos in the album (using the "Contains" property)
            var stsPhotos = kb.statementsMatching(subject, PAC("Contains"), undefined);
            
            for (var i = 0; i < stsPhotos.length; i++) {
                var photo = new Object();
                photo.URI = stsPhotos[i].object.toString();
                
                // For each tagging, retrieve all the associated tags
                var stsTaggings = kb.statementsMatching(stsPhotos[i].object, PAC("hasTagging"), undefined);
                for (var j = 0; j < stsTaggings.length; j++) {
                    tags = new Array();
                                        
                    var stsTags = kb.statementsMatching(stsTaggings[j].object, TAGS("associatedTag"), undefined);
                    for (var k = 0; k < stsTags.length; k++) {
                        
                        var tag = kb.the(stsTags[k].object, RDFS("label"), undefined);
                        tags.push(tag);
                        if (allTags.indexOf(tag) == -1) {
                            allTags.push(tag);
                        }
                    }
                    
                    photo.tags = tags;
                }
                
                allPhotos.push(photo);
            }
            
            
            // Populate the Tag Menu on the right   
            allTags.sort();     
            for (var i = 0; i < allTags.length; i++) {
                var tag = allTags[i];
                
                // Each Tag is contained in a div
                var tagItem = myDocument.createElement("div");
                tagItem.setAttribute('class','TagMenu_tag');
                
                // Create and append the checkbox, updated the list of checked tags
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
                    img.setAttribute("src",FormatImageURLMedium(allPhotos[i].URI));
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
        
        photoPane.render.LoadPhotoData();
        photoPane.render.PopulatePhotoList();
        
        return main_div;
    }

    tabulator.panes.register(photoPane, false);

// ends

