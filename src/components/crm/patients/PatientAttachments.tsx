'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Grid,
  Badge,
  Icon,
  IconButton,
  useColorModeValue,
  Tooltip,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Plus,
  Search,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  Paperclip,
  Calendar,
  User,
  MoreVertical,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

interface Attachment {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadDate: Date;
  uploadedBy: string;
  category: 'medical' | 'consent' | 'report' | 'other';
}

interface PatientAttachmentsProps {
  patientId: string;
}

export default function PatientAttachments({ patientId }: PatientAttachmentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.100', 'gray.600');

  const mockAttachments: Attachment[] = [
    {
      id: '1',
      title: 'Informe Psicológico Inicial',
      description: 'Evaluación completa realizada en la primera sesión',
      fileName: 'informe_inicial_maria_gonzalez.pdf',
      fileType: 'PDF',
      fileSize: '2.4 MB',
      uploadDate: new Date('2023-08-20'),
      uploadedBy: 'Dr. Pérez',
      category: 'medical',
    },
    {
      id: '2',
      title: 'Consentimiento Informado',
      description: 'Documento firmado de consentimiento para el tratamiento',
      fileName: 'consentimiento_maria_gonzalez.pdf',
      fileType: 'PDF',
      fileSize: '856 KB',
      uploadDate: new Date('2023-08-15'),
      uploadedBy: 'Recepción',
      category: 'consent',
    },
    {
      id: '3',
      title: 'Resultados Test de Ansiedad',
      description: 'Resultados del test BAI aplicado en sesión 5',
      fileName: 'test_ansiedad_sesion5.xlsx',
      fileType: 'XLSX',
      fileSize: '124 KB',
      uploadDate: new Date('2023-10-10'),
      uploadedBy: 'Dr. Pérez',
      category: 'report',
    },
    {
      id: '4',
      title: 'Plan de Tratamiento',
      description: 'Plan terapéutico detallado para los próximos 6 meses',
      fileName: 'plan_tratamiento_2024.pdf',
      fileType: 'PDF',
      fileSize: '1.8 MB',
      uploadDate: new Date('2024-01-05'),
      uploadedBy: 'Dr. Pérez',
      category: 'medical',
    },
    {
      id: '5',
      title: 'Registros de Actividad',
      description: 'Hojas de registro completadas por el paciente',
      fileName: 'registros_actividad_diciembre.pdf',
      fileType: 'PDF',
      fileSize: '3.2 MB',
      uploadDate: new Date('2023-12-28'),
      uploadedBy: 'María González',
      category: 'other',
    },
    {
      id: '6',
      title: 'Informe de Progreso Trimestral',
      description: 'Evaluación del progreso del paciente en el último trimestre',
      fileName: 'progreso_trimestral_q4_2023.pdf',
      fileType: 'PDF',
      fileSize: '1.5 MB',
      uploadDate: new Date('2023-12-15'),
      uploadedBy: 'Dr. Pérez',
      category: 'report',
    },
  ];

  const getFileIcon = (fileType: string) => {
    switch (fileType.toUpperCase()) {
      case 'PDF':
        return FileText;
      case 'XLSX':
      case 'XLS':
      case 'CSV':
        return FileSpreadsheet;
      case 'JPG':
      case 'JPEG':
      case 'PNG':
      case 'GIF':
        return ImageIcon;
      default:
        return File;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medical':
        return 'blue';
      case 'consent':
        return 'green';
      case 'report':
        return 'purple';
      case 'other':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'medical':
        return 'Médico';
      case 'consent':
        return 'Consentimiento';
      case 'report':
        return 'Informe';
      case 'other':
        return 'Otro';
      default:
        return 'Sin categoría';
    }
  };

  const filteredAttachments = mockAttachments.filter((attachment) => {
    const matchesSearch =
      attachment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attachment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attachment.fileName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || attachment.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDownload = (attachment: Attachment) => {
    console.log('Descargar archivo:', attachment.fileName);
  };

  const handleView = (attachment: Attachment) => {
    console.log('Ver archivo:', attachment.fileName);
  };

  const handleDelete = (attachment: Attachment) => {
    console.log('Eliminar archivo:', attachment.id);
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between" flexWrap="wrap" gap={4}>
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            Archivos Adjuntos
          </Text>
          <Text fontSize="sm" color="gray.600">
            {filteredAttachments.length} {filteredAttachments.length === 1 ? 'archivo' : 'archivos'}
          </Text>
        </Box>
        <Button
          leftIcon={<Plus size={16} />}
          colorScheme="blue"
          size="sm"
        >
          Subir Archivo
        </Button>
      </HStack>

      <HStack spacing={4} flexWrap="wrap">
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <Search size={18} color="gray" />
          </InputLeftElement>
          <Input
            placeholder="Buscar archivos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg={bg}
          />
        </InputGroup>

        <HStack spacing={2}>
          <Button
            size="sm"
            variant={filterCategory === 'all' ? 'solid' : 'outline'}
            colorScheme={filterCategory === 'all' ? 'blue' : 'gray'}
            onClick={() => setFilterCategory('all')}
          >
            Todos
          </Button>
          <Button
            size="sm"
            variant={filterCategory === 'medical' ? 'solid' : 'outline'}
            colorScheme={filterCategory === 'medical' ? 'blue' : 'gray'}
            onClick={() => setFilterCategory('medical')}
          >
            Médicos
          </Button>
          <Button
            size="sm"
            variant={filterCategory === 'consent' ? 'solid' : 'outline'}
            colorScheme={filterCategory === 'consent' ? 'green' : 'gray'}
            onClick={() => setFilterCategory('consent')}
          >
            Consentimientos
          </Button>
          <Button
            size="sm"
            variant={filterCategory === 'report' ? 'solid' : 'outline'}
            colorScheme={filterCategory === 'report' ? 'purple' : 'gray'}
            onClick={() => setFilterCategory('report')}
          >
            Informes
          </Button>
        </HStack>
      </HStack>

      {filteredAttachments.length === 0 ? (
        <Card bg={cardBg}>
          <CardBody py={12}>
            <VStack spacing={4}>
              <Icon as={Paperclip} boxSize={12} color="gray.400" />
              <Text fontSize="lg" color="gray.500" textAlign="center">
                No se encontraron archivos
              </Text>
              <Text fontSize="sm" color="gray.400" textAlign="center">
                {searchTerm
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Aún no hay archivos adjuntos para este paciente'
                }
              </Text>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
          gap={4}
        >
          {filteredAttachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.fileType);

            return (
              <Card
                key={attachment.id}
                bg={bg}
                borderWidth="1px"
                borderColor={borderColor}
                _hover={{
                  shadow: 'md',
                  borderColor: 'blue.300',
                }}
                transition="all 0.2s"
              >
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between" align="start">
                      <HStack spacing={3}>
                        <Box
                          p={2}
                          borderRadius="md"
                          bg={`${getCategoryColor(attachment.category)}.50`}
                        >
                          <Icon
                            as={FileIcon}
                            boxSize={6}
                            color={`${getCategoryColor(attachment.category)}.500`}
                          />
                        </Box>
                        <Badge
                          colorScheme={getCategoryColor(attachment.category)}
                          fontSize="xs"
                        >
                          {getCategoryText(attachment.category)}
                        </Badge>
                      </HStack>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<MoreVertical size={16} />}
                          variant="ghost"
                          size="sm"
                          aria-label="Más opciones"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<Eye size={16} />}
                            onClick={() => handleView(attachment)}
                          >
                            Ver
                          </MenuItem>
                          <MenuItem
                            icon={<Download size={16} />}
                            onClick={() => handleDownload(attachment)}
                          >
                            Descargar
                          </MenuItem>
                          <MenuItem
                            icon={<Trash2 size={16} />}
                            onClick={() => handleDelete(attachment)}
                            color="red.500"
                          >
                            Eliminar
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>

                    <Box>
                      <Text
                        fontSize="md"
                        fontWeight="semibold"
                        color="gray.800"
                        mb={1}
                        noOfLines={2}
                      >
                        {attachment.title}
                      </Text>
                      {attachment.description && (
                        <Text fontSize="sm" color="gray.600" noOfLines={2}>
                          {attachment.description}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        {attachment.fileName}
                      </Text>
                      <HStack spacing={3} fontSize="xs" color="gray.500">
                        <Text>{attachment.fileType}</Text>
                        <Text>•</Text>
                        <Text>{attachment.fileSize}</Text>
                      </HStack>
                    </Box>

                    <HStack justify="space-between" pt={2} borderTop="1px" borderColor={borderColor}>
                      <HStack spacing={1} fontSize="xs" color="gray.500">
                        <Calendar size={12} />
                        <Text>
                          {format(attachment.uploadDate, 'dd MMM yyyy', { locale: es })}
                        </Text>
                      </HStack>
                      <HStack spacing={1} fontSize="xs" color="gray.500">
                        <User size={12} />
                        <Text noOfLines={1}>{attachment.uploadedBy}</Text>
                      </HStack>
                    </HStack>

                    <HStack spacing={2}>
                      <Tooltip label="Ver archivo">
                        <IconButton
                          icon={<Eye size={16} />}
                          aria-label="Ver"
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleView(attachment)}
                          flex="1"
                        />
                      </Tooltip>
                      <Tooltip label="Descargar archivo">
                        <IconButton
                          icon={<Download size={16} />}
                          aria-label="Descargar"
                          size="sm"
                          colorScheme="green"
                          onClick={() => handleDownload(attachment)}
                          flex="1"
                        />
                      </Tooltip>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            );
          })}
        </Grid>
      )}
    </VStack>
  );
}
