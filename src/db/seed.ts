import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { brands, listings, matchas, stockHistory, storefronts, storefrontsBrands } from "@/db/schema";

const storefrontsData = [
  { name: "Sazen Tea", url: "https://www.sazentea.com" },
  { name: "Ippodo Tea", url: "https://global.ippodo-tea.co.jp" },
  { name: "Nakamura Tokichi", url: "https://global.tokichi.jp" },
  { name: "Horii Shichimeien", url: "https://horiishichimeien.com/en/" },
];

const brandsData = [
  {
    name: "Yamamasa Koyamaen",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/544b4179eacea9b841d89fba23b2dd2b.svg",
  },
  {
    name: "Marukyu Koyamaen",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/83cfced339322753e046868ed618c05e.svg",
  },
  {
    name: "Kanbayashi Shunsho",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/cffa571240529b82458e79f2a9628ab1.svg",
  },
  {
    name: "Hekisuien",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/db50b31a32043ee26dc005e74cae735b.jpg",
  },
  {
    name: "Horii Shichimeien",
    imageUrl:
      "https://instagram.fsin4-1.fna.fbcdn.net/v/t51.2885-19/312694423_3336877573226156_7481346773365740316_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fsin4-1.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QEidYc1QTdaLGuWmb5lEd_Juca6U5aHZs7g2ZKo43gB8UqdmZTVA5wvpWVxtlk-Axg&_nc_ohc=SpAnlIzTlnEQ7kNvwF82Stl&_nc_gid=z_0UyfpLyqRUtD5CDc8TUg&edm=ALGbJPMBAAAA&ccb=7-5&oh=00_AfxlgeEtsJ6WQNUa8XXIMrbjqGkas9JUF1juvzu0CHQkRg&oe=69B751AA&_nc_sid=7d3ac5",
  },
  {
    name: "Hokoen",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/0c0a6bc9631df81678b00f98bae03823.png",
  },
  {
    name: "Ippodo Tea",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/c9ceacc9cc9037e60563f4a0ff5719c8.svg",
  },
  {
    name: "Nakamura Tokichi",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/8e2faa476084640f12573fc309d732ac.webp",
  },
];

const storefrontBrandMappings: Record<string, string[]> = {
  "Sazen Tea": [
    "Yamamasa Koyamaen",
    "Marukyu Koyamaen",
    "Kanbayashi Shunsho",
    "Hekisuien",
    "Horii Shichimeien",
    "Hokoen",
  ],
  "Ippodo Tea": ["Ippodo Tea"],
  "Nakamura Tokichi": ["Nakamura Tokichi"],
  "Horii Shichimeien": ["Horii Shichimeien"],
};

interface ListingSeed {
  name: string;
  brandName: string;
  url: string;
  variantId?: string;
  imageUrl?: string;
  description?: string;
}

