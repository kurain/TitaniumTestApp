var TweetDB = function() {
    this.dbName = 'tweetdb';
    
    this.open = function () {
        this.db = Titanium.Database.open(this.dbName);
    };

    this.close = function () {
        this.db.close();
    };

    this.searchByScreenName = function (screen_name) {
        this.open();
        var rows = this.db.execute(
            'SELECT * FROM tweets WHERE screen_name like ?',
            '%' + screen_name + '%'
        );
        var res = [];
        if ( rows.getRowCount() > 0 ) {
            Ti.API.debug('Found: ' + rows.getRowCount() );
            while ( rows.isValidRow() ) {
                var tweetObj = {};
                tweetObj.user = {};
                tweetObj.user.screen_name = rows.fieldByName('screen_name');
                tweetObj.user.profile_image_url
                    = rows.fieldByName('profile_image_url');
                tweetObj.text = rows.fieldByName('tweet_text');
                var date = new Date(rows.fieldByName('created_at'));
                tweetObj.created_at = date.toLocaleString();
                tweetObj.status_id = rows.fieldByName('status_id');
                res.push(tweetObj);
                rows.next();
            }
        }
        rows.close();
        this.close();
        return res.length ? res : null;
    };

    this.addTweets = function (tweets) {
        this.open();
        for (var i=0;i<tweets.length;i++) {
            var tweet = tweets[i];
            var rows = this.db.execute(
                'SELECT * FROM tweets WHERE status_id = ?',
                tweet.id_str
            );
            Ti.API.debug('Found: ' + rows.getRowCount() );
            if ( rows.getRowCount() > 0 ) continue;

            var res = this.db.execute(
                'INSERT INTO tweets (screen_name, profile_image_url, tweet_text, status_id, created_at) VALUES(?,?,?,?,?)',
                tweet.user.screen_name,
                tweet.user.profile_image_url,
                tweet.text,
                tweet.id_str,
                tweet.created_at
            );
            Ti.API.debug('Add to DB');
        }
        this.close();
        return true;
    };

    this.getSavedTweets = function() {
        this.open();
        var rows = this.db.execute( 'SELECT * FROM tweets ORDER BY created_at DESC' );
        var res = [];
        if ( rows.getRowCount() > 0 ) {
            Ti.API.debug('Found: ' + rows.getRowCount() );
            while ( rows.isValidRow() ) {
                var tweetObj = {};
                tweetObj.user = {};
                tweetObj.user.screen_name = rows.fieldByName('screen_name');
                tweetObj.status_id = rows.fieldByName('status_id');
                tweetObj.user.profile_image_url
                    = rows.fieldByName('profile_image_url');
                tweetObj.text = rows.fieldByName('tweet_text');
                var date = new Date(rows.fieldByName('created_at'));
                tweetObj.created_at = date.toLocaleString();
                res.push(tweetObj);
                rows.next();
            }
        }
        rows.close();
        this.close();
        return res;
    };

    this.open();
    this.db.execute('CREATE TABLE IF NOT EXISTS tweets (screen_name TEXT, profile_image_url TEXT, tweet_text TEXT, status_id TEXT, created_at TEXT)');
    this.close();
};