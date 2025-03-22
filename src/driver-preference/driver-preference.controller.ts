import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Req,
} from '@nestjs/common';
import { CreateDriverPreferenceDto } from './dto/create-driver-preference.dto';
import { UpdateDriverPreferenceDto } from './dto/update-driver-preference.dto';
import { DriverPreferenceService } from './driver-preference.service';

@Controller('driver-preference')
export class DriverPreferenceController {
    constructor(
        private readonly driverPreferenceService: DriverPreferenceService,
    ) {}

    @Post()
    async createMyPreferences(
        @Req() req: Request,
        @Body() createDriverPreferenceDto: CreateDriverPreferenceDto,
    ) {
        const { id: user_id } = req['user']; // Extract user_id from the token payload
        return this.driverPreferenceService.createDriverPreferences(
            user_id,
            createDriverPreferenceDto,
        );
    }

    @Get()
    async findUserPreference(@Req() req: Request) {
        const { id } = req['user'];
        return this.driverPreferenceService.findUserPreference(id);
    }
}
