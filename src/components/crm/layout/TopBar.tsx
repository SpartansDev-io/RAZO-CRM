'use client';

import {
  Box,
  Flex,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  HStack,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { Bell, Settings, LogOut, User, Menu as MenuIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDashboardStore } from '@/stores/dashboard.store';

export default function TopBar() {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { toggleSidebar } = useDashboardStore();
  const router = useRouter();

  // Static user data
  const user = {
    firstName: 'Dr. María',
    lastName: 'González',
    role: { name: 'Psicólogo' },
  };

  const handleProfileClick = () => {
    router.push('/crm/profile');
  };

  const logout = () => {
    window.location.href = '/crm/login';
  };
  return (
    <Box
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      px={6}
      py={4}
      shadow="sm"
    >
      <Flex justify="space-between" align="center">
        {/* Left side - Mobile menu button */}
        <IconButton
          aria-label="Open menu"
          icon={<MenuIcon size={20} />}
          variant="ghost"
          display={{ base: 'flex', md: 'none' }}
          onClick={toggleSidebar}
        />

        {/* Center - Title */}
        <Text
          fontSize="xl"
          fontWeight="bold"
          color="primary.600"
          display={{ base: 'none', md: 'block' }}
        >
          Razo Morales & Asociados
        </Text>

        {/* Right side - Notifications and User menu */}
        <HStack spacing={4}>
          {/* Notifications */}
          <Box position="relative">
            <IconButton
              aria-label="Notifications"
              icon={<Bell size={20} />}
              variant="ghost"
              colorScheme="gray"
            />
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              colorScheme="red"
              borderRadius="full"
              fontSize="xs"
              minW="20px"
              h="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              3
            </Badge>
          </Box>

          {/* User Menu */}
          <Menu>
            <MenuButton>
              <HStack spacing={3} cursor="pointer">
                <Avatar
                  size="sm"
                  name={user?.firstName + ' ' + user?.lastName}
                  bg="primary.500"
                />
                <Box display={{ base: 'none', md: 'block' }} textAlign="left">
                  <Text fontSize="sm" fontWeight="medium">
                    {user?.firstName} {user?.lastName}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {user?.role?.name}
                  </Text>
                </Box>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<User size={16} />} onClick={handleProfileClick}>
                Mi Perfil
              </MenuItem>
              <MenuDivider />
              <MenuItem
                icon={<LogOut size={16} />}
                onClick={logout}
                color="red.500"
              >
                Cerrar Sesión
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
}
