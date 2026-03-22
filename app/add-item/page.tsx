// app/add-item/page.tsx — SERVER COMPONENT
// Fetches categories on the server so they arrive with the HTML.
// The client component receives them as props — zero loading state.

import { createServerSupabaseClient } from "../lib/supabaseServer";
import AddItemClient from "./AddItemClient";

export default async function AddItemPage() {
  const supabase = createServerSupabaseClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  return <AddItemClient categories={categories || []} />;
}
