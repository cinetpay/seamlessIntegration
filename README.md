# [CinetPay](http://www.cinetpay.com) Seamless Integration

CinetPay Seamless Integration permet d'integrer facilement CinetPay de façcn transparente à sa boutique, c'est à dire que le client effectue le paiement sans quitter
du marchand.

_Il vous une autorisation de votre apiKey et de votre siteId par CinetPay pour utiliser le seamless Integration_

L'integration de ce SDK se fait en trois etapes :

## Etape 1 ; Preparer la page de notification

A chaque paiement, CinetPay vous notifie via un lien de notification, nous vous conseillons de toujours le traiter côté serveur. Nous allons utiliser PHP dans ce cas de figure :
Script index.php dans http://mondomaine.com/notify/ (le script doit se trouver dans le repertoire de votre notify_url) ;
```php
<?php
if (isset($_POST['cpm_trans_id'])) {
    // SDK PHP de CinetPay 
    require_once __DIR__ . '/CinetPay.php';

    //La classe commande correspond à votre colonne qui gère les transactions dans votre base de donnée
    $commande = new Commande();
    try {
        // Initialisation de CinetPay et Identification du paiement
        $id_transaction = $_POST['cpm_trans_id'];
        $apiKey = _VOTRE_APIKEY_;
        $site_id = _VOTRE_SITEID_;
        $plateform = "TEST"; // Valorisé à PROD si vous êtes en production
        $CinetPay = new CinetPay($site_id, $apiKey, $plateform);
        // Reprise exacte des bonnes données chez CinetPay
        $CinetPay->setTransId($id_transaction)->getPayStatus();
        $cpm_site_id = $CinetPay->_cpm_site_id;
        $signature = $CinetPay->_signature;
        $cpm_amount = $CinetPay->_cpm_amount;
        $cpm_trans_id = $CinetPay->_cpm_trans_id;
        $cpm_custom = $CinetPay->_cpm_custom;
        $cpm_currency = $CinetPay->_cpm_currency;
        $cpm_payid = $CinetPay->_cpm_payid;
        $cpm_payment_date = $CinetPay->_cpm_payment_date;
        $cpm_payment_time = $CinetPay->_cpm_payment_time;
        $cpm_error_message = $CinetPay->_cpm_error_message;
        $payment_method = $CinetPay->_payment_method;
        $cpm_phone_prefixe = $CinetPay->_cpm_phone_prefixe;
        $cel_phone_num = $CinetPay->_cel_phone_num;
        $cpm_ipn_ack = $CinetPay->_cpm_ipn_ack;
        $created_at = $CinetPay->_created_at;
        $updated_at = $CinetPay->_updated_at;
        $cpm_result = $CinetPay->_cpm_result;
        $cpm_trans_status = $CinetPay->_cpm_trans_status;
        $cpm_designation = $CinetPay->_cpm_designation;
        $buyer_name = $CinetPay->_buyer_name;

        // Recuperation de la ligne de la transaction dans votre base de donnée
        $commande->setTransId($id_transaction);
        $commande->getCommandeByTransId();
        // Verification de l'etat du traitement de la commande
        if ($commande->getStatut() == '00') {
            // La commande a été déjà traité
            // Arret du script
            die();
        }
        // Dans le cas contrait, on remplit notre ligne des nouvelles données acquise en cas de tentative de paiement sur CinetPay
        $commande->setMethode($payment_method);
        $commande->setPayId($cpm_payid);
        $commande->setBuyerName($buyer_name);
        $commande->setSignature($signature);
        $commande->setPhone($cel_phone_num);
        $commande->setDatePaiement($cpm_payment_date . ' ' . $cpm_payment_time);

        // On verifie que le montant payé chez CinetPay correspond à notre montant en base de donnée pour cette transaction
        if ($commande->getMontant() == $cpm_amount) {
            // C'est OK : On continue le remplissage des nouvelles données
            $commande->setErrorMessage($cpm_error_message);
            $commande->setStatut($cpm_result);
            $commande->setTransStatus($cpm_trans_status);
        } else {
            //Fraude : montant payé ' . $cpm_amount . ' ne correspond pas au montant de la commande
            $commande->setStatut('-1');
            $commande->setTransStatus('REFUSED');
        }
        // On met à jour notre ligne
        $commande->update();
    } catch (Exception $e) {
        echo "Erreur :" . $e->getMessage();
        // Une erreur s'est produite :
        die();
    }
} else {
    // Tentative d'accès direct au lien IPN
}
?>
```
## Etape 2 : Préparation du formulaire de paiement

Avant de commencer cette etape, il faut lier le seamless SDK à votre page :

* `https://www.cinetpay.com/cdn/seamless_sdk/latest/cinetpay.sandbox.min.js` : si vous êtes en test
* `https://www.cinetpay.com/cdn/seamless_sdk/latest/cinetpay.prod.min.js`    : si vous êtes en production

Cela se fait dans la balise head de votre page 

Exemple

####Creation du formulaire CinetPay

Le formulaire de paiement CinetPay est constitué de :
* `amount`      : Montant du paiement
* `currency`    : Devise du paiement, toujours en CFA pour le moment
* `trans_id`    : L'identifiant de la transaction, elle est unique
* `designation` : La designation de votre paiement
* `notify_url`  : le lien de notification silencieuse (IPN) après paiement

Exemple :

```html
   <head>
       ...
       <script charset="utf-8" 
               src="https://www.cinetpay.com/cdn/seamless_sdk/latest/cinetpay.sandbox.min.js"
               type="text/javascript">
       </script>
   </head> 
```

```html
<p id="payment_result"></p>
<form id="info_paiement">
    <input type="hidden"  id="amount" name="amount" value="10">

    <input type="hidden" value="CFA" name="currency" id="currency">

    <input type="hidden" autocomplete="off" id="notify_url" value="http://mondomaine.com/notify">
    
    <input type="hidden" placeholder="Ref transaction" autocomplete="off" id="trans_id" value="">

    <input type="hidden" placeholder="Designation du produit" id="designation" value="Achat de chaussure noir">
    
    <button type="button" class="btn btn-default" id="process_payment">Proceder au Paiement</button>    
</form>
```
NB : _Avant l'affichage de ce formulaire, vous devez enregistrer les informations concernant cette transaction dans votre base de donnée afin de les verifier après paiement du client_

####Lier le formulaire au SDK Javascript

Il faudrait qu'au clic du formulaire, Le formulaire puisse recuperer les informations liées à la transaction chez CinetPay et debute le paiement transparent depuis votre site,
Fichier config.js :
```html
<script >
    CinetPay.setConfig({
            apikey: '174323661757617531bf99c9.80613927',
            site_id: 393509
        });
    var process_payment = document.getElementById('process_payment');
        process_payment.addEventListener('click', function () {
            CinetPay.setSignatureData({
                amount: parseInt(document.getElementById('amount').value),
                trans_id: document.getElementById('trans_id').value,
                currency: document.getElementById('currency').value,
                designation: document.getElementById('designation').value,
                notify_url: document.getElementById('notify_url').value
            });
            CinetPay.getSignature();
        });
</script>
```


## Etape 3 ; Observer  le paiement transparent

Lorsque le client valide le formulaire, Vous pouvez suivre l'etat d'avancement du client sur CinetPay grace à ces evenement :

* `error` : Une erreur s'est produite, les requëtes ajax ou le paiement ont echoué,
* `paymentPending` Le paiement est en cours
* `paymentSuccessfull` Le paiement est terminé, Le paiement est valide ou est annulé

Exemple ; Fichier config.js suite :

```html
<script >
   var result_div = document.getElementById('payment_result');
   CinetPay.on('error', function (e) {
        result_div.innerHTML = '';
        result_div.innerHTML += '<b>Error code:</b>' + e.code + '<br><b>Message:</b>:' + e.message;
   });
   CinetPay.on('paymentPending', function (e) {
       result_div.innerHTML = '';
        result_div.innerHTML = 'Paiement en cours <br>';
        result_div.innerHTML += '<b>code:</b>' + e.code + '<br><b>Message:</b>:' + e.message;
   });
   CinetPay.on('paymentSuccessfull', function (paymentInfo) {
           if(typeof paymentInfo.lastTime != 'undefined'){
               result_div.innerHTML = '';
               if(paymentInfo.cpm_result == '00'){
                   result_div.innerHTML = 'Votre paiement a été validé avec succès : <br> Montant payé :'+paymentInfo.cpm_amount+'<br>';
               }else{
                   result_div.innerHTML = 'Une erreur est survenue :'+paymentInfo.cpm_error_message;
               }
           }
   });
</script>
```

## Navigateurs supporté

CinetPay Seamless Integration a été testé et fonctionne sur tous les navigateurs modernes y compris :

* Chrome
* Safari
* Firefox
* Internet Explorer 8+.

## Compatiblité Application Hybride

CinetPay Seamless Integration a été testé et fonctionne sur :

* Cordova
* phoneGap
* Ionic
* jQuery Mobile

## Votre Api Key et Site ID
Ces informations sont disponibles dans votre BackOffice CinetPay.