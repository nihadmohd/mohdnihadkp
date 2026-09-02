const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const post = await p.post.findUnique({ where: { slug: 'how-i-shipped-this-website' }, select: { id: true, views: true } });
  const ledger = await p.postView.count({ where: { postId: post.id } });
  console.log('views counter:', post.views, '| ledger rows:', ledger);
}
main().finally(() => p.$disconnect());
