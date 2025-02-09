/**
 * Created by chaika on 02.02.16.
 */
var Templates = require('../Templates');
var PizzaCart = require('./PizzaCart');
var API = require('../API');
var Pizza_List = [];
var thisUrl = "http://localhost:5050";
var orderUrl = thisUrl + "/order.html";

//HTML елемент куди будуть додаватися піци
var $pizza_list = $("#pizza_list");

function showPizzaList(list) {
    //Очищаємо старі піци в кошику
    $pizza_list.html("");

    //Оновлення однієї піци
    function showOnePizza(pizza) {
        var html_code = Templates.PizzaMenu_OneItem({pizza: pizza});

        var $node = $(html_code);

        $node.find(".buy-big").click(function(){
            PizzaCart.addToCart(pizza, PizzaCart.PizzaSize.Big);
        });
        $node.find(".buy-small").click(function(){
            PizzaCart.addToCart(pizza, PizzaCart.PizzaSize.Small);
        });

        $pizza_list.append($node);
    }

    list.forEach(showOnePizza);
    $(".pizza-count").text(list.length.toString());
}

function filterPizza(filter) {
    //Масив куди потраплять піци які треба показати
    var pizza_shown = [];
    if (filter === 'all') {
        Pizza_List.forEach(function(pizza){
            pizza_shown.push(pizza);
        });
    }
    else if (filter === 'vega'){
        Pizza_List.forEach(function(pizza){
            if(!pizza.content.meat && !pizza.content.ocean)
                pizza_shown.push(pizza);
        });
    }
    else {
        Pizza_List.forEach(function (pizza) {
            for (const [key] of Object.entries(pizza.content))
                if (key === filter)
                    pizza_shown.push(pizza);
        });
    }

    //Показати відфільтровані піци
    showPizzaList(pizza_shown);
}

function initPizzaList(error, data){
    if (error === null){
        Pizza_List = data;
        showPizzaList(Pizza_List);
    }
}

function initialiseMenu() {
    API.getPizzaList(initPizzaList);
    //Показуємо усі піци
    showPizzaList(Pizza_List);
}

$("#all-filter").click(function () {
    showPizzaList(Pizza_List);
    $("#meat-filter").removeClass("btn-selected");
    $("#pineapple-filter").removeClass("btn-selected");
    $("#mushroom-filter").removeClass("btn-selected");
    $("#seafood-filter").removeClass("btn-selected");
    $("#vegetarian-filter").removeClass("btn-selected");
    $("#all-filter").addClass("btn-selected");
});
$("#meat-filter").click(function () {
    filterPizza("meat");
    $("#all-filter").removeClass("btn-selected");
    $("#pineapple-filter").removeClass("btn-selected");
    $("#mushroom-filter").removeClass("btn-selected");
    $("#seafood-filter").removeClass("btn-selected");
    $("#vegetarian-filter").removeClass("btn-selected");
    $("#meat-filter").addClass("btn-selected");
});
$("#pineapple-filter").click(function () {
    filterPizza("pineapple");
    $("#all-filter").removeClass("btn-selected");
    $("#meat-filter").removeClass("btn-selected");
    $("#mushroom-filter").removeClass("btn-selected");
    $("#seafood-filter").removeClass("btn-selected");
    $("#vegetarian-filter").removeClass("btn-selected");
    $("#pineapple-filter").addClass("btn-selected");
});
$("#mushroom-filter").click(function () {
    filterPizza("mushroom");
    $("#all-filter").removeClass("btn-selected");
    $("#meat-filter").removeClass("btn-selected");
    $("#pineapple-filter").removeClass("btn-selected");
    $("#seafood-filter").removeClass("btn-selected");
    $("#vegetarian-filter").removeClass("btn-selected");
    $("#mushroom-filter").addClass("btn-selected");
});
$("#seafood-filter").click(function () {
    filterPizza("ocean");
    $("#all-filter").removeClass("btn-selected");
    $("#meat-filter").removeClass("btn-selected");
    $("#pineapple-filter").removeClass("btn-selected");
    $("#mushroom-filter").removeClass("btn-selected");
    $("#vegetarian-filter").removeClass("btn-selected");
    $("#seafood-filter").addClass("btn-selected");
});
$("#vegetarian-filter").click(function () {
    filterPizza("vega");
    $("#all-filter").removeClass("btn-selected");
    $("#meat-filter").removeClass("btn-selected");
    $("#pineapple-filter").removeClass("btn-selected");
    $("#mushroom-filter").removeClass("btn-selected");
    $("#seafood-filter").removeClass("btn-selected");
    $("#vegetarian-filter").addClass("btn-selected");
});

$(".btn-order").click(function () {
    var checkUrl = window.location.href;
    if (checkUrl.endsWith("order.html")) {
        window.location.href = thisUrl;
    } else {
        window.location.href = orderUrl;
    }
});

function isCharAName(ch) {
    return (ch.toLowerCase() != ch.toUpperCase()) || ch == " " || ch == "'" || ch == "-";
}

function isCharANumber(c) {
    return c >= '0' && c <= '9';
}

function checkName(name) {
    if (name.length == 0) return false;
    for (var i = 0; i < name.length; i++) {
        if (!isCharAName(name[i])) {
            return false;
        }
    }
    return true;
}

