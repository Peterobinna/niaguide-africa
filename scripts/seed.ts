import { writeFileSync } from "node:fs";
import { experts } from "../src/lib/catalogue";
const quote = (s: string) => `'${s.replaceAll("'", "''")}'`;
const rows = experts
  .filter((e) => !e.synthetic)
  .map(
    (e) =>
      `(${[e.id, e.name, e.field, e.country, e.description, e.status].map(quote).join(",")},false)`,
  )
  .join(",\n");
writeFileSync(
  "supabase/migrations/202609280002_catalogue.sql",
  `-- Neutral draft catalogue from the supplied project brief. No endorsements or sources.\ninsert into public.experts(id,name,field,country,description,status,synthetic) values\n${rows}\non conflict(id) do nothing;\n-- Fictional Amara content remains in the explicit demo adapter, not the live database.\n`,
);
