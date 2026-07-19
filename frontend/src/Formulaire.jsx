import { useState, useRef, useEffect } from "react";
import {
  User,
  Users,
  Calendar,
  MapPin,
  Globe,
  GraduationCap,
  Briefcase,
  Home,
  Building2,
  Plane,
  BookOpen,
  CreditCard,
  FileText,
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  Send,
  ShieldCheck,
  PlaneTakeoff,
  Stamp,
  Phone,
} from "lucide-react";
import "./Formulaire.css";

const API_URL = `${import.meta.env.VITE_API_URL}/api/formulaire`;

const NATIONALITES = [
  { code: "DZ", label: "Algérienne" },
  { code: "MA", label: "Marocaine" },
  { code: "TN", label: "Tunisienne" },
  { code: "EG", label: "Égyptienne" },
  { code: "SA", label: "Saoudienne" },
  { code: "AE", label: "Émirienne" },
  { code: "JO", label: "Jordanienne" },
  { code: "LB", label: "Libanaise" },
  { code: "SY", label: "Syrienne" },
  { code: "IQ", label: "Irakienne" },
  { code: "YE", label: "Yéménite" },
  { code: "QA", label: "Qatarienne" },
  { code: "KW", label: "Koweïtienne" },
  { code: "BH", label: "Bahreïnienne" },
  { code: "OM", label: "Omanaise" },
  { code: "LY", label: "Libyenne" },
  { code: "MR", label: "Mauritanienne" },
  { code: "SD", label: "Soudanaise" },
  { code: "TR", label: "Turque" },
  { code: "PK", label: "Pakistanaise" },
  { code: "IN", label: "Indienne" },
  { code: "ID", label: "Indonésienne" },
  { code: "MY", label: "Malaisienne" },
  { code: "NG", label: "Nigériane" },
  { code: "SN", label: "Sénégalaise" },
  { code: "ML", label: "Malienne" },
  { code: "FR", label: "Française" },
  { code: "US", label: "Américaine" },
  { code: "CA", label: "Canadienne" },
  { code: "GB", label: "Britannique" },
  { code: "DE", label: "Allemande" },
  { code: "ES", label: "Espagnole" },
  { code: "IT", label: "Italienne" },
  { code: "PT", label: "Portugaise" },
  { code: "NL", label: "Néerlandaise" },
  { code: "BE", label: "Belge" },
  { code: "CH", label: "Suisse" },
  { code: "SE", label: "Suédoise" },
  { code: "JP", label: "Japonaise" },
  { code: "CN", label: "Chinoise" },
  { code: "RU", label: "Russe" },
  { code: "AU", label: "Australienne" },
];

