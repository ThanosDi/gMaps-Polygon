function tamingselect()
{
	if(!document.getElementById && !document.createTextNode){return;}
	
// Classes for the link and the visible dropdown
	var ts_selectclass='turnintodropdown'; 	// class to identify selects
	var ts_listclass='turnintoselect';		// class to identify ULs
	var ts_boxclass='selectdropcontainer'; 		// parent element
	var ts_triggeron='activetrigger'; 		// class for the active trigger link
	var ts_triggeroff='trigger';			// class for the inactive trigger link
	var ts_dropdownclosed='dropdownhidden'; // closed dropdown
	var ts_dropdownopen='dropdownvisible';	// open dropdown
/*
	Turn all selects into DOM dropdowns
*/
	var count=0;
	var toreplace=new Array();
	var sels=document.getElementsByTagName('select');
	for(var i=0;i<sels.length;i++){
		if (ts_check(sels[i],ts_selectclass))
		{
			var hiddenfield=document.createElement('input');
			hiddenfield.name=sels[i].name;
			hiddenfield.type='hidden';
			hiddenfield.id=sels[i].id;
			hiddenfield.value=sels[i].options[sels[i].selectedIndex].value;
			sels[i].parentNode.insertBefore(hiddenfield,sels[i])
			var trigger=document.createElement('a');
			ts_addclass(trigger,ts_triggeroff);
			trigger.href='#';
			trigger.onclick=function(){
				ts_swapclass(this,ts_triggeroff,ts_triggeron)
				ts_swapclass(this.parentNode.getElementsByTagName('ul')[0],ts_dropdownclosed,ts_dropdownopen);
				return false;
			}
			trigger.appendChild(document.createTextNode(sels[i].options[sels[i].selectedIndex].text));
			sels[i].parentNode.insertBefore(trigger,sels[i]);
			var replaceUL=document.createElement('ul');
			for(var j=0;j<sels[i].getElementsByTagName('option').length;j++)
			{
				var newli=document.createElement('li');
				var newa=document.createElement('a');
				newli.v=sels[i].getElementsByTagName('option')[j].value;
				newli.elm=hiddenfield;
				newli.istrigger=trigger;
				newa.href='#';
				newa.appendChild(document.createTextNode(
				sels[i].getElementsByTagName('option')[j].text));
				newli.onclick=function(){ 
					this.elm.value=this.v;
					ts_swapclass(this.istrigger,ts_triggeron,ts_triggeroff);
					ts_swapclass(this.parentNode,ts_dropdownopen,ts_dropdownclosed)
					this.istrigger.firstChild.nodeValue=this.firstChild.firstChild.nodeValue;
					return false;
				}
				newli.appendChild(newa);
				replaceUL.appendChild(newli);
			}
			ts_addclass(replaceUL,ts_dropdownclosed);
			var div=document.createElement('div');
			div.appendChild(replaceUL);
			ts_addclass(div,ts_boxclass);
			sels[i].parentNode.insertBefore(div,sels[i])
			toreplace[count]=sels[i];
			count++;
		}
	}
	
/*
	Turn all ULs with the class defined above into dropdown navigations
*/	

	var uls=document.getElementsByTagName('ul');
	for(var i=0;i<uls.length;i++)
	{
		if(ts_check(uls[i],ts_listclass))
		{
			var newform=document.createElement('form');
			var newselect=document.createElement('select');
			for(j=0;j<uls[i].getElementsByTagName('a').length;j++)
			{
				var newopt=document.createElement('option');
				newopt.value=uls[i].getElementsByTagName('a')[j].href;	
				newopt.appendChild(document.createTextNode(uls[i].getElementsByTagName('a')[j].innerHTML));	
				//newselect.appendChild(newopt);
			}
			newselect.onchange=function()
			{
				window.location=this.options[this.selectedIndex].value;
			}
			newform.appendChild(newselect);
			uls[i].parentNode.insertBefore(newform,uls[i]);
			toreplace[count]=uls[i];
			count++;
		}
	}
	for(i=0;i<count;i++){
		toreplace[i].parentNode.removeChild(toreplace[i]);
	}
	function ts_check(o,c)
	{
	 	return new RegExp('\\b'+c+'\\b').test(o.className);
	}
	function ts_swapclass(o,c1,c2)
	{
		var cn=o.className
		o.className=!ts_check(o,c1)?cn.replace(c2,c1):cn.replace(c1,c2);
	}
	function ts_addclass(o,c)
	{
		if(!ts_check(o,c)){o.className+=o.className==''?c:' '+c;}
	}
}

