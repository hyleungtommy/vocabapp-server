var util = {}

util.formatJSON = function(items){
    var formatItems = items.map(function(element){
        for(var property in element){
            if(element[property].hasOwnProperty("S"))
                element[property] = element[property].S
            else if(element[property].hasOwnProperty("N"))
            element[property] = element[property].N
        }
        return element
    });
    return formatItems;
}

module.exports = util