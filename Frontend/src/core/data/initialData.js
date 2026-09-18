/**
 * Base de Datos Ficticia Inicial para el Proyecto URABÁ-PAÍS
 * Cumple con el criterio estricto de datos 100% simulados y anonimizados.
 */

export const INITIAL_BENEFICIARIES = [
  {
    id: 'ben-001',
    internalCode: 'UP-2026-0001',
    fullName: 'María Elena Rivas Palacios',
    documentType: 'PPT',
    documentNumber: '987654321',
    birthDate: '1989-04-12',
    gender: 'Femenino',
    phone: '3115550123',
    municipality: 'Apartadó',
    communityZone: 'Comuna 1 - Policarpa',
    address: 'Calle 102 #14-22',
    populationGroup: 'Persona Migrante / Refugiada',
    hasDisability: false,
    disabilityDetails: '',
    dataProcessingConsent: true,
    consentDate: '2026-02-10',
    registeredAt: '2026-02-10T09:30:00.000Z',
    notes: 'Jefa de hogar con 2 menores a cargo.',
    familyMembers: [
      {
        id: 'fam-001-1',
        fullName: 'Lucas David Rivas',
        kinship: 'Hijo(a)',
        age: 7,
        documentType: 'SD',
        documentNumber: '',
        hasDisability: false
      },
      {
        id: 'fam-001-2',
        fullName: 'Valeria Rivas Palacios',
        kinship: 'Hijo(a)',
        age: 11,
        documentType: 'TI',
        documentNumber: '1122334455',
        hasDisability: false
      }
    ]
  },
  {
    id: 'ben-002',
    internalCode: 'UP-2026-0002',
    fullName: 'Carlos Andrés Palacios Córdoba',
    documentType: 'CC',
    documentNumber: '1038567890',
    birthDate: '1982-11-23',
    gender: 'Masculino',
    phone: '3205550987',
    municipality: 'Turbo',
    communityZone: 'Barrio Obrero',
    address: 'Carrera 13 #98-45',
    populationGroup: 'Víctima del Conflicto Armado',
    hasDisability: true,
    disabilityDetails: 'Discapacidad motriz leve en miembro inferior',
    dataProcessingConsent: true,
    consentDate: '2026-02-14',
    registeredAt: '2026-02-14T11:15:00.000Z',
    notes: 'Interés en ruta de emprendimiento y salud física.',
    familyMembers: [
      {
        id: 'fam-002-1',
        fullName: 'Rosa Elvira Mosquera',
        kinship: 'Cónyuge / Pareja',
        age: 40,
        documentType: 'CC',
        documentNumber: '1038445566',
        hasDisability: false
      }
    ]
  },
  {
    id: 'ben-003',
    internalCode: 'UP-2026-0003',
    fullName: 'Luz Dary Hinestroza Moreno',
    documentType: 'SD', // Sin documento registrado (para probar caso especial)
    documentNumber: '',
    birthDate: '1995-07-30',
    gender: 'Femenino',
    phone: '3145557788',
    municipality: 'Necoclí',
    communityZone: 'Sector El Totumo',
    address: 'Vereda Casa Blanca Km 4',
    populationGroup: 'Población Desplazada',
    hasDisability: false,
    disabilityDetails: '',
    dataProcessingConsent: true,
    consentDate: '2026-03-01',
    registeredAt: '2026-03-01T14:20:00.000Z',
    notes: 'En proceso de orientación jurídica para documentación y atención psicosocial.',
    familyMembers: [
      {
        id: 'fam-003-1',
        fullName: 'Sofía Hinestroza',
        kinship: 'Hijo(a)',
        age: 3,
        documentType: 'RC',
        documentNumber: '1040998877',
        hasDisability: false
      }
    ]
  },
  {
    id: 'ben-004',
    internalCode: 'UP-2026-0004',
    fullName: 'Paola Anaya',
    documentType: 'CC',
    documentNumber: '12365482',
    birthDate: '1992-05-18',
    gender: 'Femenino',
    phone: '3124445566',
    municipality: 'Apartadó',
    communityZone: 'Barrio Obrero',
    address: 'Calle 105 #12-40',
    populationGroup: 'Comunidad Local',
    hasDisability: false,
    disabilityDetails: '',
    dataProcessingConsent: true,
    consentDate: '2026-03-04',
    registeredAt: '2026-03-04T08:30:00.000Z',
    notes: 'Madre comunitaria registrada en la sede Apartadó.',
    familyMembers: [
      {
        id: 'fam-004-1',
        fullName: 'Mateo Anaya',
        kinship: 'Hijo(a)',
        age: 6,
        documentType: 'RC',
        documentNumber: '1042556677',
        hasDisability: false
      }
    ]
  }
];
