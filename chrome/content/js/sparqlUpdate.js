// Joe Presbrey <presbrey@mit.edu>
// 2007-07-15

sparql = function(store) {
    this.store = store;
}

sparql.prototype.prepareUpdate = function(statement) {
    if (statement == undefined || statement.why == undefined) return;

    function contextToWhere(context) {
        return "WHERE { " + map(function(x){return x.toNT()},context).join("\n") + " }";
    }

    context = [];
    s = statement;
    while(1) {
        if (s.subject == undefined) break;
        s = this.store.statementsMatching(undefined,undefined,s.subject,statement.why);
        if (s == undefined || s.length == 0) break;
        if (s.length == 1) {
            context.push(s[0]);
        } else {
            // node is not uniquely identifiable
            // do some IFP magic but for now,
            break;
        }
    }

    return {
        statement: statement,
        statementNT: statement.toNT(),
        where: contextToWhere(context),

        setObject: function() {
            query = "MODIFY GRAPH " + this.statement.why.toNT() + "\n";
            query += "DELETE { " + this.statementNT + " }\n";
            query += "INSERT { " + this.statement.toNT() + " }\n"
            query += this.where;
            alert(query);
        }
    }
}