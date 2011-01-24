
// This is for online scripts only. A completely different file is used for
// the tabulator extension: chrome/content/prefs.js

tabulator.preferences = {

    get: function(name) {
        return tabulator.preferences.getCookie('tabulator-'+name)
    },
    
    set: function(name, value) {
        return tabulator.preferences.setCookie('tabulator-'+name, value, '3007-01-06')
    },
    

// #####################################  Cookie handling #######

    setCookie: function(name, value, expires, path, domain, secure) {
        expires = new Date(); // http://www.w3schools.com/jsref/jsref_obj_date.asp
        expires.setFullYear("2030"); // How does one say never?
        var curCookie = name + "=" + escape(value) +
            ((expires) ? "; expires=" + expires.toGMTString() : "") +
            ((path) ? "; path=" + path : "") +
            ((domain) ? "; domain=" + domain : "") +
            ((secure) ? "; secure" : "");
        document.cookie = curCookie;
//        alert('Cookie:' + curCookie);
    },
    
    /*  getCookie
    **
    **  name - name of the desired cookie
    **  return string containing value of specified cookie or null
    **  if cookie does not exist
    */
    getCookie: function(name) {
        var dc = document.cookie;
        var prefix = name + "=";
        var begin = dc.indexOf("; " + prefix);
        if (begin == -1) {
            begin = dc.indexOf(prefix);
            if (begin != 0) return null;
        } else
            begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1)
            end = dc.length;
        return decodeURIComponent(dc.substring(begin + prefix.length, end));
    },
    
    deleteCookie: function(name, path, domain) {
        if (getCookie(name)) {
            document.cookie = name + "=" +
                ((path) ? "; path=" + path : "") +
                ((domain) ? "; domain=" + domain : "") +
                "; expires=Thu, 01-Jan-70 00:00:01 GMT";
        }
    }

};

// ################################ End cookie

