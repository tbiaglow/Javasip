$(document).ready(function() {
    var beer = [];
    var location;
    var radius = 10;
    var mapZoom = 10;
    var styleFilter = [];

    //TO DO: SET MAP TO USER'S COORDINATES ON PAGE LOAD 
    var lat = 40.7128;
    var long = -74.0060;

    // Map adj based on filter
    $("#beer_search").click(function(){
        
        // If the user changes the search radius in the filter send new list of breweries available
        if ($('#radius').val() !== null) {
            radius = $('#radius').val()
            var v = $('#radius').val()

            if (v === '5' || v === '10') { 
                mapZoom = 10
            } else if (v === '25') { 
                mapZoom = 8
            } else if (v === '50' || v === '75') { 
                mapZoom = 7
            } else { 
                mapZoom = 6
            }
            localBrews()
        }
    });

    // On click grab the beer ids associated with brewer
    // Store the id so we can pull additional information from beer object.
    $(document).on('click','.b', function(){ 
        $('#display').html('')

        var brewerUrl = $(this).attr('data-id')
        $.ajax({
            url: 'https://cors-anywhere.herokuapp.com/https://api.catalog.beer/brewer/' + brewerUrl + '/beer', 
            headers: {
                // Convert key to Base64
                'Authorization': 'Basic ' + btoa('b9c7b5ed-85bf-1671-c158-c3a503963a90:\'\''),
                accept: 'application/json',
            },
            method: 'GET'
        }).then(function(response) {
            beer = [];
            for (var i = 0; i < response.data.length; i++) {
                // Create an array that includes the beer id and style
                // Beer id to be used in next call to api
                beer.push({'beerID':response.data[i].id,'beerStyle':response.data[i].style})

                if (styleFilter.indexOf(response.data[i].style) === -1) { 
                    styleFilter.push(response.data[i].style)
                }
            };
            
            $('#display').append('<div class="row"><div id="styles"><h2>Styles</h2></div></div>')
            $('#display').append('<div class="row" style="padding-left:10px;"><div class="col-8"><h2>Beers</h2></div><div class="col-4">Social</div></div>')
            $('#styles').css('display','block')

            // Call Beer
            for (var b = 0; b < beer.length; b++) {
                $.ajax({
                    url: 'https://cors-anywhere.herokuapp.com/https://api.catalog.beer/beer/' + beer[b].beerID, 
                    headers: {
                        // Convert key to Base64
                        'Authorization': 'Basic ' + btoa('b9c7b5ed-85bf-1671-c158-c3a503963a90:\'\''),
                        accept: 'application/json',
                    },
                    method: 'GET'
                }).then(function(response){
                    var div = $('<div>').attr('data-id',response.id).addClass('beer')
                    var row = $('<div>').attr('id','beer-row').addClass('row')
                    var left = $('<div>').attr('id','beer-left').addClass('col-8')
                    var right = $('<div>').attr('id','beer-right').addClass('col-4')
                    // Print beer name + style to page
                    div.html('Name: ' + response.name + "<br>" + 'Style: ' + response.style + "<br>" + 'ABV: ' + response.abv + "%<br>" + 'IBU: ' + response.ibu)
                    $('#display').append(row)
                    $('#beer-row').append(left)
                    $('#beer-row').append(right)
                    $('#beer-left').append(div)
                });
            };
            beerStyles()
        });
    });    

    function beerStyles(){
        styleFilter.forEach(function(style) {
            $('#styles').append('<button class="btn-primary filter-button">' + style + '</button> ')

        });
    }

    // To be run on page load and whenever someone changes the search radius
    // Load nearby breweries and map them
    function localBrews() {
        $('#display').html('')
        $('#display').append('<h2>Nearby Breweries</h2>') 

        // Map 
        $.ajax({
            url: 'https://cors-anywhere.herokuapp.com/https://api.catalog.beer/location/nearby?latitude=' + lat + '&longitude=' + long + '&search_radius=' + radius, 
            headers: {
                // Convert key to Base64
                'Authorization': 'Basic ' + btoa('b9c7b5ed-85bf-1671-c158-c3a503963a90:\'\''),
                accept: 'application/json',
            },
            method: 'GET'
        }).then(function(response) {
            location = [];
            for (var i = 0; i < response.data.length; i++) { 
                location.push({'id':response.data[i].brewer.id,'brewer':response.data[i].brewer.name,'latitude':response.data[i].location.latitude,'longitude':response.data[i].location.longitude})
                var div = $('<div>').attr('data-id',response.data[i].brewer.id).addClass('b')
                var address = $('<div>').addClass('brewer-address')
                div.html(response.data[i].brewer.name)
                address.html('<div class="row"><div class="col">' + response.data[i].location.address.address2 + '<br>' + response.data[i].location.address.city + ', ' + response.data[i].location.address.state_short + ' ' + response.data[i].location.address.zip5 + '</div></div>')
                
                $('#display').append(div) 
                $('#display').append(address) 
            }
            
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
                    zoom: mapZoom
                });
                    // map.scrollZoom.disable();
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
    }
    localBrews()

    // Create filter box that hides/reveals options on click
    $("#show-filter").on('click', function(){
        // console.log($('#filter').css('display'));
        if ($('#filter').css('display') !== 'none'){
            $('#filter').css('display','none')
            $('#show-filter').html('Show Filter')
        } else {
            $('#filter').css('display','block')
            $('#show-filter').html('Hide Filter')
        };
    });



    //  age verification 
    
        $('#age-check').on('click', function(event){

        // scope
        
        var day = $("#day").val();
        var month = $("#month").val();
        var year = $("#year").val();
        var birthDate = new Date(month, day, year)
        var today = new Date();
        console.log(today)
        var result = Math.abs(birthDate - today);
        console.log(result)
        var minAge = 21;

        console.log(day, month , year)
        console.log(result)

        if ($('#month').val() < 13 && $('#month').val() > 0){
               
        } else {
               
        }
        if ($('#day').val() < 32 && $('day').val() > 0){
               
        } else {
               
        }
           event.preventDefault()
           console.log(result)
        })
    });