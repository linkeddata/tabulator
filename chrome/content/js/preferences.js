
tabulator.preferences = {


// #####################################  Cookie handling #######

    setCookie: function(name, value, expires, path, domain, secure) {
        expires = new Date(); // http://www.w3schools.com/jsref/jsref_obj_date.asp
        expires.setFullYear("2030"); // How does one say never?
        var curCookie = name + "=" + escape(value) +
            ((expires) ? "; expires=" + expires.toGMTString() : "") +
            ((path) ? "; path=" + path : "") +
            ((domain) ? "; domain=" + domain : "") +
            ((secure) ? "; secure" : "");
        myDocument.cookie = curCookie;
//        alert('Cookie:' + curCookie);
    },
    
    set: function(name, value) {
        return tabulator.preferences.setCookie(name, value, '3007-01-06')
    },
    
    /*  getCookie
    **
    **  name - name of the desired cookie
    **  return string containing value of specified cookie or null
    **  if cookie does not exist
    */
    getCookie: function(name) {
        var dc = myDocument.cookie;
        var prefix = name + "=";
        var begin = dc.indexOf("; " + prefix);
        if (begin == -1) {
            begin = dc.indexOf(prefix);
            if (begin != 0) return null;
        } else
            begin += 2;
        var end = myDocument.cookie.indexOf(";", begin);
        if (end == -1)
            end = dc.length;
        return decodeURIComponent(dc.substring(begin + prefix.length, end));
    },
    
    deleteCookie: function(name, path, domain) {
        if (getCookie(name)) {
            myDocument.cookie = name + "=" +
                ((path) ? "; path=" + path : "") +
                ((domain) ? "; domain=" + domain : "") +
                "; expires=Thu, 01-Jan-70 00:00:01 GMT";
        }
    },


    // See http://www.xulplanet.com/references/xpcomref/ifaces/nsIPrefBranch.html
    // 
   if(isExtension) {

        const PREFID = '@mozilla.org/preferences;1';
        const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
        const PREF = Components.classes[PREFID].getService(nsIPrefBranch);

        function getPref(prefstring) {
            var type = PREF.getPrefType(prefstring);
            const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
            switch (type) {
                case nsIPrefBranch.PREF_STRING:
                    return PREF.getCharPref(prefstring);
                    break;
                case nsIPrefBranch.PREF_INT:
                    return PREF.getIntPref(prefstring);
                    break;
                case nsIPrefBranch.PREF_BOOL:
                default:
                    return PREF.getBoolPref(prefstring);
                    break;
            }
        }
        
        function setPrefString(key, val) {
            PREF.setCharPref('tabulator.'+key, val);
        }

        // ############ File read-write stuff in case we need it ..
        var savefile = "c:\\mozdata.txt";
        function savePrefs() { // after http://www.captain.at/programming/xul/
            try {
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            } catch (e) {
                    alert("Permission to save file was denied.");
            }
            var file = Components.classes["@mozilla.org/file/local;1"]
                    .createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath( savefile );
            if ( file.exists() == false ) {
                    alert( "Creating file... " );
                    file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420 );
            }
            var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                    .createInstance( Components.interfaces.nsIFileOutputStream );
            /* Open flags 
            #define PR_RDONLY       0x01
            #define PR_WRONLY       0x02
            #define PR_RDWR         0x04
            #define PR_CREATE_FILE  0x08
            #define PR_APPEND      0x10
            #define PR_TRUNCATE     0x20
            #define PR_SYNC         0x40
            #define PR_EXCL         0x80
            */
            /*
            ** File modes ....
            **
            ** CAVEAT: 'mode' is currently only applicable on UNIX platforms.
            ** The 'mode' argument may be ignored by PR_Open on other platforms.
            **
            **   00400   Read by owner.
            **   00200   Write by owner.
            **   00100   Execute (search if a directory) by owner.
            **   00040   Read by group.
            **   00020   Write by group.
            **   00010   Execute by group.
            **   00004   Read by others.
            **   00002   Write by others
            **   00001   Execute by others.
            **
            */
            outputStream.init( file, 0x04 | 0x08 | 0x20, 420, 0 );
            var output = document.getElementById('blog').value;
            var result = outputStream.write( output, output.length );
            outputStream.close();
        }
        
        function readPrefs() {
            try {
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            } catch (e) {
                    alert("Permission to read file was denied.");
            }
            var file = Components.classes["@mozilla.org/file/local;1"]
                    .createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath( savefile );
            if ( file.exists() == false ) {
                    alert("File does not exist:" + savefile);
            }
            var is = Components.classes["@mozilla.org/network/file-input-stream;1"]
                    .createInstance( Components.interfaces.nsIFileInputStream );
            is.init( file,0x01, 00004, null);
            var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
                    .createInstance( Components.interfaces.nsIScriptableInputStream );
            sis.init( is );
            var text = sis.read( sis.available() );
            document.getElementById('blog').value = output;
        }

    } // end if(isExtension)

};

// ################################ End cookie

