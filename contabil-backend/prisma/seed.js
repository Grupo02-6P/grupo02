const { PrismaClient, PermAction } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed (Com Permissões)...');

  // --- 1. CONFIGURAÇÃO BÁSICA (ROLES) ---
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Administrador do Sistema', isDefault: false },
  });

  // 2. Hash da senha
  const password = await bcrypt.hash('123456', 10);

  // 3. Criar Usuário Admin
  const adminUser = await prisma.user.upsert({
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
  console.log(`✅ Usuário criado: ${adminUser.email}`);
  
  // --- 2. CONFIGURAÇÃO DE PERMISSÕES (CASL) ---
  const resources = [
    'User', 
    'Role', 
    'Partner', 
    'Account', 
    'Title', 
    'JournalEntry',
    'typeMovement', 'TypeMovement', // <--- Garante as duas formas
    'typeEntry',    'TypeEntry'     // <--- Garante as duas formas
  ];
  
  for (const resourceName of resources) {
    // 1. Cria ou obtém o Resource
    const resource = await prisma.resource.upsert({
      where: { name: resourceName },
      update: {},
      create: { name: resourceName, description: `Recurso ${resourceName}` },
    });

    // 2. Cria a Permissão 'manage' (Permissão total) para este recurso
    const permission = await prisma.permission.upsert({
      where: { resourceId_action: { resourceId: resource.id, action: PermAction.manage } },
      update: {},
      create: {
        action: PermAction.manage,
        resourceId: resource.id,
      },
    });

    // 3. Liga a Permissão ao Role de ADMIN
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }
  
  console.log('✅ Permissões Admin (Manage All) criadas com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });