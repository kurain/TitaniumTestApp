var win1 = Ti.UI.currentWindow;

if (Titanium.Platform.osname !== 'android') {
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
        }
    );
    win1.rightNavButton = messageButton;
} else {
    win1.activity.onCreateOptionsMenu = function(e) {
        var menu = e.menu;
        var menuItem1 = menu.add({ title: "Message",itemId:1 });
        menuItem1.addEventListener(
            "click",
            function(e) {
                var messageWindow = Ti.UI.createWindow(
                    {
                        url: 'message_window.js',
                        title: 'message',
                        backgroundColor: '#fff'
                    }
                );
                Ti.UI.currentTab.open(messageWindow);
            }
        );
        var menuItem2 = menu.add({ title: "Search",itemId:2 });
        menuItem2.addEventListener(
            "click",
            function(e) {
                search.show();
            }
        );
    };
}

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
            Ti.API.debug(tweet.user.screen_name);
            Ti.API.debug(tweet.status_id);
            var webWindow = Ti.UI.createWindow(
                {
                    url: 'tweet_window.js',
                    status_id: tweet.status_id,
                    screen_name: tweet.user.screen_name
                }
            );
            Ti.UI.currentTab.open(webWindow);
        }
    );
}

Ti.include("twitter_settings.js");
Ti.include("tweet_db.js");
Ti.include("lib/twitter_api.js");

//initialization
Ti.App.twitterApi = new TwitterApi({
    consumerKey: TwitterSettings.consumerKey,
    consumerSecret: TwitterSettings.consumerSecret
});
var twitterApi = Ti.App.twitterApi;
twitterApi.init(); 
var db = new TweetDB();

twitterApi.statuses_home_timeline(
    {
        onSuccess: function(response){
            db.addTweets(response);
            updateTimeline(db.getSavedTweets());
        },
        onError: function(error){
            Ti.API.error(error);
        }
    }
);
win1.add(tableView);


var search = Titanium.UI.createSearchBar({
	height:43,
	top:0
});
search.addEventListener('return', function(e)
{
	var query = e.value;
    var res = db.searchByScreenName(query);
    if (res) {
        updateTimeline(res);
    }
	search.blur();
    search.hide();
});
search.addEventListener('change', function(e)
{
    if (e.value.length == 0 ) {
        updateTimeline(db.savedTweets());
	    search.blur();
        search.hide();
    }
});
win1.add(search);
search.hide();

if (Titanium.Platform.osname !== 'android') {
var searchButton = Ti.UI.createButton(
    {
        title: 'search'
    }
);
searchButton.addEventListener(
    'click',
    function () {
        search.show();
    }
);
win1.leftNavButton = searchButton;
}