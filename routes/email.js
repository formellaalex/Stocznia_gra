var email  = require("emailjs");

module.exports = {
    postfixSend : function (emailInfo, callback) {
        var server  = email.server.connect({
           user:    "stoczniagame@gmail.com", 
           password:"stoczniagra", 
           host:    "smtp.gmail.com", 
           ssl:     true
        });

        server.send({
            text:    emailInfo.msg, 
            from:    emailInfo.from, 
            to:      emailInfo.to,
            subject: emailInfo.subject
            }, function(err, message) {
                callback(err);
        });
    }
}