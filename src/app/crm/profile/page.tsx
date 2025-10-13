'use client';

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Grid,
  GridItem,
  Button,
  Avatar,
  Badge,
  Divider,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Icon,
} from '@chakra-ui/react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Award,
  Calendar,
  Edit,
  Lock,
  Bell,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AuthLayout } from '@/components/layout/auth-layout';
import DashboardLayout from '@/components/crm/layout/DashboardLayout';
import EditProfileModal from '@/components/crm/profile/EditProfileModal';
import ChangePasswordModal from '@/components/crm/profile/ChangePasswordModal';
import UploadPhotoModal from '@/components/crm/profile/UploadPhotoModal';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'therapist' | 'admin' | 'assistant';
  specialty?: string;
  licenseNumber?: string;
  bio?: string;
  avatarUrl?: string;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const mockProfile: UserProfile = {
  id: '1',
  fullName: 'Dr. María Fernanda García',
  email: 'maria.garcia@example.com',
  phone: '+52 55 1234 5678',
  role: 'therapist',
  specialty: 'Psicología Clínica',
  licenseNumber: 'PSI-12345',
  bio: 'Psicóloga clínica especializada en terapia cognitivo-conductual con más de 10 años de experiencia. Enfoque en ansiedad, depresión y trastornos del estado de ánimo.',
  avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
  notificationsEnabled: true,
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date('2024-12-20'),
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [isLoading, setIsLoading] = useState(false);

  const editProfileModal = useDisclosure();
  const changePasswordModal = useDisclosure();
  const uploadPhotoModal = useDisclosure();

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Administrador', color: 'purple' },
      therapist: { label: 'Terapeuta', color: 'blue' },
      assistant: { label: 'Asistente', color: 'green' },
    };
    return roleConfig[role as keyof typeof roleConfig] || { label: role, color: 'gray' };
  };

  const handleProfileUpdate = (updatedProfile: Partial<UserProfile>) => {
    setProfile({ ...profile, ...updatedProfile, updatedAt: new Date() });
  };

  return (
    <AuthLayout>
      <DashboardLayout>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Box>
              <HStack spacing={3} mb={2}>
                <User size={24} color="#3182CE" />
                <Heading size="lg" color="gray.800">
                  Mi Perfil
                </Heading>
              </HStack>
              <Text color="gray.600">Gestiona tu información personal y preferencias</Text>
            </Box>
          </Flex>

          {/* Profile Header Card */}
          <Card>
            <CardBody>
              <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
                {/* Avatar Section */}
                <VStack spacing={3}>
                  <Box position="relative">
                    <Avatar
                      size="2xl"
                      name={profile.fullName}
                      src={profile.avatarUrl}
                      bg="blue.500"
                    />
                    <Button
                      size="xs"
                      colorScheme="blue"
                      position="absolute"
                      bottom={0}
                      right={0}
                      borderRadius="full"
                      onClick={uploadPhotoModal.onOpen}
                    >
                      <Edit size={12} />
                    </Button>
                  </Box>
                  <Badge
                    colorScheme={getRoleBadge(profile.role).color}
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {getRoleBadge(profile.role).label}
                  </Badge>
                </VStack>

                {/* Profile Info */}
                <VStack flex="1" align="stretch" spacing={4}>
                  <Box>
                    <Heading size="lg" color="gray.800" mb={1}>
                      {profile.fullName}
                    </Heading>
                    <Text color="gray.600" fontSize="md">
                      {profile.specialty || 'Profesional de la salud'}
                    </Text>
                  </Box>

                  <Grid
                    templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                    gap={4}
                  >
                    <HStack spacing={2}>
                      <Icon as={Mail} color="gray.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.700">
                        {profile.email}
                      </Text>
                    </HStack>

                    {profile.phone && (
                      <HStack spacing={2}>
                        <Icon as={Phone} color="gray.500" boxSize={4} />
                        <Text fontSize="sm" color="gray.700">
                          {profile.phone}
                        </Text>
                      </HStack>
                    )}

                    {profile.licenseNumber && (
                      <HStack spacing={2}>
                        <Icon as={Award} color="gray.500" boxSize={4} />
                        <Text fontSize="sm" color="gray.700">
                          Cédula: {profile.licenseNumber}
                        </Text>
                      </HStack>
                    )}

                    <HStack spacing={2}>
                      <Icon as={Calendar} color="gray.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.700">
                        Miembro desde{' '}
                        {format(profile.createdAt, 'MMMM yyyy', { locale: es })}
                      </Text>
                    </HStack>
                  </Grid>

                  <HStack spacing={3} pt={2}>
                    <Button
                      leftIcon={<Edit size={16} />}
                      colorScheme="blue"
                      size="sm"
                      onClick={editProfileModal.onOpen}
                    >
                      Editar Perfil
                    </Button>
                    <Button
                      leftIcon={<Lock size={16} />}
                      variant="outline"
                      size="sm"
                      onClick={changePasswordModal.onOpen}
                    >
                      Cambiar Contraseña
                    </Button>
                  </HStack>
                </VStack>
              </Flex>
            </CardBody>
          </Card>

          {/* Tabs Section */}
          <Card>
            <CardBody p={0}>
              <Tabs colorScheme="blue">
                <TabList px={6} pt={4}>
                  <Tab>
                    <HStack spacing={2}>
                      <User size={16} />
                      <Text>Información Personal</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <Briefcase size={16} />
                      <Text>Información Profesional</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <Bell size={16} />
                      <Text>Preferencias</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <Shield size={16} />
                      <Text>Seguridad</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Personal Information */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
                          Nombre Completo
                        </Text>
                        <Text fontSize="md" color="gray.800">
                          {profile.fullName}
                        </Text>
                      </Box>

                      <Divider />

                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
                          Correo Electrónico
                        </Text>
                        <Text fontSize="md" color="gray.800">
                          {profile.email}
                        </Text>
                      </Box>

                      <Divider />

                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
                          Teléfono
                        </Text>
                        <Text fontSize="md" color="gray.800">
                          {profile.phone || 'No especificado'}
                        </Text>
                      </Box>

                      <Divider />

                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
                          Última Actualización
                        </Text>
                        <Text fontSize="md" color="gray.800">
                          {format(profile.updatedAt, "dd 'de' MMMM 'de' yyyy", {
                            locale: es,
                          })}
                        </Text>
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* Professional Information */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
                          Especialidad
                        </Text>
                        <Text fontSize="md" color="gray.800">
                          {profile.specialty || 'No especificada'}
                        </Text>
                      </Box>

                      <Divider />

                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
                          Número de Cédula Profesional
                        </Text>
                        <Text fontSize="md" color="gray.800">
                          {profile.licenseNumber || 'No especificado'}
                        </Text>
                      </Box>

                      <Divider />

                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
                          Biografía Profesional
                        </Text>
                        <Text fontSize="md" color="gray.700" lineHeight="tall">
                          {profile.bio || 'No especificada'}
                        </Text>
                      </Box>

                      <Divider />

                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
                          Rol en el Sistema
                        </Text>
                        <Badge
                          colorScheme={getRoleBadge(profile.role).color}
                          fontSize="sm"
                          px={3}
                          py={1}
                        >
                          {getRoleBadge(profile.role).label}
                        </Badge>
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* Preferences */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Box>
                        <HStack justify="space-between">
                          <Box>
                            <Text fontSize="md" fontWeight="semibold" color="gray.800" mb={1}>
                              Notificaciones por Email
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              Recibe actualizaciones sobre citas y reportes
                            </Text>
                          </Box>
                          <Badge
                            colorScheme={profile.notificationsEnabled ? 'green' : 'gray'}
                            fontSize="sm"
                            px={3}
                            py={1}
                          >
                            {profile.notificationsEnabled ? 'Activadas' : 'Desactivadas'}
                          </Badge>
                        </HStack>
                      </Box>

                      <Divider />

                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Más opciones de preferencias estarán disponibles próximamente.
                        </Text>
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* Security */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Box>
                        <Text fontSize="md" fontWeight="semibold" color="gray.800" mb={3}>
                          Contraseña
                        </Text>
                        <Text fontSize="sm" color="gray.600" mb={4}>
                          Cambia tu contraseña regularmente para mantener tu cuenta segura.
                        </Text>
                        <Button
                          leftIcon={<Lock size={16} />}
                          colorScheme="blue"
                          variant="outline"
                          size="sm"
                          onClick={changePasswordModal.onOpen}
                        >
                          Cambiar Contraseña
                        </Button>
                      </Box>

                      <Divider />

                      <Box>
                        <Text fontSize="md" fontWeight="semibold" color="gray.800" mb={2}>
                          Sesión Activa
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Tu sesión está protegida y expirará automáticamente después de un
                          período de inactividad.
                        </Text>
                      </Box>

                      <Divider />

                      <Box>
                        <Text fontSize="md" fontWeight="semibold" color="gray.800" mb={2}>
                          Cuenta Creada
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {format(profile.createdAt, "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                            locale: es,
                          })}
                        </Text>
                      </Box>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>

        {/* Modals */}
        <EditProfileModal
          isOpen={editProfileModal.isOpen}
          onClose={editProfileModal.onClose}
          profile={profile}
          onUpdate={handleProfileUpdate}
        />

        <ChangePasswordModal
          isOpen={changePasswordModal.isOpen}
          onClose={changePasswordModal.onClose}
        />

        <UploadPhotoModal
          isOpen={uploadPhotoModal.isOpen}
          onClose={uploadPhotoModal.onClose}
          currentPhotoUrl={profile.avatarUrl}
          onUpdate={(avatarUrl) => handleProfileUpdate({ avatarUrl })}
        />
      </DashboardLayout>
    </AuthLayout>
  );
}
