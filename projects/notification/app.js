var notification = (function() {

    return {
        count: 0,
        lastCheckedTime: 0,
        /**
         * To set the total count of unread notifications, if passed 0 then it will hide the bubble
         *
         * @param count
         */
        setCount: function(count) {
            if (count) {
                this.$counter.text(count).css({ top: '-2px'});
                if (this.$notifications.is(':hidden')) {
                    this.$counter.show();
                    this.showButton();
                }
            } else {
                this.count = 0;
                this.$counter.hide();
                this.showButton(false);
            }
            return this.$counter;
        },
        showButton: function(show) {
            if (show === false) {
                this.$button.css('background-color', '#2E467C'); // hide button
            } else {
                this.$button.css('background-color', '#FFF');
            }
        },
        /**
         * Add one tile to notificaion popup
         *
         * @param title
         * @param message
         * @param time
         */
        add: function(title, message, time) {
            this.$wrapper.prepend(
                    '<div class="notification_tile">\
                        <div>' + title + ' <span>' + new Date(time).toLocaleString() + '</span></div>\
                    <small> ' + message + '</small>\
                </div>'
            )
        },
        /**
         * Fetches notitifications after lastCheckedTime and renders in popup
         */
        fetchNotifications: function() {
            var self = this;
            dataservice.get("get_notifications", {
                lastCheckedTime: self.lastCheckedTime
            }, function(response) {
                self.lastCheckedTime = (new Date()).getTime();
                for (var i in response) {
                    self.add(response[i].title, response[i].description, response[i].time);
                }
                self.setCount(0);
            });
        },
        /**
         * Initilize DOM & events for notification
         */
        init: function() {
            var self = this;

            this.$counter = $('#noti_Counter');
            this.$button = $('#noti_Button');
            this.$notifications = $('#notifications');
            this.$wrapper = $("#tile_wrapper");

            $(document).click(function() {
                self.$notifications.hide();
                if (self.$counter.is(':hidden')) {
                    self.setCount(self.count);
                    self.$wrapper.empty();
                }
            });

            this.$button.click(function() {

                self.$notifications.fadeToggle('fast', 'linear', function() {
                    if (self.$notifications.is(':hidden')) {
                        self.$wrapper.empty();
                    } else {
                        self.setCount(0);
                    }
                });
                self.fetchNotifications();
                return false;
            });

            this.$notifications.click(function() {
                return false;
            });

            dataservice.on("topic/notifications", function(resp) {
                self.count += resp.notification_count;
                if (!self.$notifications.is(':hidden')) {
                    self.fetchNotifications();
                } else {
                    self.setCount(self.count);
                }
            });
        }

    };

})();

var dataservice = (function() {

    var messages = [];

    return {
        _dummy_: function(count) {
            for (var i = 0; i < count; i++) {
                messages.push({
                    title: "Notification Title",
                    description: "Notification description",
                    time: new Date().getTime()
                });
            }
            localStorage.setItem("notifications",JSON.stringify(messages));
            if (this.callback && count > 0) {
                this.callback({ notification_count: count});
            }
        },
        on: function(topic, callback) {
            this.callback = callback;
            if (this.callback) {
                this.callback({ notification_count: messages.length});
            }
        },
        get: function(url, data, callback) {
            callback(messages);
            messages = [];
            localStorage.setItem("notifications",JSON.stringify(messages));
        },
        init: function() {
            (function(notifications){
                if(notifications){
                    messages =  JSON.parse(notifications);
                };
            })(localStorage.getItem("notifications"));

            window.setInterval(function() {
                dataservice._dummy_(Math.round(Math.random() * 2))
            }, 3000);
        }
    };
})();


$(document).ready(function() {
    dataservice.init();
    notification.init();
});