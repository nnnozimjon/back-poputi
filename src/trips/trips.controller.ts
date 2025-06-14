import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Req,
    Query,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Controller('trips')
export class TripsController {
    constructor(private readonly tripsService: TripsService) {}

    @Post()
    create(@Req() req: Request, @Body() createTripDto: CreateTripDto) {
        const { id: user_id } = req['user'];
        return this.tripsService.create(user_id, createTripDto);
    }

    @Get()
    async getAllTrips(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('departure_city') departure_city?: string,
        @Query('destination_city') destination_city?: string,
        @Query('departure_time') departure_time?: string,
        @Query('type') type?: 'bus' | 'car',
        @Query('passengers') passengers?: number,
    ) {
        return this.tripsService.getAllTrips({
            page,
            limit,
            departure_city,
            destination_city,
            departure_time,
            type,
            passengers,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tripsService.getTripById(id);
    }

    @Get('my/trips')
    async getMyTrips(@Req() req: Request) {
        const { id: user_id } = req['user'];
        return this.tripsService.getMyTrips(user_id);
    }

    @Post(':id')
    update(
        @Param('id') id: string,
        @Req() req: Request,
        @Body() updateTripDto: UpdateTripDto,
    ) {
        const { id: user_id } = req['user'];
        return this.tripsService.update(user_id, id, updateTripDto);
    }

    // @Delete(':id')
    // remove(@Param('id') id: string, @Req() req: Request) {
    //     const { id: user_id } = req['user'];
    //   return this.tripsService.delete(user_id, id);
    // }
}