const sazenListings: ListingSeed[] = [
  // Yamamasa Koyamaen
  {
    name: "Chajyu No Mukashi",
    brandName: "Yamamasa Koyamaen",
    url: "https://www.sazentea.com/en/products/p816-matcha-chajyu-no-mukashi.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/20f3064b788c29bb3449d79a79d1e040.webp",
    description:
      "Top grade matcha tea of Yamamasa Koyamaen.\n\nA uniquely delicious, incredibly mild and pleasant matcha, with a flavour offering a highly intense, yet magically light body. Its creamy, full-bodied aftertaste lingers for an exceptionally long time, particularly when drunk as a thick tea (koicha). When made as a thick tea, you can sense its fresh, tender green flavours together with the aromas of toasted seeds and roasted coffee beans. Use appropriately hot water to achieve the best flavour.",
  },
  {
    name: "Kasuga No Mukashi",
    brandName: "Yamamasa Koyamaen",
    url: "https://www.sazentea.com/en/products/p817-matcha-kasuga-no-mukashi.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/0828498d71dd95d5fc4554c96a01df78.webp",
    description:
      "Premium ceremonial grade matcha from Yamamasa Koyamaen. Koicha grade with rich umami and smooth texture.",
  },
  {
    name: "Kaguraden",
    brandName: "Yamamasa Koyamaen",
    url: "https://www.sazentea.com/en/products/p818-matcha-kaguraden.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/a2b589abe505fd55b0047a844e628ed1.webp",
    description:
      "Koicha (thick tea) grade Uji matcha.\n\nOrigin: Kyoto Prefecture, Japan\n\nWhen made as a thick tea (koicha), its intense creaminess and uniquely delicious mildness are apparent at first; these are then transformed relatively quickly into an explosive, majestic full-bodied sensation which lingers on the palate. It is also extremely enjoyable and uniquely delicious when made as a thin tea (usucha). It is less mild and sweet than the previous tea on our list, Chajyu-no-Mukashi, yet far more so than the next one, Kaguraden.",
  },
  {
    name: "Seiun",
    brandName: "Yamamasa Koyamaen",
    url: "https://www.sazentea.com/en/products/p819-matcha-seiun.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/81fcf7c24d3cc0300040c25dbd348694.webp",
    description:
      "Refined ceremonial matcha with elegant taste profile. Suitable for both koicha and usucha preparation.",
  },
  {
    name: "Tennouzan",
    brandName: "Yamamasa Koyamaen",
    url: "https://www.sazentea.com/en/products/p820-matcha-tennouzan.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/0060adcae0de0075b70a6f3e567df47c.webp",
    description:
      "Koicha (thick tea) grade Uji matcha.\n\nOrigin: Kyoto Prefecture, Japan\n\nAn intense, velvety full-bodied, robust, creamy, sweet koicha tea. Its robust, characteristic and lingering aftertaste reveals toasted seed aromas. It is a lighter, sweeter tea compared to the Tennouzan.",
  },
  {
    name: "Senjin No Mukashi",
    brandName: "Yamamasa Koyamaen",
    url: "https://www.sazentea.com/en/products/p821-matcha-senjin-no-mukashi.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/cd475eae4c9ec44014a2730630403239.webp",
    description: "High-grade ceremonial matcha with intense flavor and beautiful vibrant green color.",
  },
  {
    name: "Shikibu No Mukashi",
    brandName: "Yamamasa Koyamaen",
    url: "https://www.sazentea.com/en/products/p822-matcha-shikibu-no-mukashi.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/70875fd5be38d914d2c38b9e9e1d457a.webp",
    description:
      "Koicha grade Uji matcha. Recommended to make usucha (thin tea) or koicha (thick tea) as well.\n\nOrigin: Kyoto Prefecture, Japan\n\nYamamasa Koyamaen's entry-level koicha tea is a pleasantly full-bodied composition with a mild flavour. When made as a thick tea (koicha), it offers a blend of full-bodied, sweet and slightly astringent notes, whilst its aftertaste boasts intense green flavours as well as hints of toasted seeds and roasted coffee beans.",
  },
  {
    name: "Ogurayama",
    brandName: "Yamamasa Koyamaen",
    url: "https://www.sazentea.com/en/products/p823-matcha-ogurayama.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/8f7d49152986a7d5f29cd7c80e713b0b.webp",
    description: "Fine ceremonial matcha with delicate sweetness and pleasant umami notes.",
  },
  {
    name: "Yomo No Kaori",
    brandName: "Yamamasa Koyamaen",
    url: "https://www.sazentea.com/en/products/p824-matcha-yomo-no-kaori.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/7ed9157d28649786d8d282195896b208.webp",
    description:
      "Ogurayama is an exceptionally tasty, pampering, dreamy matcha tea, mild in character with sweet, creamily full-bodied, delicate flavours. As an usucha tea, it offers a rather pleasant, joyful experience for those seeking a more engaging flavour as well as for those just getting to know matcha tea.",
  },
  {
    name: "Samidori",
    brandName: "Yamamasa Koyamaen",
    url: "https://www.sazentea.com/en/products/p825-matcha-samidori.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/e0ffc99c811fc37f9f26419e49739925.webp",
    description: "Single cultivar matcha made from Samidori tea plants. Exceptional clarity of flavor.",
  },
  {
    name: "Matsukaze",
    brandName: "Yamamasa Koyamaen",
    url: "https://www.sazentea.com/en/products/p826-matcha-matsukaze.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/80b41ebc7b423aa9fe2a46880a800cc1.webp",
    description:
      "Uji matcha tea for making usucha (thin tea).\n\nOrigin: Kyoto Prefecture, Japan\n\nA moderately full-bodied usucha tea rich in fresh, fragrant, green flavours with a mix of slightly astringent, creamy notes and a slightly sweet sensation. Its light aftertaste lingers on the palate and is dominated by creaminess.",
  },
  {
    name: "Shin Matcha Wakaba",
    brandName: "Yamamasa Koyamaen",
    url: "https://www.sazentea.com/en/products/p864-shin-matcha-wakaba.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/7e830f8633394dd4df9b0b3968f07031.webp",
    description: "Fresh spring harvest matcha with vibrant green color and fresh, lively flavor.",
  },
  {
    name: "Reiyou Matcha",
    brandName: "Yamamasa Koyamaen",
    url: "https://www.sazentea.com/en/products/p865-reiyou-matcha.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/84f07a885347b35454242fc7e8b8aef6.webp",
    description: "High-grade ceremonial matcha with excellent balance and long, pleasant aftertaste.",
  },
  {
    name: "Kuchikiri Matcha Tsubo Nishiki",
    brandName: "Yamamasa Koyamaen",
    url: "https://www.sazentea.com/en/products/p866-kuchikiri-matcha-tsubo-nishiki.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/1659d3c865b1f3977f54c962987270c4.webp",
    description:
      "SUMMER EDITION\n\nUji matcha tea for making usucha (thin tea) on ice.\n\nMatcha with a pleasantly refreshing, smooth, creamy flavor recommended to prepare with cold water. When prepared hot, it gives a characteristically tart flavor, but as soon as poured over ice, the flavor is tamed and offers a sweet, delicious, dessert-like experience.",
  },

  // Marukyu Koyamaen
  {
    name: "Tenju",
    brandName: "Marukyu Koyamaen",
    url: "https://www.sazentea.com/en/products/p151-matcha-tenju.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/334d608d9aa529d4bd55e2c143d9848a.webp",
    description:
      "The highest grade matcha from Marukyu Koyamaen. Exceptional umami, sweetness, and depth of flavor for special occasions.",
  },
  {
    name: "Choan",
    brandName: "Marukyu Koyamaen",
    url: "https://www.sazentea.com/en/products/p152-matcha-choan.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/1ee312acb31e205b563b869f1073bfc2.webp",
    description: "Premium ceremonial matcha with rich, full-bodied taste and excellent koicha characteristics.",
  },
  {
    name: "Eiju",
    brandName: "Marukyu Koyamaen",
    url: "https://www.sazentea.com/en/products/p153-matcha-eiju.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/eb5d9f891004bd1d886186f8f0985227.webp",
    description: "High-grade matcha with elegant sweetness and smooth, creamy texture.",
  },
  {
    name: "Unkaku",
    brandName: "Marukyu Koyamaen",
    url: "https://www.sazentea.com/en/products/p154-matcha-unkaku.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/08b4a9cdf8e7d05a765a627545fb5869.webp",
    description: "Refined ceremonial matcha with delicate flavor and beautiful green color.",
  },
  {
    name: "Kinrin",
    brandName: "Marukyu Koyamaen",
    url: "https://www.sazentea.com/en/products/p155-matcha-kinrin.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/611114c62c4d5a9ab34472f6ed90791a.webp",
    description: "Premium matcha with golden ring of foam when whisked. Rich umami and sweet aftertaste.",
  },
  {
    name: "Wako",
    brandName: "Marukyu Koyamaen",
    url: "https://www.sazentea.com/en/products/p156-matcha-wako.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/a698af2bd750023c70ce0c9c19237f37.webp",
    description: "Harmonious blend of sweetness and umami. Excellent for both koicha and usucha.",
  },
  {
    name: "Yugen",
    brandName: "Marukyu Koyamaen",
    url: "https://www.sazentea.com/en/products/p157-matcha-yugen.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/3449e3e7aa9819a7b3a2de86ed3d38d7.webp",
    description: "Mysterious depth of flavor with lingering sweet aftertaste. Premium ceremonial grade.",
  },
  {
    name: "Chigi No Shiro",
    brandName: "Marukyu Koyamaen",
    url: "https://www.sazentea.com/en/products/p158-matcha-chigi-no-shiro.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/221e96d9be63b18420f92eb6dc7013a2.webp",
    description: "Bright, vibrant matcha with fresh taste and pleasant astringency. Great for usucha.",
  },
  {
    name: "Isuzu",
    brandName: "Marukyu Koyamaen",
    url: "https://www.sazentea.com/en/products/p159-matcha-isuzu.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/1f0efc2ff98ff59493ab38ae3f3fa281.webp",
    description: "Well-balanced matcha with good umami and refreshing finish. Excellent daily drinking matcha.",
  },
  {
    name: "Aoarashi",
    brandName: "Marukyu Koyamaen",
    url: "https://www.sazentea.com/en/products/p160-matcha-aoarashi.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/8966eb023f4ee816706d04f0ca2817be.webp",
    description: "Fresh, clean taste with vibrant green color. Perfect for everyday tea ceremony practice.",
  },
  {
    name: "Matcha Haru Kasumi",
    brandName: "Marukyu Koyamaen",
    url: "https://www.sazentea.com/en/products/p262-matcha-haru-kasumi.html",
    imageUrl: "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/3fb4fb2df15b81031d95275c38a517e3.webp",
    description: "Spring mist matcha with delicate, ethereal flavor profile. Limited seasonal offering.",
  },
  {
    name: "Hatsu Enishi Shin Matcha",
    brandName: "Marukyu Koyamaen",
    url: "https://www.sazentea.com/en/products/p286-hatsu-enishi-shin-matcha.html",
    imageUrl: "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/77526bc897714d43c1f9f61fe2dbf8e7.webp",
    description:
      "SPRING COLLECTION\n\nMarukyu Koyamaen limited edition seasonal matcha\n\nHaru Kasumi is a sweet, creamy, fresh and flowery, smooth and light Matcha tea with a lush milky aftertaste. By using less water, we can make a round-bodied, light, and tasty Koicha tea. This tea tolerates varying water temperatures very well; it does not get bitter even at lower temperatures.",
  },
  {
    name: "Matcha Suzukumo",
    brandName: "Marukyu Koyamaen",
    url: "https://www.sazentea.com/en/products/p447-matcha-suzukumo.html",
    imageUrl: "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/9b13326fefd430bf87e9487623b247ae.webp",
    description:
      "Seasonal matcha blend from Marukyu Koyamaen made from carefully cultivated sprouting tea bushes (of an early-maturing cultivar) from a covered tea plantation.\n\nA mellow, light, creamy-textured matcha with an amazingly fresh, bright fragrance and an incredibly long, full-bodied, and creamy finish with tender, green flavors. This tea can be prepared with slightly lower temperature water (70 ºC), resulting in a sweeter and creamier flavor.",
  },
  {
    name: "Matcha Awaraku",
    brandName: "Marukyu Koyamaen",
    url: "https://www.sazentea.com/en/products/p446-matcha-awaraku.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/cb071036d79cfb482e9b5f1d8411eae6.webp",
    description:
      "A special matcha blend from Marukyu-Koyamaen.\n\nThanks to the freeze-drying processing, Suzukumo does not need sifting before consumption. It is suitable for preparing both hot and cold matcha, which makes it a perfect choice for summer.",
  },
  {
    name: "Tsubokiri Matcha",
    brandName: "Marukyu Koyamaen",
    url: "https://www.sazentea.com/en/products/p350-tsubokiri-matcha.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/1da821345654b251bc8bf71b06f656ed.webp",
    description:
      "A special matcha blend from Marukyu-Koyamaen.\n\nThanks to the freeze-drying processing, Awaraku does not need to be sifted before consumption. It is suitable for preparing both hot and cold matcha, which makes it a perfect choice for summer.",
  },

  // Kanbayashi Shunsho
  {
    name: "Koicha Hatsumukashi",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1590-koicha-hatsumukashi.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/e9ec7bd4ec4fbef85e40596e500c0c0f.webp",
    description: `Matcha Hatsumukashi is Kambayashi Shunshō's top grade matcha tea, superb both as usucha and koicha.\n\nAs a koicha, it offers bold, full-bodied flavors with fruity, dark chocolate, and creamy notes, delivering a long-lasting, lingering finish. When prepared as Usucha, it has a smooth texture that gradually deepens and intensifies, revealing a rich sweetness that brings out a strong umami. Among the koicha teas in the lineup, this one has the most intense flavor and fullness—a true gourmet matcha.\n\nUpon opening, it first offers a fresh, tropical fruit aroma, and after drinking, it leaves a lasting feeling of deep satisfaction and joy.`,
  },
  {
    name: "Koicha Atomukashi",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1591-koicha-atomukashi.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/e4cd040d997f3f11e77331f093b57909.webp",
    description: "High-grade koicha matcha with deep, complex flavors and long-lasting aftertaste.",
  },
  {
    name: "Koicha Babamukashi",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1592-koicha-babamukashi.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/0104cb526ffe261bff5c2cb186c9da0a.webp",
    description: "Traditional koicha matcha with rich heritage and exceptional quality.",
  },
  {
    name: "Koicha Hijirimukashi",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1593-koicha-hijirimukashi.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/33635e3a0922cd10a885ec05e830849a.webp",
    description: "Sacred ceremonial matcha for important tea gatherings. Deep umami and sweetness.",
  },
  {
    name: "Koicha Sazumimukashi",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1594-koicha-sazumimukashi.html",
    imageUrl: "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/33635e3a0922cd10a885ec05e830849a.webp",
    description: "Premium koicha with gentle, refined flavor and beautiful green color.",
  },
  {
    name: "Koicha Zuihou",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1595-koicha-zuihou.html",
    imageUrl: "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/33635e3a0922cd10a885ec05e830849a.webp",
    description: "Treasure-class koicha matcha with exceptional depth and lasting sweetness.",
  },
  {
    name: "Koicha Matsukazemukashi",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1596-koicha-matsukazemukashi.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/de3ab27cefa936591c2a0a26a37051f0.webp",
    description: "Pine wind koicha with elegant, refreshing character and smooth finish.",
  },
  {
    name: "Usucha Gokumukashi",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1597-usucha-gokumukashi.html",
    imageUrl: "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/33635e3a0922cd10a885ec05e830849a.webp",
    description: "Extremely high-grade usucha with rich flavor and excellent foam formation.",
  },
  {
    name: "Usucha Konomi No Shiro",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1598-usucha-konomi-no-shiro.html",
    imageUrl: "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/33635e3a0922cd10a885ec05e830849a.webp",
    description: "Beloved white usucha with gentle sweetness and pleasant astringency.",
  },
  {
    name: "Usucha Yuzuriha Mukashi",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1599-usucha-yuzuriha-mukashi.html",
    imageUrl: "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/33635e3a0922cd10a885ec05e830849a.webp",
    description: "Transferring leaf usucha with fresh, vibrant taste and beautiful color.",
  },
  {
    name: "Usucha Biwa No Shiro",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1600-usucha-biwa-no-shiro.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/d9174cd08b584c6ca4df1dfce6a7bce7.webp",
    description: "Loquat white usucha with unique flavor profile and smooth texture.",
  },
  {
    name: "Usucha Mozumukashi",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1601-usucha-mozumukashi.html",
    imageUrl: "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/33635e3a0922cd10a885ec05e830849a.webp",
    description: "Divine usucha with exceptional clarity and refined taste.",
  },
  {
    name: "Usucha Aya No Mori",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1602-usucha-aya-no-mori.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/7a51ae3b0a3196b9a55b979dd5d634e2.webp",
    description: "Colorful forest usucha with complex, layered flavors and fresh finish.",
  },
  {
    name: "Usucha Ryo No Kage",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1603-usucha-ryo-no-kage.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/f2a0baf75898951b5df7a22d39c8b384.webp",
    description: "Cool shadow usucha with refreshing character and pleasant sweetness.",
  },
  {
    name: "Usucha Matsu No Shiro",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1604-usucha-matsu-no-shiro.html",
    imageUrl: "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/33635e3a0922cd10a885ec05e830849a.webp",
    description: "Pine white usucha with sturdy, reliable flavor for daily practice.",
  },
  {
    name: "Usucha Kouko no Shiro",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1615-usucha-kouko-no-shiro.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/e84193d5768db26fe658771e30e91428.webp",
    description: "",
  },
  {
    name: "Koicha Soumei no Mukashi",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1613-koicha-soumei-no-mukashi.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/5de9c352efb03c39fee65327a56859ed.webp",
    description: "",
  },
  {
    name: "Usucha Mikazuki no Shiro",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1609-usucha-mikazuki-no-shiro.html",
    imageUrl: "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/33635e3a0922cd10a885ec05e830849a.webp",
    description: "",
  },
  {
    name: "Koicha Hashidate no Mukashi",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1610-koicha-hashidate-no-mukashi.html",
    imageUrl: "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/33635e3a0922cd10a885ec05e830849a.webp",
    description: "",
  },
  {
    name: "Usucha Momoyo no Mukashi",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1611-usucha-momoyo-no-mukashi.html",
    imageUrl: "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/33635e3a0922cd10a885ec05e830849a.webp",
    description: "",
  },
  {
    name: "Koicha Seitan no Shiro",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1612-koicha-seitan-no-shiro.html",
    imageUrl: "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/33635e3a0922cd10a885ec05e830849a.webp",
    description: "",
  },
  {
    name: "Usucha Sachi no Shiro",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1618-usucha-sachi-no-shiro.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/929bcc80fa3c61135d44ac6f56d11d46.webp",
    description: "",
  },
  {
    name: "Koicha Hatsune no Mukashi",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1619-koicha-hatsune-no-mukashi.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/58a6c96d3bab717bb41bb6046c41c8b2.webp",
    description: "",
  },
  {
    name: "Usucha Goun no Shiro",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1647-usucha-goun-no-shiro.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/b3b817b23da1506bab241d86ea44d718.webp",
    description: "",
  },
  {
    name: "Koicha Kashin no Mukashi",
    brandName: "Kanbayashi Shunsho",
    url: "https://www.sazentea.com/en/products/p1650-koicha-kashin-no-mukashi.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/f04bdf794191b0012614664059d7e9b4.webp",
    description: "",
  },

  // Hekisuien
  {
    name: "Hatsumukashi",
    brandName: "Hekisuien",
    url: "https://www.sazentea.com/en/products/p200-matcha-hatsumukashi.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/f1296057750ef861983c8cc7eb85b75d.webp",
    description: "First ancient matcha from Hekisuien. Rich, traditional flavor with deep umami.",
  },
  {
    name: "Chiyo No Sakae",
    brandName: "Hekisuien",
    url: "https://www.sazentea.com/en/products/p248-matcha-chiyo-no-sakae.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/35ad0cc8be036f8bf9f754bf4275da5e.webp",
    description:
      "Hatsumukashi is a refreshingly bright usucha tea with a pleasant tart flavor. It represents the entry level of quality matcha teas, purposefully lower in terms of full-bodied, characteristic sweet flavors. This makes a great milder tea benefitting from lower temperature water.",
  },
  {
    name: "Kin No Uzu",
    brandName: "Hekisuien",
    url: "https://www.sazentea.com/en/products/p199-matcha-kin-no-uzu.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/47d4e1028f54bb1138a2ade264dd63df.webp",
    description:
      'Entry grade matcha for making usucha (thin tea), also perfect for culinary use, especially for making delicious soft drinks such as matcha latte.\n\nHekisuien, an old tea shop and a proud bastion of Uji-cha tea, has garnered quite the pedigree since being established in 1867. "Matcha Chiyo no Sakae" is the most moderately-priced tea for use during tea ceremonies.',
  },
  {
    name: "Daigyoku",
    brandName: "Hekisuien",
    url: "https://www.sazentea.com/en/products/p197-matcha-daigyoku.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/33899db419d1105b313eafc872c2c799.webp",
    description:
      "Kin no Uzu is a pleasantly mild, creamy, tea composition, delightful for curious newcomers to tea as an art. Its flavor features bitter and tart notes in the background; and while these don't stand out fully, they are embedded in the harmonious whole.",
  },
  {
    name: "Houju",
    brandName: "Hekisuien",
    url: "https://www.sazentea.com/en/products/p191-matcha-houju.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/7630aa1df3108950cfc87796eeacfdff.webp",
    description:
      "We recommend this tea to all visitors who are seeking a Matcha with a pleasant aroma on those regular weekdays, or for those who are just starting to get immersed in the ritualistically traditional world of Matcha. Its scent is reminiscent of vanilla notes and a field of flowers, while its flavors include creamy sweetness, with fresh and tart notes.",
  },
  {
    name: "Hekisui",
    brandName: "Hekisuien",
    url: "https://www.sazentea.com/en/products/p192-matcha-hekisui.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/1f39a76686e8d3cea17bdb8564935f70.webp",
    description:
      "With its intensely sweet and full-bodied flavor, floral scent and mild and light nature, the Houju is sure to make you soar. Its breadth of finish elevates it above teas of lower body and makes it the crown of the entire Hekisuien matcha selection.",
  },
  {
    name: "Ukitsu",
    brandName: "Hekisuien",
    url: "https://www.sazentea.com/en/products/p193-matcha-ukitsu.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/fdec1a9cd018b1f5a7791d343e4dade5.webp",
    description:
      "Hekisui is a surprisingly full and sweet matcha, which should be brewed thickly, with as little water as possible. Its characteristic sweetness, velvety full-bodied flavor and bright aroma elevate it above lower grade teas and sets this incredibly delicious tea apart.",
  },
  {
    name: "Shien",
    brandName: "Hekisuien",
    url: "https://www.sazentea.com/en/products/p194-matcha-shien.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/5dd9197b69b776baf0e69e123d316808.webp",
    description:
      "Our gourmet Ukitsu is a creamy, full-bodied tea, with a light caress. It has a definitely sweeter character than the Shien tea next in line, whilst its full-bodied nature yields a breezier and lighter tea. It is best brewed as a koicha, yet when prepared as an usucha, it produces an incredibly delicious and all-round comforting tea as well.",
  },
  {
    name: "Tenko",
    brandName: "Hekisuien",
    url: "https://www.sazentea.com/en/products/p195-matcha-tenko.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/6d4b6541e57d27e6cd65a5260f0da418.webp",
    description:
      "Shien offers an extraordinarily full, yet velvety, pampering concentrated essence of flavors. Its crystal-clear fullness, long-lasting creamy and slightly sweet, pronounced flavor with a long finish lingers in the mouth long after tasting.",
  },
  {
    name: "Shiro No Kotobuki",
    brandName: "Hekisuien",
    url: "https://www.sazentea.com/en/products/p196-matcha-shiro-no-kotobuki.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/7667e8eceeb72ce4bc49e290a4e184a8.webp",
    description:
      "Tenko almost envelops the person fortunate enough to taste it, with sweetness and gentle yet pronounced mildness. It is a great tea which can be prepared both as a usucha and a koicha. Compared to the Shiro no Kotobuki, it is a less sweet, yet more full-bodied matcha which offers a divine taste and creamy, lingering finish.",
  },
  {
    name: "Matsu No Midori",
    brandName: "Hekisuien",
    url: "https://www.sazentea.com/en/products/p198-matcha-matsu-no-midori.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/b41bf2e410b004afd50ed21bcb1b23ae.webp",
    description:
      "Shiro no Kotobuki is a mild, particularly sweet and creamy tea, which can be prepared both as a usucha (thin tea) and koicha (thick tea). As usucha, the umami comes out stronger, while as koicha more characteristic, astringent flavours are dominant.",
  },

  // Horii Shichimeien
  {
    name: "Narino",
    brandName: "Horii Shichimeien",
    url: "https://www.sazentea.com/en/products/p330-matcha-narino.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/fb8e5248ac7a22f62e67b9a26902751a.jpg",
    description:
      'This is a recommended matcha that represents our garden.\n\nIt is a single origin of the new variety "Narino" born from the "Okunoyama" tea garden that has continued since the Muromachi period.\n\nThis variety is characterized by its strong sweetness, and it has been proven that it contains nearly twice as much theanine, the source of umami, as other matcha varieties. It has such a strong umami flavor that it is said to be delicious to drink on its own without sweets, and it has a full-bodied aroma and rich flavor that is hard to find in other varieties. Please enjoy the matcha that can only be tasted at our farm.',
  },
  {
    name: "Mumon",
    brandName: "Horii Shichimeien",
    url: "https://www.sazentea.com/en/products/p331-matcha-mumon.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/71b8d6a45c0710721fb39b6bbcfb5d53.jpg",
    description:
      'This is a single-origin cultivar "Asahi" cultivated in both the "Okunoyama" and "Togawa" tea gardens, which are cultivated and managed by our garden, and processed, processed, and ground matcha.\n\nThe "Asahi" variety is said to be the best of matcha, with excellent taste and aroma, and ranks highly at tea competitions every year. The "Asahi" variety we grow at our farm is named "Mumon" and has been well-received. Please enjoy its well-balanced flavor.',
  },
  {
    name: "Agata no Shiro",
    brandName: "Horii Shichimeien",
    url: "https://www.sazentea.com/en/products/p336-matcha-agata-no-shiro.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/868282758ee8105af6f5fca93e83a4ba.jpg",
    description:
      "The ingredients are hand-picked young buds and high-quality tencha selected from the tencha-producing areas of Kyoto Prefecture. This matcha is characterized by a moderate astringency and a mellow flavor that spreads deep within. We recommend drinking it as a thin tea.",
  },
  {
    name: "Uji Mukashi",
    brandName: "Horii Shichimeien",
    url: "https://www.sazentea.com/en/products/p337-matcha-uji-mukashi.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/50314222d3a9b654a925d329f8191edc.jpg",
    description:
      "The owner of the garden carefully selects high-quality tencha from the tencha-producing areas in Kyoto Prefecture. This matcha has the aroma and flavor of freshly ground tea and is easy to drink. It is often used as a thin tea at tea ceremonies. It tastes even better when drunk with sweets.\n\nIt is also recommended for use in making sweets.",
  },

  // Hokoen
  {
    name: "Shoukaku",
    brandName: "Hokoen",
    url: "https://www.sazentea.com/en/products/p201-matcha-shoukaku.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/097d871b53c953830ade3880a9f30799.webp",
    description: "Soaring crane matcha from Hokoen with uplifting, excellent flavor.",
  },
  {
    name: "Ryokuhou",
    brandName: "Hokoen",
    url: "https://www.sazentea.com/en/products/p202-matcha-ryokuhou.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/1d6067507a9e557b1285e737b93fc5d7.webp",
    description: "Green treasure matcha with rich, valuable character and deep flavor.",
  },
  {
    name: "Senju",
    brandName: "Hokoen",
    url: "https://www.sazentea.com/en/products/p203-matcha-senju.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/11dea7eb18a2ba34dab964700d921896.webp",
    description: "Thousand lives matcha with enduring, long-lasting flavor and quality.",
  },
  {
    name: "Houki",
    brandName: "Hokoen",
    url: "https://www.sazentea.com/en/products/p204-matcha-houki.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/529a96841e1c6c2a91077864782bce67.webp",
    description: "Treasure vessel matcha with precious, exceptional taste and aroma.",
  },
  {
    name: "Koun",
    brandName: "Hokoen",
    url: "https://www.sazentea.com/en/products/p205-matcha-koun.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/91c565bfc8df98fac7193b66169ee6ec.webp",
    description: "Fragrant cloud matcha with aromatic, heavenly flavor profile.",
  },
  {
    name: "Myouju",
    brandName: "Hokoen",
    url: "https://www.sazentea.com/en/products/p206-matcha-myouju.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/ca91417fe913886544aa49f21940b167.webp",
    description: "Bright jewel matcha with luminous, exceptional quality and taste.",
  },
  {
    name: "Koushu",
    brandName: "Hokoen",
    url: "https://www.sazentea.com/en/products/p207-matcha-koushu.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/6f2a106f4b6e072d41fddce202793e3b.webp",
    description: "Fragrant autumn matcha with rich, harvest-time flavor and warmth.",
  },
  {
    name: "Eiraku",
    brandName: "Hokoen",
    url: "https://www.sazentea.com/en/products/p208-matcha-eiraku.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/3c3eb388726005e214ac0f7dde5e5adf.webp",
    description: "Eternal comfort matcha with lasting, reassuring flavor and quality.",
  },
  {
    name: "Jurei",
    brandName: "Hokoen",
    url: "https://www.sazentea.com/en/products/p209-matcha-jurei.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/ed05ad2084ff8b2d605fcb70df405342.webp",
    description: "Long life matcha with enduring, healthful character and rich taste.",
  },
  {
    name: "Unryu",
    brandName: "Hokoen",
    url: "https://www.sazentea.com/en/products/p828-matcha-unryu.html",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/61e14ab9e2efac9eec87d7234a01ee9a.webp",
    description: "Cloud dragon matcha with powerful, soaring flavor and exceptional depth.",
  },
];

