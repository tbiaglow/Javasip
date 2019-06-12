$(document).ready(function() {
    var beer = [];
    var location;
    var distance = 10; // nearby brewery distance
    var mapZoom = 10;
    var styleFilter = [];
    var lat;
    var long;
    var brewer;

    // Function that grabs latitude and longitude of user from ip address
    function ipLookUp () {
        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
        
        // If geolocation is accepted set map + nearby brewery search to the user's location
        function success(pos) {
            lat = pos.coords.latitude;
            long = pos.coords.longitude;
            localBrews()
        }
        
        // On error, set coordinates to New York
        function error(err) {
            lat = 40.8;
            long = -74;
            localBrews()
        }
          
        navigator.geolocation.getCurrentPosition(success, error, options);
    };
    ipLookUp()
    
    // Map zoom adj based on filter
    // Default zoom on load = 10
    $("#beer_search").click(function(){
        $('.error').css('display','none')
        // Reset map based on user input
        var search = $('#address-l1').val() + ' ' + $('#address-city').val() + ' ' + $('#address-state').val() + ' ' + $('#address-zip').val()

        $.ajax({ 
            url: 'https://api.mapbox.com/v4/geocode/mapbox.places/' + search + '.json?access_token=pk.eyJ1IjoicnlhbmNicm93biIsImEiOiJjandvZTJ2eGcwZGw3NGFueWVpdGZoeXMyIn0.bY5FsEL2jeX1XzOIAPT8NQ',
            method: 'GET'
        }).then(function(response){ 
            var address1 = $('#address-l1').val()
            var city = $('#address-city').val()
            var state = $('#address-state').val()
            var zip = $('#address-zip').val()


            if (address1 !== '' && (city === '' && state === '' && zip === '')) {
                $('.error').css('display','block')
                $('.error').html('Please add city, state or zip')
                 
            } else if ((address1 === '' && city === '' && state === '' && zip === '') || (address1 === '' && (city !== '' || state !== '' || zip !== '') || (address1 !== '' || city !== '' || state !== '' || zip !== ''))) {
                long = response.features[0].geometry.coordinates[0]
                lat = response.features[0].geometry.coordinates[1]

                if ($('#distance').val() !== null) {
                    distance = $('#distance').val()
                    var v = $('#distance').val()
    
                    if (v === '5' || v === '10') { 
                        mapZoom = 10
                    } else if (v === '25') { 
                        mapZoom = 8
                    } else if (v === '50' || v === '75') { 
                        mapZoom = 7
                    } else { 
                        mapZoom = 6
                    }
                }
                localBrews()
            }
        })
    });

    // On click grab the beer ids associated with brewer
    // Store the id so we can pull additional information from beer object.
    $(document).on('click','.b', function(){ 
        brewer = $(this).attr('data-brewery')
        $('#display').empty()
        $('.jumbotron').remove()
        $('#filter').remove()
        $('#filter-select').remove()

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
                    var div = $('<div>').attr({'data-id':response.id,'data-style':response.style}).addClass('beer')
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
            $('#display').append('<div id="blank"></div><div class="row bg-warning brewer-name"><h1>' + brewer + '</h1></div></div><hr>')
            $('#display').append('<div class="row"><div id="styles"><h2>Styles</h2></div></div>')
            $('#display').append('<div class="row" style="padding-left: 10px;"><div class="col-8"><h2>Beers (' + beer.length + ')</h2></div><div class="col-4">Social</div></div>')
            $('#styles').css('display','block')
            beerStyles()
        });
    });    

    // Build beer style filter
    function beerStyles(){
        styleFilter.forEach(function(style) {
            $('#styles').append('<button class="btn-primary filter-button btn-on">' + style + '</button> ')
        });
    }

    // Filter beers on button click
    $(document).on('click', '.filter-button', function(e){
        e.preventDefault()

        if ($(this).hasClass('btn-on')) { 
            // Add clear filter button
            $('#styles').append('<button class="btn-dark clear-filter">Clear Filter</button>')
            // Turn all buttons light grey
            // Grey implies that these options can no longer be selected
            $('.btn-on').removeClass('btn-on btn-primary').addClass('btn-light btn-off')
            // Clicked button remains blue
            $(this).removeClass('btn-light').addClass('btn-primary btn-clicked')
            
            // Hide beers that have a style mismatch with the selection
            $('.beer[data-style!="' + $(this).text() + '"]').css({'display':'none','background':''})
        } 
    })
    
    // Clear beers filter
    $(document).on('click', '.clear-filter', function(){
        // Show beers again
        $('.beer[data-style]').css('display','block')
        // Remove the clear filter button so beers can be filtered again
        $('.clear-filter').remove()
        // Make buttons blue again
        $('.filter-button').removeClass('btn-off btn-light').addClass('btn-primary btn-on')
    })
    
    // To be run on page load and whenever someone changes the search radius
    // Load nearby breweries and map them
    function localBrews() {
        $('#display').empty()
        $('#display').append('<h2>Nearby Breweries</h2>') 

        // Map 
        $.ajax({
            url: 'https://cors-anywhere.herokuapp.com/https://api.catalog.beer/location/nearby?latitude=' + lat + '&longitude=' + long + '&search_radius=' + distance, 
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
                var div = $('<div>').attr({'data-id':response.data[i].brewer.id,'data-brewery':response.data[i].brewer.name}).addClass('b')
                var address = $('<div>').addClass('brewer-address')
                var telephone = response.data[i].location.telephone.toString(); 

                // If phone is available, format and print
                if (response.data[i].location.telephone === 0) {
                    telephone = ''
                } else { 
                    telephone = '<br> Phone: ' + telephone.substr(0,3) + '-' + telephone.substr(3,3) + '-' + telephone.substr(6,9)
                }

                div.html(response.data[i].brewer.name)
                address.html('<div class="row"><div class="col">' + response.data[i].location.address.address2 + '<br>' + response.data[i].location.address.city + ', ' + response.data[i].location.address.state_short + ' ' + response.data[i].location.address.zip5 + telephone + '</div></div>')
                $('#display').append(div) 
                $(div).append(address) 
            }
            
            // Include Mapbox
            mapboxgl.accessToken = 'pk.eyJ1IjoicnlhbmNicm93biIsImEiOiJjandvZTJ2eGcwZGw3NGFueWVpdGZoeXMyIn0.bY5FsEL2jeX1XzOIAPT8NQ';
            var map = new mapboxgl.Map({
            container: 'map', // container id
            style: 'mapbox://styles/mapbox/streets-v11', 
            center: [long, lat], 
            zoom: mapZoom 
            
        });
            for (var i = 0; i < location.length; i++) {
                new mapboxgl.Marker()
                .setLngLat([location[i].longitude, location[i].latitude])
                .addTo(map);
            };
        }); 
    }

    // Create filter box that hides/reveals options on click
    $("#filter-show").on('click', function(){
        if ($('#filter').css('display') === 'none') {
            $('#filter').css('display','block')
            $('#filter-show').html('Hide Map Filter')
        } else {
            $('#filter').css('display','none')
            $('#filter-show').html('Show Map Filter')
        };
    });
});