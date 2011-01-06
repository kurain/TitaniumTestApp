Titanium.UI.setBackgroundColor('#000');

var tabGroup = Titanium.UI.createTabGroup({});

var win1 = Titanium.UI.createWindow({
    url: 'table_view.js',
    title:'Tab 1',
    backgroundColor:'#fff'
});
var tab1 = Titanium.UI.createTab({
    window:win1
}); 

win1.hideTabBar();

tabGroup.addTab(tab1);  
tabGroup.open();
