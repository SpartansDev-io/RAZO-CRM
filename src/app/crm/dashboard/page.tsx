'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  useDisclosure,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';
import DashboardLayout from '@/components/crm/layout/DashboardLayout';
import StatisticsCard from '@/components/crm/dashboard/StatisticsCard';
import RecentAppointments from '@/components/crm/dashboard/RecentAppointments';
import RecentPatients from '@/components/crm/dashboard/RecentPatients';
import NewSessionModal from '@/components/crm/patients/NewSessionModal';
import { getDashboardStats } from '@/lib/api/dashboard.api';
import type { DashboardStats } from '@/types/dashboard.types';

export default function DashboardPage() {
  const {
    isOpen: isSessionModalOpen,
    onOpen: onSessionModalOpen,
    onClose: onSessionModalClose,
  } = useDisclosure();
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'Error al cargar estadísticas');
      }
    } catch (err) {
      setError('Error al cargar estadísticas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSessionModal = (patient?: { id: string; name: string }) => {
    if (patient) {
      setSelectedPatient(patient);
    } else {
      setSelectedPatient(null);
    }
    onSessionModalOpen();
  };

  const handleCloseSessionModal = () => {
    setSelectedPatient(null);
    onSessionModalClose();
  };

  return (
    <AuthLayout>
      <DashboardLayout>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" color="gray.800" mb={2}>
              Panel de Control
            </Heading>
            <Text color="gray.600">Resumen de tu consulta psicológica</Text>
          </Box>

          {/* Statistics Cards */}
          {loading ? (
            <Center py={12}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
            </Center>
          ) : error ? (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>Error al cargar estadísticas</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
          ) : stats ? (
            <Grid
              templateColumns="repeat(auto-fit, minmax(250px, 1fr))"
              gap={6}
            >
              <StatisticsCard
                title="Pacientes Activos"
                value={stats.activePatients.value.toString()}
                change={`${stats.activePatients.change}%`}
                changeType={stats.activePatients.changeType}
                icon={Users}
                color="blue"
              />
              <StatisticsCard
                title="Citas Hoy"
                value={stats.appointmentsToday.value.toString()}
                change={stats.appointmentsToday.change}
                changeType={stats.appointmentsToday.changeType}
                icon={Calendar}
                color="green"
              />
              <StatisticsCard
                title="Ingresos Mes"
                value={stats.revenueThisMonth.formatted}
                change={`${stats.revenueThisMonth.change}%`}
                changeType={stats.revenueThisMonth.changeType}
                icon={DollarSign}
                color="teal"
              />
              <StatisticsCard
                title="Tasa Asistencia"
                value={stats.attendanceRate.formatted}
                change={`${stats.attendanceRate.change}%`}
                changeType={stats.attendanceRate.changeType}
                icon={TrendingUp}
                color="orange"
              />
            </Grid>
          ) : null}

          {/* Main Content Grid */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
            {/* Recent Appointments */}
            <GridItem>
              <RecentAppointments onNewSession={handleOpenSessionModal} />
            </GridItem>

            {/* Recent Patients */}
            <GridItem>
              <RecentPatients />
            </GridItem>
          </Grid>

          {/* Quick Actions */}
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Acciones Rápidas
              </Heading>
              <Grid
                templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
                gap={4}
              >
                <Box
                  p={4}
                  borderRadius="lg"
                  bg="blue.50"
                  cursor="pointer"
                  _hover={{ bg: 'blue.100' }}
                  transition="all 0.2s"
                >
                  <HStack>
                    <Calendar size={20} color="#3182CE" />
                    <Text fontWeight="medium" color="blue.700">
                      Nueva Cita
                    </Text>
                  </HStack>
                </Box>
                <Box
                  p={4}
                  borderRadius="lg"
                  bg="green.50"
                  cursor="pointer"
                  _hover={{ bg: 'green.100' }}
                  transition="all 0.2s"
                >
                  <HStack>
                    <Users size={20} color="#38A169" />
                    <Text fontWeight="medium" color="green.700">
                      Nuevo Paciente
                    </Text>
                  </HStack>
                </Box>
                <Box
                  p={4}
                  borderRadius="lg"
                  bg="teal.50"
                  cursor="pointer"
                  _hover={{ bg: 'teal.100' }}
                  transition="all 0.2s"
                  onClick={() => handleOpenSessionModal()}
                >
                  <HStack>
                    <CheckCircle size={20} color="#319795" />
                    <Text fontWeight="medium" color="teal.700">
                      Nueva Sesión
                    </Text>
                  </HStack>
                </Box>
              </Grid>
            </CardBody>
          </Card>
        </VStack>

        <NewSessionModal
          isOpen={isSessionModalOpen}
          onClose={handleCloseSessionModal}
          patient={selectedPatient}
          showPatientSelector={!selectedPatient}
        />
      </DashboardLayout>
    </AuthLayout>
  );
}
