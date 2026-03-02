/**
 * DEKLATA TEST DATA SEEDER
 * ─────────────────────────────────────────────
 * Usage:
 *   node seed.mjs 100      → insert 100 items
 *   node seed.mjs 1000     → insert 1000 items
 *   node seed.mjs          → defaults to 100
 *
 * Run from your project root:
 *   node seed.mjs 500
 *
 * All seeded items are tagged with description
 * containing [SEED] so the cleanup script can
 * find and delete them safely — real items are
 * never touched.
 * ─────────────────────────────────────────────
 */

import { createClient } from "@supabase/supabase-js";

// ── Config ────────────────────────────────────
const SUPABASE_URL = "https://iibknadykycghvbjbwxs.supabase.co";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpYmtuYWR5a3ljZ2h2Ympid3hzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE1OTMyMywiZXhwIjoyMDg0NzM1MzIzfQ.nSdkI5o9PCvjFlt1aqWx1VOoM3trPbGsKJwUP75wV7U";

// !! IMPORTANT: Replace this with YOUR actual user ID from Supabase
// Dashboard → Authentication → Users → copy your user's UUID
// All seeded items will be "owned" by this account
const SEED_OWNER_ID = "4b43d954-d785-46bd-ba8b-d5db83d85d2e";

const BATCH_SIZE = 50; // insert 50 rows at a time to avoid timeouts
const COUNT = parseInt(process.argv[2]) || 100;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Realistic Ghanaian student data ──────────
const ITEM_TEMPLATES = [
  // Electronics
  {
    name: "Infinix Hot 10 phone",
    cat: "Electronics",
    condition: "Good",
    desc: "Screen has minor crack but fully functional. Comes with charger.",
  },
  {
    name: "Laptop cooling pad",
    cat: "Electronics",
    condition: "Excellent",
    desc: "Used for one semester. Still works perfectly.",
  },
  {
    name: "USB-C charging cable",
    cat: "Electronics",
    condition: "Good",
    desc: "Fast charging cable, 1.5m length.",
  },
  {
    name: "Earphones with mic",
    cat: "Electronics",
    condition: "Fair",
    desc: "Left ear slightly quieter but still usable.",
  },
  {
    name: "Extension board 4-way",
    cat: "Electronics",
    condition: "Good",
    desc: "4 sockets, surge protected. Very useful in hostel.",
  },
  {
    name: "Bluetooth speaker",
    cat: "Electronics",
    condition: "Good",
    desc: "JBL Go clone. Decent sound for dorm room.",
  },
  {
    name: "Power bank 10000mAh",
    cat: "Electronics",
    condition: "Fair",
    desc: "Charges to about 70% capacity now. Still useful.",
  },
  {
    name: "Scientific calculator",
    cat: "Electronics",
    condition: "Excellent",
    desc: "Casio fx-991ES. All functions working perfectly.",
  },
  {
    name: "Laptop bag 15 inch",
    cat: "Electronics",
    condition: "Good",
    desc: "Black padded bag. Fits most laptops up to 15 inches.",
  },
  {
    name: "Phone tripod stand",
    cat: "Electronics",
    condition: "Excellent",
    desc: "Mini flexible tripod, never really used it.",
  },

  // Books
  {
    name: "Engineering Mathematics Yr 1",
    cat: "Books and Materials",
    condition: "Good",
    desc: "Kreyszig Advanced Engineering Mathematics. Some highlights.",
  },
  {
    name: "Anatomy & Physiology textbook",
    cat: "Books and Materials",
    condition: "Fair",
    desc: "Used for two years. Pages intact but cover worn.",
  },
  {
    name: "Business Management 3rd Ed",
    cat: "Books and Materials",
    condition: "Excellent",
    desc: "Barely used. Realised I didn't need it for my course.",
  },
  {
    name: "Organic Chemistry Clayden",
    cat: "Books and Materials",
    condition: "Good",
    desc: "Essential for chemistry students. Well-used but readable.",
  },
  {
    name: "WASSCE past questions bundle",
    cat: "Books and Materials",
    condition: "Good",
    desc: "5 years of past questions for core subjects.",
  },
  {
    name: "Engineering drawing set",
    cat: "Books and Materials",
    condition: "Good",
    desc: "Full set with compass, rulers, protractor. Missing one pencil.",
  },
  {
    name: "Introduction to Programming",
    cat: "Books and Materials",
    condition: "Excellent",
    desc: "Python textbook, first edition. Clean copy.",
  },
  {
    name: "French dictionary",
    cat: "Books and Materials",
    condition: "Good",
    desc: "Oxford French-English dictionary. Very helpful.",
  },
  {
    name: "Lab notebook 200 pages",
    cat: "Books and Materials",
    condition: "Fair",
    desc: "About 60 pages used. Plenty left for another student.",
  },
  {
    name: "Accounting principles book",
    cat: "Books and Materials",
    condition: "Good",
    desc: "Horngren's Accounting, standard edition.",
  },

  // Clothing
  {
    name: "White lab coat size M",
    cat: "Clothing and Accessories",
    condition: "Good",
    desc: "Used for practicals. Washed and clean. Size medium.",
  },
  {
    name: 'Black formal trousers 32"-30"',
    cat: "Clothing and Accessories",
    condition: "Good",
    desc: "Slim fit. Wore maybe 5 times. In good shape.",
  },
  {
    name: "UDS branded hoodie L",
    cat: "Clothing and Accessories",
    condition: "Good",
    desc: "Green UDS hoodie size Large. Warm and comfortable.",
  },
  {
    name: "Leather belt size 32",
    cat: "Clothing and Accessories",
    condition: "Excellent",
    desc: "Brown leather belt. Never really wore it.",
  },
  {
    name: "Rain jacket size M",
    cat: "Clothing and Accessories",
    condition: "Good",
    desc: "Waterproof. Essential for rainy season campus life.",
  },
  {
    name: "Canvas sneakers size 43",
    cat: "Clothing and Accessories",
    condition: "Fair",
    desc: "White canvas shoes. Some scuffs but still wearable.",
  },
  {
    name: "Formal shirt white size M",
    cat: "Clothing and Accessories",
    condition: "Excellent",
    desc: "Ironed and clean. Wore only to one interview.",
  },
  {
    name: "Sports shorts Nike size M",
    cat: "Clothing and Accessories",
    condition: "Good",
    desc: "Comfortable for gym or evening jogs.",
  },
  {
    name: "Backpack 30L",
    cat: "Clothing and Accessories",
    condition: "Good",
    desc: "Dark blue backpack. Multiple compartments, good condition.",
  },
  {
    name: "Sunglasses UV400",
    cat: "Clothing and Accessories",
    condition: "Excellent",
    desc: "Tamale sun is no joke. These are good quality.",
  },

  // Furniture
  {
    name: "Study desk lamp",
    cat: "Furniture and Appliances",
    condition: "Good",
    desc: "LED lamp, adjustable neck. Runs on USB or plug.",
  },
  {
    name: "Small reading table",
    cat: "Furniture and Appliances",
    condition: "Fair",
    desc: "Lightweight foldable table. One leg wobbly but usable.",
  },
  {
    name: "Iron and ironing board",
    cat: "Furniture and Appliances",
    condition: "Good",
    desc: "Philips steam iron with small ironing board.",
  },
  {
    name: "Electric kettle 1.5L",
    cat: "Furniture and Appliances",
    condition: "Good",
    desc: "Boils fast. Great for noodles and morning tea.",
  },
  {
    name: "Room fan stand 16 inch",
    cat: "Furniture and Appliances",
    condition: "Fair",
    desc: "Oscillates but speed 3 is a bit noisy. Speeds 1 and 2 fine.",
  },
  {
    name: "Wall clock",
    cat: "Furniture and Appliances",
    condition: "Good",
    desc: "Simple analogue clock. Needs AA battery.",
  },
  {
    name: "Plastic storage drawers",
    cat: "Furniture and Appliances",
    condition: "Good",
    desc: "3-drawer unit, great for organising hostel room.",
  },
  {
    name: "Clothes drying rack",
    cat: "Furniture and Appliances",
    condition: "Good",
    desc: "Foldable drying rack. Used it for a year.",
  },
  {
    name: "Bluetooth alarm clock",
    cat: "Furniture and Appliances",
    condition: "Excellent",
    desc: "Also plays music. Upgraded so no longer need this.",
  },
  {
    name: "Toilet brush and holder",
    cat: "Furniture and Appliances",
    condition: "Good",
    desc: "Still clean. Moving out so can't take it.",
  },

  // Sports
  {
    name: "Football size 5",
    cat: "Sports and Leisure",
    condition: "Good",
    desc: "Official match ball. Still has good air pressure.",
  },
  {
    name: "Skipping rope",
    cat: "Sports and Leisure",
    condition: "Excellent",
    desc: "Speed rope with ball bearings. Barely used.",
  },
  {
    name: "Yoga mat",
    cat: "Sports and Leisure",
    condition: "Good",
    desc: "6mm thick mat. Comes with carry strap.",
  },
  {
    name: "Dumbbells 5kg pair",
    cat: "Sports and Leisure",
    condition: "Good",
    desc: "Fixed weight rubber dumbbells. Great for room workouts.",
  },
  {
    name: "Chess set",
    cat: "Sports and Leisure",
    condition: "Good",
    desc: "Wooden chess set with all pieces. Great for common room.",
  },
  {
    name: "Table tennis paddle pair",
    cat: "Sports and Leisure",
    condition: "Good",
    desc: "Two paddles and 3 balls. Campus table available.",
  },
  {
    name: "Playing cards",
    cat: "Sports and Leisure",
    condition: "Excellent",
    desc: "Two sealed decks. Never opened.",
  },
  {
    name: "Resistance bands set",
    cat: "Sports and Leisure",
    condition: "Good",
    desc: "5 different resistance levels. Great for home workouts.",
  },
  {
    name: "Badminton set",
    cat: "Sports and Leisure",
    condition: "Fair",
    desc: "2 rackets and 3 shuttlecocks. One racket grip needs retaping.",
  },
  {
    name: "Bluetooth earbuds for gym",
    cat: "Sports and Leisure",
    condition: "Good",
    desc: "Sweat resistant. Battery life about 4 hours.",
  },

  // Kitchen
  {
    name: "Rice cooker 1L",
    cat: "Kitchen Items",
    condition: "Good",
    desc: "Small rice cooker for hostel room use. Cooks perfectly.",
  },
  {
    name: "Plates and bowls set",
    cat: "Kitchen Items",
    condition: "Good",
    desc: "4 plates, 4 bowls, melamine. Unbreakable.",
  },
  {
    name: "Stainless steel flask",
    cat: "Kitchen Items",
    condition: "Good",
    desc: "500ml. Keeps water cold for 12 hours.",
  },
  {
    name: "Cutlery set",
    cat: "Kitchen Items",
    condition: "Excellent",
    desc: "6 forks, 6 spoons, 6 knives in a case.",
  },
  {
    name: "Plastic food containers",
    cat: "Kitchen Items",
    condition: "Good",
    desc: "Set of 5 airtight containers, different sizes.",
  },
  {
    name: "Cooking pot 3L",
    cat: "Kitchen Items",
    condition: "Fair",
    desc: "Aluminium pot. Some discolouration inside but still good.",
  },
  {
    name: "Wooden spoon set",
    cat: "Kitchen Items",
    condition: "Good",
    desc: "4 wooden spoons and a ladle.",
  },
  {
    name: "Can opener",
    cat: "Kitchen Items",
    condition: "Excellent",
    desc: "Manual can opener. Works perfectly.",
  },
  {
    name: "Kitchen knife set",
    cat: "Kitchen Items",
    condition: "Good",
    desc: "3 knives and a chopping board. Kept clean.",
  },
  {
    name: "Drinking cups set of 6",
    cat: "Kitchen Items",
    condition: "Good",
    desc: "Plastic cups. Lightweight and shatterproof.",
  },

  // Lab
  {
    name: "Lab goggles",
    cat: "Lab and Practical Equipment",
    condition: "Good",
    desc: "Anti-fog safety goggles. Cleaned and disinfected.",
  },
  {
    name: "Lab gloves box (nitrile)",
    cat: "Lab and Practical Equipment",
    condition: "Good",
    desc: "About 60 gloves left in box. Size M.",
  },
  {
    name: "Pipette set 10ml",
    cat: "Lab and Practical Equipment",
    condition: "Good",
    desc: "Glass pipettes with rubber bulbs. All working.",
  },
  {
    name: "Lab apron",
    cat: "Lab and Practical Equipment",
    condition: "Good",
    desc: "Blue cotton lab apron. Washed and clean.",
  },
  {
    name: "Microscope slides box",
    cat: "Lab and Practical Equipment",
    condition: "Good",
    desc: "About 40 clean slides remaining.",
  },
  {
    name: "Dissection kit",
    cat: "Lab and Practical Equipment",
    condition: "Good",
    desc: "Scalpel, forceps, scissors, probe. All in case.",
  },
  {
    name: "Measuring cylinders set",
    cat: "Lab and Practical Equipment",
    condition: "Good",
    desc: "10ml, 25ml, 50ml, 100ml glass cylinders.",
  },
  {
    name: "Digital vernier caliper",
    cat: "Lab and Practical Equipment",
    condition: "Excellent",
    desc: "0.01mm precision. Battery included.",
  },
  {
    name: "Spirit burner",
    cat: "Lab and Practical Equipment",
    condition: "Good",
    desc: "Glass spirit lamp with wick. Refillable.",
  },
  {
    name: "Thermometer set",
    cat: "Lab and Practical Equipment",
    condition: "Good",
    desc: "Clinical and lab thermometers. Both working.",
  },
];

