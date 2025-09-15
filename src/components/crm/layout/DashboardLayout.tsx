'use client';

import { Box, useBreakpointValue, IconButton } from '@chakra-ui/react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useDashboardStore } from '@/stores/dashboard.store';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isSidebarOpen, toggleSidebar } = useDashboardStore();
  const sidebarWidth = useBreakpointValue({ base: 0, md: isSidebarOpen ? 250 : 70 });

  return (
    <Box minH="100vh" bg="gray.50">
      <Box display="flex" h="100vh">
        {/* Sidebar */}
        <Box
          width={{ base: isSidebarOpen ? "250px" : "0", md: isSidebarOpen ? "250px" : "70px" }}
          transition="width 0.3s ease"
          overflow="hidden"
        >
          <Sidebar />
        </Box>

        {/* Main Content */}
        <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
          {/* Top Bar */}
          <TopBar />

          {/* Page Content */}
          <Box flex="1" overflow="auto" p={6}>
            {children}
          </Box>
        </Box>
      </Box>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          w="full"
          h="full"
          bg="blackAlpha.600"
          zIndex={20}
          display={{ base: 'block', md: 'none' }}
          onClick={toggleSidebar}
        />
      )}
    </Box>
  );
}