$(document).ready(function() {
    $("#beer_search").click(function(){
        $.ajax({ 
            url: 'https://cors-anywhere.herokuapp.com/https://api.catalog.beer/beer',
            headers: {
                // Convert key to Base64
                'Authorization': 'Basic ' + btoa('b9c7b5ed-85bf-1671-c158-c3a503963a90:\'\''),
                accept: 'application/json',
            },
            method: 'GET'
        }).then(function(response) {
            console.log(response)
            var beerIds = [];

            for (i = 0; i < response.data.length; i++) {
                var div = $('<div>').attr('data-name',response.data[i].id)
                // Store id and name in beerIds array
                beerIds.push({'id':response.data[i].id,'name':response.data[i].name})
                div.html(response.data[i].name + "<br>")
                $('#display').append(div)
                console.log(beerIds[i].id)
            }
            
        });
    })
});