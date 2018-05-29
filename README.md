# Web app Anatomik - Pedagogical Project

## Codding guidelines
* ES6 (EcmaScript 2015)
* Packagaging what can be packaged
* Code segmentation

## How to run the project
These are the X steps to launch the project :

* ``` npm i ```
* ``` brew services start mongodb ```
* ``` make run ```

To Lauch CSS :
* ``` gulp ```


If you want to restart the server during the developement, type ``` rs ``` in the terminal.
If you want to stop the mongodb service, type ``` brew services stop mongodb ``` 



## How to contribute on GitHub

Your commit message should be done like the following message : `:gitmoji: Your action`.
For gitmojis significations, follow this [link](http://gitmoji.carloscuesta.me)

# Documentation 

## Models 
* Association
* Documents
* Entreprise
* Etablissement
* Folder
* Offer
* Phases
* Project
* Service
* Subphases 
* Users

## Organisation
On retrouve 3 types d'organisations : Anatomik, Association et Entreprise. 

## Roles
Dans ce projet, l'utilisateur peut avoir plusieurs rôle : Administrateur ou Utilisateur. Un utilisateur par défaut ne peut pas créer, modifier ou supprimer sauf quand il appartient à l'organisation Anatomik. 
