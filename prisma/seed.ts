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
]

const brands = [
  { name: 'Yamamasa Koyamaen', imageUrl: 'https://www.yamamasa-koyamaen.co.jp/assets/images/common/ci.svg', },
  { name: 'Marukyu Koyamaen', imageUrl: 'https://www.marukyu-koyamaen.co.jp/english/shop/wp-content/themes/motoan-shop-en/images/logo.svg' },
  { name: 'Kanbayashi Shunsho', imageUrl: 'https://shop.shunsho.co.jp/Contents/ImagesPkg/index_page/header_logo_shunsho.svg' },
  { name: 'Hekisuien', imageUrl: 'https://ujicha.online/html/template/default/assets/img/common/logo_3.jpg' },
  { name: 'Horii Shichimeien', imageUrl: 'https://instagram.fsin4-1.fna.fbcdn.net/v/t51.2885-19/312694423_3336877573226156_7481346773365740316_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fsin4-1.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QHXck10ZqMoUlOg4DPGqa9SBec1peOcQvEjcmns306k-Ter7hv3AqJNihCOaF1uxUM&_nc_ohc=boKWJufRkU4Q7kNvwFZSeLp&_nc_gid=W40F-naUqyvLTqy_f3INqQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_Afuf_npQFhUcnSRn96kqF4Pbgd2L-HXi-GT8Tj47_XJT3Q&oe=698B97EA&_nc_sid=7a9f4b' },
  { name: 'Hokoen', imageUrl: 'https://i.ibb.co/1Yh6Vn4f/logo.png' },
  { name: 'Ippodo Tea', imageUrl: 'https://www.ippodo-tea.co.jp/cdn/shop/t/9/assets/logo_ippodo-jp.svg?v=63699976184591097091688130169' },
  { name: 'Nakamura Tokichi', imageUrl: 'https://global.tokichi.jp/cdn/shop/files/maruto_ico_g.webp' },
]

