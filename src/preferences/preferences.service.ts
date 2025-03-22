import { Injectable } from '@nestjs/common';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Preference } from './entities/preference.entity';

@Injectable()
export class PreferencesService {
    constructor(
        @InjectRepository(Preference)
        private preferenceRepository: Repository<Preference>,
    ) {}

    create(createPreferenceDto: CreatePreferenceDto) {
        return 'This action adds a new preference';
    }

    async findAll(): Promise<Preference[]> {
        return this.preferenceRepository.find();
    }

    findOne(id: number) {
        return `This action returns a #${id} preference`;
    }

    update(id: number, updatePreferenceDto: UpdatePreferenceDto) {
        return `This action updates a #${id} preference`;
    }

    remove(id: number) {
        return `This action removes a #${id} preference`;
    }
}
