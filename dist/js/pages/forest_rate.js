function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function getInternetExplorerVersion()
{
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer')
    {
        var ua = navigator.userAgent;
        var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat( RegExp.$1 );
    }
    return rv;
}

(function($) {

    var oldIE = false;
    ieVersion = getInternetExplorerVersion();

    if (ieVersion > 0 && ieVersion < 9) {
        oldIE = true;
    }

    $(function() {

        var chartContainer = $('#chart-container'),
            oldIEChartContainer = $('#oldie-chart-image'),
            forestColor = '#2CA25F',
            notForestColor = '#E5F5F9',
            maxRadius = 60,
            padding = 20,
            padding2 = 0,
            width = 0,
            height = 0,
            html = '',
            chartBox;

        $('#radio').buttonset();

        $('#radio').find('input').on('click', function() {
            var value = this.value

            if ( ! oldIE) {
                chartContainer.children('.chart-box').each(function() {
                    chartBox = $(this);

                    switch (value) {
                        case 'forestPercentage':
                            chartBox.find('.detail').text(chartBox.data('forest_percentage'));
                            break;

                        case 'land':
                            chartBox.find('.detail').text(chartBox.data('land_formatted'));
                            break;

                        case 'forest':
                            chartBox.find('.detail').text(chartBox.data('forest_formatted'));
                            break;
                    }
                });

                chartContainer.isotope({ sortBy : this.value });
            } else {
                oldIEChartContainer.find('img').hide();
                oldIEChartContainer.find('.' + value).show();
            }
        });

        if (oldIE) {
            oldIEChartContainer.find('.forestPercentage').show();
            return;
        }

        $.ajax({
            url: 'http://www.a-rms.net/dist/js/pages/forest_rate.json',
            dataType: 'json',
            success: function(data) {
                var items = data.items,
                    maxLand = 0;

                items.sort(function(a, b) {
                    return b.land - a.land;
                });
                maxLand = items[0].land;

                $.each(items, function(i) {
                    this.notForest = this.land - this.forest;
                    this.forestPercentage = (this.forest / this.land * 100).toFixed(1);
                    this.notForestPercentage = (100 - this.forestPercentage).toFixed(1);
                    this.forestFormatted = addCommas(this.forest);
                    this.landFormatted = addCommas(this.land);

                    radius = parseInt((Math.sqrt(this.land) / Math.sqrt(maxLand)) * maxRadius, 10) + padding;
                    padding2 = maxRadius - radius + padding;

                    html = '<div id="chart-box-' + (i + 1) + '" class="chart-box" data-land_formatted="' + this.landFormatted + 'ha" data-forest_formatted="' + this.forestFormatted + 'ha" data-forest_percentage="' + this.forestPercentage + '%">';
                    html += '<h2 style="top:' + padding2 + 'px;">' + this.location + '</h2>';
                    html += '<p class="land hidden">' + this.land + '</p>';
                    html += '<p class="forest hidden">' + this.forest + '</p>';
                    html += '<p class="forest-percentage hidden">' + this.forestPercentage + '</p>';
                    html += '<canvas id="chart-' + (i + 1) + '" class="chart" width="' + (radius * 2) + '" height="' + (radius * 2) + '" style="margin-top:-' + radius + 'px; margin-left:-' + radius + 'px;"></canvas>';
                    html += '<p class="detail" style="bottom:' + padding2 + 'px;">' + this.forestPercentage + '%</p>';
                    html += '</div>';

                    chartContainer.append(html);

                    new Chart(document.getElementById('chart-' + (i + 1)).getContext('2d')).Pie([
                        {
                            value: +(this.notForest),
                            color: notForestColor
                        },
                        {
                            value: +(this.forest),
                            color: forestColor
                        }
                    ]);

                });

                $('#chart-container').isotope({
                    itemSelector : '.chart-box',
                    sortBy : 'forestPercentage',
                    sortAscending : false,
                    layoutMode : 'masonry',
                    animationEngine: 'jquery',
                    getSortData : {
                        land : function ( $elem ) {
                            return parseInt($elem.find('.land').text(), 10);
                        },
                        forest : function ( $elem ) {
                            return parseInt($elem.find('.forest').text(), 10);
                        },
                        forestPercentage : function ( $elem ) {
                            return (+$elem.find('.forest-percentage').text()).toFixed(1);
                        }
                    }
                });

                $('.chart').show();
            }
        });

    });

})(window.jQuery);