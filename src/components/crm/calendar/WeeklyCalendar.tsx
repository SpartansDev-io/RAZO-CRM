'use client';

import React from 'react';
import {
  Box,
  Grid,
  Text,
  Button,
  VStack,
  HStack,
  IconButton,
  useColorModeValue,
  Flex,
  Badge,
  useDisclosure,
} from '@chakra-ui/react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@chakra-ui/react';
import AppointmentModal from './AppointmentModal';
import ViewAppointmentModal from './ViewAppointmentModal';

interface Appointment {
  id: string;
  patientName: string;
  therapyType: string;
  appointmentType: 'presencial' | 'videollamada' | 'visita';
  startTime: Date;
  endTime: Date;
  notes?: string;
  meetLink?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

// Mock appointments data
const getMockAppointments = (currentWeek: Date): Appointment[] => {
  const today = new Date();
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  
  return [
    {
      id: '1',
      patientName: 'María González',
      therapyType: 'Terapia Individual',
      appointmentType: 'videollamada',
      startTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 1, 9, 0), // Tuesday 9:00
      endTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 1, 10, 0),
      meetLink: 'https://meet.google.com/abc-defg-hij',
      status: 'confirmed',
    },
    {
      id: '2',
      patientName: 'Carlos Rodríguez',
      therapyType: 'Evaluación Inicial',
      appointmentType: 'presencial',
      startTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 1, 14, 30), // Tuesday 14:30
      endTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 1, 15, 30),
      status: 'pending',
    },
    {
      id: '3',
      patientName: 'Ana López',
      therapyType: 'Terapia Familiar',
      appointmentType: 'presencial',
      startTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 2, 11, 0), // Wednesday 11:00
      endTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 2, 12, 0),
      status: 'confirmed',
    },
    {
      id: '4',
      patientName: 'Pedro Martínez',
      therapyType: 'Seguimiento',
      appointmentType: 'visita',
      startTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 3, 10, 30), // Thursday 10:30
      endTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 3, 11, 30),
      status: 'confirmed',
    },
    {
      id: '5',
      patientName: 'Laura Fernández',
      therapyType: 'Terapia de Pareja',
      appointmentType: 'videollamada',
      startTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 4, 16, 0), // Friday 16:00
      endTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 4, 17, 30),
      meetLink: 'https://meet.google.com/xyz-uvwx-rst',
      status: 'pending',
    },
    {
      id: '6',
      patientName: 'Miguel Santos',
      therapyType: 'Terapia Individual',
      appointmentType: 'presencial',
      startTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 0, 15, 0), // Monday 15:00
      endTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 0, 16, 0),
      status: 'confirmed',
    },
  ];
};

