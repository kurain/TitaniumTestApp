Titanium.UI.setBackgroundColor('#000');

var tabGroup = Titanium.UI.createTabGroup({});

var win1 = Titanium.UI.createWindow({  
    title:'Tab 1',
    backgroundColor:'#fff'
});
var tab1 = Titanium.UI.createTab({
    window:win1 //前回必要な引数まで削除されていました。すいません!
}); 

var data = [];
var tableView = Ti.UI.createTableView({
    data:data
});

function updateTimeline (timeline) {
    var currentData = [];
    for (var i=0;i<timeline.length;i++) {
        var tweet = timeline[i];
        var row = Ti.UI.createTableViewRow();
        var commentLabel = Ti.UI.createLabel();
        commentLabel.text = tweet.text;
        row.add(commentLabel);
        currentData.push(row);
    }
    tableView.setData(currentData);
}

var xhr = Ti.Network.createHTTPClient();
var user = 'hatenatech';
var url = "http://api.twitter.com/1/statuses/user_timeline.json?screen_name=" + user;
xhr.open('GET', url);
xhr.onload = function() {
    var timeline = JSON.parse(this.responseText);
    updateTimeline(timeline);
};
xhr.send();

win1.add(tableView);
win1.hideTabBar();

tabGroup.addTab(tab1);  
tabGroup.open();
