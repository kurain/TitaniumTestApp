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
    consumerKey:'YOUR CONSUMER KEY',
    consumerSecret:'YOUR CONSUMER SECRET'
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
        width: 80,
        height: 44,
        title: 'Location'
    }
);

locationButton.addEventListener(
    'click',
    setCurrentPosition
);
win.add(locationButton);

var imageView = Titanium.UI.createImageView(
    {
        width: 'auto',
        height: 240,
        top: 220
    }
);
imageView.hide();
win.add(imageView);

function selectFromPhotoGallery() {
    Ti.Media.openPhotoGallery(
        {
            success: function(event) {
                var image = event.media;
                imageView.image = image;
                imageView.show();
                uploadToTwtiPick(image);
             },
            // error:  function(error) { },
            // cancel: function() { },
            allowEditing: false,
            mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
        }
    );
}

function startCamera() {
    Titanium.Media.showCamera(
        {
	        success:function(event) {
		        var image = event.media;
                imageView.image = image;
                imageView.show();
                uploadToTwtiPick(image);
		    },
	        //cancel:function(){},
	        error:function(error) {
		        if (error.code == Titanium.Media.NO_CAMERA) {
                    alert('カメラがありません');
		        }
		    },
	        saveToPhotoGallery:true,
	        allowEditing:true,
	        mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
        }
    );
}

var sourceSelect = Titanium.UI.createOptionDialog({
	options:['撮影する', 'アルバムから選ぶ', 'キャンセル'],
	cancel:2,
	title:'写真を添付'
});

sourceSelect.addEventListener('click',function(e)
{
	switch( e.index ) {
    case 0:
        startCamera();
        break;
    case 1:
        selectFromPhotoGallery();
        break;
    }
});

var photoButton = Ti.UI.createButton(
    {
        top: 160,
        left: 100,
        width: 80,
        height: 44,
        title: 'photo'
    }
);

photoButton.addEventListener(
    'click',
    function() {
        sourceSelect.show();
    }
);
win.add(photoButton);

function uploadToTwtiPick(image) {
    var xhr = Ti.Network.createHTTPClient();

    var verifyURL = 'https://api.twitter.com/1/account/verify_credentials.json';
    var params = {
        url:verifyURL,
        method: 'GET'
    };
    var header = twitterApi.oAuthAdapter.echoOAuthHeader(params);

    Ti.API.debug('header: ' + header);

    xhr.onload = function(){
        Ti.API.debug('status: ' + this.status);
        Ti.API.debug('res: ' + this.responseText);
        var res = JSON.parse(this.responseText);
        textArea.value = ( textArea.value || '' ) + ' ' + res.url;
    };
    xhr.onerror = function(){
        Ti.API.debug('status: ' + this.status);
        Ti.API.debug('res: ' + this.responseText);
    };

    xhr.open('POST','http://api.twitpic.com/2/upload.json');
    xhr.setRequestHeader('X-Verify-Credentials-Authorization',header);
    xhr.setRequestHeader('X-Auth-Service-Provider',verifyURL);

    xhr.send(
        {
            key: 'YOUR TWITPIC API KEY',
            message: textArea.value,
            media: image
        }
    );
}

function verifyTwitter (){
    var xhr = Ti.Network.createHTTPClient();
    var verifyURL = 'https://api.twitter.com/1/account/verify_credentials.json';
    var params = {
        url:verifyURL,
        method: 'GET'
    };
    var header = twitterApi.oAuthAdapter.echoOAuthHeader(params);

    Ti.API.debug('URL: ' + verifyURL);
    Ti.API.debug('header: ' + header);
    xhr.onload = function(){
        Ti.API.debug('status: ' + this.status);
        Ti.API.debug('res: ' + this.responseText);
        var res = JSON.parse(this.responseText);
        textArea.value = textArea.value + ' ' + res.url;
    };
    xhr.onerror = function(){
        Ti.API.debug('status: ' + this.status);
        Ti.API.debug('res: ' + this.responseText);
    };
    xhr.open('GET', verifyURL, false);
    xhr.setRequestHeader('Authorization', header);
    xhr.send();
}
