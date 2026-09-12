import { Injectable } from '@nestjs/common';
import { Item } from './@types/item.entity.js';

@Injectable()
export class Repository {
  private _items: Item[] = [];
  private nextId: number = 1;

  create(name: string) {
    const item: Item = { id: this.nextId++, name };
    this._items.push(item);
    return item;
  }

  findAll() {
    return this._items;
  }

  getById(id: number): Item | undefined {
    return this._items.find((item) => item.id === id);
  }
}
