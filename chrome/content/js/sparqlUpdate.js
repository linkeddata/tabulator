// Joe Presbrey, <presbrey@mit.edu>
// 2007-07-15

sparql = function(store) {
    this.store = store;
}

sparql.prototype.updateStatement = function(statement) {
    return {
        statement : statement,
        store : this.store,

        setObject : function(object) {
            //alert(this.statement.object + ' -> ' + object);
            return true;
        }
    }
}