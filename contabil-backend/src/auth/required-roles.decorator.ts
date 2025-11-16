import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const RequiredRoles = (...roles: Role[]) => SetMetadata('roles', roles);
