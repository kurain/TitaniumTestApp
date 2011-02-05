var win1 = Ti.UI.currentWindow;

var messageButton = Ti.UI.createButton(
    {
	    systemButton: Titanium.UI.iPhone.SystemButton.ADD
    }
);
messageButton.addEventListener(
    'click',
    function () {
        var messageWindow = Ti.UI.createWindow(
            {
                url: 'message_window.js',
                title: 'message',
                backgroundColor: '#fff'
            }
        );
        Ti.UI.currentTab.open(messageWindow);
        //messageWindow.open();
    }
);
win1.rightNavButton = messageButton;

var data = [];
var tableView = Ti.UI.createTableView({
    data:data
});

function updateTimeline (timeline) {
    var currentData = [];
    for (var i=0;i<timeline.length;i++) {
        var tweet = timeline[i];
        var row = Ti.UI.createTableViewRow(
            {
                height: 'auto',
                layout: 'vertical'
            }
        );

        var imageView = Ti.UI.createImageView(
            {
                image: tweet.user.profile_image_url,
                //ファイル名はプロジェクトのResorcesフォルダからの相対パス
                width: 48,
                height: 48,
                top: 5,
                left: 5
            }
        );
        row.add(imageView);

        var nameLabel = Ti.UI.createLabel(
            {
                width: 120,
                height: 'auto',
                left: 58,
                top: -48,
                fontSize: 6,
                fontWeight: 'bold',
                color: '#2b4771'
            }
        );
        nameLabel.text = tweet.user.screen_name;
        row.add(nameLabel);

        var commentLabel = Ti.UI.createLabel(
            {
                width: 257,
                left: 58,
                top: 1,
                height: 'auto',
                fontSize: 8
            }
        );
        commentLabel.text = tweet.text;
        row.add(commentLabel);

        var dateLabel = Ti.UI.createLabel(
            {
                width: 200,
                height: 'auto',
                left: 58,
                top: 5,
                fontSize: 6
            }
        );
        dateLabel.text = tweet.created_at;
        row.add(dateLabel);

        currentData.push(row);
    }
    tableView.setData(currentData);

    tableView.addEventListener(
        'click',
        function(e) {
            var tweet = timeline[e.index];
            var webWindow = Ti.UI.createWindow(
                {
                    url: 'tweet_window.js',
                    status_id: tweet.id_str,
                    screen_name: tweet.user.screen_name
                }
            );
            Ti.UI.currentTab.open(webWindow);
        }
    );
}


var xhr = Ti.Network.createHTTPClient();
var user = 'kurain';
var url = "http://api.twitter.com/1/statuses/user_timeline.json?screen_name=" + user;
xhr.open('GET', url);
xhr.onload = function() {
    var timeline = JSON.parse(this.responseText);
    updateTimeline(timeline);
};
xhr.send();

win1.add(tableView);