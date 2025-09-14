import { supabase } from "@/supabaseClient";
import initStripe from "stripe";
import { createClient } from "@supabase/supabase-js";


// UPDATEにauth認証が必要なため追加している
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  );

const handler = async (req, res) => {
    if (req.query.API_ROUTE_SECRET !== process.env.API_ROUTE_SECRET) {
        return res.status(401).send("Unauthorized");
    }
    console.log("Request body record:", req.body.record);
    const stripe = initStripe(process.env.STRIPE_SECRET_KEY)

    const customer = await stripe.customers.create({
        email: req.body.record.email,
      });

    const userId = req.body.record.id;

    // ユーザーIDでデータを取得 (更新前)
    const { data: profileBeforeUpdate, error: errorBeforeUpdate } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
    console.log("Profile data before update:", profileBeforeUpdate);

    const { data, error } = await supabaseAdmin
        .from("profiles")
        .update({
            stripe_customer: customer.id,
        })
        .eq("id", userId);
        console.log("Update response:", { data, error }); // この行を追加


    // 以下を追加
    const { data: updatedProfileData, error: updatedProfileError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

    console.log("Updated profile data:", updatedProfileData);



    if (error) {
        console.error("Error updating stripe_customer:", error);
        res.status(500).send({ message: "Error updating stripe_customer" });
    } else {
        // ユーザーIDでデータを取得 (更新後)
        const { data: profileAfterUpdate, error: errorAfterUpdate } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
        console.log("Profile data after update:", profileAfterUpdate);

        res.send({ message: `stripe customer created: ${customer.id}` });
    }
};

export const config = {
    api: {
      bodyParser: true,
    },
  };
  
  export default handler;
