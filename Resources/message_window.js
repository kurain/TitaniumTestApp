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

function tweet(message) {
    oAuthAdapter.send(
        'https://api.twitter.com/1/statuses/update.json',
        [['status', message]],
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
