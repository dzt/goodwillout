const _ = require('underscore');
const cheerio = require('cheerio');
const async = require('async');
const open = require("open");
var j = require('request').jar();
var request = require('request').defaults({
  timeout: 30000,
  jar: j
});

try {
  configuration = require('./config.json');
} catch (e) {
  return huf.log(null, 'error', 'Your config.json file has invalid syntax or does not exist.')
}

request({
  url: configuration.early_link,
  method: 'get'
}, function(err, res, body) {

  if (err) {
    return log('error', 'Error occured while trying to make request.')
  }

  var $ = cheerio.load(body);

  return atc({
    product_id: configuration.productID,
    qty: '1',
    form_key: $('input[name="form_key"]').attr('value'),
    sa: $('select').attr('name'),
    size_value: configuration.size_value,
    atc_link: $('#product_addtocart_form').attr('action')
  });

});

function atc(data) {

  var formData = {
    'form_key': data.form_key,
    'product': data.product_id,
    'qty': '1',
    'related_product': '',
    'sa': data.size_value
  }
  formData[data.sa] = data.size_value
  console.log('formData', formData);

  request({
    url: data.atc_link,
    method: 'post',
    headers: {
      'Origin': 'https://www.thegoodwillout.com',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Referer': configuration.early_link,
      'Accept-Language': 'en-US,en;q=0.8'
    },
    formData: formData
  }, function(err, res, body) {

    if (err) {
      return log('error', 'Error occured while trying to make request while trying to cart.')
    }

    checkout();

  });
}

function checkout(checkoutURL) {
  console.log(checkoutURL);
  request({
    url: 'https://www.thegoodwillout.com/checkout/onestep/?___SID=U',
    method: 'get',
    headers: {
      'Origin': 'https://www.thegoodwillout.com',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Referer': 'https://www.thegoodwillout.com/checkout/cart/',
      'Accept-Language': 'en-US,en;q=0.8'
    },
    formData: formData
  }, function(err, res, body) {

    if (err) {
      return log('error', 'Error occured while trying to make request while trying to cart.')
    }

    // https://www.thegoodwillout.com/paypal/express/start/button/1/
    //log('success', 'Opening PayPal checkout now!')
    //open('TODO PAYPAL LINK');
    fillInfo()

  });
}

function fillInfo() {
  var formData = {
    'billing[address_id]': '',
    'billing[city]': configuration.billingInfo.city,
    'billing[company]': '',
    'billing[country_id]': 'US',
    'billing[email]': configuration.billingInfo.email,
    'billing[firstname]': configuration.billingInfo.firstName,
    'billing[lastname]': configuration.billingInfo.lastName,
    'billing[postcode]': configuration.billingInfo.zipCode,
    'billing[region]': '',
    'billing[region_id]': '32',
    'billing[save_in_address_book]': '1',
    'billing[street][]': configuration.billingInfo.address,
    'billing[street_name]': configuration.billingInfo.address_street,
    'billing[street_number]': configuration.billingInfo.address_street_number,
    'billing[telephone]': configuration.billingInfo.phoneNumber,
    'billing[use_for_shipping]': '1',
    'checkout_method': 'guest',
    'payment[method]': 'paypal_express',
    'shipping[address_id]': '',
    'shipping[city]': '',
    'shipping[company]': '',
    'shipping[country_id]': 'DE',
    'shipping[firstname]': '',
    'shipping[lastname]': '',
    'shipping[postcode]': '',
    'shipping[region]': '',
    'shipping[region_id]': '',
    'shipping[save_in_address_book]': '1',
    'shipping[street][]': '',
    'shipping[street_name]': '',
    'shipping[street_number]': '',
    'shipping[telephone]': '',
    'shipping_method': 'flatrate_flatrate'
  }
  request({
    url: 'https://www.thegoodwillout.com/checkout/onestep/updateOrderReview',
    method: 'post',
    headers: {
      'Origin': 'https://www.thegoodwillout.com',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Referer': 'https://www.thegoodwillout.com/checkout/onestep/',
      'Accept-Language': 'en-US,en;q=0.8'
    },
    formData: formData
  }, function(err, res, body) {


    if (err) {
      return log('error', 'Error occured while trying to make request while trying to cart.')
    }

    request({
      url: 'https://www.thegoodwillout.com/paypal/express/start/',
      method: 'get',
      headers: {
        'Origin': 'https://www.thegoodwillout.com',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://www.thegoodwillout.com/checkout/onestep/',
        'Accept-Language': 'en-US,en;q=0.8'
      },
      formData: formData
    }, function(err, res, body) {

      console.log(res.statusCode);


      // submit()

    });

  });
}

function submit() {
  var formData = {
    'billing[address_id]': '',
    'billing[city]': configuration.billingInfo.city,
    'billing[company]': '',
    'billing[country_id]': 'US',
    'billing[email]': configuration.billingInfo.email,
    'billing[firstname]': configuration.billingInfo.firstName,
    'billing[lastname]': configuration.billingInfo.lastName,
    'billing[postcode]': configuration.billingInfo.zipCode,
    'billing[region]': '',
    'billing[region_id]': '32',
    'billing[save_in_address_book]': '1',
    'billing[street][]': configuration.billingInfo.address,
    'billing[street_name]': configuration.billingInfo.address_street,
    'billing[street_number]': configuration.billingInfo.address_street_number,
    'billing[telephone]': configuration.billingInfo.phoneNumber,
    'billing[use_for_shipping]': '1',
    'checkout_method': 'guest',
    'payment[method]': 'paypal_express',
    'shipping[address_id]': '',
    'shipping[city]': '',
    'shipping[company]': '',
    'shipping[country_id]': 'DE',
    'shipping[firstname]': '',
    'shipping[lastname]': '',
    'shipping[postcode]': '',
    'shipping[region]': '',
    'shipping[region_id]': '',
    'shipping[save_in_address_book]': '1',
    'shipping[street][]': '',
    'shipping[street_name]': '',
    'shipping[street_number]': '',
    'shipping[telephone]': '',
    'shipping_method': flatrate_flatrate
  }
}

var log = function(type, text) {

  var date = new Date()
  var formatted = date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")


  switch (type) {
    case "warning":
      console.log(`[${formatted}] ${text}`.yellow)
      break;
    case "error":
      console.log(`[${formatted}] ${text}`.red)
      break;
    case "info":
      console.log(`[${formatted}] ${text}`.cyan)
      break;
    case "success":
      console.log(`[${formatted}] ${text}`.green)
      break;

    default:
      console.log(`[${formatted}] ${text}`.white)
  }
}