// URL gratuite (sans clé API) pour les drapeaux, servie par flagcdn.com
function flagUrl(code) {
  return `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;
}

const QUALIFICATIONS = [
  "Certificate of Primary Education",
  "Certificate of Intermediate Education",
  "Baccalaureate",
  "Licence",
  "Master1",
  "Master2",
  "Doctorat",
];

const PURPOSES = [
  { value: "work", label: "Work" },
  { value: "transit", label: "Transit" },
  { value: "visit", label: "Visit" },
  { value: "Umrah", label: "Umrah" },
  { value: "residence", label: "Residence" },
  { value: "Hajj", label: "Hajj" },
  { value: "Diplomacy", label: "Diplomacy" },
];

const STEP_LABELS = ["Informations", "Voyage", "Famille", "Déclaration"];

const initialState = {
  full_name_arabic: "",
  full_name_english: "",
  mothers_name: "",
  fathers_name: "",
  date_of_birth: "",
  place_of_birth: "",
  previous_nationality: NATIONALITES[0].label,
  present_nationality: NATIONALITES[0].label,
  sex: "",
  marital_status: "",
  religion: "",
  sect: "",
  profession: "",
  qualification: QUALIFICATIONS[0],
  place_of_issue: "",
  home_address_and_tel: "",
  business_address_and_tel: "",
  purpose_of_travel: [],
  passport_issue_place: "",
  date_passport_issued: "",
  passport_no: "",
  date_of_passports_expiry: "",
  date_of_arrival: "",
  date_of_departure: "",
  spouse_name: "",
  spouse_relationship: "",
  destination: "",
  carrier_name: "",
  company_or_individual_name_in_kingdom: "",
  official_use_only_date: "",
  authorization_number: "",
  visit_work_for: "",
  visit_work_date: "",
  visa_number: "",
};

// Equivalent de la fonction JS "lettersOnly(input)" du fichier original :
// n'autorise que les lettres latines, arabes et les espaces.
function lettersOnly(value) {
  return value.replace(/[^a-zA-Zا-ي ]/gi, "");
}

// N'autorise que les lettres arabes (+ espaces) - pour le nom complet en arabe
function arabicOnly(value) {
  return value.replace(/[^\u0600-\u06FF\s]/g, "");
}

// N'autorise que les lettres latines (+ espaces) - pour le nom complet en anglais
function englishOnly(value) {
  return value.replace(/[^a-zA-Z\s]/g, "");
}

// Petit wrapper pour un champ avec icone + label, evite de repeter le markup
function Field({ label, icon, hintRtl, helper, children, disabled }) {
  return (
    <div className={`field${disabled ? " disabled" : ""}`}>
      {label && <label>{label}</label>}
      <div className="control">
        {icon}
        {children}
      </div>
      {hintRtl && <div className="hint-rtl">{hintRtl}</div>}
      {helper && <div className="hint-ltr">{helper}</div>}
    </div>
  );
}

// Selecteur de nationalite avec drapeau (un <select> natif ne peut pas
// afficher d'images dans ses <option>, on construit donc un mini menu custom)
function NationalitySelect({ name, value, onChange, label, icon }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const current =
    NATIONALITES.find((n) => n.label === value) || NATIONALITES[0];

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const select = (n) => {
    onChange({ target: { name, value: n.label } });
    setOpen(false);
  };

  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="nat-select" ref={wrapRef}>
        <button
          type="button"
          className="nat-select-trigger"
          onClick={() => setOpen((o) => !o)}
        >
          {icon}
          <img src={flagUrl(current.code)} alt="" className="nat-flag" />
          <span>{current.label}</span>
          <span className="nat-caret" />
        </button>
        {open && (
          <div className="nat-select-menu">
            {NATIONALITES.map((n) => (
              <div
                key={n.code}
                className={`nat-select-option${n.label === value ? " selected" : ""}`}
                onClick={() => select(n)}
              >
                <img src={flagUrl(n.code)} alt="" className="nat-flag" />
                <span>{n.label}</span>
              </div>
            ))}
          </div>
        )}
        {/* champ cache pour garder la validation "required" native du formulaire */}
        <input
          type="text"
          name={name}
          value={value}
          readOnly
          required
          tabIndex={-1}
          className="nat-select-shadow-input"
        />
      </div>
    </div>
  );
}

export default function Formulaire({ token, onUnauthorized }) {
  const [formData, setFormData] = useState(initialState);
  const [step, setStep] = useState(0); // 0..3 equivalent Div_00 / Div_01 / Div_02 / Div_03
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [duration, setDuration] = useState("");
  const [disableUmrahHajj, setDisableUmrahHajj] = useState(false);
  const [spouseFieldsDisabled, setSpouseFieldsDisabled] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const formRef = useRef(null);
  const today = new Date().toISOString().split("T")[0];

  // --- Champs texte / select / date generiques ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Champs restreints aux lettres (equivalent onkeyup="lettersOnly(this)") ---
  const handleLettersOnlyChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: lettersOnly(value) }));
  };

  // --- Nom complet arabe : lettres arabes uniquement ---
  const handleArabicOnlyChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: arabicOnly(value) }));
  };

  // --- Nom complet anglais : lettres latines uniquement ---
  const handleEnglishOnlyChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: englishOnly(value) }));
  };

  // --- Sexe : reproduit disableFields() / enableFields() de l'original ---
  const handleSexChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, sex: value }));
    if (value === "Male") {
      setSpouseFieldsDisabled(true);
      setFormData((prev) => ({
        ...prev,
        spouse_name: "",
        spouse_relationship: "",
      }));
    } else {
      setSpouseFieldsDisabled(false);
    }
  };

  // --- Religion : reproduit displayDivDemo() (desactive Umrah/Hajj) ---
  const handleReligionChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, religion: value }));
    const shouldDisable = ["Christian", "Jew", "Hindus"].includes(value);
    setDisableUmrahHajj(shouldDisable);
    if (shouldDisable) {
      setFormData((prev) => ({
        ...prev,
        purpose_of_travel: prev.purpose_of_travel.filter(
          (p) => p !== "Umrah" && p !== "Hajj",
        ),
      }));
    }
  };

  // --- Purpose of travel (checkboxes) ---
  const handlePurposeChange = (value) => {
    setFormData((prev) => {
      const already = prev.purpose_of_travel.includes(value);
      return {
        ...prev,
        purpose_of_travel: already
          ? prev.purpose_of_travel.filter((p) => p !== value)
          : [...prev.purpose_of_travel, value],
      };
    });
  };

  // --- Duree du sejour : equivalent de calculateDuration() ---
  useEffect(() => {
    if (!formData.date_of_arrival || !formData.date_of_departure) {
      setDuration("");
      return;
    }
    const arrival = new Date(formData.date_of_arrival);
    const departure = new Date(formData.date_of_departure);
    const timeDiff = Math.abs(departure.getTime() - arrival.getTime());
    const daysDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const weeksDifference = Math.floor(daysDifference / 7);

    if (daysDifference > 5) {
      setDuration(`${weeksDifference} week and ${daysDifference % 7} days`);
    } else {
      // Comportement original : alerte + on vide le champ arrivee
      alert("La durée du séjour doit être supérieure à 10 jours");
      setFormData((prev) => ({ ...prev, date_of_arrival: "" }));
      setDuration("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.date_of_arrival, formData.date_of_departure]);

  // --- Image (equivalent de previewImage(event)) ---
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // --- Tableau dynamique des membres de la famille (equivalent generateTable()) ---
  const handleGenerateTable = () => {
    const n = Math.max(1, parseInt(numberOfPeople, 10) || 1);
    setFamilyMembers(
      Array.from(
        { length: n },
        (_, i) =>
          familyMembers[i] || {
            relation_type: "",
            date_of_birth: "",
            sex: "",
            full_name: "",
          },
      ),
    );
  };

  const handleFamilyMemberChange = (index, field, value) => {
    setFamilyMembers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // --- Enter => passe au champ suivant (equivalent du script jQuery keydown) ---
  const handleFormKeyDown = (e) => {
    if (e.key !== "Enter") return;
    const focusable = Array.from(
      formRef.current.querySelectorAll("input, select, button, textarea"),
    ).filter((el) => !el.disabled && el.type !== "hidden");
    const index = focusable.indexOf(e.target);
    const next = focusable[index + 1];
    if (next && next.type === "submit") return; // laisse le submit se faire normalement
    if (next) {
      e.preventDefault();
      next.focus();
    } else {
      e.preventDefault();
    }
  };

  // --- Navigation entre sections (equivalent Afficher_01/02/03) ---
  const goToStep = (n) => setStep(n);

  // --- Soumission finale vers l'API Node/Express ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          payload.append(key, JSON.stringify(value));
        } else {
          payload.append(key, value);
        }
      });
      payload.append("duration_of_stay_in_kingdom", duration);
      payload.append("family_members", JSON.stringify(familyMembers));
      if (photoFile) payload.append("photo", photoFile);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      if (response.status === 401) {
        onUnauthorized && onUnauthorized();
        setStatus({
          type: "error",
          message: "Session expirée, merci de vous reconnecter.",
        });
        setSubmitting(false);
        return;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus({
          type: "success",
          message: "User registered successfully!",
        });
        setFormData(initialState);
        setFamilyMembers([]);
        setPhotoFile(null);
        setPhotoPreview("");
        setStep(0);
      } else {
        setStatus({
          type: "error",
          message: result.message || "Erreur lors de l'enregistrement.",
        });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Erreur reseau : " + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const iconProps = { size: 17 };

  return (
    <div className="omra-page">
      {/* ---------- Top bar ---------- */}
      <div className="omra-topbar">
        <div className="omra-brand">
          <div className="omra-brand-mark">
            <img src="/images/header.png" alt="Visa Arabie Saoudite" />
          </div>
          <div className="omra-brand-text">
            <div className="name">Visa KSA</div>
            <div className="tag">Services Consulaires</div>
          </div>
        </div>
        <div className="omra-contact-pill">
          <Phone size={15} />
          01 23 45 67 89
        </div>
      </div>

      {/* ---------- Hero + Card ---------- */}
      <div className="omra-hero">
        <div className="omra-hero-copy">
          <span className="omra-eyebrow">
            Demande de visa - Royaume d'Arabie Saoudite
          </span>
          <h1>
            Votre demande de <em>visa</em> en toute sérénité
          </h1>
          <p>
            Remplissez ce formulaire pour lancer votre demande de visa d'entrée
            en Arabie Saoudite. Notre équipe vérifie chaque dossier et vous
            accompagne jusqu'à votre départ.
          </p>
          <div className="omra-hero-stats">
            <div>
              <strong>4</strong>
              <span>étapes simples</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>support dédié</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>dossier sécurisé</span>
            </div>
          </div>
        </div>

        <div className="omra-card">
          <div className="omra-card-head">
            <div className="icon-badge">
              <FileText size={22} />
            </div>
            <div>
              <h2>Formulaire de demande</h2>
              <p>
                Merci de renseigner toutes les informations demandées
                ci-dessous.
              </p>
            </div>
          </div>

          {/* ---------- Stepper ---------- */}
          <div className="omra-steps">
            {STEP_LABELS.map((label, i) => (
              <div
                key={label}
                className={`omra-step${step === i ? " active" : ""}${step > i ? " done" : ""}`}
              >
                <span className="dot">
                  {step > i ? <CheckCircle2 size={16} /> : i + 1}
                </span>
                <span className="label">{label}</span>
                {i < STEP_LABELS.length - 1 && <span className="bar" />}
              </div>
            ))}
          </div>

          <form
            id="Formulaire"
            ref={formRef}
            onKeyDown={handleFormKeyDown}
            onSubmit={handleSubmit}
          >
            {/* ---------- Etape 0 : informations personnelles ---------- */}
            {step === 0 && (
              <div id="Div_00">
                <div className="omra-photo-row">
                  <div className="omra-photo-frame">
                    <img
                      src={photoPreview || "/images/ihm2.jpg"}
                      alt="aperçu"
                    />
                  </div>
                  <label className="omra-photo-btn">
                    <Camera size={16} />
                    Ajouter une photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>

                <div className="omra-section-title">
                  <User size={18} />
                  Identité
                </div>
                <div className="omra-grid cols-2">
                  <Field
                    label="Nom complet (en arabe)"
                    icon={<User {...iconProps} />}
                    helper="✍️ Lettres arabes uniquement"
                  >
                    <input
                      type="text"
                      id="fullName"
                      name="full_name_arabic"
                      dir="rtl"
                      placeholder="الاسم الكامل"
                      style={{
                        textAlign: "right",
                        paddingLeft: "14px",
                        paddingRight: "40px",
                      }}
                      value={formData.full_name_arabic}
                      onChange={handleArabicOnlyChange}
                      required
                    />
                  </Field>
                  <Field
                    label="Nom complet (en anglais)"
                    icon={<User {...iconProps} />}
                    helper="✍️ Lettres latines uniquement (A-Z)"
                  >
                    <input
                      type="text"
                      id="fullNameEn"
                      name="full_name_english"
                      placeholder="e.g. Ahmed Ben Ali"
                      value={formData.full_name_english}
                      onChange={handleEnglishOnlyChange}
                      required
                    />
                  </Field>
                  <Field
                    label="Nom complet de la mère"
                    icon={<Users {...iconProps} />}
                  >
                    <input
                      type="text"
                      name="mothers_name"
                      value={formData.mothers_name}
                      onChange={handleLettersOnlyChange}
                      required
                    />
                  </Field>
                  <Field
                    label="Nom complet du père"
                    icon={<Users {...iconProps} />}
                  >
                    <input
                      type="text"
                      name="fathers_name"
                      value={formData.fathers_name}
                      onChange={handleLettersOnlyChange}
                      required
                    />
                  </Field>
                  <Field
                    label="Date de naissance"
                    icon={<Calendar {...iconProps} />}
                  >
                    <input
                      type="date"
                      name="date_of_birth"
                      id="Date1"
                      max={today}
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field
                    label="Lieu de naissance"
                    icon={<MapPin {...iconProps} />}
                  >
                    <input
                      type="text"
                      name="place_of_birth"
                      value={formData.place_of_birth}
                      onChange={handleLettersOnlyChange}
                      required
                    />
                  </Field>
                  <NationalitySelect
                    label="Nationalité précédente"
                    name="previous_nationality"
                    value={formData.previous_nationality}
                    onChange={handleChange}
                    icon={<Globe {...iconProps} />}
                  />
                  <NationalitySelect
                    label="Nationalité actuelle"
                    name="present_nationality"
                    value={formData.present_nationality}
                    onChange={handleChange}
                    icon={<Globe {...iconProps} />}
                  />
                </div>

                <div className="omra-section-title">
                  <ShieldCheck size={18} />
                  Sexe &amp; situation
                </div>
                <div className="omra-grid cols-2">
                  <Field label="Sexe">
                    <div className="omra-radio-row" style={{ width: "100%" }}>
                      <label className="omra-radio-chip">
                        <input
                          type="radio"
                          value="Male"
                          name="sex"
                          checked={formData.sex === "Male"}
                          onChange={handleSexChange}
                          required
                        />
                        <span className="chip-face">Homme</span>
                      </label>
                      <label className="omra-radio-chip">
                        <input
                          type="radio"
                          value="Female"
                          name="sex"
                          checked={formData.sex === "Female"}
                          onChange={handleSexChange}
                          required
                        />
                        <span className="chip-face">Femme</span>
                      </label>
                    </div>
                  </Field>
                  <Field label="Statut marital" icon={<Users {...iconProps} />}>
                    <select
                      id="statu"
                      name="marital_status"
                      value={formData.marital_status}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionner un statut</option>
                      <option value="Single">Célibataire</option>
                      <option value="Merried">Marié(e)</option>
                      <option value="Divorced">Divorcé(e)</option>
                      <option value="Widow">Veuf/Veuve</option>
                    </select>
                  </Field>
                  <Field label="Religion" icon={<BookOpen {...iconProps} />}>
                    <select
                      name="religion"
                      id="religion"
                      value={formData.religion}
                      onChange={handleReligionChange}
                      required
                    >
                      <option value="">Sélectionner une religion</option>
                      <option value="Christian">Christian</option>
                      <option value="Islam">Islam</option>
                      <option value="Jew">Jew</option>
                      <option value="Hindus">Hindus</option>
                    </select>
                  </Field>
                  <Field
                    label="Secte / rite"
                    icon={<BookOpen {...iconProps} />}
                  >
                    <input
                      type="text"
                      name="sect"
                      value={formData.sect}
                      onChange={handleLettersOnlyChange}
                      required
                    />
                  </Field>
                </div>

                <div className="omra-section-title">
                  <Briefcase size={18} />
                  Profession &amp; adresse
                </div>
                <div className="omra-grid cols-3">
                  <Field label="Profession" icon={<Briefcase {...iconProps} />}>
                    <input
                      type="text"
                      name="profession"
                      value={formData.profession}
                      onChange={handleLettersOnlyChange}
                      required
                    />
                  </Field>
                  <Field
                    label="Qualification"
                    icon={<GraduationCap {...iconProps} />}
                  >
                    <select
                      name="qualification"
                      id="Qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      required
                    >
                      {QUALIFICATIONS.map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Lieu de délivrance"
                    icon={<MapPin {...iconProps} />}
                  >
                    <input
                      type="text"
                      name="place_of_issue"
                      value={formData.place_of_issue}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                </div>
                <div className="omra-grid cols-2">
                  <Field
                    label="Adresse personnelle & téléphone"
                    icon={<Home {...iconProps} />}
                  >
                    <input
                      type="text"
                      name="home_address_and_tel"
                      value={formData.home_address_and_tel}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field
                    label="Adresse professionnelle & téléphone"
                    icon={<Building2 {...iconProps} />}
                  >
                    <input
                      type="text"
                      name="business_address_and_tel"
                      value={formData.business_address_and_tel}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                </div>

                <div className="omra-section-title">
                  <Plane size={18} />
                  Motif du voyage
                </div>
                <div className="omra-chip-group">
                  {PURPOSES.map((p) => {
                    const isDisabled =
                      disableUmrahHajj &&
                      (p.value === "Umrah" || p.value === "Hajj");
                    return (
                      <label className="omra-chip" key={p.value}>
                        <input
                          type="checkbox"
                          value={p.value}
                          checked={formData.purpose_of_travel.includes(p.value)}
                          disabled={isDisabled}
                          onChange={() => handlePurposeChange(p.value)}
                        />
                        <span className="chip-face">{p.label}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="omra-section-title">
                  <Stamp size={18} />
                  Passeport
                </div>
                <div className="omra-grid cols-3">
                  <Field
                    label="Lieu de délivrance"
                    icon={<MapPin {...iconProps} />}
                  >
                    <input
                      type="text"
                      name="passport_issue_place"
                      value={formData.passport_issue_place}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field
                    label="Date de délivrance"
                    icon={<Calendar {...iconProps} />}
                  >
                    <input
                      type="date"
                      name="date_passport_issued"
                      id="Date2"
                      max={today}
                      value={formData.date_passport_issued}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field
                    label="Numéro de passeport"
                    icon={<CreditCard {...iconProps} />}
                  >
                    <input
                      type="text"
                      name="passport_no"
                      value={formData.passport_no}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                </div>
                <div className="omra-grid cols-3">
                  <Field
                    label="Date d'expiration du passeport"
                    icon={<Calendar {...iconProps} />}
                    hintRtl="تاريخ انتهاء صلاحية الجواز"
                  >
                    <input
                      type="date"
                      name="date_of_passports_expiry"
                      id="Date3"
                      min={today}
                      value={formData.date_of_passports_expiry}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field
                    label="Date d'arrivée"
                    icon={<PlaneTakeoff {...iconProps} />}
                  >
                    <input
                      type="date"
                      id="arrivalDate"
                      name="date_of_arrival"
                      min={today}
                      value={formData.date_of_arrival}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field label="Date de départ" icon={<Plane {...iconProps} />}>
                    <input
                      type="date"
                      id="departureDate"
                      name="date_of_departure"
                      min={today}
                      value={formData.date_of_departure}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                </div>
                <div className="omra-grid">
                  <Field
                    label="Durée du séjour au Royaume"
                    icon={<Calendar {...iconProps} />}
                  >
                    <input id="duration" value={duration} readOnly />
                  </Field>
                </div>
              </div>
            )}

            {/* ---------- Etape 1 ---------- */}
            {step === 1 && (
              <div id="Div_01">
                <div className="omra-section-title">
                  <Users size={18} />
                  Accompagnant (mahram)
                  <span className="bilingual">إسم المحرم</span>
                </div>
                <div className="omra-grid cols-2">
                  <Field
                    label="Nom de l'accompagnant"
                    icon={<User {...iconProps} />}
                    disabled={spouseFieldsDisabled}
                  >
                    <input
                      type="text"
                      name="spouse_name"
                      value={formData.spouse_name}
                      onChange={handleLettersOnlyChange}
                      disabled={spouseFieldsDisabled}
                      required={!spouseFieldsDisabled}
                    />
                  </Field>
                  <Field
                    label="Lien de parenté"
                    icon={<Users {...iconProps} />}
                    disabled={spouseFieldsDisabled}
                    hintRtl="صلته"
                  >
                    <input
                      type="text"
                      name="spouse_relationship"
                      value={formData.spouse_relationship}
                      onChange={handleLettersOnlyChange}
                      disabled={spouseFieldsDisabled}
                      required={!spouseFieldsDisabled}
                    />
                  </Field>
                </div>

                <div className="omra-section-title">
                  <Plane size={18} />
                  Trajet
                </div>
                <div className="omra-grid cols-2">
                  <Field
                    label="Destination"
                    icon={<MapPin {...iconProps} />}
                    hintRtl="جهة الوصول بالمملكة"
                  >
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleLettersOnlyChange}
                      required
                    />
                  </Field>
                  <Field
                    label="Nom du transporteur"
                    icon={<PlaneTakeoff {...iconProps} />}
                    hintRtl="إسم الشركة الناقلة"
                  >
                    <input
                      type="text"
                      name="carrier_name"
                      value={formData.carrier_name}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                </div>

                <p
                  className="omra-note-text"
                  style={{ color: "var(--muted)", fontSize: "0.85rem" }}
                >
                  Personnes voyageant sur le même passeport — ايضاحات تخص افراد
                  العائلة المضافين الى جواز السفر : renseignées à l'étape
                  suivante.
                </p>
              </div>
            )}

            {/* ---------- Etape 2 : tableau dynamique de la famille ---------- */}
            {step === 2 && (
              <div id="Div_02">
                <div className="omra-section-title">
                  <UserPlus size={18} />
                  Membres de la famille
                </div>

                <div className="omra-family-controls">
                  <Field label="Nombre de personnes">
                    <input
                      type="number"
                      id="numberOfPeople"
                      min="1"
                      value={numberOfPeople}
                      onChange={(e) => setNumberOfPeople(e.target.value)}
                    />
                  </Field>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    id="but"
                    onClick={handleGenerateTable}
                  >
                    Générer le tableau
                  </button>
                </div>

                <div className="omra-family-cards" id="T">
                  {familyMembers.length === 0 && (
                    <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                      Indiquez le nombre de personnes puis cliquez sur « Générer
                      le tableau ».
                    </p>
                  )}
                  {familyMembers.map((member, i) => (
                    <div className="omra-family-card" key={i}>
                      <div className="family-index">
                        <UserPlus size={14} />
                        Personne {i + 1}
                      </div>
                      <div className="omra-grid cols-2">
                        <Field
                          label="Type de relation"
                          icon={<Users {...iconProps} />}
                          hintRtl="نوع الصلة"
                        >
                          <input
                            type="text"
                            value={member.relation_type}
                            onChange={(e) =>
                              handleFamilyMemberChange(
                                i,
                                "relation_type",
                                e.target.value,
                              )
                            }
                          />
                        </Field>
                        <Field
                          label="Date de naissance"
                          icon={<Calendar {...iconProps} />}
                          hintRtl="تاريخ الميلاد"
                        >
                          <input
                            type="date"
                            value={member.date_of_birth}
                            onChange={(e) =>
                              handleFamilyMemberChange(
                                i,
                                "date_of_birth",
                                e.target.value,
                              )
                            }
                          />
                        </Field>
                        <Field
                          label="Sexe"
                          icon={<User {...iconProps} />}
                          hintRtl="الجنس"
                        >
                          <input
                            type="text"
                            value={member.sex}
                            onChange={(e) =>
                              handleFamilyMemberChange(i, "sex", e.target.value)
                            }
                          />
                        </Field>
                        <Field
                          label="Nom complet"
                          icon={<User {...iconProps} />}
                          hintRtl="الاسم الكامل"
                        >
                          <input
                            type="text"
                            value={member.full_name}
                            onChange={(e) =>
                              handleFamilyMemberChange(
                                i,
                                "full_name",
                                e.target.value,
                              )
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------- Etape 3 : declaration + usage officiel ---------- */}
            {step === 3 && (
              <div id="Div_03">
                <div className="omra-section-title">
                  <Building2 size={18} />
                  Société / personne d'accueil
                  <span className="bilingual">
                    إسم و عنوان الشركة أو إسم الشخص و عنوانه بالمملكة
                  </span>
                </div>
                <div className="omra-grid">
                  <Field
                    label="Nom et adresse au Royaume"
                    icon={<Building2 {...iconProps} />}
                  >
                    <input
                      type="text"
                      name="company_or_individual_name_in_kingdom"
                      id="Tous"
                      value={formData.company_or_individual_name_in_kingdom}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                </div>

                <div
                  style={{
                    background: "var(--cream)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px 16px",
                    fontSize: "0.85rem",
                    color: "var(--muted)",
                    margin: "18px 0",
                  }}
                >
                  <p style={{ margin: "0 0 6px" }}>
                    Je soussigné(e) certifie que toutes les informations
                    fournies sont exactes et m'engage à respecter les lois du
                    Royaume pendant la durée de mon séjour.
                  </p>
                  <p
                    style={{ margin: 0, direction: "rtl", textAlign: "right" }}
                  >
                    أنا الموقع أدناه أقر بأن كل المعلومات التي دونتها صحيحة
                    وسأكون ملتزما بقوانين المملكة أثناء فترة وجودي بها
                  </p>
                </div>

                <div className="omra-section-title">
                  <Stamp size={18} />
                  Réservé à l'administration
                  <span className="bilingual">للإستعمال الخاص فقط</span>
                </div>
                <div className="omra-grid cols-2">
                  <Field
                    label="Date"
                    icon={<Calendar {...iconProps} />}
                    hintRtl="تاريخه"
                  >
                    <input
                      type="date"
                      name="official_use_only_date"
                      id="Date4"
                      min={today}
                      value={formData.official_use_only_date}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field
                    label="Autorisation"
                    icon={<Stamp {...iconProps} />}
                    hintRtl="رقم الأمر المعتمد عليه في إعطاء التأشيرة"
                  >
                    <input
                      type="text"
                      name="authorization_number"
                      value={formData.authorization_number}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                </div>
                <div className="omra-grid cols-2">
                  <Field
                    label="Visite / travail pour"
                    icon={<Briefcase {...iconProps} />}
                    hintRtl="لزيارة/العمل لدى"
                  >
                    <input
                      type="text"
                      name="visit_work_for"
                      value={formData.visit_work_for}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field
                    label="Date"
                    icon={<Calendar {...iconProps} />}
                    hintRtl="تاريخه"
                  >
                    <input
                      type="date"
                      name="visit_work_date"
                      id="Date5"
                      min={today}
                      value={formData.visit_work_date}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                </div>
                <div className="omra-grid">
                  <Field
                    label="Numéro de visa"
                    icon={<CreditCard {...iconProps} />}
                    hintRtl="أشر به برقم"
                  >
                    <input
                      type="text"
                      name="visa_number"
                      value={formData.visa_number}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          visa_number: e.target.value.replace(/[^0-9]/g, ""),
                        }))
                      }
                      required
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* ---------- Navigation ---------- */}
            <div className="omra-actions">
              {step > 0 ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => goToStep(step - 1)}
                >
                  <ArrowLeft size={16} />
                  Retour
                </button>
              ) : (
                <span />
              )}

              {step < 3 && (
                <button
                  type="button"
                  className="btn btn-primary"
                  id={step === 0 ? "B1" : step === 1 ? "B2" : "B3"}
                  onClick={() => goToStep(step + 1)}
                >
                  Suivant
                  <ArrowRight size={16} />
                </button>
              )}

              {step === 3 && (
                <input
                  type="submit"
                  id="B4"
                  className="btn btn-primary"
                  value={submitting ? "Envoi..." : "Envoyer la demande"}
                  disabled={submitting}
                />
              )}
            </div>
          </form>

          {status.message && (
            <p
              className={
                status.type === "success" ? "success-message" : "error-message"
              }
            >
              {status.type === "success" ? (
                <CheckCircle2 size={16} />
              ) : (
                <Send size={16} />
              )}
              {status.message}
            </p>
          )}

          <div className="omra-secure-note">
            <ShieldCheck size={14} />
            Vos informations sont sécurisées et confidentielles.
          </div>
        </div>
      </div>
    </div>
  );
}
