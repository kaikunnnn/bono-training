import { redirect } from "next/navigation";

// /settings は /account にリダイレクト
export default function SettingsPage() {
  redirect("/account");
}
