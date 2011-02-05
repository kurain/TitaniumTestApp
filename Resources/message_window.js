var win = Ti.UI.currentWindow;
var textArea = Ti.UI.createTextArea(
    {
        height:150,
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
        top: 170,
        right: 10,
        width: 100,
        height: 44,
        title: 'POST'
    }
);

Ti.include('lib/oauth_adapter.js');
var oAuthAdapter = new OAuthAdapter(
    'LvIutOsRgDH0HAV4D1wKE8hRGCAFEow2iCEHpZy4uwQ',
    'ekrL8X8sy8WiSDrpsUImQ',
    'HMAC-SHA1'
);
oAuthAdapter.loadAccessToken('twitter');


var latitude;
var longitude;
function tweet(message) {
    var messageData = [['status', message]];
    if ( latitude && longitude ) {
        messsageData.push(['lat',latitude]);
        messsageData.push(['long',longitude]);
    }

    oAuthAdapter.send(
        'https://api.twitter.com/1/statuses/update.json',
        messageData,
        'Twitter', //アラートのタイトル
        'Published.', //成功したときのアラートメッセージ
        'Not published.' //失敗したときのアラートメッセージ
    );

    if (oAuthAdapter.isAuthorized() == false) {
        var receivePin = function() {
            oAuthAdapter.getAccessToken(
                'https://api.twitter.com/oauth/access_token'
            );
            oAuthAdapter.saveAccessToken('twitter');
        };
        oAuthAdapter.showAuthorizeUI(
            'https://api.twitter.com/oauth/authorize?' +
                oAuthAdapter.getRequestToken(
                    'https://api.twitter.com/oauth/request_token'
                ),
            receivePin
        );
    }
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
        top: 170,
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
