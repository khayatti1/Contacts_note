# Contacts note

##  Description
**Contacts_note** est une application composée de deux modules : un **serveur** et un **client**, développée en **C#** avec une interface client interactive (probablement Windows Forms ou WPF). Elle est conçue pour gérer des contacts à distance, en permettant une communication structurée entre utilisateur et base de données via réseau.

## Fonctionnalités principales
- **Serveur** (`Contacts.Server`) : gestion centralisée des données — ajout, modification, suppression, et consultation des contacts.
- **Client** (`contacts.client`) : interface utilisateur pour interagir avec le serveur (CRUD des contacts).
- **CRUD complet** (Créer, Lire, Mettre à jour, Supprimer) pour les entités contacts.
- **Séparation claire des responsabilités** entre la couche serveur (logique métier et données) et la couche client (interface utilisateur).
- **Architecture réseau** client-serveur pour la gestion à distance des données.

## Architecture & Technologies
- **Langage** : C#
- **Solution** : `Contacts.sln`
- **Structure** :
  - `Contacts.Server/` → code du serveur (gestion des données, services réseau…)
  - `contacts.client/` → interface utilisateur (client)
  - Solution Visual Studio (`Contacts.sln`) pour centraliser compilations et références croisées

## Installation
1. Clonez ou téléchargez le projet :
    ```bash
    git clone https://github.com/khayatti1/contacts_note.git
    ```
2. Ouvrez la solution `Contacts.sln` avec **Visual Studio**.
3. Compilez la solution pour construire les deux projets.
4. Lancez d’abord le **serveur** (`Contacts.Server`), puis le **client** (`contacts.client`) à partir de l’IDE.

## Utilisation
- Démarrez le serveur, qui attend des connexions de clients.
- Lancez le client, qui communique avec le serveur pour gérer les contacts.
- Réalisez les opérations CRUD (ajout, modification, suppression, consultation des contacts) via l’interface client.
- Observez que les données sont traitées et stockées côté serveur de manière centralisée.


