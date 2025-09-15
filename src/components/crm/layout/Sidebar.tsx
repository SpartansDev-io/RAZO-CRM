'use client';

import {
  Box,
  VStack,
  Text,
  Icon,
  Flex,
  useColorModeValue,
  HStack,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import {
  Home,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useDashboardStore } from '@/stores/dashboard.store';

interface NavItemProps {
  icon: any;
  children: string;
  href?: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
}

function NavItem({ 
  icon, 
  children, 
  href, 
  isActive = false, 
  isCollapsed = false,
  onClick 
}: NavItemProps) {
  const router = useRouter();
  const activeBg = useColorModeValue('primary.50', 'primary.900');
  const activeColor = useColorModeValue('primary.600', 'primary.200');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  if (isCollapsed) {
    return (
      <Tooltip label={children} placement="right" hasArrow>
        <Box
          w="full"
          bg={isActive ? activeBg : 'transparent'}
          borderRadius="lg"
          cursor="pointer"
          _hover={{ bg: isActive ? activeBg : hoverBg }}
          transition="all 0.2s"
          onClick={handleClick}
        >
          <Flex
            align="center"
            justify="center"
            p={3}
            color={isActive ? activeColor : 'gray.600'}
          >
            <Icon as={icon} boxSize={5} />
          </Flex>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box
      w="full"
      bg={isActive ? activeBg : 'transparent'}
      borderRadius="lg"
      cursor="pointer"
      _hover={{ bg: isActive ? activeBg : hoverBg }}
      transition="all 0.2s"
      onClick={handleClick}
    >
      <Flex
        align="center"
        p={3}
        color={isActive ? activeColor : 'gray.600'}
        fontWeight={isActive ? 'semibold' : 'medium'}
      >
        <Icon as={icon} boxSize={5} mr={3} />
        <Text flex="1" fontSize="sm">
          {children}
        </Text>
      </Flex>
    </Box>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useDashboardStore();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const navigation = [
    { name: 'Dashboard', icon: Home, href: '/crm/dashboard' },
    { name: 'Pacientes', icon: Users, href: '/crm/patients' },
    { name: 'Calendario', icon: Calendar, href: '/crm/calendar' },
    { name: 'Historiales', icon: FileText, href: '/crm/records' },
    { name: 'Reportes', icon: BarChart3, href: '/crm/reports' },
    { name: 'Configuración', icon: Settings, href: '/crm/settings' },
  ];

  return (
    <Box
      bg={bg}
      borderRight="1px"
      borderColor={borderColor}
      w={isSidebarOpen ? "250px" : "70px"}
      h="full"
      display="block"
      position={{ base: 'fixed', md: 'relative' }}
      zIndex={{ base: 20, md: 'auto' }}
      shadow={{ base: 'lg', md: 'none' }}
      transition="width 0.3s ease"
    >
      <VStack spacing={0} align="stretch" h="full">
        {/* Logo */}
        <Box p={6} borderBottom="1px" borderColor={borderColor}>
          {isSidebarOpen ? (
            <HStack spacing={3}>
              <Brain size={32} color="#2196F3" />
              <Box>
                <Text fontSize="lg" fontWeight="bold" color="primary.600">
                  Psychology
                </Text>
                <Text fontSize="sm" color="gray.500">
                  CRM
                </Text>
              </Box>
            </HStack>
          ) : (
            <Flex justify="center">
              <Brain size={32} color="#2196F3" />
            </Flex>
          )}
        </Box>

        {/* Toggle Button - Desktop only */}
        <Box px={4} py={2} display={{ base: 'none', md: 'block' }}>
          <IconButton
            aria-label={isSidebarOpen ? "Colapsar sidebar" : "Expandir sidebar"}
            icon={isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            size="sm"
            variant="ghost"
            w="full"
            onClick={toggleSidebar}
            _hover={{ bg: 'gray.100' }}
          />
        </Box>

        {/* Navigation */}
        <Box flex="1" p={4}>
          <VStack spacing={2} align="stretch">
            {navigation.map((item) => (
              <NavItem
                key={item.name}
                icon={item.icon}
                href={item.href}
                isActive={pathname === item.href}
                isCollapsed={!isSidebarOpen}
              >
                {item.name}
              </NavItem>
            ))}
          </VStack>
        </Box>

        {/* Footer */}
        {isSidebarOpen && (
          <Box p={4} borderTop="1px" borderColor={borderColor}>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              © 2024 Razo Morales & Asociados
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}