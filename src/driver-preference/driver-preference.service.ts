import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverPreference } from './entities/driver-preference.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { CreateDriverPreferenceDto } from './dto/create-driver-preference.dto';

@Injectable()
export class DriverPreferenceService {
    constructor(
        @InjectRepository(DriverPreference)
        private driverPreferenceRepository: Repository<DriverPreference>,

        @InjectRepository(Driver)
        private driverRepository: Repository<Driver>,
    ) {}

    // Create driver preferences for a specific user
    async createDriverPreferences(
        user_id: string,
        createDriverPreferenceDto: CreateDriverPreferenceDto,
    ): Promise<DriverPreference[]> {
        // Find the driver associated with the user_id
        const driver = await this.driverRepository.findOne({
            where: { user_id },
        });

        // If no driver is found, throw a NotFoundException
        if (!driver) {
            throw new NotFoundException({
                code: 400,
                message: `У вас нет зарегистрированного автомобиля!`,
            });
        }

        // Use transaction to delete existing preferences and create new ones
        return this.driverPreferenceRepository.manager.transaction(async (transactionalEntityManager) => {
            // Delete all existing preferences for this driver
            await transactionalEntityManager.delete(DriverPreference, {
                driver_id: driver.id
            });

            // Create new driver preferences for each preferenceId
            const driverPreferences = createDriverPreferenceDto.preferenceIds.map(
                (preferenceId) =>
                    this.driverPreferenceRepository.create({
                        driver_id: driver.id,
                        preference_id: preferenceId,
                    }),
            );

            // Save the new driver preferences within the transaction
            return transactionalEntityManager.save(DriverPreference, driverPreferences);
        });
    }

    // Retrieve all driver preferences for a specific user
    async findUserPreference(
        user_id: string,
    ): Promise<{ id: number; name: string }[]> {
        const driver = await this.driverRepository.findOne({
            where: { user_id },
        });

        if (!driver) {
            throw new NotFoundException({
                code: 400,
                message: `У вас нет зарегистрированного автомобиля!`,
            });
        }

        const driverPreferences = await this.driverPreferenceRepository.find({
            where: { driver_id: driver.id },
            relations: ['preference'], // Include the preference details
        });

        // Transform the response to return only id and name of the preference
        return driverPreferences.map((dp) => ({
            id: dp.preference.id,
            name: dp.preference.name,
        }));
    }
}
