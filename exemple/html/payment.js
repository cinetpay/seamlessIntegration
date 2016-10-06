function init() {

    var trans_id = document.getElementById('trans_id');
    trans_id.value = Math.floor((Math.random() * 10000000) + 10000);

    var amount = document.getElementById('amount');
    amount.value = Math.floor((Math.random() * 100) + 5);

    var custom = document.getElementById('cpm_custom');
    custom.value = Math.floor((Math.random() * 99999) + 7);

    //-------------Configuration
    CinetPay.setConfig({
        apikey: '174323661757617531bf99c9.80613927',
        site_id: 393509,
        notify_url: 'http://dev.vename.com/test/notify.php'
    });
    //-------------Gestion des evenements
    //error
    CinetPay.on('error', function (e) {
        var error_div = document.getElementById('error_info');
        error_div.innerHTML = '';
        error_div.innerHTML += '<b>Error code:</b>' + e.code + '<br><b>Message:</b>:' + e.message;
    });
    //ajax
    CinetPay.on('ajaxStart', function () {
        document.getElementById('bt_get_signature').setAttribute('disabled', 'disabled');
    });
    CinetPay.on('ajaxStop', function () {
        document.getElementById('bt_get_signature').removeAttribute('disabled');
    });
    //Lorsque la signature est généré
    CinetPay.on('signatureCreated', function (token) {
        console.log('Tocken généré: ' + token);
    });
    CinetPay.on('paymentPending', function (e) {
        var error_div = document.getElementById('error_info');
        error_div.innerHTML = 'Paiement en cours <br>';
        error_div.innerHTML += '<b>code:</b>' + e.code + '<br><b>Message:</b>:' + e.message;
    });
    CinetPay.on('paymentSuccessfull', function (paymentInfo) {
        var error_div = document.getElementById('error_info');
        var sucess_div = document.getElementById('success_info');
        if (typeof paymentInfo.lastTime != 'undefined') {
            if (paymentInfo.cpm_result == '00') {
                error_div.innerHTML = '';
                sucess_div.innerHTML = 'Votre paiement a été validé avec succès : <br> Montant :' + paymentInfo.cpm_amount + '<br>';
                trans_id.value = Math.floor((Math.random() * 10000000) + 10000);
            } else {
                error_div.innerHTML = 'Une erreur est survenue :' + paymentInfo.cpm_error_message;
                sucess_div.innerHTML = '';
            }
        }
    });

    //Application des méthodes
    var bt_get_signature = document.getElementById('bt_get_signature');
    bt_get_signature.addEventListener('click', function () {
        CinetPay.setSignatureData({
            amount: parseInt(document.getElementById('amount').value),
            trans_id: document.getElementById('trans_id').value,
            currency: document.getElementById('currency').value,
            designation: document.getElementById('designation').value,
            custom: document.getElementById('cpm_custom').value
        });
        CinetPay.getSignature();
    });
}