const ippodoListings: ListingSeed[] = [
  {
    name: "Nodoka Special Spring Matcha 20g Box",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha399081",
    variantId: "40615356170391",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/08041a584357c4c458d68d61f4e3550c.png",
    description:
      "Mild and serene, like a warm, sunny place in beautiful spring. Great for a calming tea break. With a good balance of umami and sharpness, it goes well with both Japanese and Western sweets.",
  },
  {
    name: "New Harvest Matcha 20g Can",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha146024",
    variantId: "43145234186391",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/2881fa25868b93e68f4b57a12d3d8166.png",
    description:
      "Fresh, young flavor with vivid color and fragrance. Limited spring release featuring the first harvest of the year.",
  },
  {
    name: "Kanza 20g Can",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha387424",
    variantId: "42232743526551",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/96cbbf685357b37843db2e73a0ca3db6.png",
    description:
      "Rich and satisfying, with a deep umami flavor and almost no bitterness. Exceptional koicha-grade matcha for special occasions.",
  },
  {
    name: "Kuon 20g Can",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha306024",
    variantId: "42974684512407",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/b93e453a0afd2609a3655109ba6f60eb.png",
    description:
      "Profound depth with intense umami and a sweet, lingering aftertaste. One of the highest grades of matcha from Ippodo.",
  },
  {
    name: "Ummon-no-mukashi 20g Can",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha101024",
    variantId: "40615348994199",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/58b4a817bfc065d538e20aee3ee64b54.png",
    description:
      "Rich and full-bodied with a perfect balance of umami and sweetness. Excellent for koicha and special tea gatherings.",
  },
  {
    name: "Ummon-no-mukashi 40g Can",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha101044",
    variantId: "40615347028119",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/3d01bfc096276c99979662b2fff78465.png",
    description:
      "Rich and full-bodied with perfect balance of umami and sweetness. Larger size for regular enjoyment of this exceptional matcha.",
  },
  {
    name: "Seiun 40g Can",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha102044",
    variantId: "40615348371607",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/31ea5d984f9a3b9647926e61e692cae9.png",
    description:
      "Blue clouds matcha with mellow, approachable flavor. Good balance of umami and astringency for daily drinking.",
  },
  {
    name: "Sayaka-no-mukashi 40g Can",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha103644",
    variantId: "40615350665367",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/08a8402f9fae7b909007178319eee9fd.png",
    description:
      "Bright and clear with refreshing taste and pleasant sharpness. Excellent for usucha and everyday tea ceremony practice.",
  },
  {
    name: "Sayaka-no-mukashi 100g Bag",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha173512",
    variantId: "40729506955415",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/f9cad4652d6fbe49c8aca57cc021d146.png",
    description:
      "Bright and clear with refreshing taste. Large bag size ideal for those who drink matcha regularly or use it for cooking.",
  },
  {
    name: "Kan-no-shiro 30g Box",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha104033",
    variantId: "40615355023639",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/23f43916c0b81456e5df3d6b783d6150.png",
    description: "Sweet and mellow with gentle umami and light astringency. Perfect entry-level ceremonial matcha.",
  },
  {
    name: "Ikuyo-no-mukashi 30g Box",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha105033",
    variantId: "40615355973911",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/09299db8efd4180bb04c3c907a8a453f.png",
    description: "Soft and mild with subtle sweetness and smooth texture. Easy to drink for matcha beginners.",
  },
  {
    name: "Ikuyo-no-mukashi 100g Bag",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha175512",
    variantId: "40729507086487",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/738fe9428244c61b0c1efff1b32a4ce3.png",
    description: "Soft and mild with subtle sweetness. Large bag size perfect for regular consumption or culinary use.",
  },
  {
    name: "Wakaki-shiro 40g Box",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha108643",
    variantId: "40615358694423",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/65337f2d1e76e5d05b59f99e9c50b912.png",
    description:
      "Young white matcha with fresh, vibrant flavor and pleasant lightness. Good for both usucha and matcha lattes.",
  },
  {
    name: "Hatsu-mukashi 40g Box",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha109643",
    variantId: "40615360268439",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/561126b5f1e89ce0654599d699ea8140.png",
    description: "First ancient matcha with traditional, time-honored flavor. Good balance of umami and astringency.",
  },
  {
    name: "Matcha To-Go Packets (2g x 10 packets)",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha125510",
    variantId: "40729508528279",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/675ecf79a1ba39a911f1ecfbcafeeee7.png",
    description: "Convenient single-serve packets perfect for travel, office, or on-the-go matcha enjoyment.",
  },
  {
    name: "Organic Matcha 20g Can",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha148624",
    variantId: "42768905355415",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/ff0706355dc213ce42c1a8a8189fc6a2.png",
    description: "Certified organic matcha with clean, pure taste. Grown without pesticides or chemical fertilizers.",
  },
  {
    name: "Fumi-no-tomo 100g Bag",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha111102",
    variantId: "40729508823191",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/5678fc7fb79e71c8e26caed1977a3bcb.png",
    description: "Literary friend matcha with balanced flavor suitable for daily drinking and culinary applications.",
  },
  {
    name: "Uji-Shimizu 400g Bag",
    brandName: "Ippodo Tea",
    url: "https://global.ippodo-tea.co.jp/collections/matcha/products/matcha642402",
    variantId: "40729508888727",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/7eb2370fafab68b17df3bafa91bd98d0.png",
    description: "Sweetened matcha powder with sugar already blended in. Perfect for easy matcha lattes and desserts.",
  },
];

