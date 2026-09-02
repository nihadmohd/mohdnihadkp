const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  for (const [name, model] of Object.entries({ adUnit: p.adUnit, marqueeItem: p.marqueeItem, footerLink: p.footerLink, formSubmission: p.formSubmission, media: p.media, postView: p.postView, product: p.product, post: p.post, user: p.user, setting: p.setting, service: p.service, inquiry: p.inquiry })) {
    try { console.log(name, await model.count()); } catch (e) { console.log(name, 'ERR', e.message.split('\n')[0]); }
  }
  const settings = await p.setting.findMany();
  settings.forEach(s => console.log('SET:', s.key, '=', s.value.substring(0, 80)));
  const ads = await p.adUnit.findMany();
  ads.forEach(a => console.log('AD:', a.placement, '|', a.title, '| active:', a.active));
  const mq = await p.marqueeItem.findMany();
  mq.forEach(m => console.log('MQ:', m.title, '|', m.imageUrl.substring(0, 60)));
  const fl = await p.footerLink.findMany();
  fl.forEach(f => console.log('FL:', f.section, '|', f.label));
  const users = await p.user.findMany({ select: { email: true, role: true } });
  users.forEach(u => console.log('USER:', u.email, u.role));
}
main().finally(() => p.$disconnect());
