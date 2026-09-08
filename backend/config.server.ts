function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function getSupabaseConfig() {
  return {
    url: requiredEnvironment("SUPABASE_URL"),
    publishableKey: requiredEnvironment("SUPABASE_PUBLISHABLE_KEY"),
    serviceRoleKey: requiredEnvironment("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function getAdminPasscode() {
  return requiredEnvironment("ADMIN_PASSCODE");
}