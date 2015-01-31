(function( $ ){


	var bIsMyAccount = false;
    var options = {
            bubbleErrors: true
        };

	var methods = {
		init : function() { 
            $(document).on('blur', ':input.required', function(e) { $.fn.startekHelper('validateField', $(this)); });
            $(document).on('focus', ':input.required', function(e) { $(this).data('did-focus', 1); });
            $('form').on('submit', function(e) {
                if ('form-vendor' === this.id) { return false; } // Vendor Form is handled separately
                // If there is an error, prevent the form from being submitted
                if ( !$.fn.startekHelper('canSubmitForm', $(this)) )
                    return false;
                if ( $(this).hasClass('ajax') ) {
                    $.fn.startekHelper('submitForm', $(this));
                    return false;
                }
                return true;
            });
		},

		dev_dump: function() {
			if ( $(this).startekHelper('isDeveloper') )
				console.log.apply(this, arguments);
		},

        _getSystemMessage: function(data) {
            var element = $('#system-message dd li', data);
            if ( !element.length ) {
                element = $('#system-message', data);
            }
            $.fn.startekHelper('dev_dump', 'System message', element);
            return element;
        },

        // Track the form's Submit Events ...
        trackFormSubmitEvents: function() {
            var formResponse =   $('#form-response div.alert-message').attr('class');
            // console.log(formResponse);
            if ( formResponse ) {
                if ( getPathParts()[2] == 'request-a-valuation' ) {
                    trackEvent('Request a Valuation', 'Submit', 'Request a Valuation');
                }
                else if ( getPathParts()[2] == 'enquiries' ) {
                    trackEvent('Make an Enquiry', 'Submit', 'Make an Enquiry');
                }
                if ( $('.book-form').css('display') == 'none' ) {
                    var propertyID = $('.book-form input[name=id]').val();
                    trackEvent('Book a Viewing', 'Submit', propertyID);
                }
            }
        },

        submitForm: function(form) {
            $(form).addClass('submitting');
            $.post('/index.php?tmpl=component', $(':input', form).serialize(), function(data) {
                $(form).removeClass('submitting').addClass('submitted');
                var sysMessage = $.fn.startekHelper('_getSystemMessage', data).get(0).innerHTML;

                var isError = sysMessage.match(/^Error/);
                var dialogClassName = isError ? 'dialog-alert' : 'dialog-message';
                var dialogTitle = isError ? 'Alert' : 'Success';

                if ( !isError ) {
                    $('textarea, input[type=text]', form).each(function() {
                        $(this).val('');
                    });
                }

                if ( form.data('callback') ) {
                    $.fn.startekHelper('trackFormSubmitEvents');
                    var callbackFunction = form.data('callback');
                    if ( window[callbackFunction] ) {
                        // if the return from the function is true, don't do anything else
                        if ( window[callbackFunction](isError, sysMessage, dialogClassName, dialogTitle) )
                            return;
                        // if the return was false, continue with normal processing
                    }
                }

                if ( form.data('message-element') ) {
                    $.fn.startekHelper('trackFormSubmitEvents');
                    var elemSelector = form.data('message-element');
                    $(elemSelector).html(sysMessage);
                    $('html,body').animate({scrollTop: $(elemSelector).offset().top-20}, '500');
                }
                else {
                    $('<div />').html('<p>'+sysMessage+'</p>').confirmation({
                        'title': dialogTitle,
                        'dialogClass': dialogClassName
                    });
                }
            });
        },

        canSubmitForm: function(form) {
            var canSubmit = true;
            var canSubmitThis;
            $(':input.required', form).each(function() {
                canSubmitThis = $.fn.startekHelper('validateField', $(this), true);
                canSubmit *= canSubmitThis;
            });
            if ( !canSubmit ) {
                if ( !$(form).hasClass('no-alert') )
                    alert('The highlighted fields are required');
                return false;
            }
            return true;
        },

        validateField: function(formField, ignoreFocus) {
            // Seems like fields loose focus on page load, so we need to check they have ever been in focus
            if ( !formField.data('did-focus') && !ignoreFocus )
                return false;
            // If it has already been detected and marked with the correct state, return
            if ( formField.val() && !formField.hasClass('error') )
                return true;
            if ( !formField.val() && formField.hasClass('error') )
                return false;

            var parentObj= formField.parents('form');
            if ( parentObj.data('form-parent') )
                parentObj = formField.parents($(parentObj.data('form-parent')));
            // When we use parentsUntil later on, it does not include this element, so we need to go one further.
            parentObjects = formField.parentsUntil(parentObj, 'div,form');
            parentObjects = parentObjects.add(parentObj);

            if ( formField.val() ) {
                if ( this.options.bubbleErrors ) {
                    parentObjects.each(function() {
                        var errorCount = $(this).data('error-count');
                        if ( !errorCount ) {
                            $.fn.startekHelper('dev_dump', 'Error: error-count is empty', errorCount);
                            errorCount = 1;
                        }
                        errorCount--;
                        $(this).data('error-count', errorCount);
                        if ( !errorCount ) {
                            $(this).removeClass('error');
                        }
                    });
                }
                formField.removeClass('error');
                return true;
            }
            else {
                if ( this.options.bubbleErrors ) {
                    parentObjects.each(function() {
                        var errorCount = $(this).data('error-count');
                        if ( !errorCount )
                            errorCount = 0;
                        errorCount++;
                        $(this).addClass('error').data('error-count', errorCount);
                    });
                }
                formField.addClass('error');
                return false;
            }
        },

		isMyAccount : function(bIsMyAcc) {
			if ( typeof bIsMyAcc != 'undefined' )
				bIsMyAccount = bIsMyAcc;
			return  bIsMyAccount;
		},

		isDeveloper : function() {
			return navigator.userAgent.match(/Starberry\/StarTek$/);
		}
	};

	$.fn.startekHelper = function( method ) {
        this.options = options;
		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
		}
	};
    $.fn.startekHelper();
})( jQuery );

