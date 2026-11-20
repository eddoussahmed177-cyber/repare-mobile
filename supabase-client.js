/* Configuration publique Supabase. Remplacez URL et clé Publishable. Jamais de clé secret/service_role ici. */
(() => {
  const projectUrl = "https://xzqzpisjongrlzyzgqcs.supabase.co";
  const publishableKey = "sb_publishable_0mSQPkWi6MYYBd8TnoPWsQ_MoeXCMlX";
  const validUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(projectUrl);
  const validKey = publishableKey && !publishableKey.includes("VOTRE_");
  if (!window.supabase?.createClient || !validUrl || !validKey) {
    window.supabaseClient = null;
    window.supabaseConfigurationReady = false;
    return;
  }
  window.supabaseClient = window.supabase.createClient(projectUrl, publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  window.supabaseConfigurationReady = true;
})();
