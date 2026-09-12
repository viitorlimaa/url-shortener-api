import { Injectable } from '@nestjs/common';
import { Item } from './@types/item.entity.js';
import { Repository } from './app.repository.js';

@Injectable()
export class AppService {
  constructor(private readonly _repository: Repository) {}

  create(name: string): Item {
    return this._repository.create(name);
  }

  getById(id: number) {
    const result = this._repository.getById(id);
    if (!result) throw new Error(`Não encontrado!`);
    return result;
  }

  getAll(): Item[] {
    const result = this._repository.findAll();
    if (result.length === 0) throw new Error(`Não encontrado!`);
    return result;
  }
}