const nakamuraListings: ListingSeed[] = [
  {
    name: "Matcha Starter 100g Bag",
    brandName: "Nakamura Tokichi",
    url: "https://global.tokichi.jp/products/m100-str",
    variantId: "47148766298364",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/9f2f152429e3db5a5e5d8ef16fab0954.jpg",
    description:
      "Start your matcha journey, freely and effortlessly. Crafted exclusively from Kyoto-grown first flush tea leaves, this matcha delivers a smooth umami and gentle sweetness.",
  },
  {
    name: "Matcha Standard 100g Bag",
    brandName: "Nakamura Tokichi",
    url: "https://global.tokichi.jp/products/m100-std",
    variantId: "47148766331132",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/2b40e12b6e1260860220460abbd5abac.jpg",
    description: "Standard grade matcha for everyday enjoyment. Smooth taste with good umami and pleasant finish.",
  },
  {
    name: "Fuji-no-Shiro Can 30g",
    brandName: "Nakamura Tokichi",
    url: "https://global.tokichi.jp/products/mc2",
    variantId: "44231891747068",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/1e05b3eb4ca6e8e6d7d9143f962b229d.jpg",
    description: "Wisteria white matcha in traditional can. Elegant flavor with smooth texture and sweet aftertaste.",
  },
  {
    name: "Hatsu-Mukashi 30g Can",
    brandName: "Nakamura Tokichi",
    url: "https://global.tokichi.jp/products/mc12",
    variantId: "44231891714300",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/1b29a7975ee4fb6031c0fbb91437dc7d.jpg",
    description: "First ancient matcha with traditional, time-honored flavor. Rich umami with sweet aftertaste.",
  },
  {
    name: "Ato-Mukashi 30g Can",
    brandName: "Nakamura Tokichi",
    url: "https://global.tokichi.jp/products/mc11",
    variantId: "44231891681532",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/5205936ec7c94b96863e9758a81da0ef.jpg",
    description: "Later ancient matcha with mature, developed flavor. Good balance of umami and astringency.",
  },
  {
    name: "Uji-no-Mukashi 30g Can",
    brandName: "Nakamura Tokichi",
    url: "https://global.tokichi.jp/products/mc10",
    variantId: "44231891648764",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/8bc90c04dc5fe230daff669c9da4869e.jpg",
    description: "Ancient Uji matcha with traditional flavor profile from the historic tea-growing region.",
  },
  {
    name: "Hatsu-no-Mukashi 30g Can",
    brandName: "Nakamura Tokichi",
    url: "https://global.tokichi.jp/products/mc7",
    variantId: "44231891583244",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/3023473089234b9a9ccd772c4eca05ff.jpg",
    description: "First of the ancient matcha with fresh, vibrant character and rich taste.",
  },
  {
    name: "Seiko-no-Mukashi 30g Can",
    brandName: "Nakamura Tokichi",
    url: "https://global.tokichi.jp/products/mc9",
    variantId: "44231891615996",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/7a244ffad6d31e847c50ec610035181c.jpg",
    description: "Clear light ancient matcha with bright, clear flavor and refreshing finish.",
  },
  {
    name: "Jingai-no-Mukashi 30g Can",
    brandName: "Nakamura Tokichi",
    url: "https://global.tokichi.jp/products/mc8",
    variantId: "44231891550476",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/d27eb2450b1667c9ed2745d65e9be1e9.jpg",
    description: "Outer garden ancient matcha with unique, distinctive flavor profile.",
  },
  {
    name: "Asagiri-no-mukashi Can 30g",
    brandName: "Nakamura Tokichi",
    url: "https://global.tokichi.jp/products/mc20",
    variantId: "44231891946412",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/65a2776b8ffd395710cbb5e2df80c2d8.jpg",
    description: "Morning mist ancient matcha with ethereal, delicate flavor and beautiful color.",
  },
  {
    name: "Sho-no-mukashi Can 30g",
    brandName: "Nakamura Tokichi",
    url: "https://global.tokichi.jp/products/mc6",
    variantId: "44231891517708",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/2253d4880e38b11f27a9886351fc2bf9.jpg",
    description: "Pine ancient matcha with sturdy, reliable flavor for daily tea ceremony practice.",
  },
  {
    name: "Senun-no-Shiro Can 30g",
    brandName: "Nakamura Tokichi",
    url: "https://global.tokichi.jp/products/mc3",
    variantId: "44231891779836",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/67d0f90e57a7bda6532bc97ba7bc7edf.jpg",
    description: "Thousand clouds white matcha with light, airy texture and gentle sweetness.",
  },
  {
    name: "Hiroha-no-Shiro Can 30g",
    brandName: "Nakamura Tokichi",
    url: "https://global.tokichi.jp/products/mc4",
    variantId: "44231891812604",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/4af63bed2b59ce50ff6b3e27f58006a6.jpg",
    description: "Wide leaf white matcha with expansive, full-bodied flavor and rich umami.",
  },
  {
    name: "Seikan-no-Shiro Can 30g",
    brandName: "Nakamura Tokichi",
    url: "https://global.tokichi.jp/products/mc5",
    variantId: "44231891845372",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/0ed491b27eb04c4f14abe15155c4a84e.jpg",
    description: "Clear cold white matcha with crisp, refreshing taste and clean finish.",
  },
  {
    name: "Yukawa-no-Shiro Can 30g",
    brandName: "Nakamura Tokichi",
    url: "https://global.tokichi.jp/products/mc21",
    variantId: "44231891979180",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/27807fb63da0676d588bd70d08c235ac.jpg",
    description: "Evening river white matcha with smooth, flowing flavor and gentle character.",
  },
  {
    name: "Ukishima-no-Shiro Can 30g",
    brandName: "Nakamura Tokichi",
    url: "https://global.tokichi.jp/products/mc1",
    variantId: "44231891634508",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/e12ed41767ab1e0e8e29383e648ef6f8.jpg",
    description: "Floating island white matcha with light, buoyant texture and pleasant taste.",
  },
];

