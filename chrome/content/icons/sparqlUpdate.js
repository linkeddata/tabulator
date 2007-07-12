// Joe Presbrey <presbrey@mit.edu>
// 2007-07-15

sparql = function(store) {
    this.store = store;
}

sparql.prototype.prepareUpdate = function(statement) {
    if (statement == undefined || statement.why == undefined) return;

    function contextToWhere(context) {
        return (context == undefined || context.length == 0)
            ? ""
            : "WHERE { " + map(function(x){return x.toNT()},context).join("\n") + " }";
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
        statement: [statement.subject, statement.predicate, statement.object, statement.why],
        statementNT: statement.toNT(),
        where: contextToWhere(context),

        setObject: function(obj) {
            query = "MODIFY GRAPH " + this.statement[3].toNT() + "\n";
            query += "DELETE { " + this.statementNT + " }\n";
            query += "INSERT { " + this.statement[0].toNT() + " " + this.statement[1].toNT() + " " + obj.toNT() + " " + " . }\n";
            query += this.where;
            alert(query);
        }
    }
}