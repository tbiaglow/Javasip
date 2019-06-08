$(document).ready(function() {
    $("#beer_search").click(function(){
        $.ajax({ 
            url: 'https://cors-anywhere.herokuapp.com/https://api.catalog.beer/brewer',
            headers: {
                // Convert key to Base64
                'Authorization': 'Basic ' + btoa('b9c7b5ed-85bf-1671-c158-c3a503963a90:\'\''),
                accept: 'application/json',
            },
            method: 'GET'
        }).then(function(response) {
            //console.log(response)
            var beerIds = [];

            for (i = 0; i < response.data.length; i++) {
                var div = $('<div>').attr('data-name',response.data[i].id).attr('id', 'b')
                //console.log(response)
                // Store id and name in beerIds array
                beerIds.push({'id':response.data[i].id,'name':response.data[i].name})
                div.html(response.data[i].name + "<br>")
                $('#display').append(div)
    
            }

            $(document).on('click','#b', function(){ 
                $('#display').html('')
                var brewerUrl = $(this).attr('data-name')
                $.ajax({
                    url: 'https://cors-anywhere.herokuapp.com/https://api.catalog.beer/brewer/' + brewerUrl + '/beer', 
                    headers: {
                        // Convert key to Base64
                        'Authorization': 'Basic ' + btoa('b9c7b5ed-85bf-1671-c158-c3a503963a90:\'\''),
                        accept: 'application/json',
                    },
                    method: 'GET'
                }).then(function(response) {
                    console.log(response.data)
                    for (i = 0; i < response.data.length; i++) {
                        var div = $('<div>').attr('data-name',response.data[i].name)
                        
                        div.html('Name: ' + response.data[i].name + "<br>" + 'Style: ' + response.data[i].style + '<br><br>')
                        $('#display').append(div)
                    }
                })
            });
            
        });
    })
    $("#show-filter").on('click', function(){
        // console.log($('#filter').css('display'));
        if ($('#filter').css('display') === 'none'){
            $('#filter').css('display','block')
            $('#show-filter').html('hide filter')
        } else {
            $('#filter').css('display','none')
            $('#show-filter').html('show filter')
        }
    })
});
