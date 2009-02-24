/**
* Few General purpose utlity functions which has been used in the panes
* oshani@csail.mit.edu 
*/

// This is used to canonicalize an array
function unique(a){
   var r = new Array();
   o:for(var i = 0, n = a.length; i < n; i++){
      for(var x = 0, y = r.length; x < y; x++){
         if(r[x]==a[i]) continue o;
      }
      r[r.length] = a[i];
   }
   return r;
}
