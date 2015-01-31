(function( $ ){
    var options = {
    };

    var methods = {
        init: function() {
            methods.prepareEvents.apply($);
        },

        prepareEvents: function() {
            $('body').on('click', '.startek-action', function(e) {
                e.preventDefault();
                $(this).startekAccount('doAction')
            });
        },

        doAction: function() {
            if ( this.hasClass('save-search') )
                this.startekAccount('saveSearch');
            else if ( this.hasClass('publish-search') )
                this.startekAccount('publishSearch');
            else if ( this.hasClass('save-property') )
                this.startekAccount('saveProperty');
        },

        publishSearch: function() {
            var self = this;
            var params = {
                format: 'raw',
                task: 'propertyaction',
                action: 'search-publish',
                state: $(self).hasClass('published') ? 'true' : 'false',
            };
            $.getJSON('?', params, function(data) {
                if ( 'guest' in data )
                    return document.location = data.url;

                if ( params.state == 'true' )
                    $(self).removeClass('published');
                else
                    $(self).addClass('published');
            });
        },

        saveSearch: function() {
            var self = this;
            var params = {
                format: 'raw',
                task: 'propertyaction',
                action: 'search-add',
                state: 'false'
            };
            if ( $.fn.startekHelper('isMyAccount') ) {
                params.value = $(self).closest('[data-value]').data('value');
                params.state = 'true';
            }
            else {
                params.value = document.location.pathname;
                if ( document.__newLocation )
                    params.value = document.__newLocation.replace(document.location.origin, '');
            }
            $.getJSON('?', params, function(data) {
                if ( 'guest' in data )
                    return document.location = data.url;
                if ( $.fn.startekHelper('isMyAccount') ) {
                    $(self).closest('[data-value]').hide();
                } else {
                    $('.save-search').addClass('saved');
                }
            });
        },

        saveProperty: function() {
            var self = this;
            var wrapper = $(this).closest('[data-property-id]');
            var params = {
                format: 'raw',
                task: 'propertyaction',
                action: 'property-add',
                value: wrapper.data('property-id'),
                state: wrapper.hasClass('saved') ? 'true' : 'false'
            };
            $.getJSON('?', params, function(data) {
                if ( 'guest' in data )
                    return document.location = data.url;

                if ( $.fn.startekHelper('isMyAccount') ) {
                    wrapper.hide();

                    // my account  might also show a map (Sandfords). Remove the map marker
                    if ( !window.markers )
                        return;

                    if ( !markers.hasOwnProperty('p'+params.value) )
                        return;

                    if ( ib )
                        ib.close();
                    markers['p'+params.value].setMap(null);
                    markers['p'+params.value] = undefined;
                } else {
                    if ( params.state == 'true' ) {
                        $(wrapper).removeClass('saved');
                        $(self).removeClass('saved');
                        if ( !data.count )
                            $('body').removeClass('saved');
                    }
                    else {
                        $(wrapper).addClass('saved');
                        $(self).addClass('saved');
                        $('body').addClass('saved');
                    }
                }
            });
        },

    };

    $.fn.startekAccount = function( method ) {
        this.options = options;
        // Method calling logic
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.startekaccount' );
        }
    };
    $.fn.startekAccount();
}( jQuery ));
