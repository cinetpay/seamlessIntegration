CREATE TABLE `commande` (
  `IDCOMMANDE` int(128) NOT NULL,
  `IDCLIENT` int(128) DEFAULT NULL,
  `MONTANT` varchar(200) DEFAULT NULL,
  `TRANSID` varchar(200) DEFAULT NULL,
  `ABONNEMENT` varchar(200) DEFAULT NULL,
  `METHODE` varchar(200) DEFAULT NULL,
  `PAYID` varchar(200) DEFAULT NULL,
  `BUYERNAME` varchar(200) DEFAULT NULL,
  `TRANSSTATUS` varchar(200) DEFAULT NULL,
  `SIGNATURE` varchar(200) DEFAULT NULL,
  `PHONE` varchar(200) DEFAULT NULL,
  `ERRORMESSAGE` varchar(200) DEFAULT NULL,
  `STATUT` varchar(200) DEFAULT NULL,
  `DATECREATION` datetime DEFAULT NULL,
  `DATEMODIFICATION` datetime DEFAULT NULL,
  `DATEPAIEMENT` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


ALTER TABLE `commande`
  ADD PRIMARY KEY (`IDCOMMANDE`),
  ADD KEY `pk_commande` (`IDCOMMANDE`),
  ADD KEY `index_pk_commande` (`IDCOMMANDE`),
--  ADD KEY `fk_client_commande` (`IDCLIENT`);


ALTER TABLE `commande`
  MODIFY `IDCOMMANDE` int(128) NOT NULL AUTO_INCREMENT;

-- Si vous voulez lier cette table à une table cliente dans votre projet :
-- ALTER TABLE `commande` ADD CONSTRAINT `fk_client_commande` FOREIGN KEY (`IDCLIENT`) REFERENCES `client` (`IDCLIENT`);--
