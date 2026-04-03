import { z } from 'zod';

export const colombianPhone = z
  .string()
  .regex(/^(\+57)?[3][0-9]{9}$/, 'Teléfono colombiano inválido (ej: 3001234567)');

export const vehiclePlate = z
  .string()
  .regex(/^[A-Z]{3}[0-9]{3}$/, 'Placa inválida (ej: ABC123)');

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(3, 'Nombre muy corto'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: colombianPhone.optional().or(z.literal('')),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirm_password: z.string(),
    role: z.enum(['client', 'driver']),
    vehicle_type: z.enum(['moto', 'moto_carguero']).optional(),
    plate: vehiclePlate.optional().or(z.literal('')),
    brand: z.string().optional(),
    model: z.string().optional(),
    color: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
  })
  .refine((data) => data.email || data.phone, {
    message: 'Email o teléfono requerido',
    path: ['email'],
  })
  .refine(
    (data) => {
      if (data.role === 'driver') {
        return !!data.vehicle_type && !!data.plate;
      }
      return true;
    },
    {
      message: 'Tipo de vehículo y placa requeridos para conductores',
      path: ['vehicle_type'],
    }
  );

export const orderAddressSchema = z.object({
  origin_address: z.string().min(10, 'Ingresa una dirección más detallada'),
  origin_reference: z.string().max(100).optional(),
  destination_address: z.string().min(10, 'Ingresa una dirección más detallada'),
  destination_reference: z.string().max(100).optional(),
  package_description: z.string().max(200).optional(),
});

export const errandRequestSchema = z.object({
  category: z.enum(['compras', 'documentos', 'paquetes', 'otro']),
  description: z.string().min(10, 'Describe tu mandado con más detalle (mínimo 10 caracteres)'),
  estimated_item_value: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val.replace(/[^0-9]/g, '')) : undefined)),
});

export const errandLocationSchema = z.object({
  pickup_address: z.string().min(10, 'Ingresa una dirección más detallada'),
  pickup_reference: z.string().max(100).optional(),
  delivery_address: z.string().min(10, 'Ingresa una dirección más detallada'),
  delivery_reference: z.string().max(100).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OrderAddressFormData = z.infer<typeof orderAddressSchema>;
export type ErrandRequestFormData = z.infer<typeof errandRequestSchema>;
export type ErrandLocationFormData = z.infer<typeof errandLocationSchema>;