function checkPhoneNumber(number) {
    if ((number.startsWith("+380") && number.length == 13) || (number.startsWith("0") && number.length == 10)) {
        for (var i = 1; i < number.length; i++) {
            if (!isCharANumber(number[i])) {
                return false;
            }
        }
        return true;
    }
    return false;
}

$("#inputName").keyup(function (){
    if (checkName(this.value))
        $("#wrongName").css("display", "none");
    else $("#wrongName").css("display", "block");
});

$("#inputPhoneNumber").keyup(function (){
    if (checkPhoneNumber(this.value))
        $("#wrongPhone").css("display", "none");
    else $("#wrongPhone").css("display", "block");
});

function sendToServer(error, data) {
    if (!error){
        LiqPayCheckout.init({
            data:	data.data,
            signature:	data.signature,
            embedTo:	"#liqpay",
            mode:	"popup"	//	embed	||	popup
        }).on("liqpay.callback",	function(data){
            console.log(data.status);
            console.log(data);
        }).on("liqpay.ready",	function(data){
//	ready
        }).on("liqpay.close",	function(data){
//	close
        });
    }
}

$("#makeOrder").click(function () {
    var name = $("#inputName").val();
    var phoneNumber = $("#inputPhoneNumber").val();
    var address = $("#inputAddress").val();
    if (checkName(name) && checkPhoneNumber(phoneNumber)){
        var pizza = [];
        PizzaCart.getPizzaInCart().forEach(element =>
            pizza.push(element));
        var order_info = {
            phoneNumber: phoneNumber,
            name: name,
            address: address,
            pizzas: pizza
        }
        API.createOrder(order_info, sendToServer);
    }
});

var directionsRenderer = new google.maps.DirectionsRenderer();

function initialize()	{
//Тут починаємо працювати з картою
    var mapProp =	{
        center:	new	google.maps.LatLng(50.464379,30.519131),
        zoom:	11
    };
    var html_element =	document.getElementById("googleMap");
    var map	= new google.maps.Map(html_element,	 mapProp);
    //Карта створена і показана
    var point	=	new	google.maps.LatLng(50.464379,30.519131);
    var marker	=	new	google.maps.Marker({
        position:	point,
        //map	- це змінна карти створена за допомогою new google.maps.Map(...)
        map:	map,
        icon:	"assets/images/map-icon.png"
    });
//Видалити маркер з карти можна за допомогою
//     marker.setMap(null);
    directionsRenderer.setMap(map);
    let homeMarker;
    google.maps.event.addListener(map,
        'click',function(me){
            var coordinates	=	me.latLng;
            if (homeMarker == null) {
                homeMarker = new google.maps.Marker({
                    position: coordinates,
                    map,
                    icon: "assets/images/home-icon.png"
                });
            } else {
                homeMarker.setPosition(coordinates);
            }
            geocodeLatLng(coordinates,	function(err,	adress){
                if(!err)	{
//Дізналися адресу
                    $("#address-field").text(adress);
                    $("#inputAddress").val(adress);
                    console.log(adress);
                    geocodeAddress(adress, function (err, adress) {
                        if (!err) {
                            calculateRoute(mapProp.center, adress, function (err, distance) {
                                if (!err) {
                                    console.log(distance.duration.text);
                                    $("#order-time-field").text(distance.duration.text);
                                }
                            });
                        }
                    })
                }	else	{
                    console.log("Немає адреси")
                }
            })
        });

}

function geocodeLatLng(latlng,	 callback){
//Модуль за роботу з адресою
    var geocoder	=	new	google.maps.Geocoder();
    geocoder.geocode({'location':	latlng},	function(results,	status)	{
        if	(status	===	google.maps.GeocoderStatus.OK&&	results[1])	{
            var adress =	results[1].formatted_address;
            callback(null,	adress);
        }	else	{
            callback(new	Error("Can't find adress"));
        }
    });
}

function geocodeAddress(adress,	 callback)	{
    var geocoder	=	new	google.maps.Geocoder();
    geocoder.geocode({'address':	adress},	function(results,	status)	{
        if	(status	===	google.maps.GeocoderStatus.OK&&	results[0])	{
            var coordinates	=	results[0].geometry.location;
            callback(null,	coordinates);
        }	else	{
            callback(new	Error("Can	not	find	the	adress"));
        }
    });
}

function	calculateRoute(A_latlng,	 B_latlng,	callback)	{
    var directionService =	new	google.maps.DirectionsService();
    directionService.route({
        origin:	A_latlng,
        destination:	B_latlng,
        travelMode:	google.maps.TravelMode["DRIVING"]
    },	function(response,	status)	{
        if	(	status	==	google.maps.DirectionsStatus.OK )	{
            directionsRenderer.setDirections(response);
            var leg	=	response.routes[	0	].legs[	0	];
            callback(null,	{
                duration:	leg.duration
            });
        }	else	{
            callback(new	Error("Can'	not	find	direction"));
        }
    });
}


//Коли сторінка завантажилась
google.maps.event.addDomListener(window,'load',	initialize);

exports.filterPizza = filterPizza;
exports.initialiseMenu = initialiseMenu;