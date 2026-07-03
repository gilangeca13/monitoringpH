// =====================================
// KONFIGURASI THINGSPEAK
// =====================================

const CHANNEL_ID = "3414185";
const READ_API_KEY = "8G6CT9E94G2TVT6W";


const API_URL =
`https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${READ_API_KEY}&results=20`;


let chart;



// =====================================
// AMBIL DATA
// =====================================

async function loadData(){

    try{

        const response =
        await fetch(API_URL);


        const data =
        await response.json();


        const feeds =
        data.feeds;


        if(!feeds || feeds.length===0)
            return;



        updateDashboard(feeds);

        updateChart(feeds);

        updateTable(feeds);



    }catch(error){

        console.log(
            "Gagal mengambil data",
            error
        );

    }

}





// =====================================
// DASHBOARD
// =====================================

function updateDashboard(feeds){


    const latest =
    feeds[feeds.length-1];


    const ph =
    parseFloat(latest.field1);



    const status =
    cekStatus(ph);



    const phElement =
    document.getElementById("ph");


    const statusElement =
    document.getElementById("status");


    const updateElement =
    document.getElementById("lastUpdate");


    const alertBox =
    document.getElementById("alertBox");




    if(phElement){

        phElement.innerHTML =
        ph.toFixed(2);

    }




    if(statusElement){


        statusElement.innerHTML =
        status;



        statusElement.className =
        "status";



        if(status=="AMAN"){


            statusElement.classList.add(
                "aman"
            );

        }


        else if(status=="WASPADA"){


            statusElement.classList.add(
                "waspada"
            );

        }


        else{


            statusElement.classList.add(
                "bahaya"
            );

        }

    }





    if(alertBox){


        if(status=="AMAN"){


            alertBox.className =
            "alert alert-success";


            alertBox.innerHTML =
            "🟢 Kondisi air aman";

        }



        else if(status=="WASPADA"){


            alertBox.className =
            "alert alert-warning";


            alertBox.innerHTML =
            "🟡 Kondisi air perlu diperhatikan";

        }



        else{


            alertBox.className =
            "alert alert-danger";


            alertBox.innerHTML =
            "🔴 Kondisi air berbahaya";

        }


    }




    if(updateElement){

        updateElement.innerHTML =
        new Date(
            latest.created_at
        )
        .toLocaleString("id-ID");

    }



}







// =====================================
// STATUS PH
// =====================================

function cekStatus(ph){



    if(ph >= 6.5 && ph <= 8.5){

        return "AMAN";

    }



    if(
        (ph >= 5 && ph < 6.5) ||
        (ph > 8.5 && ph <= 9)
    ){

        return "WASPADA";

    }



    return "BAHAYA";

}








// =====================================
// CHART
// =====================================


function updateChart(feeds){


    let labels=[];

    let values=[];



    feeds.forEach(feed=>{


        labels.push(

            new Date(
                feed.created_at
            )
            .toLocaleTimeString("id-ID")

        );


        values.push(
            parseFloat(feed.field1)
        );


    });




    const ctx =
    document.getElementById("phChart");



    if(!ctx) return;



    if(chart)
        chart.destroy();




    chart =
    new Chart(ctx,{


        type:"line",



        data:{


            labels:labels,


            datasets:[{


                label:"pH Air",


                data:values,


                borderWidth:3,


                tension:.4,


                fill:true,


                backgroundColor:
                "rgba(30, 58, 138, .15)",


                borderColor:
                "#1e3a8a"



            }]

        },



        options:{


            responsive:true,


            maintainAspectRatio:false,



            scales:{


                y:{


                    suggestedMin:4,

                    suggestedMax:10,

                    title: {
                        display: true,
                        text: 'Kadar pH',
                        align: 'end',
                        font: {
                            weight: 'bold'
                        }
                    }


                },


                x:{


                    title: {
                        display: true,
                        text: 'Waktu',
                        align: 'end',
                        font: {
                            weight: 'bold'
                        }
                    }


                }


            }



        }


    });



}









// =====================================
// TABLE
// =====================================

function updateTable(feeds){



    const tbody =
    document.getElementById(
        "historyTable"
    );



    if(!tbody)return;



    tbody.innerHTML="";



    [...feeds].reverse()
    .forEach(feed=>{


        const ph =
        parseFloat(feed.field1);



        const status =
        cekStatus(ph);



        let badge =
        "badge-aman";



        if(status=="WASPADA")

            badge =
            "badge-waspada";



        if(status=="BAHAYA")

            badge =
            "badge-bahaya";




        const row =
        document.createElement("tr");



        row.innerHTML = `

        <td>
        ${new Date(feed.created_at)
        .toLocaleString("id-ID")}
        </td>


        <td>
        ${ph.toFixed(2)}
        </td>


        <td>

        <span class="badge ${badge}">

        ${status}

        </span>

        </td>

        `;



        tbody.appendChild(row);



    });



}








// =====================================
// AUTO REFRESH
// =====================================


loadData();



setInterval(
    loadData,
    15000
);








// =====================================
// CLOCK
// =====================================


setInterval(()=>{


    const clock =
    document.getElementById("clock");



    if(clock){


        clock.innerHTML =
        new Date()
        .toLocaleString("id-ID");


    }



},1000);

// =====================================
// PWA SERVICE WORKER
// =====================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Sesuaikan path berdasarkan lokasi file (index.html vs pages/*.html)
        const swPath = window.location.pathname.includes('/pages/') ? '../sw.js' : 'sw.js';
        
        navigator.serviceWorker.register(swPath)
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