const storefrontBrandMappings: Record<string, string[]> = {
  'Sazen Tea': ['Yamamasa Koyamaen', 'Marukyu Koyamaen', 'Kanbayashi Shunsho', 'Hekisuien', 'Horii Shichimeien', 'Hokoen'],
  'Ippodo Tea': ['Ippodo Tea'],
  'Nakamura Tokichi': ['Nakamura Tokichi'],
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
  { name: 'Chajyu No Mukashi', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p816-matcha-chajyu-no-mukashi.html' },
  { name: 'Kasuga No Mukashi', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p817-matcha-kasuga-no-mukashi.html' },
  { name: 'Kaguraden', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p818-matcha-kaguraden.html' },
  { name: 'Seiun', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p819-matcha-seiun.html' },
  { name: 'Tennouzan', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p820-matcha-tennouzan.html' },
  { name: 'Senjin No Mukashi', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p821-matcha-senjin-no-mukashi.html' },
  { name: 'Shikibu No Mukashi', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p822-matcha-shikibu-no-mukashi.html' },
  { name: 'Ogurayama', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p823-matcha-ogurayama.html' },
  { name: 'Yomo No Kaori', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p824-matcha-yomo-no-kaori.html' },
  { name: 'Samidori', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p825-matcha-samidori.html' },
  { name: 'Matsukaze', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p826-matcha-matsukaze.html' },
  { name: 'Shin Matcha Wakaba', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p864-shin-matcha-wakaba.html' },
  { name: 'Reiyou Matcha', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p865-reiyou-matcha.html' },
  { name: 'Kuchikiri Matcha Tsubo Nishiki', brandName: 'Yamamasa Koyamaen', url: 'https://www.sazentea.com/en/products/p866-kuchikiri-matcha-tsubo-nishiki.html' },

  // Marukyu Koyamaen
  { name: 'Tenju', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p151-matcha-tenju.html' },
  { name: 'Choan', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p152-matcha-choan.html' },
  { name: 'Eiju', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p153-matcha-eiju.html' },
  { name: 'Unkaku', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p154-matcha-unkaku.html' },
  { name: 'Kinrin', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p155-matcha-kinrin.html' },
  { name: 'Wako', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p156-matcha-wako.html' },
  { name: 'Yugen', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p157-matcha-yugen.html' },
  { name: 'Chigi No Shiro', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p158-matcha-chigi-no-shiro.html' },
  { name: 'Isuzu', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p159-matcha-isuzu.html' },
  { name: 'Aoarashi', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p160-matcha-aoarashi.html' },
  { name: 'Matcha Haru Kasumi', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p262-matcha-haru-kasumi.html' },
  { name: 'Hatsu Enishi Shin Matcha', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p286-hatsu-enishi-shin-matcha.html' },
  { name: 'Matcha Suzukumo', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p447-matcha-suzukumo.html' },
  { name: 'Matcha Awaraku', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p446-matcha-awaraku.html' },
  { name: 'Tsubokiri Matcha', brandName: 'Marukyu Koyamaen', url: 'https://www.sazentea.com/en/products/p350-tsubokiri-matcha.html' },

  // Kanbayashi Shunsho
  { name: 'Koicha Hatsumukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1590-koicha-hatsumukashi.html' },
  { name: 'Koicha Atomukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1591-koicha-atomukashi.html' },
  { name: 'Koicha Babamukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1592-koicha-babamukashi.html' },
  { name: 'Koicha Hijirimukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1593-koicha-hijirimukashi.html' },
  { name: 'Koicha Sazumimukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1594-koicha-sazumimukashi.html' },
  { name: 'Koicha Zuihou', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1595-koicha-zuihou.html' },
  { name: 'Koicha Matsukazemukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1596-koicha-matsukazemukashi.html' },
  { name: 'Usucha Gokumukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1597-usucha-gokumukashi.html' },
  { name: 'Usucha Konomi No Shiro', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1598-usucha-konomi-no-shiro.html' },
  { name: 'Usucha Yuzuriha Mukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1599-usucha-yuzuriha-mukashi.html' },
  { name: 'Usucha Biwa No Shiro', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1600-usucha-biwa-no-shiro.html' },
  { name: 'Usucha Mozumukashi', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1601-usucha-mozumukashi.html' },
  { name: 'Usucha Aya No Mori', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1602-usucha-aya-no-mori.html' },
  { name: 'Usucha Ryo No Kage', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1603-usucha-ryo-no-kage.html' },
  { name: 'Usucha Matsu No Shiro', brandName: 'Kanbayashi Shunsho', url: 'https://www.sazentea.com/en/products/p1604-usucha-matsu-no-shiro.html' },

  // Hekisuien
  { name: 'Hatsumukashi', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p200-matcha-hatsumukashi.html' },
  { name: 'Chiyo No Sakae', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p248-matcha-chiyo-no-sakae.html' },
  { name: 'Kin No Uzu', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p199-matcha-kin-no-uzu.html' },
  { name: 'Daigyoku', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p197-matcha-daigyoku.html' },
  { name: 'Houju', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p191-matcha-houju.html' },
  { name: 'Hekisui', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p192-matcha-hekisui.html' },
  { name: 'Ukitsu', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p193-matcha-ukitsu.html' },
  { name: 'Shien', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p194-matcha-shien.html' },
  { name: 'Tenko', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p195-matcha-tenko.html' },
  { name: 'Shiro No Kotobuki', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p196-matcha-shiro-no-kotobuki.html' },
  { name: 'Matsu No Midori', brandName: 'Hekisuien', url: 'https://www.sazentea.com/en/products/p198-matcha-matsu-no-midori.html' },

  // Horii Shichimeien
  { name: 'Narino', brandName: 'Horii Shichimeien', url: 'https://www.sazentea.com/en/products/p330-matcha-narino.html' },
  { name: 'Mumon', brandName: 'Horii Shichimeien', url: 'https://www.sazentea.com/en/products/p331-matcha-mumon.html' },
  { name: 'Agata No Shiro', brandName: 'Horii Shichimeien', url: 'https://www.sazentea.com/en/products/p336-matcha-agata-no-shiro.html' },
  { name: 'Uji Mukashi', brandName: 'Horii Shichimeien', url: 'https://www.sazentea.com/en/products/p337-matcha-uji-mukashi.html' },

  // Hokoen
  { name: 'Shoukaku', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p201-matcha-shoukaku.html' },
  { name: 'Ryokuhou', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p202-matcha-ryokuhou.html' },
  { name: 'Senju', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p203-matcha-senju.html' },
  { name: 'Houki', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p204-matcha-houki.html' },
  { name: 'Koun', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p205-matcha-koun.html' },
  { name: 'Myouju', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p206-matcha-myouju.html' },
  { name: 'Koushu', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p207-matcha-koushu.html' },
  { name: 'Eiraku', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p208-matcha-eiraku.html' },
  { name: 'Jurei', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p209-matcha-jurei.html' },
  { name: 'Unryu', brandName: 'Hokoen', url: 'https://www.sazentea.com/en/products/p828-matcha-unryu.html' },
]

const ippodoListings: ListingSeed[] = [
  { name: 'Nodoka Special Spring Matcha 20g Box', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha399081', variantId: '' },
  { name: 'New Harvest Matcha 20g Can', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha146024', variantId: '43145234186391' },
  { name: 'Kanza 20g Can', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha387424', variantId: '42232743526551' },
  { name: 'Kuon 20g Can', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha306024', variantId: '42974684512407' },
  { name: 'Ummon-no-mukashi 20g Can', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha101024', variantId: '40615348994199' },
  { name: 'Ummon-no-mukashi 40g Can', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha101044', variantId: '40615347028119' },
  { name: 'Seiun 40g Can', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha102044', variantId: '40615348371607' },
  { name: 'Sayaka-no-mukashi 40g Can', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha103644', variantId: '40615350665367' },
  { name: 'Sayaka-no-mukashi 100g Bag', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha173512', variantId: '40729506955415' },
  { name: 'Kan-no-shiro 30g Box', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha104033', variantId: '40615355023639' },
  { name: 'Ikuyo-no-mukashi 30g Box', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha105033', variantId: '40615355973911' },
  { name: 'Ikuyo-no-mukashi 100g Bag', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha175512', variantId: '40729507086487' },
  { name: 'Wakaki-shiro 40g Box', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha108643', variantId: '40615358694423' },
  { name: 'Hatsu-mukashi 40g Box', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha109643', variantId: '40615360268439' },
  { name: 'Matcha To-Go Packets (2g x 10 packets)', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha125510', variantId: '40729508528279' },
  { name: 'Organic Matcha 20g Can', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha148624', variantId: '42768905355415' },
  { name: 'Fumi-no-tomo 100g Bag', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha111102', variantId: '40729508823191' },
  { name: 'Uji-Shimizu 400g Bag', brandName: 'Ippodo Tea', url: 'https://global.ippodo-tea.co.jp/collections/matcha/products/matcha642402', variantId: '40729508888727' },
]

const nakamuraListings: ListingSeed[] = [
  { name: 'Matcha Starter 100g Bag', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/m100-str', variantId: '47148766298364' },
  { name: 'Matcha Standard 100g Bag', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/m100-std', variantId: '47148766331132' },
  { name: 'Matcha Fuji-no-Shiro Can 30g', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc2', variantId: '44231891747068' },
  { name: 'Matcha Premium Hatsu-Mukashi 20g Can', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/bessei-hatsumukashi-matcha-uji', variantId: '46649410191612' },
  { name: 'Matcha Debut', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/g-set', variantId: '46409243885820' },
  { name: 'Matcha Hatsu-Mukashi 30g Can', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc12', variantId: '44231891714300' },
  { name: 'Matcha Ato-Mukashi 30g Can', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc11', variantId: '44231891681532' },
  { name: 'Matcha Uji-no-Mukashi 30g Can', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc10', variantId: '44231891648764' },
  { name: 'Matcha Hatsu-no-Mukashi 30g Can', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc7', variantId: '44231891583244' },
  { name: 'Matcha Seiko-no-Mukashi 30g Can', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc9', variantId: '44231891615996' },
  { name: 'Matcha Jingai-no-Mukashi 30g Can', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc8', variantId: '44231891550476' },
  { name: 'Matcha Asagiri-no-mukashi Can 30g', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc20', variantId: '44231891946412' },
  { name: 'Matcha Sho-no-mukashi Can 30g', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc6', variantId: '44231891517708' },
  { name: 'Matcha Senun-no-Shiro Can 30g', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc3', variantId: '44231891779836' },
  { name: 'Matcha Hiroha-no-Shiro Can 30g', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc4', variantId: '44231891812604' },
  { name: 'Matcha Seikan-no-Shiro Can 30g', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc5', variantId: '44231891845372' },
  { name: 'Matcha Yukawa-no-Shiro Can 30g', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc21', variantId: '44231891979180' },
  { name: 'Matcha Ukishima-no-Shiro Can 30g', brandName: 'Nakamura Tokichi', url: 'https://global.tokichi.jp/products/mc1', variantId: '44231891634508' },
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

      const matcha = await prisma.matcha.create({
        data: {
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

  const totalListings = sazenCount + ippodoCount + nakamuraCount
  const totalMatchas = await prisma.matcha.count()

  console.log('\n📊 Summary:')
  console.log(`  • Storefronts: ${storefronts.length}`)
  console.log(`  • Brands: ${brands.length}`)
  console.log(`  • Unique Matchas: ${totalMatchas}`)
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
