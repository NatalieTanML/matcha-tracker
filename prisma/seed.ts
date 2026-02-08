import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

const storefronts = [
  { name: 'Sazen Tea', url: 'https://www.sazentea.com' },
  { name: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp' },
  { name: 'Nakamura Tokichi', url: 'https://global.tokichi.jp' },
  { name: 'Horii Shichimeien', url: 'https://horiishichimeien.com/en/' },
]

const brands = [
  { name: 'Yamamasa Koyamaen', imageUrl: 'https://www.yamamasa-koyamaen.co.jp/assets/images/common/ci.svg', },
  { name: 'Marukyu Koyamaen', imageUrl: 'https://www.marukyu-koyamaen.co.jp/english/shop/wp-content/themes/motoan-shop-en/images/logo.svg' },
  { name: 'Kanbayashi Shunsho', imageUrl: 'https://shop.shunsho.co.jp/Contents/ImagesPkg/index_page/header_logo_shunsho.svg' },
  { name: 'Hekisuien', imageUrl: 'https://ujicha.online/html/template/default/assets/img/common/logo_3.jpg' },
  { name: 'Horii Shichimeien', imageUrl: 'https://instagram.fsin4-1.fna.fbcdn.net/v/t51.2885-19/312694423_3336877573226156_7481346773365740316_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fsin4-1.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QHXck10ZqMoUlOg4DPGqa9SBec1peOcQvEjcmns306k-Ter7hv3AqJNihCOaF1uxUM&_nc_ohc=boKWJufRkU4Q7kNvwFZSeLp&_nc_gid=W40F-naUqyvLTqy_f3INqQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_Afuf_npQFhUcnSRn96kqF4Pbgd2L-HXi-GT8Tj47_XJT3Q&oe=698B97EA&_nc_sid=7a9f4b' },
  { name: 'Hokoen', imageUrl: 'https://i.ibb.co/1Yh6Vn4f/logo.png' },
  { name: 'Ippodo Tea', imageUrl: 'https://www.ippodo-tea.co.jp/cdn/shop/t/9/assets/logo_ippodo-jp.svg' },
  { name: 'Nakamura Tokichi', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/maruto_ico_g.webp' },
]

const storefrontBrandMappings: Record<string, string[]> = {
  'Sazen Tea': ['Yamamasa Koyamaen', 'Marukyu Koyamaen', 'Kanbayashi Shunsho', 'Hekisuien', 'Horii Shichimeien', 'Hokoen'],
  'Ippodo Tea': ['Ippodo Tea'],
  'Nakamura Tokichi': ['Nakamura Tokichi'],
  'Horii Shichimeien': ['Horii Shichimeien'],
}

interface ListingSeed {
  name: string
  brandName: string
  url: string
  variantId?: string
  imageUrl?: string
  description?: string
}

const sazenListings: ListingSeed[] = [
  // Yamamasa Koyamaen
  { name: 'Chajyu No Mukashi', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p816-matcha-chajyu-no-mukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MYK001-1.jpg', description: 'Top grade matcha tea of Yamamasa Koyamaen.\n\nA uniquely delicious, incredibly mild and pleasant matcha, with a flavour offering a highly intense, yet magically light body. Its creamy, full-bodied aftertaste lingers for an exceptionally long time, particularly when drunk as a thick tea (koicha). When made as a thick tea, you can sense its fresh, tender green flavours together with the aromas of toasted seeds and roasted coffee beans. Use appropriately hot water to achieve the best flavour.' },
  { name: 'Kasuga No Mukashi', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p817-matcha-kasuga-no-mukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MYK002-1.jpg', description: 'Premium ceremonial grade matcha from Yamamasa Koyamaen. Koicha grade with rich umami and smooth texture.' },
  { name: 'Kaguraden', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p818-matcha-kaguraden.html', imageUrl: 'https://www.sazentea.com/content/products/445/MYK003-1.jpg', description: 'Koicha (thick tea) grade Uji matcha.\n\nOrigin: Kyoto Prefecture, Japan\n\nWhen made as a thick tea (koicha), its intense creaminess and uniquely delicious mildness are apparent at first; these are then transformed relatively quickly into an explosive, majestic full-bodied sensation which lingers on the palate. It is also extremely enjoyable and uniquely delicious when made as a thin tea (usucha). It is less mild and sweet than the previous tea on our list, Chajyu-no-Mukashi, yet far more so than the next one, Kaguraden.' },
  { name: 'Seiun', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p819-matcha-seiun.html', imageUrl: 'https://www.sazentea.com/content/products/445/MYK004-1.jpg', description: 'Refined ceremonial matcha with elegant taste profile. Suitable for both koicha and usucha preparation.' },
  { name: 'Tennouzan', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p820-matcha-tennouzan.html', imageUrl: 'https://www.sazentea.com/content/products/445/MYK005-1.jpg', description: 'Koicha (thick tea) grade Uji matcha.\n\nOrigin: Kyoto Prefecture, Japan\n\nAn intense, velvety full-bodied, robust, creamy, sweet koicha tea. Its robust, characteristic and lingering aftertaste reveals toasted seed aromas. It is a lighter, sweeter tea compared to the Tennouzan.' },
  { name: 'Senjin No Mukashi', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p821-matcha-senjin-no-mukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MYK006-1.jpg', description: 'High-grade ceremonial matcha with intense flavor and beautiful vibrant green color.' },
  { name: 'Shikibu No Mukashi', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p822-matcha-shikibu-no-mukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MYK007-1.jpg', description: 'Koicha grade Uji matcha. Recommended to make usucha (thin tea) or koicha (thick tea) as well.\n\nOrigin: Kyoto Prefecture, Japan\n\nYamamasa Koyamaen\'s entry-level koicha tea is a pleasantly full-bodied composition with a mild flavour. When made as a thick tea (koicha), it offers a blend of full-bodied, sweet and slightly astringent notes, whilst its aftertaste boasts intense green flavours as well as hints of toasted seeds and roasted coffee beans.' },
  { name: 'Ogurayama', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p823-matcha-ogurayama.html', imageUrl: 'https://www.sazentea.com/content/products/445/MYK008-1.jpg', description: 'Fine ceremonial matcha with delicate sweetness and pleasant umami notes.' },
  { name: 'Yomo No Kaori', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p824-matcha-yomo-no-kaori.html', imageUrl: 'https://www.sazentea.com/content/products/445/MYK009-1.jpg', description: 'Ogurayama is an exceptionally tasty, pampering, dreamy matcha tea, mild in character with sweet, creamily full-bodied, delicate flavours. As an usucha tea, it offers a rather pleasant, joyful experience for those seeking a more engaging flavour as well as for those just getting to know matcha tea.' },
  { name: 'Samidori', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p825-matcha-samidori.html', imageUrl: 'https://www.sazentea.com/content/products/445/MYK010-1.jpg', description: 'Single cultivar matcha made from Samidori tea plants. Exceptional clarity of flavor.' },
  { name: 'Matsukaze', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p826-matcha-matsukaze.html', imageUrl: 'https://www.sazentea.com/content/products/445/MYK011-1.jpg', description: 'Uji matcha tea for making usucha (thin tea).\n\nOrigin: Kyoto Prefecture, Japan\n\nA moderately full-bodied usucha tea rich in fresh, fragrant, green flavours with a mix of slightly astringent, creamy notes and a slightly sweet sensation. Its light aftertaste lingers on the palate and is dominated by creaminess.' },
  { name: 'Shin Matcha Wakaba', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p864-shin-matcha-wakaba.html', imageUrl: 'https://www.sazentea.com/content/products/445/MYK031-1.jpg', description: 'Fresh spring harvest matcha with vibrant green color and fresh, lively flavor.' },
  { name: 'Reiyou Matcha', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p865-reiyou-matcha.html', imageUrl: 'https://www.sazentea.com/content/products/445/MYK036-1.jpg', description: 'High-grade ceremonial matcha with excellent balance and long, pleasant aftertaste.' },
  { name: 'Kuchikiri Matcha Tsubo Nishiki', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p866-kuchikiri-matcha-tsubo-nishiki.html', imageUrl: 'https://www.sazentea.com/content/products/445/MYK033-1.jpg', description: 'SUMMER EDITION\n\nUji matcha tea for making usucha (thin tea) on ice.\n\nMatcha with a pleasantly refreshing, smooth, creamy flavor recommended to prepare with cold water. When prepared hot, it gives a characteristically tart flavor, but as soon as poured over ice, the flavor is tamed and offers a sweet, delicious, dessert-like experience.' },

  // Marukyu Koyamaen
  { name: 'Tenju', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p151-matcha-tenju.html', imageUrl: 'https://www.sazentea.com/content/products/445/MMK001-1.jpg', description: 'The highest grade matcha from Marukyu Koyamaen. Exceptional umami, sweetness, and depth of flavor for special occasions.' },
  { name: 'Choan', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p152-matcha-choan.html', imageUrl: 'https://www.sazentea.com/content/products/445/MMK002-1.jpg', description: 'Premium ceremonial matcha with rich, full-bodied taste and excellent koicha characteristics.' },
  { name: 'Eiju', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p153-matcha-eiju.html', imageUrl: 'https://www.sazentea.com/content/products/445/MMK003-1.jpg', description: 'High-grade matcha with elegant sweetness and smooth, creamy texture.' },
  { name: 'Unkaku', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p154-matcha-unkaku.html', imageUrl: 'https://www.sazentea.com/content/products/445/MMK004-1.jpg', description: 'Refined ceremonial matcha with delicate flavor and beautiful green color.' },
  { name: 'Kinrin', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p155-matcha-kinrin.html', imageUrl: 'https://www.sazentea.com/content/products/445/MMK005-1.jpg', description: 'Premium matcha with golden ring of foam when whisked. Rich umami and sweet aftertaste.' },
  { name: 'Wako', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p156-matcha-wako.html', imageUrl: 'https://www.sazentea.com/content/products/445/MMK006-1.jpg', description: 'Harmonious blend of sweetness and umami. Excellent for both koicha and usucha.' },
  { name: 'Yugen', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p157-matcha-yugen.html', imageUrl: 'https://www.sazentea.com/content/products/445/MMK007-1.jpg', description: 'Mysterious depth of flavor with lingering sweet aftertaste. Premium ceremonial grade.' },
  { name: 'Chigi No Shiro', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p158-matcha-chigi-no-shiro.html', imageUrl: 'https://www.sazentea.com/content/products/445/MMK008-1.jpg', description: 'Bright, vibrant matcha with fresh taste and pleasant astringency. Great for usucha.' },
  { name: 'Isuzu', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p159-matcha-isuzu.html', imageUrl: 'https://www.sazentea.com/content/products/445/MMK009-1.jpg', description: 'Well-balanced matcha with good umami and refreshing finish. Excellent daily drinking matcha.' },
  { name: 'Aoarashi', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p160-matcha-aoarashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MMK010-1.jpg', description: 'Fresh, clean taste with vibrant green color. Perfect for everyday tea ceremony practice.' },
  { name: 'Matcha Haru Kasumi', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p262-matcha-haru-kasumi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MMK041-1.jpg', description: 'Spring mist matcha with delicate, ethereal flavor profile. Limited seasonal offering.' },
  { name: 'Hatsu Enishi Shin Matcha', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p286-hatsu-enishi-shin-matcha.html', imageUrl: 'https://www.sazentea.com/content/products/445/MMK042-1.jpg', description: 'SPRING COLLECTION\n\nMarukyu Koyamaen limited edition seasonal matcha\n\nHaru Kasumi is a sweet, creamy, fresh and flowery, smooth and light Matcha tea with a lush milky aftertaste. By using less water, we can make a round-bodied, light, and tasty Koicha tea. This tea tolerates varying water temperatures very well; it does not get bitter even at lower temperatures.' },
  { name: 'Matcha Suzukumo', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p447-matcha-suzukumo.html', imageUrl: 'https://www.sazentea.com/content/products/445/MMK047-2.jpg', description: 'Seasonal matcha blend from Marukyu Koyamaen made from carefully cultivated sprouting tea bushes (of an early-maturing cultivar) from a covered tea plantation.\n\nA mellow, light, creamy-textured matcha with an amazingly fresh, bright fragrance and an incredibly long, full-bodied, and creamy finish with tender, green flavors. This tea can be prepared with slightly lower temperature water (70 ºC), resulting in a sweeter and creamier flavor.' },
  { name: 'Matcha Awaraku', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p446-matcha-awaraku.html', imageUrl: 'https://www.sazentea.com/content/products/445/MMK046-2.jpg', description: 'A special matcha blend from Marukyu-Koyamaen.\n\nThanks to the freeze-drying processing, Suzukumo does not need sifting before consumption. It is suitable for preparing both hot and cold matcha, which makes it a perfect choice for summer.' },
  { name: 'Tsubokiri Matcha', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p350-tsubokiri-matcha.html', imageUrl: 'https://www.sazentea.com/content/products/445/MMK043-1.jpg', description: 'A special matcha blend from Marukyu-Koyamaen.\n\nThanks to the freeze-drying processing, Awaraku does not need to be sifted before consumption. It is suitable for preparing both hot and cold matcha, which makes it a perfect choice for summer.' },

  // Kanbayashi Shunsho
  { name: 'Koicha Hatsumukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1590-koicha-hatsumukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS001-1.jpg', description: `Matcha Hatsumukashi is Kambayashi Shunshō's top grade matcha tea, superb both as usucha and koicha.\n\nAs a koicha, it offers bold, full-bodied flavors with fruity, dark chocolate, and creamy notes, delivering a long-lasting, lingering finish. When prepared as Usucha, it has a smooth texture that gradually deepens and intensifies, revealing a rich sweetness that brings out a strong umami. Among the koicha teas in the lineup, this one has the most intense flavor and fullness—a true gourmet matcha.\n\nUpon opening, it first offers a fresh, tropical fruit aroma, and after drinking, it leaves a lasting feeling of deep satisfaction and joy.` },
  { name: 'Koicha Atomukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1591-koicha-atomukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS002-1.jpg', description: 'High-grade koicha matcha with deep, complex flavors and long-lasting aftertaste.' },
  { name: 'Koicha Babamukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1592-koicha-babamukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS003-1.jpg', description: 'Traditional koicha matcha with rich heritage and exceptional quality.' },
  { name: 'Koicha Hijirimukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1593-koicha-hijirimukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS004-1.jpg', description: 'Sacred ceremonial matcha for important tea gatherings. Deep umami and sweetness.' },
  { name: 'Koicha Sazumimukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1594-koicha-sazumimukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS005-1.jpg', description: 'Premium koicha with gentle, refined flavor and beautiful green color.' },
  { name: 'Koicha Zuihou', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1595-koicha-zuihou.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS006-1.jpg', description: 'Treasure-class koicha matcha with exceptional depth and lasting sweetness.' },
  { name: 'Koicha Matsukazemukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1596-koicha-matsukazemukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS007-1.jpg', description: 'Pine wind koicha with elegant, refreshing character and smooth finish.' },
  { name: 'Usucha Gokumukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1597-usucha-gokumukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS008-1.jpg', description: 'Extremely high-grade usucha with rich flavor and excellent foam formation.' },
  { name: 'Usucha Konomi No Shiro', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1598-usucha-konomi-no-shiro.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS009-1.jpg', description: 'Beloved white usucha with gentle sweetness and pleasant astringency.' },
  { name: 'Usucha Yuzuriha Mukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1599-usucha-yuzuriha-mukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS010-1.jpg', description: 'Transferring leaf usucha with fresh, vibrant taste and beautiful color.' },
  { name: 'Usucha Biwa No Shiro', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1600-usucha-biwa-no-shiro.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS011-1.jpg', description: 'Loquat white usucha with unique flavor profile and smooth texture.' },
  { name: 'Usucha Mozumukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1601-usucha-mozumukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS012-1.jpg', description: 'Divine usucha with exceptional clarity and refined taste.' },
  { name: 'Usucha Aya No Mori', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1602-usucha-aya-no-mori.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS013-1.jpg', description: 'Colorful forest usucha with complex, layered flavors and fresh finish.' },
  { name: 'Usucha Ryo No Kage', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1603-usucha-ryo-no-kage.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS014-1.jpg', description: 'Cool shadow usucha with refreshing character and pleasant sweetness.' },
  { name: 'Usucha Matsu No Shiro', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1604-usucha-matsu-no-shiro.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS015-1.jpg', description: 'Pine white usucha with sturdy, reliable flavor for daily practice.' },
  { name: 'Usucha Kouko no Shiro', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1615-usucha-kouko-no-shiro.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS022-1.jpg', description: '' },
  { name: 'Koicha Soumei no Mukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1613-koicha-soumei-no-mukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS021-1.jpg', description: '' },
  { name: 'Usucha Mikazuki no Shiro', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1609-usucha-mikazuki-no-shiro.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS017-1.jpg', description: '' },
  { name: 'Koicha Hashidate no Mukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1610-koicha-hashidate-no-mukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS018-1.jpg', description: '' },
  { name: 'Usucha Momoyo no Mukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1611-usucha-momoyo-no-mukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS018-1.jpg', description: '' },
  { name: 'Koicha Seitan no Shiro', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1612-koicha-seitan-no-shiro.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS018-1.jpg', description: '' },
  { name: 'Usucha Sachi no Shiro', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1618-usucha-sachi-no-shiro.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS023-1.jpg', description: '' },
  { name: 'Koicha Hatsune no Mukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1619-koicha-hatsune-no-mukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS024-1.jpg', description: '' },
  { name: 'Usucha Goun no Shiro', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1647-usucha-goun-no-shiro.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS025-1.jpg', description: '' },
  { name: 'Koicha Kashin no Mukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1650-koicha-kashin-no-mukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKS028-1.jpg', description: '' },

  // Hekisuien
  { name: 'Hatsumukashi', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p200-matcha-hatsumukashi.html', imageUrl: 'https://www.sazentea.com/content/products/445/MTG010-1.jpg', description: 'First ancient matcha from Hekisuien. Rich, traditional flavor with deep umami.' },
  { name: 'Chiyo No Sakae', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p248-matcha-chiyo-no-sakae.html', imageUrl: 'https://www.sazentea.com/content/products/445/CMM001-1.jpg', description: 'Hatsumukashi is a refreshingly bright usucha tea with a pleasant tart flavor. It represents the entry level of quality matcha teas, purposefully lower in terms of full-bodied, characteristic sweet flavors. This makes a great milder tea benefitting from lower temperature water.' },
  { name: 'Kin No Uzu', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p199-matcha-kin-no-uzu.html', imageUrl: 'https://www.sazentea.com/content/products/445/MTG009-1.jpg', description: 'Entry grade matcha for making usucha (thin tea), also perfect for culinary use, especially for making delicious soft drinks such as matcha latte.\n\nHekisuien, an old tea shop and a proud bastion of Uji-cha tea, has garnered quite the pedigree since being established in 1867. "Matcha Chiyo no Sakae" is the most moderately-priced tea for use during tea ceremonies.' },
  { name: 'Daigyoku', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p197-matcha-daigyoku.html', imageUrl: 'https://www.sazentea.com/content/products/445/MTG007-1.jpg', description: 'Kin no Uzu is a pleasantly mild, creamy, tea composition, delightful for curious newcomers to tea as an art. Its flavor features bitter and tart notes in the background; and while these don\'t stand out fully, they are embedded in the harmonious whole.' },
  { name: 'Houju', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p191-matcha-houju.html', imageUrl: 'https://www.sazentea.com/content/products/445/MTG001-1.jpg', description: 'We recommend this tea to all visitors who are seeking a Matcha with a pleasant aroma on those regular weekdays, or for those who are just starting to get immersed in the ritualistically traditional world of Matcha. Its scent is reminiscent of vanilla notes and a field of flowers, while its flavors include creamy sweetness, with fresh and tart notes.' },
  { name: 'Hekisui', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p192-matcha-hekisui.html', imageUrl: 'https://www.sazentea.com/content/products/445/MTG002-1.jpg', description: 'With its intensely sweet and full-bodied flavor, floral scent and mild and light nature, the Houju is sure to make you soar. Its breadth of finish elevates it above teas of lower body and makes it the crown of the entire Hekisuien matcha selection.' },
  { name: 'Ukitsu', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p193-matcha-ukitsu.html', imageUrl: 'https://www.sazentea.com/content/products/445/MTG003-1.jpg', description: 'Hekisui is a surprisingly full and sweet matcha, which should be brewed thickly, with as little water as possible. Its characteristic sweetness, velvety full-bodied flavor and bright aroma elevate it above lower grade teas and sets this incredibly delicious tea apart.' },
  { name: 'Shien', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p194-matcha-shien.html', imageUrl: 'https://www.sazentea.com/content/products/445/MTG004-1.jpg', description: 'Our gourmet Ukitsu is a creamy, full-bodied tea, with a light caress. It has a definitely sweeter character than the Shien tea next in line, whilst its full-bodied nature yields a breezier and lighter tea. It is best brewed as a koicha, yet when prepared as an usucha, it produces an incredibly delicious and all-round comforting tea as well.' },
  { name: 'Tenko', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p195-matcha-tenko.html', imageUrl: 'https://www.sazentea.com/content/products/445/MTG005-1.jpg', description: 'Shien offers an extraordinarily full, yet velvety, pampering concentrated essence of flavors. Its crystal-clear fullness, long-lasting creamy and slightly sweet, pronounced flavor with a long finish lingers in the mouth long after tasting.' },
  { name: 'Shiro No Kotobuki', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p196-matcha-shiro-no-kotobuki.html', imageUrl: 'https://www.sazentea.com/content/products/445/MTG006-1.jpg', description: 'Tenko almost envelops the person fortunate enough to taste it, with sweetness and gentle yet pronounced mildness. It is a great tea which can be prepared both as a usucha and a koicha. Compared to the Shiro no Kotobuki, it is a less sweet, yet more full-bodied matcha which offers a divine taste and creamy, lingering finish.' },
  { name: 'Matsu No Midori', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p198-matcha-matsu-no-midori.html', imageUrl: 'https://www.sazentea.com/content/products/445/MTG008-1.jpg', description: 'Shiro no Kotobuki is a mild, particularly sweet and creamy tea, which can be prepared both as a usucha (thin tea) and koicha (thick tea). As usucha, the umami comes out stronger, while as koicha more characteristic, astringent flavours are dominant.' },

  // Horii Shichimeien
  { name: 'Narino', brandName: 'Horii Shichimeien', url: 'https://www.sazentea.com/en/products/p330-matcha-narino.html', imageUrl: 'https://horiishichimeien.com/cdn/shop/products/MG_8628_1080x.jpg',  description: 'This is a recommended matcha that represents our garden.\n\nIt is a single origin of the new variety "Narino" born from the "Okunoyama" tea garden that has continued since the Muromachi period.\n\nThis variety is characterized by its strong sweetness, and it has been proven that it contains nearly twice as much theanine, the source of umami, as other matcha varieties. It has such a strong umami flavor that it is said to be delicious to drink on its own without sweets, and it has a full-bodied aroma and rich flavor that is hard to find in other varieties. Please enjoy the matcha that can only be tasted at our farm.' },
  { name: 'Mumon', brandName: 'Horii Shichimeien', url: 'https://www.sazentea.com/en/products/p331-matcha-mumon.html', imageUrl: 'https://horiishichimeien.com/cdn/shop/products/MG_8633_1080x.jpg', description: 'This is a single-origin cultivar "Asahi" cultivated in both the "Okunoyama" and "Togawa" tea gardens, which are cultivated and managed by our garden, and processed, processed, and ground matcha.\n\nThe "Asahi" variety is said to be the best of matcha, with excellent taste and aroma, and ranks highly at tea competitions every year. The "Asahi" variety we grow at our farm is named "Mumon" and has been well-received. Please enjoy its well-balanced flavor.' },
  { name: 'Agata no Shiro', brandName: 'Horii Shichimeien', url: 'https://www.sazentea.com/en/products/p336-matcha-agata-no-shiro.html', imageUrl: 'https://horiishichimeien.com/cdn/shop/files/IMG_9794-2_1080x.jpg', description: 'The ingredients are hand-picked young buds and high-quality tencha selected from the tencha-producing areas of Kyoto Prefecture. This matcha is characterized by a moderate astringency and a mellow flavor that spreads deep within. We recommend drinking it as a thin tea.' },
  { name: 'Uji Mukashi', brandName: 'Horii Shichimeien', url: 'https://www.sazentea.com/en/products/p337-matcha-uji-mukashi.html', imageUrl: 'https://horiishichimeien.com/cdn/shop/files/IMG_9821-2_1080x.jpg', description: 'The owner of the garden carefully selects high-quality tencha from the tencha-producing areas in Kyoto Prefecture. This matcha has the aroma and flavor of freshly ground tea and is easy to drink. It is often used as a thin tea at tea ceremonies. It tastes even better when drunk with sweets.\n\nIt is also recommended for use in making sweets.' },

  // Hokoen
  { name: 'Shoukaku', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p201-matcha-shoukaku.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKH001-1.jpg', description: 'Soaring crane matcha from Hokoen with uplifting, excellent flavor.' },
  { name: 'Ryokuhou', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p202-matcha-ryokuhou.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKH002-1.jpg', description: 'Green treasure matcha with rich, valuable character and deep flavor.' },
  { name: 'Senju', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p203-matcha-senju.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKH003-1.jpg', description: 'Thousand lives matcha with enduring, long-lasting flavor and quality.' },
  { name: 'Houki', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p204-matcha-houki.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKH004-1.jpg', description: 'Treasure vessel matcha with precious, exceptional taste and aroma.' },
  { name: 'Koun', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p205-matcha-koun.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKH005-1.jpg', description: 'Fragrant cloud matcha with aromatic, heavenly flavor profile.' },
  { name: 'Myouju', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p206-matcha-myouju.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKH006-1.jpg', description: 'Bright jewel matcha with luminous, exceptional quality and taste.' },
  { name: 'Koushu', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p207-matcha-koushu.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKH007-1.jpg', description: 'Fragrant autumn matcha with rich, harvest-time flavor and warmth.' },
  { name: 'Eiraku', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p208-matcha-eiraku.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKH008-1.jpg', description: 'Eternal comfort matcha with lasting, reassuring flavor and quality.' },
  { name: 'Jurei', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p209-matcha-jurei.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKH009-1.jpg', description: 'Long life matcha with enduring, healthful character and rich taste.' },
  { name: 'Unryu', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p828-matcha-unryu.html', imageUrl: 'https://www.sazentea.com/content/products/445/MKH010-2.jpg', description: 'Cloud dragon matcha with powerful, soaring flavor and exceptional depth.' },
]

const ippodoListings: ListingSeed[] = [
  { name: 'Nodoka Special Spring Matcha 20g Box', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha399081', variantId: '40615356170391', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/files/399081-01.png', description: 'Mild and serene, like a warm, sunny place in beautiful spring. Great for a calming tea break. With a good balance of umami and sharpness, it goes well with both Japanese and Western sweets.' },
  { name: 'New Harvest Matcha 20g Can', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha146024', variantId: '43145234186391', imageUrl: 'https://ippodotea.com/cdn/shop/files/ippodo-new-harvest-matcha-2023-01_1.5x.png', description: 'Fresh, young flavor with vivid color and fragrance. Limited spring release featuring the first harvest of the year.' },
  { name: 'Kanza 20g Can', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha387424', variantId: '42232743526551', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/products/387024-01.png', description: 'Rich and satisfying, with a deep umami flavor and almost no bitterness. Exceptional koicha-grade matcha for special occasions.' },
  { name: 'Kuon 20g Can', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha306024', variantId: '42974684512407', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/products/306024-01.png', description: 'Profound depth with intense umami and a sweet, lingering aftertaste. One of the highest grades of matcha from Ippodo.' },
  { name: 'Ummon-no-mukashi 20g Can', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha101024', variantId: '40615348994199', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/products/101024-01.png', description: 'Rich and full-bodied with a perfect balance of umami and sweetness. Excellent for koicha and special tea gatherings.' },
  { name: 'Ummon-no-mukashi 40g Can', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha101044', variantId: '40615347028119', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/products/101044-01.png', description: 'Rich and full-bodied with perfect balance of umami and sweetness. Larger size for regular enjoyment of this exceptional matcha.' },
  { name: 'Seiun 40g Can', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha102044', variantId: '40615348371607', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/products/102044-01.png', description: 'Blue clouds matcha with mellow, approachable flavor. Good balance of umami and astringency for daily drinking.' },
  { name: 'Sayaka-no-mukashi 40g Can', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha103644', variantId: '40615350665367', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/products/103644-01.png', description: 'Bright and clear with refreshing taste and pleasant sharpness. Excellent for usucha and everyday tea ceremony practice.' },
  { name: 'Sayaka-no-mukashi 100g Bag', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha173512', variantId: '40729506955415', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/products/173512-01.png', description: 'Bright and clear with refreshing taste. Large bag size ideal for those who drink matcha regularly or use it for cooking.' },
  { name: 'Kan-no-shiro 30g Box', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha104033', variantId: '40615355023639', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/products/104033-01.png', description: 'Sweet and mellow with gentle umami and light astringency. Perfect entry-level ceremonial matcha.' },
  { name: 'Ikuyo-no-mukashi 30g Box', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha105033', variantId: '40615355973911', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/products/105033-01.png', description: 'Soft and mild with subtle sweetness and smooth texture. Easy to drink for matcha beginners.' },
  { name: 'Ikuyo-no-mukashi 100g Bag', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha175512', variantId: '40729507086487', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/products/175512-01.png', description: 'Soft and mild with subtle sweetness. Large bag size perfect for regular consumption or culinary use.' },
  { name: 'Wakaki-shiro 40g Box', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha108643', variantId: '40615358694423', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/products/108643-01.png', description: 'Young white matcha with fresh, vibrant flavor and pleasant lightness. Good for both usucha and matcha lattes.' },
  { name: 'Hatsu-mukashi 40g Box', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha109643', variantId: '40615360268439', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/products/109643-01.png', description: 'First ancient matcha with traditional, time-honored flavor. Good balance of umami and astringency.' },
  { name: 'Matcha To-Go Packets (2g x 10 packets)', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha125510', variantId: '40729508528279', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/products/125510-01.png', description: 'Convenient single-serve packets perfect for travel, office, or on-the-go matcha enjoyment.' },
  { name: 'Organic Matcha 20g Can', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha148624', variantId: '42768905355415', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/products/148624-01.png', description: 'Certified organic matcha with clean, pure taste. Grown without pesticides or chemical fertilizers.' },
  { name: 'Fumi-no-tomo 100g Bag', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha111102', variantId: '40729508823191', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/products/111102-01.png', description: 'Literary friend matcha with balanced flavor suitable for daily drinking and culinary applications.' },
  { name: 'Uji-Shimizu 400g Bag', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha642402', variantId: '40729508888727', imageUrl: 'https://global.ippodo-tea.co.jp/cdn/shop/products/642402-01.png', description: 'Sweetened matcha powder with sugar already blended in. Perfect for easy matcha lattes and desserts.' },
]

const nakamuraListings: ListingSeed[] = [
  { name: 'Matcha Starter 100g Bag', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/m100-str', variantId: '47148766298364', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/m100-str_prd_01.jpg', description: 'Start your matcha journey, freely and effortlessly. Crafted exclusively from Kyoto-grown first flush tea leaves, this matcha delivers a smooth umami and gentle sweetness.' },
  { name: 'Matcha Standard 100g Bag', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/m100-std', variantId: '47148766331132', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/m100-std_prd_01.jpg', description: 'Standard grade matcha for everyday enjoyment. Smooth taste with good umami and pleasant finish.' },
  { name: 'Fuji-no-Shiro Can 30g', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc2', variantId: '44231891747068', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/01_b3f3099f-86e4-4280-a557-96807276f70f.jpg', description: 'Wisteria white matcha in traditional can. Elegant flavor with smooth texture and sweet aftertaste.' },
  { name: 'Hatsu-Mukashi 30g Can', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc12', variantId: '44231891714300', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/01_85900642-2179-473a-b6fb-2e9f7a892808.jpg', description: 'First ancient matcha with traditional, time-honored flavor. Rich umami with sweet aftertaste.' },
  { name: 'Ato-Mukashi 30g Can', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc11', variantId: '44231891681532', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/01_3c7453d7-bee6-47ab-8e43-0bdda8b64d53.jpg', description: 'Later ancient matcha with mature, developed flavor. Good balance of umami and astringency.' },
  { name: 'Uji-no-Mukashi 30g Can', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc10', variantId: '44231891648764', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/01_84f3a538-106f-4ead-9068-4fc432b3972a.jpg', description: 'Ancient Uji matcha with traditional flavor profile from the historic tea-growing region.' },
  { name: 'Hatsu-no-Mukashi 30g Can', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc7', variantId: '44231891583244', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/01_2a97e970-959b-4295-b430-bf589d5eaa76.jpg', description: 'First of the ancient matcha with fresh, vibrant character and rich taste.' },
  { name: 'Seiko-no-Mukashi 30g Can', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc9', variantId: '44231891615996', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/01_a84fd76e-41e6-4a5b-b593-f957cfc76a95.jpg', description: 'Clear light ancient matcha with bright, clear flavor and refreshing finish.' },
  { name: 'Jingai-no-Mukashi 30g Can', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc8', variantId: '44231891550476', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/01_56abb580-2d0b-4b15-9307-cfaedc79f36c.jpg', description: 'Outer garden ancient matcha with unique, distinctive flavor profile.' },
  { name: 'Asagiri-no-mukashi Can 30g', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc20', variantId: '44231891946412', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/01_8240506c-b00c-459d-bf25-d82fc6a1f5c1.jpg', description: 'Morning mist ancient matcha with ethereal, delicate flavor and beautiful color.' },
  { name: 'Sho-no-mukashi Can 30g', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc6', variantId: '44231891517708', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/01_5cbd75cd-3ec9-4e3d-ab28-5ece05b890c2.jpg', description: 'Pine ancient matcha with sturdy, reliable flavor for daily tea ceremony practice.' },
  { name: 'Senun-no-Shiro Can 30g', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc3', variantId: '44231891779836', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/01_aa2d7ce0-0f6a-467e-8899-2dc61e80b864.jpg', description: 'Thousand clouds white matcha with light, airy texture and gentle sweetness.' },
  { name: 'Hiroha-no-Shiro Can 30g', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc4', variantId: '44231891812604', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/01_2df5d1d4-719b-4b51-8d4f-5a9a84a888f1.jpg', description: 'Wide leaf white matcha with expansive, full-bodied flavor and rich umami.' },
  { name: 'Seikan-no-Shiro Can 30g', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc5', variantId: '44231891845372', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/01_7d9b1a45-b2e3-4c82-9d97-070583a4e8a1.jpg', description: 'Clear cold white matcha with crisp, refreshing taste and clean finish.' },
  { name: 'Yukawa-no-Shiro Can 30g', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc21', variantId: '44231891979180', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/01_6e10e73d-99c3-4e09-b1e0-cd2e26ba7bf0.jpg', description: 'Evening river white matcha with smooth, flowing flavor and gentle character.' },
  { name: 'Ukishima-no-Shiro Can 30g', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc1', variantId: '44231891634508', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/01_3968cb02-6400-4636-a7e5-867936a1cbc4.jpg', description: 'Floating island white matcha with light, buoyant texture and pleasant taste.' },
]

const horiiListings: ListingSeed[] = [
  { name: 'Premium Narino', brandName: 'Horii Shichimeien', url: 'https://horiishichimeien.com/en/products/matcha-premiumnarino', variantId: '40895584501897', imageUrl: 'https://cdn.shopify.com/s/files/1/0566/5308/6857/products/MG_8630.jpg?v=1666256941', description: 'This is a matcha made from tencha that has been carefully finished and ground in order to exhibit the new variety "Narino", which was born from the "Okunoyama" tea garden that has continued since the Muromachi period, at the National Tea Competition. (single origin)\n\nThe tea leaves are picked with a method called "shigoki picking", which is said to be more careful than hand-picking, paying close attention from the tea picking, and the final tencha produced is sorted with chopsticks and finished with only beautiful leaves. Because the selected tencha is ground with a stone mill, it is characterized by a richer, creamier flavor with less off-flavours and more condensed umami than regular Narino.' },
  { name: 'Narino', brandName: 'Horii Shichimeien', url: 'https://horiishichimeien.com/en/products/matcha-narino', variantId: '40895584600201', imageUrl: 'https://cdn.shopify.com/s/files/1/0566/5308/6857/products/MG_8628.jpg?v=1666307765', description: 'This is a recommended matcha that represents our garden.\n\nIt is a single origin of the new variety "Narino" born from the "Okunoyama" tea garden that has continued since the Muromachi period.\n\nThis variety is characterized by its strong sweetness, and it has been proven that it contains nearly twice as much theanine, the source of umami, as other matcha varieties. It has such a strong umami flavor that it is said to be delicious to drink on its own without sweets, and it has a full-bodied aroma and rich flavor that is hard to find in other varieties. Please enjoy the matcha that can only be tasted at our farm.' },
  { name: 'Okunoyama', brandName: 'Horii Shichimeien', url: 'https://horiishichimeien.com/en/products/matcha-okunoyama', variantId: '40895584829577', imageUrl: 'https://cdn.shopify.com/s/files/1/0566/5308/6857/products/MG_8632.jpg', description: 'It is a single origin of the new variety "Okunoyama" born from the "Okunoyama" tea garden that has continued since the Muromachi period.\n\nIt is said to be a variety suitable for gyokuro, but it is also cultivated for tencha, as its deep green color produces an excellent color when ground into matcha. It is characterized by its clean, easy-to-drink flavor with no strong taste.' },
  { name: 'Mumon', brandName: 'Horii Shichimeien', url: 'https://horiishichimeien.com/en/products/matcha-mumon', variantId: '40895584731273', imageUrl: 'https://cdn.shopify.com/s/files/1/0566/5308/6857/products/MG_8633.jpg', description: 'This is a single-origin cultivar "Asahi" cultivated in both the "Okunoyama" and "Togawa" tea gardens, which are cultivated and managed by our garden, and processed, processed, and ground matcha.\n\nThe "Asahi" variety is said to be the best of matcha, with excellent taste and aroma, and ranks highly at tea competitions every year. The "Asahi" variety we grow at our farm is named "Mumon" and has been well-received. Please enjoy its well-balanced flavor.' },
  { name: 'Choukou no Mukashi', brandName: 'Horii Shichimeien', url: 'https://horiishichimeien.com/en/products/matcha-choukounomukashi', variantId: '40895584927881', imageUrl: 'https://horiishichimeien.com/cdn/shop/files/IMG_9800-2_540x.jpg?v=1770269549', description: 'Focusing on hand-picked high-grade tea leaves that won awards at fairs, we blend well-balanced tea leaves that have a good aroma and strong umami. It is characterized by its mellow taste and umami. Please enjoy the well-balanced taste, richness, and umami unique to blended tea leaves that are different from single-origin products.' },
  { name: 'Homare no Mukashi', brandName: 'Horii Shichimeien', url: 'https://horiishichimeien.com/en/products/matcha-homarenomukashi', variantId: '40895585026185', imageUrl: 'https://cdn.shopify.com/s/files/1/0566/5308/6857/files/IMG_9799-2.jpg', description: 'We use hand-picked, high-quality tea leaves that have won awards at tea tasting competitions, and blend them in a well-balanced way to create a well-balanced flavor. This is a flavorful matcha that is mellow, fragrant, and full of umami. You can use it as either a light or thick tea.' },
  { name: 'Shichimei no Mukashi', brandName: 'Horii Shichimeien', url: 'https://horiishichimeien.com/en/products/matcha-shichimeinomukashi', variantId: '40895585124489', imageUrl: 'https://cdn.shopify.com/s/files/1/0566/5308/6857/files/IMG_9791-2.jpg', description: 'A blend of hand-picked tea leaves. A mild, strong-flavored matcha. Recommended for those looking for a mild flavor. Can be used as either thin or thick tea.' },
  { name: 'Todou Mukashi', brandName: 'Horii Shichimeien', url: 'https://horiishichimeien.com/en/products/matcha-todounomukashi', variantId: '40895585222793', imageUrl: 'https://cdn.shopify.com/s/files/1/0566/5308/6857/files/IMG_9818-2.jpg', description: 'A blend of hand-picked tea leaves, mainly from the Kyoto variety "Samidori." This matcha has a strong flavor and is almost completely bitter. Recommended for those who drink matcha regularly and want to try something a little better.' },
  { name: 'Agata no Shiro', brandName: 'Horii Shichimeien', url: 'https://horiishichimeien.com/en/products/matcha-agatanoshiro', variantId: '40895585321097', imageUrl: 'https://cdn.shopify.com/s/files/1/0566/5308/6857/files/IMG_9794-2.jpg', description: 'The ingredients are hand-picked young buds and high-quality tencha selected from the tencha-producing areas of Kyoto Prefecture. This matcha is characterized by a moderate astringency and a mellow flavor that spreads deep within. We recommend drinking it as a thin tea.' },
  { name: 'Uji Mukashi', brandName: 'Horii Shichimeien', url: 'https://horiishichimeien.com/en/products/matcha-ujimukashi', variantId: '40895585419401', imageUrl: 'https://cdn.shopify.com/s/files/1/0566/5308/6857/files/IMG_9821-2.jpg', description: 'The owner of the garden carefully selects high-quality tencha from the tencha-producing areas in Kyoto Prefecture. This matcha has the aroma and flavor of freshly ground tea and is easy to drink. It is often used as a thin tea at tea ceremonies. It tastes even better when drunk with sweets.\n\nIt is also recommended for use in making sweets.' },
]

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.userNotificationPreference.deleteMany()
  await prisma.stockHistory.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.matcha.deleteMany()
  await prisma.storefront.deleteMany()
  await prisma.brand.deleteMany()

  const storefrontMap = new Map<string, string>()
  for (const sf of storefronts) {
    const created = await prisma.storefront.create({ data: sf })
    storefrontMap.set(sf.name, created.id)
    console.log(`✅ Created storefront: ${sf.name}`)
  }

  const brandMap = new Map<string, string>()
  for (const b of brands) {
    const created = await prisma.brand.create({ data: b })
    brandMap.set(b.name, created.id)
    console.log(`✅ Created brand: ${b.name}`)
  }

  for (const [sfName, brandNames] of Object.entries(storefrontBrandMappings)) {
    const sfId = storefrontMap.get(sfName)!
    const brandIds = brandNames.map(name => ({ id: brandMap.get(name)! }))

    await prisma.storefront.update({
      where: { id: sfId },
      data: { brands: { connect: brandIds } }
    })
  }
  console.log(`✅ Connected brands to storefronts`)

  async function createListings(
    listings: ListingSeed[],
    storefrontId: string
  ): Promise<number> {
    let count = 0

    for (const listing of listings) {
      const brandId = brandMap.get(listing.brandName)
      if (!brandId) {
        console.warn(`⚠️ Warning: Brand not found: ${listing.brandName}`)
        continue
      }

      const matcha = await prisma.matcha.upsert({
        where: {
          brandId_name: {
            brandId,
            name: listing.name,
          }
        },
        update: {},
        create: {
          name: listing.name,
          brandId,
          imageUrl: listing.imageUrl,
          description: listing.description,
        }
      })

      await prisma.listing.create({
        data: {
          matchaId: matcha.id,
          storefrontId,
          url: listing.url,
          variantId: listing.variantId || null,
        }
      })
      count++
    }

    return count
  }

  const sazenCount = await createListings(sazenListings, storefrontMap.get('Sazen Tea')!)
  console.log(`✅ Created ${sazenCount} listings for Sazen Tea`)

  const ippodoCount = await createListings(ippodoListings, storefrontMap.get('Ippodo Tea')!)
  console.log(`✅ Created ${ippodoCount} listings for Ippodo Tea`)

  const nakamuraCount = await createListings(nakamuraListings, storefrontMap.get('Nakamura Tokichi')!)
  console.log(`✅ Created ${nakamuraCount} listings for Nakamura Tokichi`)

  const horiiCount = await createListings(horiiListings, storefrontMap.get('Horii Shichimeien')!)
  console.log(`✅ Created ${horiiCount} listings for Horii Shichimeien`)

  const totalListings = sazenCount + ippodoCount + nakamuraCount + horiiCount

  console.log('\n📊 Summary:')
  console.log(`  • Storefronts: ${storefronts.length}`)
  console.log(`  • Brands: ${brands.length}`)
  console.log(`  • Matcha: ${await prisma.matcha.count()}`)
  console.log(`  • Total Listings: ${totalListings}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
