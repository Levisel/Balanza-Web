export interface AppView {
  key: string; // Debe coincidir con View_Name del backend
  path: string;
  name: string;
  icon: string;
  section: string;
}

export const APP_VIEWS: AppView[] = [
  // Gestión de Prácticas
 { key: 'RegistroVirtual', path: '/RegistroVirtual', name: 'Registro Virtual (Estudiante)', icon: 'pi pi-video', section: 'General' },
  { key: 'AlertasView', path: '/AlertasView', name: 'Alertas', icon: 'pi pi-bell', section: 'General' },
  { key: 'ResumenSemanalEstudiante', path: '/ResumenSemanalEstudiante', name: 'Seguimiento Horas (Estudiante)', icon: 'pi pi-book', section: 'General' },
  { key: 'VistaHorariosPersonal', path: '/VistaHorariosPersonal', name: 'Vista Horarios Personal CI', icon: 'pi pi-calendar-plus', section: 'Control Ingresos: Horario' },

  // CASOS (General)
  { key: 'NewCase', path: '/NuevoCaso', name: 'Nuevo Caso', icon: 'pi pi-plus-circle', section: 'Casos' },
  { key: 'MyCases', path: '/MisCasos', name: 'Mis Casos', icon: 'pi pi-folder-open', section: 'Casos' },
  { key: 'CreateActivities', path: '/CrearActividades', name: 'Crear Actividades', icon: 'pi pi-clipboard', section: 'Casos' },

  // REPORTES DE CASOS
  { key: 'ExcelReport', path: '/ReporteDeExcel', name: 'Reporte de Excel', icon: 'pi pi-file-excel', section: 'Reportes de Casos' },
  { key: 'CaseNotifications', path: '/Notificaciones', name: 'Notificaciones de Casos', icon: 'pi pi-comments', section: 'Reportes de Casos' },
  // ADMINISTRACIÓN (Dividido en subsecciones para claridad)
  // Admin / Gestión de Casos
  { key: 'CaseReview', path: '/RevisionDeCasos', name: 'Revisión de Casos', icon: 'pi pi-address-book', section: 'Administración: Gestión Casos' },
  { key: 'CaseAssign', path: '/AsignacionDeCasos', name: 'Asignación de Casos', icon: 'pi pi-users', section: 'Administración: Gestión Casos' },
  { key: 'AssignedCases', path: '/VerCasosAsignados', name: 'Ver Casos Asignados (Admin)', icon: 'pi pi-th-large', section: 'Administración: Gestión Casos' },
  { key: 'AllCases', path: '/VerCasos', name: 'Ver Todos los Casos (Admin)', icon: 'pi pi-book', section: 'Administración: Gestión Casos' },

  // Admin / Gestión de Parámetros y Roles
  { key: 'Parameter', path: '/Parametros', name: 'Parámetros del Sistema', icon: 'pi pi-box', section: 'Administración: Configuración' },
  { key: 'RoleView', path: '/Roles', name: 'Gestión de Roles', icon: 'pi pi-wrench', section: 'Administración: Configuración' },

  // Admin / Gestión de Usuarios
  { key: 'UserView', path: '/Usuarios', name: 'Gestión de Usuarios', icon: 'pi pi-id-card', section: 'Administración: Usuarios' },
  { key: 'NewUser', path: '/NuevoUsuario', name: 'Nuevo Usuario', icon: 'pi pi-user-plus', section: 'Administración: Usuarios' },

  // Admin / Trabajo Social
  { key: 'SocialWorkSchedule', path: '/TrabajoSocialHorario', name: 'Horario (Trabajo Social)', icon: 'pi pi-calendar-clock', section: 'Administración: Trabajo Social' },
  { key: 'SocialWorkNewCase', path: '/NuevoCasoTrabajoSocial', name: 'Nuevo Caso (Trabajo Social)', icon: 'pi pi-folder-plus', section: 'Administración: Trabajo Social' },
  { key: 'SocialWorkCases', path: '/TrabajoSocialCasos', name: 'Casos (Trabajo Social)', icon: 'pi pi-folder-open', section: 'Administración: Trabajo Social' },

  // CONTROL DE INGRESOS (Dividido en subsecciones)
  // Control de Ingreso / Cronograma
  { key: 'Cronograma', path: '/Cronograma', name: 'Cronograma CI', icon: 'pi pi-graduation-cap', section: 'Control Ingresos: Cronograma' },
  { key: 'IngresoCronograma', path: '/IngresoCronograma', name: 'Ingreso Cronograma CI', icon: 'pi pi-calendar-plus', section: 'Control Ingresos: Cronograma' },
  { key: 'PeriodoSemanal', path: '/PeriodoSemanal', name: 'Seguimiento Semanal CI', icon: 'pi pi-calendar-times', section: 'Control Ingresos: Cronograma' },

  // Control de Ingreso / Estudiantes
  { key: 'AsignacionPeriodo', path: '/AsignacionPeriodo', name: 'Asignación Período CI', icon: 'pi pi-address-book', section: 'Control Ingresos: Estudiantes' },
  { key: 'IngresoEstudiantesExcel', path: '/IngresoEstudiantesExcel', name: 'Ingreso Estudiantes Excel CI', icon: 'pi pi-file-excel', section: 'Control Ingresos: Estudiantes' },
  { key: 'IngresoManualEstudiantes', path: '/IngresoManualEstudiantes', name: 'Ingreso Manual Estudiantes CI', icon: 'pi pi-user-edit', section: 'Control Ingresos: Estudiantes' },
  { key: 'ListadoEstudiantes', path: '/ListadoEstudiantes', name: 'Listado Estudiantes CI', icon: 'pi pi-list', section: 'Control Ingresos: Estudiantes' },
  { key: 'RemoverPeriodo', path: '/RemoverPeriodo', name: 'Remover Período CI', icon: 'pi pi-user-minus', section: 'Control Ingresos: Estudiantes' },

  // Control de Ingreso / Horario
  { key: 'IngresoArea', path: '/IngresoArea', name: 'Ingreso Área CI', icon: 'pi pi-building-columns', section: 'Control Ingresos: Horario' },
  { key: 'IngresoHorario', path: '/IngresoHorario', name: 'Ingreso Horario CI', icon: 'pi pi-calendar-plus', section: 'Control Ingresos: Horario' },
  { key: 'IngresoHorarioVirtual', path: '/IngresoHorarioVirtual', name: 'Ingreso Horario Virtual CI', icon: 'pi pi-video', section: 'Control Ingresos: Horario' },
  { key: 'VistaHorarios', path: '/VistaHorarios', name: 'Vista Horarios CI', icon: 'pi pi-eye', section: 'Control Ingresos: Horario' },
  

  // Control de Ingreso / Biometría y Asistencia
  { key: 'AsignacionHuella', path: '/AsignacionHuella', name: 'Asignación Huella CI', icon: 'pi pi-plus-circle', section: 'Control Ingresos: Asistencia' },
  { key: 'RegistroHuella', path: '/RegistroHuella', name: 'Registro Huella CI', icon: 'pi pi-unlock', section: 'Control Ingresos: Asistencia' },
  { key: 'RegistroPorCedula', path: '/RegistroPorCedula', name: 'Registro por Cédula CI', icon: 'pi pi-clipboard', section: 'Control Ingresos: Asistencia' },
  

  { key: 'RegistroManual', path: '/RegistroManual', name: 'Registro Manual Asistencia CI', icon: 'pi pi-pencil', section: 'Control Ingresos: Asistencia' },
  { key: 'RegistrosAbiertos', path: '/RegistrosAbiertos', name: 'Registros Abiertos CI', icon: 'pi pi-folder-open', section: 'Control Ingresos: Seguimiento Asistencia' },
  { key: 'RegistrosCerrados', path: '/RegistrosCerrados', name: 'Registros Cerrados CI', icon: 'pi pi-folder', section: 'Control Ingresos: Seguimiento Asistencia' },
  { key: 'ModificacionHoras', path: '/ModificacionHoras', name: 'Modificación Horas CI', icon: 'pi pi-plus-circle', section: 'Control Ingresos: Seguimiento Asistencia' },
  { key: 'SeguimientoGeneral', path: '/SeguimientoGeneral', name: 'Seguimiento General Asistencia CI', icon: 'pi pi-compass', section: 'Control Ingresos: Seguimiento Asistencia' },
  { key: 'SeguimientoSemanal', path: '/SeguimientoSemanal', name: 'Seguimiento Semanal (Admin CI)', icon: 'pi pi-chart-line', section: 'Control Ingresos: Seguimiento Asistencia' },
  { key: 'ResumenSemanal', path: '/ResumenSemanal', name: 'Resumen Semanal (Admin CI)', icon: 'pi pi-chart-pie', section: 'Control Ingresos: Seguimiento Asistencia' },
];

export interface ViewPermission {
  viewKey: string; // Corresponde a AppView.key y a View_Name del backend
  isEnabled: boolean;
}

export interface ProfilePermissionsData {
  profileId: number; // Profile_ID numérico del rol
  permissions: ViewPermission[];
}