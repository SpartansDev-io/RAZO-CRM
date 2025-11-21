# Psychology CRM 🧠

Un sistema de gestión integral para consultorios de psicología, desarrollado con Next.js 14, TypeScript y Chakra UI.

## 🌟 Características Principales

### 👥 Gestión de Pacientes

- **Listado completo** con filtros avanzados (búsqueda, estado, empresa, tipo de terapia)
- **Perfiles detallados** con información personal y de contacto
- **Historial clínico** completo con registros de sesiones
- **Gestión de empresas** para pacientes corporativos

### 📅 Sistema de Citas

- **Calendario semanal** interactivo con vista por horas
- **Tipos de cita**: Presencial, Videollamada, Visita domiciliaria
- **Estados**: Confirmada, Pendiente, Cancelada
- **Integración con Google Calendar** (simulada)
- **Gestión de enlaces** de videollamada

### 📊 Dashboard Analítico

- **Estadísticas en tiempo real** (pacientes activos, citas del día, ingresos)
- **Gráficos de rendimiento** y métricas clave
- **Citas recientes** y pacientes activos
- **Acciones rápidas** para tareas comunes

### 🔐 Sistema de Autenticación

- **Login seguro** con JWT
- **Roles de usuario** (Psicólogo, Administrador)
- **Sesiones persistentes** con Zustand
- **Protección de rutas** automática

### 📱 Diseño Responsivo

- **Sidebar colapsible** con modo iconos
- **Adaptable** a móviles y tablets
- **Interfaz moderna** con Chakra UI
- **Tema consistente** en toda la aplicación

## 🚀 Tecnologías Utilizadas

### Frontend

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Chakra UI** - Biblioteca de componentes
- **Zustand** - Gestión de estado global
- **React Hook Form** - Manejo de formularios
- **Date-fns** - Manipulación de fechas

### Backend

- **Next.js API Routes** - Endpoints del servidor
- **Prisma ORM** - Base de datos y migraciones
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación con tokens
- **bcryptjs** - Encriptación de contraseñas

### Herramientas de Desarrollo

- **ESLint** - Linting de código
- **Tailwind CSS** - Estilos utilitarios
- **Lucide React** - Iconografía moderna

## 📦 Instalación

### Prerrequisitos

- Node.js 18.17.0 o superior
- PostgreSQL 12 o superior
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/psychology-crm.git
cd psychology-crm
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/psychology_crm"
JWT_SECRET="tu-clave-secreta-jwt-muy-segura"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Configurar la base de datos**

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma db push

# Poblar con datos iniciales (opcional)
npx prisma db seed
```

5. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   ├── crm/               # Páginas del CRM
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── auth/             # Componentes de autenticación
│   ├── crm/              # Componentes del CRM
│   ├── shared/           # Componentes compartidos
│   └── ui/               # Componentes de UI base
├── modules/              # Módulos de dominio
│   ├── auth/             # Módulo de autenticación
│   └── shared/           # Tipos y utilidades compartidas
├── stores/               # Stores de Zustand
└── lib/                  # Utilidades y configuraciones
```

## 🎯 Funcionalidades Detalladas

### Dashboard Principal

- **Métricas clave**: Pacientes activos, citas del día, ingresos mensuales
- **Gráficos interactivos** con Recharts
- **Lista de citas** del día actual
- **Pacientes recientes** con información de contacto
- **Acciones rápidas** para crear citas y pacientes

### Gestión de Pacientes

- **Tabla paginada** con 10 registros por página
- **Filtros múltiples**: texto, estado, empresa, tipo de terapia
- **Modal de vista rápida** con información básica
- **Perfil completo** con pestañas organizadas
- **Historial clínico** detallado por sesiones

### Calendario de Citas

- **Vista semanal** de 7:00 AM a 8:00 PM
- **Navegación** por semanas con botones
- **Citas visuales** con colores por estado
- **Modal de creación** con formulario completo
- **Modal de visualización** con todos los detalles
- **Soporte para videollamadas** con enlaces

### Perfil de Paciente

- **Información personal** completa
- **Datos de contacto** y emergencia
- **Estadísticas** de sesiones y progreso
- **Historial de citas** futuras y pasadas
- **Registros clínicos** con notas detalladas
- **Acciones rápidas** para nueva cita/sesión

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting con ESLint

# Base de datos
npx prisma studio    # Interfaz visual de la BD
npx prisma generate  # Generar cliente
npx prisma db push   # Aplicar cambios al esquema
```

## 🎨 Personalización

### Tema de Chakra UI

El tema se puede personalizar en `src/lib/theme.ts`:

```typescript
import { extendTheme } from '@chakra-ui/react';

export const system = {
  theme: extendTheme({
    colors: {
      primary: {
        50: '#e3f2fd',
        500: '#2196f3',
        // ... más colores
      },
    },
  }),
};
```

### Colores Principales

- **Primario**: Azul (#2196F3) - Navegación y acciones principales
- **Secundario**: Verde (#38A169) - Estados positivos y confirmaciones
- **Advertencia**: Amarillo (#D69E2E) - Estados pendientes
- **Error**: Rojo (#E53E3E) - Estados de error y eliminación

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px - Sidebar overlay, navegación simplificada
- **Tablet**: 768px - 1024px - Layout adaptativo
- **Desktop**: > 1024px - Sidebar colapsible, vista completa

### Características Móviles

- **Sidebar overlay** con fondo oscuro
- **Tablas responsivas** con scroll horizontal
- **Botones táctiles** optimizados
- **Formularios adaptados** para pantallas pequeñas

## 🔒 Seguridad

### Autenticación

- **JWT tokens** con expiración de 24 horas
- **Contraseñas encriptadas** con bcryptjs (12 rounds)
- **Validación de sesión** en cada request protegido
- **Logout automático** al expirar el token

### Protección de Rutas

- **AuthLayout** wrapper para rutas protegidas
- **Redirección automática** a login si no autenticado
- **Verificación de roles** (preparado para expansión)

## 🚀 Despliegue

### Variables de Entorno de Producción

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="clave-super-secreta-de-produccion"
NEXTAUTH_URL="https://tu-dominio.com"
NODE_ENV="production"
```

### Comandos de Despliegue

```bash
# Build de producción
npm run build

# Iniciar servidor
npm start

# Aplicar migraciones en producción
npx prisma db push
```

## 🤝 Contribución

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abre** un Pull Request

### Estándares de Código

- **TypeScript** estricto habilitado
- **ESLint** configurado con reglas de Next.js
- **Componentes funcionales** con hooks
- **Nombres descriptivos** para variables y funciones
- **Comentarios** en funciones complejas

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Tu Nombre**

- GitHub: SpartansDev.io

## 🙏 Agradecimientos

- **Chakra UI** por los componentes de interfaz
- **Prisma** por el excelente ORM
- **Next.js** por el framework robusto
- **Lucide** por los iconos modernos

---