const PICKUP_LOCATIONS = [
  "Sunshine Hostel, UDS Tamale",
  "Unity Hall, UDS Nyankpala",
  "Akatsi Hostel Block C",
  "Tamale Tech Main Gate",
  "Pentagon Hostel Room 214",
  "Faculty of Engineering Block",
  "Central Market area, Tamale",
  "Lamashegu Hostel A Block",
  "Student Union Building, UDS",
  "Science Block Corridor",
  "Library Annex, UDS Tamale",
  "Hall 3 Common Room, Nyankpala",
  "Pimpongtiyili area",
  "Gurugu Hostel",
  "Kaladan Hostel Block B",
  "HaLo Hotel area, Tamale",
  "Savelugu Junction",
  "Hostel F, UDS Tamale",
  "Old Campus Gate",
  "Sports Complex area",
];

const CAMPUSES = [
  "UDS-Tamale",
  "UDS-Tamale",
  "UDS-Tamale", // weighted more
  "UDS-Nyankpala",
  "UDS-Nyankpala",
  "Tamale Technical University",
];

// ── Helpers ───────────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDaysAgo(maxDays) {
  const ms = Math.floor(Math.random() * maxDays * 24 * 60 * 60 * 1000);
  return new Date(Date.now() - ms).toISOString();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Main ──────────────────────────────────────
