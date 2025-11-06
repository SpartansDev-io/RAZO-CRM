import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Roles base del sistema
  const roles: Omit<Role, 'id'>[] = [
    {
      name: 'admin',
      description:
        'Control total del sistema, puede gestionar usuarios, contratos, reportes y configuraciones.',
    },
    {
      name: 'therapist',
      description:
        'Psicóloga que brinda atención y gestiona sus pacientes, notas clínicas y sesiones.',
    },
    {
      name: 'company_admin',
      description:
        'Representante de empresa cliente, puede consultar reportes y gestionar empleados asociados.',
    },
    {
      name: 'patient',
      description:
        'Paciente o colaborador que recibe atención psicológica. Accede solo a su propio perfil y sesiones.',
    },
    {
      name: 'assistant',
      description:
        'Personal administrativo o de apoyo que gestiona pacientes, sesiones y disponibilidad.',
    },
  ];

  // Inserta los roles (sin duplicar si ya existen)
  await prisma.role.createMany({
    data: roles,
    skipDuplicates: true,
  });

  console.log('✅ Roles base creados o ya existentes.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('❌ Error al ejecutar seed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
