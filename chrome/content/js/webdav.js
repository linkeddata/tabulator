// Joe Presbrey <presbrey@mit.edu>
// 2007/07/22
// WebDAV Client and Document Manager
//
// Example usage:
//
// <script type="text/javascript">
// var uri = 'http://localhost/dav/test.html';
// webdav.manager.register(uri, function(uri, success){});
// </script>
// <textarea onKeyUp="webdav.manager.set_data(uri, this.value)"></textarea>

webdav = new function() {
    var webdav = this;

    this.client = function(uri) {
        this.enabled = this.busy = false;
        this.uri = webdav._parse_uri(uri);
        if (this.uri && this.uri.base) {
            this.enabled = true;
        } else {
            alert('Invalid WebDAV URI:\n' + uri);
        }
    }

    this.client.prototype.OPTIONS = function(handler) {
        return this.request = this._request('OPTIONS', null, handler);
    }

    this.client.prototype.GET = function(handler) {
        return this.request = this._request('GET', null, handler);
    }

    this.client.prototype.PUT = function(data, handler) {
        return this.request = this._request('PUT', data, handler);
    }

    this.client.prototype._consistent_uri = function(uri) {
        check = uri.split(this.base);
        return uri.length == 0
            || uri[0] == '/'
            || (check.length == 2 && check[0].length == 0);
    }
    
    this.client.prototype._request = function(method, data, handler) {
        if (this.enabled) {
            this.busy = true;
            var req = webdav._request(method,
                                      this.uri.base + this.uri.path,
                                      this._request_handler(handler),
                                      this);
            req.send(data);
            return req;
        }
    }

    this.client.prototype._request_handler = function(handler) {
        return function(status, headers, body) {
            this.busy = false;
            handler.call(this, status, headers, body);
        }
    }
    
    this.manager = new function() {
        var manager = this;
        manager.documents = {};
    
        this.register = function(uri, callback) {
            var client = new webdav.client(uri);
            function register_OPTIONS(status, headers, body) {
                if (headers.allows('put')) {
                    manager.documents[uri] = {
                        callback: {},
                        client: client,
                        data: null,
                        data_is_new: false,
                        uri: uri,
                        _locks: [],
                        lock: function() {
                            var token = new function(){};
                            this._locks.push(token);
                            while (1) {
                                if (this._locks[0] == token)
                                    return token;
                            }
                        },
                        release: function(token) {
                            return token == this._locks.shift();
                        }
                    };
                    callback(uri, true);
                } else {
                    callback(uri, false);
                }
            }
            client.OPTIONS(register_OPTIONS);
        }
        
        this.editable = function(uri) {
            if (this.documents[uri]) {
                lock = this.documents[uri].lock();
                return this.documents[uri].client.enabled;
            }
            return null;
        }

        // polling
        this.set_data = function(uri, data, callback) {
            if (this.documents[uri]) {
                lock = this.documents[uri].lock();
                this.documents[uri].data = data;
                this.documents[uri].data_is_new = true;
                if (callback !== undefined)
                    this.documents[uri].callback[callback] = true;
                if (!this.documents[uri].release(lock))
                    alert('Locking error for URI:\n' + uri);
                return true;
            }
        }

        // asynchronous
        this.save_file = function(uri, data, callback) {
            if (this.documents[uri]) {
                this.documents[uri].data = data;
                while (this.documents[uri].client.busy);
                this.documents[uri].client.PUT(data, callback);
                return true;
            }
        }

        this._thread = function() {
            return (function() {
                for (uri in this.documents) {
                    doc = this.documents[uri];
                    lock = doc.lock();
                    if (doc.data_is_new && !doc.client.busy) {
                        doc.data_is_new = false;
                        doc.client.PUT(doc.data, function(status,headers,body){
                        });
                    }
                    if (!doc.release(lock))
                        alert('Locking error for URI:\n' + uri);
                }
            }).call(this);
        }

        //setInterval('webdav.manager._thread()', 5000);
    }();
    

    this._headers = function(headers) {
        var lines = headers.split('\n');
        var headers = {};
        for (var i=0; i < lines.length; i++) {
            var line = webdav._strip(lines[i]);
            if (line.length == 0) {
                continue;
            }
            var chunks = line.split(':');
            var hkey = webdav._strip(chunks.shift()).toLowerCase();
            var hval = webdav._strip(chunks.join(':'));
            if (headers[hkey] !== undefined) {
                headers[hkey].push(hval);
            } else {
                headers[hkey] = [hval];
            }
        }
        this.allows = function(method) {
            method = method.toUpperCase();
            var hasmethod = false;
            if (headers['allow']) {
                var allow = headers['allow'].join(',');
                allow = allow.split(',').map(webdav._strip);
                return allow.filter(function(x){return x == method}).length > 0;
            }
        }
        this.get = function(key) {
            if (headers[key]) {
                return headers[key].length==1 ? headers[key][0] : headers[key];
            }
        }
    }

    this._parse_uri = function(uri) {
        var chunks = uri.split('://');
        if (chunks[0] &&
            (chunks[0].toLowerCase() == "http"
             || chunks[0].toLowerCase() == "https")) {
            var uridata = {all:uri};
            uridata['protocol'] = (chunks.shift()).toLowerCase();
            chunks = chunks.join('://').split('/');
            var host = chunks.shift();
            if (host.split(':').length == 2) {
                uridata['port'] = host.split(':').pop();
                uridata['host'] = host.split(':').shift();
            } else {
                uridata['host'] = host;
            }
            uridata['path'] = '/' + chunks.join('/');
            if (uridata['port']) {
                uridata['base'] = uridata['protocol'] + '://' + uridata['host'] + ':' + uridata['port'];
            } else {
                uridata['base'] = uridata['protocol'] + '://' + uridata['host'];
            }
            return uridata;
        }
    }
    
    this._request = function(method, path, handler, client) {
        var isExtension = isExtension;
        if(isExtension == undefined || !isExtension) {
            try {
                Util.enablePrivilege("UniversalBrowserRead")
            } catch(e) {
                alert("Failed to get privileges: " + e)
            }
        }        
        var req = webdav._get_XmlHttpRequest();
        req.onreadystatechange = webdav._request_handler(handler, req, client);
        req.open(method, path, true);
        return req;
    }

    this._request_handler = function(handler, request, client) {
        return function() {
            if (request.readyState == 4) {
                var headers = new webdav._headers(request.getAllResponseHeaders());
                handler.call(client, request.status, headers, request.responseText);
            }
        }
    }

    this._strip = function(x) {
        return x.replace(/^\s+/, '').replace(/\s+$/, '');
    }

    this._get_XmlHttpRequest = function() {
        try{
            return new XMLHttpRequest();
        } catch(e) {
        }
        try {
            return new ActiveXObject('Microsoft.XMLHTTP');
        } catch(e) {
        }
        throw('XMLHttpRequest not found.');
    }

}();
