import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { Repository } from './app.repository.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, Repository],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('create', () => {
    it('should create a object in format expected', () => {
      const result = appController.create('Vitor');
      console.log(result);
      expect(result).toEqual({ id: 1, name: 'Vitor' });
    });
  });

  describe('get', () => {
    it('should get object by id', () => {
      const user = appController.create('Vitor');
      const result = appController.get(user.id);

      expect(result).toEqual({ id: 1, name: 'Vitor' });
    });
  });

  describe('getAll', () => {
    it('should get all objects', () => {
      const user = appController.create('Vitor');
      const item = appController.create('Verly');
      const result = appController.getAll();

      expect(result).toEqual([
        { id: 1, name: 'Vitor' },
        { id: 2, name: 'Verly' },
      ]);
    });
  });
});
