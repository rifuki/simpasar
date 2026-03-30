import { db } from "./database";
import { cities } from "../data/cities";
import { personas } from "../data/personas";
import { SYSTEM_PROMPT } from "../services/promptBuilder";

export function seedIfEmpty() {
  const cityCount = (db.query("SELECT COUNT(*) as count FROM cities").get() as { count: number }).count;
  if (cityCount > 0) return;

  console.log("[seed] Seeding cities and personas from static data...");

  const insertCity = db.prepare(`
    INSERT OR IGNORE INTO cities (id, name, province, tier, population, economic_profile, avg_monthly_expenditure, top_industries)
    VALUES ($id, $name, $province, $tier, $population, $economicProfile, $avgMonthlyExpenditure, $topIndustries)
  `);

  const insertPersona = db.prepare(`
    INSERT OR IGNORE INTO personas (id, city_id, name, age, age_group, gender, occupation, income_level, monthly_income, monthly_disposable, lifestyle, location, shopping_behavior, psychographic, city_context)
    VALUES ($id, $cityId, $name, $age, $ageGroup, $gender, $occupation, $incomeLevel, $monthlyIncome, $monthlyDisposable, $lifestyle, $location, $shoppingBehavior, $psychographic, $cityContext)
  `);

  const seedAll = db.transaction(() => {
    for (const city of cities) {
      insertCity.run({
        $id: city.id,
        $name: city.name,
        $province: city.province,
        $tier: city.tier,
        $population: city.population,
        $economicProfile: city.economicProfile,
        $avgMonthlyExpenditure: city.avgMonthlyExpenditure,
        $topIndustries: JSON.stringify(city.topIndustries),
      });
    }

    for (const p of personas) {
      insertPersona.run({
        $id: p.id,
        $cityId: p.cityId,
        $name: p.name,
        $age: p.age,
        $ageGroup: p.ageGroup,
        $gender: p.gender,
        $occupation: p.occupation,
        $incomeLevel: p.incomeLevel,
        $monthlyIncome: p.monthlyIncome,
        $monthlyDisposable: p.monthlyDisposable,
        $lifestyle: JSON.stringify(p.lifestyle),
        $location: p.location,
        $shoppingBehavior: JSON.stringify(p.shoppingBehavior),
        $psychographic: JSON.stringify(p.psychographic),
        $cityContext: JSON.stringify(p.cityContext),
      });
    }

    db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('system_prompt', $value)").run({
      $value: SYSTEM_PROMPT,
    });
  });

  seedAll();
  console.log(`[seed] Done — ${cities.length} cities, ${personas.length} personas`);
}

// Auto-run if executed directly
if (import.meta.main || !process.env.NODE_ENV) {
  seedIfEmpty();
}