export default function WeeklyCalendar() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    time: string;
  } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const toast = useToast();
  
  const { 
    isOpen: isCreateOpen = false, 
    onOpen: onCreateOpen, 
    onClose: onCreateClose 
  } = useDisclosure();
  
  const { 
    isOpen: isViewOpen = false, 
    onOpen: onViewOpen, 
    onClose: onViewClose 
  } = useDisclosure();
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const todayBg = useColorModeValue('blue.50', 'blue.900');
  const availableSlotBg = useColorModeValue('blue.25', 'blue.950');
  const bookedSlotBg = useColorModeValue('blue.500', 'blue.600');
  const selectedSlotBg = useColorModeValue('blue.100', 'blue.800');

  // Get mock appointments for current week
  const mockAppointments = getMockAppointments(currentWeek);

  // Generate time slots from 7:00 AM to 8:00 PM
  const timeSlots: TimeSlot[] = useMemo(() => {
    const slots: TimeSlot[] = [];
    for (let hour = 7; hour <= 20; hour++) {
      // Only create one slot per hour (top of the hour)
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      slots.push({ time: timeString, hour, minute: 0 });
    }
    return slots;
  }, []);

  // Get week days
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentWeek]);

  // Navigation functions
  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToToday = () => setCurrentWeek(new Date());

  // Check if a time slot has an appointment
  const getAppointmentForSlot = (date: Date, timeSlot: TimeSlot) => {
    return mockAppointments.find(appointment => 
      isSameDay(appointment.startTime, date) &&
      appointment.startTime.getHours() === timeSlot.hour
    );
  };

  // Check if appointment spans multiple hours and get position info
  const getAppointmentSpanInfo = (appointment: Appointment, currentHour: number) => {
    const startHour = appointment.startTime.getHours();
    const startMinute = appointment.startTime.getMinutes();
    const endHour = appointment.endTime.getHours();
    const endMinute = appointment.endTime.getMinutes();
    
    // Calculate if this hour slot should show the appointment
    const isInRange = currentHour >= startHour && currentHour < endHour;
    const isLastHour = currentHour === endHour && endMinute > 0;
    
    if (!isInRange && !isLastHour) return null;
    
    // Calculate the visual positioning within the hour slot
    let topOffset = 0;
    let height = 100; // Full height by default
    
    if (currentHour === startHour) {
      // First hour - start from the minute position
      topOffset = (startMinute / 60) * 100;
      if (currentHour === endHour) {
        // Same hour start and end
        height = ((endMinute - startMinute) / 60) * 100;
      } else {
        // Continues to next hour
        height = 100 - topOffset;
      }
    } else if (currentHour === endHour && endMinute > 0) {
      // Last hour - end at the minute position
      height = (endMinute / 60) * 100;
    }
    
    return {
      topOffset,
      height,
      isFirst: currentHour === startHour,
      isLast: currentHour === endHour && endMinute > 0,
      showContent: currentHour === startHour // Only show content in first slot
    };
  };

  // Handle time slot click
  const handleSlotClick = (date: Date, timeSlot: TimeSlot, clickY?: number) => {
    // Validate that the selected time is not in the past
    const now = new Date();
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(timeSlot.hour, 0, 0, 0);
    
    if (selectedDateTime < now) {
      // Show error message for past time slots
      toast({
        title: 'Fecha y hora inválidas',
        description: 'No puedes programar una cita en el pasado. Selecciona una fecha y hora futura.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // Calculate the clicked time based on position within the hour
    let clickedMinute = 0;
    if (clickY !== undefined) {
      // Convert click position to minutes (assuming clickY is percentage of slot height)
      clickedMinute = Math.round((clickY / 100) * 60 / 15) * 15; // Round to 15-minute intervals
    }
    
    // Create the exact clicked time
    const clickedDateTime = new Date(date);
    clickedDateTime.setHours(timeSlot.hour, clickedMinute, 0, 0);
    
    // Find appointment that contains the exact clicked time
    const appointment = mockAppointments.find(app => 
      isSameDay(app.startTime, date) &&
      clickedDateTime >= app.startTime &&
      clickedDateTime < app.endTime
    );
    
    if (appointment) {
      setSelectedAppointment(appointment);
      onViewOpen();
    } else {
      // No appointment at clicked time, create new appointment
      const clickedTime = `${timeSlot.hour.toString().padStart(2, '0')}:${clickedMinute.toString().padStart(2, '0')}`;
      setSelectedSlot({ date, time: clickedTime });
      onCreateOpen();
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box bg={bg} borderRadius="lg" shadow="sm" overflow="hidden">
      {/* Header */}
      <Box p={6} borderBottom="1px" borderColor={borderColor}>
        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={4}>
            <CalendarIcon size={24} color="#3182CE" />
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Calendario Semanal
            </Text>
          </HStack>
          <Button
            leftIcon={<Plus size={16} />}
            colorScheme="blue"
            size="sm"
            onClick={() => {
              setSelectedSlot(null);
              onCreateOpen();
            }}
          >
            Nueva Cita
          </Button>
        </Flex>

        {/* Week Navigation */}
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <IconButton
              aria-label="Semana anterior"
              icon={<ChevronLeft size={20} />}
              variant="ghost"
              onClick={goToPreviousWeek}
            />
            <Text fontSize="lg" fontWeight="semibold" minW="200px" textAlign="center">
              {format(weekDays[0], 'd MMM', { locale: es })} - {format(weekDays[6], 'd MMM yyyy', { locale: es })}
            </Text>
            <IconButton
              aria-label="Semana siguiente"
              icon={<ChevronRight size={20} />}
              variant="ghost"
              onClick={goToNextWeek}
            />
          </HStack>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
        </Flex>
      </Box>

      {/* Calendar Grid */}
      <Box p={4}>
        <Grid templateColumns="80px repeat(7, 1fr)" gap={1}>
          {/* Time column header */}
          <Box />
          
          {/* Day headers */}
          {weekDays.map((day) => (
            <Box
              key={day.toISOString()}
              p={3}
              textAlign="center"
              bg={isToday(day) ? todayBg : 'transparent'}
              borderRadius="md"
              border={isToday(day) ? '2px solid' : '1px solid'}
              borderColor={isToday(day) ? 'blue.300' : borderColor}
            >
              <Text fontSize="sm" fontWeight="bold" color="gray.700">
                {format(day, 'EEE', { locale: es })}
              </Text>
              <Text fontSize="lg" fontWeight="semibold" color={isToday(day) ? 'blue.600' : 'gray.800'}>
                {format(day, 'd')}
              </Text>
            </Box>
          ))}

          {/* Time slots */}
          {timeSlots.map((timeSlot) => (
            <React.Fragment key={timeSlot.time}>
              {/* Time label */}
              <Box
                p={2}
                textAlign="center"
                borderRight="1px"
                borderColor={borderColor}
              >
                <Text fontSize="xs" color="gray.500">
                  {timeSlot.time}
                </Text>
              </Box>

              {/* Day slots */}
              {weekDays.map((day) => {
                // Find all appointments that might overlap with this hour
                const overlappingAppointments = mockAppointments.filter(app => 
                  isSameDay(app.startTime, day) &&
                  ((app.startTime.getHours() <= timeSlot.hour && app.endTime.getHours() > timeSlot.hour) ||
                   (app.endTime.getHours() === timeSlot.hour && app.endTime.getMinutes() > 0))
                );
                
                const isSelected = selectedSlot?.date === day && 
                  parseInt(selectedSlot?.time.split(':')[0]) === timeSlot.hour;

                return (
                  <Box
                    key={`${day.toISOString()}-${timeSlot.time}`}
                    minH="80px"
                    position="relative"
                    cursor="pointer"
                    bg={isSelected ? selectedSlotBg : availableSlotBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                    _hover={{
                      bg: selectedSlotBg,
                      shadow: 'sm'
                    }}
                    transition="all 0.2s"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickY = ((e.clientY - rect.top) / rect.height) * 100;
                      handleSlotClick(day, timeSlot, clickY);
                    }}
                  >
                    {/* Render appointments that overlap with this hour */}
                    {overlappingAppointments.map((appointment) => {
                      const spanInfo = getAppointmentSpanInfo(appointment, timeSlot.hour);
                      if (!spanInfo) return null;
                      
                      return (
                        <Box
                          key={appointment.id}
                          position="absolute"
                          top={`${spanInfo.topOffset}%`}
                          left="2px"
                          right="2px"
                          height={`${spanInfo.height}%`}
                          bg={spanInfo.showContent ? bookedSlotBg : 'blue.400'}
                          borderRadius="md"
                          p={spanInfo.showContent ? 2 : 0}
                          zIndex={2}
                          border="1px solid"
                          borderColor={spanInfo.showContent ? "blue.600" : "blue.500"}
                          borderStyle={spanInfo.showContent ? "solid" : "dashed"}
                          borderWidth={spanInfo.showContent ? "1px" : "2px"}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppointment(appointment);
                            onViewOpen();
                          }}
                          _hover={{
                            bg: spanInfo.showContent ? 'blue.600' : 'blue.500',
                            transform: 'scale(1.02)',
                          }}
                          transition="all 0.2s"
                          cursor="pointer"
                        >
                          {spanInfo.showContent && (
                            <VStack spacing={1} align="stretch" h="full" justify="flex-start">
                              <HStack spacing={1} justify="space-between">
                                <Text fontSize="xs" color="blue.100">
                                  {appointment.appointmentType === 'videollamada' ? '💻' : 
                                   appointment.appointmentType === 'visita' ? '🏠' : '🏢'}
                                </Text>
                                <Badge
                                  size="xs"
                                  colorScheme={getStatusColor(appointment.status)}
                                  variant="solid"
                                >
                                  {appointment.status === 'confirmed' ? 'Confirmada' : 
                                   appointment.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                                </Badge>
                              </HStack>
                              <Text
                                fontSize="xs"
                                fontWeight="bold"
                                color="white"
                                noOfLines={1}
                              >
                                {appointment.patientName}
                              </Text>
                              <Text
                                fontSize="xs"
                                color="blue.100"
                                noOfLines={1}
                              >
                                {format(appointment.startTime, 'HH:mm')} - {format(appointment.endTime, 'HH:mm')}
                              </Text>
                            </VStack>
                          )}
                          
                          {/* Continuation indicator for split appointments */}
                          {!spanInfo.showContent && (
                            <Flex
                              align="center"
                              justify="center"
                              h="full"
                              position="relative"
                            >
                              <Box
                                position="absolute"
                                top="50%"
                                left="50%"
                                transform="translate(-50%, -50%)"
                                bg="white"
                                borderRadius="full"
                                p={1}
                                boxShadow="sm"
                              >
                                <Text fontSize="xs" color="blue.600" fontWeight="bold">
                                  ⋯
                                </Text>
                              </Box>
                            </Flex>
                          )}
                        </Box>
                      );
                    })}
                    
                    {/* Empty slot indicator */}
                    {overlappingAppointments.length === 0 && (
                      <Flex align="center" justify="center" h="full" opacity={0.3}>
                        <Plus size={16} color="#3182CE" />
                      </Flex>
                    )}
                  </Box>
                );
              })}
            </React.Fragment>
          ))}
        </Grid>
      </Box>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isCreateOpen}
        onClose={() => {
          onCreateClose();
          setSelectedSlot(null);
        }}
        selectedDate={selectedSlot?.date}
        selectedTime={selectedSlot?.time}
      />

      {/* View Appointment Modal */}
      <ViewAppointmentModal
        isOpen={isViewOpen}
        onClose={() => {
          onViewClose();
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
      />
    </Box>
  );
}