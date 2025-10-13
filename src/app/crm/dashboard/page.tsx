'use client';

import { useState } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  VStack,
  HStack,
  Badge,
  Avatar,
  Divider,
  useDisclosure,
} from '@chakra-ui/react';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';
import DashboardLayout from '@/components/crm/layout/DashboardLayout';
import StatisticsCard from '@/components/crm/dashboard/StatisticsCard';
import RecentAppointments from '@/components/crm/dashboard/RecentAppointments';
import RecentPatients from '@/components/crm/dashboard/RecentPatients';
import NewSessionModal from '@/components/crm/dashboard/NewSessionModal';

export default function DashboardPage() {
  const { isOpen: isSessionModalOpen, onOpen: onSessionModalOpen, onClose: onSessionModalClose } = useDisclosure();

  return (
    <AuthLayout>
      <DashboardLayout>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" color="gray.800" mb={2}>
              Panel de Control
            </Heading>
            <Text color="gray.600">
              Resumen de tu consulta psicológica
            </Text>
          </Box>

          {/* Statistics Cards */}
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
            <StatisticsCard
              title="Pacientes Activos"
              value="24"
              change="+12%"
              changeType="increase"
              icon={Users}
              color="blue"
            />
            <StatisticsCard
              title="Citas Hoy"
              value="8"
              change="+2"
              changeType="increase"
              icon={Calendar}
              color="green"
            />
            <StatisticsCard
              title="Ingresos Mes"
              value="$12,450"
              change="+8%"
              changeType="increase"
              icon={DollarSign}
              color="purple"
            />
            <StatisticsCard
              title="Tasa Asistencia"
              value="94%"
              change="+3%"
              changeType="increase"
              icon={TrendingUp}
              color="orange"
            />
          </Grid>

          {/* Main Content Grid */}
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
            {/* Recent Appointments */}
            <GridItem>
              <RecentAppointments />
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
              <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                <Box
                  p={4}
                  borderRadius="lg"
                  bg="blue.50"
                  cursor="pointer"
                  _hover={{ bg: "blue.100" }}
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
                  _hover={{ bg: "green.100" }}
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
                  bg="purple.50"
                  cursor="pointer"
                  _hover={{ bg: "purple.100" }}
                  transition="all 0.2s"
                  onClick={onSessionModalOpen}
                >
                  <HStack>
                    <CheckCircle size={20} color="#805AD5" />
                    <Text fontWeight="medium" color="purple.700">
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
          onClose={onSessionModalClose}
        />
      </DashboardLayout>
    </AuthLayout>
  );
}