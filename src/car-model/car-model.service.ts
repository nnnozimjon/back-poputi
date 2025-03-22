import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarModel } from './entities/car-model.entity';
import { CreateCarModelDto } from './dto/create-car-model.dto';
import { UpdateCarModelDto } from './dto/update-car-model.dto';

@Injectable()
export class CarModelService {
    constructor(
        @InjectRepository(CarModel)
        private carModelRepository: Repository<CarModel>,
    ) {}

    // Create a new car model
    async create(createCarModelDto: CreateCarModelDto): Promise<CarModel> {
        const carModel = this.carModelRepository.create(createCarModelDto);
        return this.carModelRepository.save(carModel);
    }

    // Retrieve all car models
    async findAll(): Promise<CarModel[]> {
        return this.carModelRepository.find();
    }

    // Retrieve car models by brandId
    async findByBrandId(
        brandId: number,
    ): Promise<{ id: number; name: string }[]> {
        return this.carModelRepository
            .createQueryBuilder('carModel')
            .select(['id', 'name']) // Select only id and name
            .where('carModel.brandId = :brandId', { brandId }) // Filter by brandId
            .getRawMany(); // Get raw results (without entity transformation)
    }

    // Retrieve a single car model by ID
    async findOne(id: number): Promise<CarModel> {
        return this.carModelRepository.findOne({ where: { id } });
    }

    // Update a car model by ID
    async update(
        id: number,
        updateCarModelDto: UpdateCarModelDto,
    ): Promise<CarModel> {
        await this.carModelRepository.update(id, updateCarModelDto);
        return this.carModelRepository.findOne({ where: { id } });
    }

    // Delete a car model by ID
    async remove(id: number): Promise<void> {
        await this.carModelRepository.delete(id);
    }
}
