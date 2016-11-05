/*
Function to send a message, requires jQuery
*/
'use strict';

$(function() {
  var ajaxData = null;

  $('#contact-error').hide();
  $('#contact-success').hide();

  $('#contact-form').on('submit', function(e) {
    e.preventDefault();

    //Set data
    var name = $('#contact-name').val();
    var from = $('#contact-email').val();
    var email = $('#contact-fullname').val();
    var message = $('#contact-message').val();

    var version = 'v0';
    var apiUrl = 'https://' + API_ENDPOINT + '/' + version;
    var domain = window.location.host;
    ajaxData = {
      type: 'POST',
      url: apiUrl + '/message/' + domain + '/',
      contentType: 'application/json',
      data: JSON.stringify({
        from:from,
        name: name,
        message: message,
        email: email
      })
    };

    ajaxData.success = function() {
      $('#contact-name').val('');
      $('#contact-email').val('');
      $('#contact-message').val('');
      $('#contact-success').show();
      $('#contact-form input[type="submit"]').val('Send');
    };

    ajaxData.error = function() {
      $('#contact-error').show();
      $('#contact-form input[type="submit"]').val('Send');
    };

    $('#contact-form input[type="submit"]').val('Sending ...');
    $('#contact-success').hide();
    $('#contact-error').hide();
    $.ajax(ajaxData);
  });

  $('img.close').on('click', function() {
    $('#contact-error').hide();
    $('#contact-success').hide();
  });
});
