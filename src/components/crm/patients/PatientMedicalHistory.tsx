'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Button,
  Badge,
  Divider,
  useColorModeValue,
  Center,
  Spinner,
  useDisclosure,
  Grid,
  GridItem,
  Textarea,
  IconButton,
} from '@chakra-ui/react';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  User,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import NewSessionModal from './NewSessionModal';

interface MedicalRecord {
  id: string;
  sessionDate: Date;
  sessionType: string;
  duration: number; // in minutes
  therapistName: string;
  sessionNotes: string;
  objectives: string[];
  techniques: string[];
  homework?: string;
  nextSessionPlan?: string;
  patientMood: 'excellent' | 'good' | 'neutral' | 'poor' | 'very_poor';
  progress: 'significant' | 'moderate' | 'minimal' | 'none' | 'regression';
  attachments?: string[];
  paymentInfo?: {
    sessionCost: number;
    paidAmount: number;
    paymentMethod?: 'transfer' | 'cash' | 'none';
    paymentStatus: 'paid' | 'partial' | 'pending';
    paymentDate?: Date;
    paymentNotes?: string;
  };
}

interface PatientMedicalHistoryProps {
  patientId: string;
}

// Mock medical records data
const getMockMedicalRecords = (patientId: string): MedicalRecord[] => {
  return [
    {
      id: '1',
      sessionDate: new Date('2024-01-15T11:00:00'),
      sessionType: 'Terapia Individual',
      duration: 60,
      therapistName: 'Dr. María González',
      sessionNotes: 'La paciente mostró una actitud muy positiva durante la sesión. Continuamos trabajando en técnicas de manejo de ansiedad. Se observa una mejora significativa en la aplicación de técnicas de respiración profunda. La paciente reporta menos episodios de ansiedad durante la semana.',
      objectives: [
        'Reducir niveles de ansiedad generalizada',
        'Mejorar técnicas de relajación',
        'Fortalecer autoestima'
      ],
      techniques: [
        'Respiración diafragmática',
        'Reestructuración cognitiva',
        'Mindfulness'
      ],
      homework: 'Practicar ejercicios de respiración 10 minutos diarios. Llevar registro de pensamientos automáticos negativos.',
      nextSessionPlan: 'Revisar registro de pensamientos. Introducir técnicas de exposición gradual.',
      patientMood: 'good',
      progress: 'moderate',
      paymentInfo: {
        sessionCost: 1500,
        paidAmount: 1500,
        paymentMethod: 'transfer',
        paymentStatus: 'paid',
        paymentDate: new Date('2024-01-15T12:30:00'),
        paymentNotes: 'Transferencia REF: 12345',
      },
    },
    {
      id: '2',
      sessionDate: new Date('2024-01-08T10:30:00'),
      sessionType: 'Evaluación de Seguimiento',
      duration: 90,
      therapistName: 'Dr. María González',
      sessionNotes: 'Evaluación mensual del progreso terapéutico. La paciente ha mostrado avances consistentes en el manejo de situaciones estresantes. Se aplicaron escalas de evaluación de ansiedad y depresión. Los resultados muestran una reducción del 40% en los niveles de ansiedad comparado con la evaluación inicial.',
      objectives: [
        'Evaluar progreso terapéutico',
        'Ajustar plan de tratamiento',
        'Establecer nuevas metas'
      ],
      techniques: [
        'Entrevista clínica estructurada',
        'Escalas de evaluación',
        'Análisis funcional'
      ],
      homework: 'Completar cuestionario de seguimiento semanal. Continuar con técnicas aprendidas.',
      nextSessionPlan: 'Trabajar en situaciones específicas de exposición social.',
      patientMood: 'good',
      progress: 'significant',
      paymentInfo: {
        sessionCost: 1500,
        paidAmount: 800,
        paymentMethod: 'cash',
        paymentStatus: 'partial',
        paymentDate: new Date('2024-01-08T11:00:00'),
        paymentNotes: 'Pago parcial en efectivo',
      },
    },
    {
      id: '3',
      sessionDate: new Date('2023-12-20T16:00:00'),
      sessionType: 'Terapia Individual',
      duration: 60,
      therapistName: 'Dr. María González',
      sessionNotes: 'Primera sesión del mes. La paciente llegó con mayor energía y motivación. Trabajamos en identificar patrones de pensamiento negativos y su impacto en el estado emocional. Se establecieron nuevos objetivos terapéuticos para el próximo mes.',
      objectives: [
        'Identificar patrones de pensamiento',
        'Establecer rutinas saludables',
        'Mejorar comunicación interpersonal'
      ],
      techniques: [
        'Registro de pensamientos',
        'Técnicas de comunicación asertiva',
        'Planificación de actividades'
      ],
      homework: 'Implementar rutina matutina. Practicar comunicación asertiva en situaciones cotidianas.',
      nextSessionPlan: 'Revisar implementación de rutinas. Trabajar en habilidades sociales.',
      patientMood: 'excellent',
      progress: 'moderate',
      paymentInfo: {
        sessionCost: 1500,
        paidAmount: 0,
        paymentMethod: 'none',
        paymentStatus: 'pending',
      },
    },
    {
      id: '4',
      sessionDate: new Date('2023-12-13T14:30:00'),
      sessionType: 'Terapia Individual',
      duration: 60,
      therapistName: 'Dr. María González',
      sessionNotes: 'Sesión enfocada en el procesamiento de eventos estresantes recientes en el trabajo. La paciente mostró buena capacidad de insight y disposición para aplicar las estrategias aprendidas. Se trabajó intensivamente en técnicas de afrontamiento.',
      objectives: [
        'Procesar eventos estresantes',
        'Desarrollar estrategias de afrontamiento',
        'Fortalecer resiliencia'
      ],
      techniques: [
        'Procesamiento emocional',
        'Técnicas de afrontamiento',
        'Reevaluación cognitiva'
      ],
      homework: 'Aplicar técnicas de afrontamiento en situaciones laborales. Mantener diario emocional.',
      nextSessionPlan: 'Evaluar efectividad de estrategias aplicadas. Reforzar técnicas exitosas.',
      patientMood: 'neutral',
      progress: 'moderate',
      paymentInfo: {
        sessionCost: 1500,
        paidAmount: 1500,
        paymentMethod: 'transfer',
        paymentStatus: 'paid',
        paymentDate: new Date('2024-01-13T15:00:00'),
      },
    },
  ];
};

