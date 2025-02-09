/**
 * Created by chaika on 09.02.16.
 */
var Pizza_List = require('./data/Pizza_List');

exports.getPizzaList = function(req, res) {
    res.send(Pizza_List);
};

exports.createOrder = function(req, res) {
    var order_info = req.body;
    console.log("Creating Order", order_info);
    let priceOfOrder = 0;
    let pizzasToOrder = order_info.pizzas;
    console.log(pizzasToOrder);
    for (let i = 0; i < pizzasToOrder.length;i++){
        if (pizzasToOrder[i].size === 'big_size'){
            priceOfOrder += pizzasToOrder[i].pizza.big_size.price * pizzasToOrder[i].quantity;
        }
        else{
            priceOfOrder += pizzasToOrder[i].pizza.small_size.price * pizzasToOrder[i].quantity;
        }
    }
    let parse_order = parse_order_info(order_info);


    var order	=	{
        version:	3,
        public_key:	"sandbox_i43512307645",
        action:	"pay",
        amount:	priceOfOrder,
        currency:	"UAH",
        description:	parse_order,
        order_id:	Math.random(),
//!!!Важливо щоб було 1,	бо инакше візьме гроші!!!
        sandbox:	1
    };
    var data	=	base64(JSON.stringify(order));
    var signature	=	sha1("sandbox_t7iArNijeHGzQH9yATY8qAOfxeqVfaj8ib8P6G5L" + data + "sandbox_t7iArNijeHGzQH9yATY8qAOfxeqVfaj8ib8P6G5L");
    var receipt = {
        data: data,
        signature : signature
    };

    res.send(receipt);

};

function parse_order_info(order_info) {
    let str = '';
    let pizzas = order_info.pizzas;
    str += order_info.name + ", " + order_info.phoneNumber + ", " + order_info.address + "\n";
    for (let i = 0; i < pizzas.length;i++){
        str += pizzas[i].pizza.title + " - " + pizzas[i].size + "\n";
    }
    return str;
};

function	base64(str)	 {
    return	new	Buffer(str).toString('base64');
};

var crypto	=	require('crypto');

function	sha1(string)	{
    var sha1	=	crypto.createHash('sha1');
    sha1.update(string);
    return	sha1.digest('base64');
};