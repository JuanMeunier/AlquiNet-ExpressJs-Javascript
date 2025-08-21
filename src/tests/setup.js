// tests/setup.js
// Configuración global para todos los tests

// Mock para logger - evita que los logs aparezcan durante tests
jest.mock('../src/config/logger.js', () => ({
    default: {
        info: jest.fn(),
        success: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }
}));

// Mock para cache service - simula el comportamiento del cache
jest.mock('../src/services/cacheServices.js', () => ({
    default: {
        // Métodos básicos de cache
        set: jest.fn().mockResolvedValue(true),
        get: jest.fn().mockResolvedValue(null),
        delete: jest.fn().mockResolvedValue(true),
        deletePattern: jest.fn().mockResolvedValue(true),

        // Cache de propiedades
        getPropiedades: jest.fn().mockResolvedValue(null),
        setPropiedades: jest.fn().mockResolvedValue(true),
        getPropiedad: jest.fn().mockResolvedValue(null),
        setPropiedad: jest.fn().mockResolvedValue(true),
        getPropiedadesByUser: jest.fn().mockResolvedValue(null),
        setPropiedadesByUser: jest.fn().mockResolvedValue(true),
        getPropiedadesByUbicacion: jest.fn().mockResolvedValue(null),
        setPropiedadesByUbicacion: jest.fn().mockResolvedValue(true),
        limpiarCachePropiedades: jest.fn().mockResolvedValue(true),

        // Cache de usuarios
        getUsuarios: jest.fn().mockResolvedValue(null),
        setUsuarios: jest.fn().mockResolvedValue(true),
        getUsuario: jest.fn().mockResolvedValue(null),
        setUsuario: jest.fn().mockResolvedValue(true),
        limpiarCacheUsuarios: jest.fn().mockResolvedValue(true),

        // Cache de reservas
        getReservas: jest.fn().mockResolvedValue(null),
        setReservas: jest.fn().mockResolvedValue(true),
        getReserva: jest.fn().mockResolvedValue(null),
        setReserva: jest.fn().mockResolvedValue(true),
        getReservasByInquilino: jest.fn().mockResolvedValue(null),
        setReservasByInquilino: jest.fn().mockResolvedValue(true),
        getReservasByPropiedad: jest.fn().mockResolvedValue(null),
        setReservasByPropiedad: jest.fn().mockResolvedValue(true),
        getReservasByPropietario: jest.fn().mockResolvedValue(null),
        setReservasByPropietario: jest.fn().mockResolvedValue(true),
        limpiarCacheReservas: jest.fn().mockResolvedValue(true),

        // Cache de reseñas
        getResenias: jest.fn().mockResolvedValue(null),
        setResenias: jest.fn().mockResolvedValue(true),
        getResenia: jest.fn().mockResolvedValue(null),
        setResenia: jest.fn().mockResolvedValue(true),
        getReseniasByPropiedad: jest.fn().mockResolvedValue(null),
        setReseniasByPropiedad: jest.fn().mockResolvedValue(true),
        getReseniasByInquilino: jest.fn().mockResolvedValue(null),
        setReseniasByInquilino: jest.fn().mockResolvedValue(true),
        limpiarCacheResenias: jest.fn().mockResolvedValue(true)
    }
}));

// Mock para bcrypt - simula el hash de contraseñas
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashedPassword'),
    compare: jest.fn().mockResolvedValue(true)
}));

// Mock para base de datos TypeORM
const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn()
};

jest.mock('../src/config/database.js', () => ({
    AppDataSource: {
        getRepository: jest.fn().mockReturnValue(mockRepository)
    }
}));

// Limpiar todos los mocks antes de cada test
beforeEach(() => {
    jest.clearAllMocks();
});

// Configurar timeout para tests (10 segundos)
jest.setTimeout(10000);

// Hacer disponible el mockRepository globalmente para los tests
global.mockRepository = mockRepository;

// Mock para variables de entorno si es necesario
process.env.NODE_ENV = 'test';