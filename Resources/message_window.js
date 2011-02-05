var win = Ti.UI.currentWindow;
var textArea = Ti.UI.createTextArea(
    {
        height:140,
        width:300,
        top:10,
        font:{fontSize:20},
        borderWidth:2,
        borderColor:'#bbb',
        borderRadius:5
    }
);

win.add(textArea);
var postButton = Ti.UI.createButton(
    {
        top: 160,
        right: 10,
        width: 100,
        height: 44,
        title: 'POST'
    }
);

Ti.include("lib/twitter_api.js");
//initialization
Ti.App.twitterApi = new TwitterApi({
    consumerKey:'ekrL8X8sy8WiSDrpsUImQ',
    consumerSecret:'LvIutOsRgDH0HAV4D1wKE8hRGCAFEow2iCEHpZy4uwQ'
});
var twitterApi = Ti.App.twitterApi;
twitterApi.init(); 

var latitude;
var longitude;
function tweet(message) {
    var params = {status: message};
    if (latitude && longitude) {
        params['lat']  = latitude;
        params['long'] = longitude;
    }
    twitterApi.statuses_update(
        {
            onSuccess: function(responce){
                alert('tweet success');
                Ti.API.info(responce);
            },
            onError: function(error){
                Ti.API.error(error);
            },
            parameters:params
        }
    );
}

postButton.addEventListener(
    'click',
    function () {
        if ( textArea.value ) {
            tweet( textArea.value );
            win.close({animated:true});
        }
    }
);

win.add(postButton);

var mapview = Titanium.Map.createView(
    {
        width: 320,
        height: 240,
        top: 220,
	    mapType: Titanium.Map.STANDARD_TYPE,
	    region:{latitude:40.0, longitude:130, latitudeDelta:30, longitudeDelta:30},
	    animate:true,
	    regionFit:true,
	    userLocation:true
    }
);
mapview.hide();
win.add(mapview);

Titanium.Geolocation.purpose = 'Twitter投稿のため';
function setCurrentPosition () {
    Titanium.Geolocation.getCurrentPosition(
        function(e) {
            textArea.blur();
		    if (!e.success || e.error)
		    {
			    alert('位置情報が取得できませんでした');
			    return;
		    }

		    latitude = e.coords.latitude;
		    longitude = e.coords.longitude;

            var currentPos = Titanium.Map.createAnnotation(
                {
	                latitude:latitude,
	                longitude:longitude,
	                title:"現在地",
	                pincolor:Titanium.Map.ANNOTATION_GREEN,
	                animate:true
                }
            );
            mapview.addAnnotation(currentPos);
            mapview.show();
            mapview.setLocation(
                {
                    latitude:latitude,
                    longitude:longitude,
                    latitudeDelta:0.01,
                    longitudeDelta:0.01
                }
            );
	    }
    );
}

var locationButton = Ti.UI.createButton(
    {
        top: 160,
        left: 10,
        width: 100,
        height: 44,
        title: 'Location'
    }
);

locationButton.addEventListener(
    'click',
    setCurrentPosition
);
win.add(locationButton);