const horiiListings: ListingSeed[] = [
  {
    name: "Premium Narino",
    brandName: "Horii Shichimeien",
    url: "https://horiishichimeien.com/en/products/matcha-premiumnarino",
    variantId: "40895584501897",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/d4b44ab1fb2b9eb32c65eb167fa85384.jpg",
    description:
      'This is a matcha made from tencha that has been carefully finished and ground in order to exhibit the new variety "Narino", which was born from the "Okunoyama" tea garden that has continued since the Muromachi period, at the National Tea Competition. (single origin)\n\nThe tea leaves are picked with a method called "shigoki picking", which is said to be more careful than hand-picking, paying close attention from the tea picking, and the final tencha produced is sorted with chopsticks and finished with only beautiful leaves. Because the selected tencha is ground with a stone mill, it is characterized by a richer, creamier flavor with less off-flavours and more condensed umami than regular Narino.',
  },
  {
    name: "Narino",
    brandName: "Horii Shichimeien",
    url: "https://horiishichimeien.com/en/products/matcha-narino",
    variantId: "40895584600201",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/75759212f786a1e00b3bfb601d7056b4.jpg",
    description:
      'This is a recommended matcha that represents our garden.\n\nIt is a single origin of the new variety "Narino" born from the "Okunoyama" tea garden that has continued since the Muromachi period.\n\nThis variety is characterized by its strong sweetness, and it has been proven that it contains nearly twice as much theanine, the source of umami, as other matcha varieties. It has such a strong umami flavor that it is said to be delicious to drink on its own without sweets, and it has a full-bodied aroma and rich flavor that is hard to find in other varieties. Please enjoy the matcha that can only be tasted at our farm.',
  },
  {
    name: "Okunoyama",
    brandName: "Horii Shichimeien",
    url: "https://horiishichimeien.com/en/products/matcha-okunoyama",
    variantId: "40895584829577",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/f8f73187aa982d3190daa9d5cc75b90f.jpg",
    description:
      'It is a single origin of the new variety "Okunoyama" born from the "Okunoyama" tea garden that has continued since the Muromachi period.\n\nIt is said to be a variety suitable for gyokuro, but it is also cultivated for tencha, as its deep green color produces an excellent color when ground into matcha. It is characterized by its clean, easy-to-drink flavor with no strong taste.',
  },
  {
    name: "Mumon",
    brandName: "Horii Shichimeien",
    url: "https://horiishichimeien.com/en/products/matcha-mumon",
    variantId: "40895584731273",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/ceb0d104cbf04ee43de217b816e69207.jpg",
    description:
      'This is a single-origin cultivar "Asahi" cultivated in both the "Okunoyama" and "Togawa" tea gardens, which are cultivated and managed by our garden, and processed, processed, and ground matcha.\n\nThe "Asahi" variety is said to be the best of matcha, with excellent taste and aroma, and ranks highly at tea competitions every year. The "Asahi" variety we grow at our farm is named "Mumon" and has been well-received. Please enjoy its well-balanced flavor.',
  },
  {
    name: "Choukou no Mukashi",
    brandName: "Horii Shichimeien",
    url: "https://horiishichimeien.com/en/products/matcha-choukounomukashi",
    variantId: "40895584927881",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/b33a590d3496d93c8399d7f058511a2c.jpg",
    description:
      "Focusing on hand-picked high-grade tea leaves that won awards at fairs, we blend well-balanced tea leaves that have a good aroma and strong umami. It is characterized by its mellow taste and umami. Please enjoy the well-balanced taste, richness, and umami unique to blended tea leaves that are different from single-origin products.",
  },
  {
    name: "Homare no Mukashi",
    brandName: "Horii Shichimeien",
    url: "https://horiishichimeien.com/en/products/matcha-homarenomukashi",
    variantId: "40895585026185",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/b5e89534d713bb78ff9b6044f69cd6ff.jpg",
    description:
      "We use hand-picked, high-quality tea leaves that have won awards at tea tasting competitions, and blend them in a well-balanced way to create a well-balanced flavor. This is a flavorful matcha that is mellow, fragrant, and full of umami. You can use it as either a light or thick tea.",
  },
  {
    name: "Shichimei no Mukashi",
    brandName: "Horii Shichimeien",
    url: "https://horiishichimeien.com/en/products/matcha-shichimeinomukashi",
    variantId: "40895585124489",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/21ef26a264dfcda2a623483de4cb7103.jpg",
    description:
      "A blend of hand-picked tea leaves. A mild, strong-flavored matcha. Recommended for those looking for a mild flavor. Can be used as either thin or thick tea.",
  },
  {
    name: "Todou Mukashi",
    brandName: "Horii Shichimeien",
    url: "https://horiishichimeien.com/en/products/matcha-todounomukashi",
    variantId: "40895585222793",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/44a28d6b67dd481257eeb5fad4f07b3a.jpg",
    description:
      'A blend of hand-picked tea leaves, mainly from the Kyoto variety "Samidori." This matcha has a strong flavor and is almost completely bitter. Recommended for those who drink matcha regularly and want to try something a little better.',
  },
  {
    name: "Agata no Shiro",
    brandName: "Horii Shichimeien",
    url: "https://horiishichimeien.com/en/products/matcha-agatanoshiro",
    variantId: "40895585321097",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/3c194061b9cb3c38ee162b5a3ab57bd6.jpg",
    description:
      "The ingredients are hand-picked young buds and high-quality tencha selected from the tencha-producing areas of Kyoto Prefecture. This matcha is characterized by a moderate astringency and a mellow flavor that spreads deep within. We recommend drinking it as a thin tea.",
  },
  {
    name: "Uji Mukashi",
    brandName: "Horii Shichimeien",
    url: "https://horiishichimeien.com/en/products/matcha-ujimukashi",
    variantId: "40895585419401",
    imageUrl:
      "https://botblmieabawvfaendyo.supabase.co/storage/v1/object/public/images/3bff70d8c484d14b5f7e8fb591eed2e8.jpg",
    description:
      "The owner of the garden carefully selects high-quality tencha from the tencha-producing areas in Kyoto Prefecture. This matcha has the aroma and flavor of freshly ground tea and is easy to drink. It is often used as a thin tea at tea ceremonies. It tastes even better when drunk with sweets.\n\nIt is also recommended for use in making sweets.",
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  const db = getDb();

  // Clear existing data in reverse dependency order
  await db.delete(stockHistory);
  await db.delete(listings);
  await db.delete(matchas);
  await db.delete(storefronts);
  await db.delete(brands);

  // Create storefronts
  const storefrontMap = new Map<string, string>();
  for (const sf of storefrontsData) {
    const id = crypto.randomUUID();
    await db.insert(storefronts).values({
      id,
      name: sf.name,
      url: sf.url,
    });
    storefrontMap.set(sf.name, id);
    console.log(`✅ Created storefront: ${sf.name}`);
  }

  // Create brands
  const brandMap = new Map<string, string>();
  for (const b of brandsData) {
    const id = crypto.randomUUID();
    await db.insert(brands).values({
      id,
      name: b.name,
      imageUrl: b.imageUrl,
    });
    brandMap.set(b.name, id);
    console.log(`✅ Created brand: ${b.name}`);
  }

  // Connect brands to storefronts based on mapping
  for (const [storefrontName, brandNames] of Object.entries(storefrontBrandMappings)) {
    const storefrontId = storefrontMap.get(storefrontName);
    if (!storefrontId) {
      console.warn(`⚠️ Warning: Storefront not found: ${storefrontName}`);
      continue;
    }

    for (const brandName of brandNames) {
      const brandId = brandMap.get(brandName);
      if (!brandId) {
        console.warn(`⚠️ Warning: Brand not found: ${brandName}`);
        continue;
      }

      await db.insert(storefrontsBrands).values({
        storefrontId,
        brandId,
      });
    }
    console.log(`✅ Connected ${brandNames.length} brands to ${storefrontName}`);
  }

  // Create listings for each storefront
  async function createListings(listingsData: ListingSeed[], storefrontId: string): Promise<number> {
    let count = 0;

    for (const listing of listingsData) {
      const brandId = brandMap.get(listing.brandName);
      if (!brandId) {
        console.warn(`⚠️ Warning: Brand not found: ${listing.brandName}`);
        continue;
      }

      // Check if matcha already exists for this brand/name combination
      const existingMatcha = await db.query.matchas.findFirst({
        where: and(eq(matchas.brandId, brandId), eq(matchas.name, listing.name)),
      });

      let matchaId: string;
      if (existingMatcha) {
        matchaId = existingMatcha.id;
      } else {
        matchaId = crypto.randomUUID();
        await db.insert(matchas).values({
          id: matchaId,
          name: listing.name,
          brandId,
          imageUrl: listing.imageUrl,
          description: listing.description,
        });
      }

      // Create the listing
      await db.insert(listings).values({
        id: crypto.randomUUID(),
        matchaId,
        storefrontId,
        url: listing.url,
        variantId: listing.variantId || null,
      });
      count++;
    }

    return count;
  }

  const sazenCount = await createListings(sazenListings, storefrontMap.get("Sazen Tea")!);
  console.log(`✅ Created ${sazenCount} listings for Sazen Tea`);

  const ippodoCount = await createListings(ippodoListings, storefrontMap.get("Ippodo Tea")!);
  console.log(`✅ Created ${ippodoCount} listings for Ippodo Tea`);

  const nakamuraCount = await createListings(nakamuraListings, storefrontMap.get("Nakamura Tokichi")!);
  console.log(`✅ Created ${nakamuraCount} listings for Nakamura Tokichi`);

  const horiiCount = await createListings(horiiListings, storefrontMap.get("Horii Shichimeien")!);
  console.log(`✅ Created ${horiiCount} listings for Horii Shichimeien`);

  const totalListings = sazenCount + ippodoCount + nakamuraCount + horiiCount;

  // Get counts for summary
  const matchaCount = await db.query.matchas.findMany();

  console.log("\n📊 Summary:");
  console.log(`  • Storefronts: ${storefrontsData.length}`);
  console.log(`  • Brands: ${brandsData.length}`);
  console.log(`  • Matcha: ${matchaCount.length}`);
  console.log(`  • Total Listings: ${totalListings}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