window.onload=function()
{
	tamingselect();
	// add more functions if necessary
}


// For menu selection
jQuery(function($){
        $('#option1').click(function(){
                $('#searchsale').css('display','block');
                        $('#searchsale select').each(function() {
                                $this = $(this);
                                $this.attr('disabled',false);
                                var currentName = $this.attr('name');
                                $this.attr('name', currentName.replace(/hidden/, ''));
                        });

                        $('#searchrent').css('display','none');
                        $('#searchrent select').each(function() {
                                $this = $(this);
                                $this.attr('disabled',true);
                                var currentName = $this.attr('name');
                                $this.attr('name', currentName+'hidden');
                        });
         });
        $('#option2').click(function(){

                                $('#searchrent').css('display','block');
                                $('#searchrent select').each(function() {
                                        $this = $(this);
                                        $this.attr('disabled',false);
                                        var currentName = $this.attr('name');
                                        $this.attr('name', currentName.replace(/hidden/, ''));
                                });

                                $('#searchsale').css('display','none');
                                $('#searchsale select').each(function() {
                                        $this = $(this);
                                        $this.attr('disabled',true);
                                        var currentName = $this.attr('name');
                                        $this.attr('name', currentName+'hidden');
                                });

                });
//Google form track events
var getPathParts = function() {
                var pathParts = '';
                pathParts = window.location.pathname.split('/');
                return pathParts;
            };

var _isDesktopOrMobile = 'Desktop'; // Default value
var isDesktopOrMobile = function() {
                var windowWidth = Math.max( $(window).width(), window.innerWidth );
                // Check for Screen width for Mobile ...
                if (parseInt(windowWidth, 10) <= 820) {
                    // ... and change Default value to 'Mobile'
                    _isDesktopOrMobile = 'Mobile';
                }
                return _isDesktopOrMobile;
            };
var trackEvent = function(categoryStr, action, label) {
                var category = isDesktopOrMobile() + ' - ' + categoryStr;
                if (ga) {
                    ga('send', 'event', category, action, label);
                }
            };
var sysMessageDone = $('#system-message').length > 0;

//Vluation Form
	if (getPathParts()[1] == 'sales-valuation') {
	      trackEvent('Valuation Request', 'Open - step one', 'Valuation Request');
	   }
	
	if(getPathParts()[1] == 'valuation-step-2'){
	     if (sysMessageDone) {
                  trackEvent('Valuation Request Step two', 'Submit', 'Valuation Request');
              }else{
		trackEvent('Valuation Request Step two', 'Open - step two', 'Valuation Request');
	      }
	 }

//Office Contact us
 	if (getPathParts()[1] == 'general-enquiries-contact-us') {
	    var Office = $('#content strong').html();
	    if (sysMessageDone) {
                  trackEvent('General Enquiries / Contact US', 'Submit', 'Office');
              }else {
	 	   trackEvent('General Enquiries / Contact US', 'Open', Office);	
		}
		

	}
//Book a Viewing
	if (getPathParts()[3] == 'bookaviewing') {
		var propertyId = 'Property';
		 propertyId = $( "input[name='id']" ).val();
  	    if (!sysMessageDone) {
		trackEvent('Book a viewing', 'Open', propertyId);
		}
		$("input[vlue='Submit']" ).click(function() {
		  trackEvent('Book a viewing', 'Submit', propertyId);
		});
	   $("input[value='Submit']").click(function(){
		if($("input[name='postcode']").val()== 'sw6' ) {
		 $("#system-message-container").append('<img src="http://adserver.adtech.de/pcsale/3.0/944/0/0/0/BeaconId=20385;rettype=img;subnid=1;SalesValue=[AmountInCent];;custom1=[Sign Up ]" width="1" height"1">');
	    }
	  });
	}
//Send to a friend
	 if (getPathParts()[3] == 'sendtofriend') {
                var propertyId = 'Property';
                 propertyId = $( "input[name='id']" ).val();
            if (!sysMessageDone) {
                trackEvent('Send to friend', 'Open', propertyId);
                }
                $("input[vlue='Submit']" ).click(function() {
                  trackEvent('Send to friend', 'Submit', propertyId);
                });
        }


});

