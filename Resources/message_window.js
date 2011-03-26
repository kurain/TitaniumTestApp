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
        width: 60,
        height: 44,
        title: 'POST'
    }
);

Ti.include("lib/twitter_api.js");
//initialization
Ti.App.twitterApi = new TwitterApi({
    consumerKey:'0C1bKC84Q3ZpIGsZLSu7A',
    consumerSecret:'XfuEkOgtdqN42k7WDEHkoclsXZE263mKpckIxS4E'
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
                uploadToTwitPic(image);
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
                uploadToTwitPic(image);
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

function uploadToTwitPic(image) {
    var xhr = Ti.Network.createHTTPClient();

    var verifyURL = 'https://api.twitter.com/1/account/verify_credentials.json';
    var params = {
        url:verifyURL,
        method: 'GET'
    };
    var header = twitterApi.oAuthAdapter.createOAuthHeader(params);

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
            key: 'YOUR_TWITPIC_API_KEY',
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
    var header = twitterApi.oAuthAdapter.createOAuthHeader(params);

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

Titanium.Gesture.addEventListener(
    'shake',
    function(){
        var alertDialog = Titanium.UI.createAlertDialog(
            {
                title: '入力をキャンセルしますか?',
                buttonNames: ['入力をキャンセル', '編集を続行'],
                cancel: 1
            }
        );
        alertDialog.addEventListener(
            'click',
            function(e) {
                if (e.index == 10) {
                    win.close();
                }
            }
        );
        alertDialog.show();
    }
);


function postByAccelerometer(e) {
    if ( Math.abs(e.z) > 1.1 ) {
        tweet('iPhoneに触られた!');
        accEnabled = false;            
        Ti.Accelerometer.removeEventListener('update',postByAccelerometer);
    }
}

var accEnabled = false;
var accButton = Ti.UI.createButton(
    {
        top: 160,
        left: 190,
        width: 44,
        height: 44,
        title: 'Acc'
    }
);
accButton.addEventListener(
    'click',
    function () {
        if (accEnabled) {
            alert('無効にします');
            accEnabled = false;            
            Ti.Accelerometer.removeEventListener('update',postByAccelerometer);
        } else {
            alert('有効にします');
            accEnabled = true;
            Ti.Accelerometer.addEventListener('update',postByAccelerometer);
        }
    }
);
win.add(accButton);

// win.addEventListener(
//     'close',
//     function(){
//         var text = textArea.value;
//         Ti.App.Properties.setString('previousText', text);

//         if (mapview.visible) {
//             var loc = mapview.location;
//             var locationList =
//                 [loc.latitude,loc.longitude,loc.latitudeDelta,loc.longitudeDelta];
//             Ti.App.Properties.setList('locationList', locationList);
//         }
//     }
// );

// win.addEventListener(
//     'open',
//     function(){
//         var text = Ti.App.Properties.getString('previousText');
//         if ( text ) {
//             textArea.value = text;
//         }
//         if ( Ti.App.Properties.hasProperty('locationList') ) {
//             var locationList = Ti.App.Properties.getList('locationList');
//             mapview.show();
//             mapview.setLocation(
//                 {
//                     latitude : locationList[0],
//                     longitude : locationList[1],
//                     latitudeDelta : locationList[2],
//                     longitudeDelta : locationList[3]              
//                 }
//             );
//         }
//     }
// );

var fileName = 'tweet.txt';
win.addEventListener(
    'close',
    function(){
        var text = textArea.value;
        var loc;
        if (mapview.visible) {
            loc = mapview.location;
        }
        var json = JSON.stringify({previousText:text,location:loc});
        var file  = Ti.Filesystem.getFile(
            Titanium.Filesystem.resourcesDirectory + '/' + fileName
        );
        file.write(json);
    }
);

win.addEventListener(
    'open',
    function(){
        var file  = Ti.Filesystem.getFile(
            Titanium.Filesystem.resourcesDirectory + '/' + fileName
        );
        var json = file.read();
        if ( !json || json.length <= 0) {
            return;
        }
        var data = JSON.parse(json);
        var text = data.previousText;
        var location = data.location;
        if ( text ) {
            textArea.value = text;
        }
        if ( location ) {
            var locationList = Ti.App.Properties.getList('locationList');
            mapview.show();
            mapview.setLocation(location);
        }
    }
);



