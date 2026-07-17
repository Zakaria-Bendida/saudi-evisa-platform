const mongoose = require("mongoose");

// Sous-document pour chaque membre de la famille voyageant sur le même passeport
// (equivalent des colonnes family_relation_type_1, family_date_of_birth_1,
// family_sex_1, family_full_name_1 du PHP, mais generalise en tableau pour
// supporter plusieurs personnes comme le fait "generateTable()" en JS)
const FamilyMemberSchema = new mongoose.Schema(
  {
    relation_type: { type: String, default: "" }, // نوع الصلة
    date_of_birth: { type: String, default: "" }, // تاريخ الميلاد
    sex: { type: String, default: "" }, // الجنس
    full_name: { type: String, default: "" }, // الاسم الكامل
  },
  { _id: false }
);

const FormulaireSchema = new mongoose.Schema(
  {
    // ---- Photo (nouveau : gere l'upload d'image du formulaire HTML) ----
    photo: { type: String, default: null }, // chemin du fichier stocke par multer

    // ---- Div_00 : informations personnelles ----
    full_name_arabic: { type: String, required: true },
    full_name_english: { type: String, required: true },
    mothers_name: { type: String, required: true },
    fathers_name: { type: String, required: true },
    date_of_birth: { type: String, required: true },
    place_of_birth: { type: String, required: true },
    previous_nationality: { type: String, required: true },
    present_nationality: { type: String, required: true },
    sex: { type: String, enum: ["Male", "Female"], required: true },
    marital_status: { type: String, required: true },
    religion: { type: String, required: true },
    sect: { type: String, required: true },
    profession: { type: String, required: true },
    qualification: { type: String, required: true },
    place_of_issue: { type: String, required: true }, // lieu de delivrance du diplome
    home_address_and_tel: { type: String, required: true },
    business_address_and_tel: { type: String, required: true },

    // Purpose of travel (corrige : dans le HTML original les checkbox
    // n'avaient pas d'attribut "name" donc rien n'etait envoye ; ici
    // c'est un vrai tableau de chaines)
    purpose_of_travel: {
      type: [String],
      enum: ["work", "transit", "visit", "Umrah", "residence", "Hajj", "Diplomacy"],
      default: [],
    },

    passport_issue_place: { type: String, required: true },
    date_passport_issued: { type: String, required: true },
    passport_no: { type: String, required: true },
    date_of_passports_expiry: { type: String, required: true },

    duration_of_stay_in_kingdom: { type: String, default: "" }, // calcule cote client
    date_of_arrival: { type: String, required: true },
    date_of_departure: { type: String, required: true },

    // ---- Div_01 : accompagnant / destination ----
    spouse_name: { type: String, default: "" }, // اسم المحرم (actif si sex = Female)
    spouse_relationship: { type: String, default: "" }, // صلته
    destination: { type: String, required: true },
    carrier_name: { type: String, required: true },

    // ---- Div_02 : tableau dynamique des membres de la famille ----
    family_members: { type: [FamilyMemberSchema], default: [] },

    // ---- Div_03 : declaration + usage officiel ----
    company_or_individual_name_in_kingdom: { type: String, required: true },
    official_use_only_date: { type: String, required: true },
    authorization_number: { type: String, required: true },
    visit_work_for: { type: String, required: true },
    visit_work_date: { type: String, required: true },
    visa_number: { type: String, required: true },
  },
  { timestamps: true } // createdAt / updatedAt (equivalent d'un champ "date d'inscription")
);

module.exports = mongoose.model("Formulaire", FormulaireSchema);
