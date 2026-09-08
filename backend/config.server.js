function requiredEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}
function getSupabaseConfig() {
  return {
    url: requiredEnvironment("SUPABASE_URL"),
    publishableKey: requiredEnvironment("SUPABASE_PUBLISHABLE_KEY"),
    serviceRoleKey: requiredEnvironment("SUPABASE_SERVICE_ROLE_KEY")
  };
}
function getAdminPasscode() {
  return requiredEnvironment("ADMIN_PASSCODE");
}
export {
  getAdminPasscode,
  getSupabaseConfig
};
