# RTChat

# Liste des Fonctionnalité

- Login / Register / Logout
- Systeme de profile avec modification de pseudo, de couleur personnel et de photo de profile
- Creation de groupe de 2
- Creation de groupe multiple >= 2
- Envoi de message en temps réel
- Reception de message en temps réel
- Reception de notification si un groupe n'est pas ouvert mais que l'on reçoit un message
- Chargement dynamique de l'historique des message (scroll infini)
- Possibilité de voir quand un utilisateur est en train d'ecrire

Application de chat en temps réel permettant aux utilisateurs de communiquer instantanément.

## Installation

1. Clonez le repository

2. Configurez les variables d'environnement :

   - Dans le dossier `server` :

   ```bash
   cp .env.example .env
   ```

   - Dans le dossier `client` :

   ```bash
   cp .env.example .env
   ```

3. À la racine du projet, lancez Docker Compose :

```bash
docker compose up -d
```

4. Accédez au dossier client et lancez l'application en mode développement :

```bash
cd client
npm run dev
```

## Guide d'utilisation

### 1. Création de compte

Pour commencer à utiliser RTChat, vous devez d'abord créer un compte.

![image register](https://github.com/Prumme/RTChat/blob/main/images/Capture%20d%E2%80%99%C3%A9cran%202025-05-30%20%C3%A0%2009.21.26.png?raw=true)

### 2. Création d'un second compte

Pour tester la fonctionnalité de chat, créez un second compte utilisateur.

![image register](https://github.com/Prumme/RTChat/blob/main/images/Capture%20d%E2%80%99%C3%A9cran%202025-05-30%20%C3%A0%2009.21.26.png?raw=true)

### 3. Recherche d'utilisateur

Une fois connecté, utilisez la barre de recherche pour trouver d'autres utilisateurs et démarrer une conversation.

![image register](https://github.com/Prumme/RTChat/blob/main/images/Capture%20d%E2%80%99%C3%A9cran%202025-05-30%20%C3%A0%2009.25.29.png?raw=true)

### 4. Envoi de messages

Commencez à chatter ! Envoyez des messages en temps réel à vos contacts.

![image register](https://github.com/Prumme/RTChat/blob/main/images/Capture%20d%E2%80%99%C3%A9cran%202025-05-30%20%C3%A0%2009.26.20.png?raw=true)
