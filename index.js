"use strict";
exports.__esModule = true;
var FacebookMessage = (function () {
    function FacebookMessage($text) {
        console.log('loaded:' + $text);
    }
    return FacebookMessage;
}());
exports.FacebookMessage = FacebookMessage;
var facebook = new FacebookMessage('Help me');
