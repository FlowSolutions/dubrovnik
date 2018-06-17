function getUrlParams(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

tractarText = function (text) {
    $(".carregant").hide();
    $(".response").show();

    var text = text.split("\n"),
        events = [],
        classe,
        msg, pivot,
        id = 1,
        acabat = false;

    text.forEach(function (line, index) {
        //if ((line[0]=="[")&&((line.indexOf("#bondia") != -1)||(line.indexOf("#bonanit") != -1))) {
        if (((line.indexOf("#bondia") != -1) || (line.indexOf("#bonanit") != -1))) {
            id = 1;
            acabat = false;
            msg = "";

            if (line.indexOf("Marc Pujol Gualdo") != -1) {
                classe = "event-info";
            } else if (line.indexOf("Ivan Viladrich") != -1) {
                classe = "event-important";
            } else {
                classe = "event-success";
            }
            msg += line.substring(line.indexOf("]") + 1, line.length);
            id = index + 1;
            while (!acabat && id < text.length) {
                msg += "<br>" + text[id];
                id++;
                if (text[id]) {
                    if (text[id].indexOf("[") != -1) {
                        acabat = true;
                    }
                }
            }
            events.push({
                "title": msg,
                "class": classe,
                "start": arreglarData(line.substring(1, line.indexOf(" ")).split("/"))
            });
        }
    });

    var calendar = $("#calendar").calendar({
        tmpl_path: "tmpls/",
        language: 'ca-ES',
        events_source: function () {
            return events
        },
        onAfterViewLoad: function (view) {
            $('#titol').text(this.getTitle());
        }
    });

    $('.btn-group button[data-calendar-nav]').each(function () {
        var $this = $(this);
        $this.click(function () {
            calendar.navigate($this.data('calendar-nav'));
        });
    });

    $('.btn-group button[data-calendar-view]').each(function () {
        var $this = $(this);
        $this.click(function () {
            calendar.view($this.data('calendar-view'));
        });
    });

    function arreglarData(datap) {
        if (datap[0].length < 2) {
            datap[0] = "0" + datap[0];
        }
        if (datap[1].length < 2) {
            datap[1] = "0" + datap[1];
        }
        if ((datap[2].length == 2)) {
            //estic canviant aquesta part
            datap[2] = "20" + datap[2];
            console.log("visca jo!");
        }
        return ((new Date(datap[2], Number(datap[1]) - 1, datap[0])).valueOf() + 100);
    };
}

$(document).ready(function () {

    $(".carregant").show();
    var st = firebase.storage().ref("x.zip");
    st.getDownloadURL().then(function (url) {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function (e) {
            var responseArray = new Uint8Array(this.response);
            var blobData = new Blob([responseArray], {
                type: 'application/zip'
            });
            zip.createReader(new zip.BlobReader(blobData), function (reader) {
                    reader.getEntries(function (entries) {
                        if (entries.length) {
                            entries[0].getData(new zip.TextWriter(), function (text) {
                                reader.close(function () {});
                                tractarText(text);
                            }, function (current, total) {});
                        }
                    });
                },
                function (error) {
                    console.log(error);
                });
        };
        xhr.send();

    }).catch(function (error) {});

});
