// ============================================================
// SCRIPT.JS — Recherche dynamique des recettes (page2.html)
// ============================================================
// Principe : SÉLECTIONNER → ÉCOUTER → AGIR
//  - sélectionner : on récupère les éléments de la page ;
//  - écouter : on réagit quand l'utilisateur tape ou clique ;
//  - agir : on affiche ou on cache les cartes de recettes.
// ============================================================

// 1) SÉLECTIONNER les éléments (ils n'existent que sur page2.html)
const champRecherche = document.querySelector("#recherche");
const formulaire     = document.querySelector("#formulaire-recherche");
const cartes         = document.querySelectorAll("#grille .recipe-card");
const boutonsPays    = document.querySelectorAll(".filtre");
const messageVide    = document.querySelector("#aucun-resultat");
const compteur       = document.querySelector("#compteur");
const boutonReset    = document.querySelector("#reset");

// On n'exécute le code que si on est sur la page des recettes
// (sur index.html, ces éléments n'existent pas).
if (champRecherche) {

  // Le pays actuellement sélectionné ("tous" par défaut)
  let paysActif = "tous";

  // Met en minuscules et retire les accents : "Thaïlande" → "thailande"
  // Ainsi, taper "thai" ou "Thaï" trouve bien la même chose.
  function normaliser(texte) {
    return texte
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // 3) AGIR : affiche ou cache chaque carte selon le mot-clé ET le pays
  function filtrerRecettes() {
    const motCle = normaliser(champRecherche.value.trim());
    let nombreVisibles = 0;

    cartes.forEach(function (carte) {
      // Texte sur lequel on cherche : contenu visible + mots-clés cachés (ingrédients)
      const texteCarte = normaliser(carte.textContent + " " + carte.dataset.mots);

      const bonPays  = paysActif === "tous" || carte.dataset.pays === paysActif;
      const bonTexte = texteCarte.includes(motCle);

      if (bonPays && bonTexte) {
        carte.hidden = false;
        nombreVisibles++;
      } else {
        carte.hidden = true;
      }
    });

    // Message "aucun résultat" et compteur
    messageVide.hidden = nombreVisibles > 0;
    compteur.textContent = nombreVisibles + (nombreVisibles > 1 ? " recettes" : " recette");

    // Le bouton "Réinitialiser" n'apparaît que si un filtre est actif
    boutonReset.hidden = motCle === "" && paysActif === "tous";
  }

  // Met en surbrillance le bon bouton pays
  function activerBouton(pays) {
    boutonsPays.forEach(function (bouton) {
      bouton.classList.toggle("active", bouton.dataset.pays === pays);
    });
  }

  // 2) ÉCOUTER

  // Recherche en direct à chaque lettre tapée
  champRecherche.addEventListener("input", filtrerRecettes);

  // Le bouton "Rechercher" ne recharge pas la page
  formulaire.addEventListener("submit", function (evenement) {
    evenement.preventDefault();
    filtrerRecettes();
  });

  // Clic sur un pays
  boutonsPays.forEach(function (bouton) {
    bouton.addEventListener("click", function () {
      paysActif = bouton.dataset.pays;
      activerBouton(paysActif);
      filtrerRecettes();
    });
  });

  // Réinitialiser : on vide le champ et on revient à "Tous"
  boutonReset.addEventListener("click", function () {
    champRecherche.value = "";
    paysActif = "tous";
    activerBouton("tous");
    filtrerRecettes();
    champRecherche.focus();
  });

  // Les liens du footer (page2.html?pays=Japon) pré-sélectionnent un pays
  const pays = new URLSearchParams(window.location.search).get("pays");
  if (pays) {
    paysActif = pays;
    activerBouton(pays);
  }

  // Premier affichage : met à jour le compteur
  filtrerRecettes();
}


// ============================================================
// TEXTE ANIMÉ DE LA BARRE DE RECHERCHE
// "Recherchez" reste fixe, le mot qui suit change toutes les 2,6 s.
// ============================================================
const zoneMots = document.querySelector("#hint-mots");
// Si l'utilisateur a demandé moins d'animations, on garde le placeholder normal
const moinsAnimation = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (zoneMots && !moinsAnimation) {

  const mots = [
    "Pad Thaï", "Riz sauté", "Plat coréen", "Nouilles sautées", "Plat épicé",
    "Dessert chinois", "Cuisine japonaise", "Poulet teriyaki", "Ramen", "Recette asiatique"
  ];
  let indexMot = 0;

  // Active l'affichage de l'animation (voir .search-field.anime dans style.css)
  zoneMots.closest(".search-field").classList.add("anime");

  // Ajoute le nouveau mot et fait sortir l'ancien
  function afficherMot(texte) {
    const ancien = zoneMots.querySelector(".mot");
    const nouveau = document.createElement("span");
    nouveau.className = "mot";
    nouveau.textContent = texte;
    zoneMots.append(nouveau);

    if (ancien) {
      ancien.classList.add("sortie");
      // Une fois sorti, on supprime l'ancien mot du DOM
      ancien.addEventListener("animationend", function () {
        ancien.remove();
      }, { once: true });
    }
  }

  afficherMot(mots[indexMot]);

  setInterval(function () {
    if (document.hidden) return;   // pas d'animation si l'onglet n'est pas visible
    indexMot = (indexMot + 1) % mots.length;
    afficherMot(mots[indexMot]);
  }, 2600);
}
