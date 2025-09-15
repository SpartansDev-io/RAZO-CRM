'use client';

import { Box, VStack, Heading, Text } from '@chakra-ui/react';
import DashboardLayout from '@/components/crm/layout/DashboardLayout';
import { AuthLayout } from '@/components/layout/auth-layout';
import WeeklyCalendar from '@/components/crm/calendar/WeeklyCalendar';

export default function CalendarPage() {
  return (
    <AuthLayout>
      <DashboardLayout>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" color="gray.800" mb={2}>
              Calendario de Citas
            </Heading>
            <Text color="gray.600">
              Gestiona y programa las citas de tus pacientes
            </Text>
          </Box>

          {/* Weekly Calendar */}
          <WeeklyCalendar />
        </VStack>
      </DashboardLayout>
    </AuthLayout>
  );
}