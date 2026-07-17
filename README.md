# Migration Formulaire : PHP/MySQL → React + Node.js/Express + MongoDB (MERN)

Ce projet reprend **exactement** le formulaire original (`Formulaire.html` / `Formulaire.css` /
`Formulaire1.php`) et le migre vers une stack **MongoDB + Express + React + Node.js**, qui est le
choix le plus adapte pour ce type de formulaire (upload d'image, JSON flexible pour un formulaire
avec beaucoup de champs optionnels/dynamiques comme le tableau des membres de la famille).

Aucune fonctionnalite n'a ete supprimee : toutes les fonctions JS originales ont un equivalent
React (voir tableau plus bas).

## Structure

```
projet-formulaire-mern/
├── backend/                  # API Node.js + Express + MongoDB (Mongoose)
│   ├── models/FormulaireModel.js
│   ├── controllers/formulaireController.js
│   ├── routes/formulaireRoutes.js
│   ├── uploads/               # images uploadees (photo du formulaire)
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

### 1. Base de donnees MongoDB

Installez MongoDB en local, ou creez un cluster gratuit sur MongoDB Atlas.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # puis renseignez MONGO_URI si besoin
npm run dev                # demarre sur http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                # demarre sur http://localhost:5173
```

Ouvrez ensuite `http://localhost:5173` dans votre navigateur.

> Remarque : placez `back.png`, `ihm2.jpg` et `IHM.png` (vos images originales) dans
> `frontend/public/` pour qu'elles s'affichent exactement comme avant.

## Correspondance des fonctionnalites (PHP/JS → React)

| Original (Formulaire.html / .php)                                   | Equivalent React                                        |
| ------------------------------------------------------------------- | ------------------------------------------------------- |
| `lettersOnly(input)`                                                | `lettersOnly()` + `handleLettersOnlyChange`             |
| `previewImage(event)` (apercu image)                                | `handlePhotoChange` + `URL.createObjectURL`             |
| `disableFields()` / `enableFields()` (champs conjoint)              | `handleSexChange`                                       |
| `displayDivDemo()` / `hide()` (desactive Umrah/Hajj selon religion) | `handleReligionChange`                                  |
| `calculateDuration()`                                               | `useEffect` sur `date_of_arrival` / `date_of_departure` |
| `generateTable()` (tableau dynamique famille)                       | `handleGenerateTable` + etat `familyMembers`            |
| `Afficher_01/02/03` + boutons B1/B2/B3 (affichage progressif)       | etat `step` + boutons conditionnels                     |
| jQuery : Entree = champ suivant                                     | `handleFormKeyDown`                                     |
| `$_POST[...]` + `INSERT INTO formulaire_data`                       | `POST /api/formulaire` → `Formulaire.save()` (Mongoose) |

## Bugs corriges par rapport a l'original (comme demande : version "corrigee")

1. **Cases a cocher "Purpose of travel"** : elles n'avaient pas d'attribut `name` dans le HTML
   original, donc rien n'etait jamais envoye au serveur. Elles sont maintenant un vrai tableau
   `purpose_of_travel` correctement transmis.
2. **`Previous_nationality` / `Present_nationality`** : le HTML utilisait des noms avec majuscule
   qui ne correspondaient pas aux variables PHP (`previous_nationality` / `present_nationality`).
   Corrige et harmonise.
3. **`statu` vs `marital_status`** : le `<select>` s'appelait `statu` alors que le PHP attendait
   `marital_status`. Corrige.
4. **Select religion** avec deux fois l'attribut `id`/`name` (`name="foo" id="foo"` en plus de
   `name="religion" id="religion"`) : nettoye, un seul `name="religion"`.
5. **Champs dupliques** (`destination`, `carrier_name` apparaissaient deux fois dans le HTML,
   un champ visible et un champ arabe avec le meme `name`) : consolides en un seul champ par
   donnee, la partie arabe est maintenant un simple texte d'accompagnement (comme pour les autres
   lignes bilingues du formulaire).
6. **Tableau famille limite a 1 personne** (`family_relation_type_1`, etc., un seul jeu de
   colonnes dans MySQL) alors que le JS `generateTable()` permettait d'en creer plusieurs :
   la collection MongoDB stocke maintenant un vrai tableau `family_members[]`, illimite.
7. **Injection SQL** : le PHP original inserait les valeurs `$_POST` directement dans la requete
   SQL sans echappement (`"...VALUES ('$full_name_arabic', ...)"`), ce qui est une faille de
   securite critique. Avec Mongoose, les documents sont valides et deposes de facon structuree
   (pas de concatenation de requete), ce qui elimine ce risque.

## API

- `POST /api/formulaire` (multipart/form-data, champ fichier `photo`) : cree un enregistrement.
- `GET /api/formulaire` : liste tous les enregistrements (utile pour un futur back-office).
- `GET /api/formulaire/:id` : recupere un enregistrement precis.
