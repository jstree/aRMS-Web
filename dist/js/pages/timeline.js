/*!
 * timeline v1.1.0 - jQuery plug
 *
 * Includes jquery.js
 * Includes raphael.js
 *
 * Copyright 짤 2016-2017 huangqing
 * Released under the MIT license
 *
 * Date: 2016-11-15
 */

(function ($) {

    'use strict';
    $.fn.extend({
        timeline: function (opt) {

            var container = this,
                paper = container.data('timeline'),
                pagerHeight = 0,
                pagerWidth = 0,
                ViewBoxX = 0,
                ViewBoxY = 0,
                startX = 0,
                startY = 0,
                nextX = startX,
                nextY = startY,
                endX = 0,
                endY = 0,
                currentBranchCount = 0,
                legend = {},
                legendHeight = 60,
                data = [],
                theme = $.extend(true, {}, $.timeline.theme.gray);

            $.extend(true, theme, opt.theme);

            if (!paper) {
                paper = Raphael(container[0]);
                container.data('timeline', paper);
            } else {
                paper.clear();
            }

            //溫←츞訝뗤��귞궧�꼃饔닺돈冶뗤퐤營�
            function getNextX(offsetWidth) {
                nextX += offsetWidth;
            }

            ///溫←츞訝뗤��귞궧�꼄饔닺돈冶뗤퐤營�폏�ⓧ틢�녷뵱�귞궧�꾦쳵佯��嶸�
            function getNextY() {
                var r = 10,
                    lineHeight = 0,
                    operator = +1,
                    baseLineHeight = 6 * r,
                    offsetHeight = 4 * r;
                //Y饔닷쓲�뉏맏�앭쭓�먩젃竊뚧졊��춴�귞궧�꾣빊�뤺�嶸쀩쳵佯�
                //寧т�訝ゅ춴�귞궧腰뽩뀍若싦퐤�쮇饔닷룏�묇퐤營�펽寧т틠訝ゅ춴�귞궧若싦퐤�쮇饔닸��묇툗寧т�訝よ뒄�밧�燁곁쉪鵝띸쉰
                if (nextY === startY) {
                    operator = -1;
                    lineHeight = baseLineHeight + Math.ceil(currentBranchCount / 2) * offsetHeight;
                    lineHeight = operator * (Math.abs(lineHeight) - offsetHeight);
                    nextY = startY + lineHeight;
                    setEndY(lineHeight);

                }
                //若싦퐤Y饔닸��묋뒄��
                else if (nextY < startY) {
                    operator = +1;
                    nextY = Math.abs(nextY);
                }
                //�믣뇧若싦퐤訝뗤�訝よ뒄��
                else {
                    operator = -1;
                    lineHeight = operator * (Math.abs(nextY) - offsetHeight);
                    nextY = startY + lineHeight;
                }
            }

            //溫양쉰x饔당퍜�잋퐤營�
            function setEndX(x) {
                if (endX < x) {
                    endX = x;
                }
            }

            //�룟룚��궎
            function getTheme() {
                return theme;
            }

            //溫←츞�얍숱��遙섌쳵佯�
            function setEndY(offsetHeight) {
                if (Math.abs(endY) < Math.abs(offsetHeight)) {
                    endY = Math.abs(offsetHeight);
                }
            }

            //�룟룚�양뎴url
            //imageUrl:url耶쀧Е訝뀐펽�뻰rl�곁퍍
            function getImageUrl(imageUrl, legendType) {

                var url = [],
                    image,
                    host;

                if (legend[legendType] && legend[legendType].icon) {
                    url.push(legend[legendType].icon);
                }

                if (imageUrl && typeof imageUrl === 'string') {
                    url.push(imageUrl);
                } else if (imageUrl instanceof Array && imageUrl.length > 0) {
                    url = url.concat(imageUrl);
                }

                for (var i = 0, len = url.length; i < len; i++) {
                    image = url[i];
                    if (image.indexOf("~") === 0) {
                        host = location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "");
                        url[i] = image.replace(/~/, host);
                    }
                }

                return url;
            }

            //�쎾뻠凉�冶뗨뒄��
            function createStartNode(x, y) {
                var theme = getTheme().startNode,
                    r = theme.radius,
                    bgColor = theme.fill,
                    lineWidth = 60;

                x += r;

                paper.circle(x, y, r).attr({
                    fill: bgColor,
                    "stroke-width": 0,
                    stroke: bgColor
                });

                paper.path("M" + x + " " + y + "L" + (x + lineWidth - 10) + " " + y).attr({
                    "stroke-width": 2,
                    stroke: bgColor,
                    "stroke-dasharray": ["-"]
                });

                getNextX(lineWidth);
            }

            //�쎾뻠瀯볠씇�귞궧
            function createEndNode(x, y) {
                var theme = getTheme().endNode,
                    r = theme.radius,
                    bgColor = theme.fill,
                    lineWidth = 60,
                    _endX = x + lineWidth,
                    pathStr = "";

                if (_endX < endX) {
                    lineWidth = endX - x;
                }
                pathStr = "M" + x + " " + y + "L" + (x + lineWidth) + " " + y;
                paper.path(pathStr).attr({
                    "stroke-width": 2,
                    stroke: bgColor,
                    "stroke-dasharray": ["-"]
                });

                pathStr = ["M", x + lineWidth, " ", y,
                    "L", x + lineWidth, " ", y + r,
                    "L", x + lineWidth + r, " ", y,
                    "L", x + lineWidth, " ", y - r,
                    "L", x + lineWidth, " ", y,
                    "z"
                ].join("");
                paper.path(pathStr).attr({
                    fill: bgColor,
                    "stroke-width": 0,
                    stroke: bgColor
                });

                getNextX(lineWidth + r);
            }

            //�쎾뻠訝�슈瀛요툓�꾡말�귞궧
            function createCentralAxisNode(x, y, text, imageUrl) {

                var theme = getTheme().centralAxisNode,
                    //r = 10,
                    width = 100,
                    height = theme.height,
                    innerRectElement,
                    outRectElement,
                    imageX,
                    imageY,
                    imageWidth = 0,
                    imageElements = [],
                    imageSize = 14,
                    textElement,
                    paddingSize = 4,
                    radius = theme.radius,
                    fill = theme.fill,
                    stroke = theme.stroke,
                    textFillColor = theme.color,
                    position,
                    lineWidth,
                    contentX = x,
                    contentY = y;

                if (imageUrl && imageUrl.length > 0) {

                    imageX = x + 2 * paddingSize;
                    imageY = y - imageSize / 2 + 1;
                    for (var i = 0, len = imageUrl.length; i < len; i++) {
                        imageElements.push(paper.image(imageUrl[i], imageX, imageY, imageSize, imageSize));
                        if (i !== len - 1) {
                            imageX += paddingSize + imageSize;
                        } else {
                            imageX += paddingSize;
                        }
                    }
                    imageWidth = imageX - x;
                }

                x = x + imageWidth + 3 * paddingSize;
                textElement = paper.text(x, y, text).attr({
                    "font-size": 12,
                    "font-weight": "bolder",
                    fill: textFillColor,
                    "text-anchor": "start"
                });

                position = textElement.getBBox();
                width = position.width;

                innerRectElement = paper.rect(contentX + paddingSize, y - height / 2, width + 4 * paddingSize + imageWidth, height, radius).attr({
                    fill: theme.inner.fill,
                    "stroke-width": theme.inner["stroke-width"],
                    stroke: theme.inner.stroke
                });

                outRectElement = paper.rect(contentX, y - height / 2 - paddingSize, width + imageWidth + 6 * paddingSize, height + 2 * paddingSize, radius).attr({
                    stroke: theme.outer.stroke,
                    "stroke-width": theme.outer["stroke-width"]
                });

                textElement.toFront();
                for (i = 0, len = imageElements.length; i < len; i++) {
                    imageElements[i].toFront();
                }

                position = outRectElement.getBBox();
                lineWidth = position.width;

                getNextX(lineWidth);
                endY === 0 ? endY = Math.ceil(position.height / 2) + 6 : null;
            }

            //�쎾뻠訝�슈瀛요툓�꾤봇
            function createCentralAxisLine(x, y, radius) {

                var r = 10,
                    theme = getTheme().centralAxisLine,
                    bgColor = theme.fill,
                    lineWidth = 4 * r,
                    pathStr = "";

                pathStr = "M" + x + " " + y + "L" + (x + lineWidth) + " " + y;
                paper.path(pathStr).attr({
                    "stroke-width": 2,
                    stroke: bgColor,
                    "stroke-dasharray": ["-"]
                });

                getNextX(lineWidth);
            }

            //�쎾뻠訝�슈瀛요툓�꾢늽��뒄��
            function createCentralAxisBranchNode(x, y) {
                var theme = getTheme().centralAxisBranchNode,
                    r = theme.radius,
                    bgColor = theme.fill;

                paper.circle(x, y, r - 2).attr({
                    "stroke-width": 2,
                    stroke: bgColor
                });

                paper.circle(x, y, r - 5).attr({
                    fill: bgColor,
                    "stroke-width": 0,
                    stroke: bgColor
                });

            }

            //�쎾뻠訝�슈瀛요툓�녷뵱�귞궧�꾢냵若�
            function createCentralAxisBranchContent(x, y, text, imageUrl) {

                var r = 10,
                    r_bottom = 2,
                    content_theme = getTheme().centralAxisBranchContent,
                    line_theme = getTheme().centralAxisBranchLine,
                    bgColor = content_theme.fill,
                    textFillColor = content_theme.color,
                    stroke = content_theme.stroke,
                    pathStr = "",
                    height = content_theme.height,
                    width = 0,
                    index = index || 1,
                    offsetLineHeight = 2 * r,
                    operator = +1,
                    _endX = 0,
                    _endY = 0,
                    contentX,
                    contentY,
                    imageX,
                    imageY,
                    imageWidth = 0,
                    textX,
                    textY,
                    textElement,
                    imageElements = [],
                    imageSize = 14,
                    position;

                getNextY();
                nextY > 0 ? operator = +1 : operator = -1;
                _endX = x;
                _endY = nextY;


                pathStr = "M" + x + " " + y + "L" + x + " " + _endY;
                paper.path(pathStr).attr({
                    "stroke-width": 1,
                    stroke: line_theme.stroke
                });

                paper.circle(x, _endY - operator * r_bottom, r_bottom).attr({
                    fill: line_theme.stroke,
                    "stroke-width": 0,
                    stroke: line_theme.stroke
                });

                _endX = x - 2 * r;
                _endY = operator > 0 ? _endY - operator * (height + 6) :
                    _endY - operator * 6 + r_bottom;

                contentX = _endX;
                contentY = _endY;
                imageX = contentX + content_theme["padding"];

                if (imageUrl && imageUrl.length > 0) {

                    imageX = imageX + r / 2;
                    imageY = contentY + 4;
                    for (var i = 0, len = imageUrl.length; i < len; i++) {
                        imageElements.push(paper.image(imageUrl[i], imageX, imageY, imageSize, imageSize));
                        if (i !== len - 1) {
                            imageX += r / 2 + imageSize;
                        } else {
                            imageX += r;
                        }
                    }
                    imageWidth = imageX - contentX;
                }

                textX = imageX + r;
                textY = contentY + r;
                textElement = paper.text(textX, textY, text).attr({
                    "font-size": 12,
                    fill: textFillColor,
                    "text-anchor": "start",
                    title: text
                });

                position = textElement.getBBox();
                width = position.width;
                height = position.height + 5;

                paper.rect(contentX, contentY, imageWidth + position.width + content_theme["padding"] + 2 * r, height, content_theme.radius).attr({
                    fill: bgColor,
                    stroke: stroke,
                    "stroke-width": 1
                });

                //�ㅶ뼪�녷뵱�끻��꾢츩�끿퍜�잋퐤營�펽�ⓧ틢鵝쒍맏�잍닇瀯볠씇�귞궧�꼡饔닷뢿��
                _endX = contentX + imageWidth + position.width + 2 * r;
                setEndX(_endX);

                for (i = 0, len = imageElements.length; i < len; i++) {
                    imageElements[i].toFront();
                }
                textElement.toFront();
            }

            //�쎾뻠訝�슈瀛요툓�꾢늽��뒄��
            function createBranchNode(x, y, text, imageUrl, radius) {
                var r = radius;
                createCentralAxisLine(x, y, r);
                //訝�뿴鵝띸쉰
                x += r * 2;
                createCentralAxisBranchNode(x, y);
                createCentralAxisBranchContent(x, y, text, imageUrl);
            }

            //�쎾뻠�얌풃
            function createLegend() {
                var item,
                    text,
                    name,
                    imageUrl,
                    r = 5,
                    imageSize = 14,
                    position,
                    _startX = startX + 2 * r,
                    _startY = 0,
                    textElement;

                _startY = -(endY + legendHeight) + 4 * r;

                for (var i in legend) {
                    item = legend[i];
                    text = item.text;
                    imageUrl = getImageUrl(item.icon);

                    paper.image(imageUrl, _startX - 6, _startY - 6, imageSize, imageSize);

                    _startX += imageSize;
                    textElement = paper.text(_startX, _startY, text).attr({
                        "font-size": 12,
                        "fill": theme.lengend.fill,
                        "text-anchor": "start"
                    });

                    position = textElement.getBBox();
                    _startX += position.width + 4 * r;

                }

            }

            function init(opt) {

                var _legend,
                    children = [],
                    item,
                    text,
                    type,
                    imageUrl,
                    r;

                _legend = opt.legend || [];
                data = opt.data || [];

                if (_legend.length === 0) {
                    legendHeight = 0;
                }
                //弱녶쎗堊뗦빊��졏凉뤺쉬�㏘맏餓쩸ame映삣엹訝븅뵰�쇘쉪野배괌
                for (var i = 0, len = _legend.length; i < len; i++) {
                    item = _legend[i];
                    legend[item.name] = item;
                }

                if (!data || data.length === 0) {
                    return;
                }

                //�쎾뻠凉�冶뗨뒄��
                createStartNode(startX, startY);
                //�쎾뻠�끻��귞궧
                for (i = 0, len = data.length; i < len; i++) {
                    item = data[i];
                    text = item.text;
                    imageUrl = getImageUrl(item.imageUrl, null);
                    children = item.children || [];
                    r = 10;
                    //�쎾뻠訝삭뒄��
                    createCentralAxisNode(nextX, startY, text, imageUrl);
                    //�쎾뻠�녷뵱�귞궧
                    if (children.length === 0 && i !== len - 1) {
                        //訝띶춼�ⓨ늽��뒄�뱄펽�ゅ닗兩뷰릎饔당봇
                        createCentralAxisLine(nextX, startY, r);
                    } else if (children.length > 0) {
                        //�띸쉰nextY,�곁쉪訝삭뒄�밥툔�꾢늽��뒄�퉋饔답퐤營�썮鸚띴맏�앭쭓鵝띸쉰
                        nextY = startY;
                        currentBranchCount = children.length;
                        //耶섇쑉�녷뵱�귞궧竊뚦닗兩뷴늽��냵若배뒄��
                        for (var j = 0, lenj = children.length; j < lenj; j++) {
                            item = children[j];
                            text = item.text;
                            imageUrl = getImageUrl(item.imageUrl, item.legendName);
                            createBranchNode(nextX, startY, text, imageUrl, r);
                        }
                    }
                }

                console.log(endX)
                //�쎾뻠瀯볠씇�귞궧
                createEndNode(nextX, startY);

                //�쎾뻠�얌풃
                createLegend();
                //溫양쉰�삣툋鸚㎩컦
                pagerWidth = nextX + ViewBoxX;
                pagerHeight = Math.abs(endY * 2) + legendHeight;
                paper.setSize(pagerWidth, pagerHeight);
                //溫양쉰ViewBox�뤹㎉��
                ViewBoxY = Math.abs(endY * 2) / 2 + legendHeight;
                paper.setViewBox(-ViewBoxX, -ViewBoxY, pagerWidth, pagerHeight, false);
            }

            container.addClass("timeline");
            init(opt);
            return container;
        },
    });

    $.extend({
        timeline: {
            theme: {
                yellow: {
                    lengend: {
                        fill: "#000000",
                    },
                    startNode: {
                        radius: 10,
                        fill: "#7E899D"
                    },
                    endNode: {
                        radius: 10,
                        fill: "#7E899D"
                    },
                    centralAxisNode: {
                        height: 21,
                        radius: 4,
                        fill: "#1A84CE",
                        color: "#ffffff",
                        inner: {
                            fill: "#1A84CE",
                            "stroke-width": 0,
                            stroke: "#1A84CE"
                        },
                        outer: {
                            fill: "#1A84CE",
                            "stroke-width": 3,
                            stroke: "#1A84CE"
                        }
                    },
                    centralAxisLine: {
                        fill: "#7E899D"
                    },
                    centralAxisBranchNode: {
                        fill: "#F9BF3B",
                        radius: 10
                    },
                    centralAxisBranchLine: {
                        stroke: '#F9BF3B',
                        fill: "#F9BF3B"
                    },
                    centralAxisBranchContent: {
                        fill: "#F9BF3B",
                        color: "#ffffff",
                        stroke: '#ffffff',
                        height: 24,
                        radius: 6,
                        "padding": 0
                    }
                },
                gray: {
                    lengend: {
                        fill: "#5A5A5A",
                    },
                    startNode: {
                        radius: 6,
                        fill: "#7E899D"
                    },
                    endNode: {
                        radius: 6,
                        fill: "#7E899D"
                    },
                    centralAxisNode: {
                        height: 18,
                        radius: 2,
                        //fill: "#1A84CE",
                        color: "#1A84CE",
                        inner: {
                            fill: "#ffffff",
                            "stroke-width": 0,
                            stroke: "#1A84CE"
                        },
                        outer: {
                            fill: "#1A84CE",
                            "stroke-width": 2,
                            stroke: "#1A84CE"
                        }
                    },
                    centralAxisLine: {
                        fill: "#7E899D"
                    },
                    centralAxisBranchNode: {
                        fill: "#7E899D",
                        radius: 8
                    },
                    centralAxisBranchLine: {
                        stroke: '#526079',
                        fill: "'#526079"
                    },
                    centralAxisBranchContent: {
                        fill: "#FFFFFF",
                        color: "#111111",
                        stroke: '#526079',
                        height: 24,
                        radius: 12,
                        "padding": 6
                    }
                }
            }
        }
    });

})(jQuery);