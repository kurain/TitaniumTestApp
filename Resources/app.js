Titanium.UI.setBackgroundColor('#000');

var win1 = Titanium.UI.createWindow({
    url: 'table_view.js',
    title:'Tab 1',
    backgroundColor:'#fff'
});

win1.activity.onCreateOptionsMenu = function(e) {
    var menu = e.menu;
    var menuItem = menu.add({ title: "Add" });
    menuItem.addEventListener("click", function(e) {
        Ti.API.debug("Menu ADD was clicked");
        var messageWindow = Ti.UI.createWindow(
             {
                 url: 'message_window.js',
                 title: 'message',
                 backgroundColor: '#fff',
                 fullscreen: false
             }
        );
        messageWindow.oepn();
    });
};
win1.open();


