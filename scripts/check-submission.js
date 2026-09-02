const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const latest = await p.formSubmission.findFirst({ where: { name: 'V2 Test User' } });
  console.log('submission found:', JSON.stringify(latest, null, 1).substring(0, 500));
  const inquiry = await p.inquiry.findFirst({ where: { name: 'V2 Test User' } });
  console.log('inquiry row found:', !!inquiry, inquiry ? '| status: ' + inquiry.status + ' | budget: ' + inquiry.budget : '');
}
main().finally(() => p.$disconnect());
