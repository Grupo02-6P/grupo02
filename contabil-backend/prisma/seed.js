const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed (JS)...');

  // 1. Criar Role ADMIN
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador do Sistema',
      isDefault: false,
    },
  });

  // 2. Hash da senha
  const password = await bcrypt.hash('123456', 10);

  // 3. Criar Usuário
  const user = await prisma.user.upsert({
    where: { email: 'admin@contabil.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@contabil.com',
      password,
      roleId: adminRole.id,
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Usuário criado: ${user.email} | Senha: 123456`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });