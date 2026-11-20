/* Authentification Supabase et demandes de réparation. */
(() => {
  const api = {};
  const $ = (selector) => document.querySelector(selector);
  const show = (node, text, success = false) => {
    if (!node) return;
    node.textContent = text;
    node.classList.toggle("success-message", Boolean(success));
    node.classList.toggle("error-message", !success);
  };
  const client = () => {
    if (!window.supabaseClient) throw new Error("Supabase n’est pas configuré. Suivez les étapes de SUPABASE.md.");
    return window.supabaseClient;
  };
  const safeNext = (value) => /^(contact|mon-compte|admin)\.html(?:[?#][A-Za-z0-9_%=&.-]*)?$/.test(value || "") ? value : "contact.html";
  const nextFromUrl = () => safeNext(new URLSearchParams(location.search).get("next") || sessionStorage.getItem("repareMobile_post_auth_next"));
  const accountUrl = (page, next) => page + "?next=" + encodeURIComponent(safeNext(next));
  const getUser = async () => {
    const result = await client().auth.getUser();
    if (result.error) throw result.error;
    return result.data.user;
  };
  api.client = client;
  api.getUser = getUser;
  api.requireUser = async () => {
    const user = await getUser();
    if (!user) throw new Error("Connectez-vous pour envoyer une demande.");
    return user;
  };
  api.signOut = async () => {
    const result = await client().auth.signOut();
    if (result.error) throw result.error;
  };
  api.completeRepairRequest = () => sessionStorage.removeItem("repareMobile_request_attempt");
  api.createRepairRequest = async (request) => {
    const user = await api.requireUser();
    const key = "repareMobile_request_attempt";
    let attemptId = sessionStorage.getItem(key);
    if (!attemptId) {
      attemptId = crypto.randomUUID();
      sessionStorage.setItem(key, attemptId);
    }
    const result = await client().rpc("create_repair_request", {
      p_attempt_id: attemptId, p_brand: request.brand, p_model: request.model,
      p_repair_type: request.repairType, p_client_name: request.name,
      p_client_email: request.email, p_client_phone: request.phone,
      p_cart_items: request.cartItems || []
    });
    if (result.error) throw result.error;
    if (!result.data || result.data.user_id !== user.id) throw new Error("La confirmation de la demande est invalide.");
    return result.data;
  };
  api.listMyRequests = async () => {
    const user = await api.requireUser();
    const result = await client().from("repair_requests")
      .select("id,reference,brand,model,repair_type,cart_items,status,created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
    if (result.error) throw result.error;
    return result.data || [];
  };
  api.isAdmin = async (user) => {
    if (!user) return false;
    const result = await client().from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
    if (result.error) throw result.error;
    return result.data?.role === "admin";
  };
  api.listServices = async () => {
    const result = await client().from("repair_services").select("id,brand,model,repair_type,estimate_price,active").order("brand").order("model");
    if (result.error) throw result.error;
    return result.data || [];
  };
  const refreshPublicPrices = async () => {
    if (!window.supabaseClient || !document.querySelector(".cart-add")) return;
    try {
      const services = await api.listServices();
      document.querySelectorAll(".cart-add").forEach((button) => {
        const service = services.find((entry) => entry.brand === button.dataset.brand && entry.model === button.dataset.model && entry.repair_type === button.dataset.repair);
        if (!service) return;
        button.dataset.price = service.estimate_price == null ? "" : String(service.estimate_price);
        const label = button.parentElement?.querySelector("strong");
        if (label) label.textContent = service.estimate_price == null ? "À confirmer" : `${service.estimate_price} DT`;
        button.disabled = !service.active;
      });
    } catch { /* Les tarifs éditoriaux restent visibles si Supabase est momentanément indisponible. */ }
  };
  refreshPublicPrices();
  api.saveService = async (service) => {
    const user = await api.requireUser();
    if (!(await api.isAdmin(user))) throw new Error("Action réservée à l’administrateur.");
    const payload = { brand: service.brand.trim(), model: service.model.trim(), repair_type: service.repairType.trim(), estimate_price: service.price === "" ? null : Number(service.price), active: true };
    const query = service.id ? client().from("repair_services").update(payload).eq("id", service.id) : client().from("repair_services").insert(payload);
    const result = await query.select("id").single();
    if (result.error) throw result.error;
  };
  api.deleteService = async (id) => {
    const user = await api.requireUser();
    if (!(await api.isAdmin(user))) throw new Error("Action réservée à l’administrateur.");
    const result = await client().from("repair_services").delete().eq("id", id);
    if (result.error) throw result.error;
  };

  document.querySelectorAll(".account-nav-link").forEach(async (link) => {
    if (!window.supabaseClient) return;
    try {
      const user = await getUser();
      if (user) {
        link.href = "mon-compte.html"; link.textContent = "Mon compte";
        if (await api.isAdmin(user) && !document.querySelector(".admin-nav-link")) {
          const admin = document.createElement("a"); admin.href = "admin.html";
          admin.className = "admin-nav-link"; admin.textContent = "Administration"; link.after(admin);
        }
      }
    } catch { /* La navigation reste disponible si le réseau est indisponible. */ }
  });

  const contactForm = $(".contact-form"), contactGate = $("#account-required");
  if (contactForm && contactGate) (async () => {
    if (!window.supabaseClient) {
      contactForm.hidden = true;
      contactGate.hidden = false;
      const note = contactGate.querySelector(".auth-disclaimer");
      if (note) note.textContent = "La connexion Supabase doit être configurée par le propriétaire du site avant de recevoir des demandes.";
      return;
    }
    try {
      const user = await getUser();
      contactForm.hidden = !user;
      contactGate.hidden = Boolean(user);
      if (user) {
        const name = contactForm.querySelector("#name"), email = contactForm.querySelector("#email");
        if (name && !name.value) name.value = [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(" ");
        if (email && !email.value) email.value = user.email || "";
      } else {
        const next = location.pathname.split("/").pop() + location.search;
        const signupLink = contactGate.querySelector('a[href^="inscription"]');
        const loginLink = contactGate.querySelector('a[href^="connexion"]');
        if (signupLink) signupLink.href = accountUrl("inscription.html", next);
        if (loginLink) loginLink.href = accountUrl("connexion.html", next);
      }
    } catch {
      contactForm.hidden = true;
      contactGate.hidden = false;
    }
  })();

  const signup = $("#signup-form");
  if (signup) {
    const next = nextFromUrl(), loginLink = signup.querySelector(".auth-switch a");
    sessionStorage.setItem("repareMobile_post_auth_next", next);
    if (loginLink) loginLink.href = accountUrl("connexion.html", next);
    signup.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = $("#signup-message");
      const firstName = $("#first-name").value.trim(), lastName = $("#last-name").value.trim();
      const email = $("#signup-email").value.trim().toLowerCase(), password = $("#signup-password").value;
      if (password !== $("#signup-confirm").value) return show(status, "Les deux mots de passe ne correspondent pas.");
      if (!$("#demo-terms").checked) return show(status, "Veuillez accepter l’utilisation de vos coordonnées pour le suivi de vos demandes.");
      try {
        const redirect = new URL("verification.html", location.href).href;
        const result = await client().auth.signUp({
          email, password, options: { emailRedirectTo: redirect, data: { first_name: firstName, last_name: lastName } }
        });
        if (result.error) throw result.error;
        if (result.data.session) location.href = next;
        else show(status, "Inscription acceptée par Supabase. Vérifiez votre boîte email et confirmez l’adresse avant de vous connecter.", true);
      } catch (error) { show(status, error.message || "Inscription impossible. Vérifiez la configuration Supabase."); }
    });
  }

  const login = $("#login-form");
  if (login) {
    const next = nextFromUrl(), signupLink = login.querySelector(".auth-switch a");
    if (signupLink) signupLink.href = accountUrl("inscription.html", next);
    const forgot = $("#forgot-password");
    if (forgot) {
      forgot.hidden = !window.supabaseClient;
      forgot.addEventListener("click", async () => {
        const email = $("#login-email").value.trim().toLowerCase();
        const status = $("#login-message");
        if (!email) {
          show(status, "Saisissez votre adresse email avant de demander un lien de récupération.");
          $("#login-email").focus();
          return;
        }
        forgot.disabled = true;
        try {
          const redirect = "https://reparation-mobile.vercel.app/nouveau-mot-de-passe.html";
          const result = await client().auth.resetPasswordForEmail(email, { redirectTo: redirect });
          if (result.error) throw result.error;
          show(status, "Si un compte correspond à cette adresse, un lien de récupération va être envoyé. Vérifiez aussi les courriers indésirables.", true);
        } catch (error) {
          show(status, error.message || "Impossible d’envoyer le lien de récupération. Réessayez plus tard.");
        } finally {
          forgot.disabled = false;
        }
      });
    }
    login.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = $("#login-message");
      try {
        const result = await client().auth.signInWithPassword({
          email: $("#login-email").value.trim().toLowerCase(), password: $("#login-password").value
        });
        if (result.error) throw result.error;
        if (!result.data.user) throw new Error("Connexion non confirmée. Vérifiez votre adresse email.");
        location.href = next;
      } catch (error) { show(status, error.message || "Connexion impossible."); }
    });
  }

  const passwordResetForm = $("#password-reset-form");
  if (passwordResetForm) {
    const status = $("#password-reset-message");
    let recoverySession = false;
    const showResetForm = () => {
      recoverySession = true;
      passwordResetForm.hidden = false;
      show(status, "Choisissez un nouveau mot de passe.", true);
    };
    if (!window.supabaseClient) {
      show(status, "La connexion Supabase n’est pas configurée.");
    } else {
      client().auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) showResetForm();
      });
      show(status, "Ouvrez le lien de récupération reçu par email pour choisir un nouveau mot de passe.");
      passwordResetForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const password = $("#new-password").value;
        const confirmation = $("#new-password-confirm").value;
        const submit = passwordResetForm.querySelector('[type="submit"]');
        if (!recoverySession) {
          show(status, "Le lien de récupération est absent ou expiré. Demandez-en un nouveau depuis la page de connexion.");
          return;
        }
        if (password.length < 8) {
          show(status, "Le mot de passe doit contenir au moins 8 caractères.");
          return;
        }
        if (password !== confirmation) {
          show(status, "Les deux mots de passe ne correspondent pas.");
          return;
        }
        submit.disabled = true;
        try {
          const result = await client().auth.updateUser({ password });
          if (result.error) throw result.error;
          recoverySession = false;
          passwordResetForm.hidden = true;
          show(status, "Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter.", true);
        } catch (error) {
          show(status, error.message || "La modification du mot de passe a échoué. Réessayez avec le lien reçu.");
        } finally {
          submit.disabled = false;
        }
      });
    }
  }

  $("#logout-button")?.addEventListener("click", async () => {
    try { await api.signOut(); location.href = "index.html"; }
    catch (error) { show($("#account-message"), error.message || "Déconnexion impossible."); }
  });

  const account = $(".account-page");
  if (account) (async () => {
    try {
      const user = await api.requireUser();
      const name = user.user_metadata?.first_name || user.email?.split("@")[0] || "client";
      $("#account-greeting").textContent = "Bonjour, " + name;
      const details = $("#account-details");
      [["Prénom", user.user_metadata?.first_name || "—"], ["Nom", user.user_metadata?.last_name || "—"], ["Email", user.email || "—"], ["Compte", "Authentifié par Supabase"]].forEach(([label, value]) => {
        const dt = document.createElement("dt"); dt.textContent = label;
        const dd = document.createElement("dd"); dd.textContent = value; details.append(dt, dd);
      });
      const rows = await api.listMyRequests(), history = $("#request-history");
      if (!rows.length) {
        const empty = document.createElement("p"); empty.className = "empty-requests";
        empty.textContent = "Aucune demande enregistrée."; history.append(empty);
      } else rows.forEach((row) => {
        const item = document.createElement("article"); item.className = "request-item";
        const title = document.createElement("h3"); title.textContent = row.brand + " " + row.model;
        const info = document.createElement("p"); info.textContent = row.repair_type + " · " + new Date(row.created_at).toLocaleString("fr-FR");
        const state = document.createElement("p"); state.textContent = "Référence " + row.reference + " · Statut : " + row.status;
        item.append(title, info, state);
        if (Array.isArray(row.cart_items) && row.cart_items.length) {
          const cart = document.createElement("p");
          cart.textContent = "Panier : " + row.cart_items.map((line) => `${line.brand} ${line.model} — ${line.repairType} × ${line.quantity}`).join(" · ");
          item.append(cart);
        }
        history.append(item);
      });
      if (await api.isAdmin(user)) $("#admin-link")?.removeAttribute("hidden");
    } catch (error) {
      if (!window.supabaseClient) {
        const msg = $("#account-message"); if (msg) show(msg, error.message, false);
        return;
      }
      location.replace(accountUrl("connexion.html", "mon-compte.html"));
    }
  })();

  const verification = $("#verify-email-copy");
  if (verification) verification.textContent = "Si l’inscription a été acceptée, Supabase a envoyé un message de confirmation. Vérifiez votre boîte de réception et les courriers indésirables, puis revenez vous connecter.";
  $("#verify-form")?.remove();
  $("#verify-demo-code")?.remove();

  const admin = $("#admin-requests");
  if (admin) {
    const adminLogin = $("#admin-login"), adminPanel = $("#admin-panel"), loginForm = $("#admin-login-form");
    const loginMessage = $("#admin-login-message");
    const revealAdminPanel = async (user) => {
      if (!(await api.isAdmin(user))) {
        show(loginMessage, "Ce compte n’a pas le rôle administrateur. Utilisez le compte autorisé.");
        return false;
      }
      adminLogin.hidden = true;
      adminPanel.hidden = false;
      return true;
    };
    loginForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = loginForm.querySelector('[type="submit"]');
      button.disabled = true;
      show(loginMessage, "Connexion en cours…", true);
      try {
        const result = await client().auth.signInWithPassword({
          email: $("#admin-email").value.trim().toLowerCase(),
          password: $("#admin-password").value
        });
        if (result.error) throw result.error;
        if (!result.data.user || !(await revealAdminPanel(result.data.user))) {
          if (result.data.user) await api.signOut();
          return;
        }
        location.reload();
      } catch (error) {
        show(loginMessage, error.message || "Connexion impossible. Vérifiez votre email et votre mot de passe.");
      } finally { button.disabled = false; }
    });
    (async () => {
      try {
        const user = await getUser();
        if (user) await revealAdminPanel(user);
      } catch (error) { show(loginMessage, error.message || "Connexion à Supabase impossible."); }
    })();
    const statusNode = $("#admin-message"), filter = $("#admin-filter"), pageSize = 50;
    let offset = 0, rows = [];
    const load = async (append = false) => {
      try {
        const user = await api.requireUser();
        if (!(await api.isAdmin(user))) throw new Error("Cette page est réservée à l’administrateur.");
        const start = append ? offset : 0, end = start + pageSize - 1;
        let query = client().from("repair_requests").select("id,reference,brand,model,repair_type,cart_items,client_name,client_email,client_phone,status,created_at").order("created_at", { ascending: false }).range(start, end);
        if (filter.value !== "all") query = query.eq("status", filter.value);
        const result = await query;
        if (result.error) throw result.error;
        rows = append ? rows.concat(result.data || []) : (result.data || []); offset = rows.length; render();
        show(statusNode, rows.length ? rows.length + " demandes affichées." : "Aucune demande pour ce filtre.", true);
      } catch (error) { show(statusNode, error.message || "Chargement impossible."); }
    };
    const render = () => {
      const list = $("#admin-request-list"); list.replaceChildren();
      rows.forEach((row) => {
        const card = document.createElement("article"); card.className = "admin-request";
        const head = document.createElement("div"); head.className = "admin-request-head";
        const title = document.createElement("h2"); title.textContent = row.reference + " · " + row.brand + " " + row.model;
        const date = document.createElement("time"); date.textContent = new Date(row.created_at).toLocaleString("fr-FR");
        head.append(title, date);
        const contact = document.createElement("p"); contact.textContent = row.client_name + " · " + row.client_email + " · " + row.client_phone;
        const repair = document.createElement("p");
        repair.textContent = row.repair_type + (Array.isArray(row.cart_items) && row.cart_items.length ? " · Panier : " + row.cart_items.map((line) => `${line.brand} ${line.model}, ${line.repairType} × ${line.quantity}`).join(" ; ") : "");
        const form = document.createElement("form"); form.className = "admin-status-form";
        const select = document.createElement("select");
        [["new","Nouvelle"],["in_progress","En préparation"],["completed","Terminée"],["cancelled","Annulée"]].forEach(([value,text]) => select.add(new Option(text,value)));
        select.value = row.status;
        const save = document.createElement("button"); save.type = "submit"; save.className = "button button-secondary"; save.textContent = "Enregistrer le statut";
        form.append(select, save);
        form.addEventListener("submit", async (event) => {
          event.preventDefault(); save.disabled = true;
          try {
            const result = await client().from("repair_requests").update({ status: select.value }).eq("id", row.id).eq("status", row.status).select("id").maybeSingle();
            if (result.error) throw result.error;
            if (!result.data) throw new Error("La demande a changé entre-temps. Actualisez la liste avant de réessayer.");
            row.status = select.value; show(statusNode, "Statut de " + row.reference + " mis à jour.", true); render();
          } catch (error) { show(statusNode, error.message || "Modification impossible."); }
          finally { save.disabled = false; }
        });
        card.append(head, contact, repair, form); list.append(card);
      });
    };
    $("#admin-refresh")?.addEventListener("click", () => load(false));
    filter?.addEventListener("change", () => load(false));
    $("#admin-more")?.addEventListener("click", () => load(true));
    load(false);
  }

  const serviceAdmin = $("#admin-services");
  if (serviceAdmin) {
    const message = $("#services-message"), form = $("#service-form"), list = $("#service-list");
    let services = [];
    const renderServices = () => {
      list.replaceChildren();
      services.forEach((service) => {
        const row = document.createElement("article"); row.className = "admin-request";
        const title = document.createElement("h3"); title.textContent = `${service.brand} ${service.model} · ${service.repair_type}`;
        const price = document.createElement("p"); price.textContent = service.estimate_price == null ? "Prix à confirmer" : `${service.estimate_price} DT estimés`;
        const edit = document.createElement("button"); edit.type = "button"; edit.className = "button button-secondary"; edit.textContent = "Modifier";
        edit.addEventListener("click", () => {
          form.elements.namedItem("service-id").value = service.id;
          form.elements.namedItem("service-brand").value = service.brand;
          form.elements.namedItem("service-model").value = service.model;
          form.elements.namedItem("service-repair").value = service.repair_type;
          form.elements.namedItem("service-price").value = service.estimate_price ?? "";
          form.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        const remove = document.createElement("button"); remove.type = "button"; remove.className = "button button-secondary"; remove.textContent = "Supprimer";
        remove.addEventListener("click", async () => {
          remove.disabled = true;
          try { await api.deleteService(service.id); await loadServices(); show(message, "Service supprimé.", true); }
          catch (error) { show(message, error.message || "Suppression impossible."); }
          finally { remove.disabled = false; }
        });
        row.append(title, price, edit, remove); list.append(row);
      });
    };
    const loadServices = async () => {
      const user = await api.requireUser();
      if (!(await api.isAdmin(user))) throw new Error("Cette page est réservée à l’administrateur.");
      services = await api.listServices();
      renderServices();
    };
    loadServices().catch((error) => show(message, error.message || "Chargement du catalogue impossible."));
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form), button = form.querySelector('[type="submit"]');
      const originalLabel = button.textContent;
      button.disabled = true;
      button.textContent = "Enregistrement…";
      show(message, "Enregistrement du service dans Supabase…");
      try {
        await api.saveService({ id: data.get("service-id"), brand: data.get("service-brand"), model: data.get("service-model"), repairType: data.get("service-repair"), price: data.get("service-price") });
        form.reset();
        await loadServices();
        show(message, "Service enregistré avec succès et ajouté au catalogue.", true);
        message.scrollIntoView({ behavior: "smooth", block: "center" });
        button.textContent = "Enregistré ✓";
        window.setTimeout(() => { button.textContent = originalLabel; }, 1800);
      } catch (error) {
        show(message, error.message || "Enregistrement impossible.");
        message.scrollIntoView({ behavior: "smooth", block: "center" });
      } finally {
        button.disabled = false;
        if (button.textContent !== "Enregistré ✓") button.textContent = originalLabel;
      }
    });
    $("#service-new")?.addEventListener("click", () => { form.reset(); show(message, "Nouveau service : remplissez les champs puis enregistrez.", true); });
  }
  window.RepareAPI = api;
})();





