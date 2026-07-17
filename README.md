# Migration Formulaire : PHP/MySQL → React + Node.js/Express + MongoDB (MERN)

Ce projet reprend **exactement** le formulaire original (`Formulaire.html` / `Formulaire.css` /
`Formulaire1.php`) et le migre vers une stack **MongoDB + Express + React + Node.js**, qui est le
choix le plus adapté pour ce type de formulaire (upload d'image, JSON flexible pour un formulaire
avec beaucoup de champs optionnels/dynamiques comme le tableau des membres de la famille).

Aucune fonctionnalité n'a été supprimée : toutes les fonctions JS originales ont un équivalent
React (voir tableau plus bas). Le formulaire a ensuite été repensé en un vrai formulaire de
demande de visa d'entrée en Arabie Saoudite (voir section « Refonte UI/UX » ci-dessous).

## Structure

```
projet-formulaire-mern/
├── backend/                  # API Node.js + Express + MongoDB (Mongoose)
│   ├── models/FormulaireModel.js
│   ├── controllers/formulaireController.js
│   ├── routes/formulaireRoutes.js
│   ├── uploads/               # images uploadées (photo du formulaire)
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/                  # Application React (Vite)
    ├── src/
    │   ├── Formulaire.jsx      # le formulaire complet
    │   ├── Formulaire.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

## Installation et lancement

### 1. Base de données MongoDB

Installez MongoDB en local, ou créez un cluster gratuit sur MongoDB Atlas.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # puis renseignez MONGO_URI si besoin
npm run dev                # démarre sur http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                # démarre sur http://localhost:5173
```

Ouvrez ensuite `http://localhost:5173` dans votre navigateur.

> Remarque : placez `images/back.jpg` (fond de page), `ihm2.jpg` (aperçu photo par défaut),
> `IHM.png` et `images/header.png` (logo affiché dans le header et utilisé comme favicon) dans
> `frontend/public/` pour que le formulaire s'affiche correctement.

## Correspondance des fonctionnalités (PHP/JS → React)

| Original (Formulaire.html / .php)                                   | Équivalent React                                        |
| ------------------------------------------------------------------- | ------------------------------------------------------- |
| `lettersOnly(input)`                                                | `lettersOnly()` + `handleLettersOnlyChange`             |
| `previewImage(event)` (aperçu image)                                | `handlePhotoChange` + `URL.createObjectURL`             |
| `disableFields()` / `enableFields()` (champs conjoint)              | `handleSexChange`                                       |
| `displayDivDemo()` / `hide()` (désactive Umrah/Hajj selon religion) | `handleReligionChange`                                  |
| `calculateDuration()`                                               | `useEffect` sur `date_of_arrival` / `date_of_departure` |
| `generateTable()` (tableau dynamique famille)                       | `handleGenerateTable` + état `familyMembers`            |
| `Afficher_01/02/03` + boutons B1/B2/B3 (affichage progressif)       | état `step` + boutons conditionnels                     |
| jQuery : Entrée = champ suivant                                     | `handleFormKeyDown`                                     |
| `$_POST[...]` + `INSERT INTO formulaire_data`                       | `POST /api/formulaire` → `Formulaire.save()` (Mongoose) |

## Bugs corrigés par rapport à l'original (comme demandé : version « corrigée »)

1. **Cases à cocher « Purpose of travel »** : elles n'avaient pas d'attribut `name` dans le HTML
   original, donc rien n'était jamais envoyé au serveur. Elles sont maintenant un vrai tableau
   `purpose_of_travel` correctement transmis.
2. **`Previous_nationality` / `Present_nationality`** : le HTML utilisait des noms avec majuscule
   qui ne correspondaient pas aux variables PHP (`previous_nationality` / `present_nationality`).
   Corrigé et harmonisé.
3. **`statu` vs `marital_status`** : le `<select>` s'appelait `statu` alors que le PHP attendait
   `marital_status`. Corrigé.
4. **Select religion** avec deux fois l'attribut `id`/`name` (`name="foo" id="foo"` en plus de
   `name="religion" id="religion"`) : nettoyé, un seul `name="religion"`.
5. **Champs dupliqués** (`destination`, `carrier_name` apparaissaient deux fois dans le HTML,
   un champ visible et un champ arabe avec le même `name`) : consolidés en un seul champ par
   donnée, la partie arabe est maintenant un simple texte d'accompagnement (comme pour les autres
   lignes bilingues du formulaire).
6. **Tableau famille limité à 1 personne** (`family_relation_type_1`, etc., un seul jeu de
   colonnes dans MySQL) alors que le JS `generateTable()` permettait d'en créer plusieurs :
   la collection MongoDB stocke maintenant un vrai tableau `family_members[]`, illimité.
7. **Injection SQL** : le PHP original insérait les valeurs `$_POST` directement dans la requête
   SQL sans échappement (`"...VALUES ('$full_name_arabic', ...)"`), ce qui est une faille de
   sécurité critique. Avec Mongoose, les documents sont validés et déposés de façon structurée
   (pas de concaténation de requête), ce qui élimine ce risque.

## API

- `POST /api/formulaire` (multipart/form-data, champ fichier `photo`) : crée un enregistrement.
- `GET /api/formulaire` : liste tous les enregistrements (utile pour un futur back-office).
- `GET /api/formulaire/:id` : récupère un enregistrement précis.

## Refonte UI/UX

Le formulaire original (tableau HTML brut, sans hiérarchie visuelle) a été repensé en un vrai
formulaire de demande de visa d'entrée en Arabie Saoudite, avec :

- Design responsive aux couleurs du drapeau saoudien (vert) associées à des accents dorés
- Parcours en 4 étapes (informations personnelles, voyage, famille, déclaration) avec barre de
  progression et navigation « Suivant / Retour »
- Filtrage de saisie script-aware : le champ nom complet en arabe n'accepte que des caractères
  arabes (affichage RTL), le champ nom complet en anglais n'accepte que des lettres latines
- Sélecteur de nationalité personnalisé avec drapeaux (40+ pays), via l'API gratuite et sans clé
  [flagcdn.com](https://flagcdn.com)
- Tableau des membres de la famille transformé en cartes dynamiques générées à la volée
- Champs regroupés par section avec icônes, meilleure lisibilité des libellés et messages
  de statut (succès / erreur) plus clairs après soumission
