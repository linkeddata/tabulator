function StatusWidget() {
    this.ele = document.getElementById('tabulator-source-count')
    this.pend = []
    this.errors = {}
    var sw = this;
    tabulator.statusWidget = sw;

    this.recv = function (uri) {
	sw.pend.push(uri);
	sw.update()
	return true
    }

    this.quit = function (uri) {
	sw.pend=sw.pend.filter(function(x) { x != uri; });
	sw.update()
	return true
    }

    this.update = function () {
        if(sw.pend.length==0)
          sw.ele.setAttribute('style','display:none');
        else
          sw.ele.setAttribute('style','display:block');
	sw.ele.label = "Data Sources Pending: "+sw.pend.length;
	return true
    }

    sf.addCallback('request',this.recv)
    sf.addCallback('fail',this.quit)
    sf.addCallback('done',this.quit)
}