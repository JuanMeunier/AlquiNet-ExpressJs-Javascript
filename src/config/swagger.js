// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AlquiNet API',
      version: '1.0.0',
      description: 'API para el sistema de alquiler de propiedades AlquiNet',
      contact: {
        name: 'AlquiNet Team',
      }
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          required: ['nombre', 'email', 'contraseña', 'rol'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario'
            },
            nombre: {
              type: 'string',
              minLength: 3,
              maxLength: 50,
              description: 'Nombre completo del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico único'
            },
            contraseña: {
              type: 'string',
              minLength: 6,
              description: 'Contraseña del usuario'
            },
            rol: {
              type: 'string',
              enum: ['admin', 'propietario', 'inquilino'],
              description: 'Rol del usuario en el sistema'
            },
            fecha_registro: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de registro del usuario'
            },
            estado_cuenta: {
              type: 'boolean',
              description: 'Estado de la cuenta (activo/inactivo)'
            }
          }
        },
        Propiedad: {
          type: 'object',
          required: ['propietario_id', 'titulo', 'ubicacion', 'precio', 'tipo'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la propiedad'
            },
            propietario_id: {
              type: 'integer',
              description: 'ID del propietario de la propiedad'
            },
            titulo: {
              type: 'string',
              minLength: 5,
              maxLength: 100,
              description: 'Título de la propiedad'
            },
            descripcion: {
              type: 'string',
              maxLength: 1000,
              description: 'Descripción detallada de la propiedad'
            },
            ubicacion: {
              type: 'object',
              properties: {
                provincia: { type: 'string' },
                ciudad: { type: 'string' },
                direccion: { type: 'string' }
              },
              required: ['provincia', 'ciudad', 'direccion'],
              description: 'Ubicación de la propiedad'
            },
            precio: {
              type: 'number',
              minimum: 0,
              description: 'Precio de alquiler'
            },
            tipo: {
              type: 'string',
              enum: ['casa', 'departamento', 'ph', 'otro'],
              description: 'Tipo de propiedad'
            },
            disponibilidad: {
              type: 'boolean',
              default: true,
              description: 'Disponibilidad de la propiedad'
            },
            fecha_publicacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de publicación'
            },
            imagenes: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri'
              },
              description: 'URLs de las imágenes de la propiedad'
            }
          }
        },
        Reserva: {
          type: 'object',
          required: ['propiedad_id', 'inquilino_id', 'fecha_inicio', 'fecha_fin'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la reserva'
            },
            propiedad_id: {
              type: 'integer',
              description: 'ID de la propiedad reservada'
            },
            inquilino_id: {
              type: 'integer',
              description: 'ID del inquilino que hace la reserva'
            },
            fecha_inicio: {
              type: 'string',
              format: 'date',
              description: 'Fecha de inicio de la reserva'
            },
            fecha_fin: {
              type: 'string',
              format: 'date',
              description: 'Fecha de fin de la reserva'
            },
            estado: {
              type: 'string',
              enum: ['pendiente', 'aceptada', 'rechazada', 'cancelada'],
              default: 'pendiente',
              description: 'Estado de la reserva'
            },
            fecha_solicitud: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de la solicitud'
            }
          }
        },
        Resenia: {
          type: 'object',
          required: ['inquilino_id', 'propiedad_id', 'puntaje'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la reseña'
            },
            inquilino_id: {
              type: 'integer',
              description: 'ID del inquilino que hace la reseña'
            },
            propiedad_id: {
              type: 'integer',
              description: 'ID de la propiedad reseñada'
            },
            puntaje: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Puntaje de 1 a 5 estrellas'
            },
            comentario: {
              type: 'string',
              maxLength: 500,
              description: 'Comentario de la reseña'
            },
            fecha: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de la reseña'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'contraseña'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario'
            },
            contraseña: {
              type: 'string',
              description: 'Contraseña del usuario'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT token para autenticación'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si la operación fue exitosa'
            },
            message: {
              type: 'string',
              description: 'Mensaje descriptivo de la respuesta'
            },
            data: {
              type: 'object',
              description: 'Datos de la respuesta'
            },
            count: {
              type: 'integer',
              description: 'Cantidad de elementos (para listas)'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              default: false
            },
            message: {
              type: 'string',
              description: 'Mensaje de error'
            },
            details: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Detalles adicionales del error'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/middlewares/authRoutes.js']
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };