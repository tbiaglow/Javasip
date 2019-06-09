$(document).ready(function() {
    var beerStyle = [];
    var location;

    //TO DO: SET MAP TO USER'S COORDINATES ON PAGE LOAD 
    var lat = 40.7128;
    var long = -74.0060;

    // Catalog.beer API is structured from to grab Brewer object > Beer object
    // Must make multiple AJAX calls to pull detailed information on a specific beer
    // Call Brewer
    $("#beer_search").click(function(){
        $('#display').html('')
        // Call catalog.beer to grab breweries
        $.ajax({ 
            url: 'https://cors-anywhere.herokuapp.com/https://api.catalog.beer/brewer?count=5',
            headers: {
                // Convert key to Base64
                'Authorization': 'Basic ' + btoa('b9c7b5ed-85bf-1671-c158-c3a503963a90:\'\''),
                accept: 'application/json',
            },
            method: 'GET'
        }).then(function(response) {
            for (i = 0; i < response.data.length; i++) {
                // Push brewer id to data-name attribute to be used for onClick
                var div = $('<div>').attr('data-name',response.data[i].id).attr('id', 'b')
                div.html(response.data[i].name + "<br>")
                $('#display').append(div)
            };

            // On click grab the beer ids associated with brewer
            // Store the id so we can pull additional information from beer object.
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
                    for (var i = 0; i < response.data.length; i++) {
                        // Create an array that includes the beer id and style
                        // Beer id to be used in next call to api
                        beerStyle.push({'beerID':response.data[i].id,'beerStyle':response.data[i].style})
                    };
                    
                    // Call Beer
                    for (var i = 0; i < beerStyle.length; i++) {
                        $.ajax({
                            url: 'https://cors-anywhere.herokuapp.com/https://api.catalog.beer/beer/' + beerStyle[i].beerID, 
                            headers: {
                                // Convert key to Base64
                                'Authorization': 'Basic ' + btoa('b9c7b5ed-85bf-1671-c158-c3a503963a90:\'\''),
                                accept: 'application/json',
                            },
                            method: 'GET'
                        }).then(function(response){
                            // TO DO: SETUP FILTER OPTIONS
                            // NOTE: PRINTING TO PAGE FROM API CALL IS SLOW
                            if (response.style !== '') {
                                var div = $('<div>').attr('data-name',response.name)
                                // Print beer name + style to page
                                div.html('Name: ' + response.name + "<br>" + 'Style: ' + response.style + "<br>" + 'ABV: ' + response.abv + "%<br>" + 'IBU: ' + response.ibu + '<br><br>')
                                $('#display').append(div) 
                            };             
                        });
                    };
                });
            });    
        });
    });

    // Map 
    $.ajax({
        url: 'https://cors-anywhere.herokuapp.com/https://api.catalog.beer/location/nearby?latitude=' + lat + '&longitude=' + long + '&search_radius=10', 
        headers: {
            // Convert key to Base64
            'Authorization': 'Basic ' + btoa('b9c7b5ed-85bf-1671-c158-c3a503963a90:\'\''),
            accept: 'application/json',
        },
        method: 'GET'
    }).then(function(response) {
        console.log(response)
    
        $('#display').html('')

        location = [];
        for (var i = 0; i < response.data.length; i++) { 
            location.push({'id':response.data[i].brewer.id,'brewer':response.data[i].brewer.name,'latitude':response.data[i].location.latitude,'longitude':response.data[i].location.longitude})

            $('#display').append('<p>' + response.data[i].brewer.name + '<p>')  
        }
        console.log(location)
        
        // Include Mapbox
        mapboxgl.accessToken = 'pk.eyJ1IjoicnlhbmNicm93biIsImEiOiJjandvZTJ2eGcwZGw3NGFueWVpdGZoeXMyIn0.bY5FsEL2jeX1XzOIAPT8NQ';
        var mapboxClient = mapboxSdk({ accessToken: mapboxgl.accessToken });
        mapboxClient.geocoding.forwardGeocode({
            query: 'New York',
            autocomplete: false,
            limit: 1
        }).send().then(function (response) {
            if (response && response.body && response.body.features && response.body.features.length) {
                var feature = response.body.features[0];
                var map = new mapboxgl.Map({
                container: 'map',
                // style: 'mapbox://styles/mapbox/light-v9'
                style: 'mapbox://styles/mapbox/streets-v11',
                center: feature.center,
                zoom: 10
            });
                // Grab location of nearby breweries and add marker
                // Based on longitude and latitude
                for (var i = 0; i < location.length; i++) {
                    new mapboxgl.Marker()
                    .setLngLat([location[i].longitude, location[i].latitude])
                    .addTo(map);
                };
            } 
        });
    }); 

    // Create filter box that hides/reveals options on click
    $("#show-filter").on('click', function(){
        // console.log($('#filter').css('display'));
        if ($('#filter').css('display') === 'none'){
            $('#filter').css('display','block')
            $('#show-filter').html('Hide Filter')
        } else {
            $('#filter').css('display','none')
            $('#show-filter').html('Show Filter')
        };
    });
});
