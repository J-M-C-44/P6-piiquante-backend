# Piiquante / hot takes

## Description
  Projet 6 du parcours de Développeur Web d'OpenClassRooms : construire une api sécurisée pour une application d'avis gastronomiques (sauces piquantes)
  
  Ici n'est traité que le backend. La partie frontend est disponible dans le repos suivant : https://github.com/OpenClassrooms-Student-Center/Web-Developer-P6

##  Installation
  
1) dans le terminal, à partir du dossier backend, taper `npm install`
2) fichier `.env.example ` situé à la racine du projet : supprimer l'extension `.example `  
3) renseigner vos propres valeurs de variables d'environnement ( remplacer les ` XXXXXXX `) 
  
    | Variable d'environnement | Fonction |
    |--|--|
    | ` PORT ` | votre numéro de port (3000 par défaut)|
    | ` HASH_NUMBER ` | nombre de tour de hashage |
    | ` CRYPTOJS_SECRET_KEY` | clé secrète pour chiffrer et déchiffrer un email|
    | ` TOKEN_SECRET` | clé secrète du token d'authentification|
    | ` MONGODB_USER ` | nom d'un utilisateur de votre cluster MongoDB ayant les droits de lecture/écriture|
    | ` MONGODB_PASSWORD ` | mot de passe associé à ` MONGODB_USER `|
    | ` MONGODB_CLUSTER_NAME` | nom du cluster MONGODB |
    | ` MONGODB_DATABASE_NAME ` | nom de la base de donnée créée au sein de votre cluster |

4) dans le terminal, toujours à partir du dossier backend, taper `npm install` (ou `nodemon server`) 

##  Dépendances
- bcrypt ^5.0.1
- crypto-js ^4.1.1
- dotenv ^16.0.1
- email-validator ^2.0.4
- express ^4.18.1
- express-mongo-sanitize ^2.2.0
- express-rate-limit ^6.5.1
- helmet ^5.1.1
- jsonwebtoken ^8.5.1
- mongoose ^6.5.0
- mongoose-unique-validator ^3.1.0
- multer ^1.4.5-lts.1
- nodemon ^2.0.19
- password-validator ^5.3.0
- uuid ^8.3.2 