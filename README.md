<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/majeurbilly/castle_of_SFML">
    <img src="docs/images/logo.png" alt="Logo" width="100" height="100">
  </a>

  <h3 align="center">Castle of SFML 🏰</h3>

  <p align="center">
    Un jeu de survie et moteur 3D de type raycaster
    <br />
    <a href="#à-propos"><strong>Explorer la documentation »</strong></a>
    <br />
    <br />
    <a href="https://github.com/majeurbilly/castle_of_SFML/issues/new?assignees=&labels=bug&template=01_BUG_REPORT.md&title=bug%3A+">Signaler un bug</a>
    ·
    <a href="https://github.com/majeurbilly/castle_of_SFML/issues/new?assignees=&labels=enhancement&template=02_FEATURE_REQUEST.md&title=feat%3A+">Proposer une fonctionnalité</a>
    ·
    <a href="https://github.com/majeurbilly/castle_of_SFML/issues/new?assignees=&labels=question&template=04_SUPPORT_QUESTION.md&title=support%3A+">Poser une question</a>
  </p>
</div>

## Table des matières

<ol>
  <li>
    <a href="#à-propos">À propos</a>
    <ul>
      <li><a href="#technologies-utilisées">Technologies utilisées</a></li>
    </ul>
  </li>
  <li>
    <a href="#démarrage">Démarrage</a>
    <ul>
      <li><a href="#-jouer-sans-compiler-télécharger">🎮 Jouer sans compiler (Télécharger)</a></li>
      <li><a href="#prérequis">Prérequis</a></li>
      <li><a href="#installation">Installation</a></li>
    </ul>
  </li>
  <li><a href="#utilisation">Utilisation</a></li>
  <li><a href="#aperçu-des-outils-de-suivi">Aperçu des outils de suivi</a></li>
  <li><a href="#auteurs--contributeurs">Auteurs & Contributeurs</a></li>
  <li><a href="#remerciements">Remerciements</a></li>
</ol>

<!-- ABOUT THE PROJECT -->
## À propos

**Castle of SFML** est un jeu de survie et un moteur 3D de type raycaster. Initialement pensé en C++, le projet a été entièrement réécrit en C# pour offrir une architecture plus modulaire, incluant une IA de pathfinding (BFS) et un système de tests automatisés.

### Fonctionnalités principales

- **Système de rendu 3D** : Affichage en temps réel avec Raycasting et Sprite Casting (Z-Buffer)
- **Intelligence Artificielle** : Ennemi (fantôme) traquant le joueur via un algorithme BFS
- **Mécaniques de survie** : Ramassage d'armes (couteau), gestion du score et Game Over
- **Architecture testable** : Logique de jeu séparée du rendu et couverte par des tests unitaires
- **Rendu de minimap** : Visualisation de la grille 2D et des entités pour le débogage

### Architecture du projet

- **Program / GameLogic** : Boucle principale et séparation des règles du jeu
- **Player & Ghost** : Gestion des entités, mouvement et IA
- **Map** : Définition du labyrinthe (20x20) et gestion des collisions
- **Rays** : Algorithmes mathématiques de projection 3D
- **Raycaster.Tests** : Projet de tests unitaires (xUnit)

<details>
  <summary>
    <span style="cursor: pointer; font-weight: bold;">
      📂 Ouvrir le panneau
    </span>
  </summary>
  <br>
  🛠️ Processus d'installation
  <img src="docs/images/jeux.png" alt="Demo jeux">
</details>

### Technologies utilisées

- **C# (.NET 6.0)** - Langage de programmation principal
- **SFML.Net 2.5** - Binding C# de la bibliothèque multimédia
- **xUnit** - Framework pour les tests unitaires
- **GitHub Actions** - Pipeline CI/CD pour les tests automatisés

## Démarrage

### 🎮 Jouer sans compiler (Télécharger)

Une version jouable (.exe) est compilée automatiquement à chaque mise à jour du code. Pour jouer directement :

1. Va dans l'onglet **Releases** du dépôt GitHub.
2. Repère la version **Latest Build** (qui est toujours la plus récente).
3. Déroule la section **Assets** en bas de cette release et clique sur **CastleOfSFML-Windows.zip** pour le télécharger.
4. Extrais le dossier compressé (clic droit → Extraire tout).
5. Double-clique sur `Raycaster.exe` et essaie de survivre !

### Prérequis

Pour travailler sur ce projet, tu as besoin de :

- **SDK .NET 6.0** ou plus récent
- **SFML.Net** (Géré via NuGet ou les dll locales)
- **Windows / Linux / macOS** (Compatible multiplateforme via .NET)
- **Git** pour cloner le repository

### Installation

1. Ouvre ton **terminal**.
2. Clone le repository : `git clone https://github.com/majeurbilly/castle_of_SFML.git`
3. Navigue dans le dossier du projet : `cd castle_of_SFML`
4. Compile le projet : `dotnet build`
5. Exécute les tests (optionnel) : `dotnet test`
6. Lance le programme : `dotnet run --project Raycaster` (ou ouvre le `.sln` dans Visual Studio et fais F5)

## Utilisation

### Contrôles du jeu

- **ZQSD** ou **WASD** : Déplacement du joueur
- **Souris** : Rotation de la caméra
- **Espace** : Attaquer avec le couteau (si équipé)
- **M** : Afficher/Masquer la minimap
- **R** : Recommencer la partie après un Game Over
- **Échap** : Quitter le jeu

## Aperçu des outils de suivi

### .NET CLI & xUnit

- Lancement rapide des tests de logique métier (GameLogic, MathUtils)
- Exécution isolée sans nécessiter l'interface graphique (idéal pour GitHub Actions)

### Visual Studio

- Points d'arrêt et inspection des variables
- Analyse de la mémoire et des performances

### Console Output

- Affichage du score en temps réel
- Notifications d'état (Couteau ramassé, Fantôme tué, Game Over)

## Auteurs & Contributeurs

**Développeur principal :** [majeurbilly](https://github.com/majeurbilly)

Ce projet est développé dans le cadre d'un apprentissage du développement de jeux vidéo, des mathématiques de rendu 3D et des bonnes pratiques en C# (CI/CD, Tests Unitaires).

## Remerciements

Remerciements :

- [3DSage](https://github.com/3DSage/OpenGL-Raycaster_v1) 
- [Charles Lecuyer](https://github.com/charlesalecuyer/RaycastingEngine)

<p align="right">(<a href="#table-des-matières">retour en haut</a>)</p>
