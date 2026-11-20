
// Préselectionne le type de réparation transmis depuis une page de catégorie.
const serviceSelect = document.querySelector('#repair-type');
const requestedService = new URLSearchParams(window.location.search).get('service');
const serviceTypes = {
  'reparation-ecran': 'Écran cassé ou tactile',
  'reparation-batterie': 'Batterie ou autonomie',
  'reparation-charge': 'Connecteur ou problème de charge',
  'autres-pannes': 'Caméra, son ou autre panne'
};
if (serviceSelect && serviceTypes[requestedService]) {
  serviceSelect.value = serviceTypes[requestedService];
}
// Ouvre et ferme le menu mobile.
const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');
if (menuButton && mainNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
}

// Affiche l’année en cours dans le pied de page.
document.querySelectorAll('[data-year]').forEach((item) => {
  item.textContent = new Date().getFullYear();
});

// Modèles courants proposés dans le sélecteur. « Autre modèle » permet de saisir les appareils absents.
const PHONE_MODELS = {
  Apple: ["iPhone 5s", "iPhone 6", "iPhone 6 Plus", "iPhone 6s", "iPhone 6s Plus", "iPhone SE (1re génération)", "iPhone 7", "iPhone 7 Plus", "iPhone 8", "iPhone 8 Plus", "iPhone X", "iPhone XR", "iPhone XS", "iPhone XS Max", "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max", "iPhone SE (2e génération)", "iPhone 12 mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max", "iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max", "iPhone SE (3e génération)", "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max", "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 16e", "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max", "iPhone 17e", "iPhone 17", "iPhone Air", "iPhone 17 Pro", "iPhone 17 Pro Max", "Autre modèle"],
  Samsung: ["Galaxy S6", "Galaxy S6 edge", "Galaxy S7", "Galaxy S7 edge", "Galaxy S8", "Galaxy S8+", "Galaxy S9", "Galaxy S9+", "Galaxy S10e", "Galaxy S10", "Galaxy S10+", "Galaxy S10 Lite", "Galaxy S20", "Galaxy S20+", "Galaxy S20 Ultra", "Galaxy S20 FE", "Galaxy S21", "Galaxy S21+", "Galaxy S21 Ultra", "Galaxy S21 FE", "Galaxy S22", "Galaxy S22+", "Galaxy S22 Ultra", "Galaxy S23", "Galaxy S23+", "Galaxy S23 Ultra", "Galaxy S23 FE", "Galaxy S24", "Galaxy S24+", "Galaxy S24 Ultra", "Galaxy S24 FE", "Galaxy S25", "Galaxy S25+", "Galaxy S25 Ultra", "Galaxy S25 Edge", "Galaxy A01", "Galaxy A02", "Galaxy A03", "Galaxy A04", "Galaxy A04s", "Galaxy A05", "Galaxy A05s", "Galaxy A06", "Galaxy A10", "Galaxy A10s", "Galaxy A11", "Galaxy A12", "Galaxy A13", "Galaxy A14", "Galaxy A15", "Galaxy A16", "Galaxy A20", "Galaxy A20s", "Galaxy A21", "Galaxy A21s", "Galaxy A22", "Galaxy A23", "Galaxy A24", "Galaxy A25", "Galaxy A30", "Galaxy A31", "Galaxy A32", "Galaxy A33", "Galaxy A34", "Galaxy A35", "Galaxy A36", "Galaxy A50", "Galaxy A51", "Galaxy A52", "Galaxy A52s", "Galaxy A53", "Galaxy A54", "Galaxy A55", "Galaxy A56", "Galaxy A70", "Galaxy A71", "Galaxy A72", "Galaxy A73", "Galaxy A80", "Galaxy A90", "Galaxy M11", "Galaxy M12", "Galaxy M13", "Galaxy M14", "Galaxy M15", "Galaxy M20", "Galaxy M21", "Galaxy M22", "Galaxy M23", "Galaxy M30s", "Galaxy M31", "Galaxy M32", "Galaxy M33", "Galaxy M34", "Galaxy M35", "Galaxy M51", "Galaxy M52", "Galaxy M53", "Galaxy M54", "Galaxy M55", "Galaxy Note 8", "Galaxy Note 9", "Galaxy Note 10", "Galaxy Note 10+", "Galaxy Note 20", "Galaxy Note 20 Ultra", "Galaxy Z Flip", "Galaxy Z Flip 3", "Galaxy Z Flip 4", "Galaxy Z Flip 5", "Galaxy Z Flip 6", "Galaxy Z Fold", "Galaxy Z Fold 2", "Galaxy Z Fold 3", "Galaxy Z Fold 4", "Galaxy Z Fold 5", "Galaxy Z Fold 6", "Autre modèle"],
  Xiaomi: ["Mi 5", "Mi 6", "Mi 8", "Mi 9", "Mi 9T", "Mi 10", "Mi 10T", "Mi 11", "Mi 11 Lite", "12", "12 Lite", "12 Pro", "12T", "12T Pro", "13", "13 Lite", "13 Pro", "13T", "13T Pro", "14", "14 Civi", "14 Pro", "14T", "14T Pro", "15", "15 Ultra", "15T", "15T Pro", "Autre modèle"],
  Redmi: ["4", "5", "6", "7", "8", "9", "9A", "9C", "10", "10A", "10C", "12", "12C", "13", "13C", "14C", "15", "Note 4", "Note 5", "Note 6 Pro", "Note 7", "Note 8", "Note 8T", "Note 9", "Note 9S", "Note 9 Pro", "Note 10", "Note 10S", "Note 10 Pro", "Note 11", "Note 11S", "Note 11 Pro", "Note 12", "Note 12S", "Note 12 Pro", "Note 13", "Note 13 Pro", "Note 13 Pro+", "Note 14", "Note 14 Pro", "Note 14 Pro+", "Note 15", "Autre modèle"],
  POCO: ["C3", "C31", "C40", "C50", "C51", "C55", "C65", "C75", "M2", "M2 Pro", "M3", "M4 Pro", "M5", "M5s", "M6", "M6 Pro", "M7 Pro", "X2", "X3", "X3 Pro", "X4 Pro", "X5", "X5 Pro", "X6", "X6 Pro", "X7", "X7 Pro", "F1", "F2 Pro", "F3", "F4", "F5", "F5 Pro", "F6", "F6 Pro", "F7", "Autre modèle"],
  Huawei: ["P10", "P10 Lite", "P20", "P20 Pro", "P20 Lite", "P30", "P30 Pro", "P30 Lite", "P40", "P40 Pro", "P40 Lite", "P50", "P50 Pro", "P60 Pro", "Mate 10", "Mate 10 Pro", "Mate 20", "Mate 20 Pro", "Mate 20 Lite", "Mate 30", "Mate 30 Pro", "Mate 40 Pro", "Mate 50 Pro", "Nova 3i", "Nova 5T", "Nova 7i", "Nova 9", "Nova 10", "Nova 11", "Nova 12", "Nova 13", "Y5", "Y6", "Y7", "Y9", "Y9 Prime", "Autre modèle"],
  HONOR: ["50", "50 Lite", "70", "90", "90 Lite", "100", "200", "200 Lite", "X5", "X6", "X7", "X8", "X9", "X9b", "Magic3", "Magic4 Pro", "Magic5 Lite", "Magic5 Pro", "Magic6 Lite", "Magic6 Pro", "Magic7 Pro", "Magic V2", "Magic V3", "Autre modèle"],
  OPPO: ["A15", "A16", "A17", "A18", "A31", "A38", "A53", "A54", "A57", "A58", "A series", "Reno 2", "Reno 3", "Reno 4", "Reno 5", "Reno 6", "Reno 7", "Reno 8", "Reno 9", "Reno 10", "Reno 11", "Reno 12", "Reno 13", "Reno 14", "Find X2", "Find X3 Pro", "Find X5 Pro", "Find X6 Pro", "Find X7 Ultra", "Find X8", "Autre modèle"],
  vivo: ["Y11", "Y12", "Y15", "Y16", "Y17s", "Y19", "Y20", "Y21", "Y22s", "Y27", "Y33s", "Y35", "Y36", "Y55", "V20", "V21", "V23", "V25", "V27", "V29", "V30", "V40", "X60", "X70", "X80", "X90", "X100", "X Fold", "Autre modèle"],
  realme: ["C11", "C15", "C21", "C25", "C30", "C31", "C33", "C35", "C51", "C53", "C55", "C61", "C63", "C67", "C75", "7", "8", "9", "10", "11", "12", "13", "Narzo 30", "Narzo 50", "Narzo 60", "Narzo 70", "GT Neo 2", "GT Neo 3", "GT Neo 5", "GT 2 Pro", "GT 5 Pro", "GT 6", "Autre modèle"],
  "Google Pixel": ["Pixel 2", "Pixel 2 XL", "Pixel 3", "Pixel 3a", "Pixel 3 XL", "Pixel 4", "Pixel 4a", "Pixel 4 XL", "Pixel 5", "Pixel 5a", "Pixel 6", "Pixel 6a", "Pixel 6 Pro", "Pixel 7", "Pixel 7a", "Pixel 7 Pro", "Pixel 8", "Pixel 8a", "Pixel 8 Pro", "Pixel 9", "Pixel 9a", "Pixel 9 Pro", "Pixel 9 Pro XL", "Pixel 10", "Pixel 10 Pro", "Pixel 10 Pro XL", "Autre modèle"],
  OnePlus: ["5", "5T", "6", "6T", "7", "7 Pro", "7T", "8", "8 Pro", "8T", "9", "9 Pro", "9R", "10 Pro", "10T", "11", "12", "13", "Nord", "Nord 2", "Nord CE 2", "Nord 3", "Nord CE 3 Lite", "Nord 4", "Nord 5", "Autre modèle"],
  Motorola: ["Moto E6", "Moto E7", "Moto E13", "Moto E20", "Moto E22", "Moto G8", "Moto G9", "Moto G10", "Moto G20", "Moto G30", "Moto G31", "Moto G32", "Moto G42", "Moto G52", "Moto G53", "Moto G54", "Moto G62", "Moto G72", "Moto G73", "Moto G84", "Moto G85", "Edge 20", "Edge 30", "Edge 40", "Edge 50", "Edge 60", "Razr 40", "Razr 50", "Razr 60", "Autre modèle"],
  Tecno: ["Spark 6", "Spark 7", "Spark 8", "Spark 9", "Spark 10", "Spark 20", "Spark 30", "Spark 40", "Camon 15", "Camon 16", "Camon 17", "Camon 18", "Camon 19", "Camon 20", "Camon 30", "Camon 40", "Pova 2", "Pova 3", "Pova 4", "Pova 5", "Pova 6", "Pova 7", "Phantom X", "Phantom V Fold", "Autre modèle"],
  Infinix: ["Smart 5", "Smart 6", "Smart 7", "Smart 8", "Smart 9", "Hot 10", "Hot 11", "Hot 12", "Hot 20", "Hot 30", "Hot 40", "Hot 50", "Hot 60", "Note 10", "Note 11", "Note 12", "Note 30", "Note 40", "Note 50", "Zero 20", "Zero 30", "Zero Flip", "Autre modèle"],
  Nokia: ["1.3", "2.2", "2.4", "3.2", "3.4", "5.3", "5.4", "6.2", "7.2", "8.3", "C1", "C2", "C10", "C20", "C21", "C22", "C30", "C32", "G10", "G11", "G20", "G21", "G22", "G42", "G50", "G60", "X10", "X20", "Autre modèle"],
  "Sony Xperia": ["Xperia 1", "Xperia 1 II", "Xperia 1 III", "Xperia 1 IV", "Xperia 1 V", "Xperia 1 VI", "Xperia 5", "Xperia 5 II", "Xperia 5 III", "Xperia 5 IV", "Xperia 10", "Xperia 10 II", "Xperia 10 III", "Xperia 10 IV", "Xperia 10 V", "Xperia L4", "Autre modèle"],
  ASUS: ["Zenfone 6", "Zenfone 7", "Zenfone 8", "Zenfone 9", "Zenfone 10", "Zenfone 11 Ultra", "ROG Phone 3", "ROG Phone 5", "ROG Phone 6", "ROG Phone 7", "ROG Phone 8", "ROG Phone 9", "Autre modèle"],
  Nothing: ["Phone (1)", "Phone (2)", "Phone (2a)", "Phone (2a) Plus", "Phone (3)", "Phone (3a)", "Phone (3a) Pro", "CMF Phone 1", "CMF Phone 2 Pro", "Autre modèle"],
  ZTE: ["Blade A31", "Blade A51", "Blade A71", "Blade A72", "Blade V40", "Blade V50", "Axon 20", "Axon 30", "Axon 40 Ultra", "Axon 50 Ultra", "Nubia Z50", "Nubia Z60 Ultra", "Autre modèle"],
  TCL: ["10L", "10 Pro", "20 SE", "20L", "30 SE", "30+", "40 SE", "40 NXTPAPER", "50 SE", "Autre modèle"],
  itel: ["A23", "A25", "A27", "A48", "A49", "A60", "A70", "A80", "P36", "P37", "P40", "P55", "S16", "S23", "Autre modèle"],
  Alcatel: ["1", "1B", "1S", "1SE", "3", "3L", "3X", "5", "Autre modèle"],
  Lenovo: ["K5", "K6", "K8", "K9", "K10 Note", "Z5", "Z6", "Legion Phone Duel", "Autre modèle"],
  Meizu: ["M6", "M8", "M10", "Note 8", "Note 9", "Note 10", "16th", "17", "18", "Autre modèle"],
  Blackview: ["A60", "A70", "A80", "A90", "BV5500", "BV6300", "BV6600", "BV6800", "BV7100", "BV8800", "Autre modèle"],
  "Autre marque": ["Autre modèle"]
};

