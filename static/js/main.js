$(function () {
    var device;

    log("Requesting Access Token...");
    // Using a relative link to access the Voice Token function
    $.getJSON("./token")
        .then(function (data) {
            log("Got a token.");
            console.log("Token: " + data.token);

            // Setup Twilio.Device
            device = new Twilio.Device(data.token, {
                // Set Opus as our preferred codec. Opus generally performs better, requiring less bandwidth and
                // providing better audio quality in restrained network conditions. Opus will be default in 2.0.
                codecPreferences: ["opus", "pcmu"],
                // Use fake DTMF tones client-side. Real tones are still sent to the other end of the call,
                // but the client-side DTMF tones are fake. This prevents the local mic capturing the DTMF tone
                // a second time and sending the tone twice. This will be default in 2.0.
                fakeLocalDTMF: true,
                // Use `enableRingingState` to enable the device to emit the `ringing`
                // state. The TwiML backend also needs to have the attribute
                // `answerOnBridge` also set to true in the `Dial` verb. This option
                // changes the behavior of the SDK to consider a call `ringing` starting
                // from the connection to the TwiML backend to when the recipient of
                // the `Dial` verb answers.
                enableRingingState: true,
                debug: true,
            });

            device.on("ready", function (device) {
                log("Twilio.Device Ready!");
            });

            device.on("error", function (error) {
                log("Twilio.Device Error: " + error.message);
            });

            device.on("connect", function (conn) {
                log('Successfully established call ! ');
                $('#modal-call-in-progress').modal('show')
            });

            device.on("disconnect", function (conn) {
                log("Call ended.");
                $('.modal').modal('hide')
            });

            device.on("incoming", function (conn) {
                console.log(conn.parameters)
                log("Incoming connection from " + conn.parameters.From);
                $("#callerNumber").text(conn.parameters.From)
                $("#txtPhoneNumber").text(conn.parameters.From)

                $('#modal-incomming-call').modal('show')

                $('.btnReject').bind('click', function () {
                    $('.modal').modal('hide')
                    log("Rejected call ...");
                    conn.reject();
                })

                $('.btnAcceptCall').bind('click', function () {
                    $('.modal').modal('hide')
                    log("Accepted call ...");
                    conn.accept();
                })

            });


        })
        .catch(function (err) {
            console.log(err);
            log("Could not get a token from server!");
        });

    // Bind button to make call
    $('#btnDial').bind('click', function () {
        $('#modal-dial').modal('hide')

        // get the phone number to connect the call to
        var params = {
            To: document.getElementById("phoneNumber").value
        };

        // output destination number
        $("#txtPhoneNumber").text(params.To)
        

        console.log("Calling " + params.To + "...");
        if (device) {
            var outgoingConnection = device.connect(params);
            outgoingConnection.on("ringing", function () {
                log("Ringing...");
            });
        }

    })

    // Bind button to hangup call

    $('.btnHangUp').bind('click', function () {
        $('.modal').modal('hide')
        log("Hanging up...");
        if (device) {
            device.disconnectAll();
        }
    })

    // Activity log
    function log(message) {
        var logDiv = document.getElementById("log");
        logDiv.innerHTML += "<p>&gt;&nbsp;" + message + "</p>";
        logDiv.scrollTop = logDiv.scrollHeight;
    }

});