export default function PatientMedicalHistory({ patientId }: PatientMedicalHistoryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  const medicalRecords = getMockMedicalRecords(patientId);

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'neutral': return 'yellow';
      case 'poor': return 'orange';
      case 'very_poor': return 'red';
      default: return 'gray';
    }
  };

  const getMoodText = (mood: string) => {
    switch (mood) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bueno';
      case 'neutral': return 'Neutral';
      case 'poor': return 'Malo';
      case 'very_poor': return 'Muy Malo';
      default: return 'No especificado';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'significant': return 'green';
      case 'moderate': return 'blue';
      case 'minimal': return 'yellow';
      case 'none': return 'gray';
      case 'regression': return 'red';
      default: return 'gray';
    }
  };

  const getProgressText = (progress: string) => {
    switch (progress) {
      case 'significant': return 'Significativo';
      case 'moderate': return 'Moderado';
      case 'minimal': return 'Mínimo';
      case 'none': return 'Sin cambios';
      case 'regression': return 'Retroceso';
      default: return 'No evaluado';
    }
  };

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="lg" color="blue.500" />
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <HStack spacing={2}>
          <FileText size={20} color="#3182CE" />
          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
            Historial Clínico ({medicalRecords.length} registros)
          </Text>
        </HStack>
        <Button
          leftIcon={<Plus size={16} />}
          colorScheme="green"
          size="sm"
          onClick={onOpen}
        >
          Nueva Sesión
        </Button>
      </HStack>

      {/* Medical Records List */}
      {medicalRecords.length === 0 ? (
        <Card bg={cardBg}>
          <CardBody>
            <Center py={10}>
              <VStack spacing={4}>
                <FileText size={64} color="#CBD5E0" />
                <Text color="gray.500" fontSize="lg">
                  No hay registros clínicos
                </Text>
                <Text color="gray.400" fontSize="sm" textAlign="center">
                  Comienza agregando el primer registro de sesión
                </Text>
                <Button
                  leftIcon={<Plus size={16} />}
                  colorScheme="green"
                  onClick={onOpen}
                >
                  Crear Primer Registro
                </Button>
              </VStack>
            </Center>
          </CardBody>
        </Card>
      ) : (
        <VStack spacing={4} align="stretch">
          {medicalRecords.map((record) => (
            <Card key={record.id} bg={bg} shadow="md" borderRadius="lg">
              <CardBody p={6}>
                <VStack spacing={4} align="stretch">
                  {/* Header */}
                  <HStack justify="space-between" align="center">
                    <HStack spacing={4}>
                      <VStack spacing={1} align="start">
                        <HStack spacing={2}>
                          <Calendar size={16} color="#3182CE" />
                          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                            {format(record.sessionDate, 'dd MMMM yyyy', { locale: es })}
                          </Text>
                        </HStack>
                        <HStack spacing={4}>
                          <HStack spacing={1}>
                            <Clock size={14} color="#718096" />
                            <Text fontSize="sm" color="gray.600">
                              {format(record.sessionDate, 'HH:mm')} ({record.duration} min)
                            </Text>
                          </HStack>
                          <HStack spacing={1}>
                            <User size={14} color="#718096" />
                            <Text fontSize="sm" color="gray.600">
                              {record.therapistName}
                            </Text>
                          </HStack>
                        </HStack>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={2}>
                      <Badge
                        colorScheme={getMoodColor(record.patientMood)}
                        variant="subtle"
                        px={3}
                        py={1}
                      >
                        Estado: {getMoodText(record.patientMood)}
                      </Badge>
                      <Badge
                        colorScheme={getProgressColor(record.progress)}
                        variant="solid"
                        px={3}
                        py={1}
                      >
                        Progreso: {getProgressText(record.progress)}
                      </Badge>
                    </HStack>
                  </HStack>

                  <Divider />

                  {/* Session Type */}
                  <Box>
                    <Text fontSize="md" fontWeight="medium" color="blue.600">
                      {record.sessionType}
                    </Text>
                  </Box>

                  {/* Session Notes */}
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                      Notas de la Sesión:
                    </Text>
                    <Text fontSize="sm" color="gray.600" lineHeight="1.6">
                      {record.sessionNotes}
                    </Text>
                  </Box>

                  {/* Objectives and Techniques */}
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                        Objetivos Trabajados:
                      </Text>
                      <VStack spacing={1} align="stretch">
                        {record.objectives.map((objective, index) => (
                          <Text key={index} fontSize="xs" color="gray.600">
                            • {objective}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                        Técnicas Utilizadas:
                      </Text>
                      <VStack spacing={1} align="stretch">
                        {record.techniques.map((technique, index) => (
                          <Text key={index} fontSize="xs" color="gray.600">
                            • {technique}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                  </Grid>

                  {/* Homework and Next Session Plan */}
                  {(record.homework || record.nextSessionPlan) && (
                    <>
                      <Divider />
                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                        {record.homework && (
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                              Tareas Asignadas:
                            </Text>
                            <Text fontSize="xs" color="gray.600" lineHeight="1.5">
                              {record.homework}
                            </Text>
                          </Box>
                        )}

                        {record.nextSessionPlan && (
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                              Plan Próxima Sesión:
                            </Text>
                            <Text fontSize="xs" color="gray.600" lineHeight="1.5">
                              {record.nextSessionPlan}
                            </Text>
                          </Box>
                        )}
                      </Grid>
                    </>
                  )}

                  {/* Payment Information */}
                  {record.paymentInfo && (
                    <>
                      <Divider />
                      <Box
                        p={3}
                        borderRadius="md"
                        bg={
                          record.paymentInfo.paymentStatus === 'paid'
                            ? 'green.50'
                            : record.paymentInfo.paymentStatus === 'partial'
                            ? 'orange.50'
                            : 'red.50'
                        }
                        borderWidth="1px"
                        borderColor={
                          record.paymentInfo.paymentStatus === 'paid'
                            ? 'green.200'
                            : record.paymentInfo.paymentStatus === 'partial'
                            ? 'orange.200'
                            : 'red.200'
                        }
                      >
                        <VStack spacing={2} align="stretch">
                          <HStack justify="space-between">
                            <HStack spacing={2}>
                              <DollarSign size={16} color={
                                record.paymentInfo.paymentStatus === 'paid'
                                  ? '#38A169'
                                  : record.paymentInfo.paymentStatus === 'partial'
                                  ? '#DD6B20'
                                  : '#E53E3E'
                              } />
                              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                Información de Pago
                              </Text>
                            </HStack>
                            <Badge
                              colorScheme={
                                record.paymentInfo.paymentStatus === 'paid'
                                  ? 'green'
                                  : record.paymentInfo.paymentStatus === 'partial'
                                  ? 'orange'
                                  : 'red'
                              }
                              variant="solid"
                              fontSize="xs"
                            >
                              {record.paymentInfo.paymentStatus === 'paid' && (
                                <HStack spacing={1}>
                                  <CheckCircle size={12} />
                                  <Text>Pagado</Text>
                                </HStack>
                              )}
                              {record.paymentInfo.paymentStatus === 'partial' && (
                                <HStack spacing={1}>
                                  <AlertCircle size={12} />
                                  <Text>Pago Parcial</Text>
                                </HStack>
                              )}
                              {record.paymentInfo.paymentStatus === 'pending' && (
                                <HStack spacing={1}>
                                  <AlertCircle size={12} />
                                  <Text>Pendiente</Text>
                                </HStack>
                              )}
                            </Badge>
                          </HStack>

                          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={3} fontSize="xs">
                            <HStack justify="space-between">
                              <Text color="gray.600">Costo de sesión:</Text>
                              <Text fontWeight="bold" color="gray.800">
                                ${record.paymentInfo.sessionCost.toLocaleString()} MXN
                              </Text>
                            </HStack>

                            <HStack justify="space-between">
                              <Text color="gray.600">Monto pagado:</Text>
                              <Text
                                fontWeight="bold"
                                color={
                                  record.paymentInfo.paymentStatus === 'paid'
                                    ? 'green.600'
                                    : record.paymentInfo.paymentStatus === 'partial'
                                    ? 'orange.600'
                                    : 'gray.600'
                                }
                              >
                                ${record.paymentInfo.paidAmount.toLocaleString()} MXN
                              </Text>
                            </HStack>

                            {record.paymentInfo.paymentStatus !== 'paid' && (
                              <HStack justify="space-between">
                                <Text color="gray.600">Adeudo:</Text>
                                <Text fontWeight="bold" color="red.600">
                                  ${(record.paymentInfo.sessionCost - record.paymentInfo.paidAmount).toLocaleString()} MXN
                                </Text>
                              </HStack>
                            )}
                          </Grid>

                          {record.paymentInfo.paymentMethod && record.paymentInfo.paymentMethod !== 'none' && (
                            <HStack spacing={2} fontSize="xs">
                              <Text color="gray.600">Método:</Text>
                              <Badge colorScheme="blue" variant="subtle">
                                {record.paymentInfo.paymentMethod === 'transfer' ? 'Transferencia' : 'Efectivo'}
                              </Badge>
                              {record.paymentInfo.paymentDate && (
                                <>
                                  <Text color="gray.600">•</Text>
                                  <Text color="gray.600">
                                    Pagado: {format(record.paymentInfo.paymentDate, 'dd/MM/yyyy HH:mm', { locale: es })}
                                  </Text>
                                </>
                              )}
                            </HStack>
                          )}

                          {record.paymentInfo.paymentNotes && (
                            <HStack spacing={2} fontSize="xs">
                              <Text color="gray.600">Nota:</Text>
                              <Text color="gray.700" fontStyle="italic">
                                {record.paymentInfo.paymentNotes}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </Box>
                    </>
                  )}

                  {/* Actions */}
                  <HStack spacing={2} justify="flex-end" pt={2}>
                    <IconButton
                      aria-label="Ver detalles"
                      icon={<Eye size={14} />}
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                    />
                    <IconButton
                      aria-label="Editar registro"
                      icon={<Edit size={14} />}
                      size="sm"
                      variant="outline"
                      colorScheme="green"
                    />
                    <IconButton
                      aria-label="Eliminar registro"
                      icon={<Trash2 size={14} />}
                      size="sm"
                      variant="outline"
                      colorScheme="red"
                    />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}

      {/* New Session Modal */}
      <NewSessionModal
        isOpen={isOpen}
        onClose={onClose}
        patient={{ id: patientId, name: 'Paciente' }}
      />
    </VStack>
  );
}