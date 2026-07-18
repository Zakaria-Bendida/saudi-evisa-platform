// Script a lancer UNE SEULE FOIS (en local ou apres deploiement) pour creer
// le compte admin par defaut, a partir des variables ADMIN_EMAIL / ADMIN_PASSWORD du .env
//
// Utilisation :  node seed/createAdmin.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/UserModel");

async function run() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "ADMIN_EMAIL et ADMIN_PASSWORD doivent etre definis dans le .env",
    );
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    console.log(`Le compte ${email} existe deja. Rien a faire.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ email: email.toLowerCase().trim(), passwordHash });

  console.log(`Compte admin cree avec succes : ${email}`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Erreur :", err.message);
  process.exit(1);
});
