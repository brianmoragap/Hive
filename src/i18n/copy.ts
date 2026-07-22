import type { EventPreview, SportOption } from '../types/domain';

export type AppLanguage = 'es' | 'en';

export interface AppCopy {
  common: {
    account: string;
    cancel: string;
    camera: string;
    closeSession: string;
    createAccount: string;
    emailLabel: string;
    emailPlaceholder: string;
    forgotPassword: string;
    fullName: string;
    identity: string;
    language: string;
    manualAccessOnly: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    pending: string;
    processing: string;
    review: string;
    signIn: string;
    soon: string;
    uploadDocument: string;
    uploadReady: string;
  };
  session: {
    accountCreatedNeedsConfirmation: string;
    activeSessionRequired: string;
    configureSupabase: string;
    invalidCredentials: string;
    invalidRegistration: string;
    noReviewApprovalHere: string;
    signInFailed: string;
  };
  loading: {
    copy: string;
  };
  auth: {
    cardTitleSignIn: string;
    cardTitleSignUp: string;
    demoModeCopy: string;
    heroCopy: string;
    heroTitle: string;
    registrationHintTitle: string;
    registrationSteps: string[];
    resetPendingBody: string;
    resetPendingTitle: string;
    safeTagSignIn: string;
    safeTagSignUp: string;
    socialDivider: string;
    submitErrorFallback: string;
  };
  onboarding: {
    birthDateLabel: string;
    birthDatePlaceholder: string;
    birthDateRequired: string;
    codeRequired: string;
    codeRequestMissing: string;
    countryPickerTitle: string;
    countrySearchPlaceholder: string;
    compactFeatures: Array<{
      iconName: 'shield-check' | 'account-group';
      label: string;
      title: string;
    }>;
    continueErrorBody: string;
    continueErrorTitle: string;
    copy: string;
    debugCodeSuffix: string;
    detailsCopy: string;
    detailsTitle: string;
    detailFeatures: Array<{
      description: string;
      iconName: 'weather-night' | 'handshake-outline';
      title: string;
    }>;
    footerNote: string;
    identityNextCopy: string;
    identityNextTitle: string;
    invalidCode: string;
    invalidPhone: string;
    invalidBirthDate: string;
    phoneCountryLabel: string;
    phoneHelper: string;
    phoneLabel: string;
    phoneLocalLabel: string;
    phonePlaceholder: string;
    phoneRequired: string;
    primaryCta: string;
    resendCodeCta: string;
    selfieCameraOption: string;
    selfieDescription: string;
    selfieLibraryOption: string;
    selfiePickerBody: string;
    selfiePickerTitle: string;
    selfieRequired: string;
    selfieTitle: string;
    sendCodeCta: string;
    sendCodeSuccessBody: string;
    sendCodeSuccessTitle: string;
    sosDescription: string;
    sosTitle: string;
    smsCodeCopy: string;
    smsCodeLabel: string;
    smsCodePlaceholder: string;
    smsCodeTitle: string;
    title: string;
    verifyCodeCta: string;
  };
  verification: {
    cameraOption: string;
    copy: string;
    helperLive: string;
    helperMock: string;
    invalidRut: string;
    kicker: string;
    libraryOption: string;
    missingDocuments: string;
    missingFullName: string;
    noticeCopy: string;
    noticeTitle: string;
    panelCopy: string;
    panelTitle: string;
    permissionBody: string;
    permissionTitle: string;
    pickerBody: string;
    pickerTitle: string;
    reviewCta: string;
    reviewSending: string;
    reviewErrorFallback: string;
    rutLabel: string;
    secureProfile: string;
    serialDescription: string;
    serialTitle: string;
    title: string;
    uploadFrontDescription: string;
    uploadFrontTitle: string;
  };
  pending: {
    copy: string;
    demoApprove: string;
    identityTitle: string;
    kicker: string;
    reviewOnly: string;
    safetyTips: string[];
    safetyTipsTitle: string;
    status: string;
    timeline: string[];
    timelineTitle: string;
    title: string;
  };
  home: {
    activityCardMeta: string;
    activityCardTitle: string;
    createEvent: string;
    emptyEventsCopy: string;
    emptyEventsTitle: string;
    eventAlertBodyPrefix: string;
    eventAlertBodySuffix: string;
    eventAlertTitle: string;
    eventOrganizerPrefix: string;
    eventParticipantsSuffix: string;
    eventsSectionTitle: string;
    globalBadge: string;
    heroCopy: string;
    heroTitle: string;
    joinCancelled: string;
    joinCompleted: string;
    joinFull: string;
    joinHost: string;
    joinJoined: string;
    joinSuccessBody: string;
    joinSuccessTitle: string;
    joinAction: string;
    joinLinkSearching: string;
    joinLinkNotFoundTitle: string;
    joinLinkNotFoundBody: string;
    kicker: string;
    manageAction: string;
    menuBody: string;
    menuMyEvents: string;
    menuProfile: string;
    menuSettings: string;
    menuTitle: string;
    notificationsBody: string;
    notificationsCancelledPrefix: string;
    notificationsCompletedPrefix: string;
    notificationsEmpty: string;
    notificationsInvitedPrefix: string;
    notificationsUpdatedPrefix: string;
    notificationsAudienceSuffix: string;
    notificationsTitle: string;
    notificationsCancelledReceived: string;
    notificationsCompletedReceived: string;
    notificationsInvitedReceived: string;
    notificationsUpdatedReceived: string;
    openAction: string;
    sampleEvents: EventPreview[];
    searchPlaceholder: string;
    sportOptions: SportOption[];
    sportsSectionTitle: string;
    tabActivity: string;
    tabCommunity: string;
    tabHome: string;
    tabProfile: string;
    tabSoonBody: string;
    tabSoonTitle: string;
    titlePrefix: string;
    verifiedBadge: string;
  };
  activity: {
    copy: string;
    emptyCopy: string;
    emptyTitle: string;
    filterAll: string;
    hostVerified: string;
    searchPlaceholder: string;
    spotsLeftLabel: string;
    title: string;
    viewAction: string;
  };
  eventChat: {
    title: string;
    placeholder: string;
    empty: string;
    sending: string;
  };
  eventDetail: {
    accessPrivate: string;
    accessPublic: string;
    attendanceCardCopy: string;
    attendanceCardTitle: string;
    backToEvents: string;
    chatLockedBody: string;
    chatLockedCta: string;
    chatLockedTitle: string;
    chatOpenBody: string;
    chatOpenTitle: string;
    checkedInLabel: string;
    confirmedLeaveBody: string;
    confirmedLeaveTitle: string;
    devHelperCopy: string;
    devHelperTitle: string;
    hostAction: string;
    hostVerified: string;
    leaveAction: string;
    leaveConfirmBody: string;
    leaveConfirmTitle: string;
    levelLabel: string;
    mapAction: string;
    mapTitle: string;
    manageAction: string;
    memberCheckedIn: string;
    memberPending: string;
    membersTitle: string;
    pendingLabel: string;
    ratingEventTitle: string;
    ratingMissingBody: string;
    ratingMissingTitle: string;
    ratingOrganizerTitle: string;
    ratingPromptCopy: string;
    ratingPromptTitle: string;
    ratingSubmittedCopy: string;
    ratingSubmittedTitle: string;
    ratingSubmitAction: string;
    ratingSuccessBody: string;
    ratingSuccessTitle: string;
    ratingSummaryCopy: string;
    ratingSummaryTitle: string;
    qrCardCopy: string;
    qrCardTitle: string;
    qrCheckedInLabel: string;
    qrManualCodeLabel: string;
    qrReadyLabel: string;
    reviewsLabel: string;
    scanCopy: string;
    scanInputLabel: string;
    scanInputPlaceholder: string;
    scanInstruction: string;
    scanManualHint: string;
    scanPermissionAction: string;
    scanPermissionCopy: string;
    scanPermissionTitle: string;
    scanResetAction: string;
    scanResultAlreadyBody: string;
    scanResultAlreadyTitle: string;
    scanResultCancelledBody: string;
    scanResultCancelledTitle: string;
    scanResultCheckedInBody: string;
    scanResultCheckedInTitle: string;
    scanResultHostBody: string;
    scanResultHostTitle: string;
    scanResultInvalidBody: string;
    scanResultInvalidTitle: string;
    scanResultMismatchBody: string;
    scanResultMismatchTitle: string;
    scanResultMissingBody: string;
    scanResultMissingTitle: string;
    scanResultFullBody: string;
    scanResultFullTitle: string;
    scanResultRevokedBody: string;
    scanResultRevokedTitle: string;
    scanTitle: string;
    scanValidateAction: string;
    scannerFallback: string;
    routeMetric: string;
    routeNote: string;
    spotsLabel: string;
    startLabel: string;
    visibilityLabel: string;
  };
  createEvent: {
    activityPickerTitle: string;
    dateLabel: string;
    datePlaceholder: string;
    editHeroCopy: string;
    editHeroTitle: string;
    heroCopy: string;
    heroTitle: string;
    limitParticipantsCopy: string;
    limitParticipantsTitle: string;
    limitParticipantsFloor: string;
    limitBelowJoinedError: string;
    meetingPointLabel: string;
    meetingPointPlaceholder: string;
    mapPickerHint: string;
    missingFields: string;
    privateAfterCreate: string;
    privateVisibilityCopy: string;
    publicVisibilityCopy: string;
    safetyNote: string;
    saveChanges: string;
    skillAdvanced: string;
    skillBeginner: string;
    skillIntermediate: string;
    skillLevelLabel: string;
    submit: string;
    successBody: string;
    successTitle: string;
    timePlaceholder: string;
    titleLabel: string;
    titlePlaceholder: string;
    typeLabel: string;
    updateSuccessBody: string;
    updateSuccessTitle: string;
    visibilityLabel: string;
    visibilityPrivate: string;
    visibilityPublic: string;
  };
  myEvents: {
    activeBadge: string;
    attendeesLabel: string;
    attendingTitle: string;
    attendingCopy: string;
    attendingEmptyTitle: string;
    attendingEmptyCopy: string;
    hostingTitle: string;
    passCodeLabel: string;
    passPendingLabel: string;
    passCheckedInLabel: string;
    viewEventAction: string;
    leaveSuccessTitle: string;
    leaveSuccessBody: string;
    cancelAction: string;
    cancelConfirmBody: string;
    cancelConfirmTitle: string;
    cancelSuccessBody: string;
    cancelSuccessNoAudience: string;
    cancelSuccessTitle: string;
    cancelledBadge: string;
    completeAction: string;
    completeConfirmBody: string;
    completeConfirmTitle: string;
    completeSuccessBody: string;
    completeSuccessTitle: string;
    completedBadge: string;
    copy: string;
    editAction: string;
    emptyCopy: string;
    emptyTitle: string;
    freshCreated: string;
    freshCompleted: string;
    freshInvited: string;
    freshUpdated: string;
    freshCancelled: string;
    inviteAction: string;
    lastUpdateLabel: string;
    participantsMetric: string;
    privateBadge: string;
    publicBadge: string;
    shareAction: string;
    shareCopied: string;
    shareFailed: string;
    title: string;
  };
  inviteMembers: {
    copy: string;
    empty: string;
    fullEvent: string;
    inviteCta: string;
    inviteSuccessBody: string;
    inviteSuccessTitle: string;
    searchPlaceholder: string;
    selectedCounter: string;
    shareBody: string;
    shareTitle: string;
    title: string;
  };
  profile: {
    birthDateLabel: string;
    copy: string;
    createEventAction: string;
    emailLabel: string;
    eventsCreatedStat: string;
    myEventsAction: string;
    organizerRatingEmpty: string;
    organizerRatingLabel: string;
    phoneLabel: string;
    privateEventsStat: string;
    safetyCardCopy: string;
    safetyCardTitle: string;
    title: string;
    upcomingStat: string;
    verifiedBadge: string;
  };
  settings: {
    copy: string;
    darkMode: string;
    darkModeCopy: string;
    languageCopy: string;
    languageEnglish: string;
    languageSpanish: string;
    languageTitle: string;
    paletteCoral: string;
    paletteCoralCopy: string;
    paletteForest: string;
    paletteForestCopy: string;
    paletteNeutral: string;
    paletteNeutralCopy: string;
    paletteOcean: string;
    paletteOceanCopy: string;
    paletteSunset: string;
    paletteSunsetCopy: string;
    paletteTitle: string;
    previewCopy: string;
    previewTitle: string;
    themeModeDark: string;
    themeModeLight: string;
    title: string;
  };
  socialPreview: {
    helperText: string;
    title: string;
  };
}

