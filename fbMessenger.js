var request = require('request');

const ACTION_TYPES = [
    'typing_on',
    'typing_off',
    'mark_seen'
];

// API META
const DEFAULT_NOTIFICATION = 'NO_PUSH';
const DEFAULT_ACTION = 'typing_off';

// MESSAGE META
const DEFAULT_MESSAGE = 'Hello Facebook Messenger';

// QUICK_REPLIES
const QUICK_REPLIES = {
    location: {
        content_type: "location"
    },
    red: {
        content_type:"text",
        title:"Red",
        payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED",
        image_url:"http://petersfantastichats.com/img/red.png"
    },
    green: {
        content_type:"text",
        title:"Green",
        payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN",
        image_url:"http://petersfantastichats.com/img/green.png"
    }
}

function FbMessenger(config) {
    config = config || {};
    this.token = config.token || '';
    this.app_secret = config.app_secret || false;
    this.verify_token = config.verify_token || false;
}

// Use this to actually send the message
FbMessenger.prototype.sendMessage = function(recipient, message, action, notification_type) {
    action = action || DEFAULT_ACTION;
    notification_type = notification_type || DEFAULT_NOTIFICATION;
    message = message || {};
    request.post({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            'access_token': this.token
        },
        json: true,
        body: {
            recipient: recipient,
            message: message,
            action: action,
            notification_type: notification_type
        }
    }, function(err, res, data) {
        if (err || data.error) {
          console.log(data);
        }
    });
};

// We can use this to set us to typing and marking the message as seen while we go get the answers
FbMessenger.prototype.sendAction = function(recipient, action) {
    if(action.indexOf(ACTION_TYPES)){
        request.post({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {
                'access_token': this.token
            },
            json: true,
            body: {
                recipient: recipient,
                sender_action: action
            }
        }, function(err, res, data) {
            if (err) {
              console.log(data);
            }
        });
    }
};

// Gets any profile info we might need (not tested)
FbMessenger.prototype.getUserProfile = function(id, callback) {
    request.get({
        url: 'https://graph.facebook.com/v2.6/'+id,
        qs: {
            'access_token': this.token
        },
        json: true,
        body: {
        }
    }, function(err, res, data) {
      if (err) {
        console.log(data);
      }

      callback(data);
    });
};

// Stub out recipient generation
FbMessenger.prototype.createRecipient = function(id) {
    return {
        id: id
    }
};

FbMessenger.prototype.createMessage = function(text, attachment, quick_replies, metadata) {
    var message = {};
    text = text || DEFAULT_MESSAGE;
    attachment = attachment || false;
    if(attachment) {
        message.attachment = attachment;
    } else {
        message.text = text;
    }
    metadata = metadata || false;
    if(metadata) {
        message.metadata = metadata;
    }
    quick_replies = quick_replies || false;
    if(quick_replies) {
        message.quick_replies = quick_replies;
    }
    return message;
};

FbMessenger.prototype.createQuickReplies = function(types, custom) {
    var replies = [];
    types.forEach(function(type) {
        replies.push(QUICK_REPLIES[type]);
    }, types);
    custom = custom || false;
    if(custom) {
        return replies.concat(custom);
    }
    return replies;
};

module.exports = FbMessenger;
