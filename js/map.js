var markers = {};
var ib;
var starTekMap = function (defaultLocation, defaultZoom) {
            var map, 
            geocoder, 
            lastBounds,
            markerClusterer, 
            overlay, 
            xOffset, 
            yOffset, 
            curOffset;
    starTekMap.mapType = 'default';
    starTekMap.lastMapType = 'default';
    starTekMap.firstLoad = true;

    // onload function
    function prepareInitResults () {
        map = ''; 
        geocoder = ''; 
        markers = {}; 
        markerClusterer = ''; 
        overlay = ''; 
        xOffset = ''; 
        yOffset = ''; 
        curOffset ='';

        if (jQuery(window).width() > 670) {
            boxWidth = "400px";
            xOffset = 35;
            yOffset = 35;
            curOffset = 'lg';
        }
        else {
            boxWidth = "250px";
            xOffset = 10;
            yOffset = 10;
            curOffset = 'sm';
        }

        initResultsMap(xOffset, yOffset, boxWidth);
    }   

    function initResultsMap(xOffset, yOffset, boxWidth) {
        geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address':defaultLocation}, function(results, status) {
            if ( status == google.maps.GeocoderStatus.OK ) {
                buildMap(results[0].geometry.location, xOffset, yOffset, boxWidth);
            }
            else {
                console.log('Unable to geocode the map center');
            }
        });
    }

    var isLoaded = false;
    var hasLoaded = false;
    var searchedBounds = [];

    starTekMap.getProperties = function() {
        if ( window.getCustomProperties && (properties = getCustomProperties()) )
            return starTekMap.refreshCluster(properties);

        if ( window.drawingManager )
            return;

        var currentBounds = map.getBounds();
        if ( !currentBounds )
            return;

        var mapTypeChanged = starTekMap.lastMapType != starTekMap.mapType;
        starTekMap.lastMapType = starTekMap.mapType;
        if ( currentBounds == lastBounds && !mapTypeChanged )
            return;

        lastBounds = currentBounds;
        var url = document.location.href + (document.location.search.length ? '&' : '?');
        if ( window.getCustomMapUrl && getCustomMapUrl() )
            url = getCustomMapUrl();
            //When map comes under pagination it showing error
            //http://www.goandco.co.uk/developments/new-homes-developments/new-homes-of-properties-in-london/page-2
            //Removing by page and count its works fine	
            url = url.replace(/page-[0-9]/i,'');
        var post = {format: 'json', layout: 'map'};
        if ( !jQuery.fn.startekHelper('isMyAccount') )
            post['bounds'] = currentBounds+'';

        // have we cached this one?
        var searchIndex = url+JSON.stringify(post);
        if ( searchedBounds[searchIndex] )
            return starTekMap.refreshCluster(searchedBounds[searchIndex]);

        jQuery.getJSON(url, post, function(data) {
            searchedBounds[searchIndex] = data;
            // limit saved results to 5
            while ( searchedBounds.length > 5 )
                searchedBounds.shift();
            starTekMap.refreshCluster(data);
        });
    }

    starTekMap.refreshCluster = function(list) {
        var bounds = new google.maps.LatLngBounds();
        var newKeys = [];
        for (var key in list) {
            var item = {};
            var property = list[key];
            property.ref = 'p'+property.id;

            // Should never happen, StarTek should be filtering these results out earlier in the process
            if ( property.latitude == 0 || property.longitude == 0)
                continue;

            property.gmapLatLng = new google.maps.LatLng(property.latitude,property.longitude);
            bounds.extend(property.gmapLatLng);
            newKeys.push(property.ref);

            // this marker is already on the map, ignore it and carry on
            if ( markers.hasOwnProperty(property.ref) && markers[property.ref] )
                continue;

            buildMarker(property);
        }

        // remove old makers
        for ( key in markers ) {
            if ( markers[key] === undefined )
                continue;
            if ( -1 == jQuery.inArray(key, newKeys) ) {
                markers[key].setMap(null);
                markers[key] = undefined;
            }
        }

        if ( starTekMap.firstLoad && (starTekMap.fitBounds || jQuery.fn.startekHelper('isMyAccount')) )
            map.fitBounds(bounds);
        starTekMap.firstLoad = false;
    }

    function buildMap(mapCenter, xOffset, yOffset) {
        var myOptions = {
            zoom: 14,
            center: mapCenter,
            mapTypeControl: false,
            scrollwheel: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        if ( defaultZoom )
            myOptions.zoom = defaultZoom;

        if ( jQuery('#map_canvas').height() == 0 )
            jQuery('#map_canvas').height('400px');

        map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
        jQuery('#map_canvas').data('map', map);

        var boxText = '<div></div>';
        var myOptions = {
            content: boxText,
            disableAutoPan: false,
            maxWidth: 0,
            alignBottom: true,
            pixelOffset: new google.maps.Size(45, 40),
            zIndex: null,
            boxClass: "StarTekMapOverlay",
            boxStyle: {
              opacity: 1,
              width: boxWidth
            },
            closeBoxMargin: "15px 13px 2px 2px",
            closeBoxURL: '/images/info-close.gif',
            infoBoxClearance: new google.maps.Size(xOffset, yOffset),
            pane: "floatPane",
            enableEventPropagation: false
        };
        ib = new InfoBox(myOptions);

        google.maps.event.addListener(map, 'idle', function(e) {
            starTekMap.getProperties();
        });
    }

    function buildMarker(item) {
        var marker = new google.maps.Marker({
            position: item.gmapLatLng,
            map: map,
            draggable: false,
            animation: google.maps.Animation.DROP
        });
        if ( !window.__noMarkers ) {
            marker.setIcon('/images/Map_marker.png');
        }
        if ( (window.__getMapMarkerIcon) && (m = window.__getMapMarkerIcon(item)) )
            marker.setIcon(m);
        markers[item.ref] = marker;

        var boxText = document.createElement("div");
        if ( item.infobox )
            boxText.innerHTML = item.infobox;

        google.maps.event.addListener(marker, "click", function () {
            that = this;
            ib.setContent(boxText);
            if ( !item.infobox ) {
                url = item.url+'?tmpl=component&layout=infobox';
                jQuery.get(url, function(responseText) { 
                    var result = jQuery('<div>').append(jQuery.parseHTML(responseText));
                    var infoboxContents = result.find('#infoBox');
                    boxText.innerHTML = infoboxContents.html();
                    ib.open(map, that);
                });
            }
            else {
                ib.open(map, that);
            }
        });

        var center;
        google.maps.event.addDomListener(map, "idle", function() {
            center = map.getCenter();
        });

        // To Do: Test to see if function exists first to avoid error on break point resize
        jQuery(window).resize(function() {
            if ( (jQuery(window).width() <= 670) && (curOffset == 'lg') ) {
                prepareInitResults();
            } else if ( (jQuery(window).width() > 670) && (curOffset == 'sm') ) {
                prepareInitResults();
            }
            map.setCenter(center);
        });
    }

    jQuery(document).ready(function() {
        prepareInitResults();
    }); 
};