async function main() {
  if (SEED_OWNER_ID === "PASTE_YOUR_USER_ID_HERE") {
    console.error("\n❌  ERROR: You need to set SEED_OWNER_ID in seed.mjs");
    console.error("   Go to Supabase Dashboard → Authentication → Users");
    console.error(
      "   Copy your user UUID and paste it on line 22 of seed.mjs\n",
    );
    process.exit(1);
  }

  console.log(`\n🌱  Deklata Seeder`);
  console.log(`   Inserting ${COUNT} test items...`);
  console.log(`   Owner ID: ${SEED_OWNER_ID}`);
  console.log(`   Batch size: ${BATCH_SIZE}\n`);

  // Fetch real category IDs from the database
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id, name");

  if (catError || !categories?.length) {
    console.error("❌  Could not fetch categories:", catError?.message);
    process.exit(1);
  }

  const catMap = {};
  categories.forEach((c) => {
    catMap[c.name] = c.id;
  });
  console.log(`✅  Found ${categories.length} categories`);

  // Build all items
  const allItems = [];
  const templates = shuffle([
    ...ITEM_TEMPLATES,
    ...ITEM_TEMPLATES,
    ...ITEM_TEMPLATES,
  ]); // repeat to cover large counts

  for (let i = 0; i < COUNT; i++) {
    const template = templates[i % templates.length];
    const campus = pick(CAMPUSES);
    const categoryId = catMap[template.cat] || categories[0].id;
    const categoryName = template.cat;

    // Vary names slightly so they're not all identical
    const suffix = COUNT > 100 ? ` #${i + 1}` : "";

    allItems.push({
      owner_id: SEED_OWNER_ID,
      name: template.name + suffix,
      description: `[SEED] ${template.desc}`, // [SEED] tag is how cleanup finds these
      category_id: categoryId,
      category_name: categoryName,
      pickup_location: pick(PICKUP_LOCATIONS),
      campus: campus,
      condition: template.condition,
      status: "available",
      is_locked: false,
      created_at: randomDaysAgo(30), // spread over last 30 days
    });
  }

  // Insert in batches
  let inserted = 0;
  const insertedIds = [];

  for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
    const batch = allItems.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from("items")
      .insert(batch)
      .select("id");

    if (error) {
      console.error(
        `❌  Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`,
        error.message,
      );
      console.error(
        "    Hint: Make sure SEED_OWNER_ID belongs to a real user in your DB",
      );
      process.exit(1);
    }

    insertedIds.push(...data.map((r) => r.id));
    inserted += batch.length;
    process.stdout.write(`\r   Inserted ${inserted}/${COUNT} items...`);
  }

  console.log(`\n✅  Inserted ${inserted} items successfully`);

  // Optionally add placeholder image URLs (Picsum — free random images, no signup)
  // This gives items realistic image thumbnails for visual testing
  console.log("\n   Adding placeholder images...");
  const imageRows = [];
  const IMAGE_SEEDS = [
    10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170,
    180, 190, 200,
  ];

  for (const id of insertedIds) {
    // ~70% of items get an image (realistic ratio)
    if (Math.random() < 0.7) {
      const seed = pick(IMAGE_SEEDS);
      imageRows.push({
        item_id: id,
        image_url: `https://picsum.photos/seed/${seed}/400/300`,
      });
    }
  }

  for (let i = 0; i < imageRows.length; i += BATCH_SIZE) {
    const batch = imageRows.slice(i, i + BATCH_SIZE);
    await supabase.from("item_images").insert(batch);
    process.stdout.write(
      `\r   Added images for ${Math.min(i + BATCH_SIZE, imageRows.length)}/${imageRows.length} items...`,
    );
  }

  console.log(`\n✅  Added images to ${imageRows.length} items`);
  console.log(`\n🎉  Done! ${inserted} test items are now live on Deklata.`);
  console.log(`   To delete them all safely, run: node cleanup.mjs\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
