var util = {}

util.formatJSON = function(items){
    var formatItems = items.map(function(element){
        for(var property in element){
            element[property] = element[property].S
        }
        return element
    });
    return formatItems;
}

module.exports = util