const brandSelect = document.querySelector('#phone-brand');
const modelSelect = document.querySelector('#phone-model');
const modelSearch = document.querySelector('#model-search');
const modelSearchLabel = document.querySelector('.model-search-label');
const customModel = document.querySelector('#custom-model');
const customBrand = document.querySelector('#custom-brand');
const customBrandLabel = document.querySelector('.custom-brand-label');
const customModelLabel = document.querySelector('.custom-model-label');
if (brandSelect && modelSelect && customModel && customModelLabel) {
  let availableModels = [];
  const showCustomModel = () => { customModel.hidden = false; customModelLabel.hidden = false; customModel.required = true; };
  const renderModels = (keepSelection = false) => {
    const previous = keepSelection ? modelSelect.value : '';
    const query = (modelSearch?.value || '').trim().toLocaleLowerCase('fr');
    const matches = availableModels.filter((model) => model === 'Autre modèle' || model.toLocaleLowerCase('fr').includes(query));
    modelSelect.replaceChildren(new Option(matches.length ? 'Choisir un modèle' : 'Aucun modèle trouvé', ''));
    matches.forEach((model) => modelSelect.add(new Option(model, model)));
    modelSelect.disabled = availableModels.length === 0;
    modelSelect.required = availableModels.length > 0;
    if (previous && matches.includes(previous)) modelSelect.value = previous;
  };
  const updateModels = () => {
    availableModels = PHONE_MODELS[brandSelect.value] || [];
    if (modelSearch) { modelSearch.value = ''; modelSearch.hidden = !brandSelect.value || brandSelect.value === 'Autre marque'; }
    if (modelSearchLabel) modelSearchLabel.hidden = !brandSelect.value || brandSelect.value === 'Autre marque';
    renderModels();
    customModel.hidden = true; customModelLabel.hidden = true; customModel.required = false; customModel.value = '';
    if (customBrand && customBrandLabel) {
      customBrand.hidden = brandSelect.value !== 'Autre marque';
      customBrandLabel.hidden = brandSelect.value !== 'Autre marque';
      customBrand.required = brandSelect.value === 'Autre marque';
      customBrand.value = '';
    }
    if (brandSelect.value === 'Autre marque') showCustomModel();
  };
  brandSelect.addEventListener('change', updateModels);
  modelSearch?.addEventListener('input', () => renderModels(true));
  modelSelect.addEventListener('change', () => {
    if (modelSelect.value === 'Autre modèle') showCustomModel();
    else { customModel.hidden = true; customModelLabel.hidden = true; customModel.required = false; customModel.value = ''; }
  });
}
// Enregistre une demande individuelle ou le panier puis notifie l’atelier.
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = contactForm.querySelector('.form-message');
    const submitButton = contactForm.querySelector('button[type="submit"]');
    status.classList.remove('success-message', 'error-message');
    submitButton.disabled = true;
    submitButton.textContent = 'Envoi en cours…';
    const name = contactForm.querySelector('#name').value.trim();
    let selectedBrand = contactForm.querySelector('#phone-brand')?.value || '';
    if (selectedBrand === 'Autre marque') selectedBrand = contactForm.querySelector('#custom-brand')?.value.trim() || selectedBrand;
    const selectedModel = contactForm.querySelector('#phone-model')?.value || '';
    const manualModel = contactForm.querySelector('#custom-model')?.value.trim() || '';
    const model = selectedModel === 'Autre modèle' ? manualModel : selectedModel;
    const repairType = contactForm.querySelector('#repair-type')?.value || '';
    const email = contactForm.querySelector('#email').value.trim();
    const clientPhone = contactForm.querySelector('#client-phone').value.trim();
    const cartItems = new URLSearchParams(window.location.search).get('panier') === '1' ? (window.RepareCart?.read() || []) : [];
    const isCartRequest = cartItems.length > 0;
    const requestBrand = isCartRequest ? 'Panier de réparations' : selectedBrand;
    const requestModel = isCartRequest ? `${cartItems.length} service(s)` : model;
    const requestType = isCartRequest ? 'Voir le détail du panier de réparations' : repairType;
    const cartDetail = cartItems.map((item) => `${item.brand} ${item.model} — ${item.repairType} × ${item.quantity} : ${item.price === null ? "prix à confirmer" : `${Number(item.price) * Number(item.quantity)} DT estimés`}`).join('\n');
    let savedRequest = null;
    try {
      if (window.location.protocol === 'file:') throw new Error('Ouvrez le site avec Live Server ou publiez-le avant d’envoyer une demande.');
      if (!window.RepareAPI || !window.supabaseClient) throw new Error('Le service de compte Supabase n’est pas encore configuré.');
      savedRequest = await window.RepareAPI.createRepairRequest({ brand: requestBrand, model: requestModel, repairType: requestType, name, email, phone: clientPhone, cartItems: isCartRequest ? cartItems : [{ brand: selectedBrand, model, repairType, price: null, quantity: 1 }] });
      const data = {
        'Nom': name,
        'Marque': isCartRequest ? 'Voir le détail du panier' : selectedBrand,
        'Modèle du téléphone': isCartRequest ? `${cartItems.length} service(s) dans le panier` : model,
        'Réparation souhaitée': isCartRequest ? 'Panier de réparations' : repairType,
        'Email du client': email,
        'Téléphone du client': clientPhone,
        'Problème décrit': isCartRequest ? cartDetail : repairType,
        'Détail du panier': isCartRequest ? cartDetail : 'Demande individuelle',
        'Total indicatif': isCartRequest ? `${window.RepareCart.total(cartItems)} DT — à confirmer après diagnostic` : 'À confirmer après diagnostic',
        'Référence de demande': savedRequest.reference,
        'Rendez-vous': 'Le client souhaite apporter son téléphone à l’atelier. Merci de lui répondre avec les disponibilités et l’adresse exacte.',
        _subject: `Nouvelle demande de réparation ${savedRequest.reference}`,
        _replyto: email,
        _template: 'table'
      };
      const response = await fetch('https://formsubmit.co/ajax/eddoussahmed177@gmail.com', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok || result.success === 'false' || result.success === false) throw new Error(result.message || 'L’envoi de l’email a échoué.');
      window.RepareAPI.completeRepairRequest();
      document.dispatchEvent(new CustomEvent('repair-request-sent', { detail: { model: requestModel, repair: requestType, reference: savedRequest.reference } }));
      status.textContent = `Demande envoyée et enregistrée. Référence : ${savedRequest.reference}. L’atelier vous recontactera par email ou téléphone.`;
      status.classList.add('success-message');
      if (isCartRequest) window.RepareCart.clear();
      contactForm.reset();
      if (modelSelect) { modelSelect.disabled = true; modelSelect.replaceChildren(new Option('Choisissez d’abord une marque', '')); }
      if (customModel && customModelLabel) { customModel.hidden = true; customModelLabel.hidden = true; customModel.required = false; }
      if (customBrand && customBrandLabel) { customBrand.hidden = true; customBrandLabel.hidden = true; customBrand.required = false; }
      if (modelSearch && modelSearchLabel) { modelSearch.hidden = true; modelSearchLabel.hidden = true; modelSearch.value = ''; }
    } catch (error) {
      status.textContent = savedRequest ? `Demande enregistrée sous la référence ${savedRequest.reference}, mais l’email n’a pas été confirmé. Réessayez pour renvoyer la notification sans créer de doublon.` : (error.message || 'La demande n’a pas pu être enregistrée. Vérifiez votre connexion et réessayez.');
      status.classList.add('error-message');
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Envoyer <span aria-hidden="true">↗</span>';
    }
  });
}





