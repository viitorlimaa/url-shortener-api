import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Req,
	UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserService } from './user.service.js';

type AuthenticatedRequest = Request & { user: { sub: string } };

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	findMine(@Req() request: AuthenticatedRequest) {
		return this.userService.findOne(request.user.sub, request.user.sub);
	}

	@Get(':id')
	findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
		return this.userService.findOne(id, request.user.sub);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() data: UpdateUserDto,
		@Req() request: AuthenticatedRequest,
	) {
		return this.userService.update(id, request.user.sub, data);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async remove(
		@Param('id') id: string,
		@Req() request: AuthenticatedRequest,
	): Promise<void> {
		await this.userService.remove(id, request.user.sub);
	}
}
