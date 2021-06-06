
var city="";

var findCity = $("#find-city");
var searchButton = $("#search-button");
var deleteButton = $("#delete-history");
var currentCity = $("#current-city");
var showTemperature = $("#temperature");
var showHumidty= $("#humidity");
var windSpeed=$("#wind-speed");
var uvIndex= $("#uv-index");
var sCity=[];

function find(c){
    for (var i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}
// the API key
var APIKey="a0aca8a89948154a4182dcecc780b513";

function displayWeather(event){
    event.preventDefault();
    if(findCity.val().trim()||""){
        city=findCity.val().trim();
        showWeather(city);
    }
}

function showWeather(city){
    
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

        // show current weather 
        console.log(response);
   
        var weathericon= response.weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        
        var date=new Date(response.dt*1000).toLocaleDateString();
       
        $(currentCity).html(response.name +"("+date+")" + "<img src="+iconurl+">");
       
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(showTemperature).html((tempF).toFixed(2)+"&#8457");
        // Display the Humidity
        $(showHumidty).html(response.main.humidity+"%");
        //Display Wind speed and convert to MPH
        var ws=response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(windSpeed).html(windsmph+"MPH");
        // Display UVIndex.
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            sCity=JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity==null){
                sCity=[];
                sCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}
    // display the uvi info
function UVIndex(ln,lt){
    
    var uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(uvIndex).html(response.value);
            });
}
    
//show forcast info
function forecast(cityid){
    var dayover= false;
    var forcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({
        url:forcastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
            var date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode= response.list[((i+1)*8)-1].weather[0].icon;
            var iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
            var tempK= response.list[((i+1)*8)-1].main.temp;
            var tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity= response.list[((i+1)*8)-1].main.humidity;
        
            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconurl+">");
            $("#fTemp"+i).html(tempF+"&#8457");
            $("#fHumidity"+i).html(humidity+"%");
        }
        
    });
}

function addToList(c){
    var listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}

function oldSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        showWeather(city);
    }

}


function lastCity(){
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        showWeather(city);
    }

}
//delete the search history
function deleteHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}

$("#search-button").on("click",displayWeather);
$(document).on("click",oldSearch);
$(window).on("load",lastCity);
$("#delete-history").on("click",deleteHistory);