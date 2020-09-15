if(!window['adManager']) {
    var player;
    var blockInterval;
    var watchInterval;
    var adManager = {
        'loaded': false,
        'uid': 0,
        'tag_name': 'ads-',
        'block': '#adsblock',
        'width': 500,
        'height': 300,
        'size': false,
        'time': 1000,
        'finish': 0,
        'wacth': 0,
        'stop': 5000,
        'url': 'https://ablok.store' + '/ads/' + 'ad' + 's.' + 'php',
        'staticUrl': 'https://ablok.store' + '/ads/',
        'videoId': null
    }
    var XMLHttpFactories = [
        function () {return new XMLHttpRequest()},
        function () {return new ActiveXObject("Msxml2.XMLHTTP")},
        function () {return new ActiveXObject("Msxml3.XMLHTTP")},
        function () {return new ActiveXObject("Microsoft.XMLHTTP")}
    ];
}

if(!adManager.loaded) {
    adManager.loaded = true;
    var a = adManager;
    var closeBtn;
    var fakeBtn;
    var overlay;
    (function(){
        
        adManager.init = function(UID) {
            a.uid = UID;
            a.loadCss(a.staticUrl + 'style.css?v' + Math.random(), css => {
                a.setSize(a.getElement(a.block).parentElement);
                a.Load(a.block);
                a.finish = a.stop;
            });
        }

        adManager.Load = function(elem) {
            var adsblock = a.createElement('div', a.tag_name + this.uid);
                adsblock.appendChild(a.createElement('div', '#player'));
                closeBtn = a.createElement('button', 'close-ads', 'Reklamı Geç');
                fakeBtn = a.createElement('button', 'jump-ads', 'Reklamı Geç');
                overlay = a.createElement('div', 'overlay');
                overlay.style.width = a.width + 'px';
                overlay.style.height = a.height + 'px';
                a.getElement(elem).append(adsblock,overlay);
                a.YTBLoad();
        }

        adManager.loadCss = function(csspath, callback) {
            const stylesheet = document.createElement('link');
            stylesheet.rel = 'stylesheet';
            stylesheet.href = csspath;

            stylesheet.onload = () => callback(stylesheet);

            document.head.append(stylesheet);
        }

        adManager.YTBLoad = function() {
            var tag = document.createElement('script');

            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        }

        adManager.setSize = function(elem, callback) {
            a.width = elem.offsetWidth == 0 ? window.innerWidth : elem.offsetWidth;
            a.height = elem.offsetHeight == 0 ? window.innerHeight : elem.offsetHeight;
            a.size = true;
        }

        adManager.iText = function(elem, e) {
            let counter = e / 1000;
            if(counter === 0) {
                elem.innerText = 'Reklamı Geç';
            }else{
                elem.innerText = counter + ' saniye';
            }
        }

        adManager.getElement = function(selector) {
            const element = document.querySelector(selector);
            return element;
        }

        adManager.createElement = function(tag, className, value) {
            const element = document.createElement(tag);
            if (className) {
                if(className.indexOf('#') === 0) {
                    element.id = className.replace('#', '');
                }else{
                    element.classList.add(className);
                }
            }
            if (value) {
                element.innerHTML = value;
            }
            return element;
        }

        adManager.YTPlayer = function(videoId) {
            a.videoId = videoId;
            player = new YT.Player('player', {
                height: a.height,
                width: a.width,
                videoId: videoId,
                playerVars: {
                    /*'autoplay': 1,*/
                    'controls': 0,
                    'disablekb': 0,
                    'enablejsapi': 1,
                    'fs': 0,
                    'iv_load_policy': 3,
                    'showinfo': 0,
                    'start': 0,
                    't': 0
                },
                events: {
                    'onReady': adManager.onPlayerReady,
                    'onStateChange': adManager.onPlayerStateChange
                }
            });
        }

        adManager.onPlayerReady = function(event) {
            blockInterval = setInterval(() => {
                console.log(123);
                a.getElement(a.block).parentNode.style.display = 'block';
            }, 500);

            adsblock.appendChild(fakeBtn).addEventListener('click', (e) => {
                e.target.style.display = 'none';
                event.target.playVideo();
            });
        }

        var done = false;
        var videoInterval;
        adManager.onPlayerStateChange = function(event) {
            if (event.data == YT.PlayerState.PLAYING) {
                wacthInterval = setInterval(() => {
                    a.wacth += a.time;
                }, a.time);
                adsblock.appendChild(closeBtn);
                fakeBtn.style.display = 'none';
                videoInterval = setInterval(adManager.stopVideo, adManager.time);
                done = true;
                console.log('başlattık');
            } else if(event.data == YT.PlayerState.PAUSED) {
                console.log('durdurduk');
                clearInterval(videoInterval);
            } else if(event.data == YT.PlayerState.ENDED) {
                console.log('bitti');
                player.stopVideo();
                a.getElement(a.block).parentNode.style.display = 'none';
                clearInterval(videoInterval);
                clearInterval(blockInterval);
                clearInterval(watchInterval);
                a.getElement(a.block).remove();
                a.finish = a.stop;
                let data = {
                    'uid': a.uid,
                    'watch': a.wacth,
                    'videoId': a.videoId,
                    'view': 1
                };
                a.sendData(data);
            }
        }

        adManager.stopVideo = function() {
            a.getElement(a.block).parentNode.style.display = 'block';
            if(a.finish === 0) {
                //reklamı geç
                adsblock.appendChild(closeBtn).addEventListener('click', () => {
                    player.stopVideo();
                    clearInterval(videoInterval);
                    clearInterval(blockInterval);
                    clearInterval(watchInterval);
                    a.finish = a.stop;
                    a.getElement(a.block).parentNode.style.display = 'none';
                    a.getElement(a.block).remove();
                    let data = {
                        'uid': a.uid,
                        'watch': a.wacth,
                        'videoId': a.videoId,
                        'view': 1
                    };
                    a.sendData(data);
                });
            }else{
                a.finish -= a.time;
                a.iText(closeBtn, a.finish);
            }
        }

        adManager.sendData = function(data) {
            a.vRequest('ads.php', () => {
                console.log('gitti');
            }, 'data=' + JSON.stringify(data));
        }

        adManager.vRequest = function(url, callback, postData) {

            let responseData = [];
            let method = postData ? 'POST' : 'GET';

            var xhr = a.createCORSRequest(method, url);
                if(postData) {}
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xhr.onreadystatechange = function() {
                    if(xhr.readyState == 4) {
                        if(xhr.status == 200) {
                            if(callback) {
                                return callback(xhr.response);
                            }
                        }
                    }
                }

                xhr.onerror = function() {
                    console.log('XHR fail..');
                }

                xhr.responseType = 'json';
                xhr.send(postData);

        }

        adManager.createCORSRequest = function(method, url) {
            var xhr = new XMLHttpRequest();
                if ("withCredentials" in xhr) {
                    xhr.open(method, url, true);
                } else if (typeof XDomainRequest != "undefined") {
                    xhr = new XDomainRequest();
                    xhr.open(method, url);
                } else {
                    xhr = null;
                }
                return xhr;
        }

        adManager.createXMLHTTPObject = function() {
            var xmlhttp = false;
            for (var i=0; i < XMLHttpFactories.length; i++) {
                try {
                    xmlhttp = XMLHttpFactories[i]();
                }
                catch (e) {
                    continue;
                }
                break;
            }
            return xmlhttp;
        }

        console.log(window['adManager']);

    })();

    if(!adManager.size) {
        function onYouTubeIframeAPIReady() {
            adManager.vRequest(a.url, (videos) => {
                adManager.YTPlayer(videos.videos[Math.floor(Math.random()*videos.videos.length)]);
            });
        }
    }
}