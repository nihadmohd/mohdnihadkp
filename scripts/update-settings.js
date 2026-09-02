const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const updates = [
    { key: 'siteName', value: 'MN.KP' },
    { key: 'seoTitle', value: 'MN.KP — AI-Powered Developer & Digital Creator' },
    { key: 'seoDescription', value: 'MN.KP — the platform of Mohammed Nihad KP. Blog, curated affiliate store, services and ventures from Calicut, Kerala to the world.' },
  ];
  for (const u of updates) {
    await p.setting.upsert({ where: { key: u.key }, update: { value: u.value }, create: u });
    console.log('set', u.key, '=', u.value);
  }
  const all = await p.setting.findMany();
  all.forEach(s => console.log('SET:', s.key, '=', s.value.substring(0, 70)));
}
main().finally(() => p.$disconnect());