const sportAccents = {
  mtb: ['#FFAF8A', '#E0552B'] as [string, string],
  road_cycling: ['#FF8A8A', '#AF232B'] as [string, string],
  running: ['#BCE7DE', '#2F8E6D'] as [string, string],
  trail_running: ['#FFD8C7', '#C56A45'] as [string, string],
  trekking: ['#E8D7FF', '#7A5CC3'] as [string, string],
};

export const copyByLanguage: Record<AppLanguage, AppCopy> = {
  es: {
    common: {
      account: 'Cuenta',
      cancel: 'Cancelar',
      camera: 'Cámara',
      closeSession: 'Cerrar sesión',
      createAccount: 'Crear cuenta',
      emailLabel: 'Correo electrónico',
      emailPlaceholder: 'tu.nombre@hive.cl',
      forgotPassword: 'Olvidé',
      fullName: 'Nombre completo',
      identity: 'Identidad',
      language: 'Idioma',
      manualAccessOnly: 'Acceso manual',
      passwordLabel: 'Contraseña',
      passwordPlaceholder: 'Mínimo 6 caracteres',
      pending: 'Pendiente',
      processing: 'Procesando',
      review: 'Revisión',
      signIn: 'Entrar',
      soon: 'Pronto',
      uploadDocument: 'Subir archivo',
      uploadReady: 'Documento listo para revisión',
    },
    session: {
      accountCreatedNeedsConfirmation:
        'La cuenta fue creada, pero tu proyecto de Supabase exige confirmación de correo antes de entrar.',
      activeSessionRequired: 'No hay una sesión activa.',
      configureSupabase: 'Supabase no está configurado.',
      invalidCredentials: 'Ingresa tu correo y contraseña.',
      invalidRegistration: 'Usa un correo válido y una contraseña de al menos 6 caracteres.',
      noReviewApprovalHere: 'La aprobación debe ocurrir desde el panel de revisión.',
      signInFailed: 'No se pudo iniciar sesión.',
    },
    loading: {
      copy: 'Preparando tu acceso seguro',
    },
    auth: {
      cardTitleSignIn: 'Bienvenida de vuelta',
      cardTitleSignUp: 'Crea tu acceso',
      demoModeCopy:
        'Modo demo activo: si aún no defines las llaves de Supabase, cualquier correo y contraseña te dejará avanzar en el flujo.',
      heroCopy:
        'Mujeres verificadas, eventos claros y una identidad común respaldada desde el primer acceso.',
      heroTitle: 'Una comunidad deportiva que primero protege.',
      registrationHintTitle: 'Flujo de alta',
      registrationSteps: [
        '1. Creas tu cuenta con correo y contraseña.',
        '2. Ves el onboarding informativo.',
        '3. Completas identidad para quedar verificada.',
      ],
      resetPendingBody: 'Se conectará con recuperación vía Supabase.',
      resetPendingTitle: 'Recuperación pendiente',
      safeTagSignIn: 'Solo mujeres verificadas entran al ecosistema.',
      safeTagSignUp: 'Después del alta verás onboarding y validación obligatoria.',
      socialDivider: 'Accesos próximos',
      submitErrorFallback: 'No se pudo completar la autenticación.',
    },
    onboarding: {
      birthDateLabel: 'Fecha de nacimiento',
      birthDatePlaceholder: 'DD/MM/AAAA',
      birthDateRequired: 'Ingresa tu fecha de nacimiento.',
      codeRequired: 'Ingresa el código que te enviamos.',
      codeRequestMissing: 'Primero debes solicitar un código de validación.',
      countryPickerTitle: 'Selecciona un país',
      countrySearchPlaceholder: 'Buscar país o código',
      compactFeatures: [
        {
          iconName: 'shield-check',
          label: 'Identidad',
          title: 'Comunidad verificada',
        },
        {
          iconName: 'account-group',
          label: 'Social',
          title: 'Seguimiento de grupos',
        },
      ],
      continueErrorBody: 'Ocurrió un problema al avanzar al siguiente paso.',
      continueErrorTitle: 'No pudimos continuar',
      copy:
        'Diseñada para moverte con confianza, protegida por verificación avanzada de comunidad.',
      debugCodeSuffix: 'En desarrollo, el código se muestra en pantalla hasta activar el envío real por correo.',
      detailsCopy:
        'Primero registramos tu teléfono, tu fecha de nacimiento y una selfie. Luego validamos tu correo con un código y continúas con nombre completo, RUT y fotos de tu cédula chilena.',
      detailsTitle: 'Completa tu perfil de acceso',
      detailFeatures: [
        {
          description: 'Auditoría inteligente de rutas para actividad segura después del anochecer.',
          iconName: 'weather-night',
          title: 'Tecnología Night-Sync',
        },
        {
          description: 'Redes basadas en confianza para que cada encuentro pase por el filtro de Hive.',
          iconName: 'handshake-outline',
          title: 'Respaldo entre integrantes',
        },
      ],
      footerNote: 'Con la confianza de 500k+ mujeres activas en el mundo',
      identityNextCopy:
        'Después del código por correo continúas con nombre completo, RUT, foto frontal y número de serie de tu cédula chilena. Ese paso sigue siendo obligatorio.',
      identityNextTitle: 'Luego sigue tu cédula chilena',
      invalidCode: 'El código ingresado no coincide.',
      invalidPhone: 'Ingresa un número válido para el país seleccionado.',
      invalidBirthDate: 'Ingresa una fecha válida en formato DD/MM/AAAA.',
      phoneCountryLabel: 'País y código',
      phoneHelper:
        'Selecciona el prefijo y escribe solo el número local. Si pegas el número completo, Hive lo acomoda por ti.',
      phoneLabel: 'Número de teléfono',
      phoneLocalLabel: 'Número local',
      phonePlaceholder: '+56 9 1234 5678',
      phoneRequired: 'Ingresa tu número de teléfono.',
      primaryCta: 'Comenzar',
      resendCodeCta: 'Reenviar código',
      selfieCameraOption: 'Tomar selfie',
      selfieDescription: 'Usa una foto frontal clara para validar que la cuenta corresponde a quien se registra.',
      selfieLibraryOption: 'Elegir foto',
      selfiePickerBody: 'Elige cómo quieres cargar tu selfie.',
      selfiePickerTitle: 'Selfie de verificación',
      selfieRequired: 'Debes subir una selfie para continuar.',
      selfieTitle: 'Selfie reciente',
      sendCodeCta: 'Enviar código',
      sendCodeSuccessBody: 'Enviamos un código de 6 dígitos a tu correo de acceso.',
      sendCodeSuccessTitle: 'Código enviado',
      sosDescription: 'Alerta de emergencia en un toque con ubicación GPS en vivo.',
      sosTitle: 'SOS inmediato',
      smsCodeCopy: 'Te enviamos un código por correo. Ingrésalo aquí para continuar con la validación de identidad.',
      smsCodeLabel: 'Código por correo',
      smsCodePlaceholder: '6 dígitos',
      smsCodeTitle: 'Valida tu correo',
      title: 'Únete a un espacio seguro para mujeres activas.',
      verifyCodeCta: 'Verificar y continuar con cédula',
    },
    verification: {
      cameraOption: 'Cámara',
      copy:
        'Tu teléfono, tu fecha de nacimiento y tu selfie ya quedaron listos. Ahora necesitamos confirmar tu nombre, RUT y fotos claras de tu cédula chilena.',
      helperLive:
        'Con las llaves de Supabase activas, este flujo ya queda listo para autenticar y enviar documentos a revisión.',
      helperMock:
        'Estás viendo el flujo en modo demo. Cuando agregues las llaves de Supabase, las imágenes subirán al bucket privado.',
      invalidRut: 'Revisa el dígito verificador.',
      kicker: 'Paso 2 · Verificación',
      libraryOption: 'Biblioteca',
      missingDocuments: 'Debes subir ambas imágenes de la cédula.',
      missingFullName: 'Ingresa tu nombre completo.',
      noticeCopy:
        'Guardamos las imágenes en Supabase Storage y tu perfil queda con `verificado = false` hasta la aprobación manual.',
      noticeTitle: 'Cómo funciona la revisión',
      panelCopy: 'Este perfil se marca en revisión hasta que una moderadora lo apruebe.',
      panelTitle: 'Perfil seguro',
      permissionBody: 'Necesitamos acceso para capturar o seleccionar la imagen.',
      permissionTitle: 'Permiso requerido',
      pickerBody: 'Elige cómo quieres cargar la imagen.',
      pickerTitle: 'Documento de identidad',
      reviewCta: 'Enviar a revisión',
      reviewSending: 'Enviando',
      reviewErrorFallback: 'No fue posible enviar la verificación.',
      rutLabel: 'RUT chileno',
      secureProfile: 'Como aparece en tu cédula',
      serialDescription: 'Sube la cara posterior o un encuadre donde se lea el número de serie.',
      serialTitle: 'Número de serie',
      title: 'La seguridad de Hive parte por validar identidad real.',
      uploadFrontDescription: 'Captura el frente de tu documento con todos los datos visibles.',
      uploadFrontTitle: 'Foto frontal de cédula',
    },
    pending: {
      copy:
        'Mientras se valida tu información, Hive mantiene bloqueadas las funciones sociales y de eventos.',
      demoApprove: 'Aprobar en demo',
      identityTitle: 'Nombre',
      kicker: 'Estado de cuenta',
      reviewOnly: 'Perfil visible solo para el equipo de validación.',
      safetyTips: [
        'Comparte tu llegada con una persona de confianza.',
        'Revisa el punto de encuentro antes de salir.',
        'Prefiere eventos con organizadoras y participantes verificadas.',
      ],
      safetyTipsTitle: 'Consejos de seguridad',
      status: 'En revisión',
      timeline: [
        '1. El equipo de Hive revisa tu documentación.',
        '2. Si todo coincide, activamos `verificado = true`.',
        '3. Se desbloquean home, eventos, grupos y notificaciones.',
      ],
      timelineTitle: 'Qué sigue ahora',
      title: 'Tu identidad ya entró a revisión.',
    },
    home: {
      activityCardMeta: 'Cerro San Cristóbal · Hace 2 min',
      activityCardTitle: 'Elena inició una salida MTB',
      createEvent: 'Crear salida',
      emptyEventsCopy: 'No encontramos salidas para ese deporte con la búsqueda actual.',
      emptyEventsTitle: 'Sin resultados por ahora',
      eventAlertBodyPrefix: 'La vista de',
      eventAlertBodySuffix: 'queda definida para la fase siguiente.',
      eventAlertTitle: 'Listado de eventos',
      eventOrganizerPrefix: 'Organiza',
      eventParticipantsSuffix: 'participantes',
      eventsSectionTitle: 'Salidas disponibles',
      globalBadge: 'Global',
      heroCopy: 'Elige tu disciplina y comienza tu sesión.',
      heroTitle: '¿Cuál será tu próximo movimiento?',
      joinCancelled: 'Esta salida fue cancelada.',
      joinCompleted: 'Esta salida ya terminó y quedó cerrada para nuevas uniones.',
      joinFull: 'Esta salida ya completó sus cupos.',
      joinHost: 'Esta salida ya la organizas tú.',
      joinJoined: 'Ya estás dentro de esta salida.',
      joinSuccessBody:
        'La salida quedó agregada a tu pestaña Actividad. Tu pase QR ya está listo dentro del detalle.',
      joinSuccessTitle: 'Te uniste a la salida',
      joinAction: 'Unirme',
      joinLinkSearching: 'Buscando la salida...',
      joinLinkNotFoundTitle: 'No encontramos esa salida',
      joinLinkNotFoundBody:
        'El link puede haber vencido, o la salida es privada y todavía no te invitan.',
      kicker: 'Cuenta verificada',
      manageAction: 'Gestionar',
      menuBody: 'Desde aquí puedes revisar tu cuenta o cerrar tu sesión actual.',
      menuMyEvents: 'Mis eventos',
      menuProfile: 'Perfil',
      menuSettings: 'Ajustes',
      menuTitle: 'Cuenta Hive',
      notificationsBody: 'Las alertas de actividad, grupos y eventos llegarán en la siguiente fase.',
      notificationsCancelledPrefix: 'Cancelación enviada a',
      notificationsCompletedPrefix: 'Cierre enviado a',
      notificationsEmpty: 'Todavía no tienes avisos recientes.',
      notificationsInvitedPrefix: 'Invitaciones enviadas a',
      notificationsUpdatedPrefix: 'Cambios enviados a',
      notificationsAudienceSuffix: 'integrantes',
      notificationsTitle: 'Notificaciones',
      notificationsCancelledReceived: 'Cancelaron un evento en el que participabas · {event}',
      notificationsCompletedReceived: 'Un evento terminó, ya puedes calificarlo · {event}',
      notificationsInvitedReceived: 'Te sumaron a un evento · {event}',
      notificationsUpdatedReceived: 'Un evento en el que participas cambió de detalles · {event}',
      openAction: 'Ver',
      sampleEvents: [
        {
          id: 'event-1',
          title: 'Tempo amanecer Costanera',
          sport: 'Running',
          schedule: 'Domingo · 07:15',
          location: 'Parque Bicentenario, Vitacura',
          organizer: 'Paula R.',
          participants: 18,
        },
        {
          id: 'event-2',
          title: 'Ruta coral al Cajón',
          sport: 'Ciclismo ruta',
          schedule: 'Sábado · 08:30',
          location: 'Plaza San Enrique',
          organizer: 'Líderes Hive',
          participants: 12,
        },
      ],
      searchPlaceholder: 'Buscar salidas o ubicaciones',
      sportOptions: [
        {
          accent: sportAccents.road_cycling,
          iconName: 'bike-fast',
          id: 'road_cycling',
          label: 'Ciclismo ruta',
          subtitle: 'Pelotones seguros y puntos de encuentro claros',
        },
        {
          accent: sportAccents.mtb,
          iconName: 'bike',
          id: 'mtb',
          label: 'MTB',
          subtitle: 'Salidas técnicas con líderes verificadas',
        },
        {
          accent: sportAccents.running,
          iconName: 'run-fast',
          id: 'running',
          label: 'Running',
          subtitle: 'Ritmos compartidos para ciudad y parque',
        },
        {
          accent: sportAccents.trekking,
          iconName: 'hiking',
          id: 'trekking',
          label: 'Trekking',
          subtitle: 'Senderos con comunidad y check-ins previos',
        },
        {
          accent: sportAccents.trail_running,
          iconName: 'shoe-sneaker',
          id: 'trail_running',
          label: 'Trail running',
          subtitle: 'Altimetría, apoyo mutuo y planes visibles',
        },
      ],
      sportsSectionTitle: 'Selecciona deporte',
      tabActivity: 'Actividad',
      tabCommunity: 'Comunidad',
      tabHome: 'Inicio',
      tabProfile: 'Perfil',
      tabSoonBody: 'estará disponible en la siguiente iteración.',
      tabSoonTitle: 'Sección en preparación',
      titlePrefix: 'Hola',
      verifiedBadge: 'Verificada',
    },
    activity: {
      copy: 'Aquí ves solo las salidas en las que ya estás dentro, incluidas las que organizas.',
      emptyCopy: 'Únete a una salida desde Inicio y aparecerá aquí automáticamente.',
      emptyTitle: 'Todavía no tienes actividades unidas',
      filterAll: 'Todas',
      hostVerified: 'Host verificada',
      searchPlaceholder: 'Buscar actividades o ubicaciones',
      spotsLeftLabel: 'cupos libres',
      title: 'Actividad',
      viewAction: 'Ver',
    },
    eventChat: {
      title: 'Chat del evento',
      placeholder: 'Escribe un mensaje…',
      empty: 'Aún no hay mensajes. ¡Rompe el hielo con tu grupo! 👋',
      sending: 'Enviando…',
    },
    eventDetail: {
      accessPrivate: 'Privado',
      accessPublic: 'Público',
      attendanceCardCopy:
        'Escanea el pase de cada asistente desde Hive para validar que pertenece a este evento y marcar su ingreso.',
      attendanceCardTitle: 'Control de asistencia',
      backToEvents: 'Volver',
      chatLockedBody: 'Únete a la salida para desbloquear el chat privado del grupo.',
      chatLockedCta: 'Unirme para desbloquear chat',
      chatLockedTitle: 'Vista previa del chat',
      chatOpenBody: 'Ya estás dentro. El siguiente paso es conectar el chat grupal real.',
      chatOpenTitle: 'Abrir chat del grupo',
      checkedInLabel: 'Ingresaron',
      confirmedLeaveBody: 'Saliste de la salida y ya no aparecerá en tu pestaña Actividad.',
      confirmedLeaveTitle: 'Saliste del evento',
      devHelperCopy:
        'En simulador puedes validar una invitada usando uno de estos códigos de demo.',
      devHelperTitle: 'Helper de demo',
      hostAction: 'Escanear QR',
      hostVerified: 'Host verificada',
      leaveAction: 'Salir del evento',
      leaveConfirmBody: 'Dejarás tu cupo disponible para otra integrante de Hive.',
      leaveConfirmTitle: 'Salir de la salida',
      levelLabel: 'Nivel',
      mapAction: 'Ver punto de encuentro',
      mapTitle: 'Punto de encuentro',
      manageAction: 'Gestionar',
      memberCheckedIn: 'Ingreso validado',
      memberPending: 'Pendiente',
      membersTitle: 'Miembros Hive',
      pendingLabel: 'Pendientes',
      ratingEventTitle: '¿Cómo estuvo la salida?',
      ratingMissingBody: 'Debes elegir estrellas para la salida y para la organizadora.',
      ratingMissingTitle: 'Falta tu calificación',
      ratingOrganizerTitle: '¿Cómo estuvo la organizadora?',
      ratingPromptCopy:
        'Cuando termina la salida, puedes evaluar la experiencia y la conducción de la organizadora con estrellas, como en Uber.',
      ratingPromptTitle: 'Califica tu experiencia',
      ratingSubmittedCopy:
        'Tu calificación ya quedó registrada y ahora cuenta para el promedio del evento y del perfil de la organizadora.',
      ratingSubmittedTitle: 'Gracias por evaluar',
      ratingSubmitAction: 'Enviar calificación',
      ratingSuccessBody:
        'Tu reseña ya se sumó al promedio del evento y al perfil de la organizadora.',
      ratingSuccessTitle: 'Calificación enviada',
      ratingSummaryCopy: 'Promedios visibles para futuras asistentes.',
      ratingSummaryTitle: 'Puntaje de la comunidad',
      qrCardCopy:
        'Presenta este QR al llegar. Si sales del evento, este pase deja de ser válido inmediatamente.',
      qrCardTitle: 'Tu pase de acceso',
      qrCheckedInLabel: 'Ingreso validado',
      qrManualCodeLabel: 'Código manual',
      qrReadyLabel: 'Lista para escanear',
      reviewsLabel: 'reseñas',
      scanCopy:
        'Escanea el QR desde la app de la asistente o valida el código manual si estás probando desde simulador.',
      scanInputLabel: 'Código manual',
      scanInputPlaceholder: 'Pega el QR completo o escribe el código de 6 dígitos',
      scanInstruction:
        'Solo se aceptan pases activos de esta salida. Si una integrante se sale, su QR deja de servir.',
      scanManualHint:
        'Úsalo cuando la cámara no esté disponible o cuando estés revisando una prueba desde simulador.',
      scanPermissionAction: 'Habilitar cámara',
      scanPermissionCopy:
        'Hive necesita acceso a la cámara para leer los QR de ingreso desde el evento.',
      scanPermissionTitle: 'Permiso de cámara',
      scanResetAction: 'Escanear otro',
      scanResultAlreadyBody: 'ya tenía su ingreso confirmado para esta salida.',
      scanResultAlreadyTitle: 'QR ya validado',
      scanResultCancelledBody: 'El evento está cancelado y no admite nuevos ingresos.',
      scanResultCancelledTitle: 'Evento cancelado',
      scanResultCheckedInBody: 'quedó marcada como asistente válida.',
      scanResultCheckedInTitle: 'Ingreso confirmado',
      scanResultHostBody:
        'Solo la organizadora del evento puede validar los QR de asistencia.',
      scanResultHostTitle: 'Acceso solo para organizadora',
      scanResultInvalidBody:
        'Este QR no corresponde a una invitada activa de esta salida o ya fue invalidado.',
      scanResultInvalidTitle: 'QR rechazado',
      scanResultMismatchBody:
        'El código pertenece a otro evento. Debes escanearlo dentro de la salida correcta.',
      scanResultMismatchTitle: 'QR de otro evento',
      scanResultMissingBody: 'No encontramos este evento para validar la asistencia.',
      scanResultMissingTitle: 'Evento no disponible',
      scanResultFullBody:
        'Ya validaste todos los cupos de esta salida. No puedes registrar más asistentes.',
      scanResultFullTitle: 'Aforo completo',
      scanResultRevokedBody:
        'Esta invitada salió del evento, así que su pase quedó anulado.',
      scanResultRevokedTitle: 'Pase anulado',
      scanTitle: 'Escanear asistencia',
      scanValidateAction: 'Validar código',
      scannerFallback:
        'En web o simulador usa el código manual. El escáner real queda disponible en dispositivo físico.',
      routeMetric: 'Distancia estimada',
      routeNote: 'Ajusta meeting point, visibilidad y cupos desde la creación del evento.',
      spotsLabel: 'cupos disponibles',
      startLabel: 'Comienza a las',
      visibilityLabel: 'Visibilidad',
    },
    createEvent: {
      activityPickerTitle: 'Selecciona un deporte',
      dateLabel: 'Fecha y hora',
      datePlaceholder: 'DD/MM/AAAA',
      editHeroCopy:
        'Actualiza los detalles y Hive avisará a las asistentes si ya estaban inscritas.',
      editHeroTitle: 'Editar salida',
      heroCopy: 'Reúne a tu grupo, define el punto de encuentro y deja la salida lista para compartirla con Hive.',
      heroTitle: 'Crear salida',
      limitParticipantsCopy: 'Define el tamaño máximo del grupo antes de publicar.',
      limitParticipantsTitle: 'Límite de participantes',
      limitParticipantsFloor:
        'Ya hay {joined} inscritas, así que el mínimo es {min} cupos (te incluye a ti).',
      limitBelowJoinedError:
        'No puedes dejar menos de {min} cupos: ya hay inscritas ocupando ese espacio. Primero sácalas del evento.',
      meetingPointLabel: 'Punto de encuentro',
      meetingPointPlaceholder: 'Busca o escribe una ubicación segura',
      mapPickerHint: 'Toca el mapa o arrastra el pin para marcar el punto exacto.',
      missingFields: 'Completa título, fecha, hora y punto de encuentro antes de crear la salida.',
      privateAfterCreate:
        'Si la salida es privada, después podrás compartirla por enlace o invitar integrantes Hive desde Mis eventos.',
      privateVisibilityCopy:
        'Solo quienes reciban el enlace o una invitación desde Hive podrán verla.',
      publicVisibilityCopy:
        'Cualquier mujer verificada podrá verla desde el listado general de eventos.',
      safetyNote: 'Al crear esta salida aceptas las pautas de seguridad de la comunidad y el código de conducta de Hive.',
      saveChanges: 'Guardar cambios',
      skillAdvanced: 'Avanzado',
      skillBeginner: 'Inicial',
      skillIntermediate: 'Intermedio',
      skillLevelLabel: 'Nivel del grupo',
      submit: 'Crear evento',
      successBody: 'La salida quedó lista. Ahora puedes gestionarla desde Mis eventos.',
      successTitle: 'Salida creada',
      timePlaceholder: '08:30',
      titleLabel: 'Título del evento',
      titlePlaceholder: 'Running río al amanecer',
      typeLabel: 'Tipo de actividad',
      updateSuccessBody:
        'Guardamos los cambios y, si ya había asistentes, Hive les envió una notificación.',
      updateSuccessTitle: 'Cambios guardados',
      visibilityLabel: 'Visibilidad',
      visibilityPrivate: 'Privado',
      visibilityPublic: 'Público',
    },
    myEvents: {
      activeBadge: 'Activo',
      attendeesLabel: 'Asistentes',
      attendingTitle: 'Voy a ir',
      attendingCopy: 'Salidas de otras anfitrionas donde ya tienes tu cupo.',
      attendingEmptyTitle: 'Aún no te unes a ninguna salida',
      attendingEmptyCopy: 'Explora el inicio y únete a una salida para recibir tu pase de acceso.',
      hostingTitle: 'Yo organizo',
      passCodeLabel: 'Tu código',
      passPendingLabel: 'Pendiente de validar',
      passCheckedInLabel: 'Asistencia validada',
      viewEventAction: 'Ver evento',
      leaveSuccessTitle: 'Saliste de la salida',
      leaveSuccessBody: 'Tu cupo quedó disponible y tu pase dejó de ser válido.',
      cancelAction: 'Cancelar evento',
      cancelConfirmBody:
        'La salida quedará marcada como cancelada y Hive avisará a todas las asistentes actuales.',
      cancelConfirmTitle: 'Cancelar salida',
      cancelSuccessBody: 'La salida quedó cancelada y las asistentes ya fueron notificadas.',
      cancelSuccessNoAudience: 'La salida quedó cancelada. Aún no tenía asistentes por avisar.',
      cancelSuccessTitle: 'Evento cancelado',
      cancelledBadge: 'Cancelado',
      completeAction: 'Finalizar evento',
      completeConfirmBody:
        'La salida quedará cerrada y las asistentes podrán evaluarla junto con tu perfil de organizadora.',
      completeConfirmTitle: 'Finalizar salida',
      completeSuccessBody:
        'La salida se cerró y Hive ya habilitó la calificación con estrellas para las asistentes.',
      completeSuccessTitle: 'Salida finalizada',
      completedBadge: 'Finalizado',
      copy: 'Gestiona aquí tus salidas públicas o privadas, sus cambios y la comunicación con asistentes.',
      editAction: 'Editar',
      emptyCopy: 'Crea tu primera salida y aparecerá aquí para compartirla o ajustarla.',
      emptyTitle: 'Todavía no tienes eventos',
      freshCancelled: 'La cancelación ya quedó registrada.',
      freshCreated: 'Tu salida ya aparece en Mis eventos.',
      freshCompleted: 'La salida quedó finalizada y lista para recibir evaluaciones.',
      freshInvited: 'Las invitaciones quedaron enviadas.',
      freshUpdated: 'Los cambios ya quedaron guardados.',
      inviteAction: 'Invitar usuarias',
      lastUpdateLabel: 'Último movimiento',
      participantsMetric: 'cupos usados',
      privateBadge: 'Privado',
      publicBadge: 'Público',
      shareAction: 'Compartir enlace',
      shareCopied: 'Abrimos el panel para compartir el enlace privado de tu evento.',
      shareFailed: 'No pudimos abrir el panel para compartir el enlace.',
      title: 'Mis eventos',
    },
    inviteMembers: {
      copy:
        'Selecciona integrantes de Hive para sumarlas a esta salida privada o comparte el enlace directo.',
      empty: 'No encontramos usuarias con esa búsqueda.',
      fullEvent: 'Este evento ya alcanzó su límite de asistentes.',
      inviteCta: 'Invitar seleccionadas',
      inviteSuccessBody: 'Las integrantes elegidas ya quedaron sumadas y notificadas.',
      inviteSuccessTitle: 'Invitaciones enviadas',
      searchPlaceholder: 'Buscar nombre, usuario o ciudad',
      selectedCounter: 'seleccionadas',
      shareBody:
        'Comparte este acceso privado con tu grupo. Solo mujeres verificadas podrán verlo cuando el backend quede conectado.',
      shareTitle: 'Compartir enlace privado',
      title: 'Invitar desde Hive',
    },
    profile: {
      birthDateLabel: 'Nacimiento',
      copy: 'Tu perfil reúne identidad validada, datos de confianza y el ritmo de tus salidas dentro de Hive.',
      createEventAction: 'Crear nueva salida',
      emailLabel: 'Correo',
      eventsCreatedStat: 'Eventos creados',
      myEventsAction: 'Abrir Mis eventos',
      organizerRatingEmpty: 'Aún no tienes calificaciones como organizadora.',
      organizerRatingLabel: 'Puntaje como organizadora',
      phoneLabel: 'Teléfono',
      privateEventsStat: 'Eventos privados',
      safetyCardCopy:
        'Mantén tu información al día, define puntos de encuentro claros y comunica cualquier cambio a tiempo.',
      safetyCardTitle: 'Confianza operativa',
      title: 'Perfil',
      upcomingStat: 'Activos',
      verifiedBadge: 'Cuenta verificada',
    },
    settings: {
      copy:
        'Configura aquí el idioma y la apariencia visual de Hive. Los cambios quedan guardados hasta que decidas modificarlos.',
      darkMode: 'Modo oscuro',
      darkModeCopy:
        'Oscurece la app y mantiene el mismo palette activo para una lectura más cómoda de noche.',
      languageCopy:
        'Elige si quieres navegar Hive en español o en inglés. Se mantiene entre sesiones.',
      languageEnglish: 'Inglés',
      languageSpanish: 'Español',
      languageTitle: 'Idioma',
      paletteCoral: 'Coral Hive',
      paletteCoralCopy: 'La identidad cálida original de Hive.',
      paletteForest: 'Bosque',
      paletteForestCopy: 'Verde confianza con una sensación más serena.',
      paletteNeutral: 'Neutral',
      paletteNeutralCopy: 'Una alternativa más sobria y menos rosada.',
      paletteOcean: 'Océano',
      paletteOceanCopy: 'Teal limpio con energía deportiva más fresca.',
      paletteSunset: 'Atardecer',
      paletteSunsetCopy: 'Naranjos suaves y una atmósfera más luminosa.',
      paletteTitle: 'Color del tema',
      previewCopy:
        'Vista previa del acento activo para botones, navegación y estados destacados.',
      previewTitle: 'Vista previa',
      themeModeDark: 'Oscuro',
      themeModeLight: 'Claro',
      title: 'Ajustes',
    },
    socialPreview: {
      helperText:
        'Google y Apple quedan visibles como acceso futuro. Por ahora, el ingreso y el registro siguen siendo manuales.',
      title: 'Accesos sociales',
    },
  },
  en: {
    common: {
      account: 'Account',
      cancel: 'Cancel',
      camera: 'Camera',
      closeSession: 'Sign out',
      createAccount: 'Create account',
      emailLabel: 'Email address',
      emailPlaceholder: 'your.name@hive.cl',
      forgotPassword: 'Forgot',
      fullName: 'Full name',
      identity: 'Identity',
      language: 'Language',
      manualAccessOnly: 'Manual access',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Minimum 6 characters',
      pending: 'Pending',
      processing: 'Processing',
      review: 'Review',
      signIn: 'Sign in',
      soon: 'Soon',
      uploadDocument: 'Upload file',
      uploadReady: 'Document ready for review',
    },
    session: {
      accountCreatedNeedsConfirmation:
        'The account was created, but your Supabase project requires email confirmation before sign in.',
      activeSessionRequired: 'There is no active session.',
      configureSupabase: 'Supabase is not configured.',
      invalidCredentials: 'Enter your email and password.',
      invalidRegistration: 'Use a valid email and a password with at least 6 characters.',
      noReviewApprovalHere: 'Approval must happen from the review panel.',
      signInFailed: 'We could not sign you in.',
    },
    loading: {
      copy: 'Preparing your secure access',
    },
    auth: {
      cardTitleSignIn: 'Welcome back',
      cardTitleSignUp: 'Create your access',
      demoModeCopy:
        'Demo mode is active: until you define Supabase keys, any email and password will let you move through the flow.',
      heroCopy:
        'Verified women, clear events, and a shared identity layer backed from the very first step.',
      heroTitle: 'A sports community that protects first.',
      registrationHintTitle: 'Registration flow',
      registrationSteps: [
        '1. Create your account with email and password.',
        '2. Review the onboarding screen.',
        '3. Complete identity checks to become verified.',
      ],
      resetPendingBody: 'It will connect to Supabase password recovery next.',
      resetPendingTitle: 'Recovery coming next',
      safeTagSignIn: 'Only verified women can enter the ecosystem.',
      safeTagSignUp: 'After sign up you will see onboarding and mandatory verification.',
      socialDivider: 'Upcoming access',
      submitErrorFallback: 'We could not complete authentication.',
    },
    onboarding: {
      birthDateLabel: 'Birth date',
      birthDatePlaceholder: 'DD/MM/YYYY',
      birthDateRequired: 'Enter your birth date.',
      codeRequired: 'Enter the code we sent you.',
      codeRequestMissing: 'You need to request a verification code first.',
      countryPickerTitle: 'Select a country',
      countrySearchPlaceholder: 'Search country or code',
      compactFeatures: [
        {
          iconName: 'shield-check',
          label: 'Identity',
          title: 'Verified community',
        },
        {
          iconName: 'account-group',
          label: 'Social',
          title: 'Group tracking',
        },
      ],
      continueErrorBody: 'A problem blocked the next step.',
      continueErrorTitle: 'We could not continue',
      copy: 'Built for movement and protected by advanced community verification.',
      debugCodeSuffix: 'In development, the code is shown on screen until real email delivery is enabled.',
      detailsCopy:
        'First we collect your phone number, birth date, and a recent selfie. Then we validate your email with a code before you continue with your full name, RUT, and Chilean ID photos.',
      detailsTitle: 'Complete your access profile',
      detailFeatures: [
        {
          description: 'Smart route auditing for safer activity after dark.',
          iconName: 'weather-night',
          title: 'Night-Sync technology',
        },
        {
          description: 'Trust-based networks help ensure the people you meet are vetted by Hive.',
          iconName: 'handshake-outline',
          title: 'Member vouching',
        },
      ],
      footerNote: 'Trusted by 500k+ active women worldwide',
      identityNextCopy:
        'Right after the email code, you continue with your full name, Chilean RUT, front ID photo, and serial number photo. That step is still mandatory.',
      identityNextTitle: 'Your Chilean ID comes next',
      invalidCode: 'The code you entered does not match.',
      invalidPhone: 'Enter a valid phone number for the selected country.',
      invalidBirthDate: 'Enter a valid date in DD/MM/YYYY format.',
      phoneCountryLabel: 'Country code',
      phoneHelper:
        'Pick the country prefix and type only the local number. If you paste a full number, Hive will sort it for you.',
      phoneLabel: 'Phone number',
      phoneLocalLabel: 'Local number',
      phonePlaceholder: '+56 9 1234 5678',
      phoneRequired: 'Enter your phone number.',
      primaryCta: 'Get started',
      resendCodeCta: 'Resend code',
      selfieCameraOption: 'Take selfie',
      selfieDescription: 'Use a clear front photo so we can confirm the account matches the person registering.',
      selfieLibraryOption: 'Choose photo',
      selfiePickerBody: 'Choose how you want to upload your selfie.',
      selfiePickerTitle: 'Verification selfie',
      selfieRequired: 'You need to upload a selfie to continue.',
      selfieTitle: 'Recent selfie',
      sendCodeCta: 'Send code',
      sendCodeSuccessBody: 'We sent a 6-digit code to your account email.',
      sendCodeSuccessTitle: 'Code sent',
      sosDescription: 'One-tap emergency contact alerting with live GPS location.',
      sosTitle: 'Instant SOS',
      smsCodeCopy: 'We sent you a code by email. Enter it here to continue with identity verification.',
      smsCodeLabel: 'Email code',
      smsCodePlaceholder: '6 digits',
      smsCodeTitle: 'Validate your email',
      title: 'Join a safe space for active women.',
      verifyCodeCta: 'Verify and continue to ID',
    },
    verification: {
      cameraOption: 'Camera',
      copy:
        'Your phone number, birth date, and selfie are already set. Now we need your full name, Chilean RUT, and clear ID photos.',
      helperLive:
        'With active Supabase keys, this flow is ready to authenticate and submit review documents.',
      helperMock:
        'You are viewing the demo flow. Once you add Supabase keys, the images will upload to the private bucket.',
      invalidRut: 'Check the verification digit.',
      kicker: 'Step 2 · Verification',
      libraryOption: 'Library',
      missingDocuments: 'You need to upload both ID images.',
      missingFullName: 'Enter your full name.',
      noticeCopy:
        'We store these images in Supabase Storage and your profile stays at `verified = false` until manual approval.',
      noticeTitle: 'How review works',
      panelCopy: 'This profile stays under review until a moderator approves it.',
      panelTitle: 'Secure profile',
      permissionBody: 'We need access to capture or select the image.',
      permissionTitle: 'Permission required',
      pickerBody: 'Choose how you want to upload the image.',
      pickerTitle: 'Identity document',
      reviewCta: 'Submit for review',
      reviewSending: 'Sending',
      reviewErrorFallback: 'We could not submit your verification.',
      rutLabel: 'Chilean RUT',
      secureProfile: 'As it appears on your ID',
      serialDescription: 'Upload the back side or a crop where the serial number is clearly visible.',
      serialTitle: 'Serial number',
      title: 'Hive safety starts with real identity validation.',
      uploadFrontDescription: 'Capture the front of your ID with all details fully visible.',
      uploadFrontTitle: 'Front ID photo',
    },
    pending: {
      copy:
        'While your information is being validated, Hive keeps social and event features locked.',
      demoApprove: 'Approve in demo',
      identityTitle: 'Name',
      kicker: 'Account status',
      reviewOnly: 'This profile is visible only to the validation team.',
      safetyTips: [
        'Share your arrival with someone you trust.',
        'Review the meeting point before heading out.',
        'Prefer events with verified organizers and participants.',
      ],
      safetyTipsTitle: 'Safety tips',
      status: 'Under review',
      timeline: [
        '1. The Hive team reviews your documents.',
        '2. If everything matches, we switch `verified = true`.',
        '3. Home, events, groups, and notifications are unlocked.',
      ],
      timelineTitle: 'What happens next',
      title: 'Your identity is already under review.',
    },
    home: {
      activityCardMeta: 'Cerro San Cristóbal · 2m ago',
      activityCardTitle: 'Elena just started an MTB session',
      createEvent: 'Create event',
      emptyEventsCopy: 'We could not find outings for that sport with the current search.',
      emptyEventsTitle: 'No results yet',
      eventAlertBodyPrefix: 'The',
      eventAlertBodySuffix: 'view stays in the next phase.',
      eventAlertTitle: 'Event list',
      eventOrganizerPrefix: 'Hosted by',
      eventParticipantsSuffix: 'participants',
      eventsSectionTitle: 'Available outings',
      globalBadge: 'Global',
      heroCopy: 'Choose your discipline and start your session.',
      heroTitle: "What's your next movement?",
      joinCancelled: 'This outing was cancelled.',
      joinCompleted: 'This outing already ended and is closed for new join requests.',
      joinFull: 'This outing is already full.',
      joinHost: 'You already host this outing.',
      joinJoined: 'You are already in this outing.',
      joinSuccessBody:
        'The outing was added to your Activity tab. Your QR pass is now ready inside the detail view.',
      joinSuccessTitle: 'You joined the outing',
      joinAction: 'Join',
      joinLinkSearching: 'Looking for the outing...',
      joinLinkNotFoundTitle: "We couldn't find that outing",
      joinLinkNotFoundBody:
        "The link may have expired, or it's a private outing you haven't been invited to yet.",
      kicker: 'Verified account',
      manageAction: 'Manage',
      menuBody: 'From here you can review your account or close the current session.',
      menuMyEvents: 'My events',
      menuProfile: 'Profile',
      menuSettings: 'Settings',
      menuTitle: 'Hive account',
      notificationsBody: 'Activity, group, and event alerts will arrive in the next phase.',
      notificationsCancelledPrefix: 'Cancellation sent to',
      notificationsCompletedPrefix: 'Wrap-up sent to',
      notificationsEmpty: 'You do not have recent notices yet.',
      notificationsInvitedPrefix: 'Invites sent to',
      notificationsUpdatedPrefix: 'Changes sent to',
      notificationsAudienceSuffix: 'members',
      notificationsTitle: 'Notifications',
      notificationsCancelledReceived: 'An event you joined was cancelled · {event}',
      notificationsCompletedReceived: 'An event wrapped up — you can rate it now · {event}',
      notificationsInvitedReceived: 'You were added to an event · {event}',
      notificationsUpdatedReceived: "An event you're in changed its details · {event}",
      openAction: 'View',
      sampleEvents: [
        {
          id: 'event-1',
          title: 'Sunrise tempo riverside',
          sport: 'Running',
          schedule: 'Sunday · 07:15',
          location: 'Parque Bicentenario, Vitacura',
          organizer: 'Paula R.',
          participants: 18,
        },
        {
          id: 'event-2',
          title: 'Coral route to Cajon',
          sport: 'Road cycling',
          schedule: 'Saturday · 08:30',
          location: 'Plaza San Enrique',
          organizer: 'Hive Leaders',
          participants: 12,
        },
      ],
      searchPlaceholder: 'Search outings or locations',
      sportOptions: [
        {
          accent: sportAccents.road_cycling,
          iconName: 'bike-fast',
          id: 'road_cycling',
          label: 'Road cycling',
          subtitle: 'Safer packs and clear meeting points',
        },
        {
          accent: sportAccents.mtb,
          iconName: 'bike',
          id: 'mtb',
          label: 'MTB',
          subtitle: 'Technical rides with verified leaders',
        },
        {
          accent: sportAccents.running,
          iconName: 'run-fast',
          id: 'running',
          label: 'Running',
          subtitle: 'Shared pace for city and park sessions',
        },
        {
          accent: sportAccents.trekking,
          iconName: 'hiking',
          id: 'trekking',
          label: 'Trekking',
          subtitle: 'Trails with community support and pre-check-ins',
        },
        {
          accent: sportAccents.trail_running,
          iconName: 'shoe-sneaker',
          id: 'trail_running',
          label: 'Trail running',
          subtitle: 'Elevation, mutual support, and visible plans',
        },
      ],
      sportsSectionTitle: 'Choose a sport',
      tabActivity: 'Activity',
      tabCommunity: 'Community',
      tabHome: 'Home',
      tabProfile: 'Profile',
      tabSoonBody: 'will be available in the next iteration.',
      tabSoonTitle: 'Section coming soon',
      titlePrefix: 'Hi',
      verifiedBadge: 'Verified',
    },
    activity: {
      copy: 'Here you only see outings you already joined, including the ones you host.',
      emptyCopy: 'Join an outing from Home and it will appear here automatically.',
      emptyTitle: 'You have no joined activities yet',
      filterAll: 'All',
      hostVerified: 'Verified host',
      searchPlaceholder: 'Search activities or locations',
      spotsLeftLabel: 'spots left',
      title: 'Activity',
      viewAction: 'View',
    },
    eventChat: {
      title: 'Event chat',
      placeholder: 'Write a message…',
      empty: 'No messages yet. Break the ice with your group! 👋',
      sending: 'Sending…',
    },
    eventDetail: {
      accessPrivate: 'Private',
      accessPublic: 'Public',
      attendanceCardCopy:
        'Scan each attendee pass from Hive to confirm it belongs to this event and mark check-in.',
      attendanceCardTitle: 'Attendance control',
      backToEvents: 'Back',
      chatLockedBody: 'Join the outing to unlock the private group chat.',
      chatLockedCta: 'Join to unlock chat',
      chatLockedTitle: 'Chat preview',
      chatOpenBody: 'You are already in. The next step is wiring the real group chat.',
      chatOpenTitle: 'Open group chat',
      checkedInLabel: 'Checked in',
      confirmedLeaveBody: 'You left the outing and it will no longer appear in your Activity tab.',
      confirmedLeaveTitle: 'You left the event',
      devHelperCopy:
        'On simulator you can validate an attendee using one of these local demo codes.',
      devHelperTitle: 'Demo helper',
      hostAction: 'Scan QR',
      hostVerified: 'Verified host',
      leaveAction: 'Leave event',
      leaveConfirmBody: 'Your spot will become available for another Hive member.',
      leaveConfirmTitle: 'Leave the outing',
      levelLabel: 'Level',
      mapAction: 'View meeting point',
      mapTitle: 'Meeting point',
      manageAction: 'Manage',
      memberCheckedIn: 'Check-in confirmed',
      memberPending: 'Pending',
      membersTitle: 'Hive members',
      pendingLabel: 'Pending',
      ratingEventTitle: 'How was the outing?',
      ratingMissingBody: 'Pick stars for both the outing and the organizer before sending.',
      ratingMissingTitle: 'Your rating is incomplete',
      ratingOrganizerTitle: 'How was the organizer?',
      ratingPromptCopy:
        'Once the outing is completed, you can rate both the experience and the organizer with stars, similar to Uber.',
      ratingPromptTitle: 'Rate your experience',
      ratingSubmittedCopy:
        'Your rating was saved and now counts toward the outing score and the organizer profile.',
      ratingSubmittedTitle: 'Thanks for rating',
      ratingSubmitAction: 'Send rating',
      ratingSuccessBody:
        'Your review now contributes to the outing average and the organizer profile.',
      ratingSuccessTitle: 'Rating submitted',
      ratingSummaryCopy: 'Visible averages for future attendees.',
      ratingSummaryTitle: 'Community score',
      qrCardCopy:
        'Show this QR when you arrive. If you leave the event, this pass becomes invalid immediately.',
      qrCardTitle: 'Your entry pass',
      qrCheckedInLabel: 'Check-in confirmed',
      qrManualCodeLabel: 'Manual code',
      qrReadyLabel: 'Ready to scan',
      reviewsLabel: 'reviews',
      scanCopy:
        'Scan the QR from the attendee app or validate the manual code when you are testing from simulator.',
      scanInputLabel: 'Manual code',
      scanInputPlaceholder: 'Paste the full QR payload or type the 6-digit code',
      scanInstruction:
        'Only active passes for this outing are accepted. If a member leaves, her QR stops working.',
      scanManualHint:
        'Use this when the camera is unavailable or when you are testing from simulator.',
      scanPermissionAction: 'Enable camera',
      scanPermissionCopy:
        'Hive needs camera access to read attendance QR codes from the event.',
      scanPermissionTitle: 'Camera permission',
      scanResetAction: 'Scan another',
      scanResultAlreadyBody: 'was already marked as checked in for this outing.',
      scanResultAlreadyTitle: 'QR already validated',
      scanResultCancelledBody: 'This event is cancelled and cannot accept new check-ins.',
      scanResultCancelledTitle: 'Event cancelled',
      scanResultCheckedInBody: 'was marked as a valid attendee.',
      scanResultCheckedInTitle: 'Check-in confirmed',
      scanResultHostBody: 'Only the event organizer can validate attendance QR codes.',
      scanResultHostTitle: 'Organizer access only',
      scanResultInvalidBody:
        'This QR does not belong to an active attendee in this outing or it was already invalidated.',
      scanResultInvalidTitle: 'QR rejected',
      scanResultMismatchBody:
        'This code belongs to another event. You need to scan it inside the correct outing.',
      scanResultMismatchTitle: 'QR from another event',
      scanResultMissingBody: 'We could not find this event to validate attendance.',
      scanResultMissingTitle: 'Event unavailable',
      scanResultFullBody:
        'Every spot for this outing is already validated. You cannot register more attendees.',
      scanResultFullTitle: 'Capacity reached',
      scanResultRevokedBody: 'This attendee left the event, so her pass was invalidated.',
      scanResultRevokedTitle: 'Pass invalidated',
      scanTitle: 'Scan attendance',
      scanValidateAction: 'Validate code',
      scannerFallback:
        'On web or simulator use the manual code. The live scanner is available on a physical device.',
      routeMetric: 'Estimated distance',
      routeNote: 'Adjust meeting point, visibility, and spots from event creation.',
      spotsLabel: 'spots available',
      startLabel: 'Starts at',
      visibilityLabel: 'Visibility',
    },
    createEvent: {
      activityPickerTitle: 'Select a sport',
      dateLabel: 'Date and time',
      datePlaceholder: 'DD/MM/YYYY',
      editHeroCopy:
        'Update the outing details and Hive will notify attendees if anyone is already in.',
      editHeroTitle: 'Edit outing',
      heroCopy: 'Bring your group together, define the meeting point, and prepare the outing before sharing it with Hive.',
      heroTitle: 'Create outing',
      limitParticipantsCopy: 'Set the maximum group size before publishing.',
      limitParticipantsTitle: 'Limit participants',
      limitParticipantsFloor:
        '{joined} women already joined, so the minimum is {min} spots (you included).',
      limitBelowJoinedError:
        'You cannot go below {min} spots: attendees are already taking them. Remove them from the event first.',
      meetingPointLabel: 'Meeting point',
      meetingPointPlaceholder: 'Search or type a safe location',
      mapPickerHint: 'Tap the map or drag the pin to drop the exact spot.',
      missingFields: 'Complete title, date, time, and meeting point before creating the outing.',
      privateAfterCreate:
        'If the outing is private, you can share it by link or invite Hive members from My events right after creation.',
      privateVisibilityCopy:
        'Only women with the private link or a Hive invitation will be able to view it.',
      publicVisibilityCopy:
        'Any verified woman can discover it from the public event list.',
      safetyNote: 'By creating this outing, you agree to Hive community safety guidelines and the Hive code of conduct.',
      saveChanges: 'Save changes',
      skillAdvanced: 'Advanced',
      skillBeginner: 'Beginner',
      skillIntermediate: 'Intermediate',
      skillLevelLabel: 'Skill level',
      submit: 'Create event',
      successBody: 'The outing is ready. You can manage it now from My events.',
      successTitle: 'Outing created',
      timePlaceholder: '08:30',
      titleLabel: 'Event title',
      titlePlaceholder: 'Morning riverside run',
      typeLabel: 'Activity type',
      updateSuccessBody:
        'We saved the changes and Hive notified current attendees when needed.',
      updateSuccessTitle: 'Changes saved',
      visibilityLabel: 'Visibility',
      visibilityPrivate: 'Private',
      visibilityPublic: 'Public',
    },
    myEvents: {
      activeBadge: 'Active',
      attendeesLabel: 'Attendees',
      attendingTitle: "I'm going",
      attendingCopy: 'Outings hosted by others where you already have a spot.',
      attendingEmptyTitle: 'You have not joined any outing yet',
      attendingEmptyCopy: 'Browse home and join an outing to get your access pass.',
      hostingTitle: 'I host',
      passCodeLabel: 'Your code',
      passPendingLabel: 'Pending validation',
      passCheckedInLabel: 'Attendance validated',
      viewEventAction: 'View event',
      leaveSuccessTitle: 'You left the outing',
      leaveSuccessBody: 'Your spot is available again and your pass is no longer valid.',
      cancelAction: 'Cancel event',
      cancelConfirmBody:
        'This outing will be marked as cancelled and Hive will notify all current attendees.',
      cancelConfirmTitle: 'Cancel outing',
      cancelSuccessBody: 'The outing is now cancelled and attendees were notified.',
      cancelSuccessNoAudience: 'The outing is now cancelled. There were no attendees to notify yet.',
      cancelSuccessTitle: 'Event cancelled',
      cancelledBadge: 'Cancelled',
      completeAction: 'Complete event',
      completeConfirmBody:
        'This will close the outing and unlock star ratings for both the event and your organizer profile.',
      completeConfirmTitle: 'Complete outing',
      completeSuccessBody:
        'The outing is now closed and attendees can rate the experience with stars.',
      completeSuccessTitle: 'Outing completed',
      completedBadge: 'Completed',
      copy: 'Manage your public and private outings here, including attendee communications and updates.',
      editAction: 'Edit',
      emptyCopy: 'Create your first outing and it will appear here to share or adjust.',
      emptyTitle: 'You do not have events yet',
      freshCancelled: 'The cancellation is already reflected.',
      freshCreated: 'Your outing already appears in My events.',
      freshCompleted: 'The outing is completed and ready to receive ratings.',
      freshInvited: 'The invitations were sent.',
      freshUpdated: 'The changes were saved.',
      inviteAction: 'Invite members',
      lastUpdateLabel: 'Latest update',
      participantsMetric: 'spots used',
      privateBadge: 'Private',
      publicBadge: 'Public',
      shareAction: 'Share link',
      shareCopied: 'We opened the share sheet with the private link for your event.',
      shareFailed: 'We could not open the share sheet for the event link.',
      title: 'My events',
    },
    inviteMembers: {
      copy:
        'Select Hive members to add them to this private outing or share the direct invite link.',
      empty: 'We could not find members matching that search.',
      fullEvent: 'This event already reached its attendee limit.',
      inviteCta: 'Invite selected',
      inviteSuccessBody: 'The selected members were added and notified.',
      inviteSuccessTitle: 'Invites sent',
      searchPlaceholder: 'Search by name, handle, or city',
      selectedCounter: 'selected',
      shareBody:
        'Share this private access with your group. Only verified women will be able to view it once the backend is connected.',
      shareTitle: 'Share private link',
      title: 'Invite from Hive',
    },
    profile: {
      birthDateLabel: 'Birth date',
      copy: 'Your profile pulls together verified identity, trust details, and your pace inside Hive.',
      createEventAction: 'Create new outing',
      emailLabel: 'Email',
      eventsCreatedStat: 'Events created',
      myEventsAction: 'Open My events',
      organizerRatingEmpty: 'You do not have organizer ratings yet.',
      organizerRatingLabel: 'Organizer score',
      phoneLabel: 'Phone',
      privateEventsStat: 'Private events',
      safetyCardCopy:
        'Keep your details current, define clear meeting points, and communicate every change to attendees on time.',
      safetyCardTitle: 'Operational trust',
      title: 'Profile',
      upcomingStat: 'Active',
      verifiedBadge: 'Verified account',
    },
    settings: {
      copy:
        'Adjust language and visual appearance here. Your choices stay saved until you change them again.',
      darkMode: 'Dark mode',
      darkModeCopy:
        'Darkens the app while keeping the selected palette active for more comfortable night reading.',
      languageCopy:
        'Choose whether Hive should be shown in Spanish or English. The preference stays across sessions.',
      languageEnglish: 'English',
      languageSpanish: 'Spanish',
      languageTitle: 'Language',
      paletteCoral: 'Hive Coral',
      paletteCoralCopy: 'The original warm Hive identity.',
      paletteForest: 'Forest',
      paletteForestCopy: 'Calm trust-driven greens.',
      paletteNeutral: 'Neutral',
      paletteNeutralCopy: 'A more understated and less pink option.',
      paletteOcean: 'Ocean',
      paletteOceanCopy: 'Fresh athletic teal tones.',
      paletteSunset: 'Sunset',
      paletteSunsetCopy: 'Soft orange accents with brighter energy.',
      paletteTitle: 'Theme color',
      previewCopy: 'Live accent preview for buttons, navigation, and highlighted states.',
      previewTitle: 'Preview',
      themeModeDark: 'Dark',
      themeModeLight: 'Light',
      title: 'Settings',
    },
    socialPreview: {
      helperText:
        'Google and Apple stay visible as future access methods. For now, sign in and registration remain manual.',
      title: 'Social access',
    },
  },
};
