window.onload = function () {

    var arrSplit =  $('#urlshorten').val().split("/");
    var id = arrSplit[arrSplit.length-1];
    $.ajax({
        url: '/api/stats/' + id,
        type: 'GET',
        dataType: 'JSON',
        success: function (data) {
            var newParagraph = document.createElement('p');
            newParagraph.textContent = "Created at: " + data.created + "Count:" + data.visits;
            document.getElementById("link").appendChild(newParagraph);
            $('#link').hide().fadeIn('slow');
        }
    });

    $.ajax({
        url: '/api/groupByReferal/' + id,
        type: 'GET',
        dataType: 'JSON',
        success: function (data) {
           console.log(data);
           makeChartReferral(data);
        }
    });
    $.ajax({
        type: 'GET',
        url: '/api/dailyLast30days/' + id,
        dataType: 'JSON',
        success: function (data) {
            // Do some stuff to the data
            makeChartDailyhit(data);
        }
    });
    $.ajax({
        type: 'GET',
        url: '/api/weeklyByMonth/' + id,
        dataType: 'JSON',
        success: function (data) {
            // Do some stuff to the data
            makeChartWeeklyhit(data);
        }
    });
}
function makeChartReferral(data) {

    var dataReferral=[];
    var totalhit=0;
    for(var i=0;i<data.length;i++)
    {
        totalhit += parseInt(data[i].Count)    ;

    }
    for(var i=0;i<data.length;i++)
    {
        var percertage=(data[i].Count/totalhit)*100;
        if(data[i].referral=null)
            data[i].referral="other";
        dataReferral.push({"y": percertage,"indexLabel": data[i].referral});
    }
    var chart = new CanvasJS.Chart("chartReferral",
        {
            title: {
                text: "chartReferral"
            },
            legend: {
                itemclick: function (e) {
                    e.dataPoint.exploded = true;
                    e.chart.render();
                }
            },
            data: [
                {
                    type: "pie",
                    showInLegend: true,
                    dataPoints: dataReferral
                    //     [
                    //     // {y: 4181563, indexLabel:"Second".},
                    //     // {y: 2175498, indexLabel: "Second"},
                    //     // {y: 3125844, indexLabel: "Third"}
                    // ]
                }
            ]
        });
    chart.render();
}
function makeChartDailyhit(data) {
    var dataDailyhit=[];
    for(var i=0;i<data.length;i++)
    {
        var stringdate=data[i]._id.year+","+data[i]._id.month+","+data[i]._id.day;
        var date=new Date(stringdate);
        dataDailyhit.push({"x": date,"y": data[i].count});
    }
    var chart = new CanvasJS.Chart("chartDailyhit",
        {
            title: {
                text: "Daily hit 30 days Chart"
            },
            axisX: {
                title: "timeline",
                gridThickness: 1,
                valueFormatString: "DD",
                interval:1,
                intervalType: "day"
            },
            axisY: {
                title: "git"
            },
            data: [
                {
                    type: "area",
                    dataPoints:dataDailyhit

                }
            ]
        });
    chart.render();
}
function makeChartWeeklyhit(data) {
    var dataWeeklyhit=[];
    for(var i=0;i<data.length;i++)
    {
        var weekofmonth=(data[i]._id.week%4)+1;
        dataWeeklyhit.push({"y": data[i].count,label:+ weekofmonth +" of "+data[i]._id.month});
    }

    var chart = new CanvasJS.Chart("chartWeeklyhit",
        {
            title: {
                text: "Weekly hit Chart"
            },

            data: [
                {
                    type: "column",
                    dataPoints:dataWeeklyhit
                }
            ]
        });
    chart.render();
}

