import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAuthUsers() {
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("Error:", error);
    return;
  }

  const migratedUsers = data.users.filter(
    (u) => u.user_metadata?.migrated_from === "stripe"
  );

  console.log("========================================");
  console.log("Auth Users Check");
  console.log("========================================");
  console.log(`Total Auth users: ${data.users.length}`);
  console.log(`Migrated users (from Stripe): ${migratedUsers.length}`);
  console.log("========================================\n");
}

checkAuthUsers().catch(console.error);